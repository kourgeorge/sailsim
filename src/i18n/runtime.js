import {validateCourseLocale} from './validation.js';
export {validateCourseLocale} from './validation.js';
import englishUI from './en-ui.json';
import englishManeuvers from './en-maneuvers.json';
import {extraUI} from './supplemental.js';
import {learningUI} from './learning-tools.js';
import {trainingUI} from './training.js';
import {anchoringUI} from './anchoring.js';
import {practiceFeedbackUI} from './practice-feedback.js';
import {windReferenceUI} from './wind-reference.js';
import {decisionGuidanceUI} from './decision-guidance.js';
import {practiceFlowUI} from './practice-flow.js';
import {windlassUI} from './windlass.js';
import {audioUI} from './audio.js';
import {racingUI} from './racing.js';
import {validateScenarioLocale,localizeScenario} from '../learning/scenario-localization.js';
const scenarioLoaders=import.meta.glob('./scenarios-*.js',{import:'default'});
let scenarioPack=null;
export const translatedScenario=scenario=>localizeScenario(scenario,scenarioPack);
export const LANGUAGES=[{code:'en',name:'English',dir:'ltr'},{code:'es',name:'Español',dir:'ltr'},{code:'ar',name:'العربية',dir:'rtl'},{code:'he',name:'עברית',dir:'rtl'},{code:'ru',name:'Русский',dir:'ltr'},{code:'fr',name:'Français',dir:'ltr'}];
const loaders=import.meta.glob(['./*-ui.json','!./en-ui.json'],{import:'default'});
const maneuverLoaders=import.meta.glob(['./*-maneuvers.json','!./en-maneuvers.json'],{import:'default'});
let language='en',dictionary=englishUI,patterns=[];
const cache=new Map();
export function getLanguage(){return language;}
export function preferredLanguage(){try{const value=new URL(location.href).searchParams.get('lang')||localStorage.getItem('sail-language');return LANGUAGES.some(l=>l.code===value)?value:'en';}catch{return 'en';}}
function escapeRegex(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function compilePatterns(dict){return Object.entries(dict).filter(([key])=>key.includes('{')).map(([key,value])=>{const names=[];let source='',last=0;for(const match of key.matchAll(/\{(\w+)\}/g)){source+=escapeRegex(key.slice(last,match.index))+'(.+?)';names.push(match[1]);last=match.index+match[0].length;}source+=escapeRegex(key.slice(last));return {regex:new RegExp('^'+source+'$'),names,value};});}
export function translate(value,depth=0){
 const original=String(value),trimmed=original.trim();if(language==='en'||!trimmed||depth>4)return original;
 const keep=text=>original.slice(0,original.indexOf(trimmed))+text+original.slice(original.indexOf(trimmed)+trimmed.length);
 if(dictionary[trimmed])return keep(dictionary[trimmed]);
 if(cache.has(trimmed))return keep(cache.get(trimmed));
 let translated=trimmed;
 for(const p of patterns){const match=trimmed.match(p.regex);if(match){const params=Object.fromEntries(p.names.map((name,i)=>[name,translate(match[i+1],depth+1)]));translated=p.value.replace(/\{(\w+)\}/g,(_,key)=>params[key]??`{${key}}`);break;}}
 if(translated===trimmed){
  if(trimmed.startsWith('. '))translated='. '+translate(trimmed.slice(2),depth+1);
  const symbol=trimmed.match(/^([✓○◉▲●▶Ⅱ]\s*)(.+)$/s);const numbered=trimmed.match(/^(\d+[.)]\s+)(.+)$/s);
  if(symbol)translated=symbol[1]+translate(symbol[2],depth+1);
  else if(numbered)translated=numbered[1]+translate(numbered[2],depth+1);
  else if(trimmed.includes(' · '))translated=trimmed.split(' · ').map(part=>translate(part,depth+1)).join(' · ');
  else for(const prefix of ['Correct.','Review and try again.'])if(trimmed.startsWith(prefix+' ')){translated=translate(prefix,depth+1)+' '+trimmed.slice(prefix.length+1);break;}
 }
 cache.set(trimmed,translated);return keep(translated);
}
export function applyCourseLocale(payload,lessons,modules){
 validateCourseLocale(payload,lessons,modules);
 for(const m of modules)Object.assign(m,payload.modules[m.id]);
 for(const l of lessons){const tr=payload.lessons[l.id];for(const key of ['title','concepts','observe','mistake','transfer'])l[key]=tr[key];l.quiz.forEach((q,i)=>{q.prompt=tr.quiz[i].prompt;q.options=tr.quiz[i].options;q.explanation=tr.quiz[i].explanation;});
  if(l.practice){l.practice.debrief=tr.practice.debrief;l.practice.steps.forEach((s,i)=>{s.label=tr.practice.steps[i].label;if(s.hint)s.hint=tr.practice.steps[i].hint;});}
  l.sub=modules.find(m=>m.id===l.module).outcome;l.body=l.concepts[0];l.goal=l.practice?l.practice.steps[0].label:translate('Read the briefing, then answer both knowledge questions.');l.tip=l.observe[0];
 }
}
async function loadLanguage(code,lessons,modules){
 if(!LANGUAGES.some(l=>l.code===code))throw new Error('Unsupported language');
 if(code==='en')return {ui:englishUI,course:null,maneuvers:englishManeuvers};
 const loader=loaders[`./${code}-ui.json`];if(!loader)throw new Error('Language pack not installed');
 const [ui,response]=await Promise.all([loader(),fetch(`${import.meta.env.BASE_URL}locales/${code}.json`)]);
 if(!response.ok)throw new Error('Language pack unavailable');const course=await response.json();validateCourseLocale(course,lessons,modules);
 for(const key of Object.keys(englishUI)){if(typeof ui[key]!=='string'||!ui[key].trim())throw new Error('Missing interface translation: '+key);const required=[...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();const present=[...ui[key].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort();if(required.join('|')!==present.join('|'))throw new Error('Invalid translation placeholders: '+key);}
 const maneuverLoader=maneuverLoaders[`./${code}-maneuvers.json`];if(!maneuverLoader)throw new Error('Maneuvering translations unavailable');const maneuvers=await maneuverLoader();for(const key of Object.keys(englishManeuvers)){if(typeof maneuvers[key]!=='string'||!maneuvers[key].trim())throw new Error('Missing maneuvering translation: '+key);}
 const scenarioLoader=scenarioLoaders[`./scenarios-${code}.js`];if(!scenarioLoader)throw new Error('Scenario translations unavailable');const scenarios=await scenarioLoader();validateScenarioLocale(scenarios);
 return {ui,course,maneuvers,scenarios};
}
export async function initializeLocalization(lessons,modules){
 const code=preferredLanguage();const pack=await loadLanguage(code,lessons,modules);language=code;scenarioPack=pack.scenarios||null;dictionary={...pack.ui,...(extraUI[code]||{}),...pack.maneuvers,...learningUI[code],...trainingUI[code],...anchoringUI[code],...windlassUI[code],...audioUI[code],...racingUI[code],...practiceFlowUI[code],...practiceFeedbackUI[code],...windReferenceUI[code],...decisionGuidanceUI[code]};patterns=compilePatterns(dictionary);cache.clear();
 document.documentElement.lang=code;document.documentElement.dir=LANGUAGES.find(l=>l.code===code).dir;
 if(pack.course)applyCourseLocale(pack.course,lessons,modules);
 return code;
}
export async function changeLanguage(code,lessons,modules,beforeNavigate=()=>{}){await loadLanguage(code,lessons,modules);await beforeNavigate();try{localStorage.setItem('sail-language',code);}catch{}const next=new URL(location.href);next.searchParams.set('lang',code);location.assign(next.href);}
export function observeTranslations(root=document.body){
 if(language==='en')return {disconnect(){}};
 const ignore=node=>node.parentElement?.closest('script,style,code,pre,#language-select,[data-no-translate]');
 function text(node){if(ignore(node))return;const value=translate(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
 function walk(node){if(node.nodeType===Node.TEXT_NODE){text(node);return;}if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(node.matches('script,style,code,pre,#language-select,[data-no-translate]'))return;
  for(const attr of ['aria-label','title','placeholder'])if(node.hasAttribute(attr)){const value=node.getAttribute(attr),tr=translate(value);if(value!==tr)node.setAttribute(attr,tr);}
  for(const child of node.childNodes)walk(child);
 }
 walk(root);
 const observer=new MutationObserver(changes=>{for(const change of changes){if(change.type==='characterData')text(change.target);else if(change.type==='attributes')walk(change.target);else for(const node of change.addedNodes)walk(node);}});
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});return observer;
}
