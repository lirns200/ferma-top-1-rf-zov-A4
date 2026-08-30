import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * 3D Obstacles & Natural Clearables (Standing pines, oaks, boulders, stumps, swamp puddles, fallen logs)
 */
export function createObstacleMesh(configId: string): THREE.Group {
  const group = new THREE.Group();

  if (configId.includes('tree') && !configId.includes('stump')) {
    // Standing Wild Tree (Pine, Oak, or Birch)
    const isPine = configId.includes('pine');
    const isBig = configId.includes('big');

    if (isPine) {
      // Layered Evergreen Pine Tree
      const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, isBig ? 1.8 : 1.2, 7);
      const trunkMat = getCachedColorMaterial('#451A03', 0.9);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = isBig ? 0.9 : 0.6;
      trunk.castShadow = true;
      group.add(trunk);

      const crownGroup = new THREE.Group();
      crownGroup.name = 'tree_crown';
      crownGroup.position.set(0, isBig ? 1.2 : 0.8, 0);

      const pineMat = getCachedColorMaterial('#14532D', 0.8);
      const layers = isBig ? 4 : 3;
      for (let i = 0; i < layers; i++) {
        const radius = (isBig ? 1.4 : 1.1) * (1 - i * 0.22);
        const coneHeight = (isBig ? 1.3 : 1.0);
        const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, coneHeight, 6), pineMat);
        cone.position.y = 0.3 + i * 0.75;
        cone.castShadow = true;
        crownGroup.add(cone);
      }
      group.add(crownGroup);
    } else {
      // Broadleaf Oak / Forest Tree with rich fluffy foliage canopy
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.32, isBig ? 1.9 : 1.3, 8);
      const trunkMat = getCachedColorMaterial('#78350F', 0.85);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = isBig ? 0.95 : 0.65;
      trunk.castShadow = true;
      group.add(trunk);

      const crownGroup = new THREE.Group();
      crownGroup.name = 'tree_crown';
      crownGroup.position.set(0, isBig ? 1.3 : 0.9, 0);

      const leafMat = getCachedColorMaterial(isBig ? '#15803D' : '#16A34A', 0.75);
      const leafGeo1 = new THREE.SphereGeometry(isBig ? 1.25 : 0.9, 8, 8);
      const f1 = new THREE.Mesh(leafGeo1, leafMat);
      f1.position.set(0, isBig ? 1.0 : 0.75, 0);
      f1.castShadow = true;

      const leafGeo2 = new THREE.SphereGeometry(isBig ? 0.95 : 0.7, 8, 8);
      const f2 = new THREE.Mesh(leafGeo2, leafMat);
      f2.position.set(0.35, isBig ? 1.5 : 1.1, -0.2);
      f2.castShadow = true;

      const leafGeo3 = new THREE.SphereGeometry(isBig ? 0.85 : 0.6, 8, 8);
      const f3 = new THREE.Mesh(leafGeo3, leafMat);
      f3.position.set(-0.3, isBig ? 1.4 : 1.0, 0.25);
      f3.castShadow = true;

      crownGroup.add(f1, f2, f3);
      group.add(crownGroup);

      // Cute small mushroom at the base of the trunk
      const mushStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.18, 5), getCachedColorMaterial('#F8FAFC', 0.5));
      mushStem.position.set(0.35, 0.09, 0.25);
      const mushCap = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.12, 6), getCachedColorMaterial('#DC2626', 0.4));
      mushCap.position.set(0.35, 0.22, 0.25);
      group.add(mushStem, mushCap);
    }
  } else if (configId.includes('rock') || configId.includes('boulder')) {
    const isBig = configId.includes('boulder');
    const rockGeo = new THREE.DodecahedronGeometry(isBig ? 0.95 : 0.5, 1);
    const rockMat = getCachedColorMaterial('#64748B', 0.85);
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.y = isBig ? 0.6 : 0.32;
    rock.rotation.set(0.3, 0.5, 0.2);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);

    // Moss patch on rock
    const mossMat = getCachedColorMaterial('#4D7C0F', 0.9);
    const moss = new THREE.Mesh(new THREE.SphereGeometry(isBig ? 0.4 : 0.2, 6, 6), mossMat);
    moss.position.set(0.2, isBig ? 0.9 : 0.45, 0.2);
    group.add(moss);

  } else if (configId.includes('stump')) {
    // Weathered tree stump with annual growth rings
    const stumpGeo = new THREE.CylinderGeometry(0.4, 0.48, 0.45, 8);
    const stumpMat = getCachedColorMaterial('#92400E', 0.85);
    const stump = new THREE.Mesh(stumpGeo, stumpMat);
    stump.position.y = 0.225;
    stump.castShadow = true;
    group.add(stump);

    const ringMat = getCachedColorMaterial('#B45309', 0.9);
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 8), ringMat);
    ring.position.y = 0.46;
    group.add(ring);

  } else if (configId.includes('puddle') || configId.includes('swamp')) {
    // Swampy puddle with lily pads
    const puddleGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.05, 12);
    const puddleMat = getCachedColorMaterial('#713F12', 0.2);
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.position.y = 0.03;
    group.add(puddle);

    const padMat = getCachedColorMaterial('#15803D', 0.7);
    const pad1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 6), padMat);
    pad1.position.set(0.2, 0.06, 0.2);
    const pad2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 6), padMat);
    pad2.position.set(-0.25, 0.06, -0.15);
    group.add(pad1, pad2);

  } else {
    // Dead / wild fallen pine log
    const logGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.4, 8);
    const logMat = getCachedColorMaterial('#451A03', 0.9);
    const log = new THREE.Mesh(logGeo, logMat);
    log.position.set(0, 0.2, 0);
    log.rotation.z = Math.PI / 2;
    log.castShadow = true;
    group.add(log);
  }

  return group;
}
