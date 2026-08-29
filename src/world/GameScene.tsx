import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../game/gameState';
import { CROPS, TREES_BUSHES } from '../config/crops';
import { BUILDINGS } from '../config/buildings';
import { DECORATIONS } from '../config/decorations';
import { SEASONS_INFO } from '../config/events';
import { 
  createFarmhouseGroup, 
  createSiloGroup, 
  createBarnGroup, 
  createOrderBoardGroup,
  createRoadsideShopGroup,
  createFishingDockGroup,
  createProductionBuildingGroup, 
  createAnimalPenGroup, 
  createAnimalMesh, 
  createCropStageMesh, 
  createTreeBushMesh, 
  createObstacleMesh, 
  createDecorationMesh,
  createMountainTunnelGroup,
  createMountainWaterfallGroup,
  createWindingRiverMesh,
  createStylizedDeliveryTruck,
  createStylizedCargoSemiTruck,
  createStreetLampPostMesh,
  getCachedColorMaterial
} from './ModelGenerators';
import { createLandscapeDetailGroup } from './LandscapeDetails';
import { sounds } from '../audio/SoundManager';

export const GameScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    entities,
    expansions,
    selectedEntityId,
    activeTool,
    placingBuildingConfigId,
    placingRotation,
    activeSeason,
    activeEvent,
    truckState,
    cargoTruckState,
    claimCargoTruckUnload,
    setSelectedEntity,
    plantCrop,
    harvestCrop,
    harvestTreeBush,
    feedAnimal,
    collectAnimalProduct,
    collectProduct,
    clearObstacle,
    openModal,
    isAreaAvailable,
    isAreaInsideUnlockedTerritory,
    placeBuilding,
    unlockExpansionChunk,
    movingEntityId,
    movingPos,
    movingRotation,
    setPlacingBuilding,
    rotatePlacingBuilding,
    startMovingEntity,
    setMovingPos,
    confirmMoveEntity,
    cancelMoveEntity,
    rotateMovingEntity,
  } = useGameStore();

  // Smooth Camera Coordinates & Target
  const targetCamPosRef = useRef({ x: 0, z: 1 });
  const currentCamPosRef = useRef({ x: 0, z: 1 });
  const targetZoomRef = useRef(19);
  const currentZoomRef = useRef(19);

  // Dragging & Interaction memory
  const isDraggingRef = useRef(false);
  const dragStartScreenRef = useRef({ x: 0, y: 0 });
  const dragStartCamRef = useRef({ x: 0, z: 1 });
  const hasMovedRef = useRef(false);
  const touchDistanceRef = useRef<number | null>(null);

  // Hovered Tile Ref (avoids triggering React re-renders on mouse move!)
  const hoveredTileRef = useRef<{ x: number; z: number } | null>(null);

  // Swipe Tool memory to avoid duplicate triggers
  const swipedEntitiesRef = useRef<Set<string>>(new Set());

  // Store Refs for 60fps render loop
  const truckStateRef = useRef(truckState);
  truckStateRef.current = truckState;

  const placingRef = useRef({ configId: placingBuildingConfigId, rotation: placingRotation });
  placingRef.current = { configId: placingBuildingConfigId, rotation: placingRotation };

  const movingRef = useRef({ id: movingEntityId, pos: movingPos, rot: movingRotation });
  movingRef.current = { id: movingEntityId, pos: movingPos, rot: movingRotation };
  const longPressTimerRef = useRef<number | null>(null);

  // AFK & Activity tracking for idle cloud spawner
  const lastActivityTimeRef = useRef<number>(performance.now());

  const activeSeasonRef = useRef(activeSeason);
  activeSeasonRef.current = activeSeason;

  const activeEventRef = useRef(activeEvent);
  activeEventRef.current = activeEvent;

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const entitiesGroupRef = useRef<THREE.Group | null>(null);
  const terrainGroupRef = useRef<THREE.Group | null>(null);
  const previewGridGroupRef = useRef<THREE.Group | null>(null);
  const truckGroupRef = useRef<THREE.Group | null>(null);
  const cargoTruckGroupRef = useRef<THREE.Group | null>(null);
  const cargoTruckStateRef = useRef(cargoTruckState);
  cargoTruckStateRef.current = cargoTruckState;

  // Ground Plane Raycast function
  const getGroundIntersectionFromScreen = useCallback((screenX: number, screenY: number): { x: number; z: number } | null => {
    if (!canvasRef.current || !cameraRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((screenY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(groundPlane, target);

    if (hit) {
      return { x: hit.x, z: hit.z };
    }
    return null;
  }, []);

  const getTileIntersection = useCallback((screenX: number, screenY: number): { x: number; z: number } | null => {
    const pt = getGroundIntersectionFromScreen(screenX, screenY);
    if (pt) {
      return {
        x: Math.floor(pt.x),
        z: Math.floor(pt.z),
      };
    }
    return null;
  }, [getGroundIntersectionFromScreen]);

  // -------------------------------------------------------------------
  // 1. INITIALIZE THREE.JS SCENE ONCE ON MOUNT
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyBg = activeSeason === 'winter' ? '#E0F2FE' : activeSeason === 'autumn' ? '#FED7AA' : '#BAE6FD';
    scene.background = new THREE.Color(skyBg);
    scene.fog = new THREE.FogExp2(skyBg, 0.006);

    // 2. Isometric Camera
    const aspect = width / height;
    const d = currentZoomRef.current;
    const camera = new THREE.OrthographicCamera(
      -d * aspect, d * aspect, d, -d, 1, 1000
    );
    const camAngleOffset = 26;
    const camHeight = 30;
    camera.position.set(
      currentCamPosRef.current.x + camAngleOffset,
      camHeight,
      currentCamPosRef.current.z + camAngleOffset
    );
    camera.lookAt(currentCamPosRef.current.x, 0, currentCamPosRef.current.z);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(
      activeSeason === 'winter' ? '#E2E8F0' : '#FEF3C7',
      0.95
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#FFFBEB', 1.35);
    sunLight.position.set(38, 55, 28);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 170;
    const sCam = 42;
    sunLight.shadow.camera.left = -sCam;
    sunLight.shadow.camera.right = sCam;
    sunLight.shadow.camera.top = sCam;
    sunLight.shadow.camera.bottom = -sCam;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight('#93C5FD', 0.4);
    fillLight.position.set(-25, 25, -25);
    scene.add(fillLight);

    // Glowing Night Fireflies (active during night hours)
    const firefliesCount = 28;
    const firefliesGeo = new THREE.BufferGeometry();
    const firefliesPos = new Float32Array(firefliesCount * 3);
    for (let f = 0; f < firefliesCount; f++) {
      firefliesPos[f * 3] = (Math.random() - 0.5) * 44;
      firefliesPos[f * 3 + 1] = 0.4 + Math.random() * 2.2;
      firefliesPos[f * 3 + 2] = (Math.random() - 0.5) * 44;
    }
    firefliesGeo.setAttribute('position', new THREE.BufferAttribute(firefliesPos, 3));
    const firefliesMat = new THREE.PointsMaterial({
      color: 0xFDE047,
      size: 0.28,
      transparent: true,
      opacity: 0.0,
    });
    const firefliesPoints = new THREE.Points(firefliesGeo, firefliesMat);
    scene.add(firefliesPoints);

    // 5. Terrain Group
    const terrainGroup = new THREE.Group();
    terrainGroupRef.current = terrainGroup;
    scene.add(terrainGroup);

    // 6. Volumetric 3D Sky Clouds & Synchronized Ground Shadows
    const skyCloudsGroup = new THREE.Group();
    skyCloudsGroup.name = 'sky_clouds_group';
    scene.add(skyCloudsGroup);

    const cloudShadowsGroup = new THREE.Group();
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0F172A,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    scene.add(cloudShadowsGroup);

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.94,
    });

    const create3DPuffyCloudMesh = (scaleX: number, scaleY: number, scaleZ: number) => {
      const cGroup = new THREE.Group();
      cGroup.name = 'sky_cloud';
      const puffGeo = new THREE.DodecahedronGeometry(1.0, 1);
      const puffs = [
        { x: 0, y: 0, z: 0, s: 1.1 },
        { x: 0.95, y: -0.15, z: 0.2, s: 0.85 },
        { x: -0.95, y: -0.2, z: -0.15, s: 0.8 },
        { x: 0.45, y: 0.45, z: -0.25, s: 0.75 },
        { x: -0.45, y: 0.4, z: 0.25, s: 0.7 },
        { x: 1.5, y: -0.3, z: 0, s: 0.6 },
        { x: -1.45, y: -0.35, z: 0.1, s: 0.6 },
      ];
      puffs.forEach(p => {
        const mesh = new THREE.Mesh(puffGeo, cloudMat);
        mesh.position.set(p.x * scaleX * 0.45, p.y * scaleY * 0.45, p.z * scaleZ * 0.45);
        mesh.scale.set(p.s * scaleX * 0.45, p.s * scaleY * 0.45, p.s * scaleZ * 0.45);
        mesh.castShadow = true;
        cGroup.add(mesh);
      });
      return cGroup;
    };

    const cloudsConfigData = [
      { x: -36, y: 22, z: -18, scaleX: 7.5, scaleY: 2.4, scaleZ: 5.0, speed: 0.75 },
      { x: -18, y: 25, z: 6, scaleX: 9.0, scaleY: 2.8, scaleZ: 6.0, speed: 0.85 },
      { x: 4, y: 23, z: -20, scaleX: 6.5, scaleY: 2.2, scaleZ: 4.5, speed: 0.7 },
      { x: 22, y: 26, z: -4, scaleX: 8.5, scaleY: 2.7, scaleZ: 5.5, speed: 0.8 },
      { x: 38, y: 24, z: 14, scaleX: 7.2, scaleY: 2.4, scaleZ: 5.0, speed: 0.75 },
      { x: -8, y: 27, z: 24, scaleX: 8.0, scaleY: 2.5, scaleZ: 5.2, speed: 0.7 },
      { x: -45, y: 23, z: 10, scaleX: 7.0, scaleY: 2.3, scaleZ: 4.8, speed: 0.8 },
    ];

    interface CloudPair {
      cloud3D: THREE.Group;
      shadow: THREE.Group;
      speed: number;
      initialY: number;
      isFlying: boolean;
    }

    const activeCloudPairs: CloudPair[] = [];

    cloudsConfigData.forEach((cs) => {
      // 3D Puffy Sky Cloud (starts hidden/dormant on standby)
      const cloud3D = create3DPuffyCloudMesh(cs.scaleX, cs.scaleY, cs.scaleZ);
      cloud3D.position.set(-999, cs.y, cs.z);
      cloud3D.visible = false;
      skyCloudsGroup.add(cloud3D);

      // Ground Soft Shadow
      const shadowGroup = new THREE.Group();
      shadowGroup.position.set(-999, 0.035, cs.z);
      shadowGroup.visible = false;
      const cGeo1 = new THREE.CircleGeometry(cs.scaleX * 0.45, 16);
      const cGeo2 = new THREE.CircleGeometry(cs.scaleX * 0.35, 16);
      const cGeo3 = new THREE.CircleGeometry(cs.scaleX * 0.30, 16);
      const m1 = new THREE.Mesh(cGeo1, shadowMat);
      m1.rotation.x = -Math.PI / 2;
      const m2 = new THREE.Mesh(cGeo2, shadowMat);
      m2.rotation.x = -Math.PI / 2;
      m2.position.set(cs.scaleX * 0.28, 0, cs.scaleZ * 0.15);
      const m3 = new THREE.Mesh(cGeo3, shadowMat);
      m3.rotation.x = -Math.PI / 2;
      m3.position.set(-cs.scaleX * 0.25, 0, -cs.scaleZ * 0.12);
      shadowGroup.add(m1, m2, m3);
      cloudShadowsGroup.add(shadowGroup);

      activeCloudPairs.push({
        cloud3D,
        shadow: shadowGroup,
        speed: cs.speed,
        initialY: cs.y,
        isFlying: false,
      });
    });

    // 7. Lightning Bolt & Ground Impact Container
    const lightningGroup = new THREE.Group();
    lightningGroup.name = 'lightning_bolts_group';
    scene.add(lightningGroup);

    // 8. Ground Splash Ripples for Rain
    const splashRipplesGroup = new THREE.Group();
    splashRipplesGroup.name = 'rain_splash_ripples';
    scene.add(splashRipplesGroup);

    const splashRingGeo = new THREE.RingGeometry(0.08, 0.35, 10);
    splashRingGeo.rotateX(-Math.PI / 2);
    const splashRingMat = new THREE.MeshBasicMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const splashRingsCount = 24;
    const splashRings: Array<{ mesh: THREE.Mesh; life: number; maxLife: number }> = [];
    for (let r = 0; r < splashRingsCount; r++) {
      const ring = new THREE.Mesh(splashRingGeo, splashRingMat.clone());
      ring.position.set((Math.random() - 0.5) * 55, 0.04, (Math.random() - 0.5) * 55);
      ring.visible = false;
      splashRipplesGroup.add(ring);
      splashRings.push({ mesh: ring, life: 0, maxLife: 0.4 + Math.random() * 0.3 });
    }

    // 9. Entities Group
    const entitiesGroup = new THREE.Group();
    entitiesGroupRef.current = entitiesGroup;
    scene.add(entitiesGroup);

    // 10. Preview Grid Group
    const previewGridGroup = new THREE.Group();
    previewGridGroupRef.current = previewGridGroup;
    scene.add(previewGridGroup);

    // 11. Stylized Farm Delivery Truck (Наша машинка - паркуется в Заезде 2)
    const truckGroup = createStylizedDeliveryTruck();
    truckGroupRef.current = truckGroup;
    truckGroup.position.set(3.2, 0.05, -4.5);
    truckGroup.rotation.y = -1.16;
    scene.add(truckGroup);

    // 12. Stylized Heavy Cargo Semi-Truck (Фура для бартера/обмена/посылок - паркуется в Заезде 1)
    const cargoTruckGroup = createStylizedCargoSemiTruck();
    cargoTruckGroupRef.current = cargoTruckGroup;
    cargoTruckGroup.position.set(-7.0, 0.05, -3.2);
    cargoTruckGroup.rotation.y = -1.35;
    cargoTruckGroup.visible = false;
    scene.add(cargoTruckGroup);

    // 13. High-Density Atmospheric & Rain Particle System
    const particleCount = 360;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 65;
      particlePositions[i * 3 + 1] = Math.random() * 26;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 65;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93C5FD,
      size: 0.32,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── Delivery Circuit Curves (Pickup Truck - Driveway 2) ───────────────
    // Reversing Out: backs up along Driveway 2 and swings rear left onto road
    const pickupReverseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.2, 0.05, -4.5),   // 0. Parked in Driveway 2
      new THREE.Vector3(2.2, 0.05, -6.8),   // 1. Reversing up Driveway 2 curve
      new THREE.Vector3(1.0, 0.05, -8.8),   // 2. Reversing onto road
      new THREE.Vector3(-0.6, 0.05, -8.8),  // 3. Swung rear left onto road
    ]);

    // Forward drive: accelerates eastward across bridge into East Mountain Tunnel
    const pickupForwardCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 0.05, -8.8),  // 0. Junction on road
      new THREE.Vector3(4.0, 0.05, -8.8),   // 1. Accelerating along road
      new THREE.Vector3(9.6, 0.05, -9.0),   // 2. Entrance to wooden bridge
      new THREE.Vector3(16.0, 0.22, -9.0),  // 3. Middle crest of wooden bridge
      new THREE.Vector3(22.4, 0.05, -9.0),  // 4. Bridge exit onto east bank
      new THREE.Vector3(26.0, 0.05, -8.5),  // 5. East bank road bend
      new THREE.Vector3(30.0, 0.05, -7.2),  // 6. Road curving towards mountain
      new THREE.Vector3(32.2, 0.05, -6.2),  // 7. East Mountain Tunnel portal
      new THREE.Vector3(35.5, 0.05, -4.8),  // 8. Deep inside mountain cave (vanished)
    ]);

    // Return journey: emerging from West Mountain Tunnel back down to Driveway 2!
    const returnDeliveryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-33.5, 0.05, -10.0),  // 0. Inside West Mountain Cave (vanished)
      new THREE.Vector3(-29.2, 0.05, -10.15), // 1. Emerging from West Mountain Tunnel portal
      new THREE.Vector3(-23.0, 0.05, -10.4),  // 2. Road along country fence
      new THREE.Vector3(-15.0, 0.05, -9.4),   // 3. Approaching farm road
      new THREE.Vector3(-7.0, 0.05, -9.1),    // 4. Passing mailbox & Driveway 1
      new THREE.Vector3(0.5, 0.05, -8.7),     // 5. Slowing down near Driveway 2
      new THREE.Vector3(2.2, 0.05, -6.8),     // 6. Turning into Driveway 2
      new THREE.Vector3(3.2, 0.05, -4.5),     // 7. Parked smoothly at home in Driveway 2
    ]);

    // ── Cargo Semi-Truck Circuit Curves (Фура - Driveway 1) ──────────────
    // Inbound: from West Mountain Tunnel into Driveway 1
    const cargoInboundCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-33.5, 0.05, -10.0),  // 0. Emerging from West Tunnel
      new THREE.Vector3(-26.0, 0.05, -10.3),  // 1. Approaching farm along road
      new THREE.Vector3(-14.0, 0.05, -9.4),   // 2. Slowing down near mailbox
      new THREE.Vector3(-7.8, 0.05, -9.1),    // 3. Turning into Driveway 1
      new THREE.Vector3(-7.5, 0.05, -6.8),    // 4. Along Driveway 1 curve
      new THREE.Vector3(-7.0, 0.05, -3.2),    // 5. Parked in Driveway 1 unloading bay
    ]);

    // Reversing Out: backs up along Driveway 1 and swings rear left onto road
    const cargoReverseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7.0, 0.05, -3.2),   // 0. Unloading bay
      new THREE.Vector3(-7.5, 0.05, -6.8),   // 1. Reversing up Driveway 1
      new THREE.Vector3(-7.8, 0.05, -9.1),   // 2. Reversing onto road
      new THREE.Vector3(-11.0, 0.05, -9.0),  // 3. Swung rear left onto road
    ]);

    // Forward drive: accelerates eastward across bridge into East Mountain Tunnel
    const cargoForwardCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-11.0, 0.05, -9.0),  // 0. Road junction
      new THREE.Vector3(-5.0, 0.05, -9.0),   // 1. Accelerating along road
      new THREE.Vector3(1.0, 0.05, -8.8),    // 2. Passing market & Driveway 2
      new THREE.Vector3(9.6, 0.05, -9.0),    // 3. Approach bridge
      new THREE.Vector3(16.0, 0.22, -9.0),   // 4. Crossing wooden bridge
      new THREE.Vector3(22.4, 0.05, -9.0),   // 5. Bridge exit onto east bank
      new THREE.Vector3(26.0, 0.05, -8.5),   // 6. East bank road bend
      new THREE.Vector3(32.2, 0.05, -6.2),   // 7. East Mountain Tunnel portal
      new THREE.Vector3(35.5, 0.05, -4.8),   // 8. Deep inside mountain cave (vanished)
    ]);

    // ── 3D Procedural Branching Lightning Bolt Generator ─────────────────
    let lightningTimer = 2.5; // First strike in 2.5s when thunderstorm is active
    let isFlashing = false;
    let flashStartTime = 0;

    const triggerLightningStrike = (strikePos?: THREE.Vector3) => {
      // Pick random ground location (e.g. mountain peaks, river edges, or farm fields)
      const target = strikePos || new THREE.Vector3(
        (Math.random() - 0.5) * 44,
        0.1,
        (Math.random() - 0.5) * 40
      );

      const startPos = new THREE.Vector3(
        target.x + (Math.random() - 0.5) * 12,
        24 + Math.random() * 3,
        target.z + (Math.random() - 0.5) * 12
      );

      const boltSegments = 16;
      const points: THREE.Vector3[] = [startPos.clone()];
      const branchPoints: THREE.Vector3[][] = [];

      for (let s = 1; s <= boltSegments; s++) {
        const t = s / boltSegments;
        const ideal = startPos.clone().lerp(target, t);
        const jitter = (1 - t) * 2.4 + 0.6;
        const next = new THREE.Vector3(
          ideal.x + (Math.random() - 0.5) * jitter,
          ideal.y,
          ideal.z + (Math.random() - 0.5) * jitter
        );
        if (s === boltSegments) {
          next.copy(target);
        }
        points.push(next);

        // Branch fork chance at 35% and 65% height
        if ((s === 5 || s === 11) && Math.random() > 0.25) {
          const branch: THREE.Vector3[] = [next.clone()];
          let bCur = next.clone();
          const branchDir = new THREE.Vector3(
            (Math.random() - 0.5) * 5.0,
            -3.0 - Math.random() * 2.5,
            (Math.random() - 0.5) * 5.0
          );
          for (let bs = 1; bs <= 5; bs++) {
            bCur = bCur.clone().add(branchDir.clone().multiplyScalar(0.2)).add(
              new THREE.Vector3((Math.random() - 0.5) * 0.9, -0.7, (Math.random() - 0.5) * 0.9)
            );
            branch.push(bCur);
          }
          branchPoints.push(branch);
        }
      }

      // Build 3D glowing lines
      const boltGeo = new THREE.BufferGeometry().setFromPoints(points);
      const boltMat = new THREE.LineBasicMaterial({
        color: 0xF0F9FF,
        linewidth: 3,
        transparent: true,
        opacity: 1.0,
      });
      const mainLine = new THREE.Line(boltGeo, boltMat);
      lightningGroup.add(mainLine);

      // Add branches
      const branchLines: THREE.Line[] = [];
      branchPoints.forEach(bp => {
        const bGeo = new THREE.BufferGeometry().setFromPoints(bp);
        const bMat = new THREE.LineBasicMaterial({
          color: 0x93C5FD,
          linewidth: 2,
          transparent: true,
          opacity: 0.9,
        });
        const bLine = new THREE.Line(bGeo, bMat);
        lightningGroup.add(bLine);
        branchLines.push(bLine);
      });

      // Ground Impact Flash Ring
      const impactRingGeo = new THREE.RingGeometry(0.3, 2.2, 16);
      impactRingGeo.rotateX(-Math.PI / 2);
      const impactRingMat = new THREE.MeshBasicMaterial({
        color: 0x60A5FA,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const impactMesh = new THREE.Mesh(impactRingGeo, impactRingMat);
      impactMesh.position.set(target.x, target.y + 0.05, target.z);
      lightningGroup.add(impactMesh);

      // Play Sound
      sounds.playThunder();

      // Trigger Flash state
      isFlashing = true;
      flashStartTime = clock.getElapsedTime();

      // Remove bolt after 250ms
      setTimeout(() => {
        lightningGroup.remove(mainLine);
        branchLines.forEach(b => lightningGroup.remove(b));
        lightningGroup.remove(impactMesh);
        boltGeo.dispose();
        boltMat.dispose();
      }, 260);
    };

    // AFK Cloud Spawner timer
    let cloudSpawnTimer = 0.8;
    const tempWindObj = new THREE.Object3D();

    // 10. ANIMATION LOOP (Smooth 60/120 FPS)
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Camera Damping (Lerp)
      currentCamPosRef.current.x += (targetCamPosRef.current.x - currentCamPosRef.current.x) * 0.25;
      currentCamPosRef.current.z += (targetCamPosRef.current.z - currentCamPosRef.current.z) * 0.25;
      currentZoomRef.current += (targetZoomRef.current - currentZoomRef.current) * 0.25;

      const dZoom = currentZoomRef.current;
      const curAspect = (containerRef.current ? containerRef.current.clientWidth / containerRef.current.clientHeight : 1);
      camera.left = -dZoom * curAspect;
      camera.right = dZoom * curAspect;
      camera.top = dZoom;
      camera.bottom = -dZoom;
      camera.updateProjectionMatrix();

      camera.position.set(
        currentCamPosRef.current.x + camAngleOffset,
        camHeight,
        currentCamPosRef.current.z + camAngleOffset
      );
      camera.lookAt(currentCamPosRef.current.x, 0, currentCamPosRef.current.z);

      // ── Dynamic Flowing River Waves with Edge Falloff (zero bank clipping) ─────
      const waterMesh = scene.getObjectByName('river_water') as THREE.Mesh;
      if (waterMesh && waterMesh.geometry) {
        const posAttr = waterMesh.geometry.attributes.position;
        const vArr = posAttr.array as Float32Array;
        const count = posAttr.count;
        const numCross = 12;
        const stride = numCross + 1;

        for (let i = 0; i < count; i++) {
          const c = i % stride;
          const vx = vArr[i * 3];
          const vz = vArr[i * 3 + 2];
          // Edge damping factor: 0 at shorelines, 1 in the middle
          const edgeDamp = Math.sin((c / numCross) * Math.PI);

          // Smooth traveling wave downstream (3.2 m/s):
          const flowPhase = (vz - elapsed * 3.6) * 0.85;
          const crossPhase = vx * 1.1;
          const wave = (Math.sin(flowPhase) * 0.038 + Math.sin(flowPhase * 1.8 + crossPhase) * 0.02) * edgeDamp;
          vArr[i * 3 + 1] = -0.06 + wave; // Stays cleanly at -0.06 at edges, rises gently in center
        }
        posAttr.needsUpdate = true;
        waterMesh.geometry.computeVertexNormals();
      }

      // ── Animate Mountain Waterfall Currents & Foam ────────────────────
      const wf1 = scene.getObjectByName('waterfall_foam_1');
      if (wf1) wf1.scale.y = 1 + Math.sin(elapsed * 14) * 0.15;
      const wf2 = scene.getObjectByName('waterfall_foam_2');
      if (wf2) wf2.scale.y = 1 + Math.sin(elapsed * 16 + 1.2) * 0.18;
      const c1 = scene.getObjectByName('waterfall_curtain_1');
      if (c1) c1.position.x = Math.sin(elapsed * 6) * 0.03;
      const c2 = scene.getObjectByName('waterfall_curtain_2');
      if (c2) c2.position.x = Math.cos(elapsed * 8) * 0.03;

      for (let r = 0; r < 3; r++) {
        const ring = scene.getObjectByName(`waterfall_foam_ring_${r}`) as THREE.Mesh;
        if (ring) {
          const phase = (elapsed * 1.4 + r * 0.33) % 1;
          ring.scale.set(0.75 + phase * 0.9, 0.75 + phase * 0.9, 1);
          const mat = ring.material as THREE.MeshStandardMaterial;
          if (mat) mat.opacity = 0.9 * (1 - phase);
        }
      }

      // ── Animate River Water Lilies, Moored Boat & Bobber ─────────────
      scene.traverse(obj => {
        if (obj.name === 'river_water_lily') {
          obj.position.y = -0.04 + Math.sin(elapsed * 2.2 + obj.position.x) * 0.012;
          obj.rotation.y = Math.sin(elapsed * 0.5 + obj.position.z) * 0.08;
        }
        if (obj.name === 'fishing_rowboat') {
          obj.position.y = -0.05 + Math.sin(elapsed * 2.4) * 0.015;
          obj.rotation.z = Math.sin(elapsed * 1.8) * 0.03;
          obj.rotation.x = Math.cos(elapsed * 1.5) * 0.02;
        }
        if (obj.name === 'fishing_bobber') {
          obj.position.y = 0.02 + Math.sin(elapsed * 3.0) * 0.012;
        }
        if (obj.name === 'mill_blades') {
          obj.rotation.z += delta * 1.6;
        }
        if (obj.name === 'bakery_fire_glow') {
          const s = 1 + Math.sin(elapsed * 8) * 0.12;
          obj.scale.set(s, s, s);
        }
      });

      const riverGlimmers = scene.getObjectByName('river_glimmers') as THREE.InstancedMesh | undefined;
      if (riverGlimmers) {
        const material = riverGlimmers.material as THREE.MeshBasicMaterial;
        material.opacity = 0.42 + Math.sin(elapsed * 1.8) * 0.2;
        riverGlimmers.position.z = Math.sin(elapsed * 0.35) * 0.16;
      }

      const butterflies = scene.getObjectByName('meadow_butterflies');
      if (butterflies) {
        butterflies.position.y = Math.sin(elapsed * 2.4) * 0.16;
        butterflies.rotation.y = Math.sin(elapsed * 0.45) * 0.08;
      }

      // Cloud Shadows Drift
      // ── Volumetric 3D Sky Clouds & Ground Shadows Drift ─────────────
      const curWeather = activeEventRef.current?.type || 'sunny';
      const curSeason = activeSeasonRef.current || 'summer';
      const isStrongWind = curWeather === 'windy' || curWeather === 'thunderstorm';
      const isRain = curWeather === 'rain' || curWeather === 'thunderstorm';
      const isSnow = curWeather === 'snow' || curSeason === 'winter';
      const isWind = curWeather === 'windy' || curSeason === 'autumn';
      const isFog = curWeather === 'fog';

      const cloudDriftSpeed = isStrongWind ? 3.6 : isRain ? 2.2 : 1.5;

      // Check if user is currently AFK / Idle (no input for > 3.5 seconds)
      const isAfk = (performance.now() - lastActivityTimeRef.current) > 3500;

      // When player is AFK / Idle, launch dormant standby clouds one by one
      if (isAfk) {
        cloudSpawnTimer -= delta;
        if (cloudSpawnTimer <= 0) {
          const dormantCloud = activeCloudPairs.find(c => !c.isFlying);
          if (dormantCloud) {
            dormantCloud.isFlying = true;
            const startX = -48 - Math.random() * 8;
            const startZ = (Math.random() - 0.5) * 44;
            dormantCloud.cloud3D.position.set(startX, dormantCloud.initialY, startZ);
            dormantCloud.shadow.position.set(startX, 0.035, startZ);
            dormantCloud.cloud3D.visible = true;
            dormantCloud.shadow.visible = true;
          }
          cloudSpawnTimer = 3.2 + Math.random() * 3.8;
        }
      }

      // Smoothly drift all currently flying clouds across the sky
      activeCloudPairs.forEach((pair, i) => {
        if (pair.isFlying) {
          pair.cloud3D.position.x += delta * pair.speed * cloudDriftSpeed;
          pair.cloud3D.position.z += delta * pair.speed * (cloudDriftSpeed * 0.35);
          pair.cloud3D.position.y = pair.initialY + Math.sin(elapsed * 0.8 + i * 1.2) * 0.35;

          pair.shadow.position.x = pair.cloud3D.position.x;
          pair.shadow.position.z = pair.cloud3D.position.z;

          // When cloud crosses the eastern edge / horizon (> 48), finish flight!
          if (pair.cloud3D.position.x > 48) {
            pair.isFlying = false;
            pair.cloud3D.visible = false;
            pair.shadow.visible = false;
            pair.cloud3D.position.set(-999, pair.initialY, 0);
            pair.shadow.position.set(-999, 0.035, 0);
          }
        }
      });

      // Dynamic Cloud Material Color & Mood
      if (cloudMat) {
        if (curWeather === 'thunderstorm') {
          cloudMat.color.setHex(0x1E293B); // Dark storm thunderheads
          cloudMat.opacity = 0.98;
          shadowMat.opacity = 0.32;
        } else if (curWeather === 'rain') {
          cloudMat.color.setHex(0x64748B); // Overcast gray-blue
          cloudMat.opacity = 0.95;
          shadowMat.opacity = 0.24;
        } else if (curWeather === 'snow') {
          cloudMat.color.setHex(0xE2E8F0); // Pale winter clouds
          cloudMat.opacity = 0.92;
          shadowMat.opacity = 0.12;
        } else if (curWeather === 'fog') {
          cloudMat.color.setHex(0xCBD5E1);
          cloudMat.opacity = 0.80;
          shadowMat.opacity = 0.08;
        } else {
          cloudMat.color.setHex(0xFFFFFF); // Fluffy bright summer clouds
          cloudMat.opacity = 0.94;
          shadowMat.opacity = 0.16;
        }
      }

      // ── Tree, Bush & Foliage Harmonic Wind Sway ───────────────────────
      const windSpeed = isStrongWind ? 5.2 : curWeather === 'rain' ? 3.4 : 2.2;
      const windIntensity = isStrongWind ? 0.16 : curWeather === 'rain' ? 0.10 : 0.07;

      scene.traverse(obj => {
        if (obj.name === 'tree_crown') {
          const wx = obj.parent ? (obj.parent.position.x || 0) : 0;
          const wz = obj.parent ? (obj.parent.position.z || 0) : 0;
          const phase = elapsed * windSpeed + wx * 0.35 + wz * 0.25;
          obj.rotation.z = Math.sin(phase) * windIntensity;
          obj.rotation.x = Math.cos(phase * 0.85) * (windIntensity * 0.7);
          obj.position.x = Math.sin(phase) * (windIntensity * 0.35);
        } else if (obj.name === 'bush_crown') {
          const wx = obj.parent ? (obj.parent.position.x || 0) : 0;
          const wz = obj.parent ? (obj.parent.position.z || 0) : 0;
          const phase = elapsed * windSpeed * 1.2 + wx * 0.4 + wz * 0.3;
          obj.rotation.z = Math.sin(phase) * (windIntensity * 0.8);
          obj.scale.y = 1 + Math.sin(phase * 1.5) * 0.04;
        }
      });

      // ── Realistic 3D Grass Cluster Wind Physics ────────────────────────
      const grassMesh = scene.getObjectByName('meadow_grass_tufts') as THREE.InstancedMesh;
      if (grassMesh && grassMesh.userData?.instances) {
        const instances = grassMesh.userData.instances as Array<{ x: number; y: number; z: number; scale: THREE.Vector3; rotY: number }>;
        const grassWindIntensity = isStrongWind ? 0.30 : isRain ? 0.18 : 0.09;
        const grassWindSpeed = isStrongWind ? 6.2 : isRain ? 4.0 : 2.6;

        for (let i = 0; i < instances.length; i++) {
          const inst = instances[i];
          const phase = elapsed * grassWindSpeed + inst.x * 0.32 + inst.z * 0.32;
          const swayX = Math.sin(phase) * grassWindIntensity;
          const swayZ = Math.cos(phase * 0.85) * (grassWindIntensity * 0.7);

          tempWindObj.position.set(inst.x, inst.y, inst.z);
          tempWindObj.rotation.set(swayX, inst.rotY, swayZ);
          tempWindObj.scale.copy(inst.scale);
          tempWindObj.updateMatrix();
          grassMesh.setMatrixAt(i, tempWindObj.matrix);
        }
        grassMesh.instanceMatrix.needsUpdate = true;
      }

      // ── Flower Stems & Blooms Wind Sway ────────────────────────────────
      const flowerStemsMesh = scene.getObjectByName('meadow_flower_stems') as THREE.InstancedMesh;
      const flowerBloomsMesh = scene.getObjectByName('meadow_flower_blooms') as THREE.InstancedMesh;
      if (flowerStemsMesh && flowerStemsMesh.userData?.instances) {
        const instances = flowerStemsMesh.userData.instances as Array<{ x: number; y: number; z: number; scale: number; rotY: number; height: number }>;
        const flowerIntensity = isStrongWind ? 0.20 : 0.07;
        const flowerSpeed = isStrongWind ? 5.2 : 2.4;

        for (let i = 0; i < instances.length; i++) {
          const inst = instances[i];
          const phase = elapsed * flowerSpeed + inst.x * 0.35 + inst.z * 0.25;
          const swayX = Math.sin(phase) * flowerIntensity;
          const swayZ = Math.cos(phase * 0.9) * (flowerIntensity * 0.6);

          tempWindObj.position.set(inst.x, inst.height * 0.2, inst.z);
          tempWindObj.rotation.set(swayX, inst.rotY, swayZ);
          tempWindObj.scale.set(1, inst.height, 1);
          tempWindObj.updateMatrix();
          flowerStemsMesh.setMatrixAt(i, tempWindObj.matrix);

          if (flowerBloomsMesh) {
            tempWindObj.position.set(inst.x + swayX * 0.25, 0.41 + inst.height * 0.18, inst.z + swayZ * 0.25);
            tempWindObj.rotation.set(swayX, inst.rotY, swayZ);
            tempWindObj.scale.setScalar(inst.scale);
            tempWindObj.updateMatrix();
            flowerBloomsMesh.setMatrixAt(i, tempWindObj.matrix);
          }
        }
        flowerStemsMesh.instanceMatrix.needsUpdate = true;
        if (flowerBloomsMesh) flowerBloomsMesh.instanceMatrix.needsUpdate = true;
      }

      // ── Rain Splash Ripples on Ground ─────────────────────────────────
      splashRings.forEach((sr) => {
        if (isRain) {
          sr.mesh.visible = true;
          sr.life += delta;
          const progress = sr.life / sr.maxLife;
          const sc = 0.3 + progress * 2.2;
          sr.mesh.scale.set(sc, sc, 1);
          const mat = sr.mesh.material as THREE.MeshBasicMaterial;
          if (mat) {
            mat.opacity = 0.65 * (1 - progress);
          }
          if (progress >= 1.0) {
            sr.life = 0;
            sr.maxLife = 0.25 + Math.random() * 0.35;
            sr.mesh.position.set((Math.random() - 0.5) * 52, 0.04, (Math.random() - 0.5) * 52);
          }
        } else {
          sr.mesh.visible = false;
        }
      });

      // ── Lightning Bolts & Thunder Generator ───────────────────────────
      lightningTimer -= delta;
      if (curWeather === 'thunderstorm' && lightningTimer <= 0) {
        triggerLightningStrike();
        lightningTimer = 4.2 + Math.random() * 4.5;
      }

      // ── Real-Time Day / Night / Dawn / Dusk Cycle (Synced with User Clock) ──
      const nowClock = new Date();
      const hourVal = nowClock.getHours() + nowClock.getMinutes() / 60 + nowClock.getSeconds() / 3600;

      let baseSkyColor = '#BAE6FD';
      let baseAmbientColor = 0xFEF3C7;
      let baseAmbientIntensity = 0.95;
      let baseSunColor = 0xFFFBEB;
      let baseSunIntensity = 1.35;
      let baseSunX = 38;
      let baseSunY = 55;
      let baseSunZ = 28;
      let isNightMode = false;

      if (hourVal >= 5.0 && hourVal < 8.5) {
        // 🌅 Dawn / Sunrise (05:00 - 08:30)
        const t = (hourVal - 5.0) / 3.5;
        baseSkyColor = '#FDE68A';
        baseAmbientColor = 0xFED7AA;
        baseAmbientIntensity = 0.82 + t * 0.15;
        baseSunColor = 0xFBBF24;
        baseSunIntensity = 1.05 + t * 0.3;
        baseSunX = 22 + t * 16;
        baseSunY = 28 + t * 25;
        baseSunZ = 20 + t * 8;
      } else if (hourVal >= 8.5 && hourVal < 18.0) {
        // ☀️ Day / Midday (08:30 - 18:00)
        baseSkyColor = curSeason === 'winter' ? '#E0F2FE' : curSeason === 'autumn' ? '#FED7AA' : '#BAE6FD';
        baseAmbientColor = curSeason === 'winter' ? 0xE2E8F0 : 0xFEF3C7;
        baseAmbientIntensity = 0.98;
        baseSunColor = 0xFFFBEB;
        baseSunIntensity = 1.38;
        baseSunX = 38;
        baseSunY = 55;
        baseSunZ = 28;
      } else if (hourVal >= 18.0 && hourVal < 21.5) {
        // 🌇 Sunset / Dusk / Twilight (18:00 - 21:30)
        const t = (hourVal - 18.0) / 3.5;
        baseSkyColor = '#FB923C';
        baseAmbientColor = 0xFDBA74;
        baseAmbientIntensity = 0.92 - t * 0.38;
        baseSunColor = 0xEA580C;
        baseSunIntensity = 1.25 - t * 0.55;
        baseSunX = 38 - t * 15;
        baseSunY = 45 - t * 28;
        baseSunZ = 28 - t * 16;
      } else {
        // 🌙 Night (21:30 - 05:00)
        baseSkyColor = '#0B1120';
        baseAmbientColor = 0x1E293B;
        baseAmbientIntensity = 0.46;
        baseSunColor = 0x93C5FD; // Silvery moonlight
        baseSunIntensity = 0.62;
        baseSunX = -25;
        baseSunY = 45;
        baseSunZ = -20;
        isNightMode = true;
      }

      // Smoothly apply background & fog if not flashing
      if (!isFlashing) {
        scene.background = new THREE.Color(baseSkyColor);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.set(baseSkyColor);
        }
        ambientLight.color.setHex(baseAmbientColor);
        ambientLight.intensity = baseAmbientIntensity;
        sunLight.color.setHex(baseSunColor);
        sunLight.intensity = baseSunIntensity;
        sunLight.position.set(baseSunX, baseSunY, baseSunZ);
      }

      // Fireflies Animation in Night mode
      if (firefliesPoints && firefliesMat) {
        if (isNightMode) {
          firefliesMat.opacity = 0.85 + Math.sin(elapsed * 4) * 0.15;
          const fArr = firefliesGeo.attributes.position.array as Float32Array;
          for (let f = 0; f < firefliesCount; f++) {
            const fIdx = f * 3;
            fArr[fIdx + 1] = 0.4 + Math.sin(elapsed * 1.5 + f * 1.8) * 0.8 + 0.6;
            fArr[fIdx] += Math.sin(elapsed * 0.8 + f) * 0.01;
            fArr[fIdx + 2] += Math.cos(elapsed * 0.6 + f) * 0.01;
          }
          firefliesGeo.attributes.position.needsUpdate = true;
        } else {
          firefliesMat.opacity = 0.0;
        }
      }

      // ── Headlights and Road Spotlights (turn ON at Dusk / Night / Dawn) ──
      const isNightOrTwilight = isNightMode || hourVal >= 18.0 || hourVal < 8.5;
      truckGroup.traverse(child => {
        if (child.name === 'truck_headlight_beam') {
          child.visible = isNightOrTwilight;
        }
        if (child.name === 'truck_point_light') {
          (child as THREE.PointLight).intensity = isNightOrTwilight ? (isNightMode ? 4.8 : 3.0) : 0;
        }
      });

      cargoTruckGroup.traverse(child => {
        if (child.name === 'cargo_headlight_beam') {
          child.visible = isNightOrTwilight;
        }
        if (child.name === 'cargo_point_light') {
          (child as THREE.PointLight).intensity = isNightOrTwilight ? (isNightMode ? 4.5 : 2.8) : 0;
        }
      });

      scene.traverse(child => {
        if (child.name === 'lamp_light_cone' || child.name === 'lamp_glow_sprite') {
          child.visible = isNightOrTwilight;
        }
        if (child.name === 'lamp_point_light') {
          (child as THREE.PointLight).intensity = isNightOrTwilight ? (isNightMode ? 3.4 : 2.0) : 0;
        }
        if (child.name === 'lantern_glow') {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat && mat.emissiveIntensity !== undefined) {
            mat.emissiveIntensity = isNightOrTwilight ? 3.0 + Math.sin(elapsed * 2) * 0.4 : 0.05;
          }
        }
      });

      // Multi-Pulse Lightning Ambient & Sun Flash
      if (isFlashing) {
        const flashElapsed = clock.getElapsedTime() - flashStartTime;
        if (flashElapsed < 0.05) {
          ambientLight.intensity = 2.8;
          sunLight.intensity = 3.6;
          sunLight.color.setHex(0xE0F2FE);
        } else if (flashElapsed < 0.09) {
          ambientLight.intensity = 1.3;
          sunLight.intensity = 1.8;
        } else if (flashElapsed < 0.17) {
          ambientLight.intensity = 2.4;
          sunLight.intensity = 3.2;
          sunLight.color.setHex(0x93C5FD);
        } else if (flashElapsed < 0.35) {
          const t = (flashElapsed - 0.17) / 0.18;
          ambientLight.intensity = 0.95 + (2.4 - 0.95) * (1 - t);
          sunLight.intensity = 1.35 + (3.2 - 1.35) * (1 - t);
        } else {
          isFlashing = false;
          ambientLight.intensity = baseAmbientIntensity;
          sunLight.intensity = baseSunIntensity;
          sunLight.color.setHex(baseSunColor);
        }
      }

      // ── Dynamic Weather Particles (Rain, Snow, Falling Leaves, Pollen, Fog) ──
      const positions = particleGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        if (isRain) {
          // Rapid angled rain streaks
          positions[idx + 1] -= delta * 28;
          positions[idx] += delta * 5.2;
          positions[idx + 2] += delta * 2.2;
          if (positions[idx + 1] < 0) {
            positions[idx + 1] = 26;
            positions[idx] = (Math.random() - 0.5) * 65;
            positions[idx + 2] = (Math.random() - 0.5) * 65;
          }
        } else if (isSnow) {
          // Soft swirling snowflakes
          positions[idx + 1] -= delta * 2.6;
          positions[idx] += Math.sin(elapsed * 1.8 + i) * 0.035;
          positions[idx + 2] += Math.cos(elapsed * 1.4 + i) * 0.035;
          if (positions[idx + 1] < 0) {
            positions[idx + 1] = 24;
            positions[idx] = (Math.random() - 0.5) * 65;
            positions[idx + 2] = (Math.random() - 0.5) * 65;
          }
        } else if (isWind) {
          // Tumbling autumn leaves / swirling windy petals
          positions[idx] += delta * 8.5;
          positions[idx + 1] -= delta * 1.8;
          positions[idx + 2] += delta * 3.8;
          if (positions[idx] > 35 || positions[idx + 1] < 0) {
            positions[idx] = -35;
            positions[idx + 1] = 2 + Math.random() * 16;
            positions[idx + 2] = (Math.random() - 0.5) * 65;
          }
        } else if (isFog) {
          // Drifting river valley mist
          positions[idx + 1] = 0.6 + Math.sin(elapsed * 0.6 + i) * 0.6;
          positions[idx] += delta * 1.4;
          if (positions[idx] > 35) positions[idx] = -35;
        } else {
          // Gentle floating summer pollen / dandelion seeds
          positions[idx + 1] -= delta * 0.9;
          positions[idx] += Math.sin(elapsed * 0.8 + i) * 0.02 + delta * 0.8;
          positions[idx + 2] += Math.cos(elapsed * 0.6 + i) * 0.02;
          if (positions[idx + 1] < 0) {
            positions[idx + 1] = 18;
            positions[idx] = (Math.random() - 0.5) * 65;
            positions[idx + 2] = (Math.random() - 0.5) * 65;
          }
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Adjust particle material styling dynamically
      if (particleMat) {
        if (isRain) {
          particleMat.color.setHex(curWeather === 'thunderstorm' ? 0x93C5FD : 0x7DD3FC);
          particleMat.size = curWeather === 'thunderstorm' ? 0.38 : 0.30;
          particleMat.opacity = 0.85;
        } else if (isSnow) {
          particleMat.color.setHex(0xF8FAFC);
          particleMat.size = 0.34;
          particleMat.opacity = 0.90;
        } else if (curSeason === 'autumn' || isWind) {
          particleMat.color.setHex(curSeason === 'autumn' ? 0xD97706 : 0x84CC16);
          particleMat.size = 0.35;
          particleMat.opacity = 0.85;
        } else if (curSeason === 'spring' && isWind) {
          particleMat.color.setHex(0xF472B6); // Cherry blossom pink petals during spring breeze
          particleMat.size = 0.28;
          particleMat.opacity = 0.7;
        } else {
          // Clear sunny day: Crisp clean farm view without flying speckles
          particleMat.opacity = 0.0;
        }
      }

      // ── Delivery Truck Animation along Dual-Tunnel Circuit (Driveway 2) ──
      const tState = truckStateRef.current;
      if (tState.isDelivering) {
        const totalDuration = 8500;
        const elapsedDelivery = Math.max(0, totalDuration - Math.max(0, tState.deliveringUntil - Date.now()));
        const progress = Math.min(1, elapsedDelivery / totalDuration);

        if (progress < 0.16) {
          // 1. Reversing (сдаёт задом) up Driveway 2 onto the road
          const t = progress / 0.16;
          const pos = pickupReverseCurve.getPointAt(t);
          const tangent = pickupReverseCurve.getTangentAt(t);
          truckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 14)) * 0.025, pos.z);
          // Nose points opposite to reverse movement direction
          truckGroup.rotation.y = -Math.atan2(-tangent.z, -tangent.x);
          truckGroup.visible = true;

          // Wheels spin backwards
          truckGroup.traverse(child => {
            if (child.name === 'truck_wheel') {
              child.children.forEach(c => { c.rotation.y -= delta * 14; });
            }
          });
        } else if (progress < 0.22) {
          // 2. Pause on the road & switch gears / turn nose to the East (0.5s pause)
          const pauseT = (progress - 0.16) / 0.06;
          const junctionPos = pickupReverseCurve.getPointAt(1.0);
          truckGroup.position.set(junctionPos.x, junctionPos.y, junctionPos.z);
          const revEndTangent = pickupReverseCurve.getTangentAt(1.0);
          const startRot = -Math.atan2(-revEndTangent.z, -revEndTangent.x);
          const targetRot = 0.0; // Facing East along road towards bridge
          let diff = targetRot - startRot;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          truckGroup.rotation.y = startRot + diff * Math.min(1, pauseT * 1.5);
          truckGroup.visible = true;
        } else if (progress < 0.50) {
          // 3. Driving Forward along road and over bridge to Town Tunnel
          const t = (progress - 0.22) / 0.28;
          const pos = pickupForwardCurve.getPointAt(t);
          const tangent = pickupForwardCurve.getTangentAt(t);
          truckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 18)) * 0.035, pos.z);
          truckGroup.rotation.y = -Math.atan2(tangent.z, tangent.x);
          truckGroup.visible = t < 0.94;

          // Wheels spin forward
          truckGroup.traverse(child => {
            if (child.name === 'truck_wheel') {
              child.children.forEach(c => { c.rotation.y += delta * 16; });
            }
          });
        } else if (progress <= 0.60) {
          // 4. Inside Town (Mountain Tunnel)
          truckGroup.visible = false;
        } else {
          // 5. Returning from Town: emerges from West Tunnel and drives smoothly forward into Driveway 2!
          const t = (progress - 0.60) / 0.40;
          const pos = returnDeliveryCurve.getPointAt(t);
          const tangent = returnDeliveryCurve.getTangentAt(t);
          truckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 18)) * 0.035, pos.z);
          truckGroup.rotation.y = -Math.atan2(tangent.z, tangent.x);
          truckGroup.visible = t > 0.06;

          // Wheels spin forward
          truckGroup.traverse(child => {
            if (child.name === 'truck_wheel') {
              child.children.forEach(c => { c.rotation.y += delta * 16; });
            }
          });
        }
      } else {
        // Parked comfortably at home in Driveway 2 (aligned along the driveway curve)
        truckGroup.position.set(3.2, 0.05, -4.5);
        truckGroup.rotation.y = -1.16;
        truckGroup.visible = true;
      }

      // ── Cargo Semi-Truck Animation in Driveway 1 (Фура) ───────────────
      const cState = cargoTruckStateRef.current;
      const lootBadge = cargoTruckGroup.getObjectByName('cargo_loot_badge');

      if (cState.isDrivingIn) {
        cargoTruckGroup.visible = true;
        if (lootBadge) lootBadge.visible = false;
        const totalDuration = cState.driveDuration || 4200;
        const elapsedDriving = Math.max(0, Date.now() - cState.driveStartTime);
        const t = Math.min(1, elapsedDriving / totalDuration);
        const pos = cargoInboundCurve.getPointAt(t);
        const tangent = cargoInboundCurve.getTangentAt(t);
        cargoTruckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 16)) * 0.035, pos.z);
        cargoTruckGroup.rotation.y = -Math.atan2(tangent.z, tangent.x);

        cargoTruckGroup.traverse(child => {
          if (child.name === 'truck_wheel') {
            child.children.forEach(c => { c.rotation.y += delta * 14; });
          }
        });
      } else if (cState.isParkedWaiting) {
        cargoTruckGroup.visible = true;
        cargoTruckGroup.position.set(-7.0, 0.05, -3.2);
        cargoTruckGroup.rotation.y = -1.35;
        if (lootBadge) {
          lootBadge.visible = true;
          lootBadge.position.y = 2.6 + Math.sin(elapsed * 4) * 0.12;
          lootBadge.rotation.y = elapsed * 1.5;
        }
      } else if (cState.isDrivingOut) {
        cargoTruckGroup.visible = true;
        if (lootBadge) lootBadge.visible = false;
        const totalDuration = cState.driveDuration || 5500;
        const elapsedDriving = Math.max(0, Date.now() - cState.driveStartTime);
        const progress = Math.min(1, elapsedDriving / totalDuration);

        if (progress < 0.32) {
          // 1. Reversing (сдаёт задом) up Driveway 1 onto the road
          const t = progress / 0.32;
          const pos = cargoReverseCurve.getPointAt(t);
          const tangent = cargoReverseCurve.getTangentAt(t);
          cargoTruckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 14)) * 0.025, pos.z);
          // Nose points opposite to reverse motion
          cargoTruckGroup.rotation.y = -Math.atan2(-tangent.z, -tangent.x);

          cargoTruckGroup.traverse(child => {
            if (child.name === 'truck_wheel') {
              child.children.forEach(c => { c.rotation.y -= delta * 12; });
            }
          });
        } else if (progress < 0.44) {
          // 2. Pause on the road & switch gears / turn nose to the East (0.7s pause)
          const pauseT = (progress - 0.32) / 0.12;
          const junctionPos = cargoReverseCurve.getPointAt(1.0);
          cargoTruckGroup.position.set(junctionPos.x, junctionPos.y, junctionPos.z);
          const revEndTangent = cargoReverseCurve.getTangentAt(1.0);
          const startRot = -Math.atan2(-revEndTangent.z, -revEndTangent.x);
          const targetRot = 0.0; // Facing East along road towards bridge
          let diff = targetRot - startRot;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          cargoTruckGroup.rotation.y = startRot + diff * Math.min(1, pauseT * 1.4);
        } else {
          // 3. Driving Forward along road and over bridge to Town Tunnel
          const t = (progress - 0.44) / 0.56;
          const pos = cargoForwardCurve.getPointAt(t);
          const tangent = cargoForwardCurve.getTangentAt(t);
          cargoTruckGroup.position.set(pos.x, pos.y + Math.abs(Math.sin(elapsed * 16)) * 0.035, pos.z);
          cargoTruckGroup.rotation.y = -Math.atan2(tangent.z, tangent.x);
          cargoTruckGroup.visible = t < 0.96;

          cargoTruckGroup.traverse(child => {
            if (child.name === 'truck_wheel') {
              child.children.forEach(c => { c.rotation.y += delta * 16; });
            }
          });
        }
      } else {
        cargoTruckGroup.visible = false;
      }

      // Rotating Windmill blades & cogs
      scene.traverse(child => {
        if (child.name === 'mill_blades') child.rotation.z += delta * 2.8;
        if (child.name === 'distant_mill_blades') child.rotation.z += delta * 1.5;
        if (child.name === 'sugar_cog') child.rotation.z += delta * 3.2;
      });

      // ── Animate Animals (walk, idle, peck, wing flap) ──────────────────
      scene.traverse(obj => {
        if (!obj.name.startsWith('animal_')) return;
        const ud = obj.userData as {
          animalType: string;
          walkDir: { x: number; z: number };
          walkSpeed: number;
          walkTimer: number;
          isIdle: boolean;
          idleTimer: number;
          peckTimer: number;
          isPecking: boolean;
          peckPhase: number;
          penHalfSize: number;
        };
        if (!ud || !ud.animalType) return;

        const hs = ud.penHalfSize;

        // ── Idle / walk state machine ──────────────────────────────────
        if (ud.isIdle) {
          ud.idleTimer -= delta;
          if (ud.idleTimer <= 0) {
            ud.isIdle = false;
            const a = Math.random() * Math.PI * 2;
            ud.walkDir = { x: Math.cos(a), z: Math.sin(a) };
            ud.walkTimer = 1.5 + Math.random() * 3.0;
          }
        } else {
          ud.walkTimer -= delta;
          if (ud.walkTimer <= 0) {
            // Randomly either change direction or start idle pause
            if (Math.random() < 0.35) {
              ud.isIdle = true;
              ud.idleTimer = 0.6 + Math.random() * 1.8;
            } else {
              const a = Math.random() * Math.PI * 2;
              ud.walkDir = { x: Math.cos(a), z: Math.sin(a) };
              ud.walkTimer = 1.5 + Math.random() * 2.5;
            }
          }

          // Move animal
          const step = ud.walkSpeed * delta;
          const nx = obj.position.x + ud.walkDir.x * step;
          const nz = obj.position.z + ud.walkDir.z * step;

          // Bounce off pen walls
          if (Math.abs(nx) > hs) {
            ud.walkDir.x *= -1;
          } else {
            obj.position.x = nx;
          }
          if (Math.abs(nz) > hs) {
            ud.walkDir.z *= -1;
          } else {
            obj.position.z = nz;
          }

          // Face walking direction (smooth turn)
          const targetAngle = Math.atan2(ud.walkDir.x, ud.walkDir.z);
          const curAngle = obj.rotation.y;
          let diff = targetAngle - curAngle;
          while (diff > Math.PI)  diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          obj.rotation.y += diff * Math.min(1, delta * 8);
        }

        // ── Per-animal specific animations ─────────────────────────────
        if (ud.animalType === 'chicken') {
          // Body bob (always)
          const body = obj.getObjectByName('chicken_body');
          if (body) {
            body.position.y = 0.24 + Math.sin(elapsed * 6 + obj.position.x * 10) * (ud.isIdle ? 0.008 : 0.022);
          }
          const comb = obj.getObjectByName('chicken_comb');
          if (comb) {
            comb.position.y = 0.46 + Math.sin(elapsed * 6 + obj.position.x * 10) * (ud.isIdle ? 0.008 : 0.022);
          }
          const beak = obj.getObjectByName('chicken_beak');

          // Wing flap (when walking)
          const wingL = obj.getObjectByName('chicken_wingL');
          const wingR = obj.getObjectByName('chicken_wingR');
          if (wingL && wingR) {
            const flapAmt = ud.isIdle ? 0.08 : (0.35 + Math.sin(elapsed * 12 + obj.position.x * 5) * 0.25);
            (wingL as THREE.Object3D).rotation.z = -(0.2 + flapAmt);
            (wingR as THREE.Object3D).rotation.z =  (0.2 + flapAmt);
          }

          // Foot alternation (when walking)
          if (!ud.isIdle) {
            const footL = obj.getObjectByName('chicken_footL');
            const footR = obj.getObjectByName('chicken_footR');
            const stepCycle = Math.sin(elapsed * 10 + obj.position.x * 8);
            if (footL) (footL as THREE.Object3D).position.z =  stepCycle * 0.08;
            if (footR) (footR as THREE.Object3D).position.z = -stepCycle * 0.08;
          }

          // Pecking animation (only when idle)
          if (ud.isIdle) {
            ud.peckTimer -= delta;
            if (ud.peckTimer <= 0 && !ud.isPecking) {
              ud.isPecking = true;
              ud.peckPhase = 0;
              ud.peckTimer = 1.5 + Math.random() * 3.0;
            }
            if (ud.isPecking) {
              ud.peckPhase = Math.min(1, ud.peckPhase + delta * 4);
              // Dip head down then back up
              const peckDip = Math.sin(ud.peckPhase * Math.PI) * 0.18;
              if (body) body.position.y = 0.24 - peckDip;
              if (comb) comb.position.y = 0.46 - peckDip;
              if (beak) (beak as THREE.Object3D).position.y = 0.26 - peckDip;
              if (ud.peckPhase >= 1) ud.isPecking = false;
            }
          }

        } else if (ud.animalType === 'cow' || ud.animalType === 'sheep' || ud.animalType === 'pig') {
          // Gentle body sway / breathing
          const breathAmp = ud.isIdle ? 0.012 : 0.005;
          obj.rotation.z = Math.sin(elapsed * 1.8 + obj.position.x) * breathAmp;
          obj.position.y = Math.abs(Math.sin(elapsed * (ud.animalType === 'pig' ? 3 : 2) + obj.id * 0.5)) * (ud.isIdle ? 0.005 : 0.018);
        }
      });


      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      const nAspect = nw / nh;
      const zoom = currentZoomRef.current;
      camera.left = -zoom * nAspect;
      camera.right = zoom * nAspect;
      camera.top = zoom;
      camera.bottom = -zoom;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    const recordActivity = () => {
      lastActivityTimeRef.current = performance.now();
    };
    window.addEventListener('pointerdown', recordActivity);
    window.addEventListener('pointermove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('wheel', recordActivity, { passive: true });
    window.addEventListener('touchstart', recordActivity, { passive: true });
    window.addEventListener('touchmove', recordActivity, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('pointermove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('wheel', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('touchmove', recordActivity);
      renderer.dispose();
    };
  }, []); // Run ONCE on mount!

  // -------------------------------------------------------------------
  // 2. REBUILD TERRAIN & EXPANSIONS WHEN SEASON OR EXPANSIONS CHANGE
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!terrainGroupRef.current) return;
    const terrainGroup = terrainGroupRef.current;
    while (terrainGroup.children.length > 0) {
      terrainGroup.remove(terrainGroup.children[0]);
    }

    const seasonInfo = SEASONS_INFO[activeSeason];
    const cliffMat = getCachedColorMaterial('#451A03', 0.95);
    const softenedGround = new THREE.Color(seasonInfo.groundColor);
    if (activeSeason !== 'winter') {
      softenedGround.lerp(new THREE.Color('#86B95B'), 0.18);
    }
    const grassMat = getCachedColorMaterial(`#${softenedGround.getHexString()}`, 0.88);
    const bankMat = getCachedColorMaterial(activeSeason === 'winter' ? '#CBD5E1' : '#C5A059', 0.88);

    // Main Farm Meadow (West: x from -50 to +10, z from -48 to +48)
    const farmIslandBase = new THREE.Mesh(new THREE.BoxGeometry(60, 2.5, 96), cliffMat);
    farmIslandBase.position.set(-20, -1.25, 0);
    farmIslandBase.receiveShadow = true;
    terrainGroup.add(farmIslandBase);

    const farmGrass = new THREE.Mesh(new THREE.PlaneGeometry(60, 96), grassMat);
    farmGrass.rotation.x = -Math.PI / 2;
    farmGrass.position.set(-20, 0.01, 0);
    farmGrass.receiveShadow = true;
    farmGrass.name = 'ground';
    terrainGroup.add(farmGrass);

    // Soft sandy bank on West shore (x = 10.0)
    const farmBank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 96), bankMat);
    farmBank.position.set(10.0, -0.08, 0);
    farmBank.receiveShadow = true;
    terrainGroup.add(farmBank);

    // East Shore (x = 22 to 62, z from -48 to +48)
    const eastIslandBase = new THREE.Mesh(new THREE.BoxGeometry(40, 2.5, 96), cliffMat);
    eastIslandBase.position.set(42, -1.25, 0);
    eastIslandBase.receiveShadow = true;
    terrainGroup.add(eastIslandBase);

    const eastGrass = new THREE.Mesh(new THREE.PlaneGeometry(40, 96), grassMat);
    eastGrass.rotation.x = -Math.PI / 2;
    eastGrass.position.set(42, 0.01, 0);
    eastGrass.receiveShadow = true;
    terrainGroup.add(eastGrass);

    const eastBank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 96), bankMat);
    eastBank.position.set(22.0, -0.08, 0);
    eastBank.receiveShadow = true;
    terrainGroup.add(eastBank);

    // Deterministic low-poly relief, winding roads, dense shorelines and meadow life.
    terrainGroup.add(createLandscapeDetailGroup(activeSeason));

    // ── Cascading Mountain Waterfall plunging from North Mountain at river head ──
    const mountainWaterfall = createMountainWaterfallGroup(activeSeason);
    mountainWaterfall.position.set(16.0, 0, -25.5);
    terrainGroup.add(mountainWaterfall);

    // ── Organic Winding River & Riverbed System ─────────────────────────
    const { waterMesh, riverbedMesh } = createWindingRiverMesh(activeSeason);
    terrainGroup.add(riverbedMesh, waterMesh);

    // ── Water Lilies with Blooming Pink Lotus Flowers (Bobbing in current) ──
    const padGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 8);
    const padMat = getCachedColorMaterial('#15803D', 0.7);
    const lotusMat = getCachedColorMaterial('#FB7185', 0.4);
    const lotusGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const lotusCenterMat = getCachedColorMaterial('#FEF08A', 0.2);
    [
      [12.5, -4], [18.5, -12], [14.0, 5], [17.5, 15], [13.0, -18],
      [16.5, 22], [18.0, 30], [13.5, 36], [17.0, -2]
    ].forEach(([lx, lz]) => {
      const lilyGroup = new THREE.Group();
      lilyGroup.name = 'river_water_lily';
      lilyGroup.position.set(lx, -0.04, lz);

      const lily = new THREE.Mesh(padGeo, padMat);
      const flower = new THREE.Mesh(lotusGeo, lotusMat);
      flower.position.y = 0.08;
      const flowerCore = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), lotusCenterMat);
      flowerCore.position.y = 0.12;

      lilyGroup.add(lily, flower, flowerCore);
      terrainGroup.add(lilyGroup);
    });

    // 4. Cattails & Tall River Reeds along shoreline
    const reedGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.3, 5);
    const reedMat = getCachedColorMaterial('#4D7C0F', 0.8);
    const reedHeadGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 6);
    const reedHeadMat = getCachedColorMaterial('#78350F', 0.9);
    for (let rz = -22; rz <= 40; rz += 3.5) {
      if (rz > -12 && rz < -3) continue; // Skip bridge & fishing dock
      const rx = 9.8 + (Math.sin(rz * 0.8) * 0.25);
      const reed = new THREE.Mesh(reedGeo, reedMat);
      reed.position.set(rx, 0.5, rz);
      reed.rotation.z = (Math.sin(rz) * 0.12);
      const rHead = new THREE.Mesh(reedHeadGeo, reedHeadMat);
      rHead.position.set(rx, 0.9, rz);
      terrainGroup.add(reed, rHead);

      const rx2 = 22.2 + (Math.cos(rz * 0.8) * 0.25);
      const reed2 = new THREE.Mesh(reedGeo, reedMat);
      reed2.position.set(rx2, 0.5, rz);
      reed2.rotation.z = -(Math.sin(rz) * 0.12);
      const rHead2 = new THREE.Mesh(reedHeadGeo, reedHeadMat);
      rHead2.position.set(rx2, 0.9, rz);
      terrainGroup.add(reed2, rHead2);
    }

    // Wooden Bridge spanning the River at z = -9
    const bridgeGroup = new THREE.Group();
    const bDeck = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.25, 2.8), getCachedColorMaterial('#78350F', 0.85));
    bDeck.position.set(16.0, 0.2, -9.0);
    bDeck.castShadow = true;
    bDeck.receiveShadow = true;
    bridgeGroup.add(bDeck);

    const bRailMat = getCachedColorMaterial('#9A3412', 0.7);
    const bRailL = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.12, 0.12), bRailMat);
    bRailL.position.set(16.0, 0.75, -10.3);
    const bRailR = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.12, 0.12), bRailMat);
    bRailR.position.set(16.0, 0.75, -7.7);
    bridgeGroup.add(bRailL, bRailR);

    const bPostGeo = new THREE.BoxGeometry(0.16, 0.85, 0.16);
    const bPillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.4, 8);
    [-5.5, -2.0, 2.0, 5.5].forEach(bx => {
      const p1 = new THREE.Mesh(bPostGeo, bRailMat);
      p1.position.set(16.0 + bx, 0.5, -10.3);
      const p2 = new THREE.Mesh(bPostGeo, bRailMat);
      p2.position.set(16.0 + bx, 0.5, -7.7);
      bridgeGroup.add(p1, p2);

      const pil = new THREE.Mesh(bPillarGeo, getCachedColorMaterial('#451A03', 0.9));
      pil.position.set(16.0 + bx, -0.4, -9.0);
      pil.castShadow = true;
      bridgeGroup.add(pil);
    });
    terrainGroup.add(bridgeGroup);

    // Entrance Arch (x = 9.5, z = -9)
    const archGroup = new THREE.Group();
    const archWoodMat = getCachedColorMaterial('#78350F', 0.8);
    const aPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), archWoodMat);
    aPost1.position.set(9.5, 1.6, -10.5);
    const aPost2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), archWoodMat);
    aPost2.position.set(9.5, 1.6, -7.5);
    const aBeam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 3.5), archWoodMat);
    aBeam.position.set(9.5, 3.2, -9);
    const aSign = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 2.2), getCachedColorMaterial('#FEF08A', 0.5));
    aSign.position.set(9.5, 2.6, -9);
    archGroup.add(aPost1, aPost2, aBeam, aSign);
    terrainGroup.add(archGroup);

    // ── Mountain Tunnels at Road Boundaries ──────────────────────────────
    // 1. East Mountain Tunnel (Town Road Entrance at the East Cliff edge)
    const eastTunnel = createMountainTunnelGroup(activeSeason, 'ГОРОД');
    eastTunnel.position.set(32.2, 0.02, -6.2);
    eastTunnel.rotation.y = Math.atan2(-3.2, -1.4);
    terrainGroup.add(eastTunnel);

    // 2. West Mountain Tunnel (Valley Pass at the far top-left boundary)
    const westTunnel = createMountainTunnelGroup(activeSeason, 'ДОЛИНА');
    westTunnel.position.set(-29.2, 0.02, -10.15);
    westTunnel.rotation.y = Math.atan2(7.5, -0.3);
    terrainGroup.add(westTunnel);

    // Mailbox (x = -4, z = -8)
    const mbGroup = new THREE.Group();
    mbGroup.name = 'farm_mailbox';
    const mbPost = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), archWoodMat);
    mbPost.position.set(-4, 0.5, -8);
    mbPost.castShadow = true;
    const mbBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.52), getCachedColorMaterial('#DC2626', 0.5));
    mbBox.position.set(-4, 1.0, -8);
    mbBox.castShadow = true;
    const mbFlag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.12), getCachedColorMaterial('#FBBF24', 0.3));
    mbFlag.name = 'mailbox_flag';
    mbFlag.position.set(-3.83, 1.12, -8);
    mbGroup.add(mbPost, mbBox, mbFlag);
    terrainGroup.add(mbGroup);

    // Stepping stones in pedestrian garden square
    const pathMat = getCachedColorMaterial('#94A3B8', 0.9);
    const stoneGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.03, 6);
    [
      [-3.2, -4.5], [-2.4, -4.0], [-1.8, -3.5], [-1.2, -3.0], [-0.6, -2.5],
      [-2.8, -2.5], [-2.0, -1.8], [-1.2, -1.2], [-0.4, -0.6]
    ].forEach(([sx, sz]) => {
      const stone = new THREE.Mesh(stoneGeo, pathMat);
      stone.position.set(sx, 0.03, sz);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      terrainGroup.add(stone);
    });

    // ── TREE & MOUNTAIN MATERIALS ───────────────────────────────────────
    const distTrunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.4, 6);
    const distTrunkMat = getCachedColorMaterial('#78350F', 0.9);
    const distPineFoliageMat = getCachedColorMaterial(activeSeason === 'winter' ? '#E2E8F0' : '#14532D', 0.75);
    const distOakFoliageMat = getCachedColorMaterial(seasonInfo.foliageColor, 0.7);
    const distCherryFoliageMat = getCachedColorMaterial(activeSeason === 'spring' ? '#FDA4AF' : seasonInfo.foliageColor, 0.7);

    // Forest Tree Generator Helper
    const createLandscapeTree = (tx: number, tz: number, type: 'pine' | 'oak' | 'cherry', scale = 1.0) => {
      const tGroup = new THREE.Group();
      tGroup.name = 'landscape_tree';
      tGroup.position.set(tx, 0, tz);
      tGroup.scale.set(scale, scale, scale);

      const trunk = new THREE.Mesh(distTrunkGeo, distTrunkMat);
      trunk.position.y = 0.7;
      trunk.castShadow = true;
      tGroup.add(trunk);

      const crownGroup = new THREE.Group();
      crownGroup.name = 'tree_crown';
      crownGroup.position.set(0, 1.1, 0);

      if (type === 'pine') {
        for (let i = 0; i < 3; i++) {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4 * (1 - i * 0.25), 1.2, 6), distPineFoliageMat);
          cone.position.y = 0.3 + i * 0.8;
          cone.castShadow = true;
          crownGroup.add(cone);
        }
      } else {
        const mat = type === 'cherry' ? distCherryFoliageMat : distOakFoliageMat;
        const fol1 = new THREE.Mesh(new THREE.SphereGeometry(1.1, 7, 7), mat);
        fol1.position.set(0, 0.7, 0);
        fol1.castShadow = true;
        const fol2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 7, 7), mat);
        fol2.position.set(0.3, 1.1, -0.2);
        fol2.castShadow = true;
        const fol3 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 7, 7), mat);
        fol3.position.set(-0.25, 1.0, 0.25);
        fol3.castShadow = true;
        crownGroup.add(fol1, fol2, fol3);
      }
      tGroup.add(crownGroup);
      return tGroup;
    };

    // ── MAJESTIC TOWERING ALPINE MOUNTAINS (RUGGED ROCK RELIEF & CRAGS) ──
    const rockMat1 = getCachedColorMaterial(activeSeason === 'winter' ? '#64748B' : '#52525B', 0.85);
    const rockMat2 = getCachedColorMaterial(activeSeason === 'winter' ? '#94A3B8' : '#71717A', 0.80);

    const createMajesticToweringMountain = (
      mx: number,
      mz: number,
      baseRadius: number,
      height: number,
      ridgeHarmonics: number,
      asymOffset: { x: number; z: number },
      seed: number
    ) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(mx, 0, mz);

      // Altitude gradient colors
      const cValley = new THREE.Color(activeSeason === 'winter' ? '#94A3B8' : activeSeason === 'autumn' ? '#667C34' : '#3B7528');
      const cMid    = new THREE.Color(activeSeason === 'winter' ? '#B0C4DE' : activeSeason === 'autumn' ? '#854D0E' : '#2D6320');
      const cUpper  = new THREE.Color(activeSeason === 'winter' ? '#64748B' : activeSeason === 'autumn' ? '#52525B' : '#475569');
      const cPeak   = new THREE.Color(activeSeason === 'winter' ? '#F8FAFC' : activeSeason === 'autumn' ? '#A8A29E' : '#334155');

      const rings = 15;      // 15 vertical tiers
      const segments = 20;   // 20 radial segments for rich faceted low-poly relief

      const positions: number[] = [];
      const colors: number[] = [];
      const indices: number[] = [];

      for (let r = 0; r <= rings; r++) {
        const t = r / rings; // 0.0 (ground base) to 1.0 (summit)

        // Parabolic alpine curve
        const y = Math.pow(t, 1.25) * height;
        const currentR = baseRadius * Math.pow(1 - t, 0.72);

        // Asymmetrical summit lean
        const skewX = asymOffset.x * t * t;
        const skewZ = asymOffset.z * t * t;

        for (let s = 0; s < segments; s++) {
          const angle = (s / segments) * Math.PI * 2;

          // Rugged 3D mountain relief: ridges, couloirs, rocky gullies
          const rockRelief =
            0.18 * Math.sin(angle * ridgeHarmonics + seed * 1.7) +
            0.12 * Math.cos(angle * 3 + y * 0.35 - seed * 0.8) +
            0.07 * Math.sin(angle * 5 + y * 0.7 + seed * 2.1) +
            0.04 * Math.cos(angle * 7 - y * 1.1);

          const rad = r === rings ? 0 : Math.max(0.25, currentR * (1 + rockRelief));
          const px = Math.cos(angle) * rad + skewX;
          const pz = Math.sin(angle) * rad + skewZ;

          positions.push(px, y, pz);

          // Smooth altitude gradient coloring
          const vertColor = new THREE.Color();
          if (t < 0.30) {
            vertColor.copy(cValley).lerp(cMid, t / 0.30);
          } else if (t < 0.68) {
            vertColor.copy(cMid).lerp(cUpper, (t - 0.30) / 0.38);
          } else {
            vertColor.copy(cUpper).lerp(cPeak, (t - 0.68) / 0.32);
          }
          colors.push(vertColor.r, vertColor.g, vertColor.b);
        }
      }

      // Triangulation
      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < segments; s++) {
          const nextS = (s + 1) % segments;
          const curRing = r * segments;
          const nextRing = (r + 1) * segments;

          const a = curRing + s;
          const b = curRing + nextS;
          const c = nextRing + s;
          const d = nextRing + nextS;

          if (r < rings - 1) {
            indices.push(a, c, b);
            indices.push(b, c, d);
          } else {
            indices.push(a, c, b);
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.85,
        metalness: 0.04,
        flatShading: true,
      });

      const mMesh = new THREE.Mesh(geo, mat);
      mMesh.castShadow = true;
      mMesh.receiveShadow = true;
      mGroup.add(mMesh);

      // ── Exposed Granite Rock Crags & Ledges protruding from the mountain ──
      const numCrags = 5 + (seed % 4);
      for (let c = 0; c < numCrags; c++) {
        const cAngle = (c * 2.15 + seed * 1.1) % (Math.PI * 2);
        const cHeightFrac = 0.25 + 0.50 * ((c * 1.37) % 1);
        const cDist = baseRadius * Math.pow(1 - cHeightFrac, 0.72) * 0.95;
        const cx = Math.cos(cAngle) * cDist + asymOffset.x * cHeightFrac * cHeightFrac;
        const cz = Math.sin(cAngle) * cDist + asymOffset.z * cHeightFrac * cHeightFrac;
        const cy = Math.pow(cHeightFrac, 1.25) * height;

        const cragGeo = new THREE.DodecahedronGeometry(1.2 + (c % 3) * 0.6, 0);
        const crag = new THREE.Mesh(cragGeo, c % 2 === 0 ? rockMat1 : rockMat2);
        crag.position.set(cx, cy, cz);
        crag.scale.set(1.4, 0.8 + (c % 2) * 0.4, 1.2);
        crag.rotation.set((c * 0.4) % 1, cAngle, (c * 0.3) % 1);
        crag.castShadow = true;
        crag.receiveShadow = true;
        mGroup.add(crag);
      }

      // ── Pine trees around lower foothills ──
      const numPines = 4 + (seed % 4);
      for (let i = 0; i < numPines; i++) {
        const treeAngle = ((i * 2.39 + seed * 0.7) % (Math.PI * 2));
        const treeDist = baseRadius * (0.68 + 0.22 * ((i * 1.41) % 1));
        const tx = Math.cos(treeAngle) * treeDist + asymOffset.x * 0.12;
        const tz = Math.sin(treeAngle) * treeDist + asymOffset.z * 0.12;
        const ty = (1 - (treeDist / baseRadius)) * (height * 0.24);

        const worldX = mx + tx;
        const worldZ = mz + tz;

        // Skip pines if too close to tunnel entrances (East: 34, -5.5; West: -32, -10)
        const dEast = Math.hypot(worldX - 34.0, worldZ - (-5.5));
        const dWest = Math.hypot(worldX - (-32.0), worldZ - (-10.0));
        if (dEast < 5.5 || dWest < 5.5) continue;

        const pGroup = new THREE.Group();
        pGroup.position.set(tx, Math.max(0.1, ty), tz);
        const pScale = 1.1 + (i % 3) * 0.35;
        pGroup.scale.set(pScale, pScale, pScale);

        const pTrunk = new THREE.Mesh(distTrunkGeo, distTrunkMat);
        pTrunk.position.y = 0.5;
        pTrunk.castShadow = true;
        pGroup.add(pTrunk);

        for (let l = 0; l < 3; l++) {
          const pFoliage = new THREE.Mesh(
            new THREE.ConeGeometry(1.2 * (1 - l * 0.24), 1.1, 5),
            distPineFoliageMat
          );
          pFoliage.position.y = 0.9 + l * 0.65;
          pFoliage.castShadow = true;
          pGroup.add(pFoliage);
        }
        mGroup.add(pGroup);
      }

      return mGroup;
    };

    // ── TOWERING MOUNTAIN RANGES ENCIRCLING THE HORIZON (22M - 32M TALL) ──
    // Mountains positioned so their slopes seamlessly swallow and fuse with the tunnel roofs
    const mountainLayout: [number, number, number, number, number, { x: number; z: number }, number][] = [
      // ── EAST MOUNTAIN RANGE (Seamlessly fusing with East Road Tunnel at x=34.0, z=-5.5) ──
      [48, -26, 20, 24, 3, { x: 3, z: -2 }, 101],
      [49, -4.5, 20, 28, 3, { x: 3, z: -1 }, 103],  // Mountain seamlessly fusing with East Tunnel!
      [51, 16, 21, 26, 4, { x: 3, z: 2 }, 104],
      [48, 32, 20, 25, 3, { x: 3, z: 1 }, 105],
      [46, 44, 19, 23, 3, { x: 2, z: -2 }, 106],

      // ── WEST MOUNTAIN RANGE (Seamlessly fusing with West Road Tunnel at x=-32.0, z=-10.0) ──
      [-47, -28, 20, 24, 3, { x: -3, z: -2 }, 201],
      [-47, -10, 20, 27, 3, { x: -3, z: -1 }, 202], // Mountain seamlessly fusing with West Tunnel!
      [-48, 8, 21, 25, 3, { x: -3, z: 1 }, 203],
      [-49, 24, 22, 27, 4, { x: -4, z: 2 }, 204],
      [-46, 40, 20, 23, 3, { x: -2, z: -1 }, 205],

      // ── NORTH MOUNTAIN RANGE (Northern Horizon Peaks) ──
      [-32, -48, 22, 25, 3, { x: -2, z: -4 }, 301],
      [-16, -52, 24, 29, 4, { x: 1, z: -5 }, 302],
      [0, -56, 26, 32, 3, { x: 0, z: -6 }, 303],   // Grand 32m Central North Summit
      [16, -52, 24, 29, 4, { x: -1, z: -5 }, 304],
      [32, -48, 22, 25, 3, { x: 3, z: -4 }, 305],

      // ── SOUTH MOUNTAIN RANGE (Southern Horizon Peaks) ──
      [-30, 48, 21, 24, 3, { x: -3, z: 4 }, 401],
      [-15, 52, 23, 28, 4, { x: 2, z: 5 }, 402],
      [0, 54, 25, 30, 3, { x: 0, z: 6 }, 403],     // Grand 30m South Peak
      [18, 52, 23, 28, 4, { x: -2, z: 5 }, 404],
      [32, 48, 21, 24, 3, { x: 3, z: 4 }, 405]
    ];

    mountainLayout.forEach(([mx, mz, rad, ht, ridges, asym, seed]) => {
      terrainGroup.add(createMajesticToweringMountain(mx, mz, rad, ht, ridges, asym, seed));
    });

    // ── LANDSCAPE TREES (Carefully positioned to keep roads & tunnels open) ──
    // ── LANDSCAPE TREES (Dense forests, scenic groves, mountain pines & cherry blossoms) ──
    const eastTrees: [number, number, 'pine' | 'oak' | 'cherry', number][] = [
      [27, -4, 'oak', 1.1], [29, -14, 'pine', 1.2], [31, 8, 'cherry', 1.0],
      [28, 18, 'pine', 1.3], [30, -22, 'oak', 1.1], [26, 26, 'pine', 1.0],
      [25, -20, 'cherry', 0.9], [32, -18, 'pine', 1.4], [30, 14, 'oak', 1.2],
      [26, 10, 'pine', 1.1], [28, -30, 'oak', 1.3], [33, 24, 'pine', 1.2],
      [42, -18, 'pine', 1.5], [44, 8, 'oak', 1.2], [42, 20, 'pine', 1.4],
      [25, 2, 'cherry', 1.0], [27, -10, 'oak', 1.15], [31, 30, 'pine', 1.3],
      [35, 12, 'pine', 1.25], [29, 22, 'cherry', 1.05], [34, -8, 'pine', 1.35],
    ];
    eastTrees.forEach(([tx, tz, type, sc]) => {
      terrainGroup.add(createLandscapeTree(tx, tz, type, sc));
    });

    // North Mountain Forest & Footing Groves
    const northTrees: [number, number, 'pine' | 'oak' | 'cherry', number][] = [
      [-16, -24, 'pine', 1.3], [-10, -26, 'pine', 1.2], [-4, -25, 'oak', 1.1],
      [2, -27, 'pine', 1.4], [8, -25, 'cherry', 1.0], [-20, -22, 'pine', 1.1],
      [-14, -28, 'pine', 1.5], [4, -28, 'oak', 1.2], [-8, -22, 'cherry', 0.95],
      [-26, -22, 'pine', 1.25], [12, -26, 'pine', 1.35], [16, -23, 'oak', 1.1],
      [-2, -22, 'oak', 1.15], [-24, -27, 'pine', 1.4], [6, -23, 'cherry', 1.0],
    ];
    northTrees.forEach(([tx, tz, type, sc]) => {
      terrainGroup.add(createLandscapeTree(tx, tz, type, sc));
    });

    // West Ridge Forest & Foothill Woods
    const westTrees: [number, number, 'pine' | 'oak' | 'cherry', number][] = [
      [-22, -14, 'pine', 1.2], [-24, -6, 'oak', 1.1], [-23, 4, 'pine', 1.3],
      [-25, 14, 'cherry', 1.0], [-22, 22, 'pine', 1.2], [-26, -18, 'pine', 1.4],
      [-28, -8, 'pine', 1.3], [-25, 8, 'oak', 1.15], [-27, 18, 'pine', 1.25],
      [-21, -2, 'cherry', 1.0], [-28, 26, 'pine', 1.35], [-24, -24, 'oak', 1.2],
    ];
    westTrees.forEach(([tx, tz, type, sc]) => {
      terrainGroup.add(createLandscapeTree(tx, tz, type, sc));
    });

    // South Meadow Woods & Riverbanks
    const southTrees: [number, number, 'pine' | 'oak' | 'cherry', number][] = [
      [-16, 24, 'oak', 1.2], [-8, 26, 'pine', 1.3], [0, 25, 'cherry', 1.1],
      [6, 27, 'pine', 1.2], [-20, 26, 'oak', 1.0], [4, 25, 'oak', 1.1],
      [-12, 22, 'cherry', 1.05], [-4, 28, 'pine', 1.35], [8, 22, 'cherry', 1.0],
      [-24, 25, 'pine', 1.2], [2, 28, 'oak', 1.15], [-14, 27, 'pine', 1.3],
    ];
    southTrees.forEach(([tx, tz, type, sc]) => {
      terrainGroup.add(createLandscapeTree(tx, tz, type, sc));
    });

    // Distant Windmill
    const distMillGroup = new THREE.Group();
    distMillGroup.position.set(-22, 0, -32);
    const dmTower = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 7.0, 8), getCachedColorMaterial('#F8FAFC', 0.8));
    dmTower.position.y = 3.5;
    const dmCap = new THREE.Mesh(new THREE.ConeGeometry(1.8, 1.8, 8), getCachedColorMaterial('#9A3412', 0.7));
    dmCap.position.y = 7.8;
    const dmBlades = new THREE.Group();
    dmBlades.name = 'distant_mill_blades';
    dmBlades.position.set(0, 6.8, 1.5);
    const dmHub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 6), getCachedColorMaterial('#78350F', 0.8));
    dmHub.rotation.x = Math.PI / 2;
    dmBlades.add(dmHub);
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.0, 0.08), getCachedColorMaterial('#FBBF24', 0.5));
      arm.position.y = 2.5;
      const sail = new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.8, 0.04), getCachedColorMaterial('#FEF08A', 0.5));
      sail.position.set(0.6, 2.5, 0);
      const br = new THREE.Group();
      br.rotation.z = (i * Math.PI) / 2;
      br.add(arm, sail);
      dmBlades.add(br);
    }
    distMillGroup.add(dmTower, dmCap, dmBlades);
    terrainGroup.add(distMillGroup);

    // Expansion Markers
    expansions.forEach(chunk => {
      if (!chunk.isUnlocked) {
        const cornerGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.6, 6);
        const postMat = getCachedColorMaterial('#78350F', 0.8);
        const corners = [
          [chunk.x + 0.2, chunk.z + 0.2],
          [chunk.x + chunk.width - 0.2, chunk.z + 0.2],
          [chunk.x + 0.2, chunk.z + chunk.depth - 0.2],
          [chunk.x + chunk.width - 0.2, chunk.z + chunk.depth - 0.2],
        ];
        corners.forEach(([cx, cz]) => {
          const post = new THREE.Mesh(cornerGeo, postMat);
          post.position.set(cx, 0.3, cz);
          terrainGroup.add(post);
        });

        const signGroup = new THREE.Group();
        signGroup.position.set(chunk.x + chunk.width / 2, 0, chunk.z + chunk.depth / 2);
        const signPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), postMat);
        signPost.position.y = 0.6;
        signPost.castShadow = true;
        const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.08), getCachedColorMaterial('#FBBF24', 0.5));
        signBoard.position.y = 1.0;
        signBoard.castShadow = true;
        const coinBadge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12), getCachedColorMaterial('#F59E0B', 0.2, 0.8));
        coinBadge.position.set(0, 1.0, 0.06);
        coinBadge.rotation.x = Math.PI / 2;
        signGroup.add(signPost, signBoard, coinBadge);
        terrainGroup.add(signGroup);
      }
    });
  }, [activeSeason, expansions]);

  // -------------------------------------------------------------------
  // 3. REBUILD ENTITIES WHEN ENTITIES / SELECTION / EVENT CHANGE
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!entitiesGroupRef.current) return;
    const entitiesGroup = entitiesGroupRef.current;
    while (entitiesGroup.children.length > 0) {
      entitiesGroup.remove(entitiesGroup.children[0]);
    }

    const now = Date.now();
    const weatherMult = activeEvent?.growthSpeedMultiplier || 1.0;

    entities.forEach(ent => {
      const isMovingThis = ent.id === movingEntityId;
      const currentPos = isMovingThis && movingPos ? movingPos : { x: ent.x, z: ent.z };
      const currentRot = isMovingThis ? movingRotation : ent.rotation;
      const curW = (currentRot % 2 === 1) ? ent.depth : ent.width;
      const curD = (currentRot % 2 === 1) ? ent.width : ent.depth;

      const entGroup = new THREE.Group();
      entGroup.position.set(currentPos.x + curW / 2, isMovingThis ? 0.35 : 0, currentPos.z + curD / 2);
      entGroup.rotation.y = (currentRot * Math.PI) / 2;
      entGroup.userData = { entityId: ent.id, entity: ent };

      if (ent.type === 'special') {
        if (ent.configId === 'farmhouse') {
          entGroup.add(createFarmhouseGroup(activeSeason));
        } else if (ent.configId === 'order_board') {
          entGroup.add(createOrderBoardGroup());
        } else if (ent.configId === 'roadside_shop') {
          entGroup.add(createRoadsideShopGroup());
        } else if (ent.configId === 'fishing_dock') {
          entGroup.add(createFishingDockGroup());
        }
      } else if (ent.type === 'storage') {
        if (ent.configId === 'silo') {
          entGroup.add(createSiloGroup());
        } else {
          entGroup.add(createBarnGroup(activeSeason));
        }
      } else if (ent.type === 'production') {
        entGroup.add(createProductionBuildingGroup(ent.configId));
      } else if (ent.type === 'animal_pen') {
        entGroup.add(createAnimalPenGroup(ent.configId));
        if (ent.animals) {
          ent.animals.forEach(anim => {
            const aMesh = createAnimalMesh(anim.animalConfigId);
            aMesh.position.set(anim.posX - 1.2, 0, anim.posZ - 1.2);
            entGroup.add(aMesh);
          });
        }
      } else if (ent.type === 'field') {
        const patchGeo = new THREE.BoxGeometry(0.94, 0.08, 0.94);
        const patchMat = getCachedColorMaterial('#3B1808', 0.95);
        const patch = new THREE.Mesh(patchGeo, patchMat);
        patch.position.y = 0.04;
        patch.receiveShadow = true;
        entGroup.add(patch);

        const furrowGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.88, 6);
        const furrowMat = getCachedColorMaterial('#542D0C', 0.95);
        [-0.25, 0, 0.25].forEach(fx => {
          const f = new THREE.Mesh(furrowGeo, furrowMat);
          f.position.set(fx, 0.08, 0);
          f.rotation.x = Math.PI / 2;
          entGroup.add(f);
        });

        if (ent.cropId && ent.plantedAt) {
          const crop = CROPS[ent.cropId];
          if (crop) {
            const growMs = (crop.growTimeSeconds * 1000) / weatherMult;
            const elapsed = now - ent.plantedAt;
            const progress = Math.min(1.0, elapsed / growMs);
            const stage = (progress >= 1.0 ? 4 : Math.min(3, Math.floor(progress * 4))) as 0 | 1 | 2 | 3 | 4;
            entGroup.add(createCropStageMesh(crop.id, stage, crop.color));
          }
        }
      } else if (ent.type === 'fruit_tree') {
        const cfg = TREES_BUSHES[ent.configId];
        const hasFruit = !ent.isDead && (ent.treePlantedAt ? now >= ent.treePlantedAt + (cfg ? cfg.growTimeSeconds * 1000 : 60000) : true);
        entGroup.add(createTreeBushMesh(ent.configId, activeSeason, hasFruit));
      } else if (ent.type === 'obstacle') {
        entGroup.add(createObstacleMesh(ent.configId));
      } else if (ent.type === 'decoration') {
        entGroup.add(createDecorationMesh(ent.configId));
      }

      // Selection or Relocation highlight ring
      if (selectedEntityId === ent.id || isMovingThis) {
        const selGeo = new THREE.RingGeometry(curW * 0.55, curW * 0.68, 32);
        const selMat = new THREE.MeshBasicMaterial({ 
          color: isMovingThis ? 0xF59E0B : 0xFACC15, 
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const selMesh = new THREE.Mesh(selGeo, selMat);
        selMesh.rotation.x = -Math.PI / 2;
        selMesh.position.y = 0.08;
        entGroup.add(selMesh);
      }

      entitiesGroup.add(entGroup);
    });
  }, [entities, selectedEntityId, activeEvent, activeSeason, movingEntityId, movingPos, movingRotation]);

  // Update placement preview grid without React re-renders
  const updatePlacementPreview = useCallback((tile: { x: number; z: number } | null) => {
    if (!previewGridGroupRef.current) return;
    const previewGridGroup = previewGridGroupRef.current;
    while (previewGridGroup.children.length > 0) {
      previewGridGroup.remove(previewGridGroup.children[0]);
    }

    // 1. Moving Entity Preview
    const { id: mId, pos: mPos, rot: mRot } = movingRef.current;
    if (mId && (tile || mPos)) {
      const activeTile = tile || mPos;
      const mEnt = entities.find(e => e.id === mId);
      if (mEnt && activeTile) {
        const pW = (mRot % 2 === 1) ? mEnt.depth : mEnt.width;
        const pD = (mRot % 2 === 1) ? mEnt.width : mEnt.depth;
        const valid = isAreaAvailable(activeTile.x, activeTile.z, pW, pD, mId) &&
                      isAreaInsideUnlockedTerritory(activeTile.x, activeTile.z, pW, pD);

        const pGeo = new THREE.PlaneGeometry(pW, pD);
        const pMat = new THREE.MeshBasicMaterial({
          color: valid ? 0x22C55E : 0xEF4444,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.rotation.x = -Math.PI / 2;
        pMesh.position.set(activeTile.x + pW / 2, 0.1, activeTile.z + pD / 2);
        previewGridGroup.add(pMesh);

        const gridHelper = new THREE.GridHelper(Math.max(pW, pD), Math.max(pW, pD), valid ? 0x16A34A : 0xDC2626, valid ? 0x16A34A : 0xDC2626);
        gridHelper.position.set(activeTile.x + pW / 2, 0.12, activeTile.z + pD / 2);
        previewGridGroup.add(gridHelper);
        return;
      }
    }

    // 2. Placing Building Preview
    const { configId, rotation } = placingRef.current;
    if (!configId || !tile) return;

    const bConfig = BUILDINGS[configId] || DECORATIONS[configId] || TREES_BUSHES[configId];
    if (bConfig) {
      const pW = (rotation % 2 === 1) ? bConfig.depth : bConfig.width;
      const pD = (rotation % 2 === 1) ? bConfig.width : bConfig.depth;
      const valid = isAreaAvailable(tile.x, tile.z, pW, pD, movingEntityId || undefined, configId) &&
                    isAreaInsideUnlockedTerritory(tile.x, tile.z, pW, pD);

      const pGeo = new THREE.PlaneGeometry(pW, pD);
      const pMat = new THREE.MeshBasicMaterial({
        color: valid ? 0x22C55E : 0xEF4444,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set(tile.x + pW / 2, 0.1, tile.z + pD / 2);
      previewGridGroup.add(pMesh);

      const gridHelper = new THREE.GridHelper(Math.max(pW, pD), Math.max(pW, pD), valid ? 0x16A34A : 0xDC2626, valid ? 0x16A34A : 0xDC2626);
      gridHelper.position.set(tile.x + pW / 2, 0.12, tile.z + pD / 2);
      previewGridGroup.add(gridHelper);
    }
  }, [entities, isAreaAvailable, isAreaInsideUnlockedTerritory]);

  useEffect(() => {
    updatePlacementPreview(hoveredTileRef.current);
  }, [placingBuildingConfigId, placingRotation, movingEntityId, movingPos, movingRotation, updatePlacementPreview]);

  // Continuous Swipe Action for rapid farming
  const executeSwipeActionOnTile = useCallback((tileX: number, tileZ: number) => {
    const hitEntity = entities.find(e => 
      tileX >= e.x && tileX < e.x + e.width &&
      tileZ >= e.z && tileZ < e.z + e.depth
    );

    if (!hitEntity) return;
    if (swipedEntitiesRef.current.has(hitEntity.id)) return;

    if (activeTool?.type === 'plant' && hitEntity.type === 'field' && activeTool.configId) {
      if (!hitEntity.cropId) {
        plantCrop(hitEntity.id, activeTool.configId);
        swipedEntitiesRef.current.add(hitEntity.id);
      }
    } else if (activeTool?.type === 'harvest') {
      if (hitEntity.type === 'field' && hitEntity.cropId) {
        harvestCrop(hitEntity.id);
        swipedEntitiesRef.current.add(hitEntity.id);
      } else if (hitEntity.type === 'fruit_tree') {
        harvestTreeBush(hitEntity.id);
        swipedEntitiesRef.current.add(hitEntity.id);
      }
    } else if (activeTool?.type === 'feed' && hitEntity.type === 'animal_pen' && hitEntity.animals) {
      const hungryAnimal = hitEntity.animals.find(a => a.isHungry);
      if (hungryAnimal) {
        feedAnimal(hitEntity.id, hungryAnimal.id);
        swipedEntitiesRef.current.add(hitEntity.id);
      }
    } else if (activeTool?.type === 'collect' && hitEntity.type === 'animal_pen' && hitEntity.animals) {
      const readyAnimal = hitEntity.animals.find(a => a.hasProduct);
      if (readyAnimal) {
        collectAnimalProduct(hitEntity.id, readyAnimal.id);
        swipedEntitiesRef.current.add(hitEntity.id);
      }
    }
  }, [entities, activeTool, plantCrop, harvestCrop, harvestTreeBush, feedAnimal, collectAnimalProduct]);

  // -------------------------------------------------------------------
  // 4. ULTRA-FAST ZERO-ALLOCATION POINTER EVENTS
  // -------------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartScreenRef.current = { x: e.clientX, y: e.clientY };
    dragStartCamRef.current = { x: targetCamPosRef.current.x, z: targetCamPosRef.current.z };
    swipedEntitiesRef.current.clear();

    const tile = getTileIntersection(e.clientX, e.clientY);
    if (tile && activeTool) {
      executeSwipeActionOnTile(tile.x, tile.z);
    } else if (tile && !placingBuildingConfigId && !movingEntityId) {
      // Long-press detection to trigger building move/relocate mode!
      const hitEntity = entities.find(ent => 
        tile.x >= ent.x && tile.x < ent.x + ent.width &&
        tile.z >= ent.z && tile.z < ent.z + ent.depth
      );
      if (hitEntity) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = window.setTimeout(() => {
          startMovingEntity(hitEntity.id);
          longPressTimerRef.current = null;
        }, 340);
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const tile = getTileIntersection(e.clientX, e.clientY);
    if (tile) {
      hoveredTileRef.current = tile;
      if (placingRef.current.configId || movingRef.current.id) {
        updatePlacementPreview(tile);
      }
    }

    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartScreenRef.current.x;
    const dy = e.clientY - dragStartScreenRef.current.y;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasMovedRef.current = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Direct Drag Relocation of Moving Entity
    if (movingRef.current.id && tile) {
      setMovingPos(tile.x, tile.z);
      updatePlacementPreview(tile);
      return;
    }

    if (activeTool && tile) {
      executeSwipeActionOnTile(tile.x, tile.z);
    } else if (!placingRef.current.configId && !movingRef.current.id && containerRef.current) {
      const viewportHeight = containerRef.current.clientHeight;
      const zoom = currentZoomRef.current;
      
      const worldScale = (zoom * 2) / viewportHeight;
      // Intuitive direct map grab-and-drag (1:1 with pointer movement)
      const worldDeltaX = (-dx * 0.7071 - dy * 0.7071 * 1.55) * worldScale;
      const worldDeltaZ = (dx * 0.7071 - dy * 0.7071 * 1.55) * worldScale;

      targetCamPosRef.current.x = Math.max(-24, Math.min(24, dragStartCamRef.current.x + worldDeltaX));
      targetCamPosRef.current.z = Math.max(-24, Math.min(24, dragStartCamRef.current.z + worldDeltaZ));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    touchDistanceRef.current = null;
    swipedEntitiesRef.current.clear();

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If currently moving an entity, let user confirm via button or click
    if (movingEntityId) {
      return;
    }

    if (!hasMovedRef.current) {
      const tile = getTileIntersection(e.clientX, e.clientY);
      if (!tile) return;

      if (placingBuildingConfigId) {
        placeBuilding(placingBuildingConfigId, tile.x, tile.z, placingRotation);
        return;
      }

      const clickedChunk = expansions.find(
        c => !c.isUnlocked && 
        tile.x >= c.x && tile.x < c.x + c.width &&
        tile.z >= c.z && tile.z < c.z + c.depth
      );
      if (clickedChunk) {
        unlockExpansionChunk(clickedChunk.id);
        return;
      }

      const clickedEntity = entities.find(ent => 
        tile.x >= ent.x && tile.x < ent.x + ent.width &&
        tile.z >= ent.z && tile.z < ent.z + ent.depth
      );

      if (clickedEntity) {
        setSelectedEntity(clickedEntity.id);

        if (clickedEntity.type === 'special') {
          if (clickedEntity.configId === 'order_board') openModal('orders');
          else if (clickedEntity.configId === 'roadside_shop') openModal('roadside');
          else if (clickedEntity.configId === 'fishing_dock') openModal('fishing');
          else if (clickedEntity.configId === 'farmhouse') openModal('settings');
          else if (clickedEntity.configId === 'mailbox') openModal('mailbox');
        } else if (clickedEntity.type === 'storage') {
          if (clickedEntity.configId === 'silo') openModal('silo');
          else openModal('barn');
        } else if (clickedEntity.type === 'obstacle') {
          clearObstacle(clickedEntity.id);
        } else if (clickedEntity.type === 'production') {
          if (clickedEntity.completedProducts && clickedEntity.completedProducts.length > 0) {
            collectProduct(clickedEntity.id, 0);
          }
        }
      } else if (tile && Math.abs(tile.x - (-7.0)) <= 2.2 && Math.abs(tile.z - (-3.2)) <= 2.2 && cargoTruckStateRef.current.isParkedWaiting) {
        // Direct click on parked Cargo Semi-Truck (Фура) in Driveway 1 to unload goods!
        claimCargoTruckUnload();
      } else if (tile && Math.abs(tile.x - (-4)) <= 1.2 && Math.abs(tile.z - (-8)) <= 1.2) {
        // Direct click on roadside Mailbox
        openModal('mailbox');
      } else {
        setSelectedEntity(null);
      }
    }
  };

  // Keyboard Shortcuts (R to rotate, Escape to cancel, Enter to confirm)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        if (movingRef.current.id) rotateMovingEntity();
        else if (placingRef.current.configId) rotatePlacingBuilding();
      } else if (e.key === 'Escape') {
        if (movingRef.current.id) cancelMoveEntity();
        else if (placingRef.current.configId) setPlacingBuilding(null);
      } else if (e.key === 'Enter') {
        if (movingRef.current.id) confirmMoveEntity();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateMovingEntity, rotatePlacingBuilding, cancelMoveEntity, confirmMoveEntity, setPlacingBuilding]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.015;
    targetZoomRef.current = Math.max(11, Math.min(28, targetZoomRef.current + zoomDelta));
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (touchDistanceRef.current !== null) {
        const pinchDelta = (touchDistanceRef.current - dist) * 0.05;
        targetZoomRef.current = Math.max(11, Math.min(28, targetZoomRef.current + pinchDelta));
      }
      touchDistanceRef.current = dist;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full select-none touch-none overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onTouchMove={onTouchMove}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
};
