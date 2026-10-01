import { bowFairlead } from '../src/anchor.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS, DEFAULT_LOCATION_ID, getLocation } from '../src/locations.js';
import { initialState, depthAt, islands, buoys, refreshDerived, step, VESSEL } from '../src/physics.js';
import { islandRatio, islandHeight, shoreScale } from '../src/rendering/geography.js';

const near = (a,b,tolerance=1e-8) => assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);
test('three immutable fictional locations keep the original course aliases',()=>{
  assert.deepEqual(LOCATIONS.map(l=>l.id),['haven','shelter','strait']);
  assert.equal(DEFAULT_LOCATION_ID,'haven');
  assert.equal(islands,getLocation('haven').islands);assert.equal(buoys,getLocation('haven').buoys);
  assert.equal(getLocation('unknown'),getLocation('haven'));assert.equal(initialState('unknown').locationId,'haven');
  assert.throws(()=>{getLocation('shelter').islands[0].x=0;},TypeError);
  assert.throws(()=>{getLocation('strait').buoys.push({x:0,z:0});},TypeError);
});
for(const location of LOCATIONS){
  test(`${location.id}: safe start and three reachable buoy legs`,()=>{
    const state=initialState(location.id);
    assert.equal(state.locationId,location.id);
    assert.equal(state.heading,location.start.heading);
    assert.equal(state.windSpeed,location.conditions.windSpeed);
    assert.equal(state.currentSpeed,location.conditions.currentSpeed);
    near(state.depth,depthAt(state.x,state.z,location.id));
    assert.ok(state.depth>VESSEL.draft+4);
    assert.equal(location.buoys.length,3);
    let previous=location.start;
    for(const mark of location.buoys){
      for(let i=0;i<=100;i++){
        const t=i/100,x=previous.x+(mark.x-previous.x)*t,z=previous.z+(mark.z-previous.z)*t;
        assert.ok(depthAt(x,z,location.id)>=3,`unsafe course leg at ${x},${z}`);
      }
      previous=mark;
    }
  });
  test(`${location.id}: terrain shoreline and zero-depth boundary coincide`,()=>{
    for(const island of location.islands){
      assert.equal(depthAt(island.x,island.z,location.id),0);
      assert.ok(islandHeight(island.x,island.z,island)>0);
      for(const angle of [0,.8,1.7,3.2,5.3]){
        const r=shoreScale(angle),x=island.x+Math.cos(angle)*island.rx*r,z=island.z+Math.sin(angle)*island.rz*r;
        near(islandRatio(x,z,island),1);near(depthAt(x,z,location.id),0);
        near(islandHeight(x,z,island),0);
      }
    }
  });
  test(`${location.id}: cockpit refresh and anchor use the selected bathymetry`,()=>{
    const s=initialState(location.id);s.sails=0;s.anchor=true;s.anchorRode=180;
    refreshDerived(s);const depth=depthAt(s.x,s.z,location.id);
    const fairlead=bowFairlead(s),anchorDepth=depthAt(fairlead.x,fairlead.z,location.id);
    near(s.depth,depth);near(s.anchorScope,180/(anchorDepth+VESSEL.bowHeight));
    step(s,.02);assert.ok(s._anchor);near(s._anchor.depth,anchorDepth);
  });
}
test('grounding uses the selected location instead of the Haven fallback',()=>{
  const island=getLocation('shelter').islands[1];
  assert.equal(depthAt(island.x,island.z,'shelter'),0);
  assert.ok(depthAt(island.x,island.z,'haven')>VESSEL.draft);
  const bay=Object.assign(initialState('shelter'),{x:island.x,z:island.z,sails:0,windSpeed:0});
  const haven=Object.assign(initialState('haven'),{x:island.x,z:island.z,sails:0,windSpeed:0});
  step(bay,.1);step(haven,.1);assert.equal(bay.grounded,true);assert.equal(haven.grounded,false);
});
test('each location has a different depth ceiling and geography, not just a new color',()=>{
  assert.equal(new Set(LOCATIONS.map(l=>JSON.stringify(l.islands))).size,3);
  assert.deepEqual(LOCATIONS.map(l=>depthAt(5000,5000,l.id)),[35,25,55]);
  assert.equal(getLocation('strait').marina,null);
});
