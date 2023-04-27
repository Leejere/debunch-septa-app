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
server_dir = dirname(script_dir)

client = storage.Client()
bucket = client.bucket("stop-dictionary")
info_blob = bucket.blob("stop-info.json")
next_stops_blob = bucket.blob("next-stops.json")

runtime = pd.read_parquet(f"{server_dir}/raw-data/runtimeDf.gzip")

routes = ["21", "33", "47"]
stop_info = (
    runtime.query("routeId.isin(@routes)")
    .copy()
    .groupby(["routeId", "directionId", "toStopId"])
    .agg({"toStopPathIndex": "min", "expectedHeadway": "mean", "DoW": "size"})
    .query("DoW > 0")
    .copy()
    .reset_index()
    .drop(["DoW"], axis=1)
)

stops = gpd.read_file(f"{server_dir}/data/stops/stopsGeographyProcessed.shp")
stops = stops.rename(columns={"directionI": "directionId", "StopId": "stopId"}).drop(
    "geography", axis=1
)

stops.routeId = stops.routeId.astype(str)
stops.directionId = stops.directionId.astype(str)
stops.stopId = stops.stopId.astype(str)

stops = stops.drop_duplicates(subset=["routeId", "directionId", "stopId"])
# Info by Stop
stop_info = stop_info.merge(
    stops[["routeId", "directionId", "stopId", "centerCity"]].rename(
        columns={"stopId": "toStopId"}
    ),
    how="left",
    on=["routeId", "directionId", "toStopId"],
)

stop_info["stop_unique_id"] = (
    stop_info["routeId"] + "_" + stop_info["directionId"] + "_" + stop_info["toStopId"]
)


# Next 1-20 stops by stop
sorted = stop_info.sort_values(
    [
        "routeId",
        "directionId",
        "toStopPathIndex",
    ]
)

for i in range(1, 22):
    sorted[f"next_{i}_unique_id"] = sorted.groupby(["routeId", "directionId"])[
        "stop_unique_id"
    ].shift(-i)

next_stops = sorted.drop(
    [
        "toStopPathIndex",
        "routeId",
        "directionId",
        "toStopId",
        "expectedHeadway",
        "centerCity",
    ],
    axis=1,
)

stop_info = stop_info.drop(["routeId", "directionId", "toStopId"], axis=1)
stop_info = stop_info.convert_dtypes()

stop_info_dict = stop_info.set_index("stop_unique_id")[
    [
        "expectedHeadway",
        "centerCity",
    ]
].to_dict(orient="index")

next_stops = next_stops.convert_dtypes()
next_stops_dict = next_stops.set_index("stop_unique_id").to_dict(orient="index")


info_blob.upload_from_string(
    json.dumps(stop_info_dict), content_type="application/json"
)
next_stops_blob.upload_from_string(
    json.dumps(next_stops_dict), content_type="application/json"
)
