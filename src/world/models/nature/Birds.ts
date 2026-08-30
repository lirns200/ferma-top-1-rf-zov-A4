import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

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
