import {writeFileSync} from 'node:fs';
import {MANEUVER_TEXT} from '../src/learning/maneuvers.js';
import {LAB_UI_STRINGS} from '../src/learning/maneuver-labels.js';
const keys=[...new Set([...LAB_UI_STRINGS,...MANEUVER_TEXT])];
writeFileSync('src/i18n/en-maneuvers.json',JSON.stringify(Object.fromEntries(keys.map(k=>[k,k])),null,2)+'\n');
console.log(keys.length+' maneuvering text keys exported');
