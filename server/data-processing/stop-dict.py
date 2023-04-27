import pandas as pd
import geopandas as gpd

runtime = pd.read_parquet("server/raw-data/runtimeDf.gzip")
stops = gpd.read_file("server/data/stops/stopsGeographyProcessed.shp")
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
