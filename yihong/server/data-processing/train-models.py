import numpy as np
import pandas as pd
from os.path import dirname
import warnings
import geopandas as gpd

from sklearn.ensemble import RandomForestClassifier

# Pipelines
from sklearn.pipeline import make_pipeline

# Preprocessing
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

from joblib import dump

warnings.filterwarnings("ignore")

is_for_deploy = False

script_dir = dirname(__file__)
server_dir = dirname(script_dir)

runtime = pd.read_parquet(f"{server_dir}/raw-data/runtimeDf.gzip")
runtime = runtime.query("routeId.isin(['21', '33', '47'])").copy()

toJoinFrom = runtime.copy().dropna(subset=["instanceId"])
same_trip_cols = ["serviceDate", "routeId", "directionId", "tripId"]

toJoin = toJoinFrom[["instanceId", "prevInstanceId"]].dropna(
    subset=["instanceId", "prevInstanceId"]
)

runtimeDf = runtime.copy()

for lagSteps in range(1, 22):
    # First get lag trips
    runtimeDf = runtimeDf.sort_values(same_trip_cols + ["toStopSequence"])
    runtimeDf[f"lag{lagSteps}InstanceId"] = runtimeDf.groupby(same_trip_cols)[
        "instanceId"
    ].shift(lagSteps)

    # Then get prev buses of lag trips
    thisToJoin = toJoin.copy().rename(
        columns={
            "instanceId": f"lag{lagSteps}InstanceId",
            "prevInstanceId": f"lag{lagSteps}PrevInstanceId",
        }
    )
    runtimeDf = runtimeDf.merge(thisToJoin, how="left", on=f"lag{lagSteps}InstanceId")

print("Produced lag IDs")

runtimeDf = runtimeDf.applymap(lambda x: np.nan if x is pd.NA else x)

print("Converted NAs to np.nan")

lag_vars = ["headway", "speed", "late"]

for lagSteps in range(1, 22):
    # Join to lag

    thisToJoin = (
        toJoinFrom.copy()[["instanceId"] + lag_vars]
        .rename(
            columns={
                "instanceId": f"lag{lagSteps}InstanceId",
                "headway": f"headwayLag{lagSteps}",
                "speed": f"speedLag{lagSteps}",
                "late": f"lateLag{lagSteps}",
            }
        )
        .dropna(subset=[f"lag{lagSteps}InstanceId"])
    )

    runtimeDf = runtimeDf.merge(thisToJoin, how="left", on=f"lag{lagSteps}InstanceId")

    # Join to prev of lag

    thisToJoin = (
        toJoinFrom.copy()[["instanceId"] + lag_vars]
        .rename(
            columns={
                "instanceId": f"lag{lagSteps}PrevInstanceId",
                "headway": f"prevBus_headwayLag{lagSteps}",
                "speed": f"prevBus_speedLag{lagSteps}",
                "late": f"prevBus_lateLag{lagSteps}",
            }
        )
        .dropna(subset=[f"lag{lagSteps}PrevInstanceId"])
    )

    runtimeDf = runtimeDf.merge(
        thisToJoin, how="left", on=f"lag{lagSteps}PrevInstanceId"
    )

for lagSteps in range(1, 21):
    for var in lag_vars:
        runtimeDf[f"{var}Lag{lagSteps}Diff{lagSteps+1}"] = (
            runtimeDf[f"{var}Lag{lagSteps}"] - runtimeDf[f"{var}Lag{lagSteps+1}"]
        )
        runtimeDf[f"prevBus_{var}Lag{lagSteps}Diff{lagSteps+1}"] = (
            runtimeDf[f"prevBus_{var}Lag{lagSteps}"]
            - runtimeDf[f"prevBus_{var}Lag{lagSteps+1}"]
        )

# stops = gpd.read_file(f"{server_dir}/raw-data/stops/stopsGeographyProcessed.shp")
# stops = stops.rename(columns={"directionI": "directionId", "StopId": "stopId"}).drop(
#     "geography", axis=1
# )

# stops.routeId = stops.routeId.astype(str)
# stops.directionId = stops.directionId.astype(str)
# stops.stopId = stops.stopId.astype(str)

# stops = stops.drop_duplicates(subset=["routeId", "directionId", "stopId"])

# runtimeDf = runtimeDf.merge(
#     stops[["routeId", "directionId", "stopId", "centerCity"]],
#     how="left",
#     left_on=["routeId", "directionId", "toStopId"],
#     right_on=["routeId", "directionId", "stopId"],
# )



numBasePredictors = ["toStopSequence"]
catPredictors = ["directionId", "period", "centerCity"]

lagPredictors = ["speed", "headway", "late"]
lagDiffPredictors = [f"{var}LagDiff" for var in ["speed", "headway", "late"]]
lagPredictors = lagPredictors + lagDiffPredictors
preBusPredictors = [f"prevBus_{var}" for var in lagPredictors]

allLagPredictors = lagPredictors + preBusPredictors


def makeClassifierPipe(numPredictors, catPredictors, nEstimators, maxDepth):
    transformer = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numPredictors),
            ("cat", OneHotEncoder(handle_unknown="ignore"), catPredictors),
        ]
    )
    pipe = make_pipeline(
        transformer,
        RandomForestClassifier(
            n_estimators=nEstimators, max_depth=maxDepth, random_state=42
        ),
    )
    return pipe


def trainClassifier(trainSet, targetTrain):
    numPredictors = numBasePredictors + allLagPredictors
    classifier = makeClassifierPipe(
        numPredictors=numPredictors,
        catPredictors=catPredictors,
        nEstimators=100,
        maxDepth=20,
    )

    classifier.fit(trainSet, targetTrain)
    return classifier


def predictForRoute(runtimeDf, route, steps):
    sel = runtimeDf.query("7 <= period <= 19").copy()
    sel = sel.query("0 < headway < 3600").copy()
    sel = sel.query("routeId == @route").copy()
    sel = sel.query("(bunched==False) | (initBunching==True)").copy()

    lagPredictors = [f"{var}Lag{steps}" for var in ["speed", "headway", "late"]]
    lagDiffPredictors = [
        f"{var}Lag{steps}Diff{steps+1}" for var in ["speed", "headway", "late"]
    ]
    lagPredictors = lagPredictors + lagDiffPredictors
    preBusPredictors = [f"prevBus_{var}" for var in lagPredictors]

    sel = (
        sel[
            numBasePredictors
            + catPredictors
            + lagPredictors
            + preBusPredictors
            + ["initBunching", "serviceDate"]
        ]
        .copy()
        .dropna()
    )

    sel.columns = (
        numBasePredictors
        + catPredictors
        + allLagPredictors
        + ["initBunching", "serviceDate"]
    )

    testMask = sel.serviceDate > "2022-10-22"

    if is_for_deploy:
        trainSet = sel.copy()
    else:
        trainSet = sel.loc[~testMask,].copy()

    classifier = trainClassifier(trainSet, trainSet["initBunching"])

    return classifier


if is_for_deploy:
    out_dir = f"{server_dir}/raw-data/serialized-models-deploy"
else:
    out_dir = f"{server_dir}/raw-data/serialized-models-dev"

for route in ["21", "33", "47"]:
    for steps in range(11, 21):
        thisClassifier = predictForRoute(runtimeDf, route, steps)
        dump(
            thisClassifier,
            f"{out_dir}/{route}-{steps}.joblib",
        )
        print(f"Finished model for route {route} and steps {steps}")
