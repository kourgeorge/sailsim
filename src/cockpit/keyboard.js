import {translate as t} from '../i18n/runtime.js';
import {clamp} from '../physics.js';

// Physical key positions (event.code) so shortcuts work on every keyboard layout.
// Held keys move a control at a steady rate; pressed keys act once.
export const HOLD_KEYS={
 ArrowLeft:{label:'←',control:'rudder',rate:-25,min:-35,max:35},
 ArrowRight:{label:'→',control:'rudder',rate:25,min:-35,max:35},
 ArrowUp:{label:'↑',control:'mainSheet',from:'trim',rate:-22,min:0,max:90},
 ArrowDown:{label:'↓',control:'mainSheet',from:'trim',rate:22,min:0,max:90},
 KeyQ:{label:'Q',control:'jibSheet',rate:-22,min:0,max:90},
 KeyA:{label:'A',control:'jibSheet',rate:22,min:0,max:90},
 KeyW:{label:'W',control:'throttle',rate:.5,min:-1,max:1},
 KeyS:{label:'S',control:'throttle',rate:-.5,min:-1,max:1},
};
export const PRESS_KEYS={Space:'play',KeyC:'center',KeyN:'neutral',KeyH:'sails',KeyR:'reef',KeyL:'anchor',KeyM:'chart',KeyK:'keys'};

/** Advance every held control by dt seconds. Returns true when something moved. */
export function applyHeldKeys(state,held,dt,applyControlPatch){
 const patch={};
 for(const code of held){const key=HOLD_KEYS[code];if(!key)continue;const current=patch[key.control]??state[key.from||key.control];patch[key.control]=clamp(current+key.rate*dt,key.min,key.max);}
 if(!Object.keys(patch).length)return false;
 applyControlPatch(state,patch);return true;
}

const SHORTCUTS=[
 ['← →','Steer port / starboard'],['C','Center the helm'],
 ['↑ ↓','Mainsheet in / out'],['Q A','Headsail sheet in / out'],
 ['W S','Engine ahead / astern'],['N','Engine neutral'],
 ['H','Raise or lower sails'],['R','Reef'],['L','Anchor: let go or weigh'],
 ['Space','Pause / sail'],['M','Open chart'],['K','Open this help'],
];

export function badge(...labels){
 const node=document.createElement('span');node.className='key-badge';node.setAttribute('aria-hidden','true');node.dataset.noTranslate='true';
 for(const label of labels){const kbd=document.createElement('kbd');kbd.textContent=label;node.append(kbd);}
 return node;
}

/** Show the key for each control right next to it. */
export function decorateControls(root=document){
 const after=(selector,...labels)=>{const node=root.querySelector(selector);if(node&&!node.querySelector(':scope > .key-badge,:scope + .key-badge'))node.after(badge(...labels));};
 const inside=(selector,shortcut,...labels)=>{const node=root.querySelector(selector);if(!node||node.querySelector('.key-badge'))return;node.append(badge(...labels));node.setAttribute('aria-keyshortcuts',shortcut);};
 // Keys flank each slider on the side they move it towards.
 const helmEnds=[...root.querySelectorAll('.helm-range>span')];
 if(helmEnds.length===2&&!helmEnds[0].querySelector('.key-badge')){helmEnds[0].append(' ',badge('←'));helmEnds[1].prepend(badge('→'),' ');}
 for(const [id,first,last] of [['#trim','↑','↓'],['#cockpit-jib-sheet','Q','A'],['#engine-throttle','S','W']]){
  const input=root.querySelector(id);if(!input||input.parentElement.classList.contains('key-range'))continue;
  const row=document.createElement('div');row.className='key-range';input.before(row);row.append(badge(first),input,badge(last));
 }
 const jib=root.querySelector('.cockpit-jib-control');
 if(jib&&!jib.querySelector('.control-hint')){const hint=document.createElement('div');hint.className='control-hint';for(const word of ['In','Out']){const span=document.createElement('span');span.textContent=t(word);hint.append(span);}jib.append(hint);}
 inside('#center-helm','C','C');inside('#engine-neutral','N','N');
 inside('#sails','H','H');inside('#reef','R','R');inside('#anchor','L','L');
 for(const [id,label] of [['#rudder','ArrowLeft ArrowRight'],['#trim','ArrowUp ArrowDown'],['#cockpit-jib-sheet','Q A'],['#engine-throttle','W S']])root.querySelector(id)?.setAttribute('aria-keyshortcuts',label);
}

/** Key list for the help dialog. */
export function shortcutsTable(){
 const rows=SHORTCUTS.map(([keys,action])=>`<tr><td dir="ltr">${keys.split(' ').map(k=>`<kbd>${k}</kbd>`).join(' ')}</td><td>${t(action)}</td></tr>`).join('');
 return `<table class="shortcut-table"><tbody>${rows}</tbody></table><p class="modal-note">${t('Hold a key to keep moving a control. Keys pause while you type in a field or read a lesson.')}</p>`;
}
