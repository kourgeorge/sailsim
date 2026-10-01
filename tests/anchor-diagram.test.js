import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,step,refreshDerived} from '../src/physics.js';
import {anchorSnapshot,initializeAnchoredScenario} from '../src/anchor.js';
import {anchorDiagramGeometry,renderAnchorDiagram,drawAnchorChart} from '../src/anchoring/diagram.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);

test('anchor diagram distinguishes unstarted, suspended and actual bottom deployment',()=>{
 const s=Object.assign(initialState(),{x:3000,z:3000,anchor:true,anchorRode:10,sails:0});
 let snapshot=anchorSnapshot(s),geometry=anchorDiagramGeometry(snapshot);
 assert.equal(snapshot.status,'pending');assert.equal(geometry.anchor,null);assert.equal(geometry.path,'');
 step(s,.02);snapshot=anchorSnapshot(s);geometry=anchorDiagramGeometry(snapshot);
 assert.equal(snapshot.status,'suspended');assert.ok(geometry.anchor.y<geometry.bottomY);
 close(geometry.anchor.x,geometry.bow.x);
 s.anchorRode=120;refreshDerived(s);assert.equal(anchorSnapshot(s).seabedContact,false);
 step(s,.02);assert.equal(anchorSnapshot(s).status,'suspended','a target edit cannot instantly put the anchor on bottom');
 initializeAnchoredScenario(s,{rode:120});snapshot=anchorSnapshot(s);geometry=anchorDiagramGeometry(snapshot);
 assert.equal(snapshot.status,'slack');close(geometry.anchor.y,geometry.bottomY);
 s.x+=30;snapshot=anchorSnapshot(s);geometry=anchorDiagramGeometry(snapshot);
 assert.ok(geometry.bow.x>geometry.anchor.x);
 const markup=renderAnchorDiagram(snapshot,key=>`<${key}>`);
 assert.match(markup,/&lt;Side view/);assert.doesNotMatch(markup,/<Side view/);
 assert.match(markup,/role="img"/);assert.notEqual(markup,renderAnchorDiagram(snapshot),'Each SVG has its own accessible title ID');
});

test('shallow and deep side projections remain within the view and preserve endpoint depth ratios',()=>{
 for(const depth of [0,.1,1,35,70]){
  const snapshot={status:'taut',anchorDepth:depth,vertical:depth+1.2,fairlead:{y:1.2},distance:20,swingRadius:20,anchorPoint:{y:-depth},seabedContact:true};
  const g=anchorDiagramGeometry(snapshot);
  assert.ok(g.bow.y>=20&&g.bottomY<=160&&g.waterY>=g.bow.y);
  close(g.anchor.y,g.bottomY);
  if(depth>0)close((g.bottomY-g.waterY)/(g.waterY-g.bow.y),depth/1.2);
 }
});

test('chart marks only real seabed contacts and uses the bow radius at shared world coordinates',()=>{
 const operations=[],ctx=new Proxy({},{get:(_,key)=> (...args)=>operations.push([key,...args]),set:()=>true});
 const map=(x,z)=>[2*x,2*z];
 drawAnchorChart(ctx,map,2,{seabedContact:false});assert.deepEqual(operations,[]);
 drawAnchorChart(ctx,map,2,{seabedContact:true,seabedPoint:{x:10,z:20},fairlead:{x:15,z:22},swingRadius:8,status:'slack'});
 assert.ok(operations.some(([kind,x,y,r])=>kind==='arc'&&x===20&&y===40&&r===16));
 assert.ok(operations.some(([kind,x,y])=>kind==='lineTo'&&x===30&&y===44));
 assert.equal(operations[0][0],'save');assert.equal(operations.at(-1)[0],'restore');
});
