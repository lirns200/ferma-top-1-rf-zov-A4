import * as THREE from 'three';
import { VehicleModelId } from '../../../config/vehicles';
import { getCachedColorMaterial } from '../shared/materials';
import { createStylizedDeliveryTruck } from './DeliveryTruck';

/**
 * 1. Classic American Heavy-Duty Semi-Truck (Peterbilt / Kenworth Big-Rig)
 */
function createAmericanSemi(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_american_semi';

  const cabBlue = getCachedColorMaterial('#1E3A8A', 0.35, 0.2);
  const darkSteel = getCachedColorMaterial('#0F172A', 0.85);
  const chromeMat = getCachedColorMaterial('#E2E8F0', 0.15, 0.95);
  const glassMat = getCachedColorMaterial('#38BDF8', 0.1, 0.8);
  const tireMat = getCachedColorMaterial('#020617', 0.95);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const amberMat = getCachedColorMaterial('#F59E0B', 0.2, 0.8);
  const redMat = getCachedColorMaterial('#EF4444', 0.2, 0.8);

  // Heavy Chassis Frame (Longer for Semi-Truck)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.22, 1.15), darkSteel);
  chassis.position.set(-0.2, 0.36, 0);
  group.add(chassis);

  // Long Front Engine Hood / Bonnet
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.68, 1.05), cabBlue);
  hood.position.set(0.75, 0.82, 0);
  hood.castShadow = true;
  group.add(hood);

  // Massive Chrome Front Radiator Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, 0.85), chromeMat);
  grille.position.set(1.4, 0.82, 0);
  grille.castShadow = true;
  group.add(grille);

  // Heavy Chrome Front Bumper with Fog Lights
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.25, 1.35), chromeMat);
  frontBumper.position.set(1.42, 0.38, 0);
  frontBumper.castShadow = true;
  group.add(frontBumper);

  // Front Quad Chrome Headlight Pods
  [-0.45, 0.45].forEach(z => {
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.2), chromeMat);
    pod.position.set(1.36, 0.65, z);
    const hl1 = new THREE.Mesh(new THREE.CircleGeometry(0.08, 10), lightMat);
    hl1.rotation.y = Math.PI / 2;
    hl1.position.set(0.06, 0.05, 0);
    const hl2 = hl1.clone();
    hl2.position.y = -0.05;
    pod.add(hl1, hl2);
    group.add(pod);
  });

  // Tall Sleeper Cabin
  const sleeperCab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.05, 1.18), cabBlue);
  sleeperCab.position.set(-0.35, 1.02, 0);
  sleeperCab.castShadow = true;
  group.add(sleeperCab);

  // Chrome Sun Visor over Windshield
  const sunVisor = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 1.22), chromeMat);
  sunVisor.position.set(0.38, 1.52, 0);
  sunVisor.rotation.z = -0.3;
  group.add(sunVisor);

  // Split Windshield (Classic 2-piece)
  const windshieldL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.5), glassMat);
  windshieldL.position.set(0.36, 1.28, -0.28);
  const windshieldR = windshieldL.clone();
  windshieldR.position.z = 0.28;
  group.add(windshieldL, windshieldR);

  // Side Windows & Chrome Mirrors
  [-0.62, 0.62].forEach(z => {
    const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), chromeMat);
    mirrorArm.position.set(0.2, 1.25, z);
    mirrorArm.rotation.x = Math.PI / 2;
    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.1), chromeMat);
    mirrorHead.position.set(0.2, 1.25, z + (z > 0 ? 0.08 : -0.08));
    group.add(mirrorArm, mirrorHead);
  });

  // Twin Tall Chrome Vertical Exhaust Smokestacks
  [-0.62, 0.62].forEach(z => {
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.65, 12), chromeMat);
    stack.position.set(-0.32, 1.45, z);
    const curvedTop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12), chromeMat);
    curvedTop.position.set(-0.06, 0.88, 0);
    curvedTop.rotation.z = -0.55;
    stack.add(curvedTop);
    group.add(stack);
  });

  // Roof Chrome Air Horns & Amber Marker Lights
  [-0.25, 0.25].forEach(z => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.38, 8), chromeMat);
    horn.rotation.z = -Math.PI / 2;
    horn.position.set(0.05, 1.62, z);
    group.add(horn);
  });

  [-0.38, -0.18, 0, 0.18, 0.38].forEach(z => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), amberMat);
    marker.position.set(0.25, 1.58, z);
    group.add(marker);
  });

  // Cylindrical Chrome Fuel Tanks (Under Doors)
  [-0.62, 0.62].forEach(z => {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 14), chromeMat);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(0.45, 0.42, z);
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.18), darkSteel);
    step.position.set(0.45, 0.58, z + (z > 0 ? 0.12 : -0.12));
    group.add(tank, step);
  });

  // 5th Wheel Trailer Hitch Plate on Rear Deck
  const hitch = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 12), darkSteel);
  hitch.position.set(-1.25, 0.52, 0);
  group.add(hitch);

  // 6 Heavy Wheels (1 front axle + 2 rear drive axles)
  const wheelPositions = [
    [0.95, 0.34, 0.62],
    [0.95, 0.34, -0.62],
    [-0.95, 0.34, 0.62],
    [-0.95, 0.34, -0.62],
    [-1.45, 0.34, 0.62],
    [-1.45, 0.34, -0.62],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.24, 10), chromeMat);
    tire.add(rim);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

/**
 * 2. High-Performance Racing Supercar (Ferrari / Lambo Low-Slung GT)
 */
function createSuperSportscar(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_super_sportscar';

  const rossoRed = getCachedColorMaterial('#DC2626', 0.2, 0.3);
  const carbonMat = getCachedColorMaterial('#0F172A', 0.5, 0.85);
  const darkMat = getCachedColorMaterial('#020617', 0.9);
  const glassMat = getCachedColorMaterial('#0284C7', 0.1, 0.95);
  const chromeMat = getCachedColorMaterial('#F8FAFC', 0.1, 0.9);
  const brakeCaliper = getCachedColorMaterial('#EF4444', 0.3);
  const ledHeadlight = new THREE.MeshBasicMaterial({ color: 0xE0F2FE });
  const ledTail = new THREE.MeshBasicMaterial({ color: 0xFF0033 });
  const tireMat = getCachedColorMaterial('#090D16', 0.95);

  // Ultra-Low Aerodynamic Belly Pan
  const belly = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 1.1), darkMat);
  belly.position.set(0, 0.2, 0);
  group.add(belly);

  // Sleek Aerodynamic Body Shell
  const bodyMain = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.36, 1.15), rossoRed);
  bodyMain.position.set(0, 0.38, 0);
  bodyMain.castShadow = true;
  group.add(bodyMain);

  // Slanted Aggressive Nose / Hood
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 1.1), rossoRed);
  nose.position.set(0.85, 0.33, 0);
  nose.rotation.z = -0.15;
  nose.castShadow = true;
  group.add(nose);

  // Front Carbon Fiber Splitter
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 1.25), carbonMat);
  splitter.position.set(1.15, 0.18, 0);
  group.add(splitter);

  // Angular High-Tech LED Headlight Strips
  [-0.38, 0.38].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.18), ledHeadlight);
    hl.position.set(1.0, 0.42, z);
    hl.rotation.y = z > 0 ? -0.25 : 0.25;
    group.add(hl);
  });

  // Low-Profile Teardrop Cockpit / Tinted Glass Canopy
  const canopyGeo = new THREE.BoxGeometry(1.05, 0.34, 0.92);
  const canopy = new THREE.Mesh(canopyGeo, glassMat);
  canopy.position.set(-0.1, 0.65, 0);
  canopy.castShadow = true;
  group.add(canopy);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.86), carbonMat);
  roof.position.set(-0.1, 0.83, 0);
  group.add(roof);

  // Side Air Intake Scoops (Carbon inserts)
  [-0.58, 0.58].forEach(z => {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.05), carbonMat);
    scoop.position.set(-0.25, 0.42, z);
    group.add(scoop);
  });

  // High-Downforce GT Carbon Wing (Rear Spoiler)
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 1.28), carbonMat);
  wing.position.set(-1.08, 0.76, 0);
  const pylonL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.04), carbonMat);
  pylonL.position.set(-1.05, 0.62, -0.35);
  const pylonR = pylonL.clone();
  pylonR.position.z = 0.35;
  group.add(wing, pylonL, pylonR);

  // Rear Carbon Diffuser with Quad Exhaust Pipes
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 1.05), carbonMat);
  diffuser.position.set(-1.12, 0.26, 0);
  group.add(diffuser);

  [-0.22, -0.1, 0.1, 0.22].forEach(z => {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 8), chromeMat);
    tip.rotation.z = Math.PI / 2;
    tip.position.set(-1.18, 0.28, z);
    group.add(tip);
  });

  // Continuous Full-Width Rear LED Tail Light Bar
  const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.05), ledTail);
  tailLight.position.set(-1.14, 0.5, 0);
  group.add(tailLight);

  // 4 Low-Profile Racing Alloy Wheels with Visible Red Brake Calipers
  const wheelPositions = [
    [0.72, 0.24, 0.58],
    [0.72, 0.24, -0.58],
    [-0.72, 0.24, 0.58],
    [-0.72, 0.24, -0.58],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;

    // Multi-spoke alloy rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.19, 10), chromeMat);
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.05), brakeCaliper);
    caliper.position.set(0.08, 0.08, 0);
    tire.add(rim, caliper);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

/**
 * 3. Tesla Cybertruck (Angular Stainless Steel Titanium Armor)
 */
function createTeslaCybertruck(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_tesla_cybertruck';

  const steelMat = getCachedColorMaterial('#94A3B8', 0.2, 0.85);
  const darkSteel = getCachedColorMaterial('#334155', 0.4, 0.7);
  const cyberGlass = getCachedColorMaterial('#0F172A', 0.1, 0.95);
  const tireMat = getCachedColorMaterial('#020617', 0.95);
  const laserWhite = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });
  const laserRed = new THREE.MeshBasicMaterial({ color: 0xEF4444 });

  // Lower Geometric Body
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.48, 1.2), steelMat);
  lowerBody.position.set(0, 0.48, 0);
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Sharp Triangular Exoskeleton Roof Apex
  const peakGeo = new THREE.ConeGeometry(0.95, 0.72, 4);
  peakGeo.rotateY(Math.PI / 4);
  const peak = new THREE.Mesh(peakGeo, steelMat);
  peak.scale.set(1.45, 1.0, 0.98);
  peak.position.set(-0.12, 1.05, 0);
  peak.castShadow = true;
  group.add(peak);

  // Armor Glass Windows
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.42, 1.02), cyberGlass);
  glass.position.set(-0.06, 0.98, 0);
  group.add(glass);

  // Slanted Vault Tonneau Bed Cover
  const vaultCover = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 1.15), darkSteel);
  vaultCover.position.set(-0.72, 0.72, 0);
  group.add(vaultCover);

  // Full-Width Front Edge LED Light Bar (Signature Cybertruck Light)
  const frontLight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.18), laserWhite);
  frontLight.position.set(1.23, 0.68, 0);
  group.add(frontLight);

  // Full-Width Rear Red LED Blade Light
  const rearLight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.18), laserRed);
  rearLight.position.set(-1.23, 0.68, 0);
  group.add(rearLight);

  // 4 Low-Poly Aerodynamic Cyber Wheels
  const wheelPositions = [
    [0.78, 0.32, 0.64],
    [0.78, 0.32, -0.64],
    [-0.78, 0.32, 0.64],
    [-0.78, 0.32, -0.64],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 10), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const aeroCap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 6), darkSteel);
    tire.add(aeroCap);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

/**
 * 4. Tesla Semi (Futuristic Streamlined Electric Semi-Truck)
 */
function createTeslaSemi(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_tesla_semi';

  const pearlWhite = getCachedColorMaterial('#F8FAFC', 0.2, 0.3);
  const darkGlass = getCachedColorMaterial('#0F172A', 0.1, 0.95);
  const aeroMat = getCachedColorMaterial('#1E293B', 0.5, 0.7);
  const tireMat = getCachedColorMaterial('#020617', 0.95);
  const ledMatrix = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
  const ledTail = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
  const chromeAccent = getCachedColorMaterial('#CBD5E1', 0.2, 0.9);

  // Streamlined Low-Drag Chassis Base & Battery Floor
  const batteryFloor = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.22, 1.15), aeroMat);
  batteryFloor.position.set(-0.1, 0.32, 0);
  group.add(batteryFloor);

  // Bullet-Shaped Aerodynamic Cab
  const cabLower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.18), pearlWhite);
  cabLower.position.set(0.35, 0.85, 0);
  cabLower.castShadow = true;
  group.add(cabLower);

  // Slanted Aerodynamic Roof Deflector Fairing
  const roofAero = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.55, 1.15), pearlWhite);
  roofAero.position.set(0.25, 1.45, 0);
  roofAero.rotation.z = -0.15;
  roofAero.castShadow = true;
  group.add(roofAero);

  // Wraparound Panoramic Cockpit Glass
  const cockpitGlass = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.52, 1.12), darkGlass);
  cockpitGlass.position.set(0.48, 1.18, 0);
  cockpitGlass.rotation.z = -0.12;
  group.add(cockpitGlass);

  // Front Smooth Nose with Center Tesla Logo Badge
  const noseCurved = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 1.16, 16, 1, false, 0, Math.PI), pearlWhite);
  noseCurved.rotation.z = -Math.PI / 2;
  noseCurved.position.set(1.15, 0.85, 0);
  group.add(noseCurved);

  // Dual Matrix LED Headlight Bars
  [-0.42, 0.42].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.26), ledMatrix);
    hl.position.set(1.18, 0.62, z);
    group.add(hl);
  });

  // Attached Aerodynamic Semi-Trailer Cargo Box
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.25, 1.16), chromeAccent);
  trailer.position.set(-0.95, 1.1, 0);
  trailer.castShadow = true;
  group.add(trailer);

  // Rear Tail Lights on Trailer
  [-0.45, 0.45].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.08), ledTail);
    tl.position.set(-1.61, 0.95, z);
    group.add(tl);
  });

  // 6 Aerodynamic Wheels
  const wheelPositions = [
    [0.85, 0.32, 0.62],
    [0.85, 0.32, -0.62],
    [-0.65, 0.32, 0.62],
    [-0.65, 0.32, -0.62],
    [-1.15, 0.32, 0.62],
    [-1.15, 0.32, -0.62],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.23, 12), pearlWhite);
    tire.add(disc);
    wGroup.add(tire);
    group.add(wGroup);
  });

  return group;
}

/**
 * 5. Pure Golden Luxury Hypercar (Bugatti / Koenigsegg Golden Legend)
 */
function createGoldenHypercar(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'vehicle_golden_hypercar';

  const goldMirror = getCachedColorMaterial('#F59E0B', 0.1, 0.98);
  const goldTrim = getCachedColorMaterial('#FDE047', 0.05, 1.0);
  const obsidianCarbon = getCachedColorMaterial('#0F172A', 0.3, 0.9);
  const crystalGlass = getCachedColorMaterial('#E0F2FE', 0.05, 0.95);
  const diamondLed = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const rubyTail = new THREE.MeshBasicMaterial({ color: 0xE11D48 });
  const tireMat = getCachedColorMaterial('#090D16', 0.95);

  // Carbon Fiber Underbody Tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.1, 1.15), obsidianCarbon);
  tray.position.set(0, 0.2, 0);
  group.add(tray);

  // Polished Golden Hypercar Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.38, 1.18), goldMirror);
  body.position.set(0, 0.39, 0);
  body.castShadow = true;
  group.add(body);

  // Slanted Golden Front Bonnet
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.24, 1.12), goldMirror);
  hood.position.set(0.82, 0.34, 0);
  hood.rotation.z = -0.15;
  hood.castShadow = true;
  group.add(hood);

  // Iconic Horseshoe Front Grille in Gold Trim
  const grille = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 16, 1, false, 0, Math.PI), goldTrim);
  grille.rotation.z = -Math.PI / 2;
  grille.position.set(1.22, 0.35, 0);
  group.add(grille);

  // Sparkling Diamond Quad-LED Headlights
  [-0.38, 0.38].forEach(z => {
    const hl = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), diamondLed);
    hl.position.set(1.08, 0.44, z);
    group.add(hl);
  });

  // Low Teardrop Crystal Canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.35, 0.94), crystalGlass);
  canopy.position.set(-0.08, 0.68, 0);
  canopy.castShadow = true;
  group.add(canopy);

  // Active Carbon & Gold Rear Aero Wing
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 1.3), obsidianCarbon);
  wing.position.set(-1.12, 0.78, 0);
  const wingEndL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.04), goldTrim);
  wingEndL.position.set(-1.12, 0.78, -0.65);
  const wingEndR = wingEndL.clone();
  wingEndR.position.z = 0.65;
  const pylonL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.04), obsidianCarbon);
  pylonL.position.set(-1.08, 0.62, -0.35);
  const pylonR = pylonL.clone();
  pylonR.position.z = 0.35;
  group.add(wing, wingEndL, wingEndR, pylonL, pylonR);

  // Rear Ruby LED Light Strip
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 1.1), rubyTail);
  tail.position.set(-1.16, 0.52, 0);
  group.add(tail);

  // 4 Golden Chrome Forged Wheels with Diamond Hubs
  const wheelPositions = [
    [0.74, 0.25, 0.6],
    [0.74, 0.25, -0.6],
    [-0.74, 0.25, 0.6],
    [-0.74, 0.25, -0.6],
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wGroup = new THREE.Group();
    wGroup.name = 'truck_wheel';
    wGroup.position.set(x, y, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16), tireMat);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.21, 10), goldTrim);
    tire.add(rim);
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
    case 'american_semi':
      return createAmericanSemi();
    case 'super_sportscar':
      return createSuperSportscar();
    case 'tesla_cybertruck':
      return createTeslaCybertruck();
    case 'tesla_semi':
      return createTeslaSemi();
    case 'golden_hypercar':
      return createGoldenHypercar();
    case 'classic_pickup':
    default:
      return createStylizedDeliveryTruck();
  }
}
