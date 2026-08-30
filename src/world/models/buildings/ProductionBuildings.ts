import * as THREE from 'three';
import { getCachedColorMaterial } from '../shared/materials';

/**
 * Detailed 3D Craft & Production Workshop Buildings
 * (Bakery, Feed Mill windmill, Dairy Creamery, Sugar Mill, BBQ Grill, Popcorn Pot, Pie Oven, Loom, Juice Press)
 */
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
