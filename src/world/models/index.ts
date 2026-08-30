// ── Shared Materials & Geometry Helpers ──
export {
  getCachedColorMaterial,
  getSoftLightPoolTexture,
  getHeadlightGroundTexture,
  getLampHaloTexture,
} from './shared/materials';

export {
  createTriangularGable,
  createGambrelGable,
} from './shared/geometryHelpers';

// ── Vehicles / Cars ──
export { createStylizedDeliveryTruck } from './vehicles/DeliveryTruck';
export { createStylizedCargoSemiTruck } from './vehicles/CargoSemiTruck';

// ── Buildings ──
export { createFarmhouseGroup } from './buildings/Farmhouse';
export { createBarnGroup, createSiloGroup } from './buildings/StorageBuildings';
export { createOrderBoardGroup, createRoadsideShopGroup } from './buildings/CommerceBuildings';
export { createProductionBuildingGroup } from './buildings/ProductionBuildings';
export { createAnimalPenGroup } from './buildings/AnimalPens';

// ── Nature & Living World ──
export { createCropStageMesh } from './nature/Crops';
export { createTreeBushMesh } from './nature/TreesAndBushes';
export { createObstacleMesh } from './nature/Obstacles';
export { createDecorationMesh } from './nature/Decorations';
export { createAnimalMesh } from './nature/Animals';
export { createAnimatedBirdGroup } from './nature/Birds';

// ── Infrastructure & Water ──
export { createMountainTunnelGroup } from './infrastructure/Tunnels';
export { createFishingDockGroup } from './infrastructure/FishingDock';
export { createWindingRiverMesh } from './infrastructure/River';
export { createStreetLampPostMesh } from './infrastructure/StreetLamp';
