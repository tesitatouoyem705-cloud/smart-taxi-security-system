import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Car,
  ShieldAlert,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  EyeOff,
  Radio,
  Satellite,
  Compass,
  Zap,
  PhoneCall,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCw,
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Activity,
  Video,
  Camera,
  Tv,
  Scan,
  Download,
  Share2,
  X
} from "lucide-react";

// Metropolitan God's Eye CCTV Street & Traffic Camera Networks
const US_CAMERAS = [
  {
    id: "CAM-US-01",
    name: "Times Square & Broadway 42nd St",
    lat: 40.7580,
    lng: -73.9855,
    status: "ONLINE 4K",
    type: "High-Density AI Street Matrix",
    fps: 60,
    bitrate: "8.5 Mbps",
    resolution: "4K UHD 60fps",
    aiScan: "PEDESTRIAN & VEHICLE RETICLE LOCKED",
    city: "New York, USA",
    zone: "Midtown West"
  },
  {
    id: "CAM-US-02",
    name: "5th Avenue & Central Park South",
    lat: 40.7648,
    lng: -73.9735,
    status: "ONLINE 4K",
    type: "360° PTZ Diplomatic Recon",
    fps: 30,
    bitrate: "6.2 Mbps",
    resolution: "4K HDR",
    aiScan: "FACIAL & VIP CONVOY TELEMETRY",
    city: "New York, USA",
    zone: "Central Park South"
  },
  {
    id: "CAM-US-03",
    name: "Grand Central Terminal & Park Ave",
    lat: 40.7527,
    lng: -73.9772,
    status: "ONLINE 4K",
    type: "Rapid Transit AI Sensor Array",
    fps: 60,
    bitrate: "7.8 Mbps",
    resolution: "1080p 60fps",
    aiScan: "EMERGENCY DISPATCH CORRIDOR SECURE",
    city: "New York, USA",
    zone: "Midtown East"
  },
  {
    id: "CAM-US-04",
    name: "Brooklyn Bridge & FDR Drive",
    lat: 40.7128,
    lng: -73.9969,
    status: "ONLINE 4K",
    type: "High-Speed Optical Radar Tracker",
    fps: 60,
    bitrate: "9.2 Mbps",
    resolution: "4K 60fps",
    aiScan: "SPEED DETECTION & RADAR INTERCEPTOR",
    city: "New York, USA",
    zone: "Lower Manhattan"
  },
  {
    id: "CAM-US-05",
    name: "Columbus Circle & 8th Avenue",
    lat: 40.7681,
    lng: -73.9819,
    status: "ONLINE 4K",
    type: "Rotational Panoramic Dome",
    fps: 30,
    bitrate: "5.5 Mbps",
    resolution: "4K Night Vision",
    aiScan: "PERIMETER SCAN: ALL LANES CLEAR",
    city: "New York, USA",
    zone: "Upper West Side"
  },
  {
    id: "CAM-US-06",
    name: "Wall Street & Broadway Financial Grid",
    lat: 40.7071,
    lng: -74.0110,
    status: "ONLINE 4K",
    type: "Dual Thermal & Optical Armor Matrix",
    fps: 30,
    bitrate: "6.8 Mbps",
    resolution: "4K FLIR Dual-Spectrum",
    aiScan: "THERMAL VEHICLE SIGNATURES VERIFIED",
    city: "New York, USA",
    zone: "Financial District"
  }
];

const CAMEROON_CAMERAS = [
  {
    id: "CCTV-237-01",
    name: "Poste Centrale & Av. Kennedy Core",
    lat: 3.8667,
    lng: 11.5167,
    status: "ONLINE",
    type: "360° PTZ Traffic Recon",
    fps: 30,
    bitrate: "4.8 Mbps",
    resolution: "4K Ultra HD",
    aiScan: "PLATE & CROWD SCANNER ACTIVE",
    city: "Yaoundé, Cameroon",
    zone: "Centre Commercial"
  },
  {
    id: "CCTV-237-02",
    name: "Rond-Point Nlongkak Transit Hub",
    lat: 3.8820,
    lng: 11.5210,
    status: "ONLINE",
    type: "AI Threat & Collision Scanner",
    fps: 60,
    bitrate: "6.2 Mbps",
    resolution: "1080p 60fps",
    aiScan: "FLEET INTERCEPTOR LOCKED",
    city: "Yaoundé, Cameroon",
    zone: "Nlongkak"
  },
  {
    id: "CCTV-237-03",
    name: "Carrefour Bastos Security Sector",
    lat: 3.8910,
    lng: 11.5130,
    status: "ONLINE",
    type: "Diplomatic Sector Night Vision",
    fps: 30,
    bitrate: "3.5 Mbps",
    resolution: "1080p IR",
    aiScan: "THERMAL SPECTRUM ACTIVE",
    city: "Yaoundé, Cameroon",
    zone: "Bastos"
  },
  {
    id: "CCTV-237-04",
    name: "Stade Omnisports Mfandena Arterial",
    lat: 3.8780,
    lng: 11.5360,
    status: "ONLINE",
    type: "Wide-Angle Urban Matrix",
    fps: 30,
    bitrate: "4.0 Mbps",
    resolution: "4K HDR",
    aiScan: "TRANSIT GRID SECURE",
    city: "Yaoundé, Cameroon",
    zone: "Mfandena"
  },
  {
    id: "CCTV-237-05",
    name: "Carrefour Biyem-Assi Safety Grid",
    lat: 3.8380,
    lng: 11.4870,
    status: "ONLINE",
    type: "High-Speed Fleet Scanner",
    fps: 60,
    bitrate: "5.5 Mbps",
    resolution: "4K 60fps",
    aiScan: "HIGH SPEED RECOGNITION OK",
    city: "Yaoundé, Cameroon",
    zone: "Biyem-Assi"
  }
];

// High-Tech Animated Live Surveillance Video Canvas
function LiveSurveillanceCanvas({ camera, filter, zoom, pan, audioListening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const vehicles = [
      { id: "NYC-7842-TX", type: "TAXI", x: 40, y: 175, speed: 2.3, color: "#FFB800", model: "Camry Hybrid", width: 68, height: 32 },
      { id: "NYC-4319-TX", type: "TAXI", x: 240, y: 130, speed: 2.8, color: "#FFD700", model: "Tesla Model Y", width: 72, height: 34 },
      { id: "NYPD-409", type: "POLICE", x: 420, y: 215, speed: 3.3, color: "#1E3A8A", model: "Interceptor", width: 75, height: 34 },
      { id: "US-FED-88", type: "SUV", x: 130, y: 80, speed: 1.9, color: "#0F172A", model: "Suburban Armor", width: 78, height: 36 },
      { id: "NYC-5563", type: "SEDAN", x: 340, y: 115, speed: 2.1, color: "#94A3B8", model: "Ioniq 5 Safety", width: 66, height: 30 },
    ];

    const pedestrians = [
      { x: 30, y: 265, speed: 0.6, dir: 1 },
      { x: 180, y: 275, speed: 0.8, dir: 1 },
      { x: 320, y: 40, speed: 0.7, dir: -1 },
      { x: 490, y: 35, speed: 0.5, dir: -1 },
    ];

    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Apply Zoom & Pan
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2 + (pan?.x || 0), -h / 2 + (pan?.y || 0));

      // 1. Street Asphalt Background
      if (filter === "nv") {
        ctx.fillStyle = "#011c0f";
      } else if (filter === "thermal") {
        ctx.fillStyle = "#160b33";
      } else {
        ctx.fillStyle = "#0a0c16";
      }
      ctx.fillRect(0, 0, w, h);

      // Road Surface
      const roadY = 60;
      const roadH = 195;
      if (filter === "nv") {
        ctx.fillStyle = "#032915";
      } else if (filter === "thermal") {
        ctx.fillStyle = "#1e1045";
      } else {
        ctx.fillStyle = "#131722";
      }
      ctx.fillRect(0, roadY, w, roadH);

      // Lane Dashes
      ctx.lineWidth = 2;
      ctx.setLineDash([22, 16]);
      ctx.strokeStyle = filter === "nv" ? "#10b981" : filter === "thermal" ? "#ec4899" : "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.moveTo(0, roadY + roadH / 3);
      ctx.lineTo(w, roadY + roadH / 3);
      ctx.moveTo(0, roadY + (roadH / 3) * 2);
      ctx.lineTo(w, roadY + (roadH / 3) * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosswalk Stripes
      ctx.fillStyle = filter === "nv" ? "rgba(16,185,129,0.3)" : filter === "thermal" ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.25)";
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(w - 110, roadY + i * 27 + 5, 28, 15);
      }

      // Sidewalks
      ctx.fillStyle = filter === "nv" ? "#04331a" : filter === "thermal" ? "#2a155c" : "#1a202c";
      ctx.fillRect(0, 0, w, roadY);
      ctx.fillRect(0, roadY + roadH, w, h - (roadY + roadH));

      // Neon Billboard Glow (Times Square / 5th Ave)
      if (filter === "normal") {
        ctx.fillStyle = "rgba(0, 212, 255, 0.15)";
        ctx.fillRect(40, 5, 90, 45);
        ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
        ctx.fillRect(210, 5, 120, 45);
        ctx.fillStyle = "rgba(234, 179, 8, 0.15)";
        ctx.fillRect(420, 5, 90, 45);
      }

      // 2. Pedestrians
      pedestrians.forEach((p) => {
        p.x += p.speed * p.dir;
        if (p.x > w + 20) p.x = -20;
        if (p.x < -20) p.x = w + 20;

        if (filter === "nv") {
          ctx.fillStyle = "#34d399";
        } else if (filter === "thermal") {
          ctx.fillStyle = "#fb923c";
        } else {
          ctx.fillStyle = "#93c5fd";
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = filter === "nv" ? "#10b981" : filter === "thermal" ? "#f43f5e" : "#00d4ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 5, p.y - 7, 10, 15);
      });

      // 3. Vehicles
      vehicles.forEach((v) => {
        v.x += v.speed;
        if (v.x > w + 90) v.x = -110;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(v.x + 2, v.y + 4, v.width, v.height);

        // Body
        if (filter === "nv") {
          ctx.fillStyle = "#064e3b";
        } else if (filter === "thermal") {
          ctx.fillStyle = "#ea580c";
        } else {
          ctx.fillStyle = v.color;
        }
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(v.x, v.y, v.width, v.height, 5);
        } else {
          ctx.rect(v.x, v.y, v.width, v.height);
        }
        ctx.fill();

        // Windshield
        ctx.fillStyle = filter === "nv" ? "#022c15" : filter === "thermal" ? "#312e81" : "rgba(0,0,0,0.7)";
        ctx.fillRect(v.x + v.width * 0.55, v.y + 3, v.width * 0.22, v.height - 6);

        // Headlights
        ctx.fillStyle = filter === "nv" ? "#6ee7b7" : filter === "thermal" ? "#ffffff" : "#fef08a";
        ctx.fillRect(v.x + v.width - 2, v.y + 3, 2, 6);
        ctx.fillRect(v.x + v.width - 2, v.y + v.height - 9, 2, 6);

        // Headlight Beams
        if (filter === "normal") {
          const grad = ctx.createLinearGradient(v.x + v.width, v.y, v.x + v.width + 60, v.y);
          grad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
          grad.addColorStop(1, "rgba(254, 240, 138, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(v.x + v.width, v.y + 3);
          ctx.lineTo(v.x + v.width + 55, v.y - 10);
          ctx.lineTo(v.x + v.width + 55, v.y + v.height + 10);
          ctx.lineTo(v.x + v.width, v.y + v.height - 3);
          ctx.closePath();
          ctx.fill();
        }

        // Taillights
        ctx.fillStyle = filter === "nv" ? "#047857" : filter === "thermal" ? "#f43f5e" : "#ef4444";
        ctx.fillRect(v.x, v.y + 3, 2, 6);
        ctx.fillRect(v.x, v.y + v.height - 9, 2, 6);

        // Police flashing emergency strobes
        if (v.type === "POLICE") {
          const isRed = Math.floor(frame / 6) % 2 === 0;
          ctx.fillStyle = isRed ? "#ef4444" : "#3b82f6";
          ctx.fillRect(v.x + v.width / 2 - 4, v.y + v.height / 2 - 4, 8, 8);
        }

        // Taxi Roof Sign
        if (v.type === "TAXI" && filter === "normal") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(v.x + v.width * 0.38, v.y + v.height / 2 - 3, 14, 6);
        }

        // 4. AI Reticle & Bounding Box
        const boxColor = filter === "nv" ? "#10b981" : filter === "thermal" ? "#fbbf24" : "#00d4ff";
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1.6;

        const bx = v.x - 5;
        const by = v.y - 5;
        const bw = v.width + 10;
        const bh = v.height + 10;
        const corner = 7;

        ctx.beginPath();
        ctx.moveTo(bx, by + corner); ctx.lineTo(bx, by); ctx.lineTo(bx + corner, by);
        ctx.moveTo(bx + bw - corner, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + corner);
        ctx.moveTo(bx, by + bh - corner); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + corner, by + bh);
        ctx.moveTo(bx + bw - corner, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - corner);
        ctx.stroke();

        ctx.fillStyle = "rgba(9, 9, 24, 0.9)";
        ctx.fillRect(bx, by - 15, 125, 13);
        ctx.fillStyle = boxColor;
        ctx.font = "bold 8px monospace";
        ctx.fillText(`[${v.id}] ${Math.round(v.speed * 16)} MPH`, bx + 3, by - 5);
      });

      // 5. Tactical Center Crosshair
      ctx.strokeStyle = filter === "nv" ? "rgba(16,185,129,0.4)" : filter === "thermal" ? "rgba(251,191,36,0.4)" : "rgba(0,212,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2); ctx.lineTo(w / 2 + 20, h / 2);
      ctx.moveTo(w / 2, h / 2 - 20); ctx.lineTo(w / 2, h / 2 + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [camera, filter, zoom, pan]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-cover"
    />
  );
}

export default function LiveMap({
  taxis = [],
  activeTrip = null,
  activeIncident = null,
  interactivePin = false,
  selectedLocation = null,
  onLocationSelect = null,
  height = "560px",
  zoom = 14,
  initialGodsEye = true,
  onTaxiSelect = null,
  highlightedTaxiId = null
}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [godsEyeMode, setGodsEyeMode] = useState(initialGodsEye);
  const [mapStyle, setMapStyle] = useState("satellite"); // 'satellite', 'dark', 'street'
  const [radarActive, setRadarActive] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [autoPatrol, setAutoPatrol] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState(null);
  const [activeRegion, setActiveRegion] = useState("CAMEROON"); // 'CAMEROON' | 'US'
  
  // Auto-open US Camera by default as requested
  const [activeCameraFeed, setActiveCameraFeed] = useState({
    ...US_CAMERAS[0],
    feedTitle: `${US_CAMERAS[0].name} (${US_CAMERAS[0].id})`,
    feedSubtitle: `${US_CAMERAS[0].type} • ${US_CAMERAS[0].resolution} • ${US_CAMERAS[0].fps} FPS`,
    feedType: "CITY_CCTV"
  });
  
  const [cameraFilter, setCameraFilter] = useState("normal"); // 'normal', 'nv' (night vision), 'thermal'
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraPan, setCameraPan] = useState({ x: 0, y: 0 });
  const [audioListening, setAudioListening] = useState(false);
  const [interceptInfo, setInterceptInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toUTCString().slice(17, 25) + " UTC");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userRealLocation, setUserRealLocation] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserRealLocation(coords);
          if (leafletMapRef.current && activeRegion === "CAMEROON") {
            leafletMapRef.current.setView(coords, 15);
          }
        },
        (err) => {
          console.warn("[LiveMap] Geolocation not acquired:", err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [activeRegion]);

  const mapContainerRef = useRef(null);
  const wrapperRef = useRef(null);
  const leafletMapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const cameraMarkersRef = useRef([]);
  const interceptLineRef = useRef(null);
  const autoPatrolTimerRef = useRef(null);
  const leafletLibRef = useRef(null);

  // Active cameras based on region
  const activeCameras = activeRegion === "US" ? US_CAMERAS : CAMEROON_CAMERAS;

  const defaultCenter = activeRegion === "US" ? [40.7580, -73.9855] : [3.8480, 11.5021];
  const centerLat = activeTrip?.currentLatitude || selectedLocation?.lat || (taxis.length > 0 && taxis[0].currentLatitude ? taxis[0].currentLatitude : defaultCenter[0]);
  const centerLng = activeTrip?.currentLongitude || selectedLocation?.lng || (taxis.length > 0 && taxis[0].currentLongitude ? taxis[0].currentLongitude : defaultCenter[1]);

  // Live UTC Clock for tactical HUD
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString().slice(17, 25) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update selectedTaxi if parent passes highlightedTaxiId
  useEffect(() => {
    if (highlightedTaxiId && taxis.length > 0) {
      const match = taxis.find((t) => String(t.id) === String(highlightedTaxiId) || t.vehicleNumber === highlightedTaxiId);
      if (match) {
        handleLockOnTaxi(match);
      }
    }
  }, [highlightedTaxiId, taxis]);

  // Tile layer URL resolver
  const getTileConfig = (style) => {
    switch (style) {
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: "Esri World Imagery",
          maxZoom: 19
        };
      case "street":
        return {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution: "CartoDB Voyager",
          maxZoom: 19,
          subdomains: "abcd"
        };
      case "dark":
      default:
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          attribution: "CartoDB Dark Matter",
          maxZoom: 19,
          subdomains: "abcd"
        };
    }
  };

  // Change Map Style dynamically
  const switchMapStyle = useCallback((newStyle) => {
    setMapStyle(newStyle);
    if (!leafletMapRef.current || !leafletLibRef.current) return;
    const L = leafletLibRef.current;

    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(newStyle);
    tileLayerRef.current = L.tileLayer(config.url, {
      maxZoom: config.maxZoom || 19,
      subdomains: config.subdomains || "abcd"
    }).addTo(leafletMapRef.current);
  }, []);

  // Initialize Map
  useEffect(() => {
    let mapInstance = null;

    const initializeLeafletMap = async () => {
      try {
        const L = (await import("leaflet")).default;
        leafletLibRef.current = L;

        if (!mapContainerRef.current) return;

        // Clean up previous instance if exists
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        mapInstance = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: currentZoom,
          zoomControl: false,
          attributionControl: false
        });

        // Add initial tile layer
        const config = getTileConfig(mapStyle);
        tileLayerRef.current = L.tileLayer(config.url, {
          maxZoom: config.maxZoom || 19,
          subdomains: config.subdomains || "abcd"
        }).addTo(mapInstance);

        leafletMapRef.current = mapInstance;
        setMapLoaded(true);
      } catch (err) {
        console.warn("Leaflet initialization fallback:", err.message);
        setMapLoaded(false);
      }
    };

    initializeLeafletMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Render Markers, CCTV Cameras, and Features
  useEffect(() => {
    if (!leafletMapRef.current || !leafletLibRef.current) return;
    const L = leafletLibRef.current;
    const map = leafletMapRef.current;

    // Clear existing markers & lines
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    cameraMarkersRef.current.forEach((m) => map.removeLayer(m));
    cameraMarkersRef.current = [];

    if (interceptLineRef.current) {
      map.removeLayer(interceptLineRef.current);
      interceptLineRef.current = null;
    }

    // 1. Add God's Eye CCTV Street & Traffic Cameras to the Map
    if (showCameras) {
      activeCameras.forEach((cam) => {
        const isCamActive = activeCameraFeed?.id === cam.id;

        const cctvIconHtml = `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <!-- Pulsing CCTV Lens Ring -->
            <div style="
              position: absolute; width: 100%; height: 100%; border-radius: 50%;
              background: ${isCamActive ? "rgba(0, 212, 255, 0.6)" : "rgba(16, 185, 129, 0.25)"};
              animation: ${isCamActive ? "pingSlow 1.5s infinite" : "none"};
            "></div>

            <!-- Camera Core Circle -->
            <div style="
              width: 34px; height: 34px; border-radius: 50%;
              background: ${isCamActive ? "linear-gradient(135deg, #00D4FF 0%, #6C63FF 100%)" : "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"};
              border: 2px solid ${isCamActive ? "#00D4FF" : "#10B981"};
              box-shadow: 0 0 14px ${isCamActive ? "rgba(0, 212, 255, 0.9)" : "rgba(16, 185, 129, 0.6)"};
              display: flex; align-items: center; justify-content: center; color: ${isCamActive ? "#000000" : "#10B981"};
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>

            <!-- Camera ID Label -->
            <div style="
              position: absolute; bottom: -16px; white-space: nowrap;
              background: rgba(10, 10, 24, 0.95); border: 1px solid ${isCamActive ? "#00D4FF" : "rgba(16, 185, 129, 0.4)"};
              color: ${isCamActive ? "#00D4FF" : "#10B981"}; font-size: 8px; font-weight: 900; font-family: monospace;
              padding: 1px 5px; border-radius: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.8);
            ">
              ${cam.id}
            </div>
          </div>
        `;

        const cctvIcon = L.divIcon({
          className: `cctv-cam-${cam.id}`,
          html: cctvIconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const camMarker = L.marker([cam.lat, cam.lng], { icon: cctvIcon })
          .addTo(map)
          .on("click", () => {
            setActiveCameraFeed({
              ...cam,
              feedTitle: `${cam.name} (${cam.id})`,
              feedSubtitle: `${cam.type} • ${cam.resolution} • ${cam.fps} FPS`,
              feedType: "CITY_CCTV"
            });
          });

        cameraMarkersRef.current.push(camMarker);
      });
    }

    // 2. Add Fleet Taxi Markers with God's Eye Beacon & Camera Button
    if (taxis && taxis.length > 0 && !activeTrip) {
      taxis.forEach((taxi) => {
        if (!taxi.currentLatitude || !taxi.currentLongitude) return;

        const isSOS = taxi.status === "EMERGENCY" || taxi.status === "SOS";
        const isSelected = selectedTaxi && String(selectedTaxi.id) === String(taxi.id);

        const taxiMarkerHtml = `
          <div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <!-- Radar Beacon Rings -->
            <div style="
              position: absolute; width: 100%; height: 100%; border-radius: 50%;
              background: ${isSOS ? "rgba(239, 68, 68, 0.45)" : isSelected ? "rgba(0, 212, 255, 0.5)" : "rgba(245, 197, 24, 0.25)"};
              animation: ${isSOS ? "pingSlow 1.2s infinite" : isSelected ? "godEyePulse 1.8s infinite" : "none"};
            "></div>

            <!-- Target Lock-on Reticle Box if Selected -->
            ${
              isSelected
                ? `
                <div style="
                  position: absolute; width: 56px; height: 56px;
                  border: 2px dashed #00D4FF; border-radius: 12px;
                  animation: targetReticle 8s linear infinite; pointer-events: none;
                "></div>
              `
                : ""
            }

            <!-- Tactical Beacon Core -->
            <div style="
              width: 36px; height: 36px; border-radius: 50%;
              background: ${
                isSOS
                  ? "linear-gradient(135deg, #EF4444 0%, #991B1B 100%)"
                  : isSelected
                  ? "linear-gradient(135deg, #00D4FF 0%, #6C63FF 100%)"
                  : "linear-gradient(135deg, #F5C518 0%, #D97706 100%)"
              };
              border: 2px solid ${isSelected ? "#00D4FF" : isSOS ? "#FF6B6B" : "#FFFFFF"};
              box-shadow: 0 0 16px ${isSOS ? "rgba(239, 68, 68, 0.8)" : isSelected ? "rgba(0, 212, 255, 0.8)" : "rgba(245, 197, 24, 0.5)"};
              display: flex; align-items: center; justify-content: center; color: ${isSOS || isSelected ? "#FFFFFF" : "#0A0A1A"};
              font-weight: 800; font-size: 10px;
            ">
              ${
                isSOS
                  ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
                  : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`
              }
            </div>

            <!-- In-Vehicle Dashcam Indicator Badge -->
            <div style="
              position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%;
              background: #00D4FF; border: 1.5px solid #0A0A1C; display: flex; align-items: center; justify-content: center;
              box-shadow: 0 0 8px #00D4FF; color: black; font-size: 9px;
            " title="Live In-Cabin Camera Stream Online">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>

            <!-- Unit Tag Label -->
            <div style="
              position: absolute; bottom: -16px; white-space: nowrap;
              background: rgba(10, 10, 24, 0.92); border: 1px solid ${isSelected ? "#00D4FF" : "rgba(255,255,255,0.2)"};
              color: ${isSelected ? "#00D4FF" : "#FFFFFF"}; font-size: 9px; font-weight: 800;
              padding: 1px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            ">
              ${taxi.vehicleNumber}
            </div>
          </div>
        `;

        const customTaxiIcon = L.divIcon({
          className: `taxi-beacon-${taxi.id}`,
          html: taxiMarkerHtml,
          iconSize: [50, 50],
          iconAnchor: [25, 25]
        });

        const marker = L.marker([taxi.currentLatitude, taxi.currentLongitude], { icon: customTaxiIcon })
          .addTo(map)
          .on("click", () => {
            handleLockOnTaxi(taxi);
          });

        markersRef.current.push(marker);
      });
    }

    // 3. Add Active Trip Markers & Polyline
    if (activeTrip) {
      const startCoords = [activeTrip.startLatitude || 3.8820, activeTrip.startLongitude || 11.5210];
      const currentCoords = [activeTrip.currentLatitude || 3.8750, activeTrip.currentLongitude || 11.5190];
      const endCoords = [activeTrip.dropoffLatitude || 3.8910, activeTrip.dropoffLongitude || 11.5130];

      const pickupIcon = L.divIcon({
        className: "custom-pickup-marker",
        html: `
          <div style="
            width: 32px; height: 32px; background: #10B981; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); border: 2px solid white;
            color: white; font-weight: bold; font-size: 11px;
          ">A</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const dropoffIcon = L.divIcon({
        className: "custom-dropoff-marker",
        html: `
          <div style="
            width: 32px; height: 32px; background: #EF4444; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.8); border: 2px solid white;
            color: white; font-weight: bold; font-size: 11px;
          ">B</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const activeTaxiIcon = L.divIcon({
        className: "custom-active-taxi",
        html: `
          <div style="
            position: relative; width: 44px; height: 44px;
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="
              position: absolute; width: 100%; height: 100%; border-radius: 50%;
              background: rgba(0, 212, 255, 0.35); animation: pingSlow 2s infinite;
            "></div>
            <div style="
              width: 38px; height: 38px; border-radius: 50%;
              background: linear-gradient(135deg, #00D4FF 0%, #6C63FF 100%);
              border: 2px solid #FFFFFF; box-shadow: 0 0 20px #00D4FF;
              display: flex; align-items: center; justify-content: center; color: white;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const m1 = L.marker(startCoords, { icon: pickupIcon }).addTo(map).bindPopup("<b>Pickup:</b> " + (activeTrip.pickupAddress || "Pickup Point"));
      const m2 = L.marker(currentCoords, { icon: activeTaxiIcon }).addTo(map).bindPopup("<b>Active Ride:</b> " + (activeTrip.driverName || "Taxi"));
      const m3 = L.marker(endCoords, { icon: dropoffIcon }).addTo(map).bindPopup("<b>Dropoff:</b> " + (activeTrip.dropoffAddress || "Destination"));

      markersRef.current.push(m1, m2, m3);

      const routeLine = L.polyline([startCoords, currentCoords, endCoords], {
        color: "#00D4FF",
        weight: 5,
        opacity: 0.9,
        dashArray: "8, 8"
      }).addTo(map);
      markersRef.current.push(routeLine);

      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    }

    // 4. Add User Real Live Position Marker
    if (userRealLocation) {
      const userMarkerHtml = `
        <div style="position: relative; width: 60px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="
            position: absolute; bottom: -18px; white-space: nowrap;
            background: #0A0A1C; border: 1.5px solid #00D4FF;
            color: #00D4FF; font-size: 8.5px; font-weight: 900;
            padding: 1px 6px; border-radius: 6px; box-shadow: 0 0 10px rgba(0,212,255,0.6);
            letter-spacing: 0.4px;
          ">
            YOU (LIVE GPS)
          </div>
          <div style="
            position: absolute; width: 36px; height: 36px; border-radius: 50%;
            background: rgba(0, 212, 255, 0.25); border: 1.8px solid rgba(0, 212, 255, 0.8);
            animation: pingSlow 2s infinite;
          "></div>
          <div style="
            width: 18px; height: 18px; border-radius: 50%;
            background: #00D4FF; border: 2.5px solid #FFFFFF;
            box-shadow: 0 0 12px #00D4FF;
          "></div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: userMarkerHtml,
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });

      const userMarker = L.marker(userRealLocation, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup("<b>Your Live Position</b><br/>GPS Accuracy Verified");

      markersRef.current.push(userMarker);
    }

    // 5. Draw Interception Line if calculated
    if (interceptInfo && interceptInfo.from && interceptInfo.to) {
      const line = L.polyline([interceptInfo.from, interceptInfo.to], {
        color: "#EF4444",
        weight: 4,
        opacity: 0.95,
        dashArray: "6, 10"
      }).addTo(map);
      interceptLineRef.current = line;
      markersRef.current.push(line);
    }
  }, [taxis, activeTrip, selectedTaxi, interceptInfo, showCameras, activeCameraFeed]);

  // Lock-on Target Camera
  const handleLockOnTaxi = (taxi) => {
    setSelectedTaxi(taxi);
    setInterceptInfo(null);
    if (onTaxiSelect) onTaxiSelect(taxi);

    if (leafletMapRef.current && taxi.currentLatitude && taxi.currentLongitude) {
      leafletMapRef.current.flyTo([taxi.currentLatitude, taxi.currentLongitude], 16, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  // Open In-Cabin or Dashcam Feed for a Taxi
  const handleOpenTaxiCam = (taxi, camAngle = "IN_CABIN") => {
    setActiveCameraFeed({
      id: `CAM-${taxi.vehicleNumber}-${camAngle}`,
      name: `${taxi.vehicleNumber} • ${camAngle === "IN_CABIN" ? "Dual In-Cabin Passenger & Driver Cam" : "Road Vision AI Front Cam"}`,
      feedTitle: `${taxi.vehicleNumber} Security Dashcam`,
      feedSubtitle: `${taxi.model} • Driver: ${taxi.driverName || "Marcus Vance"} • GPS: ${taxi.currentLatitude?.toFixed(4)}, ${taxi.currentLongitude?.toFixed(4)}`,
      feedType: "TAXI_DASHCAM",
      status: "STREAMING (ENCRYPTED)",
      fps: 30,
      bitrate: "4.2 Mbps",
      resolution: "1080p 60fps Night Vision",
      aiScan: camAngle === "IN_CABIN" ? "DRIVER & PASSENGER IDENTIFIED" : "LANE ASSIST & PLATE SCAN ACTIVE",
      taxi
    });
  };

  // Intercept Protocol: Find nearest patrol unit to intercept target
  const handleCalculateIntercept = () => {
    if (!selectedTaxi || taxis.length < 2) return;

    let closest = null;
    let minDist = Infinity;

    const lat1 = selectedTaxi.currentLatitude;
    const lon1 = selectedTaxi.currentLongitude;

    taxis.forEach((t) => {
      if (String(t.id) === String(selectedTaxi.id)) return;
      if (!t.currentLatitude || !t.currentLongitude) return;

      const dLat = (t.currentLatitude - lat1) * 111;
      const dLon = (t.currentLongitude - lon1) * 85;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);

      if (dist < minDist) {
        minDist = dist;
        closest = t;
      }
    });

    if (closest) {
      const etaMinutes = Math.max(1, Math.round((minDist / 45) * 60));
      setInterceptInfo({
        from: [closest.currentLatitude, closest.currentLongitude],
        to: [selectedTaxi.currentLatitude, selectedTaxi.currentLongitude],
        interceptUnit: closest,
        distanceKm: minDist.toFixed(2),
        etaMinutes
      });

      if (leafletMapRef.current) {
        leafletMapRef.current.fitBounds([
          [closest.currentLatitude, closest.currentLongitude],
          [selectedTaxi.currentLatitude, selectedTaxi.currentLongitude]
        ], { padding: [80, 80] });
      }
    }
  };

  // Auto-Patrol Cinematic Camera Cycle
  useEffect(() => {
    if (!autoPatrol || taxis.length === 0) {
      if (autoPatrolTimerRef.current) clearInterval(autoPatrolTimerRef.current);
      return;
    }

    let currentIndex = 0;
    autoPatrolTimerRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % taxis.length;
      const nextTaxi = taxis[currentIndex];
      if (nextTaxi) {
        handleLockOnTaxi(nextTaxi);
      }
    }, 7000);

    return () => {
      if (autoPatrolTimerRef.current) clearInterval(autoPatrolTimerRef.current);
    };
  }, [autoPatrol, taxis]);

  // Recenter Full Fleet View
  const handleFitAllFleet = () => {
    setSelectedTaxi(null);
    setInterceptInfo(null);
    if (!leafletMapRef.current) return;

    if (taxis.length > 0) {
      const validPoints = taxis
        .filter((t) => t.currentLatitude && t.currentLongitude)
        .map((t) => [t.currentLatitude, t.currentLongitude]);

      if (validPoints.length > 0) {
        leafletMapRef.current.fitBounds(validPoints, { padding: [60, 60] });
        return;
      }
    }

    leafletMapRef.current.setView([centerLat, centerLng], 14);
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl glass-card transition-all ${
        isFullscreen ? "h-screen w-screen rounded-none z-50 fixed inset-0" : ""
      }`}
      style={{ height: isFullscreen ? "100vh" : height }}
    >
      {/* Tactical Grid Background Overlay in God's Eye Mode */}
      {godsEyeMode && (
        <div className="absolute inset-0 pointer-events-none z-20 tactical-grid-overlay opacity-40" />
      )}

      {/* Sweeping Tactical Radar Cone Overlay */}
      {godsEyeMode && radarActive && (
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
          <div className="relative w-[800px] h-[800px] rounded-full border border-cyan-500/20">
            {/* Concentric Range Rings */}
            <div className="absolute inset-[15%] rounded-full border border-cyan-500/15" />
            <div className="absolute inset-[30%] rounded-full border border-cyan-500/20" />
            <div className="absolute inset-[45%] rounded-full border border-cyan-500/25" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00D4FF]" />
            </div>
            {/* Rotating Radar Sweep Gradient */}
            <div
              className="absolute inset-0 rounded-full animate-radar-sweep opacity-30"
              style={{
                background: "conic-gradient(from 0deg at 50% 50%, rgba(0, 212, 255, 0.45) 0deg, rgba(0, 212, 255, 0) 65deg, transparent 360deg)"
              }}
            />
          </div>
        </div>
      )}

      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* ══════════════════════════════════════════════════════
          TOP HUD: GOD'S EYE COMMAND BAR
          ══════════════════════════════════════════════════════ */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Tactical Satellite & Uplink Telemetry */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#080816]/95 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400/40 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-white tracking-widest uppercase flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-[#00D4FF] animate-pulse" />
                GOD'S EYE SURVEILLANCE & CAMERAS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/40">
                18 SATS • 5 CCTV
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>{currentTime}</span>
              <span>•</span>
              <span className="text-emerald-400">SURVEILLANCE CAMERAS ARMED</span>
              <span>•</span>
              <span className="text-purple-300 font-bold">{taxis.length} TAXIS WITH DASHCAMS</span>
            </div>
          </div>
        </div>

        {/* Right: Tactical Map Controls & Layer Selector */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#080816]/95 backdrop-blur-2xl border border-white/10 shadow-2xl">
          {/* Map Layer Switcher: Satellite / Dark / Street */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/5">
            <button
              onClick={() => switchMapStyle("satellite")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                mapStyle === "satellite"
                  ? "bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,212,255,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Photorealistic Esri Orbital Satellite"
            >
              <Satellite className="w-3 h-3" /> Satellite
            </button>
            <button
              onClick={() => switchMapStyle("dark")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                mapStyle === "dark"
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(108,99,255,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tactical Cyber Dark Night Ops"
            >
              <Layers className="w-3 h-3" /> Tactical
            </button>
            <button
              onClick={() => switchMapStyle("street")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                mapStyle === "street"
                  ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,197,24,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="CartoDB Street Matrix Recon"
            >
              <Navigation className="w-3 h-3" /> Street
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

          {/* Region Switcher: US / Cameroon */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
            <button
              onClick={() => {
                setActiveRegion("US");
                if (leafletMapRef.current) {
                  leafletMapRef.current.setView([40.7580, -73.9855], 14);
                }
                setActiveCameraFeed({
                  ...US_CAMERAS[0],
                  feedTitle: `${US_CAMERAS[0].name} (${US_CAMERAS[0].id})`,
                  feedSubtitle: `${US_CAMERAS[0].type} • ${US_CAMERAS[0].resolution} • ${US_CAMERAS[0].fps} FPS`,
                  feedType: "CITY_CCTV"
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                activeRegion === "US"
                  ? "bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,212,255,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Switch to United States (New York) Recon Grid"
            >
              🇺🇸 USA (NYC)
            </button>
            <button
              onClick={() => {
                setActiveRegion("CAMEROON");
                if (leafletMapRef.current) {
                  leafletMapRef.current.setView([3.8480, 11.5021], 14);
                }
                setActiveCameraFeed({
                  ...CAMEROON_CAMERAS[0],
                  feedTitle: `${CAMEROON_CAMERAS[0].name} (${CAMEROON_CAMERAS[0].id})`,
                  feedSubtitle: `${CAMEROON_CAMERAS[0].type} • ${CAMEROON_CAMERAS[0].resolution} • ${CAMEROON_CAMERAS[0].fps} FPS`,
                  feedType: "CITY_CCTV"
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                activeRegion === "CAMEROON"
                  ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Switch to Cameroon (Yaoundé) Recon Grid"
            >
              🇨🇲 Cameroon
            </button>
          </div>

          {/* Quick Open US Camera Button */}
          <button
            onClick={() => {
              setActiveRegion("US");
              if (leafletMapRef.current) {
                leafletMapRef.current.setView([40.7580, -73.9855], 14);
              }
              setActiveCameraFeed({
                ...US_CAMERAS[0],
                feedTitle: `${US_CAMERAS[0].name} (${US_CAMERAS[0].id})`,
                feedSubtitle: `${US_CAMERAS[0].type} • ${US_CAMERAS[0].resolution} • ${US_CAMERAS[0].fps} FPS`,
                feedType: "CITY_CCTV"
              });
            }}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/50 hover:bg-[#00D4FF]/35 transition-all flex items-center gap-1.5 shadow-[0_0_14px_rgba(0,212,255,0.4)]"
            title="Open US Times Square 4K Live Camera"
          >
            <Video className="w-3.5 h-3.5 animate-pulse" />
            <span>OPEN US CAM-01</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-0.5" />

          {/* Toggle CCTV Camera Layer */}
          <button
            onClick={() => setShowCameras(!showCameras)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all border flex items-center gap-1.5 ${
              showCameras
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
            }`}
            title="Toggle City CCTV Camera Grid Overlay"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>CCTV ({activeCameras.length})</span>
          </button>

          {/* Toggle Radar Sweep */}
          <button
            onClick={() => setRadarActive(!radarActive)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              radarActive
                ? "bg-cyan-500/20 text-[#00D4FF] border-cyan-500/50 shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
            }`}
            title="Toggle God's Eye Radar Sweep"
          >
            <Radio className={`w-3.5 h-3.5 ${radarActive ? "animate-pulse" : ""}`} />
          </button>

          {/* Toggle Auto-Patrol Camera */}
          <button
            onClick={() => setAutoPatrol(!autoPatrol)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              autoPatrol
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
            }`}
            title="Toggle Drone Auto-Patrol Across Fleet"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoPatrol ? "animate-spin" : ""}`} />
          </button>

          {/* Recenter Full Fleet */}
          <button
            onClick={handleFitAllFleet}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all"
            title="Recenter Camera to Entire Fleet"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#00D4FF]" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/20 transition-all"
            title="Fullscreen God's Eye View"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          LIVE TACTICAL CCTV / DASHCAM VIDEO PLAYER MODAL
          ══════════════════════════════════════════════════════ */}
      {activeCameraFeed && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-3xl bg-[#090918] border border-cyan-500/60 rounded-3xl shadow-[0_0_60px_rgba(0,212,255,0.35)] overflow-hidden flex flex-col">
            {/* Camera Header Bar */}
            <div className="px-5 py-3.5 bg-[#0D0D24] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black text-white font-mono flex items-center gap-1.5 uppercase tracking-wider">
                  <Video className="w-4 h-4 text-[#00D4FF]" />
                  LIVE GOD'S EYE SURVEILLANCE FEED • {activeCameraFeed.id}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/40">
                  {activeCameraFeed.status || "ONLINE 4K"}
                </span>
              </div>
              <button
                onClick={() => setActiveCameraFeed(null)}
                className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Selectors Bar */}
            <div className="px-4 py-2 bg-[#080816] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider whitespace-nowrap pl-1 pr-2">
                SWITCH FEED:
              </span>
              {activeCameras.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => {
                    setActiveCameraFeed({
                      ...cam,
                      feedTitle: `${cam.name} (${cam.id})`,
                      feedSubtitle: `${cam.type} • ${cam.resolution} • ${cam.fps} FPS`,
                      feedType: "CITY_CCTV"
                    });
                    setCameraPan({ x: 0, y: 0 });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${
                    activeCameraFeed.id === cam.id
                      ? "bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-[0_0_10px_rgba(0,212,255,0.6)]"
                      : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cam.id.replace("CCTV-237-", "CMR-")} · {cam.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* LIVE SURVEILLANCE CANVAS VIDEO FEED */}
            <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
              {/* Scanline Effect Overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-10 opacity-30"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, rgba(0, 212, 255, 0.15) 0px, transparent 2px, transparent 4px)"
                }}
              />

              {/* Real-Time Animated Canvas */}
              <LiveSurveillanceCanvas
                camera={activeCameraFeed}
                filter={cameraFilter}
                zoom={cameraZoom}
                pan={cameraPan}
                audioListening={audioListening}
              />

              {/* Top Left Feed HUD */}
              <div className="absolute top-3 left-3 z-20 font-mono text-[10px] text-white/90 bg-black/75 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm pointer-events-none">
                <div className="text-cyan-400 font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  REC ● {activeCameraFeed.id} ({activeCameraFeed.city || "New York, USA"})
                </div>
                <div className="text-emerald-400 font-bold">{currentTime}</div>
                <div className="text-slate-300 text-[9px]">{activeCameraFeed.name} • {activeCameraFeed.fps} FPS</div>
              </div>

              {/* Top Right Bitrate & Status */}
              <div className="absolute top-3 right-3 z-20 font-mono text-[9px] text-white/90 bg-black/75 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm text-right pointer-events-none">
                <div className="text-emerald-400 font-bold">BITRATE: {activeCameraFeed.bitrate || "8.5 Mbps"}</div>
                <div className="text-slate-300">RES: {activeCameraFeed.resolution}</div>
                <div className="text-cyan-300 font-bold">AI SCAN: ACTIVE 99.8%</div>
              </div>

              {/* Live Audio Waveform (When Audio Intercept is active) */}
              {audioListening && (
                <div className="absolute bottom-3 left-3 z-20 flex items-end gap-1 bg-black/75 px-3 py-1.5 rounded-lg border border-emerald-500/40 backdrop-blur-sm">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse mr-1" />
                  <span className="text-[9px] font-mono text-emerald-400 font-bold mr-1">AUDIO INTERCEPT:</span>
                  {[12, 24, 18, 28, 14, 22, 30, 16, 26, 10, 20].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-bounce"
                      style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Right AI Threat Telemetry */}
              <div className="absolute bottom-3 right-3 z-20 font-mono text-[10px] text-white/90 bg-black/75 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm text-right pointer-events-none">
                <div className="text-cyan-300 font-bold">SPECTRUM: {cameraFilter.toUpperCase()}</div>
                <div className="text-emerald-400">THREAT: 0% / SECTOR CLEAR</div>
              </div>
            </div>

            {/* Camera Bottom Controls */}
            <div className="p-4 bg-[#0D0D24] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Spectrum Modes: Normal, Night Vision, Thermal */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-400 px-2 font-bold">SPECTRUM:</span>
                <button
                  onClick={() => setCameraFilter("normal")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    cameraFilter === "normal" ? "bg-cyan-500 text-black font-extrabold shadow-[0_0_10px_rgba(0,212,255,0.5)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Standard 4K
                </button>
                <button
                  onClick={() => setCameraFilter("nv")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    cameraFilter === "nv" ? "bg-emerald-500 text-black font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Night Vision
                </button>
                <button
                  onClick={() => setCameraFilter("thermal")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    cameraFilter === "thermal" ? "bg-amber-400 text-black font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.5)]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Thermal FLIR
                </button>
              </div>

              {/* PTZ Pan & Tilt Controls */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px] font-bold text-slate-300 font-mono">
                <span className="px-1 text-slate-400">PAN:</span>
                <button
                  onClick={() => setCameraPan((p) => ({ ...p, x: p.x + 30 }))}
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-all"
                  title="Pan Camera Left"
                >
                  ◄ L
                </button>
                <button
                  onClick={() => setCameraPan((p) => ({ ...p, y: p.y + 20 }))}
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-all"
                  title="Tilt Camera Up"
                >
                  ▲ U
                </button>
                <button
                  onClick={() => setCameraPan((p) => ({ ...p, y: p.y - 20 }))}
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-all"
                  title="Tilt Camera Down"
                >
                  ▼ D
                </button>
                <button
                  onClick={() => setCameraPan((p) => ({ ...p, x: p.x - 30 }))}
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-all"
                  title="Pan Camera Right"
                >
                  ► R
                </button>
                <button
                  onClick={() => setCameraPan({ x: 0, y: 0 })}
                  className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-400 hover:bg-white/20 transition-all text-[9px]"
                  title="Reset Camera Center"
                >
                  RESET
                </button>
              </div>

              {/* PTZ Zoom Buttons */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5 text-[10px] font-bold text-slate-300 font-mono">
                <span className="px-1.5 text-slate-400">ZOOM:</span>
                {[1, 1.5, 2, 4].map((z) => (
                  <button
                    key={z}
                    onClick={() => setCameraZoom(z)}
                    className={`px-2 py-0.5 rounded ${cameraZoom === z ? "bg-[#00D4FF] text-black font-extrabold shadow-[0_0_8px_rgba(0,212,255,0.6)]" : "hover:text-white"}`}
                  >
                    {z}x
                  </button>
                ))}
              </div>

              {/* Action Buttons: Audio Listen & Relay to Dispatch */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAudioListening(!audioListening)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    audioListening
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse"
                      : "bg-white/5 text-slate-300 border-white/5 hover:text-white"
                  }`}
                >
                  {audioListening ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{audioListening ? "Audio Intercept (Active)" : "Audio (Off)"}</span>
                </button>

                <button
                  onClick={() => alert(`Broadcasting live secure stream link for ${activeCameraFeed.id} to 911 Dispatch & NYPD Traffic Operations.`)}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Relay to Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TARGET LOCK-ON HUD: TARGET INTELLIGENCE DRAWER
          ══════════════════════════════════════════════════════ */}
      {selectedTaxi && !activeCameraFeed && (
        <div className="absolute bottom-5 left-4 right-4 sm:right-auto sm:w-[420px] z-30 pointer-events-auto">
          <div className="p-4 rounded-3xl bg-[#0A0A1C]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl space-y-3">
            {/* Header / Lock-on Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-black tracking-widest text-[#00D4FF] uppercase flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5" />
                  TARGET LOCK-ON ENGAGED
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedTaxi(null);
                  setInterceptInfo(null);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded-lg bg-white/5"
              >
                DISENGAGE
              </button>
            </div>

            {/* Vehicle & Driver Intel */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white font-mono">{selectedTaxi.vehicleNumber}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedTaxi.status || "ACTIVE"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">{selectedTaxi.model || "Toyota Camry Security Fleet"}</p>
                <p className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Driver: {selectedTaxi.driverName || "Marcus Vance"} (★ {selectedTaxi.rating || 4.95})
                </p>
              </div>

              {/* Live Telemetry Box */}
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-[#00D4FF]">
                  {selectedTaxi.speed || (selectedTaxi.status === "ACTIVE" ? "42 km/h" : "0 km/h")}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">HEADING 240° WSW</div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">DASHCAM ONLINE</div>
              </div>
            </div>

            {/* Coordinates Ticker */}
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>LAT: {Number(selectedTaxi.currentLatitude).toFixed(5)}</span>
              <span>•</span>
              <span>LNG: {Number(selectedTaxi.currentLongitude).toFixed(5)}</span>
              <span>•</span>
              <span className="text-[#00D4FF]">SAT-FIX 3D</span>
            </div>

            {/* Interception Information if active */}
            {interceptInfo && (
              <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/50 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-red-300">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    INTERCEPTION TRAJECTORY CALCULATED
                  </span>
                  <span className="font-mono text-white">ETA ~{interceptInfo.etaMinutes} MIN</span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Intercept Unit: <b className="text-white font-mono">{interceptInfo.interceptUnit.vehicleNumber}</b> • Distance: <b className="text-[#00D4FF]">{interceptInfo.distanceKm} km</b>
                </p>
              </div>
            )}

            {/* Tactical Actions Grid with Live Cameras */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleOpenTaxiCam(selectedTaxi, "IN_CABIN")}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00D4FF] border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" /> In-Cabin Camera
              </button>

              <button
                onClick={() => handleOpenTaxiCam(selectedTaxi, "FRONT_ROAD")}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Front AI Dashcam
              </button>

              <button
                onClick={handleCalculateIntercept}
                className="px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 col-span-2"
              >
                <Zap className="w-3.5 h-3.5 text-red-400" /> Calculate Fleet Interception
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          BOTTOM RIGHT: QUICK ZOOM CONTROLS
          ══════════════════════════════════════════════════════ */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => leafletMapRef.current?.zoomIn()}
          className="p-2.5 rounded-xl bg-[#080816]/90 backdrop-blur-xl border border-white/10 text-white hover:bg-purple-600/30 hover:border-purple-500/50 shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => leafletMapRef.current?.zoomOut()}
          className="p-2.5 rounded-xl bg-[#080816]/90 backdrop-blur-xl border border-white/10 text-white hover:bg-purple-600/30 hover:border-purple-500/50 shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          CORNER RETICLE ACCENTS FOR GOD'S EYE AESTHETIC
          ══════════════════════════════════════════════════════ */}
      {godsEyeMode && (
        <>
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/70 pointer-events-none z-20" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/70 pointer-events-none z-20" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/70 pointer-events-none z-20" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/70 pointer-events-none z-20" />
        </>
      )}
    </div>
  );
}
