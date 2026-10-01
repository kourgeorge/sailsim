import {anchorSnapshot} from '../anchor.js';
import {groundVelocity,KNOT} from '../physics.js';
import {translate as t} from '../i18n/runtime.js';
import {renderAnchorDiagram} from './diagram.js';
import './monitor.css';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phaseLabels={stowed:'Stowed',pending:'Awaiting deployment',suspended:'Anchor suspended',slack:'Rode slack',taut:'Rode taut',dragging:'Anchor dragging'};
const phaseHelp={stowed:'The anchor is stowed. Plan depth, rode and swing room before deployment.',pending:'Resume simulation to deploy the anchor.',suspended:'The rode is too short to reach the seabed.',slack:'The rode is slack. Low speed alone does not show that the anchor is holding.',taut:'The rode is at the modeled swing limit. This does not prove a real anchor is set.',dragging:'The anchor is moving along the seabed. Reassess rode and holding.'};

export function createAnchorMonitor(root,{getState}){
 root.className='anchor-monitor';root.dataset.noTranslate='true';
 root.innerHTML=`<div class="anchor-monitor-heading"><strong>${esc(t('Anchor monitor'))}</strong><span data-anchor-phase role="status"></span></div><p data-anchor-help></p><div class="anchor-metrics">${[['rode','Rode length'],['depth','Depth at anchor'],['scope','Scope'],['speed','Ground speed']].map(([key,label])=>`<div><span>${esc(t(label))}</span><bdi data-anchor-metric="${key}" dir="ltr"></bdi></div>`).join('')}</div><details class="anchor-geometry" open><summary>${esc(t('Rode geometry'))}</summary><figure><div data-anchor-figure></div><figcaption>${esc(t('Side view · schematic'))}</figcaption></figure><div class="anchor-metrics">${[['height','Bow height'],['distance','Distance from anchor'],['radius','Maximum bow radius']].map(([key,label])=>`<div><span>${esc(t(label))}</span><bdi data-anchor-metric="${key}" dir="ltr"></bdi></div>`).join('')}</div><p class="anchor-limits">${esc(t('Allow additional room for the rest of the yacht beyond the bow radius.'))}</p></details><p data-anchor-short-scope hidden></p>`;
 let lastFigure='',lastStatus='';
 function update(){
  const state=getState(),snapshot=anchorSnapshot(state),velocity=groundVelocity(state),speed=Math.hypot(velocity.x,velocity.z)/KNOT;
  root.dataset.anchorPhase=snapshot.status;
  const pending=snapshot.adjustmentPending&&snapshot.reachesBottom;
  const help=t(pending?'Resume simulation to deploy the anchor.':phaseHelp[snapshot.status]);
  if(lastStatus!==snapshot.status+help){root.querySelector('[data-anchor-phase]').textContent=t(phaseLabels[snapshot.status]);root.querySelector('[data-anchor-help]').textContent=help;lastStatus=snapshot.status+help;}
  const metrics={rode:`${snapshot.rode.toFixed(0)} m`,depth:`${snapshot.anchorDepth.toFixed(1)} m`,scope:snapshot.deployed?`${snapshot.scope.toFixed(1)}:1`:'—',speed:`${speed.toFixed(2)} kn`,height:`${snapshot.fairlead.y.toFixed(1)} m`,distance:snapshot.seabedContact?`${snapshot.distance.toFixed(1)} m`:'—',radius:snapshot.seabedContact?`${snapshot.swingRadius.toFixed(1)} m`:'—'};
  for(const [key,value] of Object.entries(metrics)){const node=root.querySelector(`[data-anchor-metric="${key}"]`);if(node.textContent!==value)node.textContent=value;}
  const warning=root.querySelector('[data-anchor-short-scope]');warning.hidden=!snapshot.seabedContact||!snapshot.shortScope;warning.textContent=warning.hidden?'':t('The model gives reduced restraint at short scope. This is not a recommended scope.');
  // Avoid replacing the SVG for sub-pixel motion and leave disclosure/focus intact.
  const stamp=JSON.stringify([snapshot.status,snapshot.anchorDepth.toFixed(1),snapshot.distance.toFixed(1),snapshot.swingRadius.toFixed(1),snapshot.anchorPoint?.y.toFixed(1)]);
  if(stamp!==lastFigure){root.querySelector('[data-anchor-figure]').innerHTML=renderAnchorDiagram(snapshot,t);lastFigure=stamp;}
 }
 update();return {update};
}
