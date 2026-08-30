import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VehicleModelId } from '../../config/vehicles';
import { createVehicleModel } from '../../world/models/vehicles/VehicleModels';

interface Vehicle3DShowroomProps {
  modelId: VehicleModelId;
  autoRotate?: boolean;
}

export const Vehicle3DShowroom: React.FC<Vehicle3DShowroomProps> = ({
  modelId,
  autoRotate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const autoRotateSpeedRef = useRef(0.85);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 320;
    const height = containerRef.current.clientHeight || 260;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.3, 5.3);
    camera.lookAt(0, 0.68, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambient = new THREE.AmbientLight(0xFFFBEB, 1.4);
    scene.add(ambient);

    const mainSpot = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    mainSpot.position.set(4, 6, 4);
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 512;
    mainSpot.shadow.mapSize.height = 512;
    scene.add(mainSpot);

    const rimLight = new THREE.DirectionalLight(0x7DD3FC, 1.1);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight(0xF59E0B, 1.5, 10);
    warmFill.position.set(0, 3.5, 2.5);
    scene.add(warmFill);

    // Circular Wooden Pedestal / Turntable Platform
    const pedestalGeo = new THREE.CylinderGeometry(1.85, 1.95, 0.22, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x542D0C,
      roughness: 0.7,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.11, 0);
    pedestal.receiveShadow = true;

    // Golden Rim on Turntable
    const goldRimGeo = new THREE.TorusGeometry(1.88, 0.045, 12, 48);
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xFDE047,
      roughness: 0.3,
      metalness: 0.85,
    });
    const goldRim = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.set(0, 0.01, 0);
    pedestal.add(goldRim);

    // Inner Inset Plate
    const innerPlateGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.04, 32);
    const innerPlateMat = new THREE.MeshStandardMaterial({
      color: 0x78350F,
      roughness: 0.8,
    });
    const innerPlate = new THREE.Mesh(innerPlateGeo, innerPlateMat);
    innerPlate.position.set(0, 0.02, 0);
    innerPlate.receiveShadow = true;
    pedestal.add(innerPlate);

    scene.add(pedestal);

    // Vehicle Group
    const vModel = createVehicleModel(modelId);
    vModel.position.set(0, 0.03, 0);
    scene.add(vModel);
    vehicleGroupRef.current = vModel;

    // Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (vModel) {
        // Continuous 360-degree Y-axis spin
        if (autoRotate && !isDraggingRef.current) {
          vModel.rotation.y += delta * autoRotateSpeedRef.current;
        }

        // Gentle floating suspension bounce
        vModel.position.y = 0.03 + Math.sin(now * 0.003) * 0.018;

        // Rotate wheels slightly
        vModel.traverse(child => {
          if (child.name === 'truck_wheel') {
            child.children.forEach(c => {
              c.rotation.y += delta * 1.5;
            });
          }
        });
      }

      pedestal.rotation.y = vModel ? vModel.rotation.y : 0;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelId, autoRotate]);

  // Pointer Drag Interaction for manual 360° spin
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !vehicleGroupRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    vehicleGroupRef.current.rotation.y += dx * 0.018;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* 360 Degree Badge Overlay */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-950/80 backdrop-blur-sm border border-amber-500/40 text-[10px] font-black text-amber-200 uppercase tracking-wider flex items-center gap-1 shadow-md pointer-events-none">
        <span>🔄</span>
        <span>Вращение 360°</span>
      </div>
    </div>
  );
};
