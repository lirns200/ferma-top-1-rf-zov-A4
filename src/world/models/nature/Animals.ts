import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

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
