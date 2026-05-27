"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

interface CadViewerProps {
  url: string;
  fileName?: string;
  className?: string;
}

const VIEWS = [
  { label: "Front", position: [0, 0, 1] as [number, number, number] },
  { label: "Right", position: [1, 0, 0] as [number, number, number] },
  { label: "Top", position: [0, 1, 0] as [number, number, number] },
  { label: "Iso", position: [1, 1, 1] as [number, number, number] },
];

function renderView(
  canvas: HTMLCanvasElement,
  geometry: THREE.BufferGeometry,
  cameraDir: [number, number, number]
) {
  const width = canvas.clientWidth * (typeof window !== "undefined" ? window.devicePixelRatio : 1);
  const height = canvas.clientHeight * (typeof window !== "undefined" ? window.devicePixelRatio : 1);
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setClearColor(0xffffff, 1);

  const scene = new THREE.Scene();

  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  const material = new THREE.MeshPhongMaterial({
    color: 0x7a8a9a,
    specular: 0x333333,
    shininess: 30,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.sub(center);
  scene.add(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 25),
    new THREE.LineBasicMaterial({ color: 0x334455 })
  );
  edges.position.sub(center);
  scene.add(edges);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 3, 4);
  scene.add(dir);
  const dir2 = new THREE.DirectionalLight(0x6688aa, 0.3);
  dir2.position.set(-2, -1, -2);
  scene.add(dir2);

  const aspect = width / height;
  const f = maxDim * 1.3;
  const camera = new THREE.OrthographicCamera(-f * aspect / 2, f * aspect / 2, f / 2, -f / 2, -maxDim * 10, maxDim * 10);

  const d = new THREE.Vector3(...cameraDir).normalize();
  camera.position.copy(d.multiplyScalar(maxDim * 2));
  camera.lookAt(0, 0, 0);
  if (Math.abs(cameraDir[1]) > 0.9 && Math.abs(cameraDir[0]) < 0.1 && Math.abs(cameraDir[2]) < 0.1) {
    camera.up.set(0, 0, -1);
  }

  renderer.render(scene, camera);
  renderer.dispose();
}

async function loadStepGeometry(url: string): Promise<THREE.BufferGeometry | null> {
  try {
    const occtImport = await import("occt-import-js");
    const occt = await occtImport.default();

    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const result = occt.ReadStepFile(new Uint8Array(buffer), null);

    if (!result.meshes || result.meshes.length === 0) return null;

    const allPositions: number[] = [];
    const allNormals: number[] = [];

    for (const m of result.meshes) {
      if (m.index && m.attributes?.position?.array) {
        const pos = m.attributes.position.array;
        const norm = m.attributes.normal?.array;
        for (let i = 0; i < m.index.array.length; i++) {
          const idx = m.index.array[i];
          allPositions.push(pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2]);
          if (norm) allNormals.push(norm[idx * 3], norm[idx * 3 + 1], norm[idx * 3 + 2]);
        }
      }
    }

    if (allPositions.length === 0) return null;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
    if (allNormals.length > 0) {
      geom.setAttribute("normal", new THREE.Float32BufferAttribute(allNormals, 3));
    } else {
      geom.computeVertexNormals();
    }
    return geom;
  } catch {
    return null;
  }
}

export default function CadViewer({ url, fileName = "", className = "" }: CadViewerProps) {
  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const isStep = /\.(step|stp|iges|igs)$/i.test(fileName) || /\.(step|stp|iges|igs)/i.test(url);
    const isStl = /\.stl$/i.test(fileName) || /\.stl/i.test(url);

    async function load() {
      try {
        let geometry: THREE.BufferGeometry | null = null;

        if (isStl || (!isStep && !isStl)) {
          // Try STL first
          geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            new STLLoader().load(url, resolve, undefined, reject);
          });
        }

        if (!geometry && (isStep || !isStl)) {
          // Try STEP
          geometry = await loadStepGeometry(url);
        }

        if (!geometry) {
          setError("Could not parse file");
          setLoading(false);
          return;
        }

        geometry.computeVertexNormals();

        VIEWS.forEach((view, i) => {
          const canvas = canvasRefs[i].current;
          if (canvas) renderView(canvas, geometry!, view.position);
        });

        setLoading(false);
      } catch {
        setError("Failed to load 3D model");
        setLoading(false);
      }
    }

    load();
  }, [url, fileName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return <div className={`text-center py-4 ${className}`}><p className="text-[10px] text-charcoal-500">{error}</p></div>;
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal-950/60 z-10 rounded">
          <svg className="animate-spin w-5 h-5 text-charcoal-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1">
        {VIEWS.map((view, i) => (
          <div key={view.label} className="relative bg-white rounded overflow-hidden">
            <canvas ref={canvasRefs[i]} className="w-full aspect-square" />
            <span className="absolute bottom-0.5 left-1 text-[7px] font-mono text-gray-400 uppercase tracking-wider">{view.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
