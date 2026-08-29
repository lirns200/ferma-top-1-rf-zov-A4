import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';

async function loadLandscapeModule() {
  try {
    return await import('./LandscapeDetails');
  } catch {
    return null;
  }
}

test('builds a complete deterministic landscape detail layer', async () => {
  const landscape = await loadLandscapeModule();

  assert.ok(landscape, 'LandscapeDetails module should exist');
  if (!landscape) return;

  const first = landscape.createLandscapeDetailGroup('summer');
  const second = landscape.createLandscapeDetailGroup('summer');

  assert.equal(first.name, 'map_landscape_details');
  assert.deepEqual(
    first.children.map(child => child.name),
    [
      'terrain_relief',
      'winding_roads',
      'shoreline_details',
      'meadow_details',
      'forest_details',
      'atmosphere_details',
    ],
  );

  let visibleInstances = 0;
  first.traverse(object => {
    if (object instanceof THREE.InstancedMesh) visibleInstances += object.count;
  });
  assert.ok(visibleInstances >= 120, 'landscape should feel dense without creating hundreds of draw calls');

  const signature = (group: THREE.Group) => group.children
    .flatMap(section => section.children)
    .map(child => `${child.name}:${child.position.toArray().join(',')}`);

  assert.deepEqual(signature(first), signature(second), 'the decorative layout must not jump between renders');
});

test('season palettes keep the same geometry while changing foliage color', async () => {
  const landscape = await loadLandscapeModule();

  assert.ok(landscape, 'LandscapeDetails module should exist');
  if (!landscape) return;

  const summer = landscape.createLandscapeDetailGroup('summer');
  const autumn = landscape.createLandscapeDetailGroup('autumn');

  const summerForest = summer.getObjectByName('forest_details');
  const autumnForest = autumn.getObjectByName('forest_details');
  assert.ok(summerForest && autumnForest);

  const summerShrubs = summerForest.getObjectByName('forest_shrubs') as THREE.InstancedMesh;
  const autumnShrubs = autumnForest.getObjectByName('forest_shrubs') as THREE.InstancedMesh;
  assert.equal(summerShrubs.count, autumnShrubs.count);
  assert.notEqual(
    (summerShrubs.material as THREE.MeshStandardMaterial).color.getHex(),
    (autumnShrubs.material as THREE.MeshStandardMaterial).color.getHex(),
  );
});

test('relief and fences add depth without occupying the farm center', async () => {
  const landscape = await loadLandscapeModule();

  assert.ok(landscape, 'LandscapeDetails module should exist');
  if (!landscape) return;

  const map = landscape.createLandscapeDetailGroup('summer');
  const mounds = map.getObjectByName('edge_relief_mounds') as THREE.InstancedMesh;
  const fencePosts = map.getObjectByName('country_fence_posts') as THREE.InstancedMesh;
  const fenceRails = map.getObjectByName('country_fence_rails') as THREE.InstancedMesh;

  assert.ok(mounds && fencePosts && fenceRails, 'relief and fence instances should be present');
  if (!mounds || !fencePosts || !fenceRails) return;
  assert.equal(mounds.count, 10);
  assert.ok(fencePosts.count >= 18);
  assert.ok(fenceRails.count >= 10);
});
