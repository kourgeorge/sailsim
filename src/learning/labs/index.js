// Mini-lab registry. Lessons name a lab per page with conceptLabs or quiz[i].lab:
// either a lab id, or {id, initial, tasks} to choose the starting state and the
// "Try this" tasks that fit that page.
import {sailForceLab} from './sail-force.js';
import {compassWindLab} from './compass-wind.js';
import {tackGybeLab} from './tack-gybe.js';
import {rudderLab} from './rudder.js';
import {heelReefLab} from './heel-reef.js';
import {apparentWindLab} from './apparent-wind.js';
import {anchorScopeLab} from './anchor-scope.js';
import {currentTrackLab} from './current-track.js';
import {collisionBearingLab} from './collision-bearing.js';
import {dockingLab} from './docking.js';
import {lightsAspectLab,leadingLineLab,lightsFlashLab} from './lights-leading.js';

export const LABS=Object.fromEntries([sailForceLab,compassWindLab,tackGybeLab,rudderLab,heelReefLab,apparentWindLab,anchorScopeLab,currentTrackLab,collisionBearingLab,lightsAspectLab,leadingLineLab,lightsFlashLab,dockingLab].map(lab=>[lab.id,lab]));
export const labSpec=value=>!value?null:typeof value==='string'?{id:value}:value;
export function getLab(value){const spec=labSpec(value);return spec?LABS[spec.id]||null:null;}
export const renderLabFigure=(value,lang='en')=>{const spec=labSpec(value);return getLab(spec).staticFigure(lang,spec.initial);};
export const labCaption=(value,lang='en')=>getLab(value).caption(lang);
/** Mounts the interactive lab. "Try this" ticks live in sessionStorage per lesson, never in course records. */
export function mountLab(container,value,{lang='en',lessonId='lesson',autoplay}={}){
 const spec=labSpec(value);
 return getLab(spec).mount(container,{lang,initial:spec.initial,tasks:spec.tasks,autoplay,storageKey:`sail-lab-${lessonId}-${spec.id}`});
}
