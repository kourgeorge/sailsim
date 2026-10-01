import {translate as t} from '../i18n/runtime.js';
import './controls.css';
import './dock.css';

/** Move existing controls, retaining their nodes/listeners, and add core rig controls. */
export function mountCockpitControls({container,getState,onChange,getEnabled=()=>true}){
 if(!container)throw new TypeError('Cockpit control container is required');
 if(container.dataset.cockpitMounted)throw new Error('Cockpit controls are already mounted');
 container.dataset.cockpitMounted='true';container.classList.add('cockpit-controls');
 // Inert blocks pointer/focus interaction; native disabled states also expose
 // availability to assistive technology. Preserve independently disabled controls.
 let enabled;const disabledControls=new Set();
 const syncAvailability=()=>{
  const next=Boolean(getEnabled());if(next===enabled)return;enabled=next;
  if(!enabled&&container.contains(document.activeElement))document.activeElement.blur();
  container.inert=!enabled;container.setAttribute('aria-disabled',String(!enabled));
  for(const control of container.querySelectorAll('button,input,select,textarea')){
   if(!enabled&&!control.disabled){control.disabled=true;disabledControls.add(control);}
   else if(enabled&&disabledControls.delete(control))control.disabled=false;
  }
 };
 for(const type of ['click','input','change'])container.addEventListener(type,event=>{
  if(!getEnabled()){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=t(text);return node;};
 const take=selector=>{const node=container.querySelector(selector);if(!node)throw new Error(`Missing existing cockpit control: ${selector}`);return node;};
 const helm=take('.helm-control'),main=take('.sail-control'),engine=take('.engine-control'),sailActions=take('.sail-actions'),anchor=take('#anchor');
 const groups=element('div','cockpit-control-groups');
 const group=(key,label)=>{const node=element('section',`cockpit-control-group cockpit-group-${key}`);node.setAttribute('aria-label',t(label));groups.append(node);return node;};
 group('helm','HELM').append(helm);
 group('sheets','Mainsheet').append(main);
 const jib=element('div','cockpit-jib-control'),jibTitle=element('div','control-title'),jibLabel=element('label','','Headsail sheet'),jibValue=element('output');
 jibLabel.htmlFor='cockpit-jib-sheet';jibValue.id='cockpit-jib-sheet-value';jibValue.htmlFor='cockpit-jib-sheet';jibValue.dir='ltr';
 const jibInput=element('input');Object.assign(jibInput,{type:'range',id:'cockpit-jib-sheet',min:'0',max:'90',step:'1'});jibInput.setAttribute('aria-label',t('Headsail sheet'));
 jibInput.addEventListener('input',()=>onChange({jibSheet:Number(jibInput.value)}));jibTitle.append(jibLabel,jibValue);jib.append(jibTitle,jibInput);group('headsail','Headsail sheet').append(jib);
 group('engine','Engine control').append(engine);
 const rig=group('rig','Sail handling & shape'),hoists=[];
 for(const [key,id,label] of [['mainHoist','cockpit-main-hoist','Main halyard'],['jibHoist','cockpit-jib-hoist','Headsail furler']]){
  const row=element('label','cockpit-hoist'),name=element('span','',label),select=element('select');select.id=id;row.htmlFor=id;select.setAttribute('aria-label',t(label));
  for(const value of [0,.5,1]){const option=element('option','',`${value*100}%`);option.value=String(value);select.append(option);}
  select.addEventListener('change',()=>onChange({[key]:Number(select.value)}));row.append(name,select);rig.append(row);hoists.push({key,select});
 }
 rig.append(sailActions);
 const anchoring=group('anchor','Anchor & holding'),targetLabel=element('label','cockpit-rode-label','Rode target');targetLabel.htmlFor='cockpit-anchor-rode';
 const targetRow=element('div','cockpit-rode-input'),rode=element('input');Object.assign(rode,{type:'number',id:'cockpit-anchor-rode',min:'0',max:'250',step:'1',inputMode:'decimal'});rode.setAttribute('aria-label',t('Rode target'));
 const unit=element('span','','m');unit.setAttribute('aria-hidden','true');targetRow.append(rode,unit);
 const paid=element('div','cockpit-rode-paid'),paidLabel=element('span','','Rode paid out'),paidValue=element('output');paidValue.id='cockpit-anchor-paid';paidValue.dir='ltr';paid.append(paidLabel,paidValue);
 const setRode=()=>{if(rode.value!==''&&rode.validity.valid)onChange({anchorRode:Number(rode.value)});};rode.addEventListener('input',setRode);rode.addEventListener('change',setRode);
 const target=element('div','cockpit-rode-target');target.append(targetLabel,targetRow);anchoring.append(target,paid,anchor);
 // Old numeric readouts remain available to their existing refresh handlers;
 // the shared slim dashboard is the visible source of these readings.
 for(const node of container.querySelectorAll(':scope > .speed-display,:scope > .heading-display'))node.hidden=true;
 const dashboard=container.querySelector('#helm-dashboard-mount');
 container.append(groups);if(dashboard)container.append(dashboard);
 const update=()=>{
  const state=getState();jibInput.value=String(state.jibSheet);jibValue.textContent=`${Math.round(state.jibSheet)}°`;
  for(const {key,select} of hoists){
   const value=state[key],text=String(value);let custom=select.querySelector('[data-current-hoist]');
   if(![0,.5,1].includes(value)){if(!custom){custom=element('option');custom.dataset.currentHoist='true';select.append(custom);}custom.value=text;custom.textContent=`${Math.round(value*100)}%`;}
   else custom?.remove();select.value=text;
  }
  if(document.activeElement!==rode)rode.value=String(state.anchorRode);
  paidValue.textContent=`${Number(state.anchorPaidRode||0).toFixed(1)} m`;
 };
 rode.addEventListener('blur',update);update();
 return {update,syncAvailability};
}
