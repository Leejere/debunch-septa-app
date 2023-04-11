import React, { useState, useRef, useEffect } from "react";
import mapStyles from "./Map.module.scss";

// Leaflet imports
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";

export default function Map({ prediction }) {
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
  const mapAttribution =
    '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const tileLayerUrl = `https://api.mapbox.com/styles/v1/${mapParams.account}/${mapParams.style}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapParams.token}`;

  const mapRef = useRef();

  useEffect(() => {
    fetchData = async () => {
      const url = "";
    };
  }, [mapRef]);

  const MapEl = (
    <MapContainer
      ref={mapRef}
      className={mapStyles.container}
      center={mapParams.center}
      zoom={mapParams.zoom}
      maxZoom={mapParams.maxZoom}
      minZoom={mapParams.minZoom}
      preferCanvas={mapParams.preferCanvas}
      zoomControl={mapParams.zoomControl}
    >
      <TileLayer url={tileLayerUrl} attribution={mapAttribution}></TileLayer>
    </MapContainer>
  );
  return <div className={mapStyles.outContainer}>{MapEl}</div>;
}
