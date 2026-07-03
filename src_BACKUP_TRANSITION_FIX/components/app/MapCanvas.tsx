"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { TYPE_COLOR, TYPE_LABEL, formatSaves } from "@/lib/map-helpers";
import type { Place } from "@/lib/types";

const CASCAIS_CENTER: [number, number] = [38.6979, -9.4215];

function makeIcon(color: string) {
  const size = 28;
  return L.divIcon({
    className: "custom-pin",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 8px -2px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    "><div style="transform:rotate(45deg);width:5px;height:5px;background:white;border-radius:50%;"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const STREET_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const SATELLITE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

interface MapContentProps {
  satellite: boolean;
  userPos: [number, number] | null;
  onSelect: (p: Place) => void;
  flyTo: { lat: number; lng: number; zoom: number; nonce: number } | null;
  mapRefCallback: (map: L.Map | null) => void;
  filterPlaces: Place[];
}

function MapContent({ satellite, userPos, onSelect, flyTo, mapRefCallback, filterPlaces }: MapContentProps) {
  const map = useMap();

  useEffect(() => {
    mapRefCallback(map);
  }, [map, mapRefCallback]);

  // markers direct toevoegen (geen clustering — robuuster)
  // herbouw markers wanneer filterPlaces verandert
  useEffect(() => {
    const markers: L.Marker[] = [];
    filterPlaces.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: makeIcon(TYPE_COLOR[p.type] ?? "#0e7c7b") });
      marker.bindPopup(
        `<div style="width:180px;overflow:hidden;font-family:inherit;">
          <img src="${p.coverImage}" style="width:100%;height:100px;object-fit:cover;display:block;" />
          <div style="padding:10px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${p.name}</div>
            <div style="font-size:11px;color:#666;">${TYPE_LABEL[p.type]} · ${p.neighborhood}</div>
            <div style="font-size:11px;color:#666;margin-top:2px;">★ ${p.rating.toFixed(1)} · ${formatSaves(p.saves)} saves</div>
          </div>
        </div>`
      );
      marker.on("click", () => onSelect(p));
      marker.addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => map.removeLayer(m));
    };
  }, [map, onSelect, filterPlaces]);

  // flyTo
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 1 });
    }
  }, [flyTo, map]);

  return (
    <>
      <TileLayer
        key={satellite ? "sat" : "street"}
        url={satellite ? SATELLITE_URL : STREET_URL}
        attribution={satellite ? "Esri" : "CARTO · OSM"}
        maxZoom={20}
      />
      {userPos && (
        <Marker
          position={userPos}
          icon={L.divIcon({
            className: "user-pin",
            html: `<div style="
              width:18px;height:18px;background:#0e7c7b;
              border:3px solid white;border-radius:50%;
              box-shadow:0 0 0 8px rgba(14,124,123,0.25),0 2px 6px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })}
        />
      )}
    </>
  );
}

export interface MapCanvasProps {
  satellite: boolean;
  userPos: [number, number] | null;
  onSelect: (p: Place) => void;
  flyTo: { lat: number; lng: number; zoom: number; nonce: number } | null;
  onMapReady: (map: L.Map | null) => void;
  filterPlaces: Place[];
}

export function MapCanvas(props: MapCanvasProps) {
  return (
    <MapContainer center={CASCAIS_CENTER} zoom={13} scrollWheelZoom className="h-full w-full" style={{ background: "#a8d5d2" }}>
      <MapContent
        satellite={props.satellite}
        userPos={props.userPos}
        onSelect={props.onSelect}
        flyTo={props.flyTo}
        mapRefCallback={props.onMapReady}
        filterPlaces={props.filterPlaces}
      />
    </MapContainer>
  );
}
