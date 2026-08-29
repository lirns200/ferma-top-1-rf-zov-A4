import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

const itemThumbnailCache = new Map<string, string>();

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

    // Studio 3-point isometric lighting for cute, glossy game icons
    const ambient = new THREE.AmbientLight(0xfff8ee, 1.8);
    sharedScene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight.position.set(5, 10, 7);
    sharedScene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-5, 4, -4);
    sharedScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.8);
    rimLight.position.set(0, -6, -6);
    sharedScene.add(rimLight);

    sharedCamera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  }
  return { renderer: sharedRenderer, scene: sharedScene, camera: sharedCamera };
}

// ── 3D PROCEDURAL ITEM MESH FACTORY ──
export function createItem3DModel(itemId: string): THREE.Group {
  const grp = new THREE.Group();

  switch (itemId) {
    // ── CROPS ──
    case 'wheat': {
      const mat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.4 });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xCA8A04, roughness: 0.6 });
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.3 });

      // Stalks
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), stemMat);
        stem.position.set(Math.cos(angle) * 0.15, 0.5, Math.sin(angle) * 0.15);
        stem.rotation.z = (Math.random() - 0.5) * 0.2;
        grp.add(stem);

        const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 8), mat);
        head.position.set(Math.cos(angle) * 0.18, 1.15, Math.sin(angle) * 0.18);
        grp.add(head);
      }
      const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 16), ribbonMat);
      ribbon.position.y = 0.55;
      ribbon.rotation.x = Math.PI / 2;
      grp.add(ribbon);
      break;
    }

    case 'corn': {
      const cornMat = new THREE.MeshStandardMaterial({ color: 0xFDE047, roughness: 0.3 });
      const huskMat = new THREE.MeshStandardMaterial({ color: 0x84CC16, roughness: 0.5 });

      const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.1, 16), cornMat);
      cob.position.y = 0.6;
      grp.add(cob);

      const top = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), cornMat);
      top.position.y = 1.15;
      grp.add(top);

      // Leaves / Husk
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.8, 6), huskMat);
        leaf.position.set(Math.cos(i * 2.1) * 0.25, 0.45, Math.sin(i * 2.1) * 0.25);
        leaf.rotation.x = 0.3;
        leaf.rotation.y = i * 2.1;
        grp.add(leaf);
      }
      break;
    }

    case 'carrot': {
      const orangeMat = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.4 });
      const greenMat = new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.5 });

      const body = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.2, 12), orangeMat);
      body.rotation.x = Math.PI;
      body.position.y = 0.65;
      grp.add(body);

      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 0.45, 6), greenMat);
        leaf.position.set(Math.cos(i * 1.5) * 0.08, 1.35, Math.sin(i * 1.5) * 0.08);
        leaf.rotation.z = (i % 2 === 0 ? 0.3 : -0.3);
        grp.add(leaf);
      }
      break;
    }

    case 'soybean': {
      const podMat = new THREE.MeshStandardMaterial({ color: 0x84CC16, roughness: 0.4 });
      const beanMat = new THREE.MeshStandardMaterial({ color: 0xA3E635, roughness: 0.3 });

      const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.8, 8, 16), podMat);
      pod.rotation.z = 0.35;
      pod.position.y = 0.6;
      grp.add(pod);

      for (let i = 0; i < 3; i++) {
        const bean = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), beanMat);
        bean.position.set(-0.25 + i * 0.25, 0.35 + i * 0.25, 0.1);
        grp.add(bean);
      }
      break;
    }

    case 'sugarcane': {
      const caneMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.4 });
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });

      for (let i = 0; i < 3; i++) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 10), caneMat);
        stalk.position.set((i - 1) * 0.22, 0.65, 0);
        grp.add(stalk);

        for (let j = 0; j < 3; j++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 6, 12), ringMat);
          ring.position.set((i - 1) * 0.22, 0.3 + j * 0.35, 0);
          ring.rotation.x = Math.PI / 2;
          grp.add(ring);
        }
      }
      break;
    }

    case 'cotton': {
      const fluffyMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.9 });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 8), stemMat);
      stem.position.y = 0.3;
      grp.add(stem);

      const puffs = [
        [0, 0.7, 0, 0.35],
        [0.2, 0.65, 0.15, 0.28],
        [-0.2, 0.65, -0.1, 0.26],
        [0.1, 0.62, -0.2, 0.27],
        [-0.15, 0.62, 0.2, 0.25],
      ];
      puffs.forEach(([x, y, z, s]) => {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), fluffyMat);
        puff.position.set(x, y, z);
        grp.add(puff);
      });
      break;
    }

    case 'pumpkin': {
      const pumpMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.45 });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.6 });

      const base = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), pumpMat);
      base.scale.set(1.2, 0.85, 1.2);
      base.position.y = 0.5;
      grp.add(base);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.35, 8), stemMat);
      stem.position.set(0.05, 0.95, 0);
      stem.rotation.z = -0.25;
      grp.add(stem);
      break;
    }

    case 'apple': {
      const redMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.25 });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x5C2B09, roughness: 0.7 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.4 });

      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), redMat);
      apple.scale.set(1.0, 0.92, 1.0);
      apple.position.y = 0.52;
      grp.add(apple);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6), stemMat);
      stem.position.set(0, 0.98, 0);
      stem.rotation.z = 0.2;
      grp.add(stem);

      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 5), leafMat);
      leaf.position.set(0.14, 0.98, 0.05);
      leaf.rotation.z = -0.8;
      grp.add(leaf);
      break;
    }

    // ── ANIMAL PRODUCTS ──
    case 'egg': {
      const eggMat = new THREE.MeshStandardMaterial({ color: 0xFDE68A, roughness: 0.3 });
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), eggMat);
      egg.scale.set(0.9, 1.25, 0.9);
      egg.position.y = 0.55;
      grp.add(egg);
      break;
    }

    case 'milk': {
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.1 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.3 });

      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.85, 16), glassMat);
      bottle.position.y = 0.45;
      grp.add(bottle);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.35, 16), glassMat);
      neck.position.y = 0.98;
      grp.add(neck);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16), capMat);
      cap.position.y = 1.18;
      grp.add(cap);
      break;
    }

    case 'bacon': {
      const meatMat = new THREE.MeshStandardMaterial({ color: 0xBE123C, roughness: 0.4 });
      const fatMat = new THREE.MeshStandardMaterial({ color: 0xFCE7F3, roughness: 0.4 });

      for (let i = 0; i < 3; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.26), meatMat);
        strip.position.set(0, 0.2 + i * 0.16, (i - 1) * 0.15);
        strip.rotation.y = (i - 1) * 0.2;
        grp.add(strip);

        const fat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.09, 0.08), fatMat);
        fat.position.set(0, 0.2 + i * 0.16, (i - 1) * 0.15);
        fat.rotation.y = (i - 1) * 0.2;
        grp.add(fat);
      }
      break;
    }

    case 'wool': {
      const woolMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.85 });
      const needleMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.9, roughness: 0.2 });

      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), woolMat);
      ball.position.y = 0.55;
      grp.add(ball);

      const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), needleMat);
      needle.position.set(0, 0.6, 0);
      needle.rotation.z = 0.6;
      grp.add(needle);
      break;
    }

    // ── FACTORY FOOD & BAKERY ──
    case 'bread': {
      const crustMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.5 });
      const breadMat = new THREE.MeshStandardMaterial({ color: 0xFDE68A, roughness: 0.6 });

      const loaf = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 0.6), crustMat);
      loaf.position.y = 0.45;
      grp.add(loaf);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 12, 1, false, 0, Math.PI), crustMat);
      top.rotation.z = Math.PI / 2;
      top.position.set(0, 0.72, 0);
      grp.add(top);

      // Scoring marks
      for (let i = -1; i <= 1; i++) {
        const score = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.45), breadMat);
        score.position.set(i * 0.28, 0.8, 0);
        grp.add(score);
      }
      break;
    }

    case 'butter': {
      const butterMat = new THREE.MeshStandardMaterial({ color: 0xFDE047, roughness: 0.3 });
      const plateMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });

      const plate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 0.8), plateMat);
      plate.position.y = 0.1;
      grp.add(plate);

      const block = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.42, 0.55), butterMat);
      block.position.y = 0.36;
      grp.add(block);
      break;
    }

    case 'cheese': {
      const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.35 });
      const holeMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.6 });

      const wedge = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16, 1, false, 0, Math.PI * 0.45), cheeseMat);
      wedge.position.y = 0.35;
      wedge.rotation.y = -Math.PI * 0.25;
      grp.add(wedge);

      // Cute cartoon cheese holes
      for (let i = 0; i < 4; i++) {
        const hole = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), holeMat);
        hole.position.set(-0.2 + i * 0.15, 0.35 + (i % 2) * 0.1, 0.2);
        grp.add(hole);
      }
      break;
    }

    case 'sugar': {
      const sackMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.7 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 });

      const sack = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.65, 12), sackMat);
      sack.position.y = 0.35;
      grp.add(sack);

      const top = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), whiteMat);
      top.position.y = 0.7;
      grp.add(top);
      break;
    }

    case 'popcorn': {
      const bucketMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4 });
      const popMat = new THREE.MeshStandardMaterial({ color: 0xFEF08A, roughness: 0.6 });

      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.35, 0.75, 16), bucketMat);
      bucket.position.y = 0.42;
      grp.add(bucket);

      for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 1), popMat);
        p.position.set((Math.random() - 0.5) * 0.5, 0.82 + Math.random() * 0.2, (Math.random() - 0.5) * 0.5);
        grp.add(p);
      }
      break;
    }

    // ── TOOLS & EXPANSION ──
    case 'axe': {
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.85, roughness: 0.25 });

      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 8), handleMat);
      handle.position.y = 0.6;
      handle.rotation.z = -0.3;
      grp.add(handle);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.25, 0.1), steelMat);
      blade.position.set(0.18, 1.05, 0);
      grp.add(blade);
      break;
    }

    case 'saw': {
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4 });
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.2 });

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.04), bladeMat);
      blade.position.set(0, 0.6, 0);
      grp.add(blade);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.06, 8, 12), handleMat);
      handle.position.set(-0.45, 0.6, 0);
      grp.add(handle);
      break;
    }

    case 'dynamite': {
      const tntMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.4 });
      const bandMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.6 });

      for (let i = 0; i < 3; i++) {
        const tnt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 12), tntMat);
        tnt.position.set((i - 1) * 0.18, 0.5, 0);
        grp.add(tnt);
      }
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.3), bandMat);
      band.position.y = 0.5;
      grp.add(band);
      break;
    }

    case 'bolt':
    case 'nail':
    case 'screw': {
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.9, roughness: 0.2 });
      const headMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.25 });

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12), metalMat);
      shaft.position.y = 0.45;
      grp.add(shaft);

      const head = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 6), headMat);
      head.position.y = 0.9;
      grp.add(head);
      break;
    }

    case 'plank':
    case 'wood_panel': {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.65 });
      for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.45), woodMat);
        p.position.set(0, 0.15 + i * 0.16, (i - 1) * 0.05);
        p.rotation.y = (i - 1) * 0.1;
        grp.add(p);
      }
      break;
    }

    // ── FISHING ──
    case 'fish':
    case 'perch':
    case 'salmon':
    case 'carp':
    case 'goldfish': {
      const isGold = itemId === 'goldfish';
      const isSalmon = itemId === 'salmon';
      const fishMat = new THREE.MeshStandardMaterial({
        color: isGold ? 0xF59E0B : isSalmon ? 0xFB7185 : 0x0EA5E9,
        roughness: 0.25,
        metalness: 0.3,
      });
      const finMat = new THREE.MeshStandardMaterial({
        color: isGold ? 0xFDE047 : isSalmon ? 0xFDA4AF : 0x38BDF8,
        roughness: 0.3,
      });

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), fishMat);
      body.scale.set(1.4, 0.7, 0.4);
      body.position.y = 0.55;
      grp.add(body);

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 6), finMat);
      tail.rotation.z = Math.PI / 2;
      tail.position.set(-0.7, 0.55, 0);
      grp.add(tail);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      eye.position.set(0.45, 0.65, 0.18);
      grp.add(eye);
      break;
    }

    // Default Fallback Gift / Box
    default: {
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.4 });
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, metalness: 0.8, roughness: 0.2 });

      const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.7), boxMat);
      box.position.y = 0.4;
      grp.add(box);

      const r1 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.67, 0.16), ribbonMat);
      r1.position.y = 0.4;
      grp.add(r1);
      break;
    }
  }

  return grp;
}

// ── OFFSCREEN RENDER TO BASE64 DATA URL ──
export function generateItemThumbnailDataUrl(itemId: string): string {
  if (typeof document === 'undefined') return '';
  if (itemThumbnailCache.has(itemId)) {
    return itemThumbnailCache.get(itemId)!;
  }

  try {
    const { renderer, scene, camera } = getSharedOffscreenContext();
    if (!renderer || !scene || !camera) return '';

    // Clear previous items
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach(child => {
      if (child.type === 'Group') toRemove.push(child);
    });
    toRemove.forEach(c => scene.remove(c));

    // Create & add item 3D mesh
    const model = createItem3DModel(itemId);
    model.rotation.y = Math.PI * 0.25;
    model.rotation.x = Math.PI * 0.12;
    scene.add(model);

    // Compute bounding box and frame camera
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.8);

    camera.position.set(center.x + 2.5, center.y + 2.0, center.z + 2.8);
    camera.lookAt(center);

    const fovRad = (camera.fov * Math.PI) / 180;
    const distance = (maxDim / 2) / Math.tan(fovRad / 2) * 1.35;
    const dir = new THREE.Vector3().subVectors(camera.position, center).normalize();
    camera.position.copy(center).add(dir.multiplyScalar(distance));
    camera.lookAt(center);

    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');

    itemThumbnailCache.set(itemId, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn('Failed to render 3D item thumbnail for:', itemId, err);
    return '';
  }
}

// ── REACT 3D ITEM THUMBNAIL COMPONENT ──
interface Item3DThumbnailProps {
  itemId: string;
  className?: string;
  fallbackIcon?: string;
  alt?: string;
}

export const Item3DThumbnail: React.FC<Item3DThumbnailProps> = ({
  itemId,
  className = 'w-10 h-10',
  fallbackIcon = '📦',
  alt,
}) => {
  const [dataUrl, setDataUrl] = useState<string>(() => itemThumbnailCache.get(itemId) || '');

  useEffect(() => {
    if (!itemThumbnailCache.has(itemId)) {
      const url = generateItemThumbnailDataUrl(itemId);
      if (url) setDataUrl(url);
    } else {
      setDataUrl(itemThumbnailCache.get(itemId)!);
    }
  }, [itemId]);

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={alt || itemId}
        className={`${className} object-contain filter drop-shadow-md select-none pointer-events-none transition-transform hover:scale-105`}
      />
    );
  }

  return (
    <span className="text-xl select-none" role="img" aria-label={itemId}>
      {fallbackIcon}
    </span>
  );
};