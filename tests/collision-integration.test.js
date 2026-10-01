import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,step,refreshDerived,KNOT} from '../src/physics.js';
import {createRigidBody} from '../src/collisions.js';

const fixture=(kind='free')=>{
 const state=Object.assign(initialState(),{x:3000,z:3000,heading:90,speed:4,sails:0,mainHoist:0,jibHoist:0,windSpeed:0,currentSpeed:0,worldBodies:[createRigidBody({id:'target',kind,mass:2800,x:3007,z:3000,heading:0,shape:{type:'box',length:8,beam:2},linearDamping:.05})]});
 return state;
};
test('player collision changes both movable bodies and records a latched contact event',()=>{
 const state=fixture();step(state,.2);
 const target=state.worldBodies[0];
 assert.ok(state.collisionCount>=1);assert.equal(state.collision.bodyId,'target');
 assert.ok(state.speed<4);assert.ok(target.x>3007&&target.vx>0);
 assert.ok(state.collision.impulse>0);assert.ok(state.collision.closingSpeed>0);
 assert.equal(state.collision.sequence,state.collisionCount);
 assert.equal(target.lastImpact.otherId,'player');assert.equal(state._playerBody.lastImpact.otherId,'target');
 assert.ok(target.lastImpact.time<=state.elapsed);assert.ok(Number.isFinite(target.lastImpact.point.x));
 const last=structuredClone(state.collision);state.x=2900;state.speed=0;step(state,.2);
 assert.deepEqual(state.collision,last);assert.equal(state.contactActive,false);
});

test('continuous contact is deduplicated, real re-contact creates a new episode, and resets isolate worlds',()=>{
 const state=fixture('fixed');state.throttle=.6;
 for(let i=0;i<100;i++)step(state,.02);
 assert.equal(state.collisionCount,1);assert.equal(state.worldBodies[0].x,3007);
 assert.equal(state.contactActive,true,'an ongoing contact episode must block fresh assessment attempts');
 state.x=2900;state.speed=0;step(state,.5);state.x=3000;state.speed=4;step(state,.2);
 assert.equal(state.collisionCount,2);assert.equal(state.collisionEvents.length,2);
 const fresh=initialState(),other=initialState('shelter');
 assert.equal(fresh.collision,null);assert.equal(fresh.collisionCount,0);assert.equal(other.collisionCount,0);
 fresh.worldBodies.find(b=>b.kind!=='fixed').x+=100;
 assert.notEqual(fresh.worldBodies.find(b=>b.kind!=='fixed').x,initialState().worldBodies.find(b=>b.kind!=='fixed').x);
 assert.ok(other.worldBodies.every(b=>b.id.startsWith('shelter:')));
});

test('ground-frame contact velocity converts back to signed water speed and leeway',()=>{
 const state=fixture();state.currentSpeed=2;state.currentDirection=90;
 step(state,.2);
 const h=state.heading*Math.PI/180;
 const vx=Math.sin(h)*state.speed*KNOT+Math.cos(h)*state.leeway+2*KNOT;
 const vz=-Math.cos(h)*state.speed*KNOT+Math.sin(h)*state.leeway;
 assert.ok(Math.abs(vx-state._playerBody.vx)<1e-8);
 assert.ok(Math.abs(vz-state._playerBody.vz)<1e-8);
 assert.ok(Math.abs(state.speedOverGround-Math.hypot(vx,vz)/KNOT)<1e-8);
});

test('paused telemetry does not move world bodies, create contact events, or advance collision time',()=>{
 const state=fixture(),before=structuredClone(state.worldBodies);
 refreshDerived(state);refreshDerived(state);
 assert.deepEqual(state.worldBodies,before);assert.equal(state.collision,null);assert.equal(state.elapsed,0);
});
