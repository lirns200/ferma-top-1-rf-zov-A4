import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import {
  createBarnGroup,
  createSiloGroup,
  createProductionBuildingGroup,
  createAnimalPenGroup,
  createCropStageMesh,
  createTreeBushMesh,
  createDecorationMesh,
} from '../world/ModelGenerators';

const thumbnailDataUrlCache = new Map<string, string>();

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedScene: THREE.Scene | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;

function getSharedOffscreenContext() {
  if (!sharedRenderer && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    sharedRenderer.setSize(128, 128, false);
    sharedRenderer.setClearColor(0x000000, 0);

    sharedScene = new THREE.Scene();

    // Warm, vibrant isometric lighting
    const ambient = new THREE.AmbientLight(0xfff6e6, 1.4);
    sharedScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 10, 7);
    sharedScene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.8);
    fillLight.position.set(-5, 4, -4);
    sharedScene.add(fillLight);

    sharedCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  }
  return { renderer: sharedRenderer, scene: sharedScene, camera: sharedCamera };
}

export function generateBuildingThumbnailDataUrl(id: string): string {
  if (thumbnailDataUrlCache.has(id)) {
    return thumbnailDataUrlCache.get(id)!;
  }

  const { renderer, scene, camera } = getSharedOffscreenContext();
  if (!renderer || !scene || !camera) return '';

  let model: THREE.Object3D;

  if (id === 'field_plot') {
    const grp = new THREE.Group();
    // Tilled soil bed
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 2.2),
      new THREE.MeshLambertMaterial({ color: 0x5C3718 })
    );
    soil.position.y = 0.15;
    grp.add(soil);
    const crop = createCropStageMesh('wheat', 4, '#FACC15');
    crop.scale.set(0.9, 0.9, 0.9);
    crop.position.y = 0.35;
    grp.add(crop);
    model = grp;
  } else if (id === 'silo') {
    model = createSiloGroup();
  } else if (id === 'barn') {
    model = createBarnGroup('summer');
  } else if (id === 'chicken_coop' || id === 'cow_pasture' || id === 'sheep_pen' || id === 'pig_pen') {
    model = createAnimalPenGroup(id);
  } else if (
    id === 'bakery' || id === 'feed_mill' || id === 'dairy' ||
    id === 'sugar_mill' || id === 'popcorn_pot' || id === 'grill'
  ) {
    model = createProductionBuildingGroup(id);
  } else if (id === 'apple_tree' || id === 'cherry_tree' || id === 'berry_bush') {
    model = createTreeBushMesh(id, 'summer', true);
  } else {
    model = createDecorationMesh(id) || createBarnGroup('summer');
  }

  // Clear previous models from scene (keeping lights)
  const toRemove: THREE.Object3D[] = [];
  scene.children.forEach(c => {
    if (!(c instanceof THREE.Light)) toRemove.push(c);
  });
  toRemove.forEach(c => scene.remove(c));

  scene.add(model);

  // Auto-frame model with bounding box
  const bbox = new THREE.Box3().setFromObject(model);
  const center = bbox.getCenter(new THREE.Vector3());
  const size = bbox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1.5);

  // Rotate model slightly for classic isometric angle
  model.position.x = -center.x;
  model.position.y = -center.y;
  model.position.z = -center.z;
  model.rotation.y = Math.PI / 4;

  const dist = maxDim * 2.2;
  camera.position.set(dist * 0.9, dist * 0.8, dist * 0.9);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);

  const dataUrl = renderer.domElement.toDataURL('image/png');
  thumbnailDataUrlCache.set(id, dataUrl);

  scene.remove(model);
  return dataUrl;
}

export const Building3DThumbnail: React.FC<{
  buildingId: string;
  fallbackEmoji?: string;
  className?: string;
  size?: number;
}> = ({ buildingId, fallbackEmoji = '🏡', className = 'w-10 h-10', size = 44 }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(() => thumbnailDataUrlCache.get(buildingId) || null);

  useEffect(() => {
    if (!dataUrl) {
      try {
        const url = generateBuildingThumbnailDataUrl(buildingId);
        setDataUrl(url);
      } catch (err) {
        console.error('Error generating 3D thumbnail for:', buildingId, err);
      }
    }
  }, [buildingId, dataUrl]);

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={buildingId}
        className={`${className} object-contain filter drop-shadow-md select-none pointer-events-none transition-transform`}
        style={{ width: size, height: size }}
      />
    );
  }

  return <span className="text-2xl sm:text-3xl select-none">{fallbackEmoji}</span>;
};
