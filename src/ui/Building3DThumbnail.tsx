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
    canvas.width = 256;
    canvas.height = 256;
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    sharedRenderer.setSize(256, 256, false);
    sharedRenderer.setClearColor(0x000000, 0);

    sharedScene = new THREE.Scene();

    // Warm, vibrant isometric lighting
    const ambient = new THREE.AmbientLight(0xfff8ee, 1.6);
    sharedScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 10, 7);
    sharedScene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
    fillLight.position.set(-5, 4, -4);
    sharedScene.add(fillLight);

    sharedCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  }
  return { renderer: sharedRenderer, scene: sharedScene, camera: sharedCamera };
}

// ── PROCEDURAL 3D SHOP & BANK MODELS ──
function createCoinsHandfulModel(): THREE.Group {
  const grp = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.85, roughness: 0.2 });
  const goldDarkMat = new THREE.MeshStandardMaterial({ color: 0xCA8A04, metalness: 0.8, roughness: 0.25 });

  // Stack of 6 shiny gold coins
  const positions = [
    [-0.3, 0.08, -0.2, 0.1],
    [0.2, 0.08, 0.1, -0.15],
    [-0.1, 0.22, 0.0, 0.05],
    [0.3, 0.22, -0.2, 0.2],
    [0.0, 0.36, -0.1, -0.08],
    [0.1, 0.50, 0.0, 0.12],
  ];

  positions.forEach(([x, y, z, rot]) => {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 24), goldMat);
    coin.position.set(x, y, z);
    coin.rotation.z = rot;
    coin.rotation.x = rot * 0.5;
    grp.add(coin);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 8, 24), goldDarkMat);
    rim.position.set(x, y, z + 0.05);
    rim.rotation.x = Math.PI / 2;
    grp.add(rim);
  });

  return grp;
}

function createCoinsPouchModel(): THREE.Group {
  const grp = new THREE.Group();
  const pouchMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.85, roughness: 0.2 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xFEF08A, roughness: 0.4 });

  // Pouch Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 20), pouchMat);
  body.scale.set(1.1, 1.0, 1.1);
  body.position.y = 0.55;
  grp.add(body);

  // Pouch Neck & Fold
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.35, 16), pouchMat);
  neck.position.y = 1.05;
  grp.add(neck);

  // Golden Rope Tie
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 20), ropeMat);
  tie.position.y = 0.95;
  tie.rotation.x = Math.PI / 2;
  grp.add(tie);

  // Coins spilling at the base
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16), goldMat);
    coin.position.set(0.4 + i * 0.15, 0.05 + i * 0.05, 0.3 - i * 0.1);
    coin.rotation.x = 0.2;
    coin.rotation.z = -0.3 + i * 0.2;
    grp.add(coin);
  }

  return grp;
}

function createCoinsChestModel(): THREE.Group {
  const grp = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.8, roughness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFDE047, metalness: 0.9, roughness: 0.15 });

  // Chest Base Box
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 0.9), woodMat);
  base.position.y = 0.35;
  grp.add(base);

  // Open Lid (Tilted back)
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.22, 16, 1, false, 0, Math.PI), woodMat);
  lid.rotation.z = Math.PI / 2;
  lid.rotation.x = -Math.PI * 0.6;
  lid.position.set(0, 0.7, -0.3);
  grp.add(lid);

  // Golden treasure pile inside
  const treasure = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), goldMat);
  treasure.scale.set(1.1, 0.5, 0.8);
  treasure.position.set(0, 0.68, 0.05);
  grp.add(treasure);

  // Metal Corner Bands
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.1), ironMat);
  lock.position.set(0, 0.45, 0.46);
  grp.add(lock);

  return grp;
}

function createCoinsVaultModel(): THREE.Group {
  const grp = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.9, roughness: 0.2 });
  const dialMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });

  // Safe Cabinet
  const safe = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 1.0), steelMat);
  safe.position.y = 0.65;
  grp.add(safe);

  // Safe Door Frame
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.1), steelMat);
  door.position.set(0, 0.65, 0.52);
  grp.add(door);

  // Dial Wheel
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 20), dialMat);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.65, 0.6);
  grp.add(dial);

  // Golden Ingot Stack on top
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), goldMat);
  bar.position.set(0, 1.35, 0);
  grp.add(bar);

  return grp;
}

function createEnergyPotionModel(): THREE.Group {
  const grp = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.75, roughness: 0.1 });
  const liquidMat = new THREE.MeshStandardMaterial({ color: 0x0EA5E9, emissive: 0x0284C7, emissiveIntensity: 0.6, roughness: 0.2 });
  const corkMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.8 });

  // Flask Bulb
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), glassMat);
  bulb.position.y = 0.55;
  grp.add(bulb);

  // Glowing Liquid Core
  const liquid = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 16), liquidMat);
  liquid.position.y = 0.5;
  grp.add(liquid);

  // Flask Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.45, 16), glassMat);
  neck.position.y = 1.05;
  grp.add(neck);

  // Cork Stopper
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.25, 16), corkMat);
  cork.position.y = 1.3;
  grp.add(cork);

  return grp;
}

function createEnergyBarrelModel(): THREE.Group {
  const grp = new THREE.Group();
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.4, metalness: 0.3 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x0369A1, metalness: 0.8, roughness: 0.2 });
  const boltMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, emissive: 0xEAB308, emissiveIntensity: 0.8 });

  // Barrel Body
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.15, 20), blueMat);
  barrel.position.y = 0.6;
  grp.add(barrel);

  // Metal Rings
  [-0.35, 0, 0.35].forEach(yOffset => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 8, 20), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.6 + yOffset;
    grp.add(ring);
  });

  // Glowing Lightning Emblem
  const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.08), boltMat);
  bolt.position.set(0, 0.6, 0.48);
  bolt.rotation.z = -0.2;
  grp.add(bolt);

  return grp;
}

function createEnergyGeneratorModel(): THREE.Group {
  const grp = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.6, roughness: 0.4 });
  const coilMat = new THREE.MeshStandardMaterial({ color: 0xB45309, metalness: 0.9, roughness: 0.2 });
  const plasmaMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, emissive: 0x0284C7, emissiveIntensity: 1.0 });

  // Heavy Metal Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.3, 16), baseMat);
  base.position.y = 0.15;
  grp.add(base);

  // Copper Coils
  const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.75, 16), coilMat);
  coil.position.y = 0.65;
  grp.add(coil);

  // Glowing Plasma Core
  const plasma = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), plasmaMat);
  plasma.position.y = 1.25;
  grp.add(plasma);

  // Energy Rings
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 8, 20), plasmaMat);
  ring.position.y = 1.25;
  ring.rotation.x = Math.PI / 3;
  grp.add(ring);

  return grp;
}

function createEnergyPerpetualModel(): THREE.Group {
  const grp = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.9, roughness: 0.1 });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, emissive: 0x0284C7, emissiveIntensity: 1.2 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xA855F7, emissive: 0x7E22CE, emissiveIntensity: 0.6 });

  // Floating Glowing Core
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), coreMat);
  core.position.y = 0.75;
  grp.add(core);

  // Gyro Ring 1
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 8, 24), goldMat);
  ring1.position.y = 0.75;
  ring1.rotation.x = Math.PI / 4;
  grp.add(ring1);

  // Gyro Ring 2
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 24), ringMat);
  ring2.position.y = 0.75;
  ring2.rotation.y = Math.PI / 3;
  grp.add(ring2);

  return grp;
}

function createVipCrownModel(): THREE.Group {
  const grp = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.9, roughness: 0.15 });
  const rubyMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xDC2626, emissiveIntensity: 0.5 });
  const emeraldMat = new THREE.MeshStandardMaterial({ color: 0x10B981, emissive: 0x059669, emissiveIntensity: 0.5 });

  // Crown Base Band
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 20), goldMat);
  base.position.y = 0.2;
  grp.add(base);

  // 5 Crown Points
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), goldMat);
    pt.position.set(Math.cos(angle) * 0.55, 0.6, Math.sin(angle) * 0.55);
    grp.add(pt);

    // Jewel on each point
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), i % 2 === 0 ? rubyMat : emeraldMat);
    gem.position.set(Math.cos(angle) * 0.55, 0.88, Math.sin(angle) * 0.55);
    grp.add(gem);
  }

  return grp;
}

function createStarterRocketModel(): THREE.Group {
  const grp = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.3 });
  const fireMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, emissive: 0xF97316, emissiveIntensity: 1.0 });

  // Rocket Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.1, 16), whiteMat);
  body.position.y = 0.75;
  grp.add(body);

  // Nose Cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.55, 16), redMat);
  nose.position.y = 1.55;
  grp.add(nose);

  // Fins
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.35), redMat);
    fin.position.set(Math.cos(angle) * 0.45, 0.4, Math.sin(angle) * 0.45);
    fin.rotation.y = -angle;
    grp.add(fin);
  }

  // Thruster Flame
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 8), fireMat);
  flame.rotation.x = Math.PI;
  flame.position.y = 0.05;
  grp.add(flame);

  return grp;
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
    const soil = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 2.0), new THREE.MeshLambertMaterial({ color: 0x543214 }));
    soil.position.y = 0.15;
    grp.add(soil);
    const offsets = [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45], [0, 0]];
    offsets.forEach(([ox, oz]) => {
      const crop = createCropStageMesh('wheat', 4, '#FACC15');
      crop.scale.set(0.72, 0.72, 0.72);
      crop.position.set(ox, 0.3, oz);
      grp.add(crop);
    });
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
  } else if (id === 'coins_handful') {
    model = createCoinsHandfulModel();
  } else if (id === 'coins_pouch') {
    model = createCoinsPouchModel();
  } else if (id === 'coins_chest') {
    model = createCoinsChestModel();
  } else if (id === 'coins_vault') {
    model = createCoinsVaultModel();
  } else if (id === 'energy_potion') {
    model = createEnergyPotionModel();
  } else if (id === 'energy_barrel') {
    model = createEnergyBarrelModel();
  } else if (id === 'energy_generator') {
    model = createEnergyGeneratorModel();
  } else if (id === 'energy_perpetual') {
    model = createEnergyPerpetualModel();
  } else if (id === 'vip_club_pass') {
    model = createVipCrownModel();
  } else if (id === 'starter_pack') {
    model = createStarterRocketModel();
  } else if (id === 'architect_chest') {
    model = createCoinsChestModel();
  } else if (id === 'magnate_vault') {
    model = createCoinsVaultModel();
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
  const maxDim = Math.max(size.x, size.y, size.z, 1.4);

  model.position.x = -center.x;
  model.position.y = -center.y;
  model.position.z = -center.z;
  model.rotation.y = Math.PI / 4;

  const dist = maxDim * 1.55;
  camera.position.set(dist * 0.88, dist * 0.76, dist * 0.88);
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
}> = ({ buildingId, fallbackEmoji = '🏡', className = '', size = 52 }) => {
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
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
  }

  return <span className="text-3xl select-none">{fallbackEmoji}</span>;
};
