import pandas as pd
import geopandas as gpd
import os
from os.path import dirname
from google.cloud import storage

script_dir = dirname(__file__)
server_dir = dirname(script_dir)

client = storage.Client()
bucket = client.bucket("stop-dictionary")
blob = bucket.blob("stop-info.csv")

runtime = pd.read_parquet(f"{server_dir}/raw-data/runtimeDf.gzip")
stops = gpd.read_file(f"{server_dir}/data/stops/stopsGeographyProcessed.shp")

stops = stops.rename(columns={"directionI": "directionId", "StopId": "stopId"}).drop(
    "geography", axis=1
)

routes = ["21", "33", "47"]
extract = (
    runtime.query("routeId.isin(@routes)")
    .copy()
    .groupby(["routeId", "directionId", "toStopId"])
    .agg({"toStopPathIndex": "min", "expectedHeadway": "mean", "DoW": "size"})
    .query("DoW > 0")
    .copy()
    .reset_index()
    .drop(["DoW"], axis=1)
)
stops.routeId = stops.routeId.astype(str)
stops.directionId = stops.directionId.astype(str)
stops.stopId = stops.stopId.astype(str)

extract = extract.merge(
    stops[["routeId", "directionId", "stopId", "centerCity"]].rename(
        columns={"stopId": "toStopId"}
    ),
    how="left",
    on=["routeId", "directionId", "toStopId"],
).drop(["routeId", "directionId"], axis=1)

csv = extract.to_csv(index=False)
blob.upload_from_string(csv, content_type="text/csv")
