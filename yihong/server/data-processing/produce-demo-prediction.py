import numpy as np
import pandas as pd

runtimeDf = pd.read_parquet("server/raw-data/runtimeDf.gzip")

toJoinFrom = runtimeDf.copy().dropna(subset=["instanceId"])

# Lag headway

toJoin = toJoinFrom[["instanceId", "headway", "speed", "late"]].rename(
    columns={
        "instanceId": "lagInstanceId",
        "headway": "lagHeadway",
        "speed": "lagSpeed",
        "late": "lagLate",
    }
)

# Get lag variables whose names should match the models
runtimeDf = runtimeDf.merge(toJoin, how="left", on="lagInstanceId")

for var in ["headway", "speed", "late"]:
    runtimeDf[f"{var}LagDiff"] = runtimeDf[var] - runtimeDf[f"lag{var.title()}"]

runtimeDf = runtimeDf.applymap(lambda x: np.nan if x is pd.NA else x)
toJoinFrom = runtimeDf.copy().dropna(subset=["instanceId"])

# Join operational variables and lag variables to previous bus

toJoin = toJoinFrom[
    [
        "instanceId",
        "headway",
        "speed",
        "late",
        "headwayLagDiff",
        "speedLagDiff",
        "lateLagDiff",
    ]
].rename(
    columns={
        "instanceId": "prevInstanceId",
        "headway": "prevBus_headway",
        "speed": "prevBus_speed",
        "late": "prevBus_late",
        "headwayLagDiff": "prevBus_headwayLagDiff",
        "speedLagDiff": "prevBus_speedLagDiff",
        "lateLagDiff": "prevBus_lateLagDiff",
    }
)

runtimeDf = runtimeDf.merge(toJoin, how="left", on="prevInstanceId")
lagPredictors = ["speed", "headway", "late"]
lagDiffPredictors = [f"{var}LagDiff" for var in ["speed", "headway", "late"]]
lagPredictors = lagPredictors + lagDiffPredictors
preBusPredictors = [f"prevBus_{var}" for var in lagPredictors]

allLagPredictors = lagPredictors + preBusPredictors

# ============ Filter to demo day =============

routes = ["21", "47", "33"]
desired_date = "2022-10-26"
desired_time = "2022-10-26 08:30:16"

query = "(routeId.isin(@routes)) & (serviceDate == @desired_date)"
runtime_sel = runtimeDf.query(query).copy()

# All the trips on this day with their time range
trips = runtime_sel.groupby("tripId")["observedToStopArrivalTime"].agg(["min", "max"])
trips_sel = trips.query("min < @desired_time < max").copy()
tripIds_sel = trips_sel.index.tolist()

runtime_used = runtime_sel.query("tripId in @tripIds_sel").copy()
# Time range of each arrival instance
runtime_used["observedFromStopDepartureTime"] = runtime_used[
    "observedToStopArrivalTime"
] - pd.to_timedelta(runtime_used["observedRuntimeSeconds"], unit="s")

runtime_used = runtime_used.query(
    "observedFromStopDepartureTime < @desired_time < observedToStopArrivalTime"
).copy()

# ============ Produce real time bus data =============

import geopandas as gpd
import json

stops = gpd.read_file("db/stops-all.geojson")

realtime = runtime_used[
    ["routeId", "directionId", "tripId", "toStopId", "toStopName", "toStopSequence"]
].rename(
    columns={
        "toStopId": "next_stop_id",
        "toStopName": "next_stop_name",
        "toStopSequence": "next_stop_sequence",
        "routeId": "route_id",
        "tripId": "trip",
    }
)

direction_dict = {
    21: {0: "Eastbound", 1: "Westbound"},
    33: {0: "Southbound", 1: "Northbound"},
    47: {0: "Southbound", 1: "Northbound"},
}
realtime["Direction"] = realtime.apply(
    lambda row: direction_dict[int(row.route_id)][int(row.directionId)], axis=1
)
realtime = realtime.drop("directionId", axis=1)

stops.StopId = stops.StopId.astype(str)

stops = (
    stops[["StopId", "Lon", "Lat"]]
    .rename(columns={"StopId": "next_stop_id", "Lon": "lng", "Lat": "lat"})
    .drop_duplicates(subset=["next_stop_id"])
)

realtime = realtime.merge(stops, how="left", on="next_stop_id")

for route in routes:
    subset = realtime.query("route_id == @route").copy()
    json_data = {"bus": subset.to_dict(orient="records")}

    with open(f"db/demo-transit-view/{route}.json", "w") as f:
        json.dump(json_data, f)

# ============= Produce demo prodictions =============

from joblib import load

runtime_used["period"] = runtime_used.scheduledTripStartTime.dt.hour

numBasePredictors = ["toStopPathIndex"]
catPredictors = ["directionId", "period"]

threshold = 0.015

for route in ["47", "21", "33"]:
    globals()[f"subset_{route}"] = runtime_used.query("routeId == @route").copy()
    for steps in range(11, 21):
        model = load(f"server/serialized-models/{route}-{steps}.joblib")
        probs = model.predict_proba(globals()[f"subset_{route}"])[:, 1]
        globals()[f"subset_{route}"][f"pred_{steps}"] = probs > threshold

prediction = pd.concat(
    [globals()["subset_21"], globals()["subset_33"], globals()["subset_47"]],
    ignore_index=True,
)

for row in prediction.iterrows():
    data = row[1]
    route = data["routeId"]
    direction = data["directionId"]
    trip = data["tripId"]
    predictions = [data[f"pred_{steps}"] for steps in range(11, 21)]
    json_data = {"prediction": predictions}
    with open(f"db/demo-prediction-forward/{route}-{direction}-{trip}.json", "w") as f:
        json.dump(json_data, f)
