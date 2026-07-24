import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RefreshCw, Eye, Sparkles, Move3D } from 'lucide-react';
import { ImageAnalysisData } from '../../types';
import { soundEngine } from '../../utils/audio';

interface ThreeDColorCubeProps {
  imageData: ImageAnalysisData;
}

export const ThreeDColorCube: React.FC<ThreeDColorCubeProps> = ({ imageData }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [pointSize, setPointSize] = useState<number>(0.04);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    soundEngine.playClick();

    // Three.js Scene Setup
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(2.2, 2.2, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Draw RGB Bounding Wireframe Box
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    scene.add(boxMesh);

    // Sample image pixels for 3D point cloud
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageData.dataUrl;

    let pointsMesh: THREE.Points | null = null;

    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const sampleSize = 80;
      tempCanvas.width = sampleSize;
      tempCanvas.height = sampleSize;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      const positions: number[] = [];
      const colors: number[] = [];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        // Map [0, 1] RGB to [-1, 1] 3D coordinates
        positions.push(r * 2 - 1, g * 2 - 1, b * 2 - 1);
        colors.push(r, g, b);
      }

      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      pGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const pMat = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });

      pointsMesh = new THREE.Points(pGeo, pMat);
      scene.add(pointsMesh);
    };

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isRotating && scene) {
        scene.rotation.y += 0.005;
        scene.rotation.x += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [imageData.dataUrl, isRotating]);

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Move3D className="w-5 h-5 text-cyan-400" />
            <span>3D RGB Color Cloud Space</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Spatial distribution of pixel colors mapped into 3D Cartesian coordinates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all ${
              isRotating
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-800 border-white/10 text-slate-400'
            }`}
          >
            {isRotating ? 'Auto-Rotate: ON' : 'Pause'}
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full" />

        {/* Axis Labels Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 backdrop-blur text-[10px] font-mono space-y-1">
          <div className="text-rose-400">X-Axis = Red Intensity</div>
          <div className="text-emerald-400">Y-Axis = Green Intensity</div>
          <div className="text-cyan-400">Z-Axis = Blue Intensity</div>
        </div>
      </div>
    </div>
  );
};
