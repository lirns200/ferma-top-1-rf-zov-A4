import * as THREE from 'three';
import {
  getCachedColorMaterial,
  getLampHaloTexture,
  getSoftLightPoolTexture,
} from '../shared/materials';

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
