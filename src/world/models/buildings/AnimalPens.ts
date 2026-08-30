import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * 3D Animal Pens (Chicken Coop, Cow Pasture, Pig Pen, Sheep / Goat Pen)
 */
export function createAnimalPenGroup(configId: string): THREE.Group {
  const group = new THREE.Group();

  const isMud = configId === 'pig_pen';
  const groundGeo = new THREE.BoxGeometry(2.85, 0.12, 2.85);
  const groundColor = isMud ? '#451A03' : '#4D7C0F';
  const groundMat = getCachedColorMaterial(groundColor, 0.95);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = 0.06;
  ground.receiveShadow = true;
  group.add(ground);

  // Dirt / Trampled Feeding Ground Patch
  const patchGeo = new THREE.BoxGeometry(1.6, 0.02, 1.4);
  const patchMat = getCachedColorMaterial(isMud ? '#2D1302' : '#78350F', 0.95);
  const patch = new THREE.Mesh(patchGeo, patchMat);
  patch.position.set(-0.3, 0.125, -0.3);
  group.add(patch);

  // Wooden Fence Posts & Rails around the perimeter with post caps
  const fenceMat = getCachedColorMaterial('#78350F', 0.8);
  const postGeo = new THREE.BoxGeometry(0.12, 0.72, 0.12);
  const capGeo = new THREE.ConeGeometry(0.09, 0.08, 4);
  const corners = [
    [-1.35, -1.35], [1.35, -1.35], [-1.35, 1.35], [1.35, 1.35],
    [0, -1.35], [-1.35, 0], [1.35, 0]
  ];
  corners.forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, fenceMat);
    post.position.set(px, 0.42, pz);
    post.castShadow = true;

    const cap = new THREE.Mesh(capGeo, fenceMat);
    cap.position.set(px, 0.8, pz);
    cap.rotation.y = Math.PI / 4;
    group.add(post, cap);
  });

  // Perimeter Rails (with open gate opening on South side at x in [0.2, 1.1])
  const railHGeo = new THREE.BoxGeometry(2.7, 0.08, 0.06);
  const railVGeo = new THREE.BoxGeometry(0.06, 0.08, 2.7);
  const railShortGeo = new THREE.BoxGeometry(1.35, 0.08, 0.06);

  [0.32, 0.58].forEach(ry => {
    // North (Back)
    const rN = new THREE.Mesh(railHGeo, fenceMat);
    rN.position.set(0, ry, -1.35);
    // West (Left)
    const rW = new THREE.Mesh(railVGeo, fenceMat);
    rW.position.set(-1.35, ry, 0);
    // East (Right)
    const rE = new THREE.Mesh(railVGeo, fenceMat);
    rE.position.set(1.35, ry, 0);
    // South-West segment
    const rS = new THREE.Mesh(railShortGeo, fenceMat);
    rS.position.set(-0.68, ry, 1.35);
    group.add(rN, rW, rE, rS);
  });

  // Gate Posts with mini-lantern
  const gPost1 = new THREE.Mesh(postGeo, fenceMat);
  gPost1.position.set(0.1, 0.42, 1.35);
  const gPost2 = new THREE.Mesh(postGeo, fenceMat);
  gPost2.position.set(1.35, 0.42, 1.35);
  group.add(gPost1, gPost2);

  // ── 1. CHICKEN COOP ──────────────────────────────────────────────────
  if (configId === 'chicken_coop') {
    // Elevated Barn-Style Hen House on wooden stilts
    const stiltMat = getCachedColorMaterial('#451A03', 0.9);
    const stiltGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
    [
      [-1.15, -1.15], [-0.35, -1.15], [-1.15, -0.35], [-0.35, -0.35]
    ].forEach(([sx, sz]) => {
      const st = new THREE.Mesh(stiltGeo, stiltMat);
      st.position.set(sx, 0.3, sz);
      st.castShadow = true;
      group.add(st);
    });

    // Main Hen House Body (Red timber planks with white trim)
    const coopBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.75, 0.95),
      getCachedColorMaterial('#DC2626', 0.65)
    );
    coopBody.position.set(-0.75, 0.85, -0.75);
    coopBody.castShadow = true;
    group.add(coopBody);

    // Front pop-door hole
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.32, 0.04),
      getCachedColorMaterial('#1E293B', 0.9)
    );
    door.position.set(-0.75, 0.65, -0.26);
    group.add(door);

    // Pitched Cedar-Shingle Roof
    const roofMat = getCachedColorMaterial('#78350F', 0.7);
    const rL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.1), roofMat);
    rL.position.set(-0.95, 1.35, -0.75);
    rL.rotation.z = 0.55;
    rL.castShadow = true;

    const rR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.1), roofMat);
    rR.position.set(-0.55, 1.35, -0.75);
    rR.rotation.z = -0.55;
    rR.castShadow = true;
    group.add(rL, rR);

    // Rooster Weather Vane on roof peak
    const vanePole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6),
      getCachedColorMaterial('#D97706', 0.3, 0.8)
    );
    vanePole.position.set(-0.75, 1.62, -0.75);
    const vaneRooster = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.02),
      getCachedColorMaterial('#D97706', 0.3, 0.8)
    );
    vaneRooster.position.set(-0.75, 1.72, -0.75);
    group.add(vanePole, vaneRooster);

    // Wooden Ramp with cross-rungs
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.03, 0.65),
      getCachedColorMaterial('#9A3412', 0.8)
    );
    ramp.position.set(-0.75, 0.3, 0.0);
    ramp.rotation.x = 0.65;
    group.add(ramp);

    // Nesting Boxes with golden straw and eggs
    const strawMat = getCachedColorMaterial('#FACC15', 0.75);
    const nestBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.18, 0.45),
      getCachedColorMaterial('#9A3412', 0.8)
    );
    nestBox.position.set(0.65, 0.2, -0.75);
    const strawBed = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.12, 0.4),
      strawMat
    );
    strawBed.position.set(0.65, 0.26, -0.75);
    group.add(nestBox, strawBed);

    // Fresh White & Brown Eggs in nest
    const eggGeo = new THREE.SphereGeometry(0.055, 6, 6);
    const eggMatW = getCachedColorMaterial('#FFFFFF', 0.3);
    const eggMatB = getCachedColorMaterial('#FED7AA', 0.5);
    [
      [0.55, 0.34, -0.8, eggMatW],
      [0.72, 0.34, -0.72, eggMatB],
      [0.62, 0.34, -0.66, eggMatW]
    ].forEach(([ex, ey, ez, em]) => {
      const egg = new THREE.Mesh(eggGeo, em as THREE.Material);
      egg.position.set(ex as number, ey as number, ez as number);
      group.add(egg);
    });

    // Chicken Grain Feeder Tray with yellow corn scatter
    const feeder = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.2),
      getCachedColorMaterial('#78350F', 0.8)
    );
    feeder.position.set(0.2, 0.17, 0.4);
    const corn = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.06, 0.14),
      getCachedColorMaterial('#FDE047', 0.4)
    );
    corn.position.set(0.2, 0.22, 0.4);
    group.add(feeder, corn);

    // Stone Water Bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.1, 8),
      getCachedColorMaterial('#64748B', 0.85)
    );
    bowl.position.set(-0.15, 0.16, 0.6);
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8),
      getCachedColorMaterial('#38BDF8', 0.2, 0.5, true, 0.85)
    );
    water.position.set(-0.15, 0.2, 0.6);
    group.add(bowl, water);

  // ── 2. COW PASTURE ───────────────────────────────────────────────────
  } else if (configId === 'cow_pasture') {
    // Open Wooden Lean-To Barn Shelter
    const shelterWood = getCachedColorMaterial('#78350F', 0.8);
    const roofColor = '#9A3412';
    const sBeamGeo = new THREE.BoxGeometry(0.1, 1.2, 0.1);
    [
      [-1.2, -1.2], [-0.2, -1.2], [-1.2, -0.2], [-0.2, -0.2]
    ].forEach(([bx, bz]) => {
      const beam = new THREE.Mesh(sBeamGeo, shelterWood);
      beam.position.set(bx, 0.7, bz);
      beam.castShadow = true;
      group.add(beam);
    });

    // Shelter Plank Back Wall & Slanted Roof
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.0, 0.06),
      shelterWood
    );
    backWall.position.set(-0.7, 0.7, -1.2);
    const roofPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.08, 1.25),
      getCachedColorMaterial(roofColor, 0.7)
    );
    roofPanel.position.set(-0.7, 1.35, -0.7);
    roofPanel.rotation.x = 0.18;
    roofPanel.castShadow = true;
    group.add(backWall, roofPanel);

    // Large Timber Water Trough filled with sparkling water
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.35, 0.45),
      getCachedColorMaterial('#5C240E', 0.85)
    );
    trough.position.set(0.65, 0.25, -0.75);
    trough.castShadow = true;
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.1, 0.35),
      getCachedColorMaterial('#38BDF8', 0.1, 0.6, true, 0.88)
    );
    water.position.set(0.65, 0.38, -0.75);
    group.add(trough, water);

    // Hay Feeder Rack overflowing with 3D straw
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.35),
      getCachedColorMaterial('#B45309', 0.8)
    );
    rack.position.set(-0.7, 0.4, 0.4);
    const hay = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.4, 0.3),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    hay.position.set(-0.7, 0.6, 0.4);
    group.add(rack, hay);

    // Stainless Steel Milk Cans at the entrance gate
    const milkCanGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.38, 10);
    const milkCanMat = getCachedColorMaterial('#E2E8F0', 0.2, 0.85);
    const can1 = new THREE.Mesh(milkCanGeo, milkCanMat);
    can1.position.set(0.45, 0.28, 1.05);
    can1.castShadow = true;
    const can2 = new THREE.Mesh(milkCanGeo, milkCanMat);
    can2.position.set(0.75, 0.28, 1.15);
    can2.castShadow = true;
    group.add(can1, can2);

    // Mineral Salt Lick Stone on tree stump
    const stump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.25, 8),
      getCachedColorMaterial('#78350F', 0.9)
    );
    stump.position.set(0.7, 0.2, 0.1);
    const salt = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
      getCachedColorMaterial('#F87171', 0.5)
    );
    salt.position.set(0.7, 0.38, 0.1);
    group.add(stump, salt);

  // ── 3. PIG PEN ───────────────────────────────────────────────────────
  } else if (configId === 'pig_pen') {
    // Mud Wallow Bath (Glistening dark puddle with rock border)
    const mudGeo = new THREE.CylinderGeometry(0.9, 0.95, 0.05, 12);
    const mud = new THREE.Mesh(
      mudGeo,
      getCachedColorMaterial('#1C0D02', 0.2, 0.4)
    );
    mud.position.set(0.2, 0.13, 0.1);
    group.add(mud);

    // Wooden Pig Shelter Barn
    const hut = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.85, 1.0),
      getCachedColorMaterial('#9A3412', 0.75)
    );
    hut.position.set(-0.65, 0.55, -0.65);
    hut.castShadow = true;

    const hutRoof = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 1.15),
      getCachedColorMaterial('#451A03', 0.8)
    );
    hutRoof.position.set(-0.65, 1.02, -0.65);
    hutRoof.rotation.x = 0.15;
    group.add(hut, hutRoof);

    // Feed Trough with Apples, Pumpkins & Vegetables
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.25, 0.38),
      getCachedColorMaterial('#78350F', 0.85)
    );
    trough.position.set(0.65, 0.22, -0.75);
    trough.castShadow = true;

    const slop = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.12, 0.28),
      getCachedColorMaterial('#D97706', 0.5)
    );
    slop.position.set(0.65, 0.3, -0.75);
    group.add(trough, slop);

    // Golden Hay Bale in corner
    const bale = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.35, 0.65),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    bale.position.set(-0.8, 0.28, 0.75);
    bale.castShadow = true;
    group.add(bale);

  // ── 4. SHEEP / GOAT PEN ──────────────────────────────────────────────
  } else {
    // Rustic Stone & Timber Shelter
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 1.0),
      getCachedColorMaterial('#64748B', 0.85)
    );
    base.position.set(-0.65, 0.3, -0.65);

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.6, 0.95),
      getCachedColorMaterial('#B45309', 0.75)
    );
    walls.position.set(-0.65, 0.7, -0.65);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 1.15),
      getCachedColorMaterial('#78350F', 0.7)
    );
    roof.position.set(-0.65, 1.05, -0.65);
    roof.rotation.x = 0.15;
    group.add(base, walls, roof);

    // Hay Rack
    const hayRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.45, 0.3),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    hayRack.position.set(0.65, 0.3, -0.75);
    group.add(hayRack);

    // Wicker Wool Basket with fluffy fleece
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.18, 0.25, 8),
      getCachedColorMaterial('#B45309', 0.8)
    );
    basket.position.set(0.65, 0.22, 0.65);
    const wool = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      getCachedColorMaterial('#F8FAFC', 0.9)
    );
    wool.position.set(0.65, 0.38, 0.65);
    group.add(basket, wool);
  }

  return group;
}
