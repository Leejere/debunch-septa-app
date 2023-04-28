import pandas as pd
import geopandas as gpd
import dotenv
import json
from os.path import dirname
from google.cloud import storage

dotenv.load_dotenv()

"""
This script uploads two dictionary to Google Cloud Storage:
1. Info by stopId
2. Stop IDs of next 1-20 stops of each stopId
"""

script_dir = dirname(__file__)
server_dir = dirname(dirname(script_dir))

client = storage.Client()
bucket = client.bucket("trip-dictionary")
trip_info_blob = bucket.blob("trip-info.json")
trip_start_times_blob = bucket.blob("trip-start-times.json")

runtime = pd.read_parquet(f"{server_dir}/raw-data/runtimeDf.gzip")

routes = ["21", "33", "47"]
runtime = runtime.query("routeId.isin(@routes)").copy()

runtime["scheduledTripStartTime_noDate"] = runtime["scheduledTripStartTime"].dt.time

trip_info = runtime.groupby("tripId").agg(
    {
        "scheduledTripStartTime_noDate": "min",
        "expectedHeadway": "mean",
    }
)

trip_info["start_time"] = trip_info["scheduledTripStartTime_noDate"].astype(str)
trip_info = trip_info.drop("scheduledTripStartTime_noDate", axis=1).convert_dtypes()

trip_info_dict = trip_info.to_dict(orient="index")

trip_schedules = pd.read_csv(f"{server_dir}/raw-data/trip_schedules.csv", index_col=0)
trip_start_times_dict = (
    trip_schedules.groupby("trip_id")["departure_time"].min().to_dict()
)


trip_info_blob.upload_from_string(
    json.dumps(trip_info_dict), content_type="application/json"
)

trip_start_times_blob.upload_from_string(
    json.dumps(trip_start_times_dict), content_type="application/json"
)
