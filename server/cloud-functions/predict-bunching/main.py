from google.cloud import storage
from joblib import load
from io import BytesIO
import json
from flask import make_response
import functions_framework
from datetime import datetime, timedelta
import pytz
import pandas as pd


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


def make_response_with_cors(message, status=200):
    response = make_response(message, status)
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type")
    return response


@functions_framework.http
def make_predictions(request):
    route = request.args.get("route")
    direction = request.args.get("direction")
    trip_id = request.args.get("trip")
    threshold = 0.015

    try:
        # Get dictionaries
        try:
            stop_dict = load_json_from_gcs("stop-dictionary", "stop-info.json")
            next_stops_dict = load_json_from_gcs("stop-dictionary", "next-stops.json")
            trip_dict = load_json_from_gcs("trip-dictionary", "trip-start-times.json")
        except:
            response = make_response_with_cors("Cannot get dictionaries", status=500)
            return response

        # Get this bus
        try:
            this_bus = load_json_from_gcs(
                "transit-view-cache",
                f"{route}/{directionDict[route][direction]}/{trip_id}.json",
            )
        except:
            response = make_response_with_cors(
                "Cannot retrieve the bus based on input params", status=500
            )
            return response

        # If no previous bus AT THE MOMENT, then return "No Bus Ahead"
        if this_bus[-1]["prevTrip"] is None:
            response = make_response_with_cors("No bus ahead to bunch to", status=206)
            return response

        prev_trip_id = this_bus[-1]["prevTrip"]

        # Get previous bus (if available)
        try:
            prev_bus = load_json_from_gcs(
                "transit-view-cache",
                f"{route}/{directionDict[route][direction]}/{prev_trip_id}.json",
            )
        except:
            response = make_response_with_cors(
                "Cannot retrieve information of the bus running ahead", status=500
            )
            return response

        # We also need the bus before the previous bus to calculate headway
        # for the previous bus
        prev_prev_trip_id = None
        for i in range(len(prev_bus)):
            if prev_bus[-1 - i]["prevTrip"] is not None:
                prev_prev_trip_id = prev_bus[-1 - i]["prevTrip"]
                break

        if prev_prev_trip_id is None:
            response = make_response_with_cors(
                "Not enough buses passing the same stop have been observed to make predictions",
                status=206,
            )
            return response

        try:
            prev_prev_bus = load_json_from_gcs(
                "transit-view-cache",
                f"{route}/{directionDict[route][direction]}/{prev_prev_trip_id}.json",
            )
        except:
            response = make_response_with_cors(
                "Not enough buses passing the same stop have been observed to make predictions",
                status=206,
            )
            return response

        if len(this_bus) < 3 or len(prev_bus) < 3:
            response = make_response_with_cors(
                "Not enough data to make prediction because \
                    the buses have not been observed for at least 3 stops",
                status=206,
            )
            return response

        predictors = {}

        # Calculate headways
        try:
            predictors["headway"] = calculate_headway(this_bus, prev_bus)
        except:
            make_response_with_cors(
                "Failed to calculate headway because the scope of training data is exceeded",
                status=500,
            )
            return response

        try:
            predictors["prevBus_headway"] = calculate_headway(prev_bus, prev_prev_bus)
        except:
            make_response_with_cors(
                "Failed to calculate headway of the previous bus \
                     because the scope of training data is exceeded",
                status=500,
            )
            return response

        try:
            lag_headway = calculate_headway(this_bus, prev_bus, is_latest=False)
        except:
            make_response_with_cors(
                "Failed to calculate lag headway because the scope of training data is exceeded",
                status=500,
            )
            return response

        try:
            prevBus_lag_headway = calculate_headway(
                prev_bus, prev_prev_bus, is_latest=False
            )
        except:
            make_response_with_cors(
                "Failed to calculate lag headway of the previous bus \
                     because the scope of training data is exceeded",
                status=500,
            )
            return response

        predictors["headwayLagDiff"] = predictors["headway"] - lag_headway
        predictors["prevBus_headwayLagDiff"] = (
            predictors["prevBus_headway"] - prevBus_lag_headway
        )

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
        except:
            response = make_response_with_cors("Failed to calculate speed", status=500)
            return response

        # Calculate lateness
        try:
            predictors["late"] = calculate_late(
                route, direction, trip_id, trip_dict, stop_dict, this_bus
            )
            predictors["prevBus_late"] = calculate_late(
                route, direction, trip_id, trip_dict, stop_dict, prev_bus
            )
            lag_late = calculate_late(
                route,
                direction,
                trip_id,
                trip_dict,
                stop_dict,
                this_bus,
                is_latest=False,
            )
            prevBus_lag_late = calculate_late(
                route,
                direction,
                trip_id,
                trip_dict,
                stop_dict,
                prev_bus,
                is_latest=False,
            )
            predictors["lateLagDiff"] = predictors["late"] - lag_late
            predictors["prevBus_lateLagDiff"] = (
                predictors["prevBus_late"] - prevBus_lag_late
            )

        except:
            response = make_response_with_cors(
                "Failed to calculate lateness", status=500
            )
            return response

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
                predictors["toStopPathIndex"] = stop_dict[future_stop_id][
                    "toStopPathIndex"
                ]

                model = load_joblib_from_gcs(
                    "bunching-prediction-models", f"{route}/{steps}.joblib"
                )
                predictors_df = pd.DataFrame(predictors, index=[0])
                score = model.predict_proba(predictors_df)[0][1]
                if score > threshold:
                    scores.append(True)
                else:
                    scores.append(False)
            except:
                scores.append(None)

        response = make_response_with_cors(json.dumps(scores), status=200)
        return response

    except Exception as e:
        response = make_response_with_cors(f"Error: {e}", status=500)
        return response
