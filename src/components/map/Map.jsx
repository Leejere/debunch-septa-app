import React, { useState, useRef, useEffect } from "react";
import mapStyles from "./Map.module.scss";

// Leaflet imports
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";

const routeStyle = { color: "#cccccc", weight: 4, opacity: 0.3 };
const routeStyleHover = { weight: 4, color: "#868cc4", opacity: 1 };
const routeStyleSelected = { ...routeStyleHover, color: "#174b7f", opacity: 1 };

function MapComponent({
  mapParams,
  routeData,
  requestParams,
  setRequestParams,
}) {
  const map = useMap();
  // Determine if route style should be the selected style
  const getRouteStyle = (feature) => {
    return feature.properties.lineabbr === requestParams.route
      ? routeStyleSelected
      : routeStyle;
  };
  useEffect(() => {
    map.routeLayer = L.geoJSON(routeData, {
      style: getRouteStyle,
    }).addEventListener("click", (e) => {
      // When clicked, trigger setState function
      // This in itself will trigger a rerender and thus
      // the the function returned by useEffect, and then
      // the useEffect function again
      const selected = e.layer.feature.properties.lineabbr;
      setRequestParams({ ...requestParams, route: selected });
    });
    map.routeLayer.addTo(map);
    return () => {
      // When the layer data or select layer changes, remove old layer
      // by calling this function returned by useEffect.
      // The useEffect function is called again to add the updated layer.
      map.routeLayer.remove();
    };
  }, [map.routeLayer, requestParams.route]);

  const mapAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileLayerUrl = `https://api.mapbox.com/styles/v1/${mapParams.account}/${mapParams.style}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapParams.token}`;

  return (
    <TileLayer url={tileLayerUrl} attribution={mapAttribution}></TileLayer>
  );
}

export default function Map({ requestParams, setRequestParams, prediction }) {
  // Initialize route shapes (as null)
  const [routeData, setRouteData] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      const url =
        "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/routes_selected.geojson";

      const response = await fetch(url);
      const data = await response.json();
      setRouteData(data);
    };
    fetchData();
  }, []);

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
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      ></MapComponent>
    </MapContainer>
  );
  return <div className={mapStyles.outContainer}>{MapEl}</div>;
}
