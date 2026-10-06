import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { WORLD_DESTINATIONS, LOCATIONS, getLocation } from '../src/locations.js';
import { terrainHeights, terrainHeight, geographicPoint, worldMapPoint } from '../src/world/real-terrain.js';
import { depthAt, initialState, VESSEL } from '../src/physics.js';
import { createIslandTerrain } from '../src/rendering/shoreline.js';
import { createCoastalVillage } from '../src/rendering/coastal-village.js';
import { getCoastalFeatures } from '../src/world/coastal-features.js';
import { destinationBungalows } from '../src/world/destination-features.js';
import { getWorldBodyDefinitions } from '../src/world/bodies.js';
import { createDestinationScenery } from '../src/rendering/destination-scenery.js';
import { createDestinationNature } from '../src/rendering/destination-nature.js';
import { disposeSceneResources } from '../src/rendering/dispose.js';

test('ten geographic destinations coexist with the original four practice waters',()=>{
  assert.equal(WORLD_DESTINATIONS.length,10);assert.equal(LOCATIONS.length,14);
  assert.equal(new Set(LOCATIONS.map(p=>p.id)).size,14);
  for(const p of WORLD_DESTINATIONS){assert.equal(getLocation(p.id),p);assert.ok(Object.isFrozen(p.character));const point=worldMapPoint(p.coordinates);assert.ok(point.x>0&&point.x<100&&point.y>0&&point.y<100);}
  assert.ok(worldMapPoint(getLocation('bora-bora').coordinates).x<10);
  assert.ok(worldMapPoint(getLocation('bay-of-islands').coordinates).x>95);
});

for(const location of WORLD_DESTINATIONS) {
  test(`${location.id}: compressed terrain preserves the downloaded elevation grid and safe starts`,()=>{
    const land=location.islands[0],r=land.raster,heights=terrainHeights(r),bytes=Buffer.alloc(heights.length*2);
    assert.equal(heights.length,r.cols*r.rows);
    heights.forEach((h,i)=>{assert.ok(Number.isFinite(h));bytes.writeInt16LE(Math.round(h*10),i*2);});
    assert.equal(createHash('sha256').update(bytes).digest('hex'),location.terrainSource.sha256);
    assert.ok(location.terrainSource.cellMetres<=84);
    const state=initialState(location.id);assert.ok(state.depth>VESSEL.draft+4);
    let previous=location.start;
    for(const mark of location.buoys){for(let i=0;i<=30;i++){const a=i/30;assert.ok(depthAt(previous.x+(mark.x-previous.x)*a,previous.z+(mark.z-previous.z)*a,location.id)>3);}previous=mark;}
  });
  test(`${location.id}: rendered triangles and grounding sample the same terrain surface`,()=>{
    const island=location.islands[0],geometry=createIslandTerrain(island),pos=geometry.attributes.position,indices=geometry.index;
    assert.ok(indices.count>0 && indices.count/3<300000);
    for(let i=0;i<indices.count;i+=Math.max(3,Math.floor(indices.count/600/3)*3)) {
      const vertices=[0,1,2].map(j=>indices.getX(i+j));
      const x=vertices.reduce((s,k)=>s+pos.getX(k),0)/3,z=vertices.reduce((s,k)=>s+pos.getZ(k),0)/3,y=vertices.reduce((s,k)=>s+pos.getY(k),0)/3;
      assert.ok(Math.abs(terrainHeight(x,z,island)-y)<.03,`triangle at ${x},${z}`);
    }
    geometry.dispose();
  });
  test(`${location.id}: its waterfront has grounded buildings, finite traffic, and disposable scenery`,()=>{
    const features=getCoastalFeatures(location.id);assert.ok(features.length>5);
    for(const f of features)assert.equal(depthAt(f.x,f.z,location.id),0);
    const scene=new THREE.Scene(),scenery=createDestinationScenery(scene,location),nature=createDestinationNature(scene,location);
    scenery.update(37);nature.update(37);
    assert.ok([...scenery.cars.instanceMatrix.array].every(Number.isFinite));
    for(const road of scenery.roads)for(const p of road)assert.equal(depthAt(p.x,p.z,location.id),0);
    const huts=destinationBungalows(location),bodies=getWorldBodyDefinitions(location.id).filter(b=>b.visual.type==='bungalow');assert.equal(huts.length,bodies.length);
    const report=disposeSceneResources(scene);assert.ok(report.geometries>0);
  });
}

test('caldera, lagoon, and tiny Sandy Spit retain their distinct land/water topology',()=>{
  for(const [id,lat,lon] of [['santorini',36.430,25.392],['bora-bora',-16.485,-151.756]]){
    const p=getLocation(id),point=geographicPoint(p,lat,lon);assert.ok(depthAt(point.x,point.z,id)>3);
  }
  const bvi=getLocation('virgin-islands'),cay=bvi.islands.find(i=>i.name==='Sandy Spit');
  assert.ok(cay?.polygon.length>=8);assert.equal(depthAt(cay.x,cay.z,bvi.id),0);
  assert.ok(depthAt(cay.x+cay.rx+40,cay.z,bvi.id)>2);
  assert.ok(getCoastalFeatures(bvi.id).every(f=>Math.hypot(f.x-cay.x,f.z-cay.z)>200));
  const geometry=createIslandTerrain(cay);assert.ok([...geometry.attributes.normal.array].every(Number.isFinite));geometry.dispose();
});
test('empty settlements no longer masquerade as a WebGL failure',()=>{
  const scene=new THREE.Scene();assert.equal(createCoastalVillage(scene,[]),null);assert.equal(scene.children.length,0);
});
