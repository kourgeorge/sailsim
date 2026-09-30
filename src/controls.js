import './controls.css';
import { applyControlPatch } from './vessel-controls.js';
const ranges = [
  {group:'rig',key:'mainHoist',label:'Main halyard',min:0,max:1,step:.05,format:v=>`${Math.round(v*100)}% hoisted`,help:'Raise or lower the main independently. Reefing reduces its working area.'},
  {group:'rig',key:'jibHoist',label:'Headsail furler',min:0,max:1,step:.05,format:v=>`${Math.round(v*100)}% exposed`,help:'Change headsail area independently of the mainsail.'},
  {group:'rig',key:'jibSheet',label:'Headsail sheet',min:0,max:90,step:1,format:v=>`${Math.round(v)}° out`,help:'Trim to the apparent wind. Too far out luffs; too far in stalls.'},
  {group:'rig',key:'traveler',label:'Traveler',min:-20,max:20,step:1,format:v=>`${v>0?'+':''}${Math.round(v)}°`,help:'Negative moves the boom in; positive eases it out, relative to the mainsheet angle. Normalized for either tack.'},
  {group:'rig',key:'vang',label:'Boom vang',min:0,max:1,step:.05,format:v=>`${Math.round(v*100)}% tension`,help:'Controls modeled twist efficiency. More tension is useful when the boom is eased.'},
  {group:'rig',key:'outhaul',label:'Outhaul',min:0,max:1,step:.05,format:v=>`${Math.round(v*100)}% tension`,help:'Flatten the main as the breeze builds. This model uses a modest efficiency effect.'},
  {group:'engine',key:'throttle',label:'Engine throttle',min:-1,max:1,step:.05,format:v=>v===0?'Neutral':`${v<0?'Astern':'Ahead'} ${Math.round(Math.abs(v)*100)}%`,help:'Pass through neutral when changing direction. Allow momentum to decay before reverse develops.'},
  {group:'anchor',key:'anchorRode',label:'Anchor rode',min:0,max:250,step:5,format:v=>`${Math.round(v)} m`,help:'Include bow height when planning scope. Short rode may not reach bottom; short scope can drag.'},
];
export function mountControls(container,{getState,onChange,onAction=()=>{}}){
  const row=r=>`<label class="vessel-slider" for="vessel-${r.key}"><span>${r.label}<output id="vessel-${r.key}-value"></output></span><input id="vessel-${r.key}" data-vessel-control="${r.key}" type="range" min="${r.min}" max="${r.max}" step="${r.step}" aria-describedby="vessel-${r.key}-help"><small id="vessel-${r.key}-help">${r.help}</small></label>`;
  container.classList.add('vessel-controls');
  container.innerHTML=`<details class="vessel-panel"><summary><span>Vessel systems</span><span class="vessel-live" data-system-status>Rig · engine · anchor</span></summary><div class="vessel-instruments" aria-label="Live vessel instruments"><div>APPARENT WIND<strong data-reading="apparent"></strong></div><div>SPEED OVER GROUND<strong data-reading="sog"></strong></div><div>HEEL<strong data-reading="heel"></strong></div><div>SAIL FLOW<strong data-reading="flow"></strong></div></div><div class="vessel-tabs"><details open><summary>Sail handling &amp; shape</summary><div class="vessel-fields">${ranges.filter(r=>r.group==='rig').map(row).join('')}<label class="vessel-select" for="vessel-reefLevel">Mainsail reefs<select id="vessel-reefLevel" data-vessel-control="reefLevel"><option value="0">Full mainsail</option><option value="1">First reef · 72% area</option><option value="2">Second reef · 48% area</option></select></label></div><div class="vessel-actions"><button type="button" data-command="hoist">Hoist both</button><button type="button" data-command="lower">Lower both</button><button type="button" data-command="ease">Ease both sheets</button></div></details><details><summary>Engine &amp; close quarters</summary>${ranges.filter(r=>r.group==='engine').map(row).join('')}<div class="vessel-actions"><button type="button" data-command="neutral">Neutral</button><button type="button" data-command="center">Center helm</button></div><p>Astern motion reverses the steering response. Forward propwash gives limited steering at rest. Plan room to stop.</p></details><details><summary>Anchor &amp; holding</summary>${ranges.filter(r=>r.group==='anchor').map(row).join('')}<p class="vessel-anchor-status" data-reading="anchor"></p><div class="vessel-actions"><button type="button" data-command="anchor">Drop anchor</button></div><p>Rode limits the swing circle. Holding here is a simplified constraint, not a prediction for a real seabed.</p></details></div></details>`;
  function change(patch){onChange(patch);onAction('vessel-control',patch);update();}
  const inputHandler=e=>{const key=e.target.dataset.vesselControl;if(key)change({[key]:Number(e.target.value)});};
  const clickHandler=e=>{const command=e.target.closest('[data-command]')?.dataset.command;if(!command)return;const patches={hoist:{mainHoist:1,jibHoist:1},lower:{mainHoist:0,jibHoist:0},ease:{mainSheet:90,jibSheet:90},neutral:{throttle:0},center:{rudder:0},anchor:{anchor:!getState().anchor}};change(patches[command]);};
  container.addEventListener('input',inputHandler);container.addEventListener('click',clickHandler);
  function update(){const s=getState();for(const r of ranges){const input=container.querySelector(`[data-vessel-control="${r.key}"]`),v=Number(s[r.key]??0);if(document.activeElement!==input)input.value=v;container.querySelector(`#vessel-${r.key}-value`).textContent=r.format(v);}
    container.querySelector('#vessel-reefLevel').value=s.reefLevel||0;
    const read=(name,value)=>{container.querySelector(`[data-reading="${name}"]`).textContent=value;};
    read('apparent',`${(s.apparentWindSpeed||0).toFixed(1)} kn · ${Math.abs(s.apparentWindAngle||0).toFixed(0)}° ${(s.apparentWindAngle||0)<0?'P':'S'}`);
    read('sog',`${(s.speedOverGround||0).toFixed(1) } kn · ${(Math.round(s.courseOverGround??s.heading)%360).toString().padStart(3,'0')}°`);
    read('heel',`${Math.abs(s.heel||0).toFixed(1)}°`);read('flow',`Main ${s.mainFlow||'Ready'} · Jib ${s.jibFlow||'Ready'}`);
    read('anchor',`${s.anchorStatus||'Stowed'}${s.anchor?` · scope ${(s.anchorScope||0).toFixed(1)}:1 · depth ${s.depth.toFixed(1)} m`:''}`);
    container.querySelector('[data-command="anchor"]').textContent=s.anchor?'Weigh anchor':'Drop anchor';
    container.querySelector('[data-system-status]').textContent=Math.abs(s.throttle||0)>.01?`Engine ${s.throttle<0?'astern':'ahead'}`:s.anchor?'Anchor deployed':`${s.reefLevel||0} reefs · Engine neutral`;
  }
  update();return {update,destroy(){container.removeEventListener('input',inputHandler);container.removeEventListener('click',clickHandler);container.replaceChildren();}};
}
export { applyControlPatch };
