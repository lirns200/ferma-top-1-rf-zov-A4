import * as THREE from 'three';
import { VehicleModelId } from '../../../config/vehicles';
import { getCachedColorMaterial } from '../shared/materials';
import { createStylizedDeliveryTruck } from './DeliveryTruck';

/**
 * Creates a rugged Off-Road 4x4 Farm SUV
 */
function createOffroad4x4(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_offroad_4x4';

  const bodyMat = getCachedColorMaterial('#15803D', 0.4, 0.1);
  const darkMat = getCachedColorMaterial('#1E293B', 0.8, 0.2);
  const metalMat = getCachedColorMaterial('#475569', 0.5, 0.6);
  const glassMat = getCachedColorMaterial('#7DD3FC', 0.1, 0.7);
  const tireMat = getCachedColorMaterial('#0F172A', 0.95);
  const rimMat = getCachedColorMaterial('#94A3B8', 0.2, 0.8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFBEB });
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
  const redMat = getCachedColorMaterial('#DC2626', 0.3);
  const orangeMat = getCachedColorMaterial('#D97706', 0.8);

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.2, 1.1), darkMat);
  chassis.position.set(0, 0.38, 0);
  group.add(chassis);

  // Body Main
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 1.15), bodyMat);
  body.position.set(0, 0.75, 0);
  body.castShadow = true;
  group.add(body);

  // Cabin / Roof
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.55, 1.1), bodyMat);
  cabin.position.set(-0.25, 1.2, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Windows
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 1.02), glassMat);
  windshield.position.set(0.36, 1.2, 0);
  windshield.rotation.z = -0.22;
  group.add(windshield);

  const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 1.12), glassMat);
  sideGlass.position.set(-0.25, 1.2, 0);
  group.add(sideGlass);

  // Heavy Front Bull-bar
  const bullBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 1.18), darkMat);
  bullBar.position.set(1.15, 0.55, 0);
  group.add(bullBar);

  // Roof Rack with Spotlights & Spare Tire
  const rack = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 1.05), metalMat);
  rack.position.set(-0.25, 1.52, 0);
  group.add(rack);

  // 4 Roof Spotlights
  [-0.35, -0.12, 0.12, 0.35].forEach(z => {
    const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), darkMat);
    spot.position.set(0.28, 1.58, z);
    spot.rotation.z = Math.PI / 2;
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.065, 8), spotMat);
    lens.position.set(0.045, 0, 0);
    lens.rotation.y = Math.PI / 2;
    spot.add(lens);
    group.add(spot);
  });

  // Spare Tire on Roof Rack
  const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12), tireMat);
  spareTire.position.set(-0.45, 1.62, 0);
  spareTire.rotation.x = Math.PI / 2;
  const spareRim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.19, 8), rimMat);
  spareTire.add(spareRim);
  group.add(spareTire);

  // Front Headlights
  [-0.42, 0.42].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.22), lightMat);
    hl.position.set(1.08, 0.72, z);
    group.add(hl);
  });

  // Rear Tail Lights
  [-0.45, 0.45].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.12), redMat);
    tl.position.set(-1.08, 0.72, z);
    group.add(tl);
  });

  // 4 Chunky Off-Road Wheels
  const wheelPositions = [
    [0.72, 0.34, 0.65],
    [0.72, 0.34, -0.65],
    [-0.72, 0.34, 0.65],
    [-0.72, 0.34, -0.65],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'truck_wheel';
    wheelGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8), rimMat);
    tire.add(rim);
    wheelGroup.add(tire);
    group.add(wheelGroup);
  });

  return group;
}

/**
 * Creates a Retro Vintage 2-Tone Farm Delivery Van
 */
function createRetroVan(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_retro_van';

  const bodyTurquoise = getCachedColorMaterial('#0284C7', 0.3, 0.1);
  const bodyCream = getCachedColorMaterial('#FFFBEB', 0.3);
  const darkMat = getCachedColorMaterial('#1E293B', 0.85);
  const glassMat = getCachedColorMaterial('#7DD3FC', 0.1, 0.7);
  const chromeMat = getCachedColorMaterial('#E2E8F0', 0.2, 0.85);
  const tireMat = getCachedColorMaterial('#0F172A', 0.95);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const redMat = getCachedColorMaterial('#DC2626', 0.3);
  const woodMat = getCachedColorMaterial('#B45309', 0.7);

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.05), darkMat);
  chassis.position.set(0, 0.28, 0);
  group.add(chassis);

  // Lower Body (Turquoise)
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.1), bodyTurquoise);
  lowerBody.position.set(0, 0.60, 0);
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Upper Body (Cream)
  const upperBody = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.60, 1.08), bodyCream);
  upperBody.position.set(-0.02, 1.15, 0);
  upperBody.castShadow = true;
  group.add(upperBody);

  // Rounded Front Nose
  const frontNose = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.08, 12, 1, false, 0, Math.PI), bodyTurquoise);
  frontNose.rotation.z = -Math.PI / 2;
  frontNose.position.set(1.08, 0.60, 0);
  group.add(frontNose);

  // Panoramic Curved Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 1.0), glassMat);
  windshield.position.set(1.05, 1.15, 0);
  windshield.rotation.z = -0.15;
  group.add(windshield);

  // Side Windows
  const sideWindows = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.36, 1.1), glassMat);
  sideWindows.position.set(-0.15, 1.18, 0);
  group.add(sideWindows);

  // Chrome Bumpers
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 1.25), chromeMat);
  frontBumper.position.set(1.18, 0.34, 0);
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 1.2), chromeMat);
  rearBumper.position.set(-1.14, 0.34, 0);
  group.add(frontBumper, rearBumper);

  // Vintage Big Round Headlights
  [-0.38, 0.38].forEach(z => {
    const hlBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), chromeMat);
    hlBezel.rotation.z = Math.PI / 2;
    hlBezel.position.set(1.12, 0.65, z);
    const hlLens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 10), lightMat);
    hlLens.rotation.y = Math.PI / 2;
    hlLens.position.set(0.045, 0, 0);
    hlBezel.add(hlLens);
    group.add(hlBezel);
  });

  // Roof Luggage Rack with Wooden Slats
  const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.95), chromeMat);
  roofRack.position.set(-0.1, 1.50, 0);
  const woodSlat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.85), woodMat);
  woodSlat.position.set(-0.1, 1.53, 0);
  group.add(roofRack, woodSlat);

  // Tail lights
  [-0.42, 0.42].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.1), redMat);
    tl.position.set(-1.12, 0.65, z);
    group.add(tl);
  });

  // 4 Wheels with Big Chrome Hubcaps & Whitewall Tiers
  const wheelPositions = [
    [0.72, 0.28, 0.58],
    [0.72, 0.28, -0.58],
    [-0.72, 0.28, 0.58],
    [-0.72, 0.28, -0.58],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = 'truck_wheel';
    wheelGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 14), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const whitewall = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.19, 12), bodyCream);
    const hubcap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), chromeMat);
    hubcap.scale.set(1, 0.4, 1);
    hubcap.position.y = 0.06 * Math.sign(z);
    tire.add(whitewall, hubcap);
    wheelGroup.add(tire);
    group.add(wheelGroup);
  });

  return group;
}

/**
 * Creates an Authentic Agricultural Farm Tractor
 */
function createFarmTractor(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_farm_tractor';

  const tractorGreen = getCachedColorMaterial('#15803D', 0.4, 0.1);
  const tractorYellow = getCachedColorMaterial('#EAB308', 0.3, 0.2);
  const darkMat = getCachedColorMaterial('#1E293B', 0.9);
  const metalMat = getCachedColorMaterial('#64748B', 0.3, 0.7);
  const tireMat = getCachedColorMaterial('#0F172A', 0.95);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFBEB });

  // Tractor Engine Hood & Body
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.55, 0.75), tractorGreen);
  hood.position.set(0.35, 0.75, 0);
  hood.castShadow = true;
  group.add(hood);

  // Front Yellow Radiator Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.68), tractorYellow);
  grille.position.set(0.98, 0.73, 0);
  group.add(grille);

  // Twin Front Headlights
  [-0.26, 0.26].forEach(z => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 8), lightMat);
    hl.rotation.z = Math.PI / 2;
    hl.position.set(1.0, 0.85, z);
    group.add(hl);
  });

  // Vertical Exhaust Smokestack Pipe
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.95, 8), darkMat);
  pipe.position.set(0.65, 1.35, 0.25);
  const pipeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.15, 8), darkMat);
  pipeCap.position.set(0.65, 1.85, 0.25);
  group.add(pipe, pipeCap);

  // Driver Platform, Rear Fenders, Seat & Steering Wheel
  const platform = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.85), darkMat);
  platform.position.set(-0.55, 0.45, 0);
  group.add(platform);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.45), tractorYellow);
  seat.position.set(-0.65, 0.85, 0);
  group.add(seat);

  const steeringCol = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), darkMat);
  steeringCol.position.set(-0.32, 0.95, 0);
  steeringCol.rotation.z = -0.4;
  const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 12), darkMat);
  steeringWheel.position.set(-0.4, 1.12, 0);
  steeringWheel.rotation.y = Math.PI / 2;
  group.add(steeringCol, steeringWheel);

  // Big Curved Rear Mudguards / Fenders (Yellow)
  [-0.58, 0.58].forEach(z => {
    const fender = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.25), tractorGreen);
    fender.position.set(-0.55, 0.88, z);
    group.add(fender);
  });

  // 2 Giant Rear Tractor Tires with Deep Cleats (Yellow Rims)
  [-0.62, 0.62].forEach(z => {
    const rWheel = new THREE.Group();
    rWheel.name = 'truck_wheel';
    rWheel.position.set(-0.55, 0.58, z);
    const rTire = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.32, 16), tireMat);
    rTire.rotation.x = Math.PI / 2;
    rTire.castShadow = true;
    const rRim = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.34, 12), tractorYellow);
    rTire.add(rRim);
    rWheel.add(rTire);
    group.add(rWheel);
  });

  // 2 Smaller Front Wheels
  [-0.45, 0.45].forEach(z => {
    const fWheel = new THREE.Group();
    fWheel.name = 'truck_wheel';
    fWheel.position.set(0.68, 0.30, z);
    const fTire = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.18, 12), tireMat);
    fTire.rotation.x = Math.PI / 2;
    fTire.castShadow = true;
    const fRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.19, 8), tractorYellow);
    fTire.add(fRim);
    fWheel.add(fTire);
    group.add(fWheel);
  });

  return group;
}

/**
 * Creates an Angular Futuristic Cyber Truck
 */
function createCyberTruck(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_cyber_truck';

  const titaniumMat = getCachedColorMaterial('#94A3B8', 0.25, 0.85);
  const darkTitaniumMat = getCachedColorMaterial('#334155', 0.35, 0.75);
  const cyberGlassMat = getCachedColorMaterial('#0F172A', 0.1, 0.9);
  const tireMat = getCachedColorMaterial('#020617', 0.95);
  const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x06B6D4 });
  const neonRedMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });

  // Angular Wedge Body (Lower)
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.18), titaniumMat);
  lowerBody.position.set(0, 0.45, 0);
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Angular Peak Cabin
  const cabinGeo = new THREE.ConeGeometry(0.85, 0.75, 4);
  cabinGeo.rotateY(Math.PI / 4);
  const cabin = new THREE.Mesh(cabinGeo, darkTitaniumMat);
  cabin.scale.set(1.4, 1.0, 0.95);
  cabin.position.set(-0.1, 1.0, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Dark Cyber Glass Canopy
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.42, 0.95), cyberGlassMat);
  glass.position.set(-0.05, 0.95, 0);
  group.add(glass);

  // Full-Width Front Neon Cyan Light Strip
  const frontLightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.15), neonCyanMat);
  frontLightStrip.position.set(1.21, 0.62, 0);
  group.add(frontLightStrip);

  // Full-Width Rear Neon Red Light Strip
  const rearLightStrip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.15), neonRedMat);
  rearLightStrip.position.set(-1.21, 0.62, 0);
  group.add(rearRedMat(group, neonRedMat));

  // Angular Cyber Bed Cover
  const bedCover = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 1.12), titaniumMat);
  bedCover.position.set(-0.7, 0.68, 0);
  group.add(bedCover);

  // 4 Low-Poly Aerodynamic Wheels
  const wheelPositions = [
    [0.78, 0.32, 0.62],
    [0.78, 0.32, -0.62],
    [-0.78, 0.32, 0.62],
    [-0.78, 0.32, -0.62],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const aeroDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.23, 6), titaniumMat);
    tire.add(aeroDisc);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

function rearRedMat(group: THREE.Group, mat: THREE.Material): THREE.Object3D {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.15), mat);
  mesh.position.set(-1.21, 0.62, 0);
  return mesh;
}

/**
 * Creates a Luxurious Pure Golden Tycoon Truck
 */
function createGoldenTruck(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_golden_truck';

  const goldBody = getCachedColorMaterial('#F59E0B', 0.15, 0.95);
  const goldTrim = getCachedColorMaterial('#FDE047', 0.1, 0.98);
  const obsidianMat = getCachedColorMaterial('#0F172A', 0.2, 0.9);
  const crystalGlass = getCachedColorMaterial('#E0F2FE', 0.05, 0.9);
  const diamondMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const rubyMat = getCachedColorMaterial('#E11D48', 0.1, 0.9);
  const goldCoinMat = getCachedColorMaterial('#FACC15', 0.2, 0.9);

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 1.05), obsidianMat);
  chassis.position.set(0, 0.32, 0);
  group.add(chassis);

  // Gold Body & Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.54, 1.08), goldBody);
  hood.position.set(0.72, 0.67, 0);
  hood.castShadow = true;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.74, 1.12), goldBody);
  cabin.position.set(0.05, 0.78, 0);
  cabin.castShadow = true;

  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.1, 1.18), goldTrim);
  roof.position.set(0.06, 1.18, 0);
  roof.castShadow = true;

  const cargoBed = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 1.08), goldBody);
  cargoBed.position.set(-0.62, 0.62, 0);
  cargoBed.castShadow = true;
  group.add(hood, cabin, roof, cargoBed);

  // Crystal Glass Windows
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.98), crystalGlass);
  windshield.position.set(0.46, 0.88, 0);
  windshield.rotation.z = -0.18;
  group.add(windshield);

  // Royal Golden Front Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.72), goldTrim);
  grille.position.set(1.14, 0.65, 0);
  group.add(grille);

  // Diamond Crystal Headlights
  [-0.42, 0.42].forEach(z => {
    const hl = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), diamondMat);
    hl.position.set(1.15, 0.68, z);
    group.add(hl);
  });

  // Ruby Tail Lights
  [-0.45, 0.45].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.15), rubyMat);
    tl.position.set(-1.16, 0.65, z);
    group.add(tl);
  });

  // Chest Overflowing with Gold Coins in the Cargo Bed
  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.75), obsidianMat);
  chest.position.set(-0.62, 0.72, 0);
  const goldPile = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), goldCoinMat);
  goldPile.scale.set(1, 0.55, 1.1);
  goldPile.position.set(-0.62, 0.88, 0);
  group.add(chest, goldPile);

  // 4 Golden Chrome Wheels
  const wheelPositions = [
    [0.72, 0.32, 0.62],
    [0.72, 0.32, -0.62],
    [-0.72, 0.32, 0.62],
    [-0.72, 0.32, -0.62],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14), obsidianMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const goldRim = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.24, 8), goldTrim);
    tire.add(goldRim);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

/**
 * Universal Vehicle Model Factory
 */
export function createVehicleModel(modelId: VehicleModelId = 'classic_pickup'): THREE.Group {
  switch (modelId) {
    case 'offroad_4x4':
      return createOffroad4x4();
    case 'retro_van':
      return createRetroVan();
    case 'farm_tractor':
      return createFarmTractor();
    case 'cyber_truck':
      return createCyberTruck();
    case 'golden_truck':
      return createGoldenTruck();
    case 'classic_pickup':
    default:
      return createStylizedDeliveryTruck();
  }
}
