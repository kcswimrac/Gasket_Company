"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

interface RenderPreviewProps {
  fileUrl: string;
  fileName: string;
  partId: string;
  onRendered: () => void;
}

const VIEWS = [
  { label: "front", position: [0, 0, 1] as [number, number, number] },
  { label: "right", position: [1, 0, 0] as [number, number, number] },
  { label: "top", position: [0, 1, 0] as [number, number, number] },
  { label: "iso", position: [1, 1, 1] as [number, number, number] },
];

async function loadStepMesh(url: string): Promise<THREE.BufferGeometry | null> {
  try {
    const occtModule = await import("occt-import-js").catch(() => null);
    if (!occtModule) return null;
    const occt = await occtModule.default({ locateFile: () => "/occt-import-js.wasm" }).catch(() => null);
    if (!occt) return null;

    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const result = occt.ReadStepFile(new Uint8Array(buffer), null);
    if (!result.meshes?.length) return null;

    const positions: number[] = [];
    const normals: number[] = [];
    for (const m of result.meshes) {
      if (m.index?.array && m.attributes?.position?.array) {
        const pos = m.attributes.position.array;
        const norm = m.attributes.normal?.array;
        for (let i = 0; i < m.index.array.length; i++) {
          const idx = m.index.array[i];
          positions.push(pos[idx * 3], pos[idx * 3 + 1], pos[idx * 3 + 2]);
          if (norm) normals.push(norm[idx * 3], norm[idx * 3 + 1], norm[idx * 3 + 2]);
        }
      }
    }
    if (!positions.length) return null;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length) geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    else geom.computeVertexNormals();
    return geom;
  } catch { return null; }
}

function renderToCanvas(geometry: THREE.BufferGeometry, cameraDir: [number, number, number], size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(size, size, false);
  renderer.setClearColor(0xffffff, 1);

  const scene = new THREE.Scene();
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox!.getCenter(center);
  const bsize = new THREE.Vector3();
  geometry.boundingBox!.getSize(bsize);
  const maxDim = Math.max(bsize.x, bsize.y, bsize.z);

  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x7a8a9a, specular: 0x333333, shininess: 30 }));
  mesh.position.sub(center);
  scene.add(mesh);

  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), new THREE.LineBasicMaterial({ color: 0x334455 }));
  edges.position.sub(center);
  scene.add(edges);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
  d1.position.set(2, 3, 4);
  scene.add(d1);

  const f = maxDim * 1.3;
  const camera = new THREE.OrthographicCamera(-f / 2, f / 2, f / 2, -f / 2, -maxDim * 10, maxDim * 10);
  const dir = new THREE.Vector3(...cameraDir).normalize();
  camera.position.copy(dir.multiplyScalar(maxDim * 2));
  camera.lookAt(0, 0, 0);
  if (Math.abs(cameraDir[1]) > 0.9 && Math.abs(cameraDir[0]) < 0.1 && Math.abs(cameraDir[2]) < 0.1) camera.up.set(0, 0, -1);

  renderer.render(scene, camera);
  renderer.dispose();
  return canvas;
}

export default function RenderPreviewButton({ fileUrl, fileName, partId, onRendered }: RenderPreviewProps) {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRender = async () => {
    setRendering(true);
    setProgress("Loading CAD file...");

    try {
      let geometry: THREE.BufferGeometry | null = null;
      const isStep = /\.(step|stp|iges|igs)$/i.test(fileName);
      const isStl = /\.stl$/i.test(fileName);

      if (isStl) {
        geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
          new STLLoader().load(fileUrl, resolve, undefined, reject);
        });
      } else if (isStep) {
        geometry = await loadStepMesh(fileUrl);
      }

      if (!geometry) {
        setProgress("Failed to parse CAD file");
        setRendering(false);
        return;
      }

      geometry.computeVertexNormals();
      setProgress("Rendering views...");

      for (let i = 0; i < VIEWS.length; i++) {
        const view = VIEWS[i];
        setProgress(`Rendering ${view.label} view (${i + 1}/${VIEWS.length})...`);

        const canvas = renderToCanvas(geometry, view.position, 1024);

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });

        // Upload as part file
        setProgress(`Uploading ${view.label} view...`);
        const fd = new FormData();
        fd.append("file", blob, `preview_${view.label}.png`);
        fd.append("partId", partId);
        fd.append("fileType", "photo_finished");
        fd.append("showInCatalog", "true");
        await fetch("/api/admin/parts/files", { method: "POST", body: fd });
      }

      setProgress("Done! 4 preview images uploaded.");
      onRendered();
    } catch (e) {
      setProgress(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setRendering(false);
    }
  };

  return (
    <div ref={containerRef}>
      <button
        onClick={handleRender}
        disabled={rendering}
        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50 flex items-center gap-1"
      >
        {rendering ? (
          <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {progress}</>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /></svg>
            Generate Preview Images
          </>
        )}
      </button>
    </div>
  );
}
