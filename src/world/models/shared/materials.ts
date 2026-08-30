import * as THREE from 'three';

// Caching materials and geometries for smooth 60 FPS rendering
const materialCache = new Map<string, THREE.Material>();

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
export function getSoftLightPoolTexture(): THREE.CanvasTexture {
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
export function getHeadlightGroundTexture(): THREE.CanvasTexture {
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
export function getLampHaloTexture(): THREE.CanvasTexture {
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
