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
import os

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "C:/Users/huyh/Documents/Penn/Spring 2023/Cloud Computing/cloud-computing-bus-bunching/server/musa-cloud-computing-94ed5397a0cb.json"

DATA_DIR = "C:\\Users\\huyh\\Documents\\Penn\\Spring 2023\\Cloud Computing\\cloud-computing-bus-bunching\\server\\cloud-functions\\rawdata"

def load_json_from_gcs(bucket_name, blob_name):
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    blob = storage.Blob(blob_name, bucket)
    json_data = blob.download_as_text()
    return json.loads(json_data)

this_bus = load_json_from_gcs(
            "transit-view-cache-musa-509",
            f"{route}/{directionDict[route][direction]}/{trip_id}.json")

with open(DATA_DIR / 'test.json', 'r', encoding='utf-8') as infile:
    data = json.load(this_bus)