import {guides,guideFor} from './instrument-guides.js';
import {getLanguage,translate as t} from '../i18n/runtime.js';
import {lessons} from './curriculum.js';
import './tools-ui.css';
import {renderTeachingFigure,getTeachingFigureCaption} from './teaching-figures.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lessonTopics=['lookout','sheets','sheets','heading','wind','sheets','speed','helm','wind','wind','wind','sheets','helm','helm','helm','sheets','wind','reef','sheets','weather','depth','heading','speed','heading','lookout','lookout','lookout','weather','engine','anchor','anchor','anchor','emergency','emergency','helm','lookout','weather','depth','current','weather','lookout','heading'];
export function topicFor(lesson){return lessonTopics[Number(lesson?.id?.split('-')[1])-1]||'lookout';}
export function createLearningTools({openModal,onLesson}){
 function guide(id){
  const value=guideFor(id,getLanguage());if(!value)return;
  openModal(`<article class="topic-guide" data-guide-id="${esc(id)}"><div class="eyebrow">${esc(t('Learn more'))}</div><h2>${esc(value.title)}</h2><p>${esc(value.body)}</p><section class="guide-exercise"><h3>${esc(t('Try it aboard'))}</h3><p>${esc(value.tryIt)}</p></section><section><h3>${esc(t('Common mistake'))}</h3><p>${esc(value.pitfall)}</p></section><h3>${esc(t('Related lessons'))}</h3><div class="guide-links">${value.lessonIds.map(id=>{const l=lessons.find(x=>x.id===id);return l?`<button class="training-button" data-related-lesson="${id}">${esc(l.title)}</button>`:'';}).join('')}</div>${value.sources.length?`<details class="guide-sources"><summary>${esc(t('Source material'))}</summary>${value.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noreferrer" lang="en" data-no-translate>${esc(s.publisher)} · ${esc(s.title)} ↗</a></p>`).join('')}</details>`:''}<div class="training-actions"><button id="all-guides" class="training-button">${esc(t('Instrument guides'))}</button></div></article>`);
  document.querySelectorAll('[data-related-lesson]').forEach(b=>b.onclick=()=>onLesson(b.dataset.relatedLesson));document.querySelector('#all-guides').onclick=library;
 }
 function figure(lesson){openModal(`<article class="diagram-view"><h2>${esc(lesson.title)}</h2><label class="diagram-zoom">${esc(t('Diagram zoom'))}<input id="diagram-zoom" type="range" min="100" max="300" step="25" value="100"><output id="diagram-zoom-value">100%</output></label><div class="diagram-viewport" tabindex="0">${renderTeachingFigure(lesson,getLanguage())}</div><p>${esc(getTeachingFigureCaption(lesson,getLanguage()))}</p></article>`);const input=document.querySelector('#diagram-zoom');input.oninput=()=>{document.querySelector('.diagram-viewport svg').style.width=input.value+'%';document.querySelector('#diagram-zoom-value').value=input.value+'%';};}
 let referenceData=null;
 function library(){
  openModal(`<div class="eyebrow">${esc(t('Learning library'))}</div><h2>${esc(t('Instrument guides'))}</h2><div class="guide-grid">${guides.map(g=>`<button class="training-button" data-topic="${g.id}">${esc(guideFor(g.id,getLanguage()).title)}</button>`).join('')}</div><h3>${esc(t('Verified references'))}</h3><p>${esc(t('Original research notes and official sources. Source documents are in their published language.'))}</p><label class="library-search">${esc(t('Search references'))}<input id="reference-search" type="search" autocomplete="off"></label><div id="reference-results" aria-live="polite"></div>`);
  document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>guide(b.dataset.topic));
  const input=document.querySelector('#reference-search'),results=document.querySelector('#reference-results');
  function render(){const search=input.value.trim().toLocaleLowerCase();const found=referenceData.sources.filter(s=>`${s.title} ${s.org} ${s.topics.join(' ')} ${s.summary} ${t(s.level||'')}`.toLocaleLowerCase().includes(search));results.innerHTML=found.length?found.map(s=>`<article class="source-card"><div class="eyebrow" data-no-translate lang="en">${esc(s.org)}</div><h4 data-no-translate lang="en">${esc(s.title)}</h4><p data-no-translate lang="en">${esc(s.summary)}</p><details><summary>${esc(t('Research notes (English)'))}</summary><div class="source-notes" data-no-translate lang="en" dir="ltr">${esc(s.notes)}</div></details><a class="source-link" href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(t('Open official source'))} ↗</a></article>`).join(''):`<p>${esc(t('No matching references.'))}</p>`;}
  input.oninput=()=>{if(referenceData)render();};
  if(referenceData)render();else fetch(`${import.meta.env.BASE_URL}learning-library.json`).then(r=>{if(!r.ok)throw new Error('Library unavailable');return r.json();}).then(data=>{referenceData=data;if(results.isConnected)render();}).catch(()=>{if(results.isConnected)results.textContent=t('The reference library could not be loaded. Please try again.');});
 }
 function help(id){const button=document.createElement('button');button.type='button';button.className='topic-help';button.dataset.instrumentGuide=id;button.textContent='?';button.setAttribute('aria-label',`${t('Learn more')}: ${guideFor(id,getLanguage()).title}`);button.onclick=e=>{e.preventDefault();e.stopPropagation();guide(id);};return button;}
 function mount(){
  const targets=[['.speed-display>.instrument-label','speed'],['.heading-display>.instrument-label','heading'],['.wind-card>.instrument-label','wind'],['.helm-control>.control-title','helm'],['.sail-control>.control-title','sheets'],['.engine-control>.control-title','engine'],['#depth','depth']];
  for(const [selector,id] of targets)document.querySelector(selector)?.append(help(id));
  for(const [key,id] of Object.entries({mainHoist:'sheets',jibHoist:'sheets',jibSheet:'sheets',traveler:'sheets',vang:'sheets',outhaul:'sheets',throttle:'engine',anchorRode:'anchor',reefLevel:'reef'})){const input=document.querySelector(`#vessel-${key}`),label=input?.closest('label');if(!label)continue;const wrapper=document.createElement('div');wrapper.className='guided-control';label.before(wrapper);wrapper.append(label,help(id));}
  for(const [name,id] of [['apparent','wind'],['sog','current'],['heel','reef'],['flow','sheets']])document.querySelector(`[data-reading="${name}"]`)?.parentElement.append(help(id));
 }
 return {guide,library,mount,figure,forLesson:lesson=>guide(topicFor(lesson))};
}
