import dotenv
from google.cloud import storage
from joblib import load
from io import BytesIO
import json
from flask import make_response
import functions_framework
from datetime import datetime

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


def make_response_with_cors(message, status=200):
    response = make_response(message, 200)
    response.headers.set("Access-Control-Allow-Origin", "*")
    return response


@functions_framework.http
def make_predictions(request):
    route = request.args.get("route")
    direction = request.args.get("direction")
    trip = request.args.get("trip")

    # Get dictionaries
    try:
        stop_dict = load_json_from_gcs("stop-dictionary", "stop-info.json")
        next_stops_dict = load_json_from_gcs("stop-dictionary", "next-stops.json")
    except:
        response = make_response_with_cors("Error", status=500)
        return response

    # Get this bus
    try:
        this_bus = load_json_from_gcs(
            "transit-view-cache",
            f"{route}/{directionDict[route][direction]}/{trip}.json",
        )
    except:
        response = make_response_with_cors("Not_Yet_Available")
        return response

    if this_bus[-1]["prev_trip"] is None:
        response = make_response_with_cors("No_Bus_Ahead")
        return response

    prev_trip = this_bus[-1]["prev_trip"]

    # Get previous bus
    try:
        prev_bus = load_json_from_gcs(
            "transit-view-cache",
            f"{route}/{directionDict[route][direction]}/{prev_trip}.json",
        )
    except:
        response = make_response_with_cors("Not_Yet_Available")
        return response

    if len(this_bus) < 2 or len(prev_bus) < 2:
        response = make_response_with_cors("Not_Yet_Available")
        return response

    # Get the stop of interes
    the_stop = this_bus[-1]["next_stop_id"]
    the_sequence = stop_dict[f"{route}_{direction}_{the_stop}"]["toStopPathIndex"]
