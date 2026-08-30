import * as THREE from 'three';
import { SeasonType } from '../types';
import { SEASONS_INFO } from '../config/events';

// Caching materials and geometries for smooth 60 FPS rendering
const materialCache = new Map<string, THREE.Material>();
const geometryCache = new Map<string, THREE.BufferGeometry>();

export function getCachedColorMaterial(
  color: string,
  roughness = 0.55,
  metalness = 0.1,
  transparent = false,
  opacity = 1.0
): THREE.MeshStandardMaterial {
  const key = `mat_${color}_${roughness}_${metalness}_${transparent}_${opacity}`;
  if (!materialCache.has(key)) {
    materialCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness,
        metalness,
        transparent,
        opacity,
        flatShading: true,
      })
    );
  }
  return materialCache.get(key) as THREE.MeshStandardMaterial;
}

let softLightTexture: THREE.CanvasTexture | null = null;
function getSoftLightPoolTexture(): THREE.CanvasTexture {
  if (!softLightTexture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255, 255, 220, 1.0)');
      grad.addColorStop(0.20, 'rgba(254, 240, 138, 0.90)');
      grad.addColorStop(0.48, 'rgba(245, 158, 11, 0.55)');
      grad.addColorStop(0.75, 'rgba(217, 119, 6, 0.20)');
      grad.addColorStop(1.0, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    softLightTexture = new THREE.CanvasTexture(canvas);
  }
  return softLightTexture!;
}

let headlightGroundTexture: THREE.CanvasTexture | null = null;
function getHeadlightGroundTexture(): THREE.CanvasTexture {
  if (!headlightGroundTexture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);

      // Left high-beam hotspot
      const gradL = ctx.createRadialGradient(210, 440, 15, 160, 150, 280);
      gradL.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradL.addColorStop(0.28, 'rgba(254, 240, 138, 0.90)');
      gradL.addColorStop(0.60, 'rgba(245, 158, 11, 0.40)');
      gradL.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gradL;
      ctx.beginPath();
      ctx.moveTo(215, 480);
      ctx.lineTo(60, 40);
      ctx.lineTo(260, 40);
      ctx.closePath();
      ctx.fill();

      // Right high-beam hotspot
      const gradR = ctx.createRadialGradient(302, 440, 15, 352, 150, 280);
      gradR.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradR.addColorStop(0.28, 'rgba(254, 240, 138, 0.90)');
      gradR.addColorStop(0.60, 'rgba(245, 158, 11, 0.40)');
      gradR.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gradR;
      ctx.beginPath();
      ctx.moveTo(297, 480);
      ctx.lineTo(252, 40);
      ctx.lineTo(452, 40);
      ctx.closePath();
      ctx.fill();

      // Overall forward wide glow
      const wideGrad = ctx.createRadialGradient(256, 380, 25, 256, 180, 300);
      wideGrad.addColorStop(0, 'rgba(255, 255, 230, 0.65)');
      wideGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.35)');
      wideGrad.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = wideGrad;
      ctx.beginPath();
      ctx.ellipse(256, 220, 230, 240, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    headlightGroundTexture = new THREE.CanvasTexture(canvas);
  }
  return headlightGroundTexture!;
}

let lampHaloTexture: THREE.CanvasTexture | null = null;
function getLampHaloTexture(): THREE.CanvasTexture {
  if (!lampHaloTexture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.25, 'rgba(254, 240, 138, 0.85)');
      grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
      grad.addColorStop(1.0, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    lampHaloTexture = new THREE.CanvasTexture(canvas);
  }
  return lampHaloTexture!;
}

// -------------------------------------------------------------
// GABLE SHAPE HELPERS (Exact roofs without poking corners)
// -------------------------------------------------------------

function createTriangularGable(width: number, height: number, depth: number, material: THREE.Material): THREE.Mesh {
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

function createGambrelGable(width: number, lowerH: number, totalH: number, depth: number, material: THREE.Material): THREE.Mesh {
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

// -------------------------------------------------------------
// 1. SPECIAL & CORE BUILDINGS
// -------------------------------------------------------------

/**
 * Detailed 2-story Country Farmhouse with porch, chimney smoke, flower boxes, and clean roof
 */
export function createFarmhouseGroup(season: SeasonType): THREE.Group {
  const group = new THREE.Group();

  // Stone Foundation
  const baseGeo = new THREE.BoxGeometry(2.8, 0.35, 2.8);
  const baseMat = getCachedColorMaterial('#475569', 0.85);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.175;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main House Body (Rich warm red timber siding)
  const wallGeo = new THREE.BoxGeometry(2.4, 1.6, 2.4);
  const wallMat = getCachedColorMaterial('#DC2626', 0.65);
  const walls = new THREE.Mesh(wallGeo, wallMat);
  walls.position.y = 1.15;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // White Corner Trim Boards
  const trimGeo = new THREE.BoxGeometry(0.1, 1.62, 0.1);
  const trimMat = getCachedColorMaterial('#F8FAFC', 0.5);
  [
    [-1.19, -1.19], [1.19, -1.19], [-1.19, 1.19], [1.19, 1.19]
  ].forEach(([tx, tz]) => {
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(tx, 1.15, tz);
    group.add(trim);
  });

  // True Triangular Gable End Walls (Front & Back) - perfectly flush, zero corner protrusion
  const gFront = createTriangularGable(2.36, 1.15, 0.08, wallMat);
  gFront.position.set(0, 1.95 + 1.15 / 2, 1.16);
  const gBack = createTriangularGable(2.36, 1.15, 0.08, wallMat);
  gBack.position.set(0, 1.95 + 1.15 / 2, -1.16);
  group.add(gFront, gBack);

  // Pitched Roof Structure (Pitched Shingle Panels with clean Overhangs)
  const roofColor = season === 'winter' ? '#F1F5F9' : '#5C240E';
  const roofMat = getCachedColorMaterial(roofColor, 0.7);

  // Left & Right Pitched Roof Panels
  const roofSlopeGeo = new THREE.BoxGeometry(1.72, 0.12, 2.72);
  const slopeAngle = Math.atan2(1.15, 1.18);

  const rLeft = new THREE.Mesh(roofSlopeGeo, roofMat);
  rLeft.position.set(-0.62, 2.55, 0);
  rLeft.rotation.z = slopeAngle;
  rLeft.castShadow = true;

  const rRight = new THREE.Mesh(roofSlopeGeo, roofMat);
  rRight.position.set(0.62, 2.55, 0);
  rRight.rotation.z = -slopeAngle;
  rRight.castShadow = true;

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 2.76), getCachedColorMaterial('#451A03', 0.8));
  ridge.position.set(0, 3.16, 0);
  ridge.castShadow = true;

  group.add(rLeft, rRight, ridge);

  // Front Porch Structure
  const porchDeckGeo = new THREE.BoxGeometry(2.1, 0.15, 0.95);
  const porchDeckMat = getCachedColorMaterial('#9A3412', 0.8);
  const porchDeck = new THREE.Mesh(porchDeckGeo, porchDeckMat);
  porchDeck.position.set(0, 0.35, 1.55);
  porchDeck.castShadow = true;
  group.add(porchDeck);

  // Porch Roof & Columns
  const porchRoofGeo = new THREE.BoxGeometry(2.1, 0.08, 0.95);
  const porchRoof = new THREE.Mesh(porchRoofGeo, roofMat);
  porchRoof.position.set(0, 1.75, 1.55);
  porchRoof.castShadow = true;
  group.add(porchRoof);

  const colGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.35, 6);
  const colMat = getCachedColorMaterial('#F8FAFC', 0.4);
  [-0.9, 0.9].forEach(cx => {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(cx, 1.05, 1.9);
    col.castShadow = true;
    group.add(col);
  });

  // Front Door with brass knob
  const doorGeo = new THREE.BoxGeometry(0.65, 1.15, 0.08);
  const doorMat = getCachedColorMaterial('#FEF08A', 0.5);
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 0.95, 1.22);
  const knobGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const knobMat = getCachedColorMaterial('#F59E0B', 0.2, 0.8);
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(0.22, 0.95, 1.28);
  group.add(door, knob);

  // Windows with white frame & glass
  const winFrameGeo = new THREE.BoxGeometry(0.58, 0.68, 0.06);
  const winFrameMat = getCachedColorMaterial('#FFFFFF', 0.4);
  const winGlassGeo = new THREE.BoxGeometry(0.48, 0.58, 0.08);
  const winGlassMat = getCachedColorMaterial('#7DD3FC', 0.1, 0.6);

  [
    [-0.75, 1.2, 1.22], [0.75, 1.2, 1.22]
  ].forEach(([wx, wy, wz]) => {
    const wFrame = new THREE.Mesh(winFrameGeo, winFrameMat);
    wFrame.position.set(wx, wy, wz);
    const wGlass = new THREE.Mesh(winGlassGeo, winGlassMat.clone());
    wGlass.name = 'window_glow';
    wGlass.position.set(wx, wy, wz);
    group.add(wFrame, wGlass);

    // Flower box under window
    const boxGeo = new THREE.BoxGeometry(0.62, 0.14, 0.18);
    const boxMat = getCachedColorMaterial('#78350F', 0.8);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(wx, wy - 0.38, wz + 0.08);
    
    const flowerGeo = new THREE.SphereGeometry(0.07, 6, 6);
    const flw1 = new THREE.Mesh(flowerGeo, getCachedColorMaterial('#EF4444', 0.4));
    flw1.position.set(wx - 0.18, wy - 0.28, wz + 0.08);
    const flw2 = new THREE.Mesh(flowerGeo, getCachedColorMaterial('#FBBF24', 0.4));
    flw2.position.set(wx, wy - 0.28, wz + 0.08);
    const flw3 = new THREE.Mesh(flowerGeo, getCachedColorMaterial('#EC4899', 0.4));
    flw3.position.set(wx + 0.18, wy - 0.28, wz + 0.08);

    group.add(box, flw1, flw2, flw3);
  });

  // Attic round window on front gable
  const atticWinMat = winGlassMat.clone();
  const atticWin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), atticWinMat);
  atticWin.name = 'window_glow';
  atticWin.rotation.x = Math.PI / 2;
  atticWin.position.set(0, 2.45, 1.22);
  const atticTrim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 8, 16), getCachedColorMaterial('#FFFFFF', 0.4));
  atticTrim.position.set(0, 2.45, 1.22);
  group.add(atticWin, atticTrim);

  // Porch Cozy Hanging Lantern
  const pLanternGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.18, 6);
  const pLanternMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: new THREE.Color(0xF59E0B),
    emissiveIntensity: 0.1,
    roughness: 0.2,
  });
  const pLantern = new THREE.Mesh(pLanternGeo, pLanternMat);
  pLantern.name = 'lantern_glow';
  pLantern.position.set(0.65, 1.45, 1.9);
  group.add(pLantern);

  // Cobblestone Chimney with puffing smoke
  const chimGeo = new THREE.BoxGeometry(0.48, 1.8, 0.48);
  const chimMat = getCachedColorMaterial('#64748B', 0.9);
  const chim = new THREE.Mesh(chimGeo, chimMat);
  chim.position.set(0.72, 2.8, -0.55);
  chim.castShadow = true;
  group.add(chim);

  // Stylized smoke puffs
  const smokeMat = getCachedColorMaterial('#F1F5F9', 0.4, 0.0, true, 0.7);
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), smokeMat);
  s1.position.set(0.72, 3.85, -0.55);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), smokeMat);
  s2.position.set(0.8, 4.18, -0.5);
  const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), smokeMat);
  s3.position.set(0.92, 4.55, -0.45);
  group.add(s1, s2, s3);

  return group;
}

/**
 * Classic Red Barn with authentic Dutch Gambrel roof, X-braced sliding doors, hayloft, and weather vane
 */
export function createBarnGroup(season: SeasonType): THREE.Group {
  const group = new THREE.Group();

  // Stone Foundation
  const baseGeo = new THREE.BoxGeometry(2.8, 0.3, 2.8);
  const baseMat = getCachedColorMaterial('#475569', 0.8);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main Barn Body (Classic Red Barn Siding)
  const bodyGeo = new THREE.BoxGeometry(2.46, 1.6, 2.46);
  const bodyMat = getCachedColorMaterial('#B91C1C', 0.65);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.1;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // White Corner Trim
  const trimGeo = new THREE.BoxGeometry(0.1, 1.62, 0.1);
  const trimMat = getCachedColorMaterial('#FFFFFF', 0.4);
  [
    [-1.22, -1.22], [1.22, -1.22], [-1.22, 1.22], [1.22, 1.22]
  ].forEach(([tx, tz]) => {
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(tx, 1.1, tz);
    group.add(trim);
  });

  // True 5-sided Gambrel Gable Walls (Front & Back) - 100% inside roof slopes, zero protruding ears
  const gFront = createGambrelGable(2.42, 0.58, 1.16, 0.08, bodyMat);
  gFront.position.set(0, 1.9 + 1.16 / 2, 1.21);
  const gBack = createGambrelGable(2.42, 0.58, 1.16, 0.08, bodyMat);
  gBack.position.set(0, 1.9 + 1.16 / 2, -1.21);
  group.add(gFront, gBack);

  // Authentic 2-Tier Gambrel Barn Roof Panels
  const roofColor = season === 'winter' ? '#F1F5F9' : '#3B1808';
  const roofMat = getCachedColorMaterial(roofColor, 0.7);

  // Lower Gambrel Slopes (Steeper)
  const lowerSlopeGeo = new THREE.BoxGeometry(0.82, 0.12, 2.76);
  const lowerAngle = Math.atan2(0.58, 0.34);

  const rLowerL = new THREE.Mesh(lowerSlopeGeo, roofMat);
  rLowerL.position.set(-0.98, 2.22, 0);
  rLowerL.rotation.z = lowerAngle;
  rLowerL.castShadow = true;

  const rLowerR = new THREE.Mesh(lowerSlopeGeo, roofMat);
  rLowerR.position.set(0.98, 2.22, 0);
  rLowerR.rotation.z = -lowerAngle;
  rLowerR.castShadow = true;

  // Upper Gambrel Slopes (Shallower)
  const upperSlopeGeo = new THREE.BoxGeometry(1.06, 0.12, 2.76);
  const upperAngle = Math.atan2(0.58, 0.88);

  const rUpperL = new THREE.Mesh(upperSlopeGeo, roofMat);
  rUpperL.position.set(-0.45, 2.80, 0);
  rUpperL.rotation.z = upperAngle;
  rUpperL.castShadow = true;

  const rUpperR = new THREE.Mesh(upperSlopeGeo, roofMat);
  rUpperR.position.set(0.45, 2.80, 0);
  rUpperR.rotation.z = -upperAngle;
  rUpperR.castShadow = true;

  // Central Roof Ridge Cap
  const ridgeBeam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 2.78), getCachedColorMaterial('#271005', 0.8));
  ridgeBeam.position.set(0, 3.12, 0);
  ridgeBeam.castShadow = true;

  group.add(rLowerL, rLowerR, rUpperL, rUpperR, ridgeBeam);

  // White Sliding Barn Doors with Red X-brace
  const doorPanelGeo = new THREE.BoxGeometry(1.3, 1.4, 0.08);
  const doorMat = getCachedColorMaterial('#F8FAFC', 0.5);
  const door = new THREE.Mesh(doorPanelGeo, doorMat);
  door.position.set(0, 0.85, 1.25);
  door.castShadow = true;
  group.add(door);

  // Red X-brace diagonal bars
  const braceMat = getCachedColorMaterial('#DC2626', 0.6);
  const diag1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.06), braceMat);
  diag1.position.set(0, 0.85, 1.3);
  diag1.rotation.z = Math.PI / 4;
  const diag2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.06), braceMat);
  diag2.position.set(0, 0.85, 1.3);
  diag2.rotation.z = -Math.PI / 4;
  group.add(diag1, diag2);

  // Hayloft window & Hoist Beam with rope
  const hayWinGeo = new THREE.BoxGeometry(0.7, 0.55, 0.08);
  const hayWinMat = new THREE.MeshStandardMaterial({ color: 0x7DD3FC, roughness: 0.2, metalness: 0.1 });
  const hayWin = new THREE.Mesh(hayWinGeo, hayWinMat);
  hayWin.name = 'window_glow';
  hayWin.position.set(0, 2.35, 1.26);
  const hayWinFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.65, 0.06), getCachedColorMaterial('#F8FAFC', 0.5));
  hayWinFrame.position.set(0, 2.35, 1.24);
  group.add(hayWinFrame, hayWin);

  // Barn Door Wall Sconce Lanterns
  [-0.85, 0.85].forEach(lx => {
    const bLantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.05, 0.16, 6),
      new THREE.MeshStandardMaterial({ color: 0xFEF08A, emissive: new THREE.Color(0xF59E0B), emissiveIntensity: 0.1, roughness: 0.2 })
    );
    bLantern.name = 'lantern_glow';
    bLantern.position.set(lx, 1.55, 1.32);
    group.add(bLantern);
  });
  group.add(hayWinFrame, hayWin);

  const beamGeo = new THREE.BoxGeometry(0.12, 0.12, 0.6);
  const beamMat = getCachedColorMaterial('#78350F', 0.7);
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 2.85, 1.4);
  beam.castShadow = true;
  group.add(beam);

  // Cupola & Rooster Weather Vane on Top Ridge
  const cupolaGeo = new THREE.BoxGeometry(0.55, 0.45, 0.55);
  const cupola = new THREE.Mesh(cupolaGeo, doorMat);
  cupola.position.set(0, 3.35, 0);
  cupola.castShadow = true;

  const cupolaRoofGeo = new THREE.ConeGeometry(0.45, 0.35, 4);
  const cupolaRoof = new THREE.Mesh(cupolaRoofGeo, roofMat);
  cupolaRoof.position.set(0, 3.72, 0);
  cupolaRoof.rotation.y = Math.PI / 4;
  cupolaRoof.castShadow = true;

  const vaneRodGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6);
  const vaneRod = new THREE.Mesh(vaneRodGeo, getCachedColorMaterial('#F59E0B', 0.2, 0.8));
  vaneRod.position.set(0, 4.05, 0);

  const vaneRooster = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.04), getCachedColorMaterial('#D97706', 0.2, 0.8));
  vaneRooster.position.set(0.05, 4.25, 0);
  group.add(cupola, cupolaRoof, vaneRod, vaneRooster);

  // Stacked Hay Bales on the side
  const hayMat = getCachedColorMaterial('#FACC15', 0.8);
  const baleGeo = new THREE.BoxGeometry(0.6, 0.35, 0.4);
  const b1 = new THREE.Mesh(baleGeo, hayMat);
  b1.position.set(1.45, 0.25, 0.4);
  const b2 = new THREE.Mesh(baleGeo, hayMat);
  b2.position.set(1.45, 0.25, -0.1);
  const b3 = new THREE.Mesh(baleGeo, hayMat);
  b3.position.set(1.45, 0.55, 0.15);
  b1.castShadow = true;
  b2.castShadow = true;
  b3.castShadow = true;
  group.add(b1, b2, b3);

  return group;
}

/**
 * Metal Silo with red dome roof, exterior ladder, and grain pipe
 */
export function createSiloGroup(): THREE.Group {
  const group = new THREE.Group();

  // Stone base ring
  const baseGeo = new THREE.CylinderGeometry(0.95, 1.0, 0.3, 16);
  const baseMat = getCachedColorMaterial('#475569', 0.8);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.15;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Silo Cylindrical Body (Galvanized metal with slight sheen)
  const bodyGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.7, 16);
  const bodyMat = getCachedColorMaterial('#E2E8F0', 0.35, 0.45);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.6;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Steel Reinforcement Ribs / Bands
  const ribGeo = new THREE.TorusGeometry(0.87, 0.035, 8, 16);
  const ribMat = getCachedColorMaterial('#94A3B8', 0.3, 0.5);
  [0.8, 1.4, 2.0, 2.6].forEach(ry => {
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.y = ry;
    rib.rotation.x = Math.PI / 2;
    group.add(rib);
  });

  // Red Domed Roof
  const domeGeo = new THREE.ConeGeometry(0.98, 0.95, 16);
  const domeMat = getCachedColorMaterial('#DC2626', 0.5, 0.2);
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 3.4;
  dome.castShadow = true;
  group.add(dome);

  // Metal Access Ladder
  const ladderRailGeo = new THREE.BoxGeometry(0.04, 2.6, 0.04);
  const ladderMat = getCachedColorMaterial('#334155', 0.6, 0.7);
  const railL = new THREE.Mesh(ladderRailGeo, ladderMat);
  railL.position.set(-0.15, 1.6, 0.88);
  const railR = new THREE.Mesh(ladderRailGeo, ladderMat);
  railR.position.set(0.15, 1.6, 0.88);
  group.add(railL, railR);

  // Ladder Rungs
  const rungGeo = new THREE.BoxGeometry(0.3, 0.03, 0.03);
  for (let y = 0.5; y <= 2.8; y += 0.3) {
    const rung = new THREE.Mesh(rungGeo, ladderMat);
    rung.position.set(0, y, 0.88);
    group.add(rung);
  }

  // Grain Chute Outlet at bottom
  const chuteGeo = new THREE.BoxGeometry(0.3, 0.35, 0.4);
  const chuteMat = getCachedColorMaterial('#B91C1C', 0.6);
  const chute = new THREE.Mesh(chuteGeo, chuteMat);
  chute.position.set(0.7, 0.45, 0);
  chute.castShadow = true;
  group.add(chute);

  return group;
}

/**
 * Order Notice Board with canopy, pinned papers, parcel crate, and service bell
 */
export function createOrderBoardGroup(): THREE.Group {
  const group = new THREE.Group();

  // Wooden Posts
  const postGeo = new THREE.BoxGeometry(0.14, 1.8, 0.14);
  const woodMat = getCachedColorMaterial('#78350F', 0.8);
  const pL = new THREE.Mesh(postGeo, woodMat);
  pL.position.set(-0.7, 0.9, 0);
  pL.castShadow = true;
  const pR = new THREE.Mesh(postGeo, woodMat);
  pR.position.set(0.7, 0.9, 0);
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
  const crateMat = getCachedColorMaterial('#D97706', 0.8);
  const parcelMat = getCachedColorMaterial('#B45309', 0.85);
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

/**
 * Procedural Dynamic Waterfall Flow Texture
 */
function createWaterfallFlowTexture(isFoam: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  if (!isFoam) {
    // Deep crystal turquoise glacier water with subtle stream veins
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0.0, '#0369A1');
    grad.addColorStop(0.18, '#0284C7');
    grad.addColorStop(0.5, '#38BDF8');
    grad.addColorStop(0.82, '#0284C7');
    grad.addColorStop(1.0, '#0369A1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 1024);

    // Fast-flowing vertical water streaks
    for (let i = 0; i < 110; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 1024;
      const w = 1.5 + Math.random() * 5.0;
      const h = 40 + Math.random() * 160;
      const alpha = 0.2 + Math.random() * 0.45;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, w, h);
    }
  } else {
    // Frothing white-water foam & bubbling spray overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 256, 1024);

    // Thick foaming rapid streaks and boiling foam clusters
    for (let i = 0; i < 240; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 1024;
      const w = 2.0 + Math.random() * 7.0;
      const h = 30 + Math.random() * 120;
      const alpha = 0.35 + Math.random() * 0.60;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, w, h);
    }

    for (let i = 0; i < 280; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 1024;
      const r = 2.5 + Math.random() * 8.0;
      const alpha = 0.3 + Math.random() * 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, isFoam ? 2.5 : 3.5);
  return texture;
}

/**
 * Cascading Multi-Tier Mountain Waterfall & Alpine Gorge
 * Features sheer granite rock cliffs, multi-step plunging water curtains,
 * churning white-water rapids, foaming plunge pool, and mist particles.
 */
export function createMountainWaterfallGroup(season: SeasonType): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mountain_waterfall';

  const rockDarkMat = getCachedColorMaterial(season === 'winter' ? '#475569' : '#3F3F46', 0.85);
  const rockMidMat = getCachedColorMaterial(season === 'winter' ? '#64748B' : '#52525B', 0.80);
  const rockMossMat = getCachedColorMaterial(season === 'winter' ? '#94A3B8' : '#2D6A24', 0.85);
  const pineMat = getCachedColorMaterial(season === 'winter' ? '#E2E8F0' : '#14532D', 0.8);
  const trunkMat = getCachedColorMaterial('#78350F', 0.9);

  const waterFlowTex = createWaterfallFlowTexture(false);
  const foamFlowTex = createWaterfallFlowTexture(true);

  const waterMaterial = new THREE.MeshStandardMaterial({
    map: waterFlowTex,
    color: season === 'winter' ? 0xBAE6FD : 0x38BDF8,
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });

  const foamMaterial = new THREE.MeshStandardMaterial({
    map: foamFlowTex,
    color: 0xFFFFFF,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
  });

  const solidFoamMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.2,
    metalness: 0.05,
    transparent: true,
    opacity: 0.95,
  });

  // ── 1. Grand Wide Continuous Cascading Water Mesh (8.5m - 11.2m Wide) ──
  // Smooth natural parabolic cataract profile (No horizontal staircase shelves!)
  const streamProfile: [number, number, number][] = [
    [-9.0, 14.5, 8.5],  // Alpine mountain canyon summit cleft
    [-8.0, 13.6, 8.8],  // Mountain stream acceleration
    [-7.0, 12.2, 9.0],  // Upper cataract plunge
    [-6.0, 10.5, 9.3],  // Roaring upper cataract
    [-5.0, 8.6, 9.6],   // Mid cataract chute
    [-4.0, 6.7, 9.8],   // Mid cataract surge
    [-3.0, 4.8, 10.1],  // Lower cataract rush
    [-2.0, 3.1, 10.4],  // Lower cataract plunge
    [-1.0, 1.8, 10.7],  // Whitewater apron
    [0.2, 0.8, 11.0],   // River approach rapids
    [1.6, 0.2, 11.1],   // River impact zone
    [3.2, -0.05, 11.2], // Seamlessly merged into river
  ];

  const streamSteps = streamProfile.length;
  const crossSegments = 12;
  const waterPositions: number[] = [];
  const waterUVs: number[] = [];
  const waterIndices: number[] = [];

  for (let s = 0; s < streamSteps; s++) {
    const [pz, py, w] = streamProfile[s];
    const halfW = w / 2;
    const v = s / (streamSteps - 1);

    for (let c = 0; c <= crossSegments; c++) {
      const u = c / crossSegments; // 0 to 1
      const px = -halfW + u * w;
      // Natural parabolic cross-section trough (deeper in middle)
      const curvatureY = Math.sin(u * Math.PI) * 0.22;

      waterPositions.push(px, py - (0.22 - curvatureY), pz);
      waterUVs.push(u, v * 4.5);
    }
  }

  const stride = crossSegments + 1;
  for (let s = 0; s < streamSteps - 1; s++) {
    for (let c = 0; c < crossSegments; c++) {
      const i0 = s * stride + c;
      const i1 = i0 + 1;
      const i2 = (s + 1) * stride + c;
      const i3 = i2 + 1;
      waterIndices.push(i0, i2, i1);
      waterIndices.push(i1, i2, i3);
    }
  }

  const waterGeo = new THREE.BufferGeometry();
  waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3));
  waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(waterUVs, 2));
  waterGeo.setIndex(waterIndices);
  waterGeo.computeVertexNormals();

  const waterfallMesh = new THREE.Mesh(waterGeo, waterMaterial);
  waterfallMesh.name = 'waterfall_continuous_mesh';
  waterfallMesh.castShadow = true;
  group.add(waterfallMesh);

  // Cascading Foam Curtain Layer (Offset slightly for liquid parallax depth)
  const foamPositions = waterPositions.map((val, idx) => (idx % 3 === 1 ? val + 0.06 : val));
  const foamGeo = new THREE.BufferGeometry();
  foamGeo.setAttribute('position', new THREE.Float32BufferAttribute(foamPositions, 3));
  foamGeo.setAttribute('uv', new THREE.Float32BufferAttribute(waterUVs, 2));
  foamGeo.setIndex(waterIndices);
  foamGeo.computeVertexNormals();

  const foamMesh = new THREE.Mesh(foamGeo, foamMaterial);
  foamMesh.name = 'waterfall_foam_mesh';
  group.add(foamMesh);

  // ── 2. Natural Sloped Granite Bedrock Ramp Under the Water ───────────
  // Single organic angled bedrock ramp following the slope (No horizontal box stairs!)
  const rampGeo = new THREE.BoxGeometry(11.4, 1.2, 16.5);
  const ramp = new THREE.Mesh(rampGeo, rockDarkMat);
  ramp.position.set(0, 6.2, -2.8);
  ramp.rotation.x = 0.68; // Matching the slope angle perfectly
  ramp.castShadow = true;
  ramp.receiveShadow = true;
  group.add(ramp);

  // ── 3. 3D Frothing Foam Lip Crests & River Entry Whitewater ──────────
  const foamLipGeo = new THREE.DodecahedronGeometry(0.45, 0);
  const foamLips = [
    // Summit Cleft Foam (y = 13.6)
    { x: -3.5, y: 13.7, z: -8.0 }, { x: -1.2, y: 13.8, z: -8.1 }, { x: 1.2, y: 13.8, z: -8.1 }, { x: 3.5, y: 13.7, z: -8.0 },
    // Mid Cataract Chute Foam (y = 7.5)
    { x: -3.8, y: 7.6, z: -4.5 }, { x: -1.3, y: 7.7, z: -4.6 }, { x: 1.3, y: 7.7, z: -4.6 }, { x: 3.8, y: 7.6, z: -4.5 },
    // River Entry Whitewater Foam (y = 0.2)
    { x: -4.5, y: 0.25, z: 2.2 }, { x: -2.2, y: 0.28, z: 2.5 }, { x: 0, y: 0.30, z: 2.6 }, { x: 2.2, y: 0.28, z: 2.5 }, { x: 4.5, y: 0.25, z: 2.2 },
  ];
  foamLips.forEach((fl, idx) => {
    const fMesh = new THREE.Mesh(foamLipGeo, solidFoamMat);
    fMesh.name = `waterfall_foam_crest_${idx}`;
    fMesh.position.set(fl.x, fl.y, fl.z);
    fMesh.scale.set(1.8, 0.45, 0.95);
    group.add(fMesh);
  });

  // ── 4. Natural Low-Poly Flanking Boulders & Mountain Cliffs ──────────
  const rockDodec = new THREE.DodecahedronGeometry(1.6, 0);

  // Left Canyon Wall Boulders (Cascading naturally along the mountain slope)
  const leftRockData = [
    { x: -6.2, y: 1.5, z: 3.2, s: [2.2, 2.2, 2.2], mat: rockMidMat },
    { x: -6.8, y: 4.5, z: 0.2, s: [2.5, 2.8, 2.4], mat: rockDarkMat },
    { x: -7.4, y: 8.0, z: -3.0, s: [2.8, 3.2, 2.6], mat: rockMidMat },
    { x: -8.0, y: 12.0, z: -6.5, s: [3.2, 3.8, 3.0], mat: rockDarkMat },
    { x: -5.2, y: 1.0, z: 4.5, s: [1.6, 1.4, 1.7], mat: rockMossMat },
    { x: -5.8, y: 6.5, z: -1.2, s: [1.8, 2.0, 1.7], mat: rockMossMat },
  ];
  leftRockData.forEach(r => {
    const rock = new THREE.Mesh(rockDodec, r.mat);
    rock.position.set(r.x, r.y, r.z);
    rock.scale.set(r.s[0], r.s[1], r.s[2]);
    rock.rotation.set(r.x * 0.3, r.y * 0.2, r.z * 0.4);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  });

  // Right Canyon Wall Boulders
  const rightRockData = [
    { x: 6.2, y: 1.5, z: 3.2, s: [2.2, 2.2, 2.2], mat: rockMidMat },
    { x: 6.8, y: 4.5, z: 0.2, s: [2.5, 2.8, 2.4], mat: rockDarkMat },
    { x: 7.4, y: 8.0, z: -3.0, s: [2.8, 3.2, 2.6], mat: rockMidMat },
    { x: 8.0, y: 12.0, z: -6.5, s: [3.2, 3.8, 3.0], mat: rockDarkMat },
    { x: 5.2, y: 1.0, z: 4.5, s: [1.6, 1.4, 1.7], mat: rockMossMat },
    { x: 5.8, y: 6.5, z: -1.2, s: [1.8, 2.0, 1.7], mat: rockMossMat },
  ];
  rightRockData.forEach(r => {
    const rock = new THREE.Mesh(rockDodec, r.mat);
    rock.position.set(r.x, r.y, r.z);
    rock.scale.set(r.s[0], r.s[1], r.s[2]);
    rock.rotation.set(r.x * 0.3, r.y * 0.2, r.z * 0.4);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  });

  // ── 5. Expanding Sparkling White Foam Ripples on the River Surface ───
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  for (let r = 0; r < 4; r++) {
    const ringGeo = new THREE.RingGeometry(1.4 + r * 1.0, 1.9 + r * 1.0, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, rippleMat.clone());
    ring.name = `waterfall_foam_ring_${r}`;
    ring.position.set(0, 0.02 + r * 0.005, 3.8);
    group.add(ring);
  }

  // Submerged Granite River Stones in the Rapids
  const stoneGeo = new THREE.DodecahedronGeometry(0.65, 0);
  [
    { x: -4.5, z: 3.8, s: 1.2 },
    { x: 4.5, z: 3.5, s: 1.1 },
    { x: -2.6, z: 5.8, s: 0.8 },
    { x: 2.7, z: 6.0, s: 0.9 },
    { x: 0.1, z: 6.5, s: 0.7 },
  ].forEach(st => {
    const stone = new THREE.Mesh(stoneGeo, rockMidMat);
    stone.position.set(st.x, 0.2, st.z);
    stone.scale.set(st.s, st.s * 0.6, st.s);
    stone.castShadow = true;
    group.add(stone);
  });

  // ── 6. Dynamic Water Mist Spray Particle Cloud ───────────────────────
  const mistCount = 50;
  const mistGeo = new THREE.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  for (let m = 0; m < mistCount; m++) {
    mistPos[m * 3] = (Math.random() - 0.5) * 8.5;
    mistPos[m * 3 + 1] = 0.2 + Math.random() * 4.5;
    mistPos[m * 3 + 2] = 2.0 + Math.random() * 4.5;
  }
  mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
  const mistMat = new THREE.PointsMaterial({
    color: 0xE0F2FE,
    size: 0.65,
    transparent: true,
    opacity: 0.70,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mistPoints = new THREE.Points(mistGeo, mistMat);
  mistPoints.name = 'waterfall_mist_particles';
  group.add(mistPoints);

  // ── 7. Alpine Pine Trees & Lush Mountain Foliage ──────────────────────
  const pineTrunkGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.4, 5);
  [
    { x: -7.5, y: 5.5, z: 1.5, s: 1.3 },
    { x: -8.8, y: 10.5, z: -2.5, s: 1.5 },
    { x: 7.5, y: 5.2, z: 1.2, s: 1.2 },
    { x: 8.8, y: 10.2, z: -2.8, s: 1.4 },
  ].forEach(pt => {
    const pGroup = new THREE.Group();
    pGroup.position.set(pt.x, pt.y, pt.z);
    pGroup.scale.set(pt.s, pt.s, pt.s);

    const trunk = new THREE.Mesh(pineTrunkGeo, trunkMat);
    trunk.position.y = 0.7;
    trunk.castShadow = true;
    pGroup.add(trunk);

    for (let l = 0; l < 3; l++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2 * (1 - l * 0.22), 1.2, 5), pineMat);
      cone.position.y = 1.1 + l * 0.7;
      cone.castShadow = true;
      pGroup.add(cone);
    }
    group.add(pGroup);
  });

  return group;
}

/**
 * Organic Winding River Mesh & Riverbed
 * Replaces straight rectangular trenches with a beautiful curved river channel,
 * subdivided into 60 cross-sections ready for real-time 3D wave flow displacement.
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

/**
 * Detailed Wooden Fishing Pier / Dock
 * Features realistic weathered wood planks, sturdy timber pilings with rope ties,
 * a charming moored wooden rowboat bobbing in the water, fisherman's stool,
 * propped bamboo fishing rod with water float, metal fish bucket, and lantern post.
 */
export function createFishingDockGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'fishing_dock_model';

  const woodDeckMat = getCachedColorMaterial('#9A3412', 0.85);
  const woodDarkMat = getCachedColorMaterial('#78350F', 0.88);
  const timberPilingMat = getCachedColorMaterial('#451A03', 0.92);
  const boatMat = getCachedColorMaterial('#B45309', 0.85);
  const boatInsideMat = getCachedColorMaterial('#78350F', 0.9);
  const ropeMat = getCachedColorMaterial('#D97706', 0.7);
  const metalMat = getCachedColorMaterial('#64748B', 0.3, 0.7);
  const brassMat = getCachedColorMaterial('#F59E0B', 0.2, 0.85);
  const lanternGlowMat = getCachedColorMaterial('#FEF08A', 0.1, 0.95);
  const floatRedMat = getCachedColorMaterial('#EF4444', 0.3);
  const floatWhiteMat = getCachedColorMaterial('#F8FAFC', 0.3);
  const fishSilverMat = getCachedColorMaterial('#CBD5E1', 0.2, 0.8);
  const tackleBlueMat = getCachedColorMaterial('#0284C7', 0.5);

  // ── 1. Timber Foundation & Pilings ─────────────────────────────────────
  // 4 Main Submerged Round Timber Pilings driven into riverbed
  const pilingGeo = new THREE.CylinderGeometry(0.12, 0.14, 1.6, 8);
  const pilings = [
    { x: -1.2, z: -0.75 },
    { x: -1.2, z: 0.75 },
    { x: 1.2, z: -0.75 },
    { x: 1.2, z: 0.75 },
  ];
  pilings.forEach(({ x, z }) => {
    const pil = new THREE.Mesh(pilingGeo, timberPilingMat);
    pil.position.set(x, -0.4, z);
    pil.castShadow = true;
    pil.receiveShadow = true;

    // Top iron pile ring cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), metalMat);
    cap.position.set(x, 0.42, z);
    group.add(pil, cap);
  });

  // Longitudinal Support Beams under planks
  const beamGeo = new THREE.BoxGeometry(2.9, 0.14, 0.12);
  const beam1 = new THREE.Mesh(beamGeo, woodDarkMat);
  beam1.position.set(0, 0.18, -0.7);
  const beam2 = new THREE.Mesh(beamGeo, woodDarkMat);
  beam2.position.set(0, 0.18, 0.7);
  group.add(beam1, beam2);

  // ── 2. Individual Pier Deck Planks (from bank x = -1.4 to river x = +1.4) ──
  const plankCount = 10;
  const plankWidth = 0.26;
  const plankLength = 1.75;
  const plankGeo = new THREE.BoxGeometry(plankWidth, 0.08, plankLength);

  for (let i = 0; i < plankCount; i++) {
    const px = -1.3 + i * (plankWidth + 0.03);
    const plank = new THREE.Mesh(plankGeo, i % 2 === 0 ? woodDeckMat : woodDarkMat);
    plank.position.set(px, 0.28, 0);
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // Mooring Cleats / Bollards on pier edge
  const bollardGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 6);
  const b1 = new THREE.Mesh(bollardGeo, timberPilingMat);
  b1.position.set(1.25, 0.4, -0.75);
  const b2 = new THREE.Mesh(bollardGeo, timberPilingMat);
  b2.position.set(1.25, 0.4, 0.75);
  group.add(b1, b2);

  // ── 3. Moored Wooden Rowboat / Dinghy floating alongside ──────────────
  const boatGroup = new THREE.Group();
  boatGroup.name = 'fishing_rowboat';
  boatGroup.position.set(1.35, -0.05, 1.25);
  boatGroup.rotation.y = -0.15;

  // Boat Hull Base & Sides
  const hullBottom = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.75), boatMat);
  hullBottom.position.set(0, 0.05, 0);
  hullBottom.castShadow = true;

  const hullSideL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.06), boatMat);
  hullSideL.position.set(0, 0.2, -0.35);

  const hullSideR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.28, 0.06), boatMat);
  hullSideR.position.set(0, 0.2, 0.35);

  const hullBow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 4), boatMat);
  hullBow.position.set(0.9, 0.18, 0);
  hullBow.rotation.z = -Math.PI / 2;
  hullBow.rotation.y = Math.PI / 4;

  const hullStern = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.7), boatMat);
  hullStern.position.set(-0.8, 0.2, 0);

  // Boat Wooden Seat Bench
  const boatBench = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.65), boatInsideMat);
  boatBench.position.set(0, 0.22, 0);

  // Wooden Oars resting inside
  const oarGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 5);

  const oar1 = new THREE.Mesh(oarGeo, woodDarkMat);
  oar1.position.set(-0.1, 0.26, -0.15);
  oar1.rotation.set(0.1, 0.3, 0.4);

  const oar2 = new THREE.Mesh(oarGeo, woodDarkMat);
  oar2.position.set(-0.1, 0.26, 0.15);
  oar2.rotation.set(-0.1, -0.3, 0.4);

  boatGroup.add(hullBottom, hullSideL, hullSideR, hullBow, hullStern, boatBench, oar1, oar2);
  group.add(boatGroup);

  // Mooring Rope connecting Boat to Pier Bollard
  const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.65, 4);
  const rope = new THREE.Mesh(ropeGeo, ropeMat);
  rope.position.set(1.3, 0.2, 0.95);
  rope.rotation.x = Math.PI / 3;
  group.add(rope);

  // ── 4. Fisherman's Stool, Rod Stand & Fishing Rod ──────────────────────
  // Wooden Stool
  const stoolTop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), woodDarkMat);
  stoolTop.position.set(0.3, 0.52, -0.4);
  const sLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 4);
  [
    [0.18, -0.52], [0.42, -0.52], [0.18, -0.28], [0.42, -0.28]
  ].forEach(([sx, sz]) => {
    const leg = new THREE.Mesh(sLegGeo, woodDarkMat);
    leg.position.set(sx, 0.41, sz);
    group.add(leg);
  });
  group.add(stoolTop);

  // Angled Bamboo Fishing Rod in Rod Holder
  const rodStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.25, 6), metalMat);
  rodStand.position.set(1.2, 0.42, 0.1);
  rodStand.rotation.z = -0.3;

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.045, 2.4, 6), brassMat);
  rod.position.set(1.9, 1.25, 0.1);
  rod.rotation.z = -Math.PI / 4;
  rod.castShadow = true;

  // Thin fishing line dropping to water float
  const lineGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.4, 3);
  const line = new THREE.Mesh(lineGeo, metalMat);
  line.position.set(2.7, 1.25, 0.1);

  // Red & White Fishing Float / Bobber on water
  const floatGroup = new THREE.Group();
  floatGroup.name = 'fishing_bobber';
  floatGroup.position.set(2.7, 0.02, 0.1);

  const floatTop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), floatRedMat);
  floatTop.position.y = 0.04;
  const floatBot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), floatWhiteMat);
  floatBot.position.y = -0.02;
  floatGroup.add(floatTop, floatBot);
  group.add(rodStand, rod, line, floatGroup);

  // ── 5. Galvanized Fish Bucket & Open Tackle Box ────────────────────────
  // Metal Fish Bucket
  const bucketGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.32, 10);
  const bucket = new THREE.Mesh(bucketGeo, metalMat);
  bucket.position.set(-0.5, 0.48, -0.45);
  bucket.castShadow = true;

  // Fish tails peeking out of bucket
  const tailGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
  const tail1 = new THREE.Mesh(tailGeo, fishSilverMat);
  tail1.position.set(-0.48, 0.68, -0.48);
  tail1.rotation.set(0.3, 0.2, 0.2);

  const tail2 = new THREE.Mesh(tailGeo, fishSilverMat);
  tail2.position.set(-0.54, 0.66, -0.42);
  tail2.rotation.set(-0.2, -0.3, -0.3);
  group.add(bucket, tail1, tail2);

  // Turquoise Tackle Box
  const tackle = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.24), tackleBlueMat);
  tackle.position.set(-0.5, 0.42, 0.35);
  tackle.castShadow = true;
  group.add(tackle);

  // ── 6. Corner Mooring Post with Brass Lantern & Lifebuoy ──────────────
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 6), timberPilingMat);
  post.position.set(-1.25, 0.85, 0.75);
  post.castShadow = true;

  // Hanging Brass Lantern
  const lanternArm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.28), metalMat);
  lanternArm.position.set(-1.25, 1.45, 0.62);

  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), brassMat);
  lantern.position.set(-1.25, 1.32, 0.5);

  const lanternGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), lanternGlowMat);
  lanternGlass.position.set(-1.25, 1.32, 0.5);
  group.add(post, lanternArm, lantern, lanternGlass);

  // Red & White Lifebuoy Ring on post
  const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 8, 16), floatRedMat);
  buoy.position.set(-1.18, 0.95, 0.75);
  buoy.rotation.y = Math.PI / 2;
  group.add(buoy);

  return group;
}

/**
 * Low-Poly Mountain Tunnel with Stone Masonry Arch, Heavy Timber Beams,
 * Hanging Lantern, Forest Pines, Cliff Rocks, and Deep Cave Interior
 */
export function createMountainTunnelGroup(season: SeasonType, label = 'TOWN'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'mountain_tunnel';

  const stoneMat = getCachedColorMaterial('#64748B', 0.85);
  const stoneLightMat = getCachedColorMaterial('#94A3B8', 0.8);
  const stoneDarkMat = getCachedColorMaterial('#475569', 0.9);
  const woodMat = getCachedColorMaterial('#78350F', 0.85);
  const darkWoodMat = getCachedColorMaterial('#451A03', 0.9);
  const voidMat = new THREE.MeshBasicMaterial({ color: 0x070B14 });
  const roadMat = getCachedColorMaterial('#C9822B', 0.95);
  const grassColor = season === 'winter' ? '#94A3B8' : season === 'autumn' ? '#667C34' : '#3B7528';
  const grassMat = getCachedColorMaterial(grassColor, 0.88);
  const pineMat = getCachedColorMaterial(season === 'winter' ? '#94A3B8' : '#14532D', 0.8);
  const lanternGoldMat = getCachedColorMaterial('#FBBF24', 0.2, 0.8);

  const caveWidth = 3.3;
  const caveHeight = 2.3;
  const caveDepth = 4.0;

  // ── 1. Cave Interior Void & Dirt Floor ────────────────────────────────
  const cave = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth, caveHeight, caveDepth),
    voidMat
  );
  cave.position.set(0, caveHeight / 2, -caveDepth / 2);
  group.add(cave);

  const caveFloor = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth + 0.3, 0.08, caveDepth + 0.4),
    roadMat
  );
  caveFloor.position.set(0, 0.04, -caveDepth / 2 + 0.2);
  group.add(caveFloor);

  // ── 2. Stone Arch Masonry Portal (Clean stylized blocks) ──────────────
  // Left Pillar
  const pillarGeo = new THREE.BoxGeometry(0.75, 2.6, 0.9);
  const pL = new THREE.Mesh(pillarGeo, stoneMat);
  pL.position.set(-(caveWidth / 2 + 0.38), 1.3, 0);
  pL.castShadow = true;
  pL.receiveShadow = true;

  const capGeo = new THREE.BoxGeometry(0.9, 0.22, 1.05);
  const capL = new THREE.Mesh(capGeo, stoneLightMat);
  capL.position.set(-(caveWidth / 2 + 0.38), 2.65, 0);

  // Right Pillar
  const pR = pL.clone();
  pR.position.x = caveWidth / 2 + 0.38;
  const capR = capL.clone();
  capR.position.x = caveWidth / 2 + 0.38;
  group.add(pL, capL, pR, capR);

  // Stone Arch Keystones
  const ARCH_R = caveWidth / 2 + 0.38;
  const ARCH_CENTER_Y = 2.1;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 6) * Math.PI;
    const bx = -Math.cos(angle) * ARCH_R;
    const by = ARCH_CENTER_Y + Math.sin(angle) * (ARCH_R * 0.55);
    const stoneBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.55, 0.9),
      i === 3 ? stoneLightMat : (i % 2 === 0 ? stoneMat : stoneDarkMat)
    );
    stoneBlock.position.set(bx, by, 0);
    stoneBlock.rotation.z = angle - Math.PI / 2;
    stoneBlock.castShadow = true;
    group.add(stoneBlock);
  }

  // ── 3. Grassy Top Cover & Flanking Green Slopes (Deeply merging into Mountain) ──
  // Lush Green Grass Top (Exact mountain color, extends deep into mountain slope)
  const grassTopGeo = new THREE.BoxGeometry(caveWidth + 2.6, 0.6, caveDepth + 2.2);
  const grassTop = new THREE.Mesh(grassTopGeo, grassMat);
  grassTop.position.set(0, caveHeight + 0.3, -(caveDepth + 2.2) / 2 + 0.3);
  grassTop.receiveShadow = true;
  grassTop.castShadow = true;

  // Left & Right Green Grassy Embankments (Fuses directly with mountain terrain)
  const grassSideGeo = new THREE.BoxGeometry(1.8, 2.6, caveDepth + 2.0);
  const grassSideL = new THREE.Mesh(grassSideGeo, grassMat);
  grassSideL.position.set(-(caveWidth / 2 + 1.05), 1.3, -(caveDepth + 2.0) / 2 + 0.3);
  grassSideL.rotation.set(0, 0.12, 0.06);
  grassSideL.receiveShadow = true;
  grassSideL.castShadow = true;

  const grassSideR = new THREE.Mesh(grassSideGeo, grassMat);
  grassSideR.position.set(caveWidth / 2 + 1.05, 1.3, -(caveDepth + 2.0) / 2 + 0.3);
  grassSideR.rotation.set(0, -0.12, -0.06);
  grassSideR.receiveShadow = true;
  grassSideR.castShadow = true;

  // Soft grass mound accents at the base
  const mndGeo = new THREE.SphereGeometry(1.2, 8, 6);
  const mndL = new THREE.Mesh(mndGeo, grassMat);
  mndL.position.set(-(caveWidth / 2 + 1.3), 0.45, 0.1);
  mndL.scale.set(1.1, 0.55, 1.3);

  const mndR = new THREE.Mesh(mndGeo, grassMat);
  mndR.position.set(caveWidth / 2 + 1.3, 0.45, 0.1);
  mndR.scale.set(1.1, 0.55, 1.3);

  // Roadside boulders hugging the stone frame
  const srGeo = new THREE.DodecahedronGeometry(0.38, 0);
  const sr1 = new THREE.Mesh(srGeo, stoneLightMat);
  sr1.position.set(-(caveWidth / 2 + 0.9), 0.24, 0.4);
  const sr2 = new THREE.Mesh(srGeo, stoneMat);
  sr2.position.set(caveWidth / 2 + 0.85, 0.22, 0.38);
  group.add(grassTop, grassSideL, grassSideR, mndL, mndR, sr1, sr2);

  // ── 4. Wooden Mine-Style Framing & Signboard ──────────────────────────
  const timberPostGeo = new THREE.BoxGeometry(0.22, 2.2, 0.22);
  const timberL = new THREE.Mesh(timberPostGeo, woodMat);
  timberL.position.set(-(caveWidth / 2 - 0.12), 1.1, 0.25);
  const timberR = timberL.clone();
  timberR.position.x = caveWidth / 2 - 0.12;

  const timberBeam = new THREE.Mesh(
    new THREE.BoxGeometry(caveWidth + 0.4, 0.26, 0.28),
    woodMat
  );
  timberBeam.position.set(0, 2.25, 0.25);
  timberBeam.castShadow = true;
  group.add(timberL, timberR, timberBeam);

  // Wooden Signboard
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.42, 0.08),
    darkWoodMat
  );
  signBoard.position.set(0, 2.65, 0.32);
  signBoard.castShadow = true;

  const signPlate = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.3, 0.02),
    getCachedColorMaterial('#FEF08A', 0.5)
  );
  signPlate.position.set(0, 2.65, 0.37);
  group.add(signBoard, signPlate);

  // Hanging Brass Lantern
  const lanternChain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4),
    darkWoodMat
  );
  lanternChain.position.set(0, 2.0, 0.3);

  const lanternCage = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.2, 0.16),
    darkWoodMat
  );
  lanternCage.position.set(0, 1.85, 0.3);

  const lanternGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.14, 0.1),
    lanternGoldMat
  );
  lanternGlow.position.set(0, 1.85, 0.3);
  group.add(lanternChain, lanternCage, lanternGlow);

  return group;
}

// -------------------------------------------------------------
// 2. PRODUCTION WORKSHOPS & FACTORIES
// -------------------------------------------------------------

export function createProductionBuildingGroup(configId: string): THREE.Group {
  const group = new THREE.Group();

  // Cobblestone / Wooden Workshop Base
  const baseGeo = new THREE.BoxGeometry(1.9, 0.25, 1.9);
  const baseMat = getCachedColorMaterial('#475569', 0.85);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.125;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  if (configId === 'bakery') {
    // ── Artisan Brick & Stone Bakery Oven with glowing hearth and fresh bread ──
    // Warm Terracotta Brick Oven Body & Dome
    const ovenBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.92, 0.95, 12),
      getCachedColorMaterial('#9A3412', 0.85)
    );
    ovenBody.position.set(-0.25, 0.65, -0.2);
    ovenBody.castShadow = true;
    ovenBody.receiveShadow = true;

    const ovenDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      getCachedColorMaterial('#B45309', 0.8)
    );
    ovenDome.position.set(-0.25, 1.1, -0.2);
    ovenDome.castShadow = true;

    // Stone Arch Oven Mouth Opening
    const archMat = getCachedColorMaterial('#78350F', 0.9);
    const archTop = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 6, 12, Math.PI), archMat);
    archTop.position.set(-0.25, 0.85, 0.58);
    const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.14), archMat);
    archLeft.position.set(-0.57, 0.6, 0.58);
    const archRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.14), archMat);
    archRight.position.set(0.07, 0.6, 0.58);

    // Glowing Fiery Hearth interior
    const hearthGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      getCachedColorMaterial('#F59E0B', 0.1, 0.9)
    );
    hearthGlow.name = 'bakery_fire_glow';
    hearthGlow.position.set(-0.25, 0.58, 0.4);

    const fireLogs = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.42, 6),
      getCachedColorMaterial('#451A03', 0.9)
    );
    fireLogs.position.set(-0.25, 0.45, 0.45);
    fireLogs.rotation.z = Math.PI / 3;

    // Tall Red-Brick Chimney
    const chimGeo = new THREE.BoxGeometry(0.38, 1.6, 0.38);
    const chimMat = getCachedColorMaterial('#78350F', 0.9);
    const chim = new THREE.Mesh(chimGeo, chimMat);
    chim.position.set(-0.55, 1.7, -0.55);
    chim.castShadow = true;

    const chimCap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.48), getCachedColorMaterial('#475569', 0.85));
    chimCap.position.set(-0.55, 2.52, -0.55);

    // Billowing smoke puffs from chimney
    const smokeMat = getCachedColorMaterial('#F1F5F9', 0.4, 0.0, true, 0.75);
    const sm1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), smokeMat);
    sm1.position.set(-0.55, 2.72, -0.55);
    const sm2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), smokeMat);
    sm2.position.set(-0.5, 3.0, -0.5);
    const sm3 = new THREE.Mesh(new THREE.SphereGeometry(0.26, 6, 6), smokeMat);
    sm3.position.set(-0.42, 3.32, -0.45);

    // Baker's Oak Work Table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.1, 0.65),
      getCachedColorMaterial('#9A3412', 0.75)
    );
    tableTop.position.set(0.25, 0.58, 0.45);
    tableTop.castShadow = true;

    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.52, 4);
    const legMat = getCachedColorMaterial('#78350F', 0.85);
    [[-0.3, 0.18], [0.8, 0.18], [-0.3, 0.72], [0.8, 0.72]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.28, lz);
      group.add(leg);
    });

    // Fresh Golden Bakery Goods on table
    // 1. Long French Baguette
    const baguette = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 0.42, 8),
      getCachedColorMaterial('#D97706', 0.45)
    );
    baguette.position.set(0.05, 0.68, 0.42);
    baguette.rotation.z = Math.PI / 4;

    // 2. Round Sourdough Boule
    const boule = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 6),
      getCachedColorMaterial('#F59E0B', 0.4)
    );
    boule.position.set(0.38, 0.72, 0.45);
    boule.scale.set(1.2, 0.7, 1.2);

    // 3. Baker's Wooden Bread Peel / Paddle
    const paddleStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.4, 5),
      getCachedColorMaterial('#78350F', 0.8)
    );
    paddleStick.position.set(0.68, 0.72, -0.1);
    paddleStick.rotation.set(0.3, 0.1, -0.4);

    const paddleHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.02, 0.32),
      getCachedColorMaterial('#B45309', 0.8)
    );
    paddleHead.position.set(0.32, 1.15, -0.22);
    paddleHead.rotation.set(0.3, 0.1, -0.4);

    // Flour sack near table
    const flourSack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.42, 8),
      getCachedColorMaterial('#FEF3C7', 0.85)
    );
    flourSack.position.set(0.72, 0.25, -0.35);
    flourSack.castShadow = true;

    group.add(
      ovenBody, ovenDome, archTop, archLeft, archRight, hearthGlow, fireLogs,
      chim, chimCap, sm1, sm2, sm3,
      tableTop, baguette, boule, paddleStick, paddleHead, flourSack
    );

  } else if (configId === 'feed_mill') {
    // ── Traditional Dutch Timber Windmill & Grain Mill ──────────────────
    // Octagonal Granite Stone Foundation
    const stoneBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 1.05, 0.32, 8),
      getCachedColorMaterial('#64748B', 0.85)
    );
    stoneBase.position.y = 0.16;
    stoneBase.castShadow = true;
    stoneBase.receiveShadow = true;

    // Lower Mill Tower (Rich dark timber with arched entry door)
    const towerLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.88, 1.25, 8),
      getCachedColorMaterial('#78350F', 0.8)
    );
    towerLower.position.y = 0.92;
    towerLower.castShadow = true;
    towerLower.receiveShadow = true;

    // Arched Timber Entrance Door
    const millDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.72, 0.06),
      getCachedColorMaterial('#451A03', 0.9)
    );
    millDoor.position.set(0, 0.65, 0.84);
    const millDoorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.82, 0.04),
      getCachedColorMaterial('#F8FAFC', 0.5)
    );
    millDoorFrame.position.set(0, 0.65, 0.82);

    // Balcony Gallery Rim
    const galleryRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 0.82, 0.08, 8),
      getCachedColorMaterial('#B45309', 0.85)
    );
    galleryRim.position.y = 1.56;
    galleryRim.castShadow = true;

    // Upper Mill Tower (Warm cedar clapboard with window)
    const towerUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.72, 1.05, 8),
      getCachedColorMaterial('#B45309', 0.75)
    );
    towerUpper.position.y = 2.1;
    towerUpper.castShadow = true;

    // Upper Glass Window
    const winGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.32, 0.06),
      getCachedColorMaterial('#FEF08A', 0.3)
    );
    winGlass.position.set(0, 2.15, 0.65);

    // Conical Thatched / Shingled Roof Cap
    const capGeo = new THREE.ConeGeometry(0.68, 0.75, 8);
    const capMat = getCachedColorMaterial('#3B1808', 0.8);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 2.95;
    cap.castShadow = true;

    // Small weather vane on top
    const vane = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.02),
      getCachedColorMaterial('#F59E0B', 0.2, 0.8)
    );
    vane.position.set(0, 3.42, 0);

    // ── Windmill Sails Assembly (spins in render loop) ─────────────────
    const bladesGroup = new THREE.Group();
    bladesGroup.name = 'mill_blades';
    bladesGroup.position.set(0, 2.35, 0.68);

    // Cast-iron central shaft hub
    const hubGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.18, 12);
    const hubMat = getCachedColorMaterial('#1E293B', 0.9);
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    bladesGroup.add(hub);

    const frameWoodMat = getCachedColorMaterial('#78350F', 0.85);
    const canvasSailMat = getCachedColorMaterial('#FEF3C7', 0.4);

    for (let i = 0; i < 4; i++) {
      const bladeArm = new THREE.Group();
      bladeArm.rotation.z = (i * Math.PI) / 2;

      // Heavy timber spar
      const spar = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.8, 0.05),
        frameWoodMat
      );
      spar.position.y = 0.9;
      spar.castShadow = true;

      // Canvas sail fabric
      const sail = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 1.35, 0.02),
        canvasSailMat
      );
      sail.position.set(0.18, 0.98, 0.02);
      sail.castShadow = true;

      bladeArm.add(spar, sail);
      bladesGroup.add(bladeArm);
    }

    // Stacked Grain & Feed Burlap Sacks by the mill
    const sackMat = getCachedColorMaterial('#E2D5B5', 0.85);
    const sackGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.42, 8);
    const s1 = new THREE.Mesh(sackGeo, sackMat);
    s1.position.set(0.85, 0.25, 0.35);
    s1.castShadow = true;

    const s2 = new THREE.Mesh(sackGeo, sackMat);
    s2.position.set(0.85, 0.25, -0.2);
    s2.castShadow = true;

    const s3 = new THREE.Mesh(sackGeo, sackMat);
    s3.position.set(0.85, 0.58, 0.08);
    s3.rotation.z = Math.PI / 6;
    s3.castShadow = true;

    // Feed hopper bucket
    const bucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.12, 0.26, 8),
      getCachedColorMaterial('#B45309', 0.8)
    );
    bucket.position.set(-0.75, 0.22, 0.45);

    group.add(
      stoneBase, towerLower, millDoorFrame, millDoor, galleryRim,
      towerUpper, winGlass, cap, vane, bladesGroup,
      s1, s2, s3, bucket
    );

  } else if (configId === 'dairy') {
    // Dairy Creamery building with giant milk bottle on roof
    const shedGeo = new THREE.BoxGeometry(1.4, 1.2, 1.4);
    const shedMat = getCachedColorMaterial('#38BDF8', 0.5);
    const shed = new THREE.Mesh(shedGeo, shedMat);
    shed.position.y = 0.75;
    shed.castShadow = true;
    group.add(shed);

    const roofGeo = new THREE.ConeGeometry(1.15, 0.7, 4);
    const roofMat = getCachedColorMaterial('#0284C7', 0.6);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.7;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Giant Milk Bottle Display on top
    const bottleGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8);
    const bottleMat = getCachedColorMaterial('#F8FAFC', 0.3);
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0, 2.3, 0);
    bottle.castShadow = true;
    group.add(bottle);

    // Stainless steel milk churns
    const churnGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.55, 8);
    const churnMat = getCachedColorMaterial('#CBD5E1', 0.2, 0.8);
    const ch1 = new THREE.Mesh(churnGeo, churnMat);
    ch1.position.set(0.55, 0.4, 0.55);
    const ch2 = new THREE.Mesh(churnGeo, churnMat);
    ch2.position.set(-0.55, 0.4, 0.55);
    group.add(ch1, ch2);

    // Golden Cheese Wheels
    const cheeseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 10);
    const cheeseMat = getCachedColorMaterial('#FACC15', 0.5);
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.position.set(0, 0.4, 0.6);
    group.add(cheese);

  } else if (configId === 'sugar_mill') {
    // Sugar Press with gear cog and sugarcane chute
    const bodyGeo = new THREE.BoxGeometry(1.4, 1.1, 1.2);
    const bodyMat = getCachedColorMaterial('#10B981', 0.65);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    // Big rotating gear cogwheel
    const cogGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 8);
    const cogMat = getCachedColorMaterial('#F59E0B', 0.3, 0.6);
    const cog = new THREE.Mesh(cogGeo, cogMat);
    cog.name = 'sugar_cog';
    cog.position.set(0, 1.45, 0);
    cog.rotation.x = Math.PI / 2;
    group.add(cog);

    // Cane Chute & Sugar sacks
    const chuteGeo = new THREE.BoxGeometry(0.5, 0.8, 0.4);
    const chuteMat = getCachedColorMaterial('#059669', 0.7);
    const chute = new THREE.Mesh(chuteGeo, chuteMat);
    chute.position.set(0.55, 0.6, 0.3);
    group.add(chute);

    const sackGeo = new THREE.SphereGeometry(0.2, 6, 6);
    const sackMat = getCachedColorMaterial('#FEF08A', 0.6);
    const sack = new THREE.Mesh(sackGeo, sackMat);
    sack.position.set(-0.55, 0.35, 0.5);
    group.add(sack);

  } else if (configId === 'grill') {
    // Barbecue Pit with sizzling embers and prep station
    const pitGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.9, 12);
    const pitMat = getCachedColorMaterial('#334155', 0.85);
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, 0.55, -0.1);
    pit.castShadow = true;
    group.add(pit);

    // Glowing charcoal grate
    const coalGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.08, 12);
    const coalMat = getCachedColorMaterial('#EF4444', 0.2);
    const coal = new THREE.Mesh(coalGeo, coalMat);
    coal.position.set(0, 1.02, -0.1);
    group.add(coal);

    // Meat patties & Skewers
    const pattyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 6);
    const pattyMat = getCachedColorMaterial('#78350F', 0.6);
    const p1 = new THREE.Mesh(pattyGeo, pattyMat);
    p1.position.set(-0.2, 1.08, -0.1);
    const p2 = new THREE.Mesh(pattyGeo, pattyMat);
    p2.position.set(0.2, 1.08, -0.1);
    group.add(p1, p2);

    // Wooden Chef prep counter
    const cntGeo = new THREE.BoxGeometry(0.9, 0.5, 0.4);
    const cntMat = getCachedColorMaterial('#B45309', 0.7);
    const cnt = new THREE.Mesh(cntGeo, cntMat);
    cnt.position.set(0, 0.35, 0.6);
    group.add(cnt);

  } else if (configId === 'popcorn_pot') {
    // Popcorn kettle on stone stove
    const stoveGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.8, 10);
    const stoveMat = getCachedColorMaterial('#B45309', 0.8);
    const stove = new THREE.Mesh(stoveGeo, stoveMat);
    stove.position.y = 0.5;
    stove.castShadow = true;
    group.add(stove);

    // Copper kettle
    const potGeo = new THREE.SphereGeometry(0.5, 10, 10);
    const potMat = getCachedColorMaterial('#D97706', 0.2, 0.7);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 1.1;
    pot.castShadow = true;
    group.add(pot);

    // Popcorn kernels bursting
    const cornMat = getCachedColorMaterial('#FEF08A', 0.4);
    for (let i = 0; i < 4; i++) {
      const kernel = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), cornMat);
      kernel.position.set((Math.random() - 0.5) * 0.4, 1.6 + Math.random() * 0.2, (Math.random() - 0.5) * 0.4);
      group.add(kernel);
    }

  } else if (configId === 'pie_oven') {
    // Cobblestone pastry oven with rack of pies
    const ovenGeo = new THREE.BoxGeometry(1.4, 1.1, 1.2);
    const ovenMat = getCachedColorMaterial('#D97706', 0.8);
    const oven = new THREE.Mesh(ovenGeo, ovenMat);
    oven.position.y = 0.65;
    oven.castShadow = true;
    group.add(oven);

    // Display rack with golden pie
    const pieGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.1, 8);
    const pieMat = getCachedColorMaterial('#F59E0B', 0.4);
    const pie = new THREE.Mesh(pieGeo, pieMat);
    pie.position.set(0, 1.25, 0.2);
    group.add(pie);

  } else if (configId === 'loom' || configId === 'sewing_machine') {
    // Loom wooden frame with colorful spools of yarn
    const frameGeo = new THREE.BoxGeometry(1.3, 1.3, 0.9);
    const frameMat = getCachedColorMaterial('#9A3412', 0.7);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.75;
    frame.castShadow = true;
    group.add(frame);

    // Yarn Spools (Red, Blue, Yellow)
    const spoolGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8);
    const sp1 = new THREE.Mesh(spoolGeo, getCachedColorMaterial('#EF4444', 0.5));
    sp1.position.set(-0.35, 1.3, 0.2);
    const sp2 = new THREE.Mesh(spoolGeo, getCachedColorMaterial('#3B82F6', 0.5));
    sp2.position.set(0, 1.3, 0.2);
    const sp3 = new THREE.Mesh(spoolGeo, getCachedColorMaterial('#FACC15', 0.5));
    sp3.position.set(0.35, 1.3, 0.2);
    group.add(sp1, sp2, sp3);

  } else if (configId === 'juice_press') {
    // Wooden fruit press with glass dispenser tank
    const pressGeo = new THREE.BoxGeometry(1.2, 1.0, 1.0);
    const pressMat = getCachedColorMaterial('#F97316', 0.6);
    const press = new THREE.Mesh(pressGeo, pressMat);
    press.position.y = 0.6;
    press.castShadow = true;
    group.add(press);

    // Glass juice jar on top
    const jarGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8);
    const jarMat = getCachedColorMaterial('#FB923C', 0.1, 0.3, true, 0.85);
    const jar = new THREE.Mesh(jarGeo, jarMat);
    jar.position.set(0, 1.3, 0);
    group.add(jar);

  } else {
    // Generic adorable craft workshop with colorful roof and lantern
    const shopGeo = new THREE.BoxGeometry(1.4, 1.1, 1.3);
    const shopMat = getCachedColorMaterial('#EC4899', 0.6);
    const shop = new THREE.Mesh(shopGeo, shopMat);
    shop.position.y = 0.65;
    shop.castShadow = true;
    group.add(shop);

    const roofGeo = new THREE.ConeGeometry(1.15, 0.75, 4);
    const roofMat = getCachedColorMaterial('#FBBF24', 0.5);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.6;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // Hanging sign
    const signGeo = new THREE.BoxGeometry(0.5, 0.25, 0.04);
    const signMat = getCachedColorMaterial('#78350F', 0.7);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 1.0, 0.7);
    group.add(sign);
  }

  return group;
}

// -------------------------------------------------------------
// 3. ANIMAL PENS & ANIMALS
// -------------------------------------------------------------

export function createAnimalPenGroup(configId: string): THREE.Group {
  const group = new THREE.Group();

  const isMud = configId === 'pig_pen';
  const groundGeo = new THREE.BoxGeometry(2.85, 0.12, 2.85);
  const groundColor = isMud ? '#451A03' : '#4D7C0F';
  const groundMat = getCachedColorMaterial(groundColor, 0.95);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = 0.06;
  ground.receiveShadow = true;
  group.add(ground);

  // Dirt / Trampled Feeding Ground Patch
  const patchGeo = new THREE.BoxGeometry(1.6, 0.02, 1.4);
  const patchMat = getCachedColorMaterial(isMud ? '#2D1302' : '#78350F', 0.95);
  const patch = new THREE.Mesh(patchGeo, patchMat);
  patch.position.set(-0.3, 0.125, -0.3);
  group.add(patch);

  // Wooden Fence Posts & Rails around the perimeter with post caps
  const fenceMat = getCachedColorMaterial('#78350F', 0.8);
  const postGeo = new THREE.BoxGeometry(0.12, 0.72, 0.12);
  const capGeo = new THREE.ConeGeometry(0.09, 0.08, 4);
  const corners = [
    [-1.35, -1.35], [1.35, -1.35], [-1.35, 1.35], [1.35, 1.35],
    [0, -1.35], [-1.35, 0], [1.35, 0]
  ];
  corners.forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeo, fenceMat);
    post.position.set(px, 0.42, pz);
    post.castShadow = true;

    const cap = new THREE.Mesh(capGeo, fenceMat);
    cap.position.set(px, 0.8, pz);
    cap.rotation.y = Math.PI / 4;
    group.add(post, cap);
  });

  // Perimeter Rails (with open gate opening on South side at x in [0.2, 1.1])
  const railHGeo = new THREE.BoxGeometry(2.7, 0.08, 0.06);
  const railVGeo = new THREE.BoxGeometry(0.06, 0.08, 2.7);
  const railShortGeo = new THREE.BoxGeometry(1.35, 0.08, 0.06);

  [0.32, 0.58].forEach(ry => {
    // North (Back)
    const rN = new THREE.Mesh(railHGeo, fenceMat);
    rN.position.set(0, ry, -1.35);
    // West (Left)
    const rW = new THREE.Mesh(railVGeo, fenceMat);
    rW.position.set(-1.35, ry, 0);
    // East (Right)
    const rE = new THREE.Mesh(railVGeo, fenceMat);
    rE.position.set(1.35, ry, 0);
    // South-West segment
    const rS = new THREE.Mesh(railShortGeo, fenceMat);
    rS.position.set(-0.68, ry, 1.35);
    group.add(rN, rW, rE, rS);
  });

  // Gate Posts with mini-lantern
  const gPost1 = new THREE.Mesh(postGeo, fenceMat);
  gPost1.position.set(0.1, 0.42, 1.35);
  const gPost2 = new THREE.Mesh(postGeo, fenceMat);
  gPost2.position.set(1.35, 0.42, 1.35);
  group.add(gPost1, gPost2);

  // ── 1. CHICKEN COOP ──────────────────────────────────────────────────
  if (configId === 'chicken_coop') {
    // Elevated Barn-Style Hen House on wooden stilts
    const stiltMat = getCachedColorMaterial('#451A03', 0.9);
    const stiltGeo = new THREE.BoxGeometry(0.08, 0.4, 0.08);
    [
      [-1.15, -1.15], [-0.35, -1.15], [-1.15, -0.35], [-0.35, -0.35]
    ].forEach(([sx, sz]) => {
      const st = new THREE.Mesh(stiltGeo, stiltMat);
      st.position.set(sx, 0.3, sz);
      st.castShadow = true;
      group.add(st);
    });

    // Main Hen House Body (Red timber planks with white trim)
    const coopBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.75, 0.95),
      getCachedColorMaterial('#DC2626', 0.65)
    );
    coopBody.position.set(-0.75, 0.85, -0.75);
    coopBody.castShadow = true;
    group.add(coopBody);

    // Front pop-door hole
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.32, 0.04),
      getCachedColorMaterial('#1E293B', 0.9)
    );
    door.position.set(-0.75, 0.65, -0.26);
    group.add(door);

    // Pitched Cedar-Shingle Roof
    const roofMat = getCachedColorMaterial('#78350F', 0.7);
    const rL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.1), roofMat);
    rL.position.set(-0.95, 1.35, -0.75);
    rL.rotation.z = 0.55;
    rL.castShadow = true;

    const rR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 1.1), roofMat);
    rR.position.set(-0.55, 1.35, -0.75);
    rR.rotation.z = -0.55;
    rR.castShadow = true;
    group.add(rL, rR);

    // Rooster Weather Vane on roof peak
    const vanePole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6),
      getCachedColorMaterial('#D97706', 0.3, 0.8)
    );
    vanePole.position.set(-0.75, 1.62, -0.75);
    const vaneRooster = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.02),
      getCachedColorMaterial('#D97706', 0.3, 0.8)
    );
    vaneRooster.position.set(-0.75, 1.72, -0.75);
    group.add(vanePole, vaneRooster);

    // Wooden Ramp with cross-rungs
    const ramp = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.03, 0.65),
      getCachedColorMaterial('#9A3412', 0.8)
    );
    ramp.position.set(-0.75, 0.3, 0.0);
    ramp.rotation.x = 0.65;
    group.add(ramp);

    // Nesting Boxes with golden straw and eggs
    const strawMat = getCachedColorMaterial('#FACC15', 0.75);
    const nestBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.18, 0.45),
      getCachedColorMaterial('#9A3412', 0.8)
    );
    nestBox.position.set(0.65, 0.2, -0.75);
    const strawBed = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.12, 0.4),
      strawMat
    );
    strawBed.position.set(0.65, 0.26, -0.75);
    group.add(nestBox, strawBed);

    // Fresh White & Brown Eggs in nest
    const eggGeo = new THREE.SphereGeometry(0.055, 6, 6);
    const eggMatW = getCachedColorMaterial('#FFFFFF', 0.3);
    const eggMatB = getCachedColorMaterial('#FED7AA', 0.5);
    [
      [0.55, 0.34, -0.8, eggMatW],
      [0.72, 0.34, -0.72, eggMatB],
      [0.62, 0.34, -0.66, eggMatW]
    ].forEach(([ex, ey, ez, em]) => {
      const egg = new THREE.Mesh(eggGeo, em as THREE.Material);
      egg.position.set(ex as number, ey as number, ez as number);
      group.add(egg);
    });

    // Chicken Grain Feeder Tray with yellow corn scatter
    const feeder = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.2),
      getCachedColorMaterial('#78350F', 0.8)
    );
    feeder.position.set(0.2, 0.17, 0.4);
    const corn = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.06, 0.14),
      getCachedColorMaterial('#FDE047', 0.4)
    );
    corn.position.set(0.2, 0.22, 0.4);
    group.add(feeder, corn);

    // Stone Water Bowl
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, 0.1, 8),
      getCachedColorMaterial('#64748B', 0.85)
    );
    bowl.position.set(-0.15, 0.16, 0.6);
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.04, 8),
      getCachedColorMaterial('#38BDF8', 0.2, 0.5, true, 0.85)
    );
    water.position.set(-0.15, 0.2, 0.6);
    group.add(bowl, water);

  // ── 2. COW PASTURE ───────────────────────────────────────────────────
  } else if (configId === 'cow_pasture') {
    // Open Wooden Lean-To Barn Shelter
    const shelterWood = getCachedColorMaterial('#78350F', 0.8);
    const roofColor = '#9A3412';
    const sBeamGeo = new THREE.BoxGeometry(0.1, 1.2, 0.1);
    [
      [-1.2, -1.2], [-0.2, -1.2], [-1.2, -0.2], [-0.2, -0.2]
    ].forEach(([bx, bz]) => {
      const beam = new THREE.Mesh(sBeamGeo, shelterWood);
      beam.position.set(bx, 0.7, bz);
      beam.castShadow = true;
      group.add(beam);
    });

    // Shelter Plank Back Wall & Slanted Roof
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.0, 0.06),
      shelterWood
    );
    backWall.position.set(-0.7, 0.7, -1.2);
    const roofPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.08, 1.25),
      getCachedColorMaterial(roofColor, 0.7)
    );
    roofPanel.position.set(-0.7, 1.35, -0.7);
    roofPanel.rotation.x = 0.18;
    roofPanel.castShadow = true;
    group.add(backWall, roofPanel);

    // Large Timber Water Trough filled with sparkling water
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.35, 0.45),
      getCachedColorMaterial('#5C240E', 0.85)
    );
    trough.position.set(0.65, 0.25, -0.75);
    trough.castShadow = true;
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(0.88, 0.1, 0.35),
      getCachedColorMaterial('#38BDF8', 0.1, 0.6, true, 0.88)
    );
    water.position.set(0.65, 0.38, -0.75);
    group.add(trough, water);

    // Hay Feeder Rack overflowing with 3D straw
    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.35),
      getCachedColorMaterial('#B45309', 0.8)
    );
    rack.position.set(-0.7, 0.4, 0.4);
    const hay = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.4, 0.3),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    hay.position.set(-0.7, 0.6, 0.4);
    group.add(rack, hay);

    // Stainless Steel Milk Cans at the entrance gate
    const milkCanGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.38, 10);
    const milkCanMat = getCachedColorMaterial('#E2E8F0', 0.2, 0.85);
    const can1 = new THREE.Mesh(milkCanGeo, milkCanMat);
    can1.position.set(0.45, 0.28, 1.05);
    can1.castShadow = true;
    const can2 = new THREE.Mesh(milkCanGeo, milkCanMat);
    can2.position.set(0.75, 0.28, 1.15);
    can2.castShadow = true;
    group.add(can1, can2);

    // Mineral Salt Lick Stone on tree stump
    const stump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.25, 8),
      getCachedColorMaterial('#78350F', 0.9)
    );
    stump.position.set(0.7, 0.2, 0.1);
    const salt = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
      getCachedColorMaterial('#F87171', 0.5)
    );
    salt.position.set(0.7, 0.38, 0.1);
    group.add(stump, salt);

  // ── 3. PIG PEN ───────────────────────────────────────────────────────
  } else if (configId === 'pig_pen') {
    // Mud Wallow Bath (Glistening dark puddle with rock border)
    const mudGeo = new THREE.CylinderGeometry(0.9, 0.95, 0.05, 12);
    const mud = new THREE.Mesh(
      mudGeo,
      getCachedColorMaterial('#1C0D02', 0.2, 0.4)
    );
    mud.position.set(0.2, 0.13, 0.1);
    group.add(mud);

    // Wooden Pig Shelter Barn
    const hut = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.85, 1.0),
      getCachedColorMaterial('#9A3412', 0.75)
    );
    hut.position.set(-0.65, 0.55, -0.65);
    hut.castShadow = true;

    const hutRoof = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 1.15),
      getCachedColorMaterial('#451A03', 0.8)
    );
    hutRoof.position.set(-0.65, 1.02, -0.65);
    hutRoof.rotation.x = 0.15;
    group.add(hut, hutRoof);

    // Feed Trough with Apples, Pumpkins & Vegetables
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.25, 0.38),
      getCachedColorMaterial('#78350F', 0.85)
    );
    trough.position.set(0.65, 0.22, -0.75);
    trough.castShadow = true;

    const slop = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.12, 0.28),
      getCachedColorMaterial('#D97706', 0.5)
    );
    slop.position.set(0.65, 0.3, -0.75);
    group.add(trough, slop);

    // Golden Hay Bale in corner
    const bale = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.35, 0.65),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    bale.position.set(-0.8, 0.28, 0.75);
    bale.castShadow = true;
    group.add(bale);

  // ── 4. SHEEP / GOAT PEN ──────────────────────────────────────────────
  } else {
    // Rustic Stone & Timber Shelter
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 1.0),
      getCachedColorMaterial('#64748B', 0.85)
    );
    base.position.set(-0.65, 0.3, -0.65);

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.6, 0.95),
      getCachedColorMaterial('#B45309', 0.75)
    );
    walls.position.set(-0.65, 0.7, -0.65);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 1.15),
      getCachedColorMaterial('#78350F', 0.7)
    );
    roof.position.set(-0.65, 1.05, -0.65);
    roof.rotation.x = 0.15;
    group.add(base, walls, roof);

    // Hay Rack
    const hayRack = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.45, 0.3),
      getCachedColorMaterial('#FACC15', 0.8)
    );
    hayRack.position.set(0.65, 0.3, -0.75);
    group.add(hayRack);

    // Wicker Wool Basket with fluffy fleece
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.18, 0.25, 8),
      getCachedColorMaterial('#B45309', 0.8)
    );
    basket.position.set(0.65, 0.22, 0.65);
    const wool = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      getCachedColorMaterial('#F8FAFC', 0.9)
    );
    wool.position.set(0.65, 0.38, 0.65);
    group.add(basket, wool);
  }

  return group;
}

/**
 * Adorable Animated Low-Poly Animals (Chicken, Cow, Pig, Sheep)
 * userData on the returned group:
 *   animalType: string   — used by animation loop to dispatch correct anim
 *   walkDir: {x, z}     — current walk direction (unit vector)
 *   walkSpeed: number    — world units/sec
 *   walkTimer: number    — time until next direction change (sec)
 *   peckTimer: number    — countdown until next peck (sec, chicken only)
 *   isPecking: boolean   — true during peck dip (chicken only)
 *   peckPhase: number    — 0..1 peck animation progress
 *   penHalfSize: number  — half-size of pen to clamp movement inside
 */
export function createAnimalMesh(animalConfigId: string): THREE.Group {
  const group = new THREE.Group();

  if (animalConfigId === 'chicken') {
    // Cute Plump Yellow Chicken with bobbing comb, beak, and flapping wings
    const bodyGeo = new THREE.SphereGeometry(0.24, 10, 10);
    const bodyMat = getCachedColorMaterial('#FEF08A', 0.45);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.name = 'chicken_body';
    body.position.y = 0.24;
    body.castShadow = true;
    group.add(body);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.06, 0.14, 4);
    const beakMat = getCachedColorMaterial('#F97316', 0.4);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.name = 'chicken_beak';
    beak.position.set(0, 0.26, 0.24);
    beak.rotation.x = Math.PI / 2;
    group.add(beak);

    // Red Comb on head
    const combGeo = new THREE.BoxGeometry(0.04, 0.12, 0.14);
    const combMat = getCachedColorMaterial('#EF4444', 0.4);
    const comb = new THREE.Mesh(combGeo, combMat);
    comb.name = 'chicken_comb';
    comb.position.set(0, 0.46, 0.04);
    group.add(comb);

    // Cute Waddle
    const waddle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), combMat);
    waddle.position.set(0, 0.18, 0.2);
    group.add(waddle);

    // Cute Black Eyes
    const eyeMat = getCachedColorMaterial('#0F172A', 0.2);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeMat);
    eyeL.position.set(-0.12, 0.32, 0.16);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), eyeMat);
    eyeR.position.set(0.12, 0.32, 0.16);
    group.add(eyeL, eyeR);

    // Tiny Wings
    const wingGeo = new THREE.BoxGeometry(0.06, 0.16, 0.22);
    const wingL = new THREE.Mesh(wingGeo, bodyMat);
    wingL.name = 'chicken_wingL';
    wingL.position.set(-0.24, 0.24, 0);
    wingL.rotation.z = -0.2;
    const wingR = new THREE.Mesh(wingGeo, bodyMat);
    wingR.name = 'chicken_wingR';
    wingR.position.set(0.24, 0.24, 0);
    wingR.rotation.z = 0.2;
    group.add(wingL, wingR);

    // Little Orange Feet
    const footGeo = new THREE.BoxGeometry(0.06, 0.08, 0.1);
    const fL = new THREE.Mesh(footGeo, beakMat);
    fL.name = 'chicken_footL';
    fL.position.set(-0.1, 0.04, 0);
    const fR = new THREE.Mesh(footGeo, beakMat);
    fR.name = 'chicken_footR';
    fR.position.set(0.1, 0.04, 0);
    group.add(fL, fR);

  } else if (animalConfigId === 'cow') {
    // Spotted Dairy Cow with bell collar and floppy ears
    const bodyGeo = new THREE.BoxGeometry(0.75, 0.5, 0.44);
    const bodyMat = getCachedColorMaterial('#F8FAFC', 0.55);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Black Spots
    const spotMat = getCachedColorMaterial('#1E293B', 0.7);
    const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.46), spotMat);
    spot1.position.set(0.1, 0.52, 0);
    group.add(spot1);

    // Head with pink snout
    const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0.48, 0.65, 0);
    head.castShadow = true;
    group.add(head);

    const muzzleGeo = new THREE.BoxGeometry(0.2, 0.2, 0.32);
    const muzzleMat = getCachedColorMaterial('#FDA4AF', 0.5);
    const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
    muzzle.position.set(0.66, 0.58, 0);
    group.add(muzzle);

    // Tiny Horns & Floppy Ears
    const hornGeo = new THREE.ConeGeometry(0.04, 0.14, 4);
    const hornMat = getCachedColorMaterial('#FEF08A', 0.4);
    const hL = new THREE.Mesh(hornGeo, hornMat);
    hL.position.set(0.48, 0.88, -0.15);
    const hR = new THREE.Mesh(hornGeo, hornMat);
    hR.position.set(0.48, 0.88, 0.15);
    group.add(hL, hR);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6);
    const legMat = getCachedColorMaterial('#1E293B', 0.8);
    [[-0.28, -0.16], [-0.28, 0.16], [0.28, -0.16], [0.28, 0.16]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.18, lz);
      group.add(leg);
    });

  } else if (animalConfigId === 'pig') {
    // Chubby Pink Piggy with curly tail and snout
    const bodyGeo = new THREE.SphereGeometry(0.34, 10, 10);
    const bodyMat = getCachedColorMaterial('#FDA4AF', 0.5);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.35;
    body.castShadow = true;
    group.add(body);

    // Big Pig Snout
    const snoutGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);
    const snoutMat = getCachedColorMaterial('#F43F5E', 0.4);
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0.34, 0.34, 0);
    snout.rotation.z = -Math.PI / 2;
    group.add(snout);

    // Nostrils
    const nostrilMat = getCachedColorMaterial('#9F1239', 0.6);
    const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), nostrilMat);
    n1.position.set(0.4, 0.34, -0.04);
    const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), nostrilMat);
    n2.position.set(0.4, 0.34, 0.04);
    group.add(n1, n2);

    // Floppy Pink Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.14, 4);
    const eL = new THREE.Mesh(earGeo, bodyMat);
    eL.position.set(0.18, 0.54, -0.18);
    eL.rotation.x = -0.4;
    const eR = new THREE.Mesh(earGeo, bodyMat);
    eR.position.set(0.18, 0.54, 0.18);
    eR.rotation.x = 0.4;
    group.add(eL, eR);

    // 4 Tiny Stumpy Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 6);
    [[-0.18, -0.16], [-0.18, 0.16], [0.18, -0.16], [0.18, 0.16]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, bodyMat);
      leg.position.set(lx, 0.11, lz);
      group.add(leg);
    });

  } else {
    // Fluffy Cloud-like Sheep
    const bodyGeo = new THREE.SphereGeometry(0.38, 10, 10);
    const woolMat = getCachedColorMaterial('#F8FAFC', 0.9);
    const body = new THREE.Mesh(bodyGeo, woolMat);
    body.position.y = 0.38;
    body.castShadow = true;
    group.add(body);

    // Black Face & Ears
    const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const headMat = getCachedColorMaterial('#1E293B', 0.7);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.36, 0.48, 0);
    group.add(head);

    // 4 Dark Little Hooves
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6);
    [[-0.2, -0.16], [-0.2, 0.16], [0.2, -0.16], [0.2, 0.16]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, headMat);
      leg.position.set(lx, 0.12, lz);
      group.add(leg);
    });
  }

  // ── Animation userData for the render loop ──────────────────────────────
  const angle = Math.random() * Math.PI * 2;
  const speed = animalConfigId === 'chicken' ? 0.55 + Math.random() * 0.35
              : animalConfigId === 'pig'     ? 0.28 + Math.random() * 0.18
              : animalConfigId === 'cow'     ? 0.22 + Math.random() * 0.12
              :                                0.28 + Math.random() * 0.18;

  group.name = `animal_${animalConfigId}`;
  group.userData = {
    animalType:  animalConfigId,
    walkDir:     { x: Math.cos(angle), z: Math.sin(angle) },
    walkSpeed:   speed,
    walkTimer:   1.5 + Math.random() * 3.0,   // seconds until next direction change
    isIdle:      Math.random() < 0.3,          // start some animals idle
    idleTimer:   Math.random() * 2.0,          // idle duration
    peckTimer:   0.5 + Math.random() * 2.5,   // chicken: seconds until next peck
    isPecking:   false,
    peckPhase:   0,                            // 0..1 peck animation progress
    penHalfSize: 1.1,                          // half of 2.85 pen interior
  };

  return group;
}

// -------------------------------------------------------------
// 4. CROPS & 5-STAGE PLANT GROWTH
// -------------------------------------------------------------

export function createCropStageMesh(cropId: string, stage: 0 | 1 | 2 | 3 | 4, cropColor: string): THREE.Group {
  const group = new THREE.Group();

  // Stage 0: Moist dark soil mound with tiny green seed dots
  if (stage === 0) {
    const moundGeo = new THREE.BoxGeometry(0.75, 0.08, 0.75);
    const moundMat = getCachedColorMaterial('#3B1808', 0.95);
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.y = 0.05;
    group.add(mound);

    const dotMat = getCachedColorMaterial('#84CC16', 0.6);
    const dotGeo = new THREE.SphereGeometry(0.04, 4, 4);
    [-0.2, 0, 0.2].forEach(dx => {
      [-0.2, 0.2].forEach(dz => {
        const d = new THREE.Mesh(dotGeo, dotMat);
        d.position.set(dx, 0.1, dz);
        group.add(d);
      });
    });
    return group;
  }

  // Stage 1: Little bright green dual sprouts
  if (stage === 1) {
    const sproutMat = getCachedColorMaterial('#84CC16', 0.5);
    [-0.18, 0.18].forEach(sx => {
      const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5), sproutMat);
      sprout.position.set(sx, 0.13, 0);
      group.add(sprout);
    });
    return group;
  }

  // Stage 2: Tall growing vegetative stems
  if (stage === 2) {
    const stemMat = getCachedColorMaterial('#65A30D', 0.55);
    [-0.2, 0, 0.2].forEach(sx => {
      const stem = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 6), stemMat);
      stem.position.set(sx, 0.28, (Math.random() - 0.5) * 0.1);
      group.add(stem);
    });
    return group;
  }

  // Stage 3: Bushy budding plant with flower / unripe hints
  if (stage === 3) {
    const plantMat = getCachedColorMaterial('#4D7C0F', 0.6);
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 6), plantMat);
      p.position.set(((i % 2) - 0.5) * 0.35, 0.38, (Math.floor(i / 2) - 0.5) * 0.35);
      group.add(p);
    }
    return group;
  }

  // Stage 4: FULLY RIPE HARVEST-READY CROP (Distinctive 3D geometry for each crop!)
  if (cropId === 'wheat') {
    // Dense golden swaying wheat stalks with wheat heads
    const wheatMat = getCachedColorMaterial('#FBBF24', 0.5);
    const stalkGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.9, 5);
    const headGeo = new THREE.ConeGeometry(0.08, 0.35, 5);

    [
      [-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25],
      [0, -0.15], [0, 0.15], [-0.15, 0], [0.15, 0]
    ].forEach(([wx, wz]) => {
      const stalk = new THREE.Mesh(stalkGeo, wheatMat);
      stalk.position.set(wx, 0.45, wz);
      stalk.rotation.z = (wx > 0 ? 0.08 : -0.08);
      const head = new THREE.Mesh(headGeo, getCachedColorMaterial('#F59E0B', 0.4));
      head.position.set(wx, 0.95, wz);
      group.add(stalk, head);
    });

  } else if (cropId === 'corn') {
    // Tall green stalks with bright yellow cobs wrapped in green husks
    const cornMat = getCachedColorMaterial('#15803D', 0.6);
    const cobMat = getCachedColorMaterial('#FACC15', 0.3);

    [-0.2, 0.2].forEach(cx => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.2, 6), cornMat);
      stalk.position.set(cx, 0.6, 0);
      stalk.castShadow = true;
      const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 6), cobMat);
      cob.position.set(cx + 0.12, 0.75, 0);
      cob.rotation.z = 0.3;
      group.add(stalk, cob);
    });

  } else if (cropId === 'carrot') {
    // Feathery green tops with bright orange carrot shoulders popping up
    const greenMat = getCachedColorMaterial('#22C55E', 0.6);
    const orangeMat = getCachedColorMaterial('#F97316', 0.4);

    [-0.2, 0, 0.2].forEach(cx => {
      [-0.15, 0.15].forEach(cz => {
        const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), orangeMat);
        carrot.position.set(cx, 0.12, cz);
        carrot.rotation.x = Math.PI;
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 5), greenMat);
        top.position.set(cx, 0.35, cz);
        group.add(carrot, top);
      });
    });

  } else if (cropId === 'pumpkin') {
    // Plump orange ribbed pumpkins resting on broad leaves
    const pumpMat = getCachedColorMaterial('#EA580C', 0.4);
    const leafMat = getCachedColorMaterial('#166534', 0.7);

    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), leafMat);
    leaf.position.y = 0.08;
    group.add(leaf);

    const pump = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), pumpMat);
    pump.position.set(0, 0.35, 0);
    pump.scale.set(1.1, 0.8, 1.1);
    pump.castShadow = true;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 5), getCachedColorMaterial('#451A03', 0.8));
    stem.position.set(0, 0.65, 0);
    group.add(pump, stem);

  } else if (cropId === 'tomato') {
    // Trellis wooden stake with glossy red tomatoes
    const stakeMat = getCachedColorMaterial('#78350F', 0.8);
    const stake = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), stakeMat);
    stake.position.set(0, 0.55, 0);
    group.add(stake);

    const vineMat = getCachedColorMaterial('#15803D', 0.6);
    const vine = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 6), vineMat);
    vine.position.set(0, 0.5, 0);
    group.add(vine);

    const redMat = getCachedColorMaterial('#EF4444', 0.3);
    [
      [-0.18, 0.4, 0.15], [0.18, 0.6, 0.15], [-0.15, 0.7, -0.15], [0.15, 0.35, -0.15]
    ].forEach(([tx, ty, tz]) => {
      const tom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), redMat);
      tom.position.set(tx, ty, tz);
      group.add(tom);
    });

  } else if (cropId === 'cotton') {
    // Branching woody stems with puffy white cotton bolls
    const stemMat = getCachedColorMaterial('#78350F', 0.8);
    const cottonMat = getCachedColorMaterial('#FFFFFF', 0.9);

    const stem = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 6), stemMat);
    stem.position.set(0, 0.4, 0);
    group.add(stem);

    [
      [-0.15, 0.65, 0.1], [0.15, 0.75, -0.1], [0, 0.85, 0.15], [0.18, 0.55, 0.15]
    ].forEach(([cx, cy, cz]) => {
      const boll = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), cottonMat);
      boll.position.set(cx, cy, cz);
      group.add(boll);
    });

  } else {
    // Generic lush flowering crop
    const plantGeo = new THREE.ConeGeometry(0.36, 0.95, 6);
    const plantMat = getCachedColorMaterial('#65A30D', 0.6);
    const plant = new THREE.Mesh(plantGeo, plantMat);
    plant.position.y = 0.48;
    plant.castShadow = true;
    group.add(plant);

    const fruitGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const fruitMat = getCachedColorMaterial(cropColor, 0.4);
    const f1 = new THREE.Mesh(fruitGeo, fruitMat);
    f1.position.set(0.12, 0.85, 0);
    const f2 = new THREE.Mesh(fruitGeo, fruitMat);
    f2.position.set(-0.12, 0.75, 0.1);
    group.add(f1, f2);
  }

  return group;
}

// -------------------------------------------------------------
// 5. FRUIT TREES & BERRY BUSHES
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// 6. OBSTACLES & NATURAL CLEARABLES
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// 7. DECORATIONS
// -------------------------------------------------------------

export function createDecorationMesh(configId: string): THREE.Group {
  const group = new THREE.Group();

  if (configId.includes('fence')) {
    const isWhite = configId.includes('white');
    const fenceMat = getCachedColorMaterial(isWhite ? '#F8FAFC' : '#78350F', 0.7);

    // Cross Rails
    const railGeo = new THREE.BoxGeometry(0.95, 0.08, 0.05);
    const r1 = new THREE.Mesh(railGeo, fenceMat);
    r1.position.set(0, 0.25, 0);
    const r2 = new THREE.Mesh(railGeo, fenceMat);
    r2.position.set(0, 0.55, 0);

    // Fence Posts
    const postGeo = new THREE.BoxGeometry(0.12, 0.75, 0.12);
    const pL = new THREE.Mesh(postGeo, fenceMat);
    pL.position.set(-0.45, 0.375, 0);
    pL.castShadow = true;
    const pR = new THREE.Mesh(postGeo, fenceMat);
    pR.position.set(0.45, 0.375, 0);
    pR.castShadow = true;

    group.add(r1, r2, pL, pR);

  } else if (configId.includes('path')) {
    // Beautiful stylized interlocking cobblestone, wood, or dirt walkways
    const isStone = configId.includes('stone') || configId.includes('cobble');
    const isWood = configId.includes('wood') || configId.includes('plank');

    if (isStone) {
      // 1. Mortar Gravel Bed Base
      const mortarMat = getCachedColorMaterial('#57534E', 0.95);
      const baseBed = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.025, 0.98), mortarMat);
      baseBed.position.y = 0.0125;
      baseBed.receiveShadow = true;
      group.add(baseBed);

      // 2. Interlocking Faceted Cobblestones with organic color and height variation
      const stoneColors = ['#94A3B8', '#64748B', '#CBD5E1', '#78716C', '#475569'];
      const stones = [
        { x: -0.26, z: -0.26, sx: 0.38, sz: 0.38, rot: 0.1, cIdx: 0, h: 0.042 },
        { x: 0.22, z: -0.28, sx: 0.42, sz: 0.34, rot: -0.15, cIdx: 1, h: 0.046 },
        { x: -0.28, z: 0.22, sx: 0.34, sz: 0.42, rot: 0.2, cIdx: 2, h: 0.044 },
        { x: 0.24, z: 0.24, sx: 0.38, sz: 0.38, rot: -0.1, cIdx: 3, h: 0.048 },
        { x: 0.0, z: 0.0, sx: 0.30, sz: 0.30, rot: 0.35, cIdx: 4, h: 0.052 },
        { x: -0.02, z: -0.40, sx: 0.24, sz: 0.14, rot: 0.05, cIdx: 1, h: 0.038 },
        { x: 0.02, z: 0.40, sx: 0.24, sz: 0.14, rot: -0.05, cIdx: 0, h: 0.038 },
        { x: -0.40, z: -0.02, sx: 0.14, sz: 0.24, rot: 0.1, cIdx: 3, h: 0.038 },
        { x: 0.40, z: 0.02, sx: 0.14, sz: 0.24, rot: -0.1, cIdx: 2, h: 0.038 },
      ];

      stones.forEach(s => {
        const sMat = getCachedColorMaterial(stoneColors[s.cIdx], 0.75);
        const stoneMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), sMat);
        stoneMesh.position.set(s.x, s.h * 0.5, s.z);
        stoneMesh.scale.set(s.sx * 0.55, s.h, s.sz * 0.55);
        stoneMesh.rotation.set(0.05, s.rot, 0.03);
        stoneMesh.castShadow = true;
        stoneMesh.receiveShadow = true;
        group.add(stoneMesh);
      });

      // 3. Tiny Moss Tufts in Crevices
      const mossMat = getCachedColorMaterial('#4D7C0F', 0.95);
      [
        [-0.14, -0.12], [0.12, 0.14], [-0.12, 0.16]
      ].forEach(([mx, mz]) => {
        const moss = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.03, 5), mossMat);
        moss.position.set(mx, 0.035, mz);
        group.add(moss);
      });

    } else if (isWood) {
      // Rustic Timber Boardwalk Planks
      const woodMat = getCachedColorMaterial('#78350F', 0.85);
      const beamMat = getCachedColorMaterial('#451A03', 0.9);
      const nailMat = getCachedColorMaterial('#94A3B8', 0.3);

      // Under-support beams
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.08), beamMat);
      b1.position.set(0, 0.015, -0.32);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.03, 0.08), beamMat);
      b2.position.set(0, 0.015, 0.32);
      group.add(b1, b2);

      // 3 Cross Planks
      [-0.30, 0, 0.30].forEach((pz, idx) => {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.035, 0.26), woodMat);
        plank.position.set(0, 0.035, pz);
        plank.castShadow = true;
        plank.receiveShadow = true;
        group.add(plank);

        // Nail studs
        [-0.4, 0.4].forEach(nx => {
          const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 4), nailMat);
          nail.position.set(nx, 0.055, pz);
          group.add(nail);
        });
      });

    } else {
      // Smooth Packed Dirt / Sand Trail
      const dirtBaseMat = getCachedColorMaterial('#92400E', 0.95);
      const dirtSurfaceMat = getCachedColorMaterial('#B45309', 0.9);
      const baseBed = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.02, 0.96), dirtBaseMat);
      baseBed.position.y = 0.01;
      baseBed.receiveShadow = true;

      const surface = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.025, 8), dirtSurfaceMat);
      surface.position.y = 0.025;
      surface.receiveShadow = true;
      group.add(baseBed, surface);

      // Small pebbles
      const pebbleMat = getCachedColorMaterial('#78716C', 0.8);
      [
        [-0.22, 0.18, 0.06], [0.25, -0.22, 0.05], [0.12, 0.28, 0.04]
      ].forEach(([px, pz, ps]) => {
        const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(ps, 0), pebbleMat);
        pebble.position.set(px, 0.035, pz);
        group.add(pebble);
      });
    }

  } else if (configId.includes('fountain')) {
    // 2-tier Classical Stone Fountain with water cascade
    const stoneMat = getCachedColorMaterial('#CBD5E1', 0.6);
    const waterMat = getCachedColorMaterial('#38BDF8', 0.1, 0.8);

    const baseBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.35, 16), stoneMat);
    baseBasin.position.y = 0.175;
    baseBasin.castShadow = true;
    const baseWater = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.08, 16), waterMat);
    baseWater.position.y = 0.32;

    const tierPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.8, 8), stoneMat);
    tierPost.position.y = 0.6;
    const tierBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.2, 12), stoneMat);
    tierBasin.position.y = 0.9;
    tierBasin.castShadow = true;

    group.add(baseBasin, baseWater, tierPost, tierBasin);

  } else if (configId.includes('bench')) {
    // Wooden park bench with cast-iron legs
    const woodMat = getCachedColorMaterial('#9A3412', 0.7);
    const ironMat = getCachedColorMaterial('#1E293B', 0.8);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.35), woodMat);
    seat.position.set(0, 0.3, 0);
    seat.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.06), woodMat);
    back.position.set(0, 0.5, -0.16);

    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.35), ironMat);
    legL.position.set(-0.38, 0.15, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.35), ironMat);
    legR.position.set(0.38, 0.15, 0);

    group.add(seat, back, legL, legR);

  } else if (configId.includes('lamp') || configId.includes('lantern') || configId.includes('light')) {
    // Return high-quality Street Lamp Post with hanging vintage lantern, glowing bulb, halo sprite, PointLight & ground light pool
    return createStreetLampPostMesh();

  } else {
    // Flowerbed / potted topiary
    const potMat = getCachedColorMaterial('#B45309', 0.8);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.35, 8), potMat);
    pot.position.y = 0.175;
    pot.castShadow = true;

    const bushMat = getCachedColorMaterial('#166534', 0.6);
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), bushMat);
    bush.position.y = 0.5;
    bush.castShadow = true;

    const flwMat = getCachedColorMaterial('#EC4899', 0.4);
    const flw = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), flwMat);
    flw.position.set(0, 0.78, 0);

    group.add(pot, bush, flw);
  }

  return group;
}

/**
 * Country Street Lamp Post with hanging vintage lantern, halo, real PointLight and bright ground pool
 */
export function createStreetLampPostMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'road_street_lamp';

  const ironMat = getCachedColorMaterial('#0F172A', 0.5, 0.85);
  const woodMat = getCachedColorMaterial('#5C2E0B', 0.85);
  const lanternGlassMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: new THREE.Color(0xF59E0B),
    emissiveIntensity: 1.5,
    roughness: 0.1,
  });

  // Base Iron Footing
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 0.35, 8), ironMat);
  base.position.y = 0.175;
  base.castShadow = true;

  // Main Timber Mast (3.1m tall)
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.0, 8), woodMat);
  pole.position.y = 1.65;
  pole.castShadow = true;

  // Top Finial
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 8), ironMat);
  finial.position.y = 3.25;

  // Forged Iron Curved Bracket Arm (extends 1.15m over road)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.08), ironMat);
  arm.position.set(0.55, 3.05, 0);

  const brace = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.06), ironMat);
  brace.position.set(0.35, 2.75, 0);
  brace.rotation.z = Math.PI / 4;

  // Hanging Vintage Lantern Housing
  const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), ironMat);
  hanger.position.set(1.15, 2.92, 0);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.18, 6), ironMat);
  cap.position.set(1.15, 2.82, 0);

  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.38, 6), lanternGlassMat);
  lantern.name = 'lantern_glow';
  lantern.position.set(1.15, 2.55, 0);

  // Glowing Filament Bulb Core
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xFFFBEB })
  );
  bulb.position.set(1.15, 2.55, 0);

  // Warm Ambient Halo Sprite on the lantern itself
  const haloMat = new THREE.SpriteMaterial({
    map: getLampHaloTexture(),
    color: 0xFEF08A,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const haloSprite = new THREE.Sprite(haloMat);
  haloSprite.name = 'lamp_glow_sprite';
  haloSprite.scale.set(1.6, 1.6, 1.6);
  haloSprite.position.set(1.15, 2.55, 0);

  // Real Dynamic THREE.PointLight for rich real-time world lighting
  const pointLight = new THREE.PointLight(0xFDE047, 3.2, 10.5, 1.2);
  pointLight.name = 'lamp_point_light';
  pointLight.position.set(1.15, 2.55, 0);

  // Vivid Glowing Ground Light Pool (covers full road width with high vibrancy)
  const groundLightGeo = new THREE.PlaneGeometry(5.8, 5.8);
  const groundLightMat = new THREE.MeshBasicMaterial({
    map: getSoftLightPoolTexture(),
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const groundLight = new THREE.Mesh(groundLightGeo, groundLightMat);
  groundLight.name = 'lamp_light_cone';
  groundLight.rotation.x = -Math.PI / 2;
  groundLight.position.set(1.15, 0.04, 0);

  group.add(base, pole, finial, arm, brace, hanger, cap, lantern, bulb, haloSprite, pointLight, groundLight);
  return group;
}

/**
 * Detailed 3D Animated Farm Bird
 * Aerodynamic rounded body, cute head with beak and eyes, tailored tail,
 * and articulated left/right wings with shoulder pivots for silky smooth flapping/gliding animations.
 */
export function createAnimatedBirdGroup(color: string, accentColor: string, beakColor = '#F59E0B'): THREE.Group {
  const bird = new THREE.Group();
  bird.name = 'animated_bird';

  // Body
  const bodyGeo = new THREE.ConeGeometry(0.16, 0.52, 6);
  const bodyMat = getCachedColorMaterial(color, 0.5);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  bird.add(body);

  // Rounded chest/breast
  const breastGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const breast = new THREE.Mesh(breastGeo, bodyMat);
  breast.position.set(0, -0.02, 0.12);
  bird.add(breast);

  // Head
  const headGeo = new THREE.SphereGeometry(0.12, 6, 6);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 0.09, 0.28);
  bird.add(head);

  // Beak
  const beakGeo = new THREE.ConeGeometry(0.04, 0.11, 4);
  const beakMat = getCachedColorMaterial(beakColor, 0.4);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.08, 0.38);
  bird.add(beak);

  // Eyes (dark shiny beads)
  const eyeMat = getCachedColorMaterial('#0F172A', 0.2, 0.8);
  const eyeGeo = new THREE.SphereGeometry(0.022, 4, 4);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.08, 0.11, 0.30);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.08, 0.11, 0.30);
  bird.add(eyeL, eyeR);

  // Tail
  const tailGeo = new THREE.BoxGeometry(0.14, 0.02, 0.26);
  const tailMat = getCachedColorMaterial(accentColor, 0.6);
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0, 0.03, -0.32);
  tail.rotation.x = 0.12;
  bird.add(tail);

  // Left Wing with shoulder pivot (wing extends outwards from pivot)
  const wingGeo = new THREE.BoxGeometry(0.42, 0.02, 0.24);
  wingGeo.translate(-0.21, 0, 0); // pivot at shoulder
  const wingMat = getCachedColorMaterial(accentColor, 0.6);

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.name = 'wing_left';
  leftWing.position.set(-0.08, 0.06, 0.06);
  leftWing.castShadow = true;
  bird.add(leftWing);

  // Right Wing with shoulder pivot
  const rightWingGeo = new THREE.BoxGeometry(0.42, 0.02, 0.24);
  rightWingGeo.translate(0.21, 0, 0); // pivot at shoulder
  const rightWing = new THREE.Mesh(rightWingGeo, wingMat);
  rightWing.name = 'wing_right';
  rightWing.position.set(0.08, 0.06, 0.06);
  rightWing.castShadow = true;
  bird.add(rightWing);

  return bird;
}

