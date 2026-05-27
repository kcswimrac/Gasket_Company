"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

interface StlViewerProps {
  url: string;
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
  const width = canvas.clientWidth * window.devicePixelRatio;
  const height = canvas.clientHeight * window.devicePixelRatio;
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  // Center and scale geometry
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);

  // Mesh
  const material = new THREE.MeshPhongMaterial({
    color: 0x8899aa,
    specular: 0x222222,
    shininess: 40,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.sub(center);
  scene.add(mesh);

  // Wireframe overlay
  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 30),
    new THREE.LineBasicMaterial({ color: 0x445566, linewidth: 1 })
  );
  wireframe.position.sub(center);
  scene.add(wireframe);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dir1.position.set(1, 2, 3);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0x8888ff, 0.3);
  dir2.position.set(-2, -1, -1);
  scene.add(dir2);

  // Camera — orthographic for technical drawing feel
  const aspect = width / height;
  const frustumSize = maxDim * 1.3;
  const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    -maxDim * 10,
    maxDim * 10
  );

  const dir = new THREE.Vector3(...cameraDir).normalize();
  camera.position.copy(dir.multiplyScalar(maxDim * 2));
  camera.lookAt(0, 0, 0);

  // For top view, set up vector to avoid degenerate case
  if (Math.abs(cameraDir[1]) > 0.9 && Math.abs(cameraDir[0]) < 0.1 && Math.abs(cameraDir[2]) < 0.1) {
    camera.up.set(0, 0, -1);
  }

  renderer.render(scene, camera);
  renderer.dispose();
}

export default function StlViewer({ url, className = "" }: StlViewerProps) {
  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loader = new STLLoader();
    loader.load(url, (geometry) => {
      geometry.computeVertexNormals();

      VIEWS.forEach((view, i) => {
        const canvas = canvasRefs[i].current;
        if (canvas) {
          renderView(canvas, geometry, view.position);
        }
      });
    });
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`grid grid-cols-2 gap-1 ${className}`}>
      {VIEWS.map((view, i) => (
        <div key={view.label} className="relative bg-white rounded overflow-hidden">
          <canvas
            ref={canvasRefs[i]}
            className="w-full aspect-square"
          />
          <span className="absolute bottom-1 left-1.5 text-[8px] font-mono text-charcoal-400 uppercase tracking-wider bg-white/80 px-1 rounded">
            {view.label}
          </span>
        </div>
      ))}
    </div>
  );
}
