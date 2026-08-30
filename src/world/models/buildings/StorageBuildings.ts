import * as THREE from 'three';
import { SeasonType } from '../../../types';
import { getCachedColorMaterial } from '../shared/materials';
import { createGambrelGable } from '../shared/geometryHelpers';

/**
 * Detailed Traditional Gambrel-Roof Barn with cross-braced doors, hayloft, lantern & rooster weathervane
 */
export function createBarnGroup(season: SeasonType): THREE.Group {
  const group = new THREE.Group();

  // Stone Foundation
  const baseGeo = new THREE.BoxGeometry(3.2, 0.4, 2.6);
  const baseMat = getCachedColorMaterial('#475569', 0.85);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main Barn Timber Body (Deep Red)
  const wallGeo = new THREE.BoxGeometry(2.8, 1.6, 2.2);
  const wallMat = getCachedColorMaterial('#B91C1C', 0.65);
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 1.2;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // White Corner Trim
  const trimGeo = new THREE.BoxGeometry(0.1, 1.62, 0.1);
  const trimMat = getCachedColorMaterial('#F8FAFC', 0.5);
  [
    [-1.39, -1.09], [1.39, -1.09], [-1.39, 1.09], [1.39, 1.09]
  ].forEach(([tx, tz]) => {
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(tx, 1.2, tz);
    group.add(trim);
  });

  // Gambrel Gable End Walls (Front & Back) - perfectly flush, zero corner protrusion
  const gFront = createGambrelGable(2.78, 0.95, 1.65, 0.08, wallMat);
  gFront.position.set(0, 2.0 + 1.65 / 2, 1.06);
  const gBack = createGambrelGable(2.78, 0.95, 1.65, 0.08, wallMat);
  gBack.position.set(0, 2.0 + 1.65 / 2, -1.06);
  group.add(gFront, gBack);

  // Gambrel Multi-Pitched Roof
  const roofColor = season === 'winter' ? '#F1F5F9' : '#78350F';
  const roofMat = getCachedColorMaterial(roofColor, 0.75);

  // Lower Steep Pitched Roof Panels (Left & Right)
  const lowerSlopeGeo = new THREE.BoxGeometry(1.02, 0.1, 2.52);
  const lowerAngle = 1.08;
  const rLowL = new THREE.Mesh(lowerSlopeGeo, roofMat);
  rLowL.position.set(-1.12, 2.48, 0);
  rLowL.rotation.z = lowerAngle;
  rLowL.castShadow = true;

  const rLowR = new THREE.Mesh(lowerSlopeGeo, roofMat);
  rLowR.position.set(1.12, 2.48, 0);
  rLowR.rotation.z = -lowerAngle;
  rLowR.castShadow = true;

  // Upper Shallow Pitched Roof Panels (Left & Right)
  const upperSlopeGeo = new THREE.BoxGeometry(1.08, 0.1, 2.52);
  const upperAngle = 0.55;
  const rUpL = new THREE.Mesh(upperSlopeGeo, roofMat);
  rUpL.position.set(-0.44, 3.32, 0);
  rUpL.rotation.z = upperAngle;
  rUpL.castShadow = true;

  const rUpR = new THREE.Mesh(upperSlopeGeo, roofMat);
  rUpR.position.set(0.44, 3.32, 0);
  rUpR.rotation.z = -upperAngle;
  rUpR.castShadow = true;

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 2.56), getCachedColorMaterial('#451A03', 0.8));
  ridge.position.set(0, 3.65, 0);
  ridge.castShadow = true;

  group.add(rLowL, rLowR, rUpL, rUpR, ridge);

  // Double Main Barn Doors with White X-Braces
  const doorGeo = new THREE.BoxGeometry(0.55, 1.2, 0.05);
  const doorMat = getCachedColorMaterial('#7F1D1D', 0.6);
  const dL = new THREE.Mesh(doorGeo, doorMat);
  dL.position.set(-0.3, 1.0, 1.12);
  const dR = new THREE.Mesh(doorGeo, doorMat);
  dR.position.set(0.3, 1.0, 1.12);

  // White X-Braces on Barn Doors
  const braceMat = getCachedColorMaterial('#F8FAFC', 0.4);
  [-0.3, 0.3].forEach(bx => {
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.15, 0.06), braceMat);
    b1.position.set(bx, 1.0, 1.14);
    b1.rotation.z = 0.45;
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.15, 0.06), braceMat);
    b2.position.set(bx, 1.0, 1.14);
    b2.rotation.z = -0.45;
    group.add(b1, b2);
  });
  group.add(dL, dR);

  // Hayloft Door & Hoist Beam with Golden Hay sticking out
  const hayloftGeo = new THREE.BoxGeometry(0.5, 0.5, 0.06);
  const hayloft = new THREE.Mesh(hayloftGeo, getCachedColorMaterial('#451A03', 0.8));
  hayloft.position.set(0, 2.55, 1.12);

  const hayGeo = new THREE.BoxGeometry(0.4, 0.18, 0.25);
  const hayMat = getCachedColorMaterial('#FACC15', 0.75);
  const hayBale = new THREE.Mesh(hayGeo, hayMat);
  hayBale.position.set(0, 2.38, 1.22);
  hayBale.castShadow = true;

  const hoistBeam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), getCachedColorMaterial('#78350F', 0.8));
  hoistBeam.position.set(0, 3.15, 1.28);
  group.add(hayloft, hayBale, hoistBeam);

  // Rooster Weather Vane & Spire on Barn Peak
  const spireGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
  const brassMat = getCachedColorMaterial('#D97706', 0.3, 0.8);
  const spire = new THREE.Mesh(spireGeo, brassMat);
  spire.position.set(0, 3.9, 0);

  const roosterGeo = new THREE.BoxGeometry(0.24, 0.18, 0.03);
  const rooster = new THREE.Mesh(roosterGeo, brassMat);
  rooster.position.set(0, 4.15, 0);
  group.add(spire, rooster);

  return group;
}

/**
 * Detailed Corrugated Metal Grain Silo with access ladder, inspection hatch, and auger chute
 */
export function createSiloGroup(): THREE.Group {
  const group = new THREE.Group();

  // Concrete Base Foundation
  const baseGeo = new THREE.CylinderGeometry(1.15, 1.25, 0.35, 16);
  const baseMat = getCachedColorMaterial('#64748B', 0.9);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.175;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main Corrugated Steel Cylindrical Body (Galvanized Metal)
  const bodyGeo = new THREE.CylinderGeometry(1.0, 1.0, 3.2, 16);
  const metalMat = getCachedColorMaterial('#E2E8F0', 0.35, 0.5);
  const body = new THREE.Mesh(bodyGeo, metalMat);
  body.position.y = 1.95;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Ribbed Horizontal Reinforcement Rings
  const ringGeo = new THREE.TorusGeometry(1.02, 0.03, 6, 16);
  const ringMat = getCachedColorMaterial('#94A3B8', 0.3, 0.6);
  [0.8, 1.4, 2.0, 2.6, 3.2].forEach(ry => {
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ry;
    group.add(ring);
  });

  // Conical Corrugated Metal Dome Roof
  const domeGeo = new THREE.ConeGeometry(1.1, 0.85, 16);
  const domeMat = getCachedColorMaterial('#CBD5E1', 0.25, 0.65);
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 3.975;
  dome.castShadow = true;
  group.add(dome);

  // Top Aeration Cap / Vent
  const vent = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8),
    getCachedColorMaterial('#64748B', 0.4, 0.7)
  );
  vent.position.y = 4.5;
  group.add(vent);

  // Side Access Ladder with safety cage
  const railGeo = new THREE.CylinderGeometry(0.018, 0.018, 3.6, 6);
  const ladderMat = getCachedColorMaterial('#334155', 0.4, 0.7);
  const lRail1 = new THREE.Mesh(railGeo, ladderMat);
  lRail1.position.set(-0.15, 2.15, 1.04);
  const lRail2 = new THREE.Mesh(railGeo, ladderMat);
  lRail2.position.set(0.15, 2.15, 1.04);
  group.add(lRail1, lRail2);

  // Ladder Rungs
  const rungGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4);
  for (let y = 0.6; y <= 3.8; y += 0.35) {
    const rung = new THREE.Mesh(rungGeo, ladderMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, y, 1.04);
    group.add(rung);
  }

  // Grain Discharge Auger Chute at bottom
  const auger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.85, 8),
    getCachedColorMaterial('#475569', 0.4, 0.6)
  );
  auger.position.set(0.85, 0.5, 0.45);
  auger.rotation.z = -Math.PI / 4;
  auger.castShadow = true;
  group.add(auger);

  return group;
}
