import React, { useState, useEffect } from "react";
import { TileLayer } from "react-leaflet/TileLayer";

// Hook to access map created by React Leaflet,
// and then to customize it using Leaflet (vanilla JS)
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";

// Dictionary of direction IDs corresponding to direction names
import { directionDict, directionDictReversed } from "../../index.js";

import makeBusFeatureCollection from "../../utils/makeBusFeatureCollection.js";

// Icons for buses
const iconHtml = `<i class="fas fa-bus"></i>`;
const busIcon = L.divIcon({
  html: iconHtml,
  iconSize: [30, 30], // Adjust the size as needed
  iconAnchor: [15, 15], // Adjust the anchor point as needed
});

// Predefining styles for route and stops on the map
const routeStyle = { color: "#cccccc", weight: 4, opacity: 0.3 };
const routeStyleSelected = { weight: 4, color: "#174b7f", opacity: 0.5 };

const stopsStyle = { color: "#cccccc", weight: 1.5, opacity: 0.3, radius: 4.5 };
const stopsStyleSelected = { ...stopsStyle, color: "#174b7f" };
const stopsStyleHighlighted = {
  ...stopsStyleSelected,
  opacity: 0.8,
  weight: 2.5,
  radius: 6,
};

// Component inside MapContainer. Used useMap() hood to access the map
// and then to customize it using Leaflet (vanilla JS)
export default function MapComponent({
  mapParams, // Map params defined in MapContainer component (parent)
  routeData, // Route data (static) fetched in MapContainer component (parent)
  stopsData, // Stops data (static) fetched in MapContainer component (parent)
  requestParams, // Request params passed down from index.js
  setRequestParams, // Method to set request params passed down from index.js
  realtimeData, // From realtime transit view API, fetched in index.js and passed down
}) {
  const map = useMap();

  // Determine if route style should be the selected style
  const getRouteStyle = (polyline) => {
    // If the route is selected, return the selected style
    return polyline.properties.lineabbr === requestParams.route
      ? routeStyleSelected
      : routeStyle;
  };

  // Determine if stop style should be the selected style
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

  // Function to manage route data on the map
  const addRouteData = () => {
    // Render route lines
    map.routeLayer = L.geoJSON(routeData, {
      style: getRouteStyle,
    }).addEventListener("click", (e) => {
      // You can select route in requestParams by clicking
      const selected = e.layer.feature.properties.lineabbr;
      setRequestParams({ ...requestParams, route: selected });
    });
    map.routeLayer.addTo(map);
  };

  // Function to manage stops data on the map
  const addStopsData = () => {
    map.stopsLayer = L.geoJSON(stopsData, {
      pointToLayer: (point, latLng) => L.circleMarker(latLng),
      style: getStopsStyle,
    }).addEventListener("click", (e) => {
      // When clicking on a stop, update requestParams both in terms of route and direction
      const selectedRoute = e.layer.feature.properties.LineAbbr;
      const direction = e.layer.feature.properties.DirectionN;
      const directionId = directionDictReversed[selectedRoute][direction];
      setRequestParams({
        ...requestParams,
        route: selectedRoute,
        direction: directionId,
      });
    });
    map.stopsLayer.addTo(map);
  };

  // Function to remove layers before adding updated layers
  const removeLayers = () => {
    map.routeLayer.remove();
    map.stopsLayer.remove();
  };

  // Add route layer to map and add event listeners
  useEffect(() => {
    addRouteData();
    addStopsData();
    return removeLayers;
  }, [
    map.routeLayer,
    map.stopsLayer,
    requestParams.route,
    requestParams.direction,
  ]);

  // Add realtime bus locations
  useEffect(() => {
    if (realtimeData) {
      const bus = makeBusFeatureCollection(realtimeData.bus);
      map.busLayer = L.geoJSON(bus, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: busIcon });
        },
      });
      map.busLayer.addTo(map);
    }
    return () => {
      if (map.busLayer) {
        map.busLayer.remove();
      }
    };
  }, [realtimeData]);

  const mapAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileLayerUrl = `https://api.mapbox.com/styles/v1/${mapParams.account}/${mapParams.style}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapParams.token}`;

  return (
    // Only tile layer is directly rendered by React Leaflet
    // Other layers are managed by directly accessing the map (useMap())
    <TileLayer url={tileLayerUrl} attribution={mapAttribution}></TileLayer>
  );
}
