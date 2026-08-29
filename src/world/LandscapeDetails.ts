import * as THREE from 'three';
import { SeasonType } from '../types';

type Point2 = readonly [number, number];

const SEASON_PALETTES: Record<SeasonType, {
  grassLight: number;
  grassDark: number;
  foliage: number;
  foliageAccent: number;
  flower: number;
}> = {
  spring: { grassLight: 0x84cc5a, grassDark: 0x4d8b3a, foliage: 0x3f9b45, foliageAccent: 0x86c94f, flower: 0xf9a8d4 },
  summer: { grassLight: 0x74b84d, grassDark: 0x3f7f35, foliage: 0x2f7d3b, foliageAccent: 0x63a943, flower: 0xfde047 },
  autumn: { grassLight: 0x8fa94a, grassDark: 0x667c34, foliage: 0xb85f2e, foliageAccent: 0xe0a53b, flower: 0xfb923c },
  winter: { grassLight: 0xd8e6e7, grassDark: 0xaec7c8, foliage: 0xb8d2cf, foliageAccent: 0xe6f3f2, flower: 0xc4b5fd },
};

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function makeMaterial(color: number, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

function makeGroundTint(color: number, opacity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
}

function createRibbon(points: Point2[], width: number, y: number, material: THREE.Material, name: string) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, y, z)),
    false,
    'centripetal',
  );
  const samples = curve.getPoints(Math.max(20, points.length * 9));
  const positions: number[] = [];
  const indices: number[] = [];

  samples.forEach((point, index) => {
    const previous = samples[Math.max(0, index - 1)];
    const next = samples[Math.min(samples.length - 1, index + 1)];
    const tangent = next.clone().sub(previous).normalize();
    const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(width / 2);
    const left = point.clone().add(perpendicular);
    const right = point.clone().sub(perpendicular);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
    if (index < samples.length - 1) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.receiveShadow = true;
  return mesh;
}

function setInstance(
  mesh: THREE.InstancedMesh,
  index: number,
  x: number,
  y: number,
  z: number,
  scale: number | THREE.Vector3,
  rotationY = 0,
) {
  const object = new THREE.Object3D();
  object.position.set(x, y, z);
  object.rotation.y = rotationY;
  if (typeof scale === 'number') object.scale.setScalar(scale);
  else object.scale.copy(scale);
  object.updateMatrix();
  mesh.setMatrixAt(index, object.matrix);
}

function createTerrainRelief(season: SeasonType) {
  const palette = SEASON_PALETTES[season];
  const group = new THREE.Group();
  group.name = 'terrain_relief';
  const patchGeometry = new THREE.CylinderGeometry(1, 1.12, 0.08, 10);
  const lightPatches = new THREE.InstancedMesh(patchGeometry, makeGroundTint(palette.grassLight, 0.22), 16);
  lightPatches.name = 'sunlit_grass_patches';
  const darkPatches = new THREE.InstancedMesh(patchGeometry, makeGroundTint(palette.grassDark, 0.16), 13);
  darkPatches.name = 'shadow_grass_patches';
  const lightLayout: Point2[] = [
    [-29, -18], [-25, 7], [-19, 19], [-15, -18], [-12, 11], [-7, 24], [-3, -21],
    [1, 17], [5, -15], [7, 25], [26, -25], [29, -16], [27, 4], [30, 13], [26, 23], [32, 27],
  ];
  const darkLayout: Point2[] = [
    [-31, -2], [-27, 17], [-21, -24], [-18, 7], [-11, -14], [-8, 18], [-2, 8],
    [5, -24], [7, 12], [25, -9], [31, -4], [27, 17], [31, 25],
  ];
  lightLayout.forEach(([x, z], i) => setInstance(lightPatches, i, x, 0.035, z, new THREE.Vector3(1.45 + (i % 3) * 0.55, 1, 1.05 + ((i + 1) % 3) * 0.38), i * 0.71));
  darkLayout.forEach(([x, z], i) => setInstance(darkPatches, i, x, 0.027, z, new THREE.Vector3(1.3 + (i % 2) * 0.55, 1, 0.95 + (i % 3) * 0.34), i * 0.83));
  const moundGeometry = new THREE.SphereGeometry(1, 12, 8);
  const mounds = new THREE.InstancedMesh(moundGeometry, makeMaterial(palette.grassDark, 0.98), 10);
  mounds.name = 'edge_relief_mounds';
  const moundLayout: Point2[] = [
    [-30, -25], [-29, -6], [-30, 17], [-21, 29], [-4, 29],
    [26, -28], [31, -18], [30, 1], [31, 18], [26, 29],
  ];
  moundLayout.forEach(([x, z], i) => {
    setInstance(mounds, i, x, -0.58, z, new THREE.Vector3(2.5 + (i % 3) * 0.55, 0.72 + (i % 2) * 0.18, 2 + ((i + 1) % 3) * 0.45), i * 0.47);
  });
  mounds.receiveShadow = true;
  group.add(mounds, lightPatches, darkPatches);
  return group;
}

function createRoadNetwork() {
  const group = new THREE.Group();
  group.name = 'winding_roads';
  const edgeMaterial = makeMaterial(0x8a4f18, 1);
  const roadMaterial = makeMaterial(0xc9822b, 1);
  const rutMaterial = new THREE.MeshBasicMaterial({ color: 0x9a5e22, transparent: true, opacity: 0.58 });
  const paths: Point2[][] = [
    [[-33.5, -10.0], [-23, -10.4], [-15, -9.4], [-7, -9.1], [1, -8.8], [9.6, -9]],
    [[22.4, -9], [26, -8.5], [30, -7.2], [35.5, -4.8]],
    [[-7, -9.1], [-7.7, -6.8], [-7.4, -4.8], [-6.2, -2.7], [-4.2, -0.5]],
    [[1, -8.8], [2.2, -7.1], [3.2, -5.1], [4.1, -2.8], [5.7, -0.8]],
  ];
  paths.forEach((points, index) => {
    group.add(createRibbon(points, index < 2 ? 3.25 : 2.15, 0.045, edgeMaterial, `road_edge_${index}`));
    group.add(createRibbon(points, index < 2 ? 2.72 : 1.72, 0.09, roadMaterial, `road_surface_${index}`));
    if (index < 2) {
      const shiftedA = points.map(([x, z]) => [x, z - 0.62] as Point2);
      const shiftedB = points.map(([x, z]) => [x, z + 0.62] as Point2);
      group.add(createRibbon(shiftedA, 0.13, 0.105, rutMaterial, `wheel_rut_${index}_a`));
      group.add(createRibbon(shiftedB, 0.13, 0.105, rutMaterial, `wheel_rut_${index}_b`));
    }
  });
  return group;
}

function createShorelineDetails(random: () => number) {
  const group = new THREE.Group();
  group.name = 'shoreline_details';

  const sandEdgeMaterial = new THREE.MeshBasicMaterial({ color: 0xbfa168, transparent: true, opacity: 0.65 });
  const foamMaterial = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.60 });
  const leftShore: Point2[] = [
    [9.85, -24], [9.85, -16], [9.85, -9], [9.85, 0], [9.85, 8],
    [9.85, 16], [9.85, 24], [9.85, 32], [9.85, 40], [9.85, 48]
  ];
  const rightShore: Point2[] = [
    [22.15, -24], [22.15, -16], [22.15, -9], [22.15, 0], [22.15, 8],
    [22.15, 16], [22.15, 24], [22.15, 32], [22.15, 40], [22.15, 48]
  ];
  group.add(
    createRibbon(leftShore, 0.65, -0.015, sandEdgeMaterial, 'left_shore_sand'),
    createRibbon(rightShore, 0.65, -0.015, sandEdgeMaterial, 'right_shore_sand'),
    createRibbon(leftShore.map(([x, z]) => [x + 0.35, z] as Point2), 0.16, -0.001, foamMaterial, 'left_shore_foam'),
    createRibbon(rightShore.map(([x, z]) => [x - 0.35, z] as Point2), 0.16, -0.001, foamMaterial, 'right_shore_foam'),
  );

  const rockGeometry = new THREE.DodecahedronGeometry(0.34, 0);
  const rocks = new THREE.InstancedMesh(rockGeometry, makeMaterial(0x718096, 0.94), 34);
  rocks.name = 'shore_rocks';
  for (let i = 0; i < rocks.count; i++) {
    const t = i / rocks.count;
    const pIdx = Math.min(leftShore.length - 2, Math.floor(t * (leftShore.length - 1)));
    const segT = (t * (leftShore.length - 1)) - pIdx;
    const side = i % 2 === 0 ? 1 : -1;
    const shoreArr = side > 0 ? leftShore : rightShore;
    const basePt = [
      shoreArr[pIdx][0] + (shoreArr[pIdx + 1][0] - shoreArr[pIdx][0]) * segT,
      shoreArr[pIdx][1] + (shoreArr[pIdx + 1][1] - shoreArr[pIdx][1]) * segT,
    ];
    const x = basePt[0] + (side > 0 ? -0.3 - random() * 0.5 : 0.3 + random() * 0.5);
    const z = basePt[1] + (random() - 0.5) * 1.5;
    setInstance(rocks, i, x, 0.05, z, new THREE.Vector3(0.65 + random() * 0.8, 0.55 + random() * 0.5, 0.7 + random() * 0.65), random() * Math.PI);
  }

  const reedGeometry = new THREE.ConeGeometry(0.055, 1.15, 5);
  const reeds = new THREE.InstancedMesh(reedGeometry, makeMaterial(0x668b2e, 0.9), 42);
  reeds.name = 'shore_reed_clusters';
  for (let i = 0; i < reeds.count; i++) {
    const t = i / reeds.count;
    const pIdx = Math.min(leftShore.length - 2, Math.floor(t * (leftShore.length - 1)));
    const segT = (t * (leftShore.length - 1)) - pIdx;
    const left = i % 2 === 0;
    const shoreArr = left ? leftShore : rightShore;
    const basePt = [
      shoreArr[pIdx][0] + (shoreArr[pIdx + 1][0] - shoreArr[pIdx][0]) * segT,
      shoreArr[pIdx][1] + (shoreArr[pIdx + 1][1] - shoreArr[pIdx][1]) * segT,
    ];
    const x = basePt[0] + (left ? -0.4 - random() * 0.4 : 0.4 + random() * 0.4);
    const z = basePt[1] + (random() - 0.5) * 1.2;
    setInstance(reeds, i, x, 0.51, z, new THREE.Vector3(0.8 + random() * 0.5, 0.75 + random() * 0.9, 0.8 + random() * 0.5), random() * 0.35);
  }

  const sparkleGeometry = new THREE.PlaneGeometry(0.85, 0.07);
  sparkleGeometry.rotateX(-Math.PI / 2);
  const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xdff7ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const sparkles = new THREE.InstancedMesh(sparkleGeometry, sparkleMaterial, 28);
  sparkles.name = 'river_glimmers';
  for (let i = 0; i < sparkles.count; i++) {
    const t = i / sparkles.count;
    const pIdx = Math.min(leftShore.length - 2, Math.floor(t * (leftShore.length - 1)));
    const segT = (t * (leftShore.length - 1)) - pIdx;
    const lx = leftShore[pIdx][0] + (leftShore[pIdx + 1][0] - leftShore[pIdx][0]) * segT;
    const rx = rightShore[pIdx][0] + (rightShore[pIdx + 1][0] - rightShore[pIdx][0]) * segT;
    const lz = leftShore[pIdx][1] + (leftShore[pIdx + 1][1] - leftShore[pIdx][1]) * segT;
    const x = lx + 0.8 + random() * (rx - lx - 1.6);
    const z = lz + (random() - 0.5) * 1.5;
    setInstance(sparkles, i, x, -0.025, z, new THREE.Vector3(0.55 + random() * 1.4, 1, 1), (Math.PI / 2) + (random() - 0.5) * 0.35);
  }
  group.add(rocks, reeds, sparkles);
  return group;
}

function createGrassTuftGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const bladeAngles = [0, 1.25, 2.5, 3.75, 5.0];
  const bladeHeights = [0.65, 0.55, 0.72, 0.58, 0.62];
  const bladeLeans = [0.18, 0.22, 0.15, 0.24, 0.20];

  bladeAngles.forEach((angle, idx) => {
    const ht = bladeHeights[idx];
    const lean = bladeLeans[idx];
    const bGeo = new THREE.ConeGeometry(0.045, ht, 4);
    bGeo.translate(0, ht / 2, 0); // Pivot at the base
    bGeo.rotateZ(lean);
    bGeo.rotateY(angle);
    geometries.push(bGeo);
  });

  const posArr: number[] = [];
  const normArr: number[] = [];
  const indArr: number[] = [];
  let vertOffset = 0;

  geometries.forEach(geo => {
    const pos = geo.attributes.position;
    const norm = geo.attributes.normal;
    const ind = geo.index;
    for (let i = 0; i < pos.count; i++) {
      posArr.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normArr.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }
    if (ind) {
      for (let i = 0; i < ind.count; i++) {
        indArr.push(ind.getX(i) + vertOffset);
      }
    }
    vertOffset += pos.count;
    geo.dispose();
  });

  const mergedGeo = new THREE.BufferGeometry();
  mergedGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  mergedGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
  mergedGeo.setIndex(indArr);
  return mergedGeo;
}

function createMeadowDetails(season: SeasonType, random: () => number) {
  const palette = SEASON_PALETTES[season];
  const group = new THREE.Group();
  group.name = 'meadow_details';
  const positions: Point2[] = [
    [-30, -20], [-29, -15], [-28, -3], [-29, 9], [-27, 20], [-23, 25], [-20, -19],
    [-18, 15], [-15, -22], [-14, 23], [-11, 13], [-9, -16], [-7, 21], [-4, -20],
    [-2, 13], [1, 22], [4, -19], [6, 16], [7, 24], [25, -25], [27, -19], [30, -23],
    [25, -13], [31, -10], [27, 2], [31, 7], [25, 14], [30, 18], [27, 25], [32, 27],
  ];

  const stemGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.42, 5);
  const stems = new THREE.InstancedMesh(stemGeometry, makeMaterial(0x4d7c0f, 0.95), positions.length * 2);
  stems.name = 'meadow_flower_stems';
  const bloomGeometry = new THREE.OctahedronGeometry(0.095, 0);
  const blooms = new THREE.InstancedMesh(bloomGeometry, makeMaterial(palette.flower, 0.65), positions.length * 2);
  blooms.name = 'meadow_flower_blooms';
  const flowerInstances: Array<{ x: number; y: number; z: number; scale: number; rotY: number; height: number }> = [];

  positions.forEach(([baseX, baseZ], index) => {
    for (let offset = 0; offset < 2; offset++) {
      const i = index * 2 + offset;
      const x = baseX + (random() - 0.5) * 1.6;
      const z = baseZ + (random() - 0.5) * 1.6;
      const height = 0.7 + random() * 0.55;
      const rotY = random() * Math.PI * 2;
      const scale = 0.72 + random() * 0.45;
      setInstance(stems, i, x, height * 0.2, z, new THREE.Vector3(1, height, 1), rotY);
      setInstance(blooms, i, x, 0.41 + height * 0.18, z, scale, rotY);
      flowerInstances.push({ x, y: 0, z, scale, rotY, height });
    }
  });
  stems.userData.instances = flowerInstances;
  blooms.userData.instances = flowerInstances;

  const grassGeometry = createGrassTuftGeometry();
  const grassCount = 680;
  const grass = new THREE.InstancedMesh(grassGeometry, makeMaterial(palette.grassDark, 0.88), grassCount);
  grass.name = 'meadow_grass_tufts';
  const grassInstances: Array<{ x: number; y: number; z: number; scale: THREE.Vector3; rotY: number }> = [];

  for (let i = 0; i < grassCount; i++) {
    let x: number;
    let z: number;

    const zone = i % 5;
    if (zone === 0) {
      // West meadows & hillsides
      x = -32 + random() * 18;
      z = -28 + random() * 56;
    } else if (zone === 1) {
      // East hills beyond river
      x = 24.5 + random() * 11;
      z = -28 + random() * 56;
    } else if (zone === 2) {
      // River banks (west and east bank fringes)
      const isWestBank = i % 2 === 0;
      x = isWestBank ? (9.2 - random() * 2.5) : (22.5 + random() * 2.5);
      z = -26 + random() * 52;
    } else if (zone === 3) {
      // North and South mountain footings
      const isNorth = i % 2 === 0;
      x = -26 + random() * 52;
      z = isNorth ? (-22 - random() * 8) : (20 + random() * 8);
    } else {
      // Farm yard fringes, borders, and lawn clearings
      x = -13 + random() * 24;
      z = -13 + random() * 24;
      // Keep main road clear
      if (z >= -10.8 && z <= -7.4) {
        z = z > -9.1 ? -6.2 : -12.0;
      }
    }

    const scX = 0.75 + random() * 0.55;
    const scY = 0.70 + random() * 0.75;
    const scZ = 0.75 + random() * 0.55;
    const scale = new THREE.Vector3(scX, scY, scZ);
    const rotY = random() * Math.PI * 2;
    setInstance(grass, i, x, 0.02, z, scale, rotY);
    grassInstances.push({ x, y: 0.02, z, scale, rotY });
  }
  grass.userData.instances = grassInstances;

  const fenceSegments: Array<readonly [number, number, number, number]> = [
    [-24, -12.1, 5.2, -0.05], [-18.4, -11.7, 5.2, -0.08], [-12.8, -11.25, 4.6, -0.08],
    [-23.5, 12.6, 4.5, 0.04], [-18.5, 12.8, 4.4, 0.04],
    [25.5, -12.2, 4.2, 0.14], [29.8, -11.3, 4.0, 0.2],
    [25.6, 9.4, 4.4, -0.12], [30.1, 8.6, 4.1, -0.16],
    [-13, 25.8, 4.5, 0.03], [-7.9, 25.9, 4.4, 0.01], [1.6, 25.2, 4.2, -0.05],
  ];
  const fenceMaterial = makeMaterial(0x78421f, 0.96);
  const fenceRails = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.11, 0.11), fenceMaterial, fenceSegments.length * 2);
  fenceRails.name = 'country_fence_rails';
  const fencePosts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1.15, 0.16), fenceMaterial, fenceSegments.length * 2);
  fencePosts.name = 'country_fence_posts';
  fenceSegments.forEach(([x, z, length, rotation], i) => {
    const dx = Math.cos(rotation) * length * 0.5;
    const dz = -Math.sin(rotation) * length * 0.5;
    setInstance(fenceRails, i * 2, x, 0.5, z, new THREE.Vector3(length, 1, 1), rotation);
    setInstance(fenceRails, i * 2 + 1, x, 0.82, z, new THREE.Vector3(length, 1, 1), rotation);
    setInstance(fencePosts, i * 2, x - dx, 0.57, z - dz, 1, rotation);
    setInstance(fencePosts, i * 2 + 1, x + dx, 0.57, z + dz, 1, rotation);
  });
  fenceRails.castShadow = true;
  fencePosts.castShadow = true;
  group.add(stems, blooms, grass, fenceRails, fencePosts);
  return group;
}

function createForestDetails(season: SeasonType, random: () => number) {
  const palette = SEASON_PALETTES[season];
  const group = new THREE.Group();
  group.name = 'forest_details';
  const shrubGeometry = new THREE.IcosahedronGeometry(0.72, 1);
  const shrubs = new THREE.InstancedMesh(shrubGeometry, makeMaterial(palette.foliage, 0.86), 32);
  shrubs.name = 'forest_shrubs';
  for (let i = 0; i < shrubs.count; i++) {
    const edge = i % 2 === 0;
    const x = edge ? -31 + random() * 10 : 25 + random() * 8;
    let z = -27 + random() * 54;
    // Keep road corridors completely clear of shrubs
    if (z >= -12.2 && z <= -7.2) {
      z = z > -9.7 ? -6.2 : -13.2;
    }
    setInstance(shrubs, i, x, 0.48, z, new THREE.Vector3(0.75 + random() * 0.8, 0.65 + random() * 0.7, 0.75 + random() * 0.8), random() * Math.PI);
  }

  const treePoints: Point2[] = [
    [-30, -25], [-27, -19], [-31, 14], [-25, 27], [-20, -27], [-12, 28],
    [25, -29], [29, -25], [32, -18], [26, 10], [31, 15], [26, 28], [32, 25],
  ];
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 1.7, 7), makeMaterial(0x77431f, 0.95), treePoints.length);
  trunks.name = 'scenery_tree_trunks';
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.18, 1), makeMaterial(palette.foliageAccent, 0.82), treePoints.length);
  crowns.name = 'scenery_tree_crowns';
  treePoints.forEach(([x, z], i) => {
    const scale = 0.85 + random() * 0.65;
    setInstance(trunks, i, x, 0.85 * scale, z, new THREE.Vector3(scale, scale, scale), random() * Math.PI);
    setInstance(crowns, i, x, 2.05 * scale, z, new THREE.Vector3(scale, scale * (0.9 + random() * 0.25), scale), random() * Math.PI);
  });
  trunks.castShadow = true;
  crowns.castShadow = true;

  const stumps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.42, 0.35, 8), makeMaterial(0x875027, 0.96), 8);
  stumps.name = 'forest_stumps';
  [[-24, -12], [-21, 20], [-16, 26], [4, 24], [27, -15], [30, 3], [25, 21], [-29, 4]].forEach(([x, z], i) => {
    setInstance(stumps, i, x, 0.18, z, 0.75 + random() * 0.5, random() * Math.PI);
  });
  group.add(shrubs, trunks, crowns, stumps);
  return group;
}

function createAtmosphereDetails(random: () => number) {
  const group = new THREE.Group();
  group.name = 'atmosphere_details';
  const wingGeometry = new THREE.CircleGeometry(0.14, 6, 0, Math.PI);
  const wingMaterial = new THREE.MeshBasicMaterial({ color: 0xfde68a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const butterflies = new THREE.InstancedMesh(wingGeometry, wingMaterial, 12);
  butterflies.name = 'meadow_butterflies';
  for (let i = 0; i < butterflies.count; i++) {
    const x = -25 + random() * 53;
    const z = -24 + random() * 48;
    setInstance(butterflies, i, x, 0.75 + random() * 1.5, z, 0.7 + random() * 0.6, random() * Math.PI);
  }
  group.add(butterflies);
  return group;
}

export function createLandscapeDetailGroup(season: SeasonType): THREE.Group {
  const random = createSeededRandom(0x51f15e + ['spring', 'summer', 'autumn', 'winter'].indexOf(season) * 97);
  const group = new THREE.Group();
  group.name = 'map_landscape_details';
  group.add(
    createTerrainRelief(season),
    createRoadNetwork(),
    createShorelineDetails(random),
    createMeadowDetails(season, random),
    createForestDetails(season, random),
    createAtmosphereDetails(random),
  );
  return group;
}
