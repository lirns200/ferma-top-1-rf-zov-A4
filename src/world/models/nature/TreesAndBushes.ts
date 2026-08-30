import * as THREE from 'three';
import { SeasonType } from '../../../types';
import { SEASONS_INFO } from '../../../config/events';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * 3D Fruit Trees & Berry Bushes (Apple, Cherry, Orange, Peach, Cocoa, Lemon, Berry Bushes)
 */
export function createTreeBushMesh(configId: string, season: SeasonType, hasFruit: boolean): THREE.Group {
  const group = new THREE.Group();
  const seasonInfo = SEASONS_INFO[season];

  if (configId.includes('bush')) {
    // Dense cloud-like berry bush with vibrant berry clusters
    const bushCrown = new THREE.Group();
    bushCrown.name = 'bush_crown';
    bushCrown.position.set(0, 0.2, 0);

    const bushMat = getCachedColorMaterial(seasonInfo.foliageColor, 0.7);
    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), bushMat);
    b1.position.set(0, 0.35, 0);
    b1.castShadow = true;
    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bushMat);
    b2.position.set(0.25, 0.25, 0.2);
    bushCrown.add(b1, b2);

    if (hasFruit) {
      const berryColor = configId.includes('black') ? '#3B0764' : configId.includes('blue') ? '#2563EB' : '#E11D48';
      const berryMat = getCachedColorMaterial(berryColor, 0.3);
      const berryGeo = new THREE.SphereGeometry(0.09, 6, 6);
      [
        [0.3, 0.45, 0.3], [-0.3, 0.35, 0.3], [0, 0.6, 0.35],
        [0.35, 0.25, -0.2], [-0.3, 0.4, -0.25]
      ].forEach(([bx, by, bz]) => {
        const b = new THREE.Mesh(berryGeo, berryMat);
        b.position.set(bx, by, bz);
        bushCrown.add(b);
      });
    }
    group.add(bushCrown);
  } else {
    // Stylized Low-Poly Fruit Tree with textured wood trunk and 3-tiered puffy cloud foliage
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.5, 8);
    const trunkMat = getCachedColorMaterial('#78350F', 0.85);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    group.add(trunk);

    const crownGroup = new THREE.Group();
    crownGroup.name = 'tree_crown';
    crownGroup.position.set(0, 1.1, 0); // Pivot point at trunk head for natural wind bending

    const foliageMat = getCachedColorMaterial(seasonInfo.foliageColor, 0.65);
    const fol1 = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), foliageMat);
    fol1.position.set(0, 0.75, 0);
    fol1.castShadow = true;
    const fol2 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), foliageMat);
    fol2.position.set(0.3, 1.1, -0.2);
    fol2.castShadow = true;
    const fol3 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), foliageMat);
    fol3.position.set(-0.25, 1.0, 0.25);
    fol3.castShadow = true;
    crownGroup.add(fol1, fol2, fol3);

    if (hasFruit) {
      const fColor = configId.includes('apple') ? '#EF4444' :
                     configId.includes('cherry') ? '#DC2626' :
                     configId.includes('orange') ? '#F97316' :
                     configId.includes('peach') ? '#FB923C' :
                     configId.includes('cocoa') ? '#78350F' : '#EAB308';
      const fruitMat = getCachedColorMaterial(fColor, 0.35);
      const fruitGeo = new THREE.SphereGeometry(0.13, 6, 6);
      [
        [0.55, 0.6, 0.4], [-0.55, 0.7, 0.3], [0.1, 1.2, 0.55],
        [0.45, 0.45, -0.45], [-0.4, 0.55, -0.5]
      ].forEach(([fx, fy, fz]) => {
        const f = new THREE.Mesh(fruitGeo, fruitMat);
        f.position.set(fx, fy, fz);
        crownGroup.add(f);
      });
    }
    group.add(crownGroup);
  }

  return group;
}
