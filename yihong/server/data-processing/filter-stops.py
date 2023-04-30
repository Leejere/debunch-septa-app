import pandas as pd
import numpy as np
import geopandas as gpd

stops = gpd.read_file("db/stops-all.geojson")

selected_routes = ["47", "21", "33"]
stops_selected = stops.query("LineAbbr in @selected_routes").copy()

stops_selected.to_file("db/stops_selected.geojson", driver="GeoJSON")
