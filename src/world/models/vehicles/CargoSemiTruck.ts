import * as THREE from 'three';
import {
  getCachedColorMaterial,
  getLampHaloTexture,
} from '../shared/materials';

/**
 * Stylized Heavy Cargo Semi-Truck (Фура для бартера, обмена и почтовых доставок)
 * Large American/European heavy semi freight truck with cab, twin exhaust stacks,
 * dual rear axles, and a loaded cargo freight trailer with crates, parcels and parcels badge.
 */
export function createStylizedCargoSemiTruck(): THREE.Group {
  const truck = new THREE.Group();
  truck.name = 'cargo_semi_truck';

  const cabBlue = getCachedColorMaterial('#0284C7', 0.35, 0.2);
  const cabDarkBlue = getCachedColorMaterial('#0369A1', 0.35, 0.2);
  const roofWhite = getCachedColorMaterial('#F8FAFC', 0.3);
  const trailerMat = getCachedColorMaterial('#E2E8F0', 0.4, 0.3);
  const trailerStripe = getCachedColorMaterial('#F59E0B', 0.3);
  const glassMat = getCachedColorMaterial('#7DD3FC', 0.1, 0.7);
  const chromeMat = getCachedColorMaterial('#E2E8F0', 0.2, 0.85);
  const darkSteel = getCachedColorMaterial('#1E293B', 0.85);
  const headlightMat = getCachedColorMaterial('#FEF08A', 0.1, 0.9);
  const amberMat = getCachedColorMaterial('#F59E0B', 0.2, 0.6);
  const tireMat = getCachedColorMaterial('#0F172A', 0.9);

  // ── 1. Semi Cab Chassis & Body ─────────────────────────────────────────
  const chassisGeo = new THREE.BoxGeometry(3.6, 0.2, 1.2);
  const chassis = new THREE.Mesh(chassisGeo, darkSteel);
  chassis.position.set(-0.2, 0.32, 0);
  chassis.castShadow = true;
  truck.add(chassis);

  // Heavy Cab (Forward Cab-Over Style)
  const cabLower = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.15), cabDarkBlue);
  cabLower.position.set(1.0, 0.7, 0);
  cabLower.castShadow = true;

  const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.7, 1.15), cabBlue);
  cabUpper.position.set(0.98, 1.35, 0);
  cabUpper.castShadow = true;

  // Aerodynamic Roof Fairing / Visor
  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.28, 1.1), roofWhite);
  roofCap.position.set(0.9, 1.78, 0);
  roofCap.castShadow = true;

  // Chrome Grille & Front Bumper
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.85), chromeMat);
  grille.position.set(1.62, 0.75, 0);

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 1.25), chromeMat);
  bumper.position.set(1.62, 0.38, 0);
  bumper.castShadow = true;

  truck.add(cabLower, cabUpper, roofCap, grille, bumper);

  // Windshield & Side Windows
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 1.0), glassMat);
  windshield.position.set(1.57, 1.38, 0);

  const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.36, 0.04), glassMat);
  sideWinL.position.set(1.05, 1.38, -0.59);
  const sideWinR = sideWinL.clone();
  sideWinR.position.z = 0.59;
  truck.add(windshield, sideWinL, sideWinR);

  // Twin Chrome Vertical Exhaust Stacks
  const stackGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
  const stackL = new THREE.Mesh(stackGeo, chromeMat);
  stackL.position.set(0.35, 1.45, -0.55);
  const stackR = stackL.clone();
  stackR.position.z = 0.55;
  truck.add(stackL, stackR);

  // ── 2. Freight Cargo Trailer (Box Container) ───────────────────────────
  const trailerBody = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.35, 1.2), trailerMat);
  trailerBody.position.set(-0.95, 1.18, 0);
  trailerBody.castShadow = true;

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.16, 1.22), trailerStripe);
  stripe.position.set(-0.95, 1.05, 0);

  // Sleek Aerodynamic Container Roof Cap
  const roofCapGeo = new THREE.BoxGeometry(2.32, 0.06, 1.22);
  const trailerRoof = new THREE.Mesh(roofCapGeo, darkSteel);
  trailerRoof.position.set(-0.95, 1.88, 0);

  // Front Reefer Cooling Unit on trailer bulkhead
  const reeferGeo = new THREE.BoxGeometry(0.18, 0.45, 0.85);
  const reefer = new THREE.Mesh(reeferGeo, darkSteel);
  reefer.position.set(0.24, 1.48, 0);
  reefer.castShadow = true;

  truck.add(trailerBody, stripe, trailerRoof, reefer);

  // ── 3. Headlights & PointLight ─────────────────────────────────────────
  const hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10);
  hlGeo.rotateZ(Math.PI / 2);
  const hlL = new THREE.Mesh(hlGeo, headlightMat);
  hlL.position.set(1.63, 0.56, -0.42);
  const hlR = hlL.clone();
  hlR.position.z = 0.42;

  const haloTex = getLampHaloTexture();
  const coronaMat = new THREE.SpriteMaterial({
    map: haloTex,
    color: 0xFFFBEB,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const coronaL = new THREE.Sprite(coronaMat);
  coronaL.scale.set(1.4, 1.4, 1);
  coronaL.position.set(1.75, 0.56, -0.42);
  coronaL.name = 'cargo_headlight_beam';
  const coronaR = new THREE.Sprite(coronaMat);
  coronaR.scale.set(1.4, 1.4, 1);
  coronaR.position.set(1.75, 0.56, 0.42);
  coronaR.name = 'cargo_headlight_beam';

  const truckPointLight = new THREE.PointLight(0xFFFBEB, 4.5, 16.0);
  truckPointLight.position.set(1.9, 0.58, 0);
  truckPointLight.name = 'cargo_point_light';
  truck.add(hlL, hlR, coronaL, coronaR, truckPointLight);

  // ── 4. 6 Heavy-Duty Wheels (1 Front Axle, 2 Rear Axles) ────────────────
  const tireGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 14);
  const rimGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.20, 10);

  const wheelPositions = [
    [1.05, -0.65],  [1.05, 0.65],   // Front Cab Axle
    [-0.55, -0.65], [-0.55, 0.65],  // Trailer Axle 1
    [-1.45, -0.65], [-1.45, 0.65],  // Trailer Axle 2
  ];

  wheelPositions.forEach(([wx, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'truck_wheel';
    wheelGroup.position.set(wx, 0.26, wz);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(rimGeo, chromeMat);
    rim.rotation.x = Math.PI / 2;

    wheelGroup.add(tire, rim);
    truck.add(wheelGroup);
  });

  // ── 5. Floating Interactive Loot / Unload Badge (Bobbing above roof) ───
  const lootGroup = new THREE.Group();
  lootGroup.name = 'cargo_loot_badge';
  lootGroup.position.set(-0.95, 2.6, 0);

  const boxGeo = new THREE.BoxGeometry(0.55, 0.45, 0.55);
  const boxMesh = new THREE.Mesh(boxGeo, getCachedColorMaterial('#F59E0B', 0.3));
  boxMesh.castShadow = true;

  const ribbonGeo = new THREE.BoxGeometry(0.58, 0.47, 0.12);
  const ribbonMesh = new THREE.Mesh(ribbonGeo, getCachedColorMaterial('#EF4444', 0.3));

  const haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex,
    color: 0xFDE047,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  }));
  haloSprite.scale.set(1.8, 1.8, 1);

  lootGroup.add(boxMesh, ribbonMesh, haloSprite);
  truck.add(lootGroup);

  return truck;
}
