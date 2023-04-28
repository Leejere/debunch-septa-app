import dotenv
from google.cloud import storage
from joblib import load
from io import BytesIO
import json
from datetime import datetime, timedelta
import pytz
import pandas as pd
from flask import make_response
import functions_framework

dotenv.load_dotenv()

directionDict = {
    "21": {"0": "EastBound", "1": "WestBound"},
    "33": {"0": "SouthBound", "1": "NorthBound"},
    "47": {"0": "SouthBound", "1": "NorthBound"},
}


def load_joblib_from_gcs(bucket_name, blob_name):
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = storage.Blob(blob_name, bucket)
    joblib_buffer = BytesIO()
    blob.download_to_file(joblib_buffer)
    joblib_buffer.seek(0)
    return load(joblib_buffer)


def load_json_from_gcs(bucket_name, blob_name):
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = storage.Blob(blob_name, bucket)
    json_data = blob.download_as_text()
    return json.loads(json_data)


def calculate_headway(this_bus, prev_bus, is_latest=True):
    index = -1 if is_latest else -2
    this_time_stamp = this_bus[index]["timestamp"]
    this_stop = this_bus[index]["next_stop_id"]
    prev_bus_timestamp = None
    for i in range(len(prev_bus)):
        if prev_bus[index - i]["next_stop_id"] == this_stop:
            prev_bus_timestamp = prev_bus[index - i]["timestamp"]
            break
    if prev_bus_timestamp is None:
        return None

    return this_time_stamp - prev_bus_timestamp


def calculate_speed(route, direction, stop_dict, bus, is_latest=True):
    index = -1 if is_latest else -2
    this_timestamp = bus[index]["timestamp"]
    this_stop = bus[index]["next_stop_id"]
    last_timestamp = bus[index - 1]["timestamp"]
    time_diff = this_timestamp - last_timestamp
    unique_id = f"{route}_{direction}_{this_stop}"
    distance = stop_dict[unique_id]["stopPathLength"]
    speed = distance / time_diff
    return speed


def timestamp_to_timedelta(timestamp):
    timezone = pytz.timezone("America/New_York")
    formatted = (
        datetime.utcfromtimestamp(timestamp)
        .replace(tzinfo=pytz.utc)
        .astimezone(timezone)
    )
    hours, minutes, seconds = formatted.hour, formatted.minute, formatted.second
    return timedelta(hours=hours, minutes=minutes, seconds=seconds)


def string_to_timedelta(time_string):
    formatted = datetime.strptime(time_string, "%H:%M:%S").time()
    hours, minutes, seconds = formatted.hour, formatted.minute, formatted.second
    return timedelta(hours=hours, minutes=minutes, seconds=seconds)


def calculate_late(
    route, direction, trip_id, trip_dict, stop_dict, bus, is_latest=True
):
    index = -1 if is_latest else -2
    this_timestamp = bus[index]["timestamp"]
    this_stop = bus[index]["next_stop_id"]
    this_delta = timestamp_to_timedelta(this_timestamp)
    start_time_string = trip_dict[trip_id]
    start_delta = string_to_timedelta(start_time_string)
    cum_runtime = abs(this_delta - start_delta).total_seconds()
    expected_cum_runtime = stop_dict[f"{route}_{direction}_{this_stop}"][
        "expectedCumRuntimeSeconds"
    ]
    return cum_runtime - expected_cum_runtime


def make_predictions(route, direction, trip_id):
    threshold = 0.015
    # Get dictionaries
    try:
        stop_dict = load_json_from_gcs("stop-dictionary", "stop-info.json")
        next_stops_dict = load_json_from_gcs("stop-dictionary", "next-stops.json")
        trip_dict = load_json_from_gcs("trip-dictionary", "trip-start-times.json")
    except:
        print("Failed to get stop dictionaries")
        return

    # Get this bus
    try:
        this_bus = load_json_from_gcs(
            "transit-view-cache",
            f"{route}/{directionDict[route][direction]}/{trip_id}.json",
        )
    except:
        print("Failed to get this bus")
        return

    # If no previous bus AT THE MOMENT, then return "No Bus Ahead"
    if this_bus[-1]["prevTrip"] is None:
        print("No Bus Ahead")
        return

    prev_trip_id = this_bus[-1]["prevTrip"]

    # Get previous bus (if available)
    try:
        prev_bus = load_json_from_gcs(
            "transit-view-cache",
            f"{route}/{directionDict[route][direction]}/{prev_trip_id}.json",
        )
    except:
        print("Prior bus not available")
        return

    # We also need the bus before the previous bus to calculate headway
    # for the previous bus
    prev_prev_trip_id = None
    for i in range(len(prev_bus)):
        if prev_bus[-1 - i]["prevTrip"] is not None:
            prev_prev_trip_id = prev_bus[-1 - i]["prevTrip"]
            break

    if prev_prev_trip_id is None:
        print("Bus prior to previous bus not available")
        return

    try:
        prev_prev_bus = load_json_from_gcs(
            "transit-view-cache",
            f"{route}/{directionDict[route][direction]}/{prev_prev_trip_id}.json",
        )
    except:
        print("Bus prior to previous bus not available")
        return

    if len(this_bus) < 3 or len(prev_bus) < 3:
        print(
            "Not enough data to make prediction because \
                the buses have not been observed for at least 3 stops"
        )
        return

    predictors = {}

    # Calculate headways
    try:
        predictors["headway"] = calculate_headway(this_bus, prev_bus)
        print("headway calculated")
        predictors["prevBus_headway"] = calculate_headway(prev_bus, prev_prev_bus)
        print("headway calculated")

        lag_headway = calculate_headway(this_bus, prev_bus, is_latest=False)
        prevBus_lag_headway = calculate_headway(
            prev_bus, prev_prev_bus, is_latest=False
        )

        predictors["headwayLagDiff"] = predictors["headway"] - lag_headway
        predictors["prevBus_headwayLagDiff"] = (
            predictors["prevBus_headway"] - prevBus_lag_headway
        )

        print(json.dumps(predictors, indent=4))
    except:
        print("Failed to calculate headway")
        return

    # Calculate speeds
    try:
        predictors["speed"] = calculate_speed(route, direction, stop_dict, this_bus)
        predictors["prevBus_speed"] = calculate_speed(
            route, direction, stop_dict, prev_bus
        )
        lag_speed = calculate_speed(
            route, direction, stop_dict, this_bus, is_latest=False
        )
        prevBus_lag_speed = calculate_speed(
            route, direction, stop_dict, prev_bus, is_latest=False
        )
        predictors["speedLagDiff"] = predictors["speed"] - lag_speed
        predictors["prevBus_speedLagDiff"] = (
            predictors["prevBus_speed"] - prevBus_lag_speed
        )
        print(json.dumps(predictors, indent=4))
    except:
        print("Failed to calculate speed")
        return

    # Calculate lateness

    try:
        predictors["late"] = calculate_late(
            route, direction, trip_id, trip_dict, stop_dict, this_bus
        )
        predictors["prevBus_late"] = calculate_late(
            route, direction, trip_id, trip_dict, stop_dict, prev_bus
        )
        lag_late = calculate_late(
            route, direction, trip_id, trip_dict, stop_dict, this_bus, is_latest=False
        )
        prevBus_lag_late = calculate_late(
            route, direction, trip_id, trip_dict, stop_dict, prev_bus, is_latest=False
        )
        predictors["lateLagDiff"] = predictors["late"] - lag_late
        predictors["prevBus_lateLagDiff"] = (
            predictors["prevBus_late"] - prevBus_lag_late
        )
        print(json.dumps(predictors, indent=4))

    except:
        print("Failed to calculate lateness")
        return

    predictors["directionId"] = direction
    predictors["period"] = datetime.now().hour

    # Add other variables based on steps
    this_stop = this_bus[-1]["next_stop_id"]

    scores = []
    for steps in range(11, 21):
        try:
            future_stop_id = next_stops_dict[f"{route}_{direction}_{this_stop}"][
                f"next_{steps}_unique_id"
            ]
            predictors["centerCity"] = stop_dict[future_stop_id]["centerCity"]
            predictors["toStopPathIndex"] = stop_dict[future_stop_id]["toStopPathIndex"]

            print(json.dumps(predictors, indent=4))

            model = load_joblib_from_gcs(
                "bunching-prediction-models", f"{route}/{steps}.joblib"
            )
            predictors_df = pd.DataFrame(predictors, index=[0])
            score = model.predict_proba(predictors_df)[0][1]
            scores.append(score > threshold)
            print(score)

        except:
            print(f"Failed to calculate future stop {steps}")
            scores.append(None)

    print(scores)


make_predictions("47", "0", "213576")
