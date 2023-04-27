import pandas as pd
import geopandas as gpd
import numpy as np

url = "https://arcgis.dvrpc.org/portal/rest/services/Transportation/SEPTA_TransitRoutes/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson"
routes = gpd.read_file(url)

selected_routes = ["47", "21", "33"]
routes_selected = routes.query("lineabbr in @selected_routes").copy()

routes_selected.to_file("db/routes_selected.geojson", driver="GeoJSON")
