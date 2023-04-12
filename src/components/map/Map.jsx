import React, { useState, useEffect } from "react";
import mapStyles from "./Map.module.scss";

// Imports from React Leaflet
import { MapContainer } from "react-leaflet/MapContainer";

// What goes inside the MapContainer
import MapComponent from "./MapComponent";

export default function Map({
  requestParams,
  setRequestParams,
  realtimeData, // Real-time transit view data, fetched at the higher level
  prediction,
}) {
  // Initialize route shapes and stops points (as null)
  const [routeData, setRouteData] = useState(null);
  const [stopsData, setStopsData] = useState(null);

  // MapBox params
  const mapParams = {
    center: [39.96, -75.16],
    zoom: 13,
    maxZoom: 22,
    minZoom: 11,
    account: "mapbox",
    style: "light-v11",
    preferCanvas: true,
    zoomControl: false,
    token:
      "pk.eyJ1IjoibGktamllLWZqIiwiYSI6ImNsYWU2dWtqbzByZHYzb3F5dndrZm9vbXoifQ.RhKDjT-7I5oWlzeDbfrI9g",
  };

  // On load, get shapes of the selected routes
  const githubDataUrl =
    "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/";
  const routeUrl = `${githubDataUrl}routes_selected.geojson`;
  const stopsUrl = `${githubDataUrl}stops_selected.geojson`;
  useEffect(() => {
    const fetchData = async (url, setter) => {
      const response = await fetch(url);
      const data = await response.json();
      setter(data);
    };
    fetchData(routeUrl, setRouteData);
    fetchData(stopsUrl, setStopsData);
  }, []);
  // Note: Real-time transit view data is fetched at the higher level

  const MapEl = (
    <MapContainer
      className={mapStyles.container}
      center={mapParams.center}
      zoom={mapParams.zoom}
      maxZoom={mapParams.maxZoom}
      minZoom={mapParams.minZoom}
      preferCanvas={mapParams.preferCanvas}
      zoomControl={mapParams.zoomControl}
    >
      <MapComponent
        mapParams={mapParams}
        routeData={routeData}
        stopsData={stopsData}
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        realtimeData={realtimeData}
      ></MapComponent>
    </MapContainer>
  );
  return <div className={mapStyles.outContainer}>{MapEl}</div>;
}
