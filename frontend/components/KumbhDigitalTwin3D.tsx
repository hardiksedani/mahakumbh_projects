"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ArrowRight, Compass, ExternalLink, Info, MapPin, Pause, Play, RotateCcw, Search } from "lucide-react";
import { SIMULATION_PLACES, simulationPortalHref, type SimulationPlace, type SiteId } from "@/lib/simulation-places";

type SceneRuntime = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  targetPosition: THREE.Vector3 | null;
  targetLook: THREE.Vector3 | null;
};

const siteCopy: Record<SiteId, { title: string; subtitle: string; keyPlaces: string }> = {
  nashik: {
    title: "Nashik riverfront",
    subtitle: "Ramkund · Panchavati · Godavari · Tapovan",
    keyPlaces: "Godavari riverfront and Ramkund bathing steps",
  },
  trimbakeshwar: {
    title: "Trimbakeshwar town",
    subtitle: "Trimbakeshwar temple · Kushavart Tirtha · Brahmagiri foothills",
    keyPlaces: "Trimbakeshwar temple and Kushavart Tirtha",
  },
};

function block(scene: THREE.Scene | THREE.Group, color: number, size: [number, number, number], position: [number, number, number], rotation = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, roughness: 0.92 }));
  mesh.position.set(...position);
  mesh.rotation.y = rotation;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addTemple(scene: THREE.Scene, x: number, z: number, scale: number, darkStone = false) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  const stone = darkStone ? 0x756b5e : 0xd4b894;
  block(group, stone, [12, 5, 10], [0, 2.5, 0]);
  block(group, stone, [8, 2, 8], [0, 6, 0]);
  const tower = new THREE.Mesh(new THREE.ConeGeometry(4.3, 10, 8), new THREE.MeshStandardMaterial({ color: darkStone ? 0x504b43 : 0xb88951, roughness: 0.8 }));
  tower.position.set(0, 12, 0);
  tower.castShadow = true;
  group.add(tower);
  block(group, 0xb98038, [0.3, 3, 0.3], [0, 19, 0]);
  scene.add(group);
  return group;
}

function addRoad(scene: THREE.Scene, a: [number, number], b: [number, number], width = 4) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const road = block(scene, 0x6b6660, [Math.hypot(dx, dz), 0.08, width], [(a[0] + b[0]) / 2, 0.1, (a[1] + b[1]) / 2], -Math.atan2(dz, dx));
  road.receiveShadow = true;
}

function createRiver(scene: THREE.Scene) {
  const length = 65;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= length; i++) {
    const x = -95 + i * (190 / length);
    const middle = Math.sin(x * 0.032) * 6 + x * 0.1;
    positions.push(x, 0.13, middle - 10, x, 0.13, middle + 10);
    if (i < length) {
      const j = i * 2;
      indices.push(j, j + 1, j + 2, j + 1, j + 3, j + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const water = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x287893, roughness: 0.38, metalness: 0.1, side: THREE.DoubleSide }));
  scene.add(water);
  return water;
}

function makeNashik(scene: THREE.Scene) {
  const ground = block(scene, 0x887d69, [190, 0.3, 142], [0, -0.18, 0]);
  ground.receiveShadow = true;
  const river = createRiver(scene);
  addRoad(scene, [-78, -43], [80, -43], 5);
  addRoad(scene, [-83, 34], [82, 34], 5);
  addRoad(scene, [-27, -50], [-27, -15], 4);
  addRoad(scene, [58, 24], [58, 48], 4);

  // Ramkund: stepped stone banks and a small rectangular bathing basin.
  for (let i = 0; i < 6; i++) {
    block(scene, i % 2 ? 0xc8b398 : 0xd6c2a4, [37 - i * 1.8, 0.45, 2.9], [-13, 1.25 - i * 0.15, -16 + i * 2.3]);
  }
  block(scene, 0x7f7567, [25, 0.25, 1.5], [-13, 0.47, 11]);
  addTemple(scene, -46, -31, 0.9);

  // Riverside bridge. It illustrates a crossing, not a surveyed structure.
  block(scene, 0xbdb3a3, [6, 0.8, 37], [15, 2.3, -7], -0.18);
  for (const z of [-21, 6]) {
    block(scene, 0x9c907e, [1.5, 6, 1.5], [13.5, 4.8, z]);
    block(scene, 0x9c907e, [1.5, 6, 1.5], [17, 4.8, z]);
  }

  // Roof clusters make the old-city precinct recognisable without pretending to
  // reproduce individual buildings or official site infrastructure.
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -76 + col * 15 + (row % 2) * 3;
      const z = -59 + row * 12;
      if ((x > -56 && x < -35) || (x > -30 && x < 2 && z > -39)) continue;
      const height = 2.8 + ((col * 3 + row * 7) % 4);
      block(scene, [0xb7a083, 0xc8ae8b, 0x9f927e][(row + col) % 3], [9, height, 7], [x, height / 2, z]);
      block(scene, 0x765f4b, [9.6, 0.5, 7.6], [x, height + 0.1, z]);
    }
  }

  // A facility illustration in Tapovan is deliberately generic.
  for (let i = 0; i < 3; i++) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(5, 4.4, 4), new THREE.MeshStandardMaterial({ color: 0xd8c9ad, roughness: 0.95 }));
    tent.position.set(48 + i * 10, 2.3, 30);
    tent.rotation.y = Math.PI / 4;
    scene.add(tent);
  }
  return river;
}

function makeTrimbakeshwar(scene: THREE.Scene) {
  const ground = block(scene, 0x657255, [190, 0.3, 142], [0, -0.18, 0]);
  ground.receiveShadow = true;
  for (let i = 0; i < 7; i++) {
    const radius = 18 + (i % 3) * 7;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(radius, 19 + (i % 4) * 7, 7), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x526c4d : 0x697b57, flatShading: true, roughness: 1 }));
    hill.position.set(-80 + i * 26, 4, -69);
    hill.rotation.y = i * 0.8;
    hill.castShadow = true;
    scene.add(hill);
  }
  addRoad(scene, [-86, 40], [86, 40], 6);
  addRoad(scene, [-11, 39], [-11, -37], 5);
  addRoad(scene, [-60, 16], [62, 16], 4);
  addTemple(scene, -11, -4, 1.3, true);

  // Kushavart is represented as a stepped kund, separate from the temple.
  block(scene, 0xd4b790, [28, 0.7, 24], [29, 0.35, 10]);
  block(scene, 0xb69a79, [23, 0.8, 19], [29, 0.45, 10]);
  block(scene, 0x358298, [17, 0.15, 13], [29, 0.95, 10]);
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const x = 29 + Math.cos(angle) * 13;
    const z = 10 + Math.sin(angle) * 11;
    block(scene, 0xd5b991, [2, 3.6, 2], [x, 2.1, z]);
  }
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = -76 + col * 18;
      const z = 24 + row * 12;
      if (x > 9 && x < 50 && row === 0) continue;
      const height = 2.5 + ((col + row * 2) % 4);
      block(scene, [0xb5a58b, 0xc3ae91, 0x9e9985][(col + row) % 3], [11, height, 8], [x, height / 2, z]);
      block(scene, 0x635a4c, [11.5, 0.4, 8.5], [x, height + 0.1, z]);
    }
  }
  return null;
}

function FallbackScene({ site, selectedId, places, onSelect }: { site: SiteId; selectedId: string; places: SimulationPlace[]; onSelect: (point: SimulationPlace) => void }) {
  const labels: Record<string, string> = {
    ramkund: "Ramkund", "ramkund-camera": "Camera", "godavari-crossing": "Crossing", panchavati: "Panchavati", tapovan: "Tapovan", helpdesk: "Help point", "public-reports": "Public report", "rumour-review": "Verification", "nashik-brief": "Overview", "trimbak-temple": "Temple", kushavarta: "Kushavart", "trimbak-resources": "Response", "trimbak-summary": "Overview",
  };
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" role="img" aria-label={`Schematic map of ${siteCopy[site].title}. Select a labelled point or use the place list.`}>
      <rect width="800" height="500" fill={site === "nashik" ? "#596256" : "#4b634c"} />
      {site === "nashik" ? <>
        <path d="M0 103 C126 121 170 159 255 188 S408 230 500 259 S677 324 800 363" fill="none" stroke="#d6c4a4" strokeWidth="92" opacity=".55" />
        <path d="M0 103 C126 121 170 159 255 188 S408 230 500 259 S677 324 800 363" fill="none" stroke="#367e96" strokeWidth="61" />
        <path d="M0 103 C126 121 170 159 255 188 S408 230 500 259 S677 324 800 363" fill="none" stroke="#66afbd" strokeWidth="3" opacity=".6" />
        <g fill="#cdb99b">{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={301 + i * 3} y={142 + i * 8} width={137 - i * 6} height="7" rx="1" />)}</g>
        <path d="M456 142 L475 144 L441 346 L422 344 Z" fill="#d2b991" />
        <path d="M100 405 L257 356 L329 379 L164 435 Z" fill="#a98867" opacity=".65" />
        <path d="M606 91 L740 130 L720 186 L584 148 Z" fill="#d8c8a9" opacity=".6" />
      </> : <>
        <path d="M0 130 L110 45 L198 115 L280 8 L381 142 L481 50 L596 148 L713 18 L800 124 L800 0 L0 0 Z" fill="#344f3c" />
        <path d="M0 158 L110 75 L198 135 L280 42 L381 163 L481 83 L596 168 L713 49 L800 146" fill="none" stroke="#91a77b" strokeWidth="7" opacity=".45" />
        <path d="M40 431 L760 431 M333 431 L333 145 M73 315 L717 315" stroke="#aa9a7f" strokeWidth="24" fill="none" opacity=".8" />
        <path d="M289 241 L338 202 L387 241 L387 290 L289 290 Z" fill="#655e54" stroke="#d1b999" strokeWidth="5" />
        <path d="M322 202 L338 152 L355 202 Z" fill="#776d5c" />
        <rect x="493" y="290" width="130" height="110" rx="2" fill="#c2a781" />
        <rect x="516" y="311" width="84" height="67" fill="#397f97" stroke="#e3ccaa" strokeWidth="7" />
      </>}
      {places.map((point) => {
        const x = ((point.position[0] + 95) / 190) * 800;
        const y = ((point.position[2] + 70) / 140) * 500;
        const active = selectedId === point.id;
        return <g key={point.id} role="button" tabIndex={0} aria-label={`Select ${point.name}`} onClick={() => onSelect(point)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(point); }} className="cursor-pointer">
          <circle cx={x} cy={y} r={active ? 16 : 12} fill={point.kind === "landmark" ? "#ffb45e" : point.kind === "facility" ? "#70d9bf" : "#94caff"} stroke="#112334" strokeWidth="4" />
          <text x={x + 15} y={y + 4} fill="#fff" fontSize="12" fontWeight="700" paintOrder="stroke" stroke="#142536" strokeWidth="4">{labels[point.id]}</text>
        </g>;
      })}
    </svg>
  );
}

export function KumbhDigitalTwin3D({ activeEvent, isRunning }: { activeEvent?: string; isRunning?: boolean }) {
  const [site, setSite] = useState<SiteId>("nashik");
  const [selectedId, setSelectedId] = useState("ramkund");
  const [filter, setFilter] = useState("");
  const [touring, setTouring] = useState(false);
  const [sceneError, setSceneError] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "dusk">("day");
  const mountRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const tourRef = useRef(0);

  const sitePlaces = useMemo(() => SIMULATION_PLACES.filter((point) => point.site === site), [site]);
  const filteredPlaces = useMemo(() => sitePlaces.filter((point) => `${point.name} ${point.area} ${point.portalName}`.toLowerCase().includes(filter.toLowerCase())), [sitePlaces, filter]);
  const selected = SIMULATION_PLACES.find((point) => point.id === selectedId) ?? sitePlaces[0];

  useEffect(() => {
    const placeId = new URLSearchParams(window.location.search).get("place");
    const point = SIMULATION_PLACES.find((item) => item.id === placeId);
    if (point) {
      setSite(point.site);
      setSelectedId(point.id);
    }
  }, []);

  const flyTo = useCallback((point: SimulationPlace) => {
    setSelectedId(point.id);
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const [x, y, z] = point.position;
    runtime.targetPosition = new THREE.Vector3(x + 24, y + 23, z + 27);
    runtime.targetLook = new THREE.Vector3(x, 1, z);
  }, []);

  const chooseSite = (nextSite: SiteId) => {
    setSite(nextSite);
    setSelectedId(SIMULATION_PLACES.find((point) => point.site === nextSite)?.id ?? "ramkund");
    setFilter("");
    setTouring(false);
    tourRef.current = 0;
  };

  const resetView = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.targetPosition = new THREE.Vector3(75, 78, 102);
    runtime.targetLook = new THREE.Vector3(0, 0, 0);
  };

  useEffect(() => {
    if (!touring) return;
    const timer = window.setInterval(() => {
      tourRef.current = (tourRef.current + 1) % sitePlaces.length;
      flyTo(sitePlaces[tourRef.current]);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [touring, sitePlaces, flyTo]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "default" });
    } catch {
      setSceneError(true);
      return;
    }
    setSceneError(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewMode === "day" ? 0x132537 : 0x211a2c);
    scene.fog = new THREE.Fog(scene.background, 145, 330);
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / Math.max(container.clientHeight, 1), 1, 500);
    camera.position.set(75, 78, 102);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 16;
    controls.maxDistance = 230;
    controls.target.set(0, 0, 0);
    runtimeRef.current = { camera, controls, targetPosition: null, targetLook: null };

    scene.add(new THREE.HemisphereLight(viewMode === "day" ? 0xe8f2ff : 0xf5c897, 0x44523d, 2));
    const sun = new THREE.DirectionalLight(viewMode === "day" ? 0xffe6b7 : 0xffb775, 2.1);
    sun.position.set(-38, 85, 42);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -115;
    sun.shadow.camera.right = 115;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    scene.add(sun);

    if (site === "nashik") makeNashik(scene);
    else makeTrimbakeshwar(scene);
    const markers = new THREE.Group();
    const markerLookup = new Map<string, SimulationPlace>();
    for (const point of SIMULATION_PLACES.filter((item) => item.site === site)) {
      const group = new THREE.Group();
      group.position.set(...point.position);
      group.userData.placeId = point.id;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, Math.max(point.position[1] - 0.7, 1), 6), new THREE.MeshBasicMaterial({ color: 0xffcc80, transparent: true, opacity: 0.7 }));
      stem.position.y = -(point.position[1] - 0.7) / 2;
      group.add(stem);
      const circle = new THREE.Mesh(new THREE.SphereGeometry(point.kind === "landmark" ? 1.75 : 1.4, 12, 8), new THREE.MeshStandardMaterial({ color: point.kind === "landmark" ? 0xffab52 : point.kind === "facility" ? 0x72c9b5 : 0x80baff, emissive: point.kind === "landmark" ? 0x75400e : 0x183b52, emissiveIntensity: 0.8 }));
      group.add(circle);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      group.add(hit);
      markers.add(group);
      markerLookup.set(point.id, point);
    }
    scene.add(markers);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markers.children, true);
      if (!hits.length) return;
      let object: THREE.Object3D | null = hits[0].object;
      while (object && !object.userData.placeId) object = object.parent;
      const point = markerLookup.get(object?.userData.placeId as string);
      if (point) flyTo(point);
    };
    renderer.domElement.addEventListener("pointerup", onPointer);
    const observer = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    observer.observe(container);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const runtime = runtimeRef.current;
      if (runtime?.targetPosition && runtime.targetLook) {
        camera.position.lerp(runtime.targetPosition, 0.065);
        controls.target.lerp(runtime.targetLook, 0.065);
        if (camera.position.distanceTo(runtime.targetPosition) < 0.4) {
          runtime.targetPosition = null;
          runtime.targetLook = null;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerup", onPointer);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      runtimeRef.current = null;
    };
  }, [site, viewMode, flyTo]);

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-700/70 bg-[#0d1523] shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 md:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400"><Compass className="h-4 w-4" /> Explore the Kumbh places</div>
          <h3 className="text-lg font-bold text-white">Nashik–Trimbakeshwar interactive 3D guide</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">Choose a place, see why it matters, then open the related project portal. Place relationships are simplified for learning; this is not a navigation or official facility map.</p>
        </div>
        <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1" role="group" aria-label="Choose area">
          {(["nashik", "trimbakeshwar"] as SiteId[]).map((item) => (
            <button key={item} type="button" onClick={() => chooseSite(item)} aria-pressed={site === item} className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${site === item ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}>{item === "nashik" ? "Nashik" : "Trimbakeshwar"}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[245px_minmax(0,1fr)_285px]">
        <aside className="order-3 border-t border-slate-800 bg-[#101a2a] p-4 lg:order-1 lg:border-r lg:border-t-0" aria-label="Places and portals">
          <div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-bold text-white">Places & portals</h4><span className="text-xs text-slate-500">{sitePlaces.length} stops</span></div>
          <label className="mb-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-400"><Search className="h-4 w-4" /><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find a place or portal" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500" aria-label="Find a place or portal" /></label>
          <div className="max-h-[500px] space-y-1 overflow-y-auto pr-1">
            {filteredPlaces.map((point) => (
              <div key={point.id} className={`flex items-center rounded-xl border transition-colors ${selected.id === point.id ? "border-amber-500/60 bg-amber-500/10" : "border-transparent hover:border-slate-700 hover:bg-slate-800/70"}`}>
                <button type="button" onClick={() => flyTo(point)} aria-pressed={selected.id === point.id} className="min-w-0 flex-1 px-3 py-2.5 text-left">
                  <span className="flex items-start gap-2"><MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${point.kind === "landmark" ? "text-[#9d4d25]" : point.kind === "facility" ? "text-[#176b63]" : "text-[#315e85]"}`} /><span><span className="block text-xs font-semibold text-white">{point.name}</span><span className="mt-0.5 block text-[11px] text-slate-400">{point.portalName} · {point.example ? "Example" : "Landmark"}</span></span></span>
                </button>
                <Link href={simulationPortalHref(point)} aria-label={`Open ${point.portalName} for ${point.name}`} title={`Open ${point.portalName}`} className="mr-2 rounded-lg p-2 text-amber-300 hover:bg-amber-500/15"><ArrowRight className="h-4 w-4" /></Link>
              </div>
            ))}
            {filteredPlaces.length === 0 && <p className="px-2 py-5 text-xs text-slate-400">No matching places in this area.</p>}
          </div>
        </aside>

        <div className="relative order-1 min-h-[450px] bg-[#132537] lg:order-2 lg:min-h-[575px]">
          <div ref={mountRef} className="absolute inset-0" aria-label={`Interactive 3D model of ${siteCopy[site].title}`} />
          {sceneError && <FallbackScene site={site} selectedId={selected.id} places={sitePlaces} onSelect={flyTo} />}
          <div className="pointer-events-none absolute left-3 top-3 right-3 flex flex-wrap items-start justify-between gap-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/85 px-3 py-2 backdrop-blur"><div className="text-sm font-bold text-white">{siteCopy[site].title}</div><div className="text-[11px] text-slate-300">{siteCopy[site].subtitle}</div></div>
            <div className="rounded-lg border border-amber-400/30 bg-slate-950/85 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">Illustrative 3D scene</div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
            <div className="flex gap-1 rounded-xl border border-slate-700 bg-slate-950/90 p-1 backdrop-blur">
              <button type="button" onClick={resetView} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800"><RotateCcw className="h-3.5 w-3.5" /> Overview</button>
              <button type="button" onClick={() => setViewMode(viewMode === "day" ? "dusk" : "day")} className="rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800">{viewMode === "day" ? "Dusk view" : "Day view"}</button>
            </div>
            <button type="button" onClick={() => { tourRef.current = 0; flyTo(sitePlaces[0]); setTouring(!touring); }} className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400">{touring ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{touring ? "Pause tour" : "Guided tour"}</button>
          </div>
          <div className="pointer-events-none absolute bottom-16 left-3 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[11px] text-slate-200">{sceneError ? "2D fallback · select a labelled place" : "Drag to rotate · scroll to zoom · click a marker"}</div>
        </div>

        <aside className="order-2 border-t border-slate-800 bg-[#101a2a] p-4 lg:order-3 lg:border-l lg:border-t-0" aria-live="polite">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${selected.example ? "bg-[#e1edf4] text-[#315e85]" : "bg-[#f9ead6] text-[#805017]"}`}>{selected.example ? "Illustrative placement" : "Known landmark"}</span>
          <h4 className="mt-4 text-lg font-bold leading-tight text-white">{selected.name}</h4>
          <p className="mt-1 text-xs text-amber-300">{selected.area}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{selected.description}</p>
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/50 p-3"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">What this portal explains</div><div className="mt-1 text-xs leading-relaxed text-slate-200">{selected.portalPurpose}</div></div>
          <Link href={simulationPortalHref(selected)} className="mt-5 flex w-full items-center justify-between rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400"><span>Open {selected.portalName}</span><ArrowRight className="h-4 w-4" /></Link>
          {selected.mapUrl && <a href={selected.mapUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#17656a] hover:underline"><ExternalLink className="h-3.5 w-3.5" /> View real landmark on OpenStreetMap</a>}
          <div className="mt-6 border-t border-slate-800 pt-4 text-[11px] leading-relaxed text-slate-400"><Info className="mr-1 inline h-3.5 w-3.5" />{selected.example ? "Pin location and facility design are examples for the project demo." : "Landmark identity is sourced from Nashik district tourism information; the 3D shape and spacing are simplified."}</div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 px-4 py-3 text-[11px] text-slate-400 md:px-6"><span>Scene focus: {siteCopy[site].keyPlaces}</span><span>{isRunning ? `Scenario running${activeEvent ? ` · ${activeEvent.replaceAll("_", " ")}` : ""}` : "Scenario idle"} · No live location or safety directions</span></div>
    </section>
  );
}
