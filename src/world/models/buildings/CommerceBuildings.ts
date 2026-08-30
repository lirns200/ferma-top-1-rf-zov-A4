import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * Country Order Board with pinned notes, wooden canopy, service bell, and supply crate
 */
export function createOrderBoardGroup(): THREE.Group {
  const group = new THREE.Group();

  // 2 Wooden Support Posts
  const postGeo = new THREE.BoxGeometry(0.12, 1.8, 0.12);
  const postMat = getCachedColorMaterial('#78350F', 0.85);
  const pL = new THREE.Mesh(postGeo, postMat);
  pL.position.set(-0.65, 0.9, 0);
  pL.castShadow = true;
  const pR = new THREE.Mesh(postGeo, postMat);
  pR.position.set(0.65, 0.9, 0);
  pR.castShadow = true;
  group.add(pL, pR);

  // Main Cork Board
  const boardGeo = new THREE.BoxGeometry(1.4, 1.0, 0.1);
  const boardMat = getCachedColorMaterial('#D97706', 0.7);
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 1.1, 0);
  board.castShadow = true;
  group.add(board);

  // Shingled Canopy / Little Roof
  const canopyGeo = new THREE.BoxGeometry(1.6, 0.1, 0.5);
  const canopyMat = getCachedColorMaterial('#9A3412', 0.7);
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 1.7, 0.05);
  canopy.rotation.x = 0.15;
  canopy.castShadow = true;
  group.add(canopy);

  // Paper Order Notes with colorful pins
  const paperMat = getCachedColorMaterial('#FEF08A', 0.3);
  const paperGeo = new THREE.BoxGeometry(0.3, 0.36, 0.02);
  [
    [-0.45, 1.25, 0.06], [-0.05, 1.28, 0.06], [0.38, 1.22, 0.06],
    [-0.35, 0.85, 0.06], [0.1, 0.88, 0.06], [0.45, 0.82, 0.06]
  ].forEach(([ox, oy, oz]) => {
    const note = new THREE.Mesh(paperGeo, paperMat);
    note.position.set(ox, oy, oz);
    note.rotation.z = (Math.random() - 0.5) * 0.2;
    group.add(note);

    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 6, 6),
      getCachedColorMaterial(Math.random() > 0.5 ? '#EF4444' : '#3B82F6', 0.3)
    );
    pin.position.set(ox, oy + 0.15, oz + 0.02);
    group.add(pin);
  });

  // Brass Service Bell
  const bellGeo = new THREE.ConeGeometry(0.09, 0.12, 8);
  const bellMat = getCachedColorMaterial('#F59E0B', 0.2, 0.8);
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.position.set(0.82, 1.4, 0.05);
  group.add(bell);

  // Delivery Supply Crate with wrapped parcels
  const crateGeo = new THREE.BoxGeometry(0.6, 0.4, 0.4);
  const crateMat = getCachedColorMaterial('#B45309', 0.8);
  const crate = new THREE.Mesh(crateGeo, crateMat);
  crate.position.set(-0.5, 0.2, 0.4);
  crate.castShadow = true;
  group.add(crate);

  return group;
}

/**
 * Roadside Farm Stand / Shop with striped canopy, fruit crates, and chalkboard
 */
export function createRoadsideShopGroup(): THREE.Group {
  const group = new THREE.Group();

  // Wooden Counter & Base
  const baseGeo = new THREE.BoxGeometry(1.8, 0.7, 1.2);
  const woodMat = getCachedColorMaterial('#9A3412', 0.7);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.set(0, 0.35, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // 4 Canopy Corner Posts
  const postGeo = new THREE.BoxGeometry(0.08, 1.4, 0.08);
  const postMat = getCachedColorMaterial('#78350F', 0.7);
  [
    [-0.85, -0.55], [0.85, -0.55], [-0.85, 0.55], [0.85, 0.55]
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(px, 1.35, pz);
    post.castShadow = true;
    group.add(post);
  });

  // Red & White Striped Fabric Canopy
  const stripeWidth = 0.25;
  for (let i = -4; i <= 4; i++) {
    const isRed = (i + 4) % 2 === 0;
    const stripeGeo = new THREE.BoxGeometry(stripeWidth, 0.08, 1.4);
    const stripeMat = getCachedColorMaterial(isRed ? '#DC2626' : '#F8FAFC', 0.4);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(i * (stripeWidth - 0.02), 2.05, 0);
    stripe.rotation.x = 0.12;
    stripe.castShadow = true;
    group.add(stripe);
  }

  // Fruit Display Crates on counter
  const crateGeo = new THREE.BoxGeometry(0.45, 0.22, 0.4);
  const crateMat = getCachedColorMaterial('#B45309', 0.8);
  const c1 = new THREE.Mesh(crateGeo, crateMat);
  c1.position.set(-0.55, 0.8, 0.1);
  const c2 = new THREE.Mesh(crateGeo, crateMat);
  c2.position.set(0, 0.8, 0.1);
  const c3 = new THREE.Mesh(crateGeo, crateMat);
  c3.position.set(0.55, 0.8, 0.1);
  group.add(c1, c2, c3);

  // Produce items in crates (apples, carrots, berries)
  const itemGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const redMat = getCachedColorMaterial('#EF4444', 0.4);
  const orangeMat = getCachedColorMaterial('#F97316', 0.4);
  const purpleMat = getCachedColorMaterial('#8B5CF6', 0.4);

  [[-0.6, 0.95, 0.1], [-0.5, 0.95, 0.15], [-0.55, 0.95, 0.05]].forEach(([ix, iy, iz]) => {
    const itm = new THREE.Mesh(itemGeo, redMat);
    itm.position.set(ix, iy, iz);
    group.add(itm);
  });
  [[0, 0.95, 0.1], [-0.06, 0.95, 0.15], [0.06, 0.95, 0.05]].forEach(([ix, iy, iz]) => {
    const itm = new THREE.Mesh(itemGeo, orangeMat);
    itm.position.set(ix, iy, iz);
    group.add(itm);
  });
  [[0.6, 0.95, 0.1], [0.5, 0.95, 0.15], [0.55, 0.95, 0.05]].forEach(([ix, iy, iz]) => {
    const itm = new THREE.Mesh(itemGeo, purpleMat);
    itm.position.set(ix, iy, iz);
    group.add(itm);
  });

  // Chalkboard Sign
  const chalkGeo = new THREE.BoxGeometry(0.5, 0.4, 0.04);
  const chalkMat = getCachedColorMaterial('#1E293B', 0.8);
  const chalk = new THREE.Mesh(chalkGeo, chalkMat);
  chalk.position.set(0, 0.45, 0.62);
  group.add(chalk);

  return group;
}
