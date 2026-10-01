import test from 'node:test';
import assert from 'node:assert/strict';
import {anchorControlAction} from '../src/anchoring/control-action.js';
import {anchorSnapshot,initializeAnchoredScenario} from '../src/anchor.js';
import {initialState,step} from '../src/physics.js';
import {applyControlPatch} from '../src/vessel-controls.js';

const boat=()=>Object.assign(initialState(),{x:3000,z:3000,heading:0,windSpeed:0,currentSpeed:0,sails:0,worldBodies:[]});
const click=s=>{const action=anchorControlAction(s);if(!action.needsTarget)applyControlPatch(s,action.patch);return action;};

test('stowed shortcut requests a positive target and never mutates state while choosing an action',()=>{
 const s=boat();applyControlPatch(s,{anchorRode:0});const before=structuredClone(s);
 assert.deepEqual(anchorControlAction(s),{label:'Drop anchor',patch:{anchor:true},needsTarget:true});
 click(s);assert.deepEqual(s,before);
 applyControlPatch(s,{anchorRode:45});assert.equal(anchorControlAction(s).needsTarget,false);
 assert.equal(click(s).label,'Drop anchor');assert.equal(s.anchor,true);assert.equal(s.anchorPaidRode,0);
 assert.equal(anchorSnapshot(s).status,'pending');assert.equal(anchorControlAction(s).label,'Stop windlass');
});

test('one dock shortcut stops and resumes active lowering without skipping actual paid length',()=>{
 const s=boat();applyControlPatch(s,{anchorRode:10});click(s);step(s,1);
 const paid=s.anchorPaidRode,point=anchorSnapshot(s).anchorPoint;
 assert.equal(click(s).label,'Stop windlass');assert.equal(s.anchorWinchRunning,false);assert.equal(s.anchorPaidRode,paid);
 assert.equal(anchorControlAction(s).label,'Resume windlass');assert.deepEqual(anchorSnapshot(s).anchorPoint,point);
 assert.equal(click(s).label,'Resume windlass');assert.equal(s.anchorWinchRunning,true);assert.equal(s.anchorPaidRode,paid);
 step(s,1);assert.ok(s.anchorPaidRode>paid);assert.equal(anchorControlAction(s).label,'Stop windlass');
});

test('weigh shortcut starts timed retrieval and offers stop/resume until physically stowed',()=>{
 const s=initializeAnchoredScenario(boat(),{rode:45});
 assert.deepEqual(anchorControlAction(s),{label:'Weigh anchor',patch:{anchor:false}});
 click(s);assert.equal(s.anchor,true);assert.equal(s.anchorPaidRode,45);assert.equal(anchorSnapshot(s).operation,'retrieving');
 assert.equal(click(s).label,'Stop windlass');assert.equal(anchorControlAction(s).label,'Resume windlass');
 click(s);for(let i=0;i<90;i++)step(s,2);
 assert.equal(s.anchor,false);assert.equal(s.anchorPaidRode,0);assert.equal(anchorControlAction(s).label,'Drop anchor');assert.equal(anchorControlAction(s).needsTarget,true);
});

test('blocked recovery always offers stop and a stopped changed target resumes instead of weighing',()=>{
 const s=initializeAnchoredScenario(boat(),{rode:45}),radius=anchorSnapshot(s).swingRadius;
 s.x+=radius;applyControlPatch(s,{anchor:false});assert.equal(anchorSnapshot(s).operation,'blocked');
 const paid=s.anchorPaidRode,position={x:s.x,z:s.z};assert.deepEqual(anchorControlAction(s),{label:'Stop windlass',patch:{anchorWinchRunning:false}});
 click(s);assert.equal(s.anchorPaidRode,paid);assert.deepEqual({x:s.x,z:s.z},position);
 applyControlPatch(s,{anchorRode:60});assert.equal(anchorControlAction(s).label,'Resume windlass');click(s);
 assert.equal(anchorSnapshot(s).operation,'lowering');assert.equal(s.anchorPaidRode,paid);
});
