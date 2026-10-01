import test from 'node:test';
import assert from 'node:assert/strict';
import {activityState} from '../src/activity/state.js';
test('reading has priority over active training and offers resume without claiming motion',()=>{const s=activityState({reading:true,decisionOpen:true,decisionActive:true,paused:false});assert.equal(s.id,'study');assert.equal(s.action,'Resume training');assert.match(s.message,/No simulation is running/);});
test('a ready lesson is visibly distinct from a running or paused physical attempt',()=>{assert.equal(activityState({}).id,'ready');assert.equal(activityState({practiceActive:true,paused:false}).id,'training-running');assert.equal(activityState({practiceActive:true,paused:true}).id,'training-paused');assert.equal(activityState({practiceStatus:'passed',paused:true}).id,'review');});
test('unassessed movement is never represented as assessed practice',()=>{assert.equal(activityState({paused:false}).id,'free-running');assert.match(activityState({paused:false}).message,/No assessed/);assert.equal(activityState({decisionOpen:true,decisionActive:true}).id,'scenario-running');assert.equal(activityState({decisionOpen:true,decisionActive:false}).id,'review');});
