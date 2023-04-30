# This file trains model used for ad-hoc prediction
# Then serializes the models to disk in joblib format

import pandas as pd
import numpy as np

# ==================== Read and process runtime data ====================

dtypes = {
    "DoW": "category",
    "serviceDate": "str",
    "routeId": "category",
    "directionId": "category",
    "blockId": "int16",
    "tripId": "int32",
    "scheduledTripStartTime": "str",
    "scheduledRuntimeSeconds": "int16",
    "scheduledFromStopDepartureTime": "str",
    "observedRuntimeSeconds": "float32",
    "stopPathLength": "float32",
    "fromStopfrom_stop_stopPathIndex": "int16",
    "fromStopfrom_stop_name": "category",
    "fromStopfrom_stop_id": "category",
    "fromStopfrom_stop_gtfsStopSequence": "int16",
    "fromStopfrom_stop_isScheduleAdherenceStop": "bool",
    "fromStopfrom_stop_isFirstStopInTrip": "bool",
    "fromStopfrom_stop_isLastStopInTrip": "bool",
    "fromStopfrom_stop_isWaitStop": "bool",
    "toStopto_stop_stopPathIndex": "int16",
    "toStopto_stop_name": "category",
    "toStopto_stop_id": "category",
    "toStopto_stop_gtfsStopSequence": "int16",
    "toStopto_stop_isScheduleAdherenceStop": "bool",
    "toStopto_stop_isFirstStopInTrip": "bool",
    "toStopto_stop_isLastStopInTrip": "bool",
    "toStopto_stop_isWaitStop": "bool",
    "speed_mph": "float32",
}
columnsToRename = {
    "fromStopfrom_stop_stopPathIndex": "fromStopPathIndex",
    "fromStopfrom_stop_name": "fromStopName",
    "fromStopfrom_stop_id": "fromStopId",
    "fromStopfrom_stop_gtfsStopSequence": "fromStopSequence",
    "fromStopfrom_stop_isScheduleAdherenceStop": "fromStopIsScheduledAdherenceStop",
    "fromStopfrom_stop_isFirstStopInTrip": "fromStopIsTripFirstStop",
    "fromStopfrom_stop_isLastStopInTrip": "fromStopIsTripLastStop",
    "fromStopfrom_stop_isWaitStop": "fromStopIsWaitStop",
    "toStopto_stop_stopPathIndex": "toStopPathIndex",
    "toStopto_stop_name": "toStopName",
    "toStopto_stop_id": "toStopId",
    "toStopto_stop_gtfsStopSequence": "toStopSequence",
    "toStopto_stop_isScheduleAdherenceStop": "toStopIsScheduledAdherenceStop",
    "toStopto_stop_isFirstStopInTrip": "toStopIsTripFirstStop",
    "toStopto_stop_isLastStopInTrip": "toStopIsTripLastStop",
    "toStopto_stop_isWaitStop": "toStopIsWaitStop",
}


def readRuntimeData(path):
    result = pd.read_csv(path, dtype=dtypes, usecols=list(dtypes.keys())).rename(
        columns=columnsToRename
    )
    return result


# Correct and cast datetime
def castDatetime(dateColumn, timeColumn):
    hours = timeColumn.str.slice(0, 2).astype(int)
    correctedHours = (hours % 24).astype(str).str.zfill(2)
    timesExcludingHours = timeColumn.str.slice(start=2)
    correctedTimes = correctedHours + timesExcludingHours

    hourOverflowMask = hours >= 24

    datetimeColumn = pd.to_datetime(dateColumn + " " + correctedTimes)
    datetimeColumn[hourOverflowMask] = datetimeColumn[
        hourOverflowMask
    ] + pd.to_timedelta(1, unit="d")
    return datetimeColumn


columnsToCast = [
    "scheduledTripStartTime",
    "scheduledFromStopDepartureTime",
]


def castDatetimeColumns(runtimeDf):
    # Scheduled departure time from terminal and each stop
    for column in columnsToCast:
        runtimeDf[column] = castDatetime(runtimeDf["serviceDate"], runtimeDf[column])
    runtimeDf["serviceDate"] = pd.to_datetime(runtimeDf["serviceDate"])

    return runtimeDf.dropna()


# Add cumulative distance
tripGroupByColumns = [
    "routeId",
    "serviceDate",
    "directionId",
    "tripId",
]


def addCumDistance(runtimeDf):
    runtimeDf = runtimeDf.sort_values(tripGroupByColumns + ["toStopSequence"]).dropna()

    runtimeDf["cumDistance"] = runtimeDf.groupby(tripGroupByColumns)[
        "stopPathLength"
    ].cumsum()

    return runtimeDf


# Add scheduled and observed arrival times
def addArrivalTimes(runtimeDf):
    # Scheduled arrival time by stop
    runtimeDf["scheduledToStopArrivalTime"] = runtimeDf[
        "scheduledFromStopDepartureTime"
    ] + pd.to_timedelta(runtimeDf["scheduledRuntimeSeconds"], unit="s")

    runtimeDf = runtimeDf.sort_values(tripGroupByColumns + ["toStopSequence"]).dropna()

    # Get the cumulative seconds from starting from the terminus
    runtimeDf["observedCumRuntimeSeconds"] = (
        runtimeDf.groupby(tripGroupByColumns)["observedRuntimeSeconds"]
        .cumsum()
        .astype("int32")
    )

    runtimeDf["observedToStopArrivalTime"] = runtimeDf[
        "scheduledTripStartTime"
    ] + pd.to_timedelta(runtimeDf["observedCumRuntimeSeconds"], unit="s")
    return runtimeDf


def readAndProcessData(path):
    runtimeDf = readRuntimeData(path=path)
    runtimeDf = castDatetimeColumns(runtimeDf)
    runtimeDf = addCumDistance(runtimeDf)
    runtimeDf = addArrivalTimes(runtimeDf)

    return runtimeDf


# This is a local path.
# The dataset is not open to the public

boxPath = "C:/Users/huyh/Box/Practicum_Otis_Bus/raw-data"
runtime1 = readAndProcessData(f"{boxPath}/oct_2022_weekday_runtimes.csv")
runtime2 = readAndProcessData(f"{boxPath}/oct_16_31_weekday_runtimes.csv")

runtime = pd.concat([runtime1, runtime2], ignore_index=True)

# ============ Calculate headway, speed, and lateness ============

# Rename column
runtime = runtime.rename(columns={"speed_mph": "speed"})

# Add unique identifier to each arrival and use that as index
numInstances = len(runtime)
runtime["instanceId"] = range(numInstances)
# Calculate: lateness compared to if average/uniform speed

"""
Find the expected average speed for each trip (regardless of service date)
"""

# Expected average speed is calculated by total trip distance divided by total trip time
cumDistTime = (
    runtime.query("toStopIsTripLastStop==True")
    .copy()
    .groupby(["routeId", "directionId", "tripId"])[
        ["observedCumRuntimeSeconds", "cumDistance"]
    ]
    .mean()
    .dropna()
    .reset_index()
)

cumDistTime["expectedSpeed"] = (
    cumDistTime["cumDistance"] / cumDistTime["observedCumRuntimeSeconds"]
)

# Merge expected trip average speed to runtime DF
# set_index again: prevent merge from disrupting index
runtime = runtime.merge(
    cumDistTime[["routeId", "directionId", "tripId", "expectedSpeed"]],
    how="left",
    left_on=["routeId", "directionId", "tripId"],
    right_on=["routeId", "directionId", "tripId"],
)

# Expected runtime seconds assuming using trip average speed as uniform speed
runtime["expectedCumRuntimeSeconds"] = runtime["cumDistance"] / runtime["expectedSpeed"]
runtime = runtime.dropna()

# Difference between runtime seconds compared to that assuming uniform speed
runtime["late"] = (
    runtime["observedCumRuntimeSeconds"] - runtime["expectedCumRuntimeSeconds"]
).astype("int")

sameServiceStopCols = ["routeId", "directionId", "serviceDate", "toStopId"]

# Add instance of previous trip
runtime = runtime.sort_values(sameServiceStopCols + ["scheduledToStopArrivalTime"])

runtime["prevInstanceId"] = (
    runtime.groupby(sameServiceStopCols)["instanceId"].shift(1).astype("Int64")
)
sameTripCols = ["routeId", "directionId", "serviceDate", "tripId"]

runtime = runtime.sort_values(sameTripCols + ["toStopSequence"])

# Add instances of previous stop of the same trip
runtime["lagInstanceId"] = (
    runtime.groupby(sameTripCols)["instanceId"].shift(1).astype("Int64")
)

# drop NAs
runtime = runtime.dropna(subset=["prevInstanceId", "lagInstanceId"])

toJoinFrom = runtime.copy()
toJoin = (
    toJoinFrom[["instanceId", "observedToStopArrivalTime", "scheduledTripStartTime"]]
    .rename(
        columns={
            "instanceId": "prevInstanceId",
            "observedToStopArrivalTime": "prevBusArrivalTime",
            "scheduledTripStartTime": "prevBusTripStartTime",
        }
    )
    .dropna(subset=["prevInstanceId"])
)

runtimeDf = runtime.merge(toJoin, how="left", on="prevInstanceId").dropna(
    subset=["prevInstanceId"]
)

# Observed headway

# Do a subtraction to get headway
runtimeDf["headway"] = (
    runtimeDf["observedToStopArrivalTime"] - runtimeDf["prevBusArrivalTime"]
) / np.timedelta64(1, "s")

# Expected headway

# Do a subtraction to get headway
runtimeDf["expectedHeadway"] = (
    runtimeDf["scheduledTripStartTime"] - runtimeDf["prevBusTripStartTime"]
) / np.timedelta64(1, "s")

runtimeDf["bunched"] = False
bunchedThreshold = 0.25
bunchedMask = runtimeDf.headway < runtimeDf.expectedHeadway * bunchedThreshold
runtimeDf.loc[bunchedMask, "bunched"] = True

toJoinFrom = runtimeDf.copy().dropna(subset=["instanceId"])

# Lag bunched: identify initiation of bunching

toJoin = toJoinFrom[["instanceId", "bunched"]].rename(
    columns={
        "instanceId": "lagInstanceId",
        "bunched": "lagBunched",
    }
)

runtimeDf = runtimeDf.merge(toJoin, how="left", on="lagInstanceId")

runtimeDf["initBunching"] = False
runtimeDf.loc[
    (runtimeDf["lagBunched"] == False) & (runtimeDf["bunched"] == True), "initBunching"
] = True

runtimeDf["period"] = runtimeDf.scheduledTripStartTime.dt.hour

# ============ Save data ============

runtimeDf.to_parquet("server/raw-data/runtimeDf.gzip")
