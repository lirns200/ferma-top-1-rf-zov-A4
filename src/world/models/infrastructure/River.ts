import * as THREE from 'three';
import { SeasonType } from '../../../types';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * Organic Winding River Mesh & Riverbed
 * Beautiful curved river channel subdivided into 56 cross-sections.
 */
export function createWindingRiverMesh(season: SeasonType): {
  waterMesh: THREE.Mesh;
  riverbedMesh: THREE.Mesh;
} {
  const numSteps = 56;
  const numCross = 12;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s <= numSteps; s++) {
    const t = s / numSteps;
    const z = -26 + t * (54 - (-26));

    // Natural subtle curve within the bank channel (x = 9.7 to 22.3)
    const leftX = 9.75 + Math.sin(z * 0.15) * 0.25;
    const rightX = 22.25 + Math.cos(z * 0.15) * 0.25;

    for (let c = 0; c <= numCross; c++) {
      const u = c / numCross;
      const x = leftX + (rightX - leftX) * u;
      positions.push(x, -0.06, z);
      uvs.push(u, t * 10);
    }
  }

  const stride = numCross + 1;
  for (let s = 0; s < numSteps; s++) {
    for (let c = 0; c < numCross; c++) {
      const i0 = s * stride + c;
      const i1 = i0 + 1;
      const i2 = (s + 1) * stride + c;
      const i3 = i2 + 1;
      indices.push(i0, i2, i1);
      indices.push(i1, i2, i3);
    }
  }

  const waterGeo = new THREE.BufferGeometry();
  waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
  waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvs), 2));
  waterGeo.setIndex(indices);
  waterGeo.computeVertexNormals();

  const waterMaterial = new THREE.MeshStandardMaterial({
    color: season === 'winter' ? 0x93C5FD : 0x0284C7,
    roughness: 0.35,
    metalness: 0.08,
    transparent: true,
    opacity: 0.88,
    flatShading: false,
    side: THREE.DoubleSide,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMaterial);
  waterMesh.name = 'river_water';
  waterMesh.position.y = 0;
  waterMesh.receiveShadow = true;

  // Solid wide riverbed preventing any view into the void
  const bedGeo = new THREE.BoxGeometry(16.0, 0.5, 96);
  const bedMaterial = getCachedColorMaterial(season === 'winter' ? '#64748B' : '#075985', 0.95);
  const riverbedMesh = new THREE.Mesh(bedGeo, bedMaterial);
  riverbedMesh.position.set(16.0, -0.45, 0);
  riverbedMesh.receiveShadow = true;

  return { waterMesh, riverbedMesh };
}
