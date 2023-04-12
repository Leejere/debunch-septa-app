import React, { useState, useRef, useEffect } from "react";
import mapStyles from "./Map.module.scss";

// Leaflet imports
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";

import { directionDict } from "../../index.js";

const routeStyle = { color: "#cccccc", weight: 4, opacity: 0.3 };
const routeStyleSelected = { weight: 4, color: "#174b7f", opacity: 0.5 };

const stopsStyle = { color: "#cccccc", weight: 1.5, opacity: 0.3, radius: 3 };
const stopsStyleSelected = { ...stopsStyle, color: "#174b7f" };
const stopsStyleHighlighted = {
  ...stopsStyleSelected,
  opacity: 0.8,
  weight: 2.5,
  radius: 4,
};

function MapComponent({
  mapParams,
  routeData,
  stopsData,
  requestParams,
  setRequestParams,
}) {
  const map = useMap();
  // Determine if route style should be the selected style
  const getRouteStyle = (polyline) => {
    // If the route is selected, return the selected style
    return polyline.properties.lineabbr === requestParams.route
      ? routeStyleSelected
      : routeStyle;
  };
  const getStopsStyle = (circle) => {
    const thisRoute = circle.properties.LineAbbr;
    const thisDirection = circle.properties.DirectionN;
    const shouldSelect = thisRoute === requestParams.route; // This route

    const highlightDirection =
      directionDict[requestParams.route][requestParams.direction];
    const shouldHighlight =
      shouldSelect && thisDirection === highlightDirection; // This route and direction

    if (shouldHighlight) return stopsStyleHighlighted;
    return shouldSelect ? stopsStyleSelected : stopsStyle;
  };

  // Add route layer to map and add event listeners
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

  // Add stops layer to map
  useEffect(() => {
    map.stopsLayer = L.geoJSON(stopsData, {
      pointToLayer: (point, latLng) => L.circleMarker(latLng),
      style: getStopsStyle,
    }).addEventListener("click", (e) => {
      // When clicking on a stop, update requestParams both in terms of route and direction
      const selectedRoute = e.layer.feature.properties.LineAbbr;
      setRequestParams({ ...requestParams, route: selectedRoute });
      const selectedDirection = e.layer.feature.properties.DirectionN;
      const prevDirection =
        directionDict[selectedRoute][requestParams.direction];
      if (selectedDirection !== prevDirection) {
        const newDirection = requestParams.direction === "0" ? "1" : "0";
        setRequestParams({ ...requestParams, direction: newDirection });
      }
    });
    map.stopsLayer.addTo(map);
    return () => {
      map.stopsLayer.remove();
    };
  }, [map.stopsLayer, requestParams]);

  const mapAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileLayerUrl = `https://api.mapbox.com/styles/v1/${mapParams.account}/${mapParams.style}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapParams.token}`;

  return (
    <TileLayer url={tileLayerUrl} attribution={mapAttribution}></TileLayer>
  );
}

export default function Map({ requestParams, setRequestParams, prediction }) {
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
      ></MapComponent>
    </MapContainer>
  );
  return <div className={mapStyles.outContainer}>{MapEl}</div>;
}
