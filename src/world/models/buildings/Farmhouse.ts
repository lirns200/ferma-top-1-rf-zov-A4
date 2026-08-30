import * as THREE from 'three';
import { SeasonType } from '../../../types';
import { getCachedColorMaterial } from '../shared/materials';
import { createTriangularGable } from '../shared/geometryHelpers';

/**
 * Detailed 2-story Country Farmhouse with porch, chimney smoke, flower boxes, and clean roof
 */
export function createFarmhouseGroup(season: SeasonType): THREE.Group {
  const group = new THREE.Group();

  // Stone Foundation
  const baseGeo = new THREE.BoxGeometry(2.8, 0.35, 2.8);
  const baseMat = getCachedColorMaterial('#475569', 0.85);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.175;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main House Body (Rich warm red timber siding)
  const wallGeo = new THREE.BoxGeometry(2.4, 1.6, 2.4);
  const wallMat = getCachedColorMaterial('#DC2626', 0.65);
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 1.15;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // White Corner Trim Boards
  const trimGeo = new THREE.BoxGeometry(0.1, 1.62, 0.1);
  const trimMat = getCachedColorMaterial('#F8FAFC', 0.5);
  [
    [-1.19, -1.19], [1.19, -1.19], [-1.19, 1.19], [1.19, 1.19]
  ].forEach(([tx, tz]) => {
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(tx, 1.15, tz);
    group.add(trim);
  });

  // True Triangular Gable End Walls (Front & Back) - perfectly flush, zero corner protrusion
  const gFront = createTriangularGable(2.36, 1.15, 0.08, wallMat);
  gFront.position.set(0, 1.95 + 1.15 / 2, 1.16);
  const gBack = createTriangularGable(2.36, 1.15, 0.08, wallMat);
  gBack.position.set(0, 1.95 + 1.15 / 2, -1.16);
  group.add(gFront, gBack);

  // Pitched Roof Structure (Pitched Shingle Panels with clean Overhangs)
  const roofColor = season === 'winter' ? '#F1F5F9' : '#5C240E';
  const roofMat = getCachedColorMaterial(roofColor, 0.7);

  // Left & Right Pitched Roof Panels
  const roofSlopeGeo = new THREE.BoxGeometry(1.72, 0.12, 2.72);
  const slopeAngle = Math.atan2(1.15, 1.18);

  const rLeft = new THREE.Mesh(roofSlopeGeo, roofMat);
  rLeft.position.set(-0.62, 2.55, 0);
  rLeft.rotation.z = slopeAngle;
  rLeft.castShadow = true;

  const rRight = new THREE.Mesh(roofSlopeGeo, roofMat);
  rRight.position.set(0.62, 2.55, 0);
  rRight.rotation.z = -slopeAngle;
  rRight.castShadow = true;

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 2.76), getCachedColorMaterial('#451A03', 0.8));
  ridge.position.set(0, 3.16, 0);
  ridge.castShadow = true;

  group.add(rLeft, rRight, ridge);

  // Front Porch Structure
  const porchDeckGeo = new THREE.BoxGeometry(2.1, 0.15, 0.95);
  const porchDeckMat = getCachedColorMaterial('#9A3412', 0.8);
  const porchDeck = new THREE.Mesh(porchDeckGeo, porchDeckMat);
  porchDeck.position.set(0, 0.35, 1.55);
  porchDeck.castShadow = true;
  group.add(porchDeck);

  // Porch Roof & Columns
  const porchRoofGeo = new THREE.BoxGeometry(2.1, 0.08, 0.95);
  const porchRoof = new THREE.Mesh(porchRoofGeo, roofMat);
  porchRoof.position.set(0, 1.75, 1.55);
  porchRoof.castShadow = true;

  const colGeo = new THREE.CylinderGeometry(0.045, 0.055, 1.4, 6);
  const colMat = getCachedColorMaterial('#F8FAFC', 0.5);
  [[-0.95, 1.9], [0.95, 1.9]].forEach(([cx, cz]) => {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(cx, 1.05, cz);
    col.castShadow = true;
    group.add(col);
  });
  group.add(porchRoof);

  // Front Door
  const doorGeo = new THREE.BoxGeometry(0.55, 1.0, 0.06);
  const doorMat = getCachedColorMaterial('#451A03', 0.6);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.85, 1.22);
  const doorknob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), getCachedColorMaterial('#F59E0B', 0.2, 0.8));
  doorknob.position.set(0.2, 0.85, 1.26);
  group.add(door, doorknob);

  // Windows with White Frames & Cross Grilles
  const winFrameMat = getCachedColorMaterial('#F8FAFC', 0.4);
  const winGlassMat = getCachedColorMaterial('#FEF08A', 0.2); // Warm cozy interior glow

  // 1st Floor Front Windows
  [-0.65, 0.65].forEach(wx => {
    const wFrame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.08), winFrameMat);
    wFrame.position.set(wx, 1.25, 1.21);
    const wGlass = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.09), winGlassMat);
    wGlass.position.set(wx, 1.25, 1.21);
    group.add(wFrame, wGlass);
  });

  // Attic / 2nd Floor Gable Window (Front)
  const atticFrame = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.08), winFrameMat);
  atticFrame.position.set(0, 2.45, 1.21);
  const atticGlass = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.09), winGlassMat);
  atticGlass.position.set(0, 2.45, 1.21);
  group.add(atticFrame, atticGlass);

  // Stone Chimney with Puffy Smoke Plumes
  const chimGeo = new THREE.BoxGeometry(0.42, 1.8, 0.42);
  const chimMat = getCachedColorMaterial('#475569', 0.85);
  const chimney = new THREE.Mesh(chimGeo, chimMat);
  chimney.position.set(0.72, 2.7, -0.5);
  chimney.castShadow = true;
  group.add(chimney);

  // Animated-look chimney smoke puffs
  const smokeMat = getCachedColorMaterial('#E2E8F0', 0.9, 0, true, 0.7);
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), smokeMat);
  s1.position.set(0.72, 3.75, -0.5);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 6), smokeMat);
  s2.position.set(0.85, 4.15, -0.45);
  const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), smokeMat);
  s3.position.set(0.95, 4.65, -0.4);
  group.add(s1, s2, s3);

  // Flower Box under left window
  const fBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.18), getCachedColorMaterial('#78350F', 0.8));
  fBox.position.set(-0.65, 0.9, 1.3);
  const flowers = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.14), getCachedColorMaterial('#EC4899', 0.5));
  flowers.position.set(-0.65, 1.0, 1.3);
  group.add(fBox, flowers);

  return group;
}
