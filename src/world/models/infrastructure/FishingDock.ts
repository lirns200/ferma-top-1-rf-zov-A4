import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * Detailed Wooden Fishing Pier / Dock
 * Features realistic weathered wood planks, sturdy timber pilings with rope ties,
 * a charming moored wooden rowboat bobbing in the water, fisherman's stool,
 * propped bamboo fishing rod with water float, metal fish bucket, and lantern post.
 */
export function createFishingDockGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'fishing_dock_model';

  const woodDeckMat = getCachedColorMaterial('#9A3412', 0.85);
  const woodDarkMat = getCachedColorMaterial('#78350F', 0.88);
  const timberPilingMat = getCachedColorMaterial('#451A03', 0.92);
  const boatMat = getCachedColorMaterial('#B45309', 0.85);
  const boatInsideMat = getCachedColorMaterial('#78350F', 0.9);
  const ropeMat = getCachedColorMaterial('#D97706', 0.7);
  const metalMat = getCachedColorMaterial('#64748B', 0.3, 0.7);
  const brassMat = getCachedColorMaterial('#F59E0B', 0.2, 0.85);
  const lanternGlowMat = getCachedColorMaterial('#FEF08A', 0.1, 0.95);
  const floatRedMat = getCachedColorMaterial('#EF4444', 0.3);
  const floatWhiteMat = getCachedColorMaterial('#F8FAFC', 0.3);
  const fishSilverMat = getCachedColorMaterial('#CBD5E1', 0.2, 0.8);
  const tackleBlueMat = getCachedColorMaterial('#0284C7', 0.5);

  // ── 1. Timber Foundation & Pilings ─────────────────────────────────────
  // 4 Main Submerged Round Timber Pilings driven into riverbed
  const pilingGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.6, 8);
  [
    [-1.25, -0.65], [1.25, -0.65],
    [-1.25, 0.65], [1.25, 0.65],
    [0, -0.65], [0, 0.65]
  ].forEach(([px, pz]) => {
    const piling = new THREE.Mesh(pilingGeo, timberPilingMat);
    piling.position.set(px, 0.05, pz);
    piling.castShadow = true;
    group.add(piling);
  });

  // Cross Support Joists under Deck
  const joistGeo = new THREE.BoxGeometry(2.8, 0.12, 0.14);
  const joist1 = new THREE.Mesh(joistGeo, woodDarkMat);
  joist1.position.set(0, 0.32, -0.55);
  const joist2 = new THREE.Mesh(joistGeo, woodDarkMat);
  joist2.position.set(0, 0.32, 0.55);
  group.add(joist1, joist2);

  // ── 2. Weathered Wood Deck Planks ──────────────────────────────────────
  // 14 Individual Wood Deck Planks with irregular spacing & bevels
  const numPlanks = 14;
  const plankW = 0.19;
  for (let i = 0; i < numPlanks; i++) {
    const px = -1.3 + i * (plankW + 0.012);
    const pLen = 1.45 + (Math.sin(i * 1.5) * 0.04);
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(plankW, 0.05, pLen),
      i % 2 === 0 ? woodDeckMat : woodDarkMat
    );
    plank.position.set(px, 0.42, 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // ── 3. Moored Wooden Rowboat / Dinghy floating alongside ──────────────
  const boatGroup = new THREE.Group();
  boatGroup.name = 'fishing_rowboat';
  boatGroup.position.set(1.35, -0.05, 1.25);
  boatGroup.rotation.y = -0.15;

  // Boat Hull Base & Sides
  const hullBottom = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.75), boatMat);
  hullBottom.position.set(0, 0.05, 0);
  hullBottom.castShadow = true;

  const hullSideL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.06), boatMat);
  hullSideL.position.set(0, 0.2, -0.35);

  const hullSideR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.06), boatMat);
  hullSideR.position.set(0, 0.2, 0.35);

  const hullBow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 4), boatMat);
  hullBow.position.set(0.9, 0.18, 0);
  hullBow.rotation.z = -Math.PI / 2;
  hullBow.rotation.y = Math.PI / 4;

  const hullStern = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.7), boatMat);
  hullStern.position.set(-0.8, 0.2, 0);

  // Boat Wooden Seat Bench
  const boatBench = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.65), boatInsideMat);
  boatBench.position.set(0, 0.22, 0);

  // Wooden Oars resting inside
  const oarGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5);

  const oar1 = new THREE.Mesh(oarGeo, woodDarkMat);
  oar1.position.set(-0.1, 0.26, -0.15);
  oar1.rotation.set(0.1, 0.3, 0.4);

  const oar2 = new THREE.Mesh(oarGeo, woodDarkMat);
  oar2.position.set(-0.1, 0.26, 0.15);
  oar2.rotation.set(-0.1, -0.3, 0.4);

  boatGroup.add(hullBottom, hullSideL, hullSideR, hullBow, hullStern, boatBench, oar1, oar2);
  group.add(boatGroup);

  // Mooring Rope connecting Boat to Pier Bollard
  const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 4);
  const rope = new THREE.Mesh(ropeGeo, ropeMat);
  rope.position.set(1.3, 0.2, 0.95);
  rope.rotation.x = Math.PI / 3;
  group.add(rope);

  // ── 4. Fisherman's Stool, Rod Stand & Fishing Rod ──────────────────────
  // Wooden Stool
  const stoolTop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), woodDarkMat);
  stoolTop.position.set(0.3, 0.52, -0.4);
  const sLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 4);
  [
    [0.18, -0.52], [0.42, -0.52], [0.18, -0.28], [0.42, -0.28]
  ].forEach(([sx, sz]) => {
    const leg = new THREE.Mesh(sLegGeo, woodDarkMat);
    leg.position.set(sx, 0.41, sz);
    group.add(leg);
  });
  group.add(stoolTop);

  // Angled Bamboo Fishing Rod in Rod Holder
  const rodStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.25, 6), metalMat);
  rodStand.position.set(1.2, 0.42, 0.1);
  rodStand.rotation.z = -0.3;

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.045, 2.4, 6), brassMat);
  rod.position.set(1.9, 1.25, 0.1);
  rod.rotation.z = -Math.PI / 4;
  rod.castShadow = true;

  // Thin fishing line dropping to water float
  const lineGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.4, 3);
  const line = new THREE.Mesh(lineGeo, metalMat);
  line.position.set(2.7, 1.25, 0.1);

  // Red & White Fishing Float / Bobber on water
  const floatGroup = new THREE.Group();
  floatGroup.name = 'fishing_bobber';
  floatGroup.position.set(2.7, 0.02, 0.1);

  const floatTop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), floatRedMat);
  floatTop.position.y = 0.04;
  const floatBot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), floatWhiteMat);
  floatBot.position.y = -0.02;
  floatGroup.add(floatTop, floatBot);
  group.add(rodStand, rod, line, floatGroup);

  // ── 5. Galvanized Fish Bucket & Open Tackle Box ────────────────────────
  // Metal Fish Bucket
  const bucketGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.32, 10);
  const bucket = new THREE.Mesh(bucketGeo, metalMat);
  bucket.position.set(-0.5, 0.48, -0.45);
  bucket.castShadow = true;

  // Fish tails peeking out of bucket
  const tailGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
  const tail1 = new THREE.Mesh(tailGeo, fishSilverMat);
  tail1.position.set(-0.48, 0.68, -0.48);
  tail1.rotation.set(0.3, 0.2, 0.2);

  const tail2 = new THREE.Mesh(tailGeo, fishSilverMat);
  tail2.position.set(-0.54, 0.66, -0.42);
  tail2.rotation.set(-0.2, -0.3, -0.3);
  group.add(bucket, tail1, tail2);

  // Turquoise Tackle Box
  const tackle = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.24), tackleBlueMat);
  tackle.position.set(-0.5, 0.42, 0.35);
  tackle.castShadow = true;
  group.add(tackle);

  // ── 6. Corner Mooring Post with Brass Lantern & Lifebuoy ──────────────
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 6), timberPilingMat);
  post.position.set(-1.25, 0.85, 0.75);
  post.castShadow = true;

  // Hanging Brass Lantern
  const lanternArm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.28), metalMat);
  lanternArm.position.set(-1.25, 1.45, 0.62);

  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), brassMat);
  lantern.position.set(-1.25, 1.32, 0.5);

  const lanternGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), lanternGlowMat);
  lanternGlass.position.set(-1.25, 1.32, 0.5);
  group.add(post, lanternArm, lantern, lanternGlass);

  // Red & White Lifebuoy Ring on post
  const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 8, 16), floatRedMat);
  buoy.position.set(-1.18, 0.95, 0.75);
  buoy.rotation.y = Math.PI / 2;
  group.add(buoy);

  return group;
}
