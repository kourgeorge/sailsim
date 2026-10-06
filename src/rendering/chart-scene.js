import { createChartRenderer } from '../navigation/chart.js';
import { getLocation } from '../locations.js';
import { translate as t } from '../i18n/runtime.js';

// A working sailing view for browsers that cannot create a WebGL context.
// It shares the live physics, coastline, traffic and training overlays.
export function createChartScene(container, {locationId, vesselId}) {
  container.replaceChildren();
  const canvas=document.createElement('canvas'), label=document.createElement('div');
  canvas.setAttribute('aria-label',t('Live sailing chart'));
  label.className='chart-view-notice';
  label.textContent=t('Chart view · 3D unavailable');
  Object.assign(label.style,{position:'absolute',bottom:'18px',left:'18px',background:'#102f3de8',color:'#e7d2aa',padding:'9px 12px',borderRadius:'8px',fontSize:'12px',pointerEvents:'none'});
  container.append(canvas,label);
  Object.assign(container.dataset,{renderer:'chart',location:locationId,vessel:vesselId,renderPending:'false'});
  let state,training=null,race=null,dirty=true,lastTime;
  const location=getLocation(locationId);
  const draw=createChartRenderer({getState:()=>state,getTraining:()=>training,getChallengeIndex:()=>-1,getRace:()=>race});
  function render(next,time) {
    state=next;lastTime=time;
    const ratio=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.max(1,Math.round(container.clientWidth*ratio));
    canvas.height=Math.max(1,Math.round(container.clientHeight*ratio));
    draw(canvas,{pixelRatio:ratio}); dirty=false;
    container.dataset.renderPending='false';
  }
  const observer=new ResizeObserver(()=>{dirty=true;});observer.observe(container);
  return {
    locationId,vesselId,get ready(){return Boolean(state);},render,
    renderIfNeeded(next,time){if(dirty||next!==state||time!==lastTime)render(next,time);},
    invalidate(){dirty=true;},setView(){dirty=true;},
    setTrainingCues(cues){training=cues?{center:location.start,span:location.chart.span,cues}:null;dirty=true;},
    setRace(value){race=value;dirty=true;},getInstrumentCanvas:()=>canvas,
    capture:()=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Chart capture failed')),'image/png')),
    dispose(){observer.disconnect();canvas.remove();label.remove();delete container.dataset.renderer;},
  };
}
