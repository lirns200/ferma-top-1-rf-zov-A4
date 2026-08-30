import * as THREE from 'three';
import { SeasonType } from '../../../types';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * Low-Poly Mountain Tunnel with Stone Masonry Arch, Heavy Timber Beams,
 * Hanging Lantern, Forest Pines, Cliff Rocks, and Deep Cave Interior
 */
export function createMountainTunnelGroup(season: SeasonType, label = 'TOWN'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mountain_tunnel';

  const stoneMat = getCachedColorMaterial('#64748B', 0.85);
  const stoneLightMat = getCachedColorMaterial('#94A3B8', 0.8);
  const stoneDarkMat = getCachedColorMaterial('#475569', 0.9);
  const woodMat = getCachedColorMaterial('#78350F', 0.85);
  const darkWoodMat = getCachedColorMaterial('#451A03', 0.9);
  const voidMat = new THREE.MeshBasicMaterial({ color: 0x070B14 });
  const roadMat = getCachedColorMaterial('#C9822B', 0.95);
  const grassColor = season === 'winter' ? '#94A3B8' : season === 'autumn' ? '#667C34' : '#3B7528';
  const grassMat = getCachedColorMaterial(grassColor, 0.88);
  const lanternGoldMat = getCachedColorMaterial('#FBBF24', 0.2, 0.8);

  const caveWidth = 3.3;
  const caveHeight = 2.3;
  const caveDepth = 4.0;

  // ── 1. Cave Interior Void & Dirt Floor ────────────────────────────────
  const cave = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth, caveHeight, caveDepth),
    voidMat
  );
  cave.position.set(0, caveHeight / 2, -caveDepth / 2);
  group.add(cave);

  const caveFloor = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth + 0.3, 0.08, caveDepth + 0.4),
    roadMat
  );
  caveFloor.position.set(0, 0.04, -caveDepth / 2 + 0.2);
  group.add(caveFloor);

  // ── 2. Stone Arch Masonry Portal (Clean stylized blocks) ──────────────
  // Left Pillar
  const pillarGeo = new THREE.BoxGeometry(0.75, 2.6, 0.9);
  const pL = new THREE.Mesh(pillarGeo, stoneMat);
  pL.position.set(-(caveWidth / 2 + 0.38), 1.3, 0);
  pL.castShadow = true;
  pL.receiveShadow = true;

  const capGeo = new THREE.BoxGeometry(0.9, 0.22, 1.05);
  const capL = new THREE.Mesh(capGeo, stoneLightMat);
  capL.position.set(-(caveWidth / 2 + 0.38), 2.65, 0);

  // Right Pillar
  const pR = pL.clone();
  pR.position.x = caveWidth / 2 + 0.38;
  const capR = capL.clone();
  capR.position.x = caveWidth / 2 + 0.38;
  group.add(pL, capL, pR, capR);

  // Stone Arch Keystones
  const ARCH_R = caveWidth / 2 + 0.38;
  const ARCH_CENTER_Y = 2.1;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 6) * Math.PI;
    const bx = -Math.cos(angle) * ARCH_R;
    const by = ARCH_CENTER_Y + Math.sin(angle) * (ARCH_R * 0.55);
    const stoneBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.55, 0.9),
      i === 3 ? stoneLightMat : (i % 2 === 0 ? stoneMat : stoneDarkMat)
    );
    stoneBlock.position.set(bx, by, 0);
    stoneBlock.rotation.z = angle - Math.PI / 2;
    stoneBlock.castShadow = true;
    group.add(stoneBlock);
  }

  // ── 3. Grassy Top Cover & Flanking Green Slopes (Deeply merging into Mountain) ──
  // Lush Green Grass Top (Exact mountain color, extends deep into mountain slope)
  const grassTopGeo = new THREE.BoxGeometry(caveWidth + 2.6, 0.6, caveDepth + 2.2);
  const grassTop = new THREE.Mesh(grassTopGeo, grassMat);
  grassTop.position.set(0, caveHeight + 0.3, -(caveDepth + 2.2) / 2 + 0.3);
  grassTop.receiveShadow = true;
  grassTop.castShadow = true;

  // Left & Right Green Grassy Embankments (Fuses directly with mountain terrain)
  const grassSideGeo = new THREE.BoxGeometry(1.8, 2.6, caveDepth + 2.0);
  const grassSideL = new THREE.Mesh(grassSideGeo, grassMat);
  grassSideL.position.set(-(caveWidth / 2 + 1.05), 1.3, -(caveDepth + 2.0) / 2 + 0.3);
  grassSideL.rotation.set(0, 0.12, 0.06);
  grassSideL.receiveShadow = true;
  grassSideL.castShadow = true;

  const grassSideR = new THREE.Mesh(grassSideGeo, grassMat);
  grassSideR.position.set(caveWidth / 2 + 1.05, 1.3, -(caveDepth + 2.0) / 2 + 0.3);
  grassSideR.rotation.set(0, -0.12, -0.06);
  grassSideR.receiveShadow = true;
  grassSideR.castShadow = true;

  // Soft grass mound accents at the base
  const mndGeo = new THREE.SphereGeometry(1.2, 8, 6);
  const mndL = new THREE.Mesh(mndGeo, grassMat);
  mndL.position.set(-(caveWidth / 2 + 1.3), 0.45, 0.1);
  mndL.scale.set(1.1, 0.55, 1.3);

  const mndR = new THREE.Mesh(mndGeo, grassMat);
  mndR.position.set(caveWidth / 2 + 1.3, 0.45, 0.1);
  mndR.scale.set(1.1, 0.55, 1.3);

  // Roadside boulders hugging the stone frame
  const srGeo = new THREE.DodecahedronGeometry(0.38, 0);
  const sr1 = new THREE.Mesh(srGeo, stoneLightMat);
  sr1.position.set(-(caveWidth / 2 + 0.9), 0.24, 0.4);
  const sr2 = new THREE.Mesh(srGeo, stoneMat);
  sr2.position.set(caveWidth / 2 + 0.85, 0.22, 0.38);
  group.add(grassTop, grassSideL, grassSideR, mndL, mndR, sr1, sr2);

  // ── 4. Wooden Mine-Style Framing & Signboard ──────────────────────────
  const timberPostGeo = new THREE.BoxGeometry(0.22, 2.2, 0.22);
  const timberL = new THREE.Mesh(timberPostGeo, woodMat);
  timberL.position.set(-(caveWidth / 2 - 0.12), 1.1, 0.25);
  const timberR = timberL.clone();
  timberR.position.x = caveWidth / 2 - 0.12;

  const timberBeam = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth + 0.4, 0.26, 0.28),
    woodMat
  );
  timberBeam.position.set(0, 2.25, 0.25);
  timberBeam.castShadow = true;
  group.add(timberL, timberR, timberBeam);

  // Wooden Signboard
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.42, 0.08),
    darkWoodMat
  );
  signBoard.position.set(0, 2.65, 0.32);
  signBoard.castShadow = true;

  const signPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.3, 0.02),
    getCachedColorMaterial('#FEF08A', 0.5)
  );
  signPlate.position.set(0, 2.65, 0.37);
  group.add(signBoard, signPlate);

  // Hanging Brass Lantern
  const lanternChain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4),
    darkWoodMat
  );
  lanternChain.position.set(0, 2.0, 0.3);

  const lanternCage = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.2, 0.16),
    darkWoodMat
  );
  lanternCage.position.set(0, 1.85, 0.3);

  const lanternGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.14, 0.1),
    lanternGoldMat
  );
  lanternGlow.position.set(0, 1.85, 0.3);
  group.add(lanternChain, lanternCage, lanternGlow);

  return group;
}
