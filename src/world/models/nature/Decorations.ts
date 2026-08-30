import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';
import { createStreetLampPostMesh } from '../infrastructure/StreetLamp';

/**
 * 3D Decorations (Country Fences, Walkways, Fountains, Park Benches, Street Lamps, Flowerbeds/Topiaries)
 */
export function createDecorationMesh(configId: string): THREE.Group {
  const group = new THREE.Group();

  if (configId.includes('fence')) {
    const isWhite = configId.includes('white');
    const fenceMat = getCachedColorMaterial(isWhite ? '#F8FAFC' : '#78350F', 0.7);

    // Cross Rails
    const railGeo = new THREE.BoxGeometry(0.95, 0.08, 0.05);
    const r1 = new THREE.Mesh(railGeo, fenceMat);
    r1.position.set(0, 0.25, 0);
    const r2 = new THREE.Mesh(railGeo, fenceMat);
    r2.position.set(0, 0.55, 0);

    // Fence Posts
    const postGeo = new THREE.BoxGeometry(0.12, 0.75, 0.12);
    const pL = new THREE.Mesh(postGeo, fenceMat);
    pL.position.set(-0.45, 0.375, 0);
    pL.castShadow = true;
    const pR = new THREE.Mesh(postGeo, fenceMat);
    pR.position.set(0.45, 0.375, 0);
    pR.castShadow = true;

    group.add(r1, r2, pL, pR);

  } else if (configId.includes('path')) {
    // Beautiful stylized interlocking cobblestone, wood, or dirt walkways
    const isStone = configId.includes('stone') || configId.includes('cobble');
    const isWood = configId.includes('wood') || configId.includes('plank');

    if (isStone) {
      // 1. Mortar Gravel Bed Base
      const mortarMat = getCachedColorMaterial('#57534E', 0.95);
      const baseBed = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.025, 0.98), mortarMat);
      baseBed.position.y = 0.0125;
      baseBed.receiveShadow = true;
      group.add(baseBed);

      // 2. Interlocking Faceted Cobblestones with organic color and height variation
      const stoneColors = ['#94A3B8', '#64748B', '#CBD5E1', '#78716C', '#475569'];
      const stones = [
        { x: -0.26, z: -0.26, sx: 0.38, sz: 0.38, rot: 0.1, cIdx: 0, h: 0.042 },
        { x: 0.22, z: -0.28, sx: 0.42, sz: 0.34, rot: -0.15, cIdx: 1, h: 0.046 },
        { x: -0.28, z: 0.22, sx: 0.34, sz: 0.42, rot: 0.2, cIdx: 2, h: 0.044 },
        { x: 0.24, z: 0.24, sx: 0.38, sz: 0.38, rot: -0.1, cIdx: 3, h: 0.048 },
        { x: 0.0, z: 0.0, sx: 0.30, sz: 0.30, rot: 0.35, cIdx: 4, h: 0.052 },
        { x: -0.02, z: -0.40, sx: 0.24, sz: 0.14, rot: 0.05, cIdx: 1, h: 0.038 },
        { x: 0.02, z: 0.40, sx: 0.24, sz: 0.14, rot: -0.05, cIdx: 0, h: 0.038 },
        { x: -0.40, z: -0.02, sx: 0.14, sz: 0.24, rot: 0.1, cIdx: 3, h: 0.038 },
        { x: 0.40, z: 0.02, sx: 0.14, sz: 0.24, rot: -0.1, cIdx: 2, h: 0.038 },
      ];

      stones.forEach(s => {
        const sMat = getCachedColorMaterial(stoneColors[s.cIdx], 0.75);
        const stoneMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), sMat);
        stoneMesh.position.set(s.x, s.h * 0.5, s.z);
        stoneMesh.scale.set(s.sx * 0.55, s.h, s.sz * 0.55);
        stoneMesh.rotation.set(0.05, s.rot, 0.03);
        stoneMesh.castShadow = true;
        stoneMesh.receiveShadow = true;
        group.add(stoneMesh);
      });

      // 3. Tiny Moss Tufts in Crevices
      const mossMat = getCachedColorMaterial('#4D7C0F', 0.95);
      [
        [-0.14, -0.12], [0.12, 0.14], [-0.12, 0.16]
      ].forEach(([mx, mz]) => {
        const moss = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.03, 5), mossMat);
        moss.position.set(mx, 0.035, mz);
        group.add(moss);
      });

    } else if (isWood) {
      // Rustic Timber Boardwalk Planks
      const woodMat = getCachedColorMaterial('#78350F', 0.85);
      const beamMat = getCachedColorMaterial('#451A03', 0.9);
      const nailMat = getCachedColorMaterial('#94A3B8', 0.3);

      // Under-support beams
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.08), beamMat);
      b1.position.set(0, 0.015, -0.32);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.08), beamMat);
      b2.position.set(0, 0.015, 0.32);
      group.add(b1, b2);

      // 3 Cross Planks
      [-0.30, 0, 0.30].forEach((pz) => {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.035, 0.26), woodMat);
        plank.position.set(0, 0.035, pz);
        plank.castShadow = true;
        plank.receiveShadow = true;
        group.add(plank);

        // Nail studs
        [-0.4, 0.4].forEach(nx => {
          const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 4), nailMat);
          nail.position.set(nx, 0.055, pz);
          group.add(nail);
        });
      });

    } else {
      // Smooth Packed Dirt / Sand Trail
      const dirtBaseMat = getCachedColorMaterial('#92400E', 0.95);
      const dirtSurfaceMat = getCachedColorMaterial('#B45309', 0.9);
      const baseBed = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.02, 0.96), dirtBaseMat);
      baseBed.position.y = 0.01;
      baseBed.receiveShadow = true;

      const surface = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.025, 8), dirtSurfaceMat);
      surface.position.y = 0.025;
      surface.receiveShadow = true;
      group.add(baseBed, surface);

      // Small pebbles
      const pebbleMat = getCachedColorMaterial('#78716C', 0.8);
      [
        [-0.22, 0.18, 0.06], [0.25, -0.22, 0.05], [0.12, 0.28, 0.04]
      ].forEach(([px, pz, ps]) => {
        const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(ps, 0), pebbleMat);
        pebble.position.set(px, 0.035, pz);
        group.add(pebble);
      });
    }

  } else if (configId.includes('fountain')) {
    // 2-tier Classical Stone Fountain with water cascade
    const stoneMat = getCachedColorMaterial('#CBD5E1', 0.6);
    const waterMat = getCachedColorMaterial('#38BDF8', 0.1, 0.8);

    const baseBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.35, 16), stoneMat);
    baseBasin.position.y = 0.175;
    baseBasin.castShadow = true;
    const baseWater = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.08, 16), waterMat);
    baseWater.position.y = 0.32;

    const tierPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.8, 8), stoneMat);
    tierPost.position.y = 0.6;
    const tierBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.2, 12), stoneMat);
    tierBasin.position.y = 0.9;
    tierBasin.castShadow = true;

    group.add(baseBasin, baseWater, tierPost, tierBasin);

  } else if (configId.includes('bench')) {
    // Wooden park bench with cast-iron legs
    const woodMat = getCachedColorMaterial('#9A3412', 0.7);
    const ironMat = getCachedColorMaterial('#1E293B', 0.8);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.35), woodMat);
    seat.position.set(0, 0.3, 0);
    seat.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.06), woodMat);
    back.position.set(0, 0.5, -0.16);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.35), ironMat);
    legL.position.set(-0.38, 0.15, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.35), ironMat);
    legR.position.set(0.38, 0.15, 0);

    group.add(seat, back, legL, legR);

  } else if (configId.includes('lamp') || configId.includes('lantern') || configId.includes('light')) {
    // Return high-quality Street Lamp Post with hanging vintage lantern, glowing bulb, halo sprite, PointLight & ground light pool
    return createStreetLampPostMesh();

  } else {
    // Flowerbed / potted topiary
    const potMat = getCachedColorMaterial('#B45309', 0.8);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.35, 8), potMat);
    pot.position.y = 0.175;
    pot.castShadow = true;

    const bushMat = getCachedColorMaterial('#166534', 0.6);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), bushMat);
    bush.position.y = 0.5;
    bush.castShadow = true;

    const flwMat = getCachedColorMaterial('#EC4899', 0.4);
    const flw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), flwMat);
    flw.position.set(0, 0.78, 0);

    group.add(pot, bush, flw);
  }

  return group;
}
