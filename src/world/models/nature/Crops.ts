import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * 5-Stage Crop Plant Growth Models (Wheat, Corn, Carrot, Pumpkin, Tomato, Cotton, etc.)
 */
export function createCropStageMesh(cropId: string, stage: 0 | 1 | 2 | 3 | 4, cropColor: string): THREE.Group {
  const group = new THREE.Group();

  // Stage 0: Moist dark soil mound with tiny green seed dots
  if (stage === 0) {
    const moundGeo = new THREE.BoxGeometry(0.75, 0.08, 0.75);
    const moundMat = getCachedColorMaterial('#3B1808', 0.95);
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.y = 0.05;
    group.add(mound);

    const dotMat = getCachedColorMaterial('#84CC16', 0.6);
    const dotGeo = new THREE.SphereGeometry(0.04, 4, 4);
    [-0.2, 0, 0.2].forEach(dx => {
      [-0.2, 0.2].forEach(dz => {
        const d = new THREE.Mesh(dotGeo, dotMat);
        d.position.set(dx, 0.1, dz);
        group.add(d);
      });
    });
    return group;
  }

  // Stage 1: Little bright green dual sprouts
  if (stage === 1) {
    const sproutMat = getCachedColorMaterial('#84CC16', 0.5);
    [-0.18, 0.18].forEach(sx => {
      const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5), sproutMat);
      sprout.position.set(sx, 0.13, 0);
      group.add(sprout);
    });
    return group;
  }

  // Stage 2: Tall growing vegetative stems
  if (stage === 2) {
    const stemMat = getCachedColorMaterial('#65A30D', 0.55);
    [-0.2, 0, 0.2].forEach(sx => {
      const stem = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 6), stemMat);
      stem.position.set(sx, 0.28, (Math.random() - 0.5) * 0.1);
      group.add(stem);
    });
    return group;
  }

  // Stage 3: Bushy budding plant with flower / unripe hints
  if (stage === 3) {
    const plantMat = getCachedColorMaterial('#4D7C0F', 0.6);
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 6), plantMat);
      p.position.set(((i % 2) - 0.5) * 0.35, 0.38, (Math.floor(i / 2) - 0.5) * 0.35);
      group.add(p);
    }
    return group;
  }

  // Stage 4: FULLY RIPE HARVEST-READY CROP (Distinctive 3D geometry for each crop!)
  if (cropId === 'wheat') {
    // Dense golden swaying wheat stalks with wheat heads
    const wheatMat = getCachedColorMaterial('#FBBF24', 0.5);
    const stalkGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.9, 5);
    const headGeo = new THREE.ConeGeometry(0.08, 0.35, 5);

    [
      [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25],
      [0, -0.15], [0, 0.15], [-0.15, 0], [0.15, 0]
    ].forEach(([wx, wz]) => {
      const stalk = new THREE.Mesh(stalkGeo, wheatMat);
      stalk.position.set(wx, 0.45, wz);
      stalk.rotation.z = (wx > 0 ? 0.08 : -0.08);
      const head = new THREE.Mesh(headGeo, getCachedColorMaterial('#F59E0B', 0.4));
      head.position.set(wx, 0.95, wz);
      group.add(stalk, head);
    });

  } else if (cropId === 'corn') {
    // Tall green stalks with bright yellow cobs wrapped in green husks
    const cornMat = getCachedColorMaterial('#15803D', 0.6);
    const cobMat = getCachedColorMaterial('#FACC15', 0.3);

    [-0.2, 0.2].forEach(cx => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 6), cornMat);
      stalk.position.set(cx, 0.6, 0);
      stalk.castShadow = true;
      const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 6), cobMat);
      cob.position.set(cx + 0.12, 0.75, 0);
      cob.rotation.z = 0.3;
      group.add(stalk, cob);
    });

  } else if (cropId === 'carrot') {
    // Feathery green tops with bright orange carrot shoulders popping up
    const greenMat = getCachedColorMaterial('#22C55E', 0.6);
    const orangeMat = getCachedColorMaterial('#F97316', 0.4);

    [-0.2, 0, 0.2].forEach(cx => {
      [-0.15, 0.15].forEach(cz => {
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), orangeMat);
        carrot.position.set(cx, 0.12, cz);
        carrot.rotation.x = Math.PI;
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 5), greenMat);
        top.position.set(cx, 0.35, cz);
        group.add(carrot, top);
      });
    });

  } else if (cropId === 'pumpkin') {
    // Plump orange ribbed pumpkins resting on broad leaves
    const pumpMat = getCachedColorMaterial('#EA580C', 0.4);
    const leafMat = getCachedColorMaterial('#166534', 0.7);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), leafMat);
    leaf.position.y = 0.08;
    group.add(leaf);

    const pump = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), pumpMat);
    pump.position.set(0, 0.35, 0);
    pump.scale.set(1.1, 0.8, 1.1);
    pump.castShadow = true;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 5), getCachedColorMaterial('#451A03', 0.8));
    stem.position.set(0, 0.65, 0);
    group.add(pump, stem);

  } else if (cropId === 'tomato') {
    // Trellis wooden stake with glossy red tomatoes
    const stakeMat = getCachedColorMaterial('#78350F', 0.8);
    const stake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), stakeMat);
    stake.position.set(0, 0.55, 0);
    group.add(stake);

    const vineMat = getCachedColorMaterial('#15803D', 0.6);
    const vine = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6), vineMat);
    vine.position.set(0, 0.5, 0);
    group.add(vine);

    const redMat = getCachedColorMaterial('#EF4444', 0.3);
    [
      [-0.18, 0.4, 0.15], [0.18, 0.6, 0.15], [-0.15, 0.7, -0.15], [0.15, 0.35, -0.15]
    ].forEach(([tx, ty, tz]) => {
      const tom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), redMat);
      tom.position.set(tx, ty, tz);
      group.add(tom);
    });

  } else if (cropId === 'cotton') {
    // Branching woody stems with puffy white cotton bolls
    const stemMat = getCachedColorMaterial('#78350F', 0.8);
    const cottonMat = getCachedColorMaterial('#FFFFFF', 0.9);

    const stem = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 6), stemMat);
    stem.position.set(0, 0.4, 0);
    group.add(stem);

    [
      [-0.15, 0.65, 0.1], [0.15, 0.75, -0.1], [0, 0.85, 0.15], [0.18, 0.55, 0.15]
    ].forEach(([cx, cy, cz]) => {
      const boll = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), cottonMat);
      boll.position.set(cx, cy, cz);
      group.add(boll);
    });

  } else {
    // Generic lush flowering crop
    const plantGeo = new THREE.ConeGeometry(0.36, 0.95, 6);
    const plantMat = getCachedColorMaterial('#65A30D', 0.6);
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.y = 0.48;
    plant.castShadow = true;
    group.add(plant);

    const fruitGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const fruitMat = getCachedColorMaterial(cropColor, 0.4);
    const f1 = new THREE.Mesh(fruitGeo, fruitMat);
    f1.position.set(0.12, 0.85, 0);
    const f2 = new THREE.Mesh(fruitGeo, fruitMat);
    f2.position.set(-0.12, 0.75, 0.1);
    group.add(f1, f2);
  }

  return group;
}
