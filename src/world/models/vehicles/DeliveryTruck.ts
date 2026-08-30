import * as THREE from 'three';
import {
  getCachedColorMaterial,
  getLampHaloTexture,
  getHeadlightGroundTexture,
} from '../shared/materials';

/**
 * Stylized Farm Delivery Truck
 * High-detail vintage red pickup with cream roof visor, chrome bumpers & grille,
 * glowing round headlights, amber blinkers, wooden cargo bed with farm produce crates,
 * milk can, sack of flour, exhaust stack, side mirrors, and treaded wheels.
 */
export function createStylizedDeliveryTruck(): THREE.Group {
  const truck = new THREE.Group();
  truck.name = 'delivery_truck';

  const bodyRed = getCachedColorMaterial('#DC2626', 0.4, 0.1);
  const cabDarkRed = getCachedColorMaterial('#B91C1C', 0.4, 0.1);
  const roofCream = getCachedColorMaterial('#FEF3C7', 0.3);
  const glassMat = getCachedColorMaterial('#7DD3FC', 0.1, 0.7);
  const chromeMat = getCachedColorMaterial('#E2E8F0', 0.2, 0.85);
  const darkSteel = getCachedColorMaterial('#1E293B', 0.85);
  const headlightMat = getCachedColorMaterial('#FEF08A', 0.1, 0.9);
  const amberMat = getCachedColorMaterial('#F59E0B', 0.2, 0.6);
  const woodPlankMat = getCachedColorMaterial('#78350F', 0.8);
  const woodRailMat = getCachedColorMaterial('#B45309', 0.8);
  const crateMat = getCachedColorMaterial('#D97706', 0.8);
  const tireMat = getCachedColorMaterial('#0F172A', 0.9);
  const produceRed = getCachedColorMaterial('#EF4444', 0.3);
  const produceGold = getCachedColorMaterial('#EAB308', 0.3);
  const sackMat = getCachedColorMaterial('#E2E8F0', 0.9);
  const milkMat = getCachedColorMaterial('#CBD5E1', 0.2, 0.8);

  // ── 1. Chassis & Undercarriage ─────────────────────────────────────────
  const chassisGeo = new THREE.BoxGeometry(2.1, 0.16, 1.0);
  const chassis = new THREE.Mesh(chassisGeo, darkSteel);
  chassis.position.set(0, 0.32, 0);
  chassis.castShadow = true;
  truck.add(chassis);

  // Front & Rear Chrome Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 1.25), chromeMat);
  frontBumper.position.set(1.16, 0.34, 0);
  frontBumper.castShadow = true;

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 1.2), chromeMat);
  rearBumper.position.set(-1.08, 0.34, 0);
  rearBumper.castShadow = true;

  // Tail-lights on rear bumper
  const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.12), produceRed);
  tailL.position.set(-1.12, 0.34, -0.45);
  const tailR = tailL.clone();
  tailR.position.z = 0.45;
  truck.add(frontBumper, rearBumper, tailL, tailR);

  // ── 2. Vintage Red Cabin & Hood ────────────────────────────────────────
  // Main Engine Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 1.05), bodyRed);
  hood.position.set(0.72, 0.65, 0);
  hood.castShadow = true;

  // Main Cabin Body
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 1.08), cabDarkRed);
  cabin.position.set(0.05, 0.76, 0);
  cabin.castShadow = true;

  // Cream Roof Visor / Cap
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 1.14), roofCream);
  roof.position.set(0.06, 1.15, 0);
  roof.castShadow = true;

  // Curved Wheel Fenders (Front & Rear)
  const fenderGeo = new THREE.BoxGeometry(0.55, 0.18, 1.28);
  const frontFenders = new THREE.Mesh(fenderGeo, bodyRed);
  frontFenders.position.set(0.68, 0.46, 0);
  const rearFenders = new THREE.Mesh(fenderGeo, bodyRed);
  rearFenders.position.set(-0.62, 0.46, 0);
  truck.add(hood, cabin, roof, frontFenders, rearFenders);

  // ── 3. Front Grille, Headlights & Windshield ───────────────────────────
  // Chrome Radiator Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.65), chromeMat);
  grille.position.set(1.11, 0.62, 0);
  grille.castShadow = true;

  const grilleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.55), darkSteel);
  grilleMesh.position.set(1.13, 0.62, 0);
  truck.add(grille, grilleMesh);

  // Twin Ultra-Bright Glowing Headlights with Chrome Bezels
  const headlightLensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  const headlightLensMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const hlL = new THREE.Mesh(headlightLensGeo, headlightLensMat);
  hlL.position.set(1.11, 0.64, -0.42);
  hlL.rotation.z = Math.PI / 2;

  const hlR = new THREE.Mesh(headlightLensGeo, headlightLensMat);
  hlR.position.set(1.11, 0.64, 0.42);
  hlR.rotation.z = Math.PI / 2;

  // Luminous Lens Corona Sprites
  const hlCoronaMat = new THREE.SpriteMaterial({
    map: getLampHaloTexture(),
    color: 0xFFFBEB,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const coronaL = new THREE.Sprite(hlCoronaMat);
  coronaL.name = 'truck_headlight_beam';
  coronaL.scale.set(1.1, 1.1, 1.1);
  coronaL.position.set(1.18, 0.64, -0.42);

  const coronaR = new THREE.Sprite(hlCoronaMat);
  coronaR.name = 'truck_headlight_beam';
  coronaR.scale.set(1.1, 1.1, 1.1);
  coronaR.position.set(1.18, 0.64, 0.42);

  // Real Dynamic Forward Headlight PointLight
  const truckPointLight = new THREE.PointLight(0xFFFBEB, 4.5, 16.0, 1.1);
  truckPointLight.name = 'truck_point_light';
  truckPointLight.position.set(1.4, 0.65, 0);

  // High-Vibrancy Forward Road Illumination Beam Decal Plane (lies flat on road)
  const beamMat = new THREE.MeshBasicMaterial({
    map: getHeadlightGroundTexture(),
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const roadBeam = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 10.5), beamMat);
  roadBeam.name = 'truck_headlight_beam';
  roadBeam.rotation.x = -Math.PI / 2;
  roadBeam.rotation.z = -Math.PI / 2;
  roadBeam.position.set(5.2, 0.04, 0);

  // Amber turn signals
  const blinkerGeo = new THREE.BoxGeometry(0.04, 0.06, 0.1);
  const blkL = new THREE.Mesh(blinkerGeo, amberMat);
  blkL.position.set(1.1, 0.48, -0.48);
  const blkR = blkL.clone();
  blkR.position.z = 0.48;
  truck.add(hlL, hlR, coronaL, coronaR, truckPointLight, roadBeam, blkL, blkR);

  // Glass Windows (Front Windshield, Side Windows, Rear Window)
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.9), glassMat);
  windshield.position.set(0.43, 0.94, 0);
  windshield.rotation.z = -0.18;

  const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.04), glassMat);
  sideWinL.position.set(0.05, 0.95, -0.55);
  const sideWinR = sideWinL.clone();
  sideWinR.position.z = 0.55;

  const rearWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.65), glassMat);
  rearWin.position.set(-0.33, 0.96, 0);
  truck.add(windshield, sideWinL, sideWinR, rearWin);

  // Side Mirrors
  const mirrorStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6);
  const mStemL = new THREE.Mesh(mirrorStemGeo, chromeMat);
  mStemL.position.set(0.38, 0.88, -0.62);
  mStemL.rotation.x = -Math.PI / 3;

  const mGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.03), chromeMat);
  mGlassL.position.set(0.38, 0.94, -0.68);

  const mStemR = mStemL.clone();
  mStemR.position.z = 0.62;
  mStemR.rotation.x = Math.PI / 3;

  const mGlassR = mGlassL.clone();
  mGlassR.position.z = 0.68;
  truck.add(mStemL, mGlassL, mStemR, mGlassR);

  // Side Chrome Exhaust Pipe
  const exhaustGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.75, 8);
  const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaust.position.set(-0.34, 0.85, -0.58);
  exhaust.castShadow = true;
  truck.add(exhaust);

  // ── 4. Wooden Cargo Bed & Farm Produce ─────────────────────────────────
  // Dark wood floor
  const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 1.15), woodPlankMat);
  bedFloor.position.set(-0.55, 0.45, 0);
  bedFloor.castShadow = true;
  bedFloor.receiveShadow = true;
  truck.add(bedFloor);

  // Wooden Stake Side Rails
  const railSideGeo = new THREE.BoxGeometry(1.15, 0.32, 0.06);
  const railL = new THREE.Mesh(railSideGeo, woodRailMat);
  railL.position.set(-0.55, 0.65, -0.55);
  railL.castShadow = true;

  const railR = railL.clone();
  railR.position.z = 0.55;

  const railBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.05), woodRailMat);
  railBack.position.set(-1.1, 0.65, 0);
  railBack.castShadow = true;
  truck.add(railL, railR, railBack);

  // Farm Produce Cargo: 2 Crates with Apples & Wheat, Burlap Flour Sack, Milk Can
  const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.45), crateMat);
  crate1.position.set(-0.5, 0.62, -0.24);
  crate1.castShadow = true;

  const apple1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), produceRed);
  apple1.position.set(-0.5, 0.8, -0.24);
  const apple2 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), produceRed);
  apple2.position.set(-0.42, 0.79, -0.16);

  const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.42), crateMat);
  crate2.position.set(-0.5, 0.61, 0.26);
  crate2.castShadow = true;

  const wheat1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 6), produceGold);
  wheat1.position.set(-0.5, 0.78, 0.26);
  wheat1.rotation.z = 0.2;

  // Burlap Sack of Grain
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), sackMat);
  sack.position.set(-0.85, 0.64, 0.18);
  sack.scale.set(1.1, 0.9, 0.8);
  sack.castShadow = true;

  // Silver Milk Can
  const milkCan = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.36, 10), milkMat);
  milkCan.position.set(-0.85, 0.66, -0.28);
  milkCan.castShadow = true;

  truck.add(crate1, apple1, apple2, crate2, wheat1, sack, milkCan);

  // ── 5. Wheels with Tires, Rims, Hubcaps & Animation Tag ────────────────
  const tireGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 14);
  const rimGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.18, 10);
  const hubcapGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.20, 6);

  const wheelPositions = [
    [0.68, -0.62],  // Front Left
    [0.68, 0.62],   // Front Right
    [-0.62, -0.62], // Rear Left
    [-0.62, 0.62],  // Rear Right
  ];

  wheelPositions.forEach(([wx, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'truck_wheel';
    wheelGroup.position.set(wx, 0.24, wz);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;

    const rim = new THREE.Mesh(rimGeo, chromeMat);
    rim.rotation.x = Math.PI / 2;

    const cap = new THREE.Mesh(hubcapGeo, roofCream);
    cap.rotation.x = Math.PI / 2;

    wheelGroup.add(tire, rim, cap);
    truck.add(wheelGroup);
  });

  return truck;
}
