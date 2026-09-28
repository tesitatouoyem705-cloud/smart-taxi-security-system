import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, ShieldAlert, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Iconic Yellow Taxi SVG map icon
const taxiIcon = new L.DivIcon({
  className: "custom-taxi-icon",
  html: `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(245, 158, 11, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: relative; width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(135deg, #F59E0B, #FFE600); display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.8);">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
      </div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

const pickupIcon = new L.DivIcon({
  className: "custom-pickup-icon",
  html: `
    <div style="width: 28px; height: 28px; border-radius: 9999px; background: #10B981; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center;">
      <div style="width: 8px; height: 8px; border-radius: 9999px; background: #ffffff;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const dropoffIcon = new L.DivIcon({
  className: "custom-dropoff-icon",
  html: `
    <div style="width: 28px; height: 28px; border-radius: 9999px; background: #EF4444; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(239,68,68,0.5); display: flex; align-items: center; justify-content: center;">
      <div style="width: 8px; height: 8px; border-radius: 9999px; background: #ffffff;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MobileLiveMap({
  currentLocation = [3.8750, 11.5190],
  pickup = [3.8820, 11.5210],
  dropoff = [3.8910, 11.5130],
  hasDeviation = false,
  zoom = 15,
  height = "100%",
  interactive = true,
}) {
  const mapRef = useRef(null);

  const routePolyline = [
    pickup,
    [3.8800, 11.5200],
    [3.8770, 11.5195],
    currentLocation,
    [3.8830, 11.5170],
    [3.8880, 11.5150],
    dropoff,
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ height }}>
      <MapContainer
        center={currentLocation}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        style={{ width: "100%", height: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapViewController center={currentLocation} zoom={zoom} />

        {/* Safety Radius Circle around current vehicle */}
        <Circle
          center={currentLocation}
          radius={250}
          pathOptions={{
            color: hasDeviation ? "#EF4444" : "#F59E0B",
            fillColor: hasDeviation ? "#EF4444" : "#FBBF24",
            fillOpacity: 0.15,
            weight: 2,
            dashArray: "4, 6",
          }}
        />

        {/* Route Polyline */}
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: hasDeviation ? "#EF4444" : "#F59E0B",
            weight: 5,
            opacity: 0.9,
            dashArray: hasDeviation ? "6, 6" : null,
          }}
        />

        {/* Pickup Pin */}
        <Marker position={pickup} icon={pickupIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800 p-1">
              🟢 Pickup: Times Square Broadway
            </div>
          </Popup>
        </Marker>

        {/* Dropoff Pin */}
        <Marker position={dropoff} icon={dropoffIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800 p-1">
              🔴 Dropoff: Grand Central Terminal
            </div>
          </Popup>
        </Marker>

        {/* Live Taxi Moving Marker */}
        <Marker position={currentLocation} icon={taxiIcon}>
          <Popup>
            <div className="text-xs font-bold text-slate-800 p-1">
              🚕 Taxi TX-901 (Marcus Vance)
              <br />
              Speed: 38 km/h • Security: 99.8%
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Route Anomaly Warning Overlay */}
      {hasDeviation && (
        <div className="absolute top-3 left-3 right-3 z-[400] p-2.5 rounded-2xl bg-red-950/90 border border-red-500/60 backdrop-blur-xl flex items-center gap-2.5 shadow-xl animate-bounce">
          <div className="p-1.5 rounded-xl bg-red-500/20 text-red-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black text-red-200">ROUTE DEVIATION DETECTED</p>
            <p className="text-[10px] text-red-300">Vehicle diverged 450m from safe GPS corridor</p>
          </div>
        </div>
      )}

      {/* Recenter Button */}
      <button
        onClick={() => {
          if (mapRef.current) {
            mapRef.current.flyTo(currentLocation, 16, { duration: 1 });
          }
        }}
        className="absolute bottom-4 right-4 z-[400] p-2.5 rounded-2xl bg-[#14120B]/90 hover:bg-[#201C0F] border border-yellow-500/30 text-yellow-400 shadow-xl backdrop-blur-xl active:scale-95 transition-all"
        title="Recenter GPS"
      >
        <Crosshair className="w-5 h-5" />
      </button>
    </div>
  );
}
