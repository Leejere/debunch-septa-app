import React from "react";
import mapStyles from "./Map.module.scss";

// Leaflet imports
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";

export default function Map() {
  // MapBox params
  const mapCenter = [39.98, -75.16];
  const mapZoom = 11.5;
  const mapboxAccount = "mapbox";
  const mapboxStyle = "light-v10";
  const mapboxToken =
    "pk.eyJ1IjoibGktamllLWZqIiwiYSI6ImNsYWU2dWtqbzByZHYzb3F5dndrZm9vbXoifQ.RhKDjT-7I5oWlzeDbfrI9g";
  const mapAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileLayerUrl = `https://api.mapbox.com/styles/v1/${mapboxAccount}/${mapboxStyle}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;

  const MapEl = (
    <MapContainer
      className={mapStyles.container}
      center={mapCenter}
      zoom={mapZoom}
    >
      <TileLayer url={tileLayerUrl} attribution={mapAttribution}></TileLayer>
    </MapContainer>
  );
  return <>{MapEl}</>;
}
