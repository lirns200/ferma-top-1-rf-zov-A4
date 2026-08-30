import * as THREE from 'three';

// -------------------------------------------------------------
// GABLE SHAPE HELPERS (Exact roofs without poking corners)
// -------------------------------------------------------------

export function createTriangularGable(width: number, height: number, depth: number, material: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  shape.moveTo(-halfW, 0);
  shape.lineTo(halfW, 0);
  shape.lineTo(0, height);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.center();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createGambrelGable(width: number, lowerH: number, totalH: number, depth: number, material: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  const halfW = width / 2;
  const shoulderW = halfW * 0.72;
  shape.moveTo(-halfW, 0);
  shape.lineTo(halfW, 0);
  shape.lineTo(shoulderW, lowerH);
  shape.lineTo(0, totalH);
  shape.lineTo(-shoulderW, lowerH);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.center();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
