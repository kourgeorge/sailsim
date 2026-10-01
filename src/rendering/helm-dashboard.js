import {translate as t} from '../i18n/runtime.js';
import {windOverWater} from '../physics.js';
import './helm-dashboard.css';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(value,digits=1)=>Number.isFinite(value)?value.toFixed(digits):'—';
const bearing=value=>Number.isFinite(value)?`${String(Math.round((value%360+360)%360)%360).padStart(3,'0')}°`:'—';
const relative=value=>Number.isFinite(value)?`${value<-.5?'←':value>.5?'→':'↑'} ${Math.abs(value).toFixed(0)}°`:'—';
function reading(label,key,detail){
 return `<div class="dashboard-reading"><dt>${esc(t(label))}</dt><dd><bdi dir="ltr" data-dashboard-value="${key}">—</bdi></dd><div class="dashboard-detail">${detail||''}</div></div>`;
}
function readings(){
 return `<dl class="dashboard-readings">
 ${reading('BOAT SPEED','speed',`${esc(t('SOG'))} <bdi dir="ltr" data-dashboard-value="sog"></bdi>`)}
 ${reading('HEADING','heading',`${esc(t('COG'))} <bdi dir="ltr" data-dashboard-value="cog"></bdi>`)}
 ${reading('DEPTH','depth')}
 ${reading('APPARENT WIND','apparent-speed',`<bdi dir="ltr" data-dashboard-value="apparent-angle"></bdi>`)}
 ${reading('Wind over water','water-speed',`<bdi dir="ltr" data-dashboard-value="water-direction"></bdi> <span aria-hidden="true">·</span> <bdi dir="ltr" data-dashboard-value="water-angle"></bdi>`)}
 ${reading('Helm angle','rudder',`${esc(t('Engine throttle'))} <bdi dir="ltr" data-dashboard-value="throttle"></bdi>`)}
 </dl>`;
}

// Native text stays sharp at browser/device resolution, independently of the
// 3D camera distance, texture sampling, WebGL resolution and language direction.
export function createHelmDashboard({container,getState,openModal,onChart}){
 container.innerHTML=`<section id="helm-dashboard" class="helm-dashboard" data-dashboard-root data-no-translate aria-label="${esc(t('Dashboard'))}">${readings()}<div class="dashboard-actions"><button type="button" data-dashboard-chart title="${esc(t('Open navigation chart'))}">${esc(t('CHART'))}</button><button type="button" id="dashboard-enlarge" aria-label="${esc(t('Enlarge display'))}" title="${esc(t('Enlarge display'))}">↗</button></div></section>`;
 const bindCharts=root=>root.querySelectorAll('[data-dashboard-chart]').forEach(button=>button.onclick=onChart);
 bindCharts(container);
 container.querySelector('#dashboard-enlarge').onclick=()=>{
  openModal(`<section class="dashboard-expanded" data-dashboard-root data-no-translate><div class="eyebrow">${esc(t('Dashboard'))}</div><h2>${esc(t('Instruments'))}</h2>${readings()}<div class="dashboard-expanded-actions"><button class="training-button" data-dashboard-chart>${esc(t('Open navigation chart'))}</button><button class="training-button primary" id="dashboard-close">${esc(t('Close enlarged display'))}</button></div></section>`);
  bindCharts(document.querySelector('.dashboard-expanded'));
  document.querySelector('#dashboard-close').onclick=()=>document.querySelector('#modal').close();update();
 };
 function update(){
  const state=getState(),water=windOverWater(state),values={
   speed:`${number(state.speed,2)} kn`,sog:`${number(state.speedOverGround,2)} kn`,heading:bearing(state.heading),
   cog:state.speedOverGround>.05?bearing(state.courseOverGround):'—',depth:`${number(state.depth)} m`,
   'apparent-speed':`${number(state.apparentWindSpeed)} kn`,'apparent-angle':state.apparentWindSpeed>1e-9?relative(state.apparentWindAngle):'—',
   'water-speed':`${number(water.speed)} kn`,'water-direction':bearing(water.direction),'water-angle':relative(water.angle),
   rudder:relative(state.rudder),throttle:`${state.throttle<-.005?'▼':state.throttle>.005?'▲':'–'} ${number(Math.abs(state.throttle)*100,0)}%`,
  };
  for(const node of document.querySelectorAll('[data-dashboard-value]')){
   const value=values[node.dataset.dashboardValue];if(node.textContent!==value)node.textContent=value;
  }
  for(const root of document.querySelectorAll('[data-dashboard-root]')){
   root.querySelector('[data-dashboard-value="speed"]').title=t('Speed through water');
   root.querySelector('[data-dashboard-value="water-direction"]').title=t(water.direction===null?'No wind direction':'Wind over water');
   root.querySelector('[data-dashboard-value="water-angle"]').title=t('Wind angle over water');
   root.querySelector('[data-dashboard-value="sog"]').title=t('SPEED OVER GROUND');
   root.querySelector('[data-dashboard-value="cog"]').title=t('Course over ground');
  }
 }
 update();return {update};
}
