import React, { useEffect } from "react";
import { TileLayer } from "react-leaflet/TileLayer";

// Hook to access map created by React Leaflet,
// and then to customize it using Leaflet (vanilla JS)
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";

// Dictionary of direction IDs corresponding to direction names
import { directionDictReversed } from "../../index.js";
import makeBusFeatureCollection from "../../utils/makeBusFeatureCollection.js";
import {
  getRouteStyle,
  getStopsStyle,
  makeBusPopupContent,
  makeBusIcon,
} from "./utils.js";

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

  // Function to manage route data on the map
  const addRouteData = () => {
    // Render route lines
    map.routeLayer = L.geoJSON(routeData, {
      style: (polyline) => getRouteStyle(polyline, requestParams.route),
    }).addEventListener("click", (e) => {
      // You can select route in requestParams by clicking
      const selected = e.layer.feature.properties.lineabbr;
      setRequestParams({ ...requestParams, route: selected });
    });
    map.routeLayer.addTo(map);
  };

  // Function to manage stops data to the stops layer on update (after clearing the old one)
  const addStopsData = () => {
    map.stopsLayer = L.geoJSON(stopsData, {
      pointToLayer: (point, latLng) => L.circleMarker(latLng),
      style: (circle) => getStopsStyle(circle, requestParams),
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
  // Function to add realtime bus data to the map
  const addBusData = () => {
    const buses = makeBusFeatureCollection(realtimeData.bus);
    // Filter to only selected direction
    const filteredBuses = buses.features.filter((bus) => {
      const isSelectedDirection =
        directionDictReversed[requestParams.route][bus.properties.direction] ===
        requestParams.direction;
      return isSelectedDirection;
    });
    map.busLayer = L.geoJSON(filteredBuses, {
      pointToLayer: (feature, latlng) => {
        // Highlight the currently selected route, direction, and trip
        const thisBus = feature.properties;
        const isSelectedTrip = thisBus.trip === requestParams.trip;
        return L.marker(latlng, {
          icon: makeBusIcon(isSelectedTrip),
        });
      },
    }).bindPopup((layer) => makeBusPopupContent(layer.feature));
    map.busLayer.addTo(map);
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
    if (realtimeData) addBusData();
    return () => {
      if (map.busLayer) map.busLayer.remove();
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
