"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Camera,
  Users,
  AlertTriangle,
  Radio,
  FileCheck2,
  Home,
  Shield,
  LifeBuoy,
  Compass,
  MapPin,
  Play,
  RotateCcw,
  Sun,
  Moon,
  Siren,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";

export interface HotspotPoint {
  id: string;
  name: string;
  category: string;
  position: [number, number, number];
  portalHref: string;
  portalName: string;
  portalIcon: React.ElementType;
  badgeColor: string;
  telemetry: {
    status: string;
    primaryMetric: string;
    secondaryMetric: string;
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  };
  explanation: string;
  simAction?: string;
  simLabel?: string;
}

export const HOTSPOT_POINTS: HotspotPoint[] = [
  {
    id: "cam-rk",
    name: "Ramkund Ghat Optical Vision Node (CAM-01)",
    category: "AI Computer Vision",
    position: [10, 3, -5],
    portalHref: "/cameras",
    portalName: "Live CCTV Vision Portal",
    portalIcon: Camera,
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    telemetry: {
      status: "STREAMING (25 FPS)",
      primaryMetric: "Density: 4.8 persons/m²",
      secondaryMetric: "Optical Flow: 1.4 m/s (Eastbound)",
      riskLevel: "HIGH",
    },
    explanation:
      "High-mounted multi-spectral CCTV tracking devotee density at the holy bathing steps. Feeds real-time YOLOv8 head counts and optical flow vectors directly to the incident command engine.",
    simAction: "/api/simulation/inject-crowd",
    simLabel: "Simulate Ghat Surge",
  },
  {
    id: "crowd-pred",
    name: "Sacred Steps Bottleneck & Surge Precursor",
    category: "Crowd Physics & Prediction",
    position: [20, 2.5, 8],
    portalHref: "/crowd",
    portalName: "Crowd Analytics & Surge Prediction",
    portalIcon: Users,
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    telemetry: {
      status: "PRECURSOR WARNING",
      primaryMetric: "Surge Horizon: T-18 min",
      secondaryMetric: "Flow Influx: 340 dev/min",
      riskLevel: "HIGH",
    },
    explanation:
      "Predictive physics model analyzing backward compression waves. Detects stampede precursors up to 30 minutes before human eye can notice physical panic, enabling early barricade diversions.",
    simAction: "/api/simulation/inject-crowd",
    simLabel: "Trigger Precursor Wave",
  },
  {
    id: "incident-icc",
    name: "Integrated Command & Control Center (ICC Tower)",
    category: "Multi-Agency Coordination",
    position: [-45, 12, 35],
    portalHref: "/incidents",
    portalName: "Incident Command & Priority DAG",
    portalIcon: AlertTriangle,
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    telemetry: {
      status: "OPERATIONAL · 24 SECTORS",
      primaryMetric: "Active DAG Nodes: 4",
      secondaryMetric: "Mean Triage Time: 2.1 min",
      riskLevel: "MODERATE",
    },
    explanation:
      "The apex command layer where Police, NDRF, Municipal Corporation, and Health Directorate share an automated DAG priority queue. Automatically unblocks secondary bottlenecks before primary rescues.",
  },
  {
    id: "rumor-cyber",
    name: "Cyber Intelligence & Social Listening Hub",
    category: "Outcome 10.1 & 10.2 Social AI",
    position: [-35, 6, 15],
    portalHref: "/verify",
    portalName: "Misinformation & Rumor Fact-Checker",
    portalIcon: FileCheck2,
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    telemetry: {
      status: "SCANNING SOCIAL FEEDS",
      primaryMetric: "Rumor Velocity: 210 shares/hr",
      secondaryMetric: "Counter-Message: AUTO-GENERATED",
      riskLevel: "CRITICAL",
    },
    explanation:
      "Outcome 10.1 & 10.2 core system: AI scans Twitter/X, WhatsApp tip lines, and Instagram for false stampede rumors, fake bridge collapse claims, or health panics, producing instant debunk broadcasts before stampedes trigger.",
    simAction: "/api/simulation/inject-misinformation",
    simLabel: "Simulate Stampede Rumor",
  },
  {
    id: "lost-panchvati",
    name: "Panchvati Devotee Helpdesk & Biometric Radar",
    category: "Devotee Tracing & Safety",
    position: [28, 4, -42],
    portalHref: "/lost-found",
    portalName: "AI Lost Person Biometric Radar",
    portalIcon: Users,
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    telemetry: {
      status: "RADAR ACTIVE",
      primaryMetric: "Registered Active: 6 Cases",
      secondaryMetric: "Facial Vector Match: 94.2%",
      riskLevel: "LOW",
    },
    explanation:
      "Lost children and elderly tracking kiosk using cosine similarity embeddings across 12 sector CCTV feeds, paired with automated multilingual audio broadcast announcements in Hindi, Marathi, Telugu, and Gujarati.",
  },
  {
    id: "shelter-tapovan",
    name: "Tapovan High-Capacity Devotee Holding Hall",
    category: "Logistics & Weather Buffer",
    position: [68, 6, 25],
    portalHref: "/shelters",
    portalName: "Rain & Transit Shelters Portal",
    portalIcon: Home,
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    telemetry: {
      status: "ACCEPTING DEVOTEES",
      primaryMetric: "Occupancy: 64% (16,000/25,000)",
      secondaryMetric: "Weather Dome: 100% Water Shielded",
      riskLevel: "LOW",
    },
    explanation:
      "All-weather steel truss pavilion acting as a buffer during sudden downpours or Shahi Snan congestion. Automated sensors alert the transit corridor when capacity exceeds 85% to trigger detour diversions.",
    simAction: "/api/simulation/inject-shelter-overflow",
    simLabel: "Trigger Shelter Overload",
  },
  {
    id: "qrt-base",
    name: "Sadar Quick Response Team & Ambulance Depot",
    category: "Emergency Dispatch",
    position: [-65, 3, -15],
    portalHref: "/resources",
    portalName: "Resource Units & Emergency Dispatch",
    portalIcon: Shield,
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    telemetry: {
      status: "STANDBY & PATROL",
      primaryMetric: "QRT Bikers: 8 Active",
      secondaryMetric: "ALS Ambulances: 4 Ready",
      riskLevel: "LOW",
    },
    explanation:
      "Strategic mobilization base equipped with narrow-lane motorcycle medics capable of navigating dense ghat alleys in under 3 minutes, bypassing stationary vehicle congestion.",
  },
  {
    id: "bridge-laxman",
    name: "Laxman Jhula Overpass & Bypass Corridors",
    category: "Pedestrian Routing",
    position: [-18, 5, 2],
    portalHref: "/evacuation",
    portalName: "Evacuation Corridors & Routing",
    portalIcon: Compass,
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    telemetry: {
      status: "ONE-WAY REVERSED",
      primaryMetric: "Throughput: 420 dev/min",
      secondaryMetric: "Bypass Gate 4: OPEN (40%)",
      riskLevel: "MODERATE",
    },
    explanation:
      "Suspension pedestrian bridge over the Godavari River. Fitted with dynamic electronic barricades to prevent cross-flow collisions during peak Shahi Snan hours.",
    simAction: "/api/simulation/inject-crowd",
    simLabel: "Throttle Bridge Gates",
  },
  {
    id: "water-godavari",
    name: "Godavari Sacred Basin Flow & Drowning Guard",
    category: "River Safety Telemetry",
    position: [-5, 1, -12],
    portalHref: "/crowd",
    portalName: "Water Safety & River Flow Monitor",
    portalIcon: LifeBuoy,
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    telemetry: {
      status: "WATER SAFE · PATROL ACTIVE",
      primaryMetric: "Current Velocity: 1.1 m/s",
      secondaryMetric: "NDRF Motor Boats: 3 In Basin",
      riskLevel: "LOW",
    },
    explanation:
      "Submerged ultrasonic depth sensors and boundary safety nets preventing devotees from drifting past the safe bathing zone during heavy upstream dam releases.",
  },
  {
    id: "gis-grid",
    name: "Nashik Mela Spatial Geofence & GIS Grid",
    category: "Geospatial Command",
    position: [0, 18, 0],
    portalHref: "/gis",
    portalName: "GIS Spatial Map Portal",
    portalIcon: MapPin,
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    telemetry: {
      status: "24 SECTOR GEOFENCE LIVE",
      primaryMetric: "GPS Accuracy: ±0.8m",
      secondaryMetric: "Active Cameras Mapped: 32",
      riskLevel: "LOW",
    },
    explanation:
      "High-precision geospatial layer tying together satellite imagery, camera coordinates, emergency vehicle GPS beacons, and shelter locations across the 15 sq km festival grounds.",
  },
];

export function KumbhDigitalTwin3D({
  onSelectHotspot,
}: {
  onSelectHotspot?: (point: HotspotPoint) => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<HotspotPoint>(HOTSPOT_POINTS[0]);
  const [lightingMode, setLightingMode] = useState<"aarti" | "day" | "alert">("aarti");
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [tourIndex, setTourIndex] = useState<number>(0);
  const [crowdSpeed, setCrowdSpeed] = useState<number>(1.0);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dir: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    aartiGlows: THREE.PointLight[];
    alertLight: THREE.PointLight;
  } | null>(null);

  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // Smoothly move camera towards landmark
  const flyToHotspot = (point: HotspotPoint) => {
    setSelectedPoint(point);
    if (onSelectHotspot) onSelectHotspot(point);

    const [x, y, z] = point.position;
    // Position camera at an offset looking at the point
    targetCameraPos.current = new THREE.Vector3(x + 28, y + 24, z + 28);
    targetLookAt.current = new THREE.Vector3(x, y, z);
  };

  const flyToOverview = () => {
    targetCameraPos.current = new THREE.Vector3(80, 85, 110);
    targetLookAt.current = new THREE.Vector3(0, 0, 0);
  };

  // Tour Mode handler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTouring) {
      flyToHotspot(HOTSPOT_POINTS[tourIndex]);
      timer = setTimeout(() => {
        setTourIndex((prev) => (prev + 1) % HOTSPOT_POINTS.length);
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [isTouring, tourIndex]);

  // Lighting Mode effect
  useEffect(() => {
    if (!lightsRef.current || !sceneRef.current) return;
    const { ambient, dir, hemi, aartiGlows, alertLight } = lightsRef.current;

    if (lightingMode === "aarti") {
      // Golden dusk Aarti atmosphere
      ambient.color.setHex(0x3a2010);
      ambient.intensity = 1.2;
      dir.color.setHex(0xffaa55);
      dir.intensity = 1.8;
      dir.position.set(-60, 45, -30);
      hemi.color.setHex(0xffaa66);
      hemi.groundColor.setHex(0x1a0a00);
      sceneRef.current.background = new THREE.Color(0x0c0712);
      sceneRef.current.fog = new THREE.FogExp2(0x0c0712, 0.007);
      aartiGlows.forEach((gl) => (gl.intensity = 2.5));
      alertLight.intensity = 0.0;
    } else if (lightingMode === "day") {
      // Crisp daylight surveillance mode
      ambient.color.setHex(0x556677);
      ambient.intensity = 1.5;
      dir.color.setHex(0xffffff);
      dir.intensity = 2.2;
      dir.position.set(70, 90, 50);
      hemi.color.setHex(0xddeeff);
      hemi.groundColor.setHex(0x223344);
      sceneRef.current.background = new THREE.Color(0x0a101d);
      sceneRef.current.fog = new THREE.FogExp2(0x0a101d, 0.005);
      aartiGlows.forEach((gl) => (gl.intensity = 0.5));
      alertLight.intensity = 0.0;
    } else if (lightingMode === "alert") {
      // Red alert emergency aura
      ambient.color.setHex(0x330000);
      ambient.intensity = 1.5;
      dir.color.setHex(0xff2222);
      dir.intensity = 1.5;
      hemi.color.setHex(0xff3333);
      hemi.groundColor.setHex(0x220000);
      sceneRef.current.background = new THREE.Color(0x120303);
      sceneRef.current.fog = new THREE.FogExp2(0x120303, 0.008);
      aartiGlows.forEach((gl) => (gl.intensity = 0.2));
      alertLight.intensity = 4.0;
    }
  }, [lightingMode]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0c0712);
    scene.fog = new THREE.FogExp2(0x0c0712, 0.007);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(75, 70, 95);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't flip below ground
    controls.minDistance = 15;
    controls.maxDistance = 240;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x3a2010, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa55, 1.8);
    dirLight.position.set(-60, 45, -30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 300;
    const d = 100;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0xffaa66, 0x1a0a00, 1.0);
    scene.add(hemiLight);

    // Sacred Aarti point lights (floating diyas / temple lanterns)
    const aartiGlows: THREE.PointLight[] = [];
    const aartiCoords: [number, number, number][] = [
      [10, 2, -5],
      [15, 2, 2],
      [-5, 1.5, -12],
      [28, 4, -40],
      [0, 1.5, 0],
    ];
    aartiCoords.forEach(([x, y, z]) => {
      const p = new THREE.PointLight(0xff8811, 2.5, 35, 1.5);
      p.position.set(x, y, z);
      scene.add(p);
      aartiGlows.push(p);
    });

    // Alert beacon light
    const alertLight = new THREE.PointLight(0xff0022, 0.0, 100, 1.5);
    alertLight.position.set(0, 25, 0);
    scene.add(alertLight);

    lightsRef.current = {
      ambient: ambientLight,
      dir: dirLight,
      hemi: hemiLight,
      aartiGlows,
      alertLight,
    };

    // 6. Terrain / Ground
    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(260, 260, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);
    // Slight height variations
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      // River trench depression running across
      const riverDist = Math.abs(vz - (vx * 0.35 + Math.sin(vx * 0.04) * 12));
      if (riverDist < 16) {
        posAttr.setY(i, -1.8 + (riverDist / 16) * 1.5);
      } else {
        posAttr.setY(i, Math.sin(vx * 0.03) * Math.cos(vz * 0.03) * 1.2);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2130,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Decorative Ground Tactical Grid
    const gridHelper = new THREE.GridHelper(240, 48, 0xf97316, 0x1f293d);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 7. Godavari River
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-120, -0.6, -70),
      new THREE.Vector3(-60, -0.6, -30),
      new THREE.Vector3(-10, -0.6, -8),
      new THREE.Vector3(15, -0.6, 5),
      new THREE.Vector3(65, -0.6, 26),
      new THREE.Vector3(120, -0.6, 55),
    ]);
    const riverPoints = riverCurve.getPoints(50);
    const riverShape = new THREE.Shape();
    riverShape.moveTo(-14, 0);
    riverShape.lineTo(14, 0);
    riverShape.lineTo(14, 0.1);
    riverShape.lineTo(-14, 0.1);
    riverShape.closePath();

    const riverGeo = new THREE.PlaneGeometry(260, 32, 64, 16);
    riverGeo.rotateX(-Math.PI / 2);
    riverGeo.rotateY(0.33);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0c4a6e,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88,
    });
    const waterMesh = new THREE.Mesh(riverGeo, waterMat);
    waterMesh.position.set(0, -0.4, 0);
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 8. Ramkund Sacred Stepped Ghat
    const ghatGroup = new THREE.Group();
    ghatGroup.position.set(10, 0, -4);
    // 6 graduated tiers of ghat steps descending toward river
    for (let s = 0; s < 7; s++) {
      const stepGeo = new THREE.BoxGeometry(36 - s * 1.5, 0.6, 2.2);
      const stepMat = new THREE.MeshStandardMaterial({
        color: s === 0 ? 0xd97706 : 0x334155,
        roughness: 0.7,
      });
      const stepMesh = new THREE.Mesh(stepGeo, stepMat);
      stepMesh.position.set(0, (6 - s) * 0.45 - 0.2, s * 1.8 - 6);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      ghatGroup.add(stepMesh);
    }
    // Sacred Deepa Stambha (Stone Pillar of Lights)
    const sthambhaGeo = new THREE.CylinderGeometry(0.6, 1.2, 14, 8);
    const sthambhaMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.6 });
    const sthambha = new THREE.Mesh(sthambhaGeo, sthambhaMat);
    sthambha.position.set(12, 7, -6);
    sthambha.castShadow = true;
    ghatGroup.add(sthambha);
    scene.add(ghatGroup);

    // 9. Laxman Jhula Pedestrian Suspension Bridge
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-18, 0, 0);
    // Deck
    const deckGeo = new THREE.BoxGeometry(6, 0.4, 48);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 4.5;
    deck.castShadow = true;
    bridgeGroup.add(deck);
    // Towers
    [-18, 18].forEach((zPos) => {
      const towerGeo = new THREE.BoxGeometry(7, 14, 1.5);
      const towerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(0, 7, zPos);
      tower.castShadow = true;
      bridgeGroup.add(tower);
    });
    scene.add(bridgeGroup);

    // 10. Panchvati Temple Complex
    const templeGroup = new THREE.Group();
    templeGroup.position.set(28, 0, -42);
    // Base Mandap
    const baseGeo = new THREE.BoxGeometry(22, 5, 22);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 2.5;
    base.castShadow = true;
    templeGroup.add(base);
    // Main Shikhar (Spire)
    const spireGeo = new THREE.ConeGeometry(5, 14, 6);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const spire = new THREE.Mesh(spireGeo, goldMat);
    spire.position.set(0, 12, 0);
    spire.castShadow = true;
    templeGroup.add(spire);
    // Saffron Dhwaja Flag
    const flagGeo = new THREE.BoxGeometry(0.1, 1.5, 3);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.3 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0, 19, 1.5);
    templeGroup.add(flag);
    scene.add(templeGroup);

    // 11. Sadhu Gram Tent City (Akharas)
    const tentsGroup = new THREE.Group();
    tentsGroup.position.set(-55, 0, -45);
    const tentColors = [0xf97316, 0xe11d48, 0xe2e8f0, 0xf59e0b];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const tentGeo = new THREE.ConeGeometry(2.8, 3.8, 4);
        const tColor = tentColors[(r * 5 + c) % tentColors.length];
        const tentMat = new THREE.MeshStandardMaterial({ color: tColor, roughness: 0.8 });
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(c * 7 - 14, 1.9, r * 7 - 10);
        tent.rotation.y = Math.PI / 4;
        tent.castShadow = true;
        tentsGroup.add(tent);
      }
    }
    scene.add(tentsGroup);

    // 12. Tapovan Transit Holding Shelters (Curved Domes)
    const tapovanGroup = new THREE.Group();
    tapovanGroup.position.set(68, 0, 25);
    for (let i = 0; i < 2; i++) {
      const domeGeo = new THREE.CylinderGeometry(8, 8, 22, 16, 1, false, 0, Math.PI);
      domeGeo.rotateZ(Math.PI / 2);
      domeGeo.rotateY(Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.4,
        side: THREE.DoubleSide,
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(i * 18 - 9, 3, 0);
      dome.castShadow = true;
      tapovanGroup.add(dome);
    }
    scene.add(tapovanGroup);

    // 13. Integrated Command & Control Center (ICC Tower)
    const iccGroup = new THREE.Group();
    iccGroup.position.set(-45, 0, 35);
    const towerGeo = new THREE.CylinderGeometry(4, 5, 20, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 10;
    tower.castShadow = true;
    iccGroup.add(tower);

    // Glass Observation Ring
    const ringGeo = new THREE.CylinderGeometry(6, 6, 3, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75, roughness: 0.1 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 18;
    iccGroup.add(ring);

    // Rotating Radar Dish on top
    const dishGeo = new THREE.CylinderGeometry(2.5, 0.4, 0.5, 12);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8 });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.y = 21;
    dish.rotation.x = Math.PI / 4;
    iccGroup.add(dish);
    scene.add(iccGroup);

    // 14. Crowd Flow Particles (Simulating 1500 flowing devotees along designated corridors)
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    const corridors = [
      // Corridor 1: Sadhu Gram -> Ramkund Ghat
      { start: [-55, -45], end: [10, -4] },
      // Corridor 2: Tapovan -> Ramkund
      { start: [68, 25], end: [10, -4] },
      // Corridor 3: Over Laxman Jhula Bridge
      { start: [-18, -24], end: [-18, 24] },
      // Corridor 4: Panchvati -> Ramkund
      { start: [28, -42], end: [10, -4] },
    ];

    for (let i = 0; i < particleCount; i++) {
      const corridor = corridors[i % corridors.length];
      const t = Math.random();
      const x = corridor.start[0] + (corridor.end[0] - corridor.start[0]) * t + (Math.random() - 0.5) * 5;
      const z = corridor.start[1] + (corridor.end[1] - corridor.start[1]) * t + (Math.random() - 0.5) * 5;

      particlePos[i * 3] = x;
      particlePos[i * 3 + 1] = 0.8 + Math.random() * 0.4;
      particlePos[i * 3 + 2] = z;

      // Color coding: mostly saffron & golden yellow, with occasional alerts
      if (Math.random() > 0.88) {
        // Red alert bottleneck
        particleColors[i * 3] = 0.95;
        particleColors[i * 3 + 1] = 0.2;
        particleColors[i * 3 + 2] = 0.2;
      } else {
        // Saffron / gold
        particleColors[i * 3] = 0.98;
        particleColors[i * 3 + 1] = 0.55 + Math.random() * 0.3;
        particleColors[i * 3 + 2] = 0.1;
      }

      particleSpeeds[i] = 0.05 + Math.random() * 0.08;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 1.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const crowdParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(crowdParticles);
    particlesRef.current = crowdParticles;

    // 15. 3D Hotspot Interactive Pins & Beacons
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    scene.add(markersGroup);

    HOTSPOT_POINTS.forEach((point) => {
      const [x, y, z] = point.position;
      const pinSubGroup = new THREE.Group();
      pinSubGroup.position.set(x, y, z);
      pinSubGroup.userData = { pointId: point.id };

      // Laser Tether down to ground
      const tetherGeo = new THREE.CylinderGeometry(0.08, 0.08, y, 6);
      const tetherMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.6 });
      const tether = new THREE.Mesh(tetherGeo, tetherMat);
      tether.position.y = -y / 2;
      pinSubGroup.add(tether);

      // Radar Ring on ground
      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const groundRing = new THREE.Mesh(ringGeo, ringMat);
      groundRing.position.y = -y + 0.1;
      groundRing.name = "radarRing";
      pinSubGroup.add(groundRing);

      // Floating Diamond Beacon Header
      const diamondGeo = new THREE.OctahedronGeometry(1.4, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xea580c,
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.name = "diamondMesh";
      diamond.castShadow = true;
      pinSubGroup.add(diamond);

      markersGroup.add(pinSubGroup);
    });

    // 16. Raycasting for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(markersGroup.children, true);

      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && !curr.userData.pointId && curr.parent) {
          curr = curr.parent;
        }
        if (curr && curr.userData.pointId) {
          const pt = HOTSPOT_POINTS.find((p) => p.id === curr.userData.pointId);
          if (pt) {
            flyToHotspot(pt);
          }
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    // 17. Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // 18. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update Controls
      controls.update();

      // Camera Smooth Glide to selected target
      if (targetCameraPos.current && targetLookAt.current) {
        camera.position.lerp(targetCameraPos.current, 0.05);
        controls.target.lerp(targetLookAt.current, 0.05);

        if (camera.position.distanceTo(targetCameraPos.current) < 0.5) {
          targetCameraPos.current = null;
          targetLookAt.current = null;
        }
      }

      // Rotate ICC Radar Dish
      dish.rotation.y = elapsed * 1.5;

      // Animate Godavari River Water
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = -0.4 + Math.sin(elapsed * 1.8) * 0.08;
      }

      // Animate 3D Hotspot Diamonds & Radar Rings
      markersGroup.children.forEach((group, idx) => {
        const diamond = group.getObjectByName("diamondMesh");
        const radar = group.getObjectByName("radarRing");
        if (diamond) {
          diamond.rotation.y = elapsed * 1.2 + idx;
          diamond.position.y = Math.sin(elapsed * 2.5 + idx) * 0.4;
        }
        if (radar) {
          const scale = 1.0 + (Math.sin(elapsed * 3 + idx) + 1) * 0.35;
          radar.scale.set(scale, scale, scale);
        }
      });

      // Animate Crowd Particles along pathways
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const corridor = corridors[i % corridors.length];
          const speed = particleSpeeds[i] * crowdSpeed;

          // Vector toward end
          const dx = corridor.end[0] - corridor.start[0];
          const dz = corridor.end[1] - corridor.start[1];
          const dist = Math.sqrt(dx * dx + dz * dz);
          const dirX = dx / dist;
          const dirZ = dz / dist;

          positions[i * 3] += dirX * speed;
          positions[i * 3 + 2] += dirZ * speed;

          // Check if reached end -> wrap back to start
          const curDx = positions[i * 3] - corridor.start[0];
          const curDz = positions[i * 3 + 2] - corridor.start[1];
          const curDist = Math.sqrt(curDx * curDx + curDz * curDz);
          if (curDist >= dist) {
            positions[i * 3] = corridor.start[0] + (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = corridor.start[1] + (Math.random() - 0.5) * 4;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Alert strobe effect when in alert mode
      if (lightsRef.current && lightingMode === "alert") {
        lightsRef.current.alertLight.intensity = (Math.sin(elapsed * 8) + 1) * 2.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  // Sim Action trigger
  const handleTriggerSim = async (actionPath?: string) => {
    if (!actionPath) return;
    try {
      setSimMessage("Injecting simulation stress event...");
      await fetch(`http://localhost:8000${actionPath}`, { method: "POST" });
      setSimMessage("Event triggered! Telemetry updated in real-time.");
      setLightingMode("alert");
      setTimeout(() => setSimMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setSimMessage("Simulation event dispatched.");
      setTimeout(() => setSimMessage(null), 3000);
    }
  };

  const IconComp = selectedPoint.portalIcon;

  return (
    <div className="flex flex-col space-y-4">
      {/* 3D Simulation Viewport Card */}
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070A11] shadow-2xl">
        {/* Three.js Canvas Container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Floating HUD: Title & View Presets */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-xl pointer-events-auto flex items-center gap-3 shadow-lg">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 uppercase font-mono">
                <span>SIMHASTHA 2027 3D DIGITAL TWIN</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
                  NASHIK–TRIMBAKESHWAR
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Click any 3D pin to inspect live telemetry & launch corresponding safety portal
              </div>
            </div>
          </div>

          {/* Environment Lighting Modes */}
          <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800/80 p-1 rounded-xl pointer-events-auto flex items-center gap-1 shadow-lg">
            <button
              onClick={() => setLightingMode("aarti")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                lightingMode === "aarti"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Aarti Dusk</span>
            </button>
            <button
              onClick={() => setLightingMode("day")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                lightingMode === "day"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Surveillance Day</span>
            </button>
            <button
              onClick={() => setLightingMode("alert")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                lightingMode === "alert"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Emergency Alert</span>
            </button>
          </div>
        </div>

        {/* Floating Camera Presets Ribbon */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-lg">
          <button
            onClick={flyToOverview}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            🌐 Whole Mela
          </button>
          <div className="w-[1px] h-4 bg-slate-800" />
          <button
            onClick={() => flyToHotspot(HOTSPOT_POINTS[0])}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            🌊 Ramkund Ghat
          </button>
          <button
            onClick={() => flyToHotspot(HOTSPOT_POINTS[6])}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            ⛺ Sadhu Gram
          </button>
          <button
            onClick={() => flyToHotspot(HOTSPOT_POINTS[7])}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            🌉 Laxman Jhula
          </button>
          <button
            onClick={() => flyToHotspot(HOTSPOT_POINTS[5])}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            🏟️ Tapovan Domes
          </button>
          <button
            onClick={() => flyToHotspot(HOTSPOT_POINTS[2])}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            📡 ICC Tower
          </button>
        </div>

        {/* Guided Tour Mode Toggle Button */}
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <button
            onClick={() => setIsTouring(!isTouring)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xl ${
              isTouring
                ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white animate-pulse"
                : "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isTouring ? "Pause 3D Walkthrough" : "✨ Guided Project Walkthrough"}</span>
          </button>
        </div>

        {/* Active Selected Point Inspector Card (Glassmorphic Overlay) */}
        {selectedPoint && (
          <div className="absolute top-20 right-4 w-96 max-w-[calc(100%-2rem)] bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 p-4 rounded-2xl shadow-2xl space-y-3 pointer-events-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-wider text-orange-400 uppercase font-semibold">
                    {selectedPoint.category}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedPoint.name}
                  </h3>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${selectedPoint.badgeColor}`}
              >
                {selectedPoint.telemetry.riskLevel}
              </span>
            </div>

            {/* Live Telemetry Data Box */}
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Sensor Status:</span>
                <span className="text-emerald-400 font-bold">{selectedPoint.telemetry.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Metric:</span>
                <span className="text-white font-bold">{selectedPoint.telemetry.primaryMetric}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Secondary Metric:</span>
                <span className="text-slate-300">{selectedPoint.telemetry.secondaryMetric}</span>
              </div>
            </div>

            {/* Plain English Explanation for Visitors / HOD Sir */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/40">
              <span className="text-orange-400 font-bold">Why This Matters: </span>
              {selectedPoint.explanation}
            </div>

            {/* Action Buttons: Direct Portal Launch & Sim Action */}
            <div className="space-y-2 pt-1">
              <Link
                href={selectedPoint.portalHref}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all group"
              >
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch {selectedPoint.portalName}</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {selectedPoint.simAction && (
                <button
                  onClick={() => handleTriggerSim(selectedPoint.simAction)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{selectedPoint.simLabel || "Trigger Simulation at this Node"}</span>
                </button>
              )}

              {simMessage && (
                <div className="text-[11px] text-center text-amber-400 font-mono bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 animate-fade-in">
                  {simMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Interactive Point Selector Bar */}
      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <span>Interactive 3D Portal Hotspots (Click to Fly & Inspect):</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {HOTSPOT_POINTS.length} Monitored Spatial Nodes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {HOTSPOT_POINTS.map((pt) => {
            const PIcon = pt.portalIcon;
            const isSelected = selectedPoint.id === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => flyToHotspot(pt)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-orange-500/20 border-orange-500 text-white shadow-md shadow-orange-500/10"
                    : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <PIcon className={`w-4 h-4 ${isSelected ? "text-orange-400" : "text-slate-400"}`} />
                  <span
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      pt.telemetry.riskLevel === "CRITICAL"
                        ? "bg-red-500/20 text-red-400"
                        : pt.telemetry.riskLevel === "HIGH"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {pt.telemetry.riskLevel}
                  </span>
                </div>
                <div className="text-[11px] font-bold truncate leading-tight">{pt.name}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">{pt.category}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
