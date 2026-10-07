// Mini-lab labels and readout sentences. Each lab keeps its rows in
// ./labs/<lab-id>.js as [key, English, Spanish, Arabic, Hebrew, Russian, French],
// the same column order as learning-tools.js. Keys are used as "<lab-id>.<key>".
import {rows as kit} from './labs/kit.js';
import {rows as sailForce} from './labs/sail-force.js';
import {rows as compassWind} from './labs/compass-wind.js';
import {rows as tackGybe} from './labs/tack-gybe.js';
import {rows as rudder} from './labs/rudder.js';
import {rows as heelReef} from './labs/heel-reef.js';
import {rows as apparentWind} from './labs/apparent-wind.js';
import {rows as anchorScope} from './labs/anchor-scope.js';
import {rows as currentTrack} from './labs/current-track.js';
import {rows as collisionBearing} from './labs/collision-bearing.js';
import {rows as docking} from './labs/docking.js';
import {rows as lightsLeading,aspectRows as lightsAspect,flashRows as lightsFlash} from './labs/lights-leading.js';

export const LAB_LANGS=['en','es','ar','he','ru','fr'];
export const labRowSets={kit,'sail-force':sailForce,'compass-wind':compassWind,'tack-gybe':tackGybe,rudder,'heel-reef':heelReef,'apparent-wind':apparentWind,'anchor-scope':anchorScope,'current-track':currentTrack,'collision-bearing':collisionBearing,'lights-leading':lightsLeading,'lights-aspect':lightsAspect,'lights-flash':lightsFlash,docking};
export const labStrings=Object.fromEntries(LAB_LANGS.map((code,index)=>[code,Object.fromEntries(
 Object.entries(labRowSets).flatMap(([lab,rows])=>rows.map(row=>[`${lab}.${row[0]}`,row[index+1]])))]));
export const labLocale=lang=>{const code=String(lang||'en').toLowerCase().split(/[-_]/)[0];return LAB_LANGS.includes(code)?code:'en';};

/** Returns t(key, params): "{name}" placeholders are filled from params. */
export function labText(lang){
 const pack=labStrings[labLocale(lang)];
 return (key,params={})=>{
  const value=pack[key]??labStrings.en[key];
  if(value===undefined)throw new Error(`Missing lab string: ${key}`);
  return value.replace(/\{(\w+)\}/g,(match,name)=>name in params?String(params[name]):match);
 };
}
