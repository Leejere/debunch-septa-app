import pandas as pd
import geopandas as gpd
import json

runtime = pd.read_parquet("server/raw-data/runtimeSeveralRoutesOctWithLags_all.gzip")

routes = ["21", "47", "33"]
desired_date = "2022-10-26"
desired_time = "2022-10-26 08:30:16"

query = "(routeId.isin(@routes)) & (serviceDate == @desired_date)"
runtime_sel = runtime.query(query).copy()

# All the trips on this day with their time range
trips = runtime_sel.groupby("tripId")["observedToStopArrivalTime"].agg(["min", "max"])
trips_sel = trips.query("min < @desired_time < max").copy()
tripIds_sel = trips_sel.index.tolist()

runtime_used = runtime_sel.query("tripId in @tripIds_sel").copy()

# Time range of each arrival instance
runtime_used["observedFromStopDepartureTime"] = runtime_used[
    "observedToStopArrivalTime"
] - pd.to_timedelta(runtime_used["observedRuntimeSeconds"], unit="s")

# First, understand what the next 10-20 stops are for each instance
sorted = runtime_used[
    [
        "routeId",
        "directionId",
        "tripId",
        "toStopId",
        "toStopName",
        "toStopSequence",
        "observedFromStopDepartureTime",
        "observedToStopArrivalTime",
    ]
].sort_values(["routeId", "directionId", "tripId", "toStopSequence"])

# Get the IDs and names of the next 10-20 stops
for step in range(11, 21):
    sorted[f"next_{step}_stopId"] = sorted.groupby(
        ["routeId", "directionId", "tripId"]
    )["toStopId"].shift(-step)
    sorted[f"next_{step}_stopName"] = sorted.groupby(
        ["routeId", "directionId", "tripId"]
    )["toStopName"].shift(-step)

# Now select the instances that fall within the desired timeframe
final = sorted.query(
    "observedFromStopDepartureTime < @desired_time < observedToStopArrivalTime"
).copy()

# Next, join the prediction results
prediction = pd.read_csv("server/raw-data/demo-prediction-results.csv")
prediction = prediction[
    ["routeId", "directionId", "tripId", "toStopId"]
    + [col for col in prediction.columns if col.startswith("pred_")]
]

# data types:
prediction.toStopId = prediction.toStopId.astype(str)
prediction.routeId = prediction.routeId.astype(str)
prediction.directionId = prediction.directionId.astype(str)
prediction.tripId = prediction.tripId.astype("int32")

with_prediction = final.copy()

joinby_cols = ["routeId", "directionId", "tripId"]

for step in range(11, 21):
    to_join = (
        prediction[joinby_cols + ["toStopId", f"pred_{step}"]]
        .copy()
        .rename(
            columns={
                f"pred_{step}": f"pred_{step}_prediction",
                "toStopId": f"next_{step}_stopId",
            }
        )
    )
    with_prediction = with_prediction.merge(
        to_join,
        how="left",
        left_on=joinby_cols + [f"next_{step}_stopId"],
        right_on=joinby_cols + [f"next_{step}_stopId"],
    )

# ==============================================================================
# Generate fake transit view data (locations)
# ==============================================================================

realtime = final[
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

stops = gpd.read_file("db/stops-all.geojson")
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

# ==============================================================================
# Generate fake prediction data
# ==============================================================================

for row in with_prediction.iterrows():
    data = row[1]
    route = data.routeId
    direction = data.directionId
    trip = data.tripId
    stop_ids = [data[f"next_{step}_stopId"] for step in range(11, 21)]
    stop_names = [data[f"next_{step}_stopName"] for step in range(11, 21)]
    predictions = [data[f"pred_{step}_prediction"] for step in range(11, 21)]
    json_data = {
        "prediction": [
            {
                "stop_id": (None if pd.isna(prediction) else stop_id),
                "stop_name": (None if pd.isna(prediction) else stop_name),
                "prediction": (None if pd.isna(prediction) else prediction),
            }
            for stop_id, stop_name, prediction in zip(stop_ids, stop_names, predictions)
        ]
    }
    with open(f"db/demo-prediction/{route}-{direction}-{trip}.json", "w") as f:
        json.dump(json_data, f)
