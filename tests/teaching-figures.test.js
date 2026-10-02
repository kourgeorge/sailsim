import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons} from '../src/learning/curriculum.js';
import {advancedLessons} from '../src/learning/advanced-course.js';
import {renderTeachingFigure,getTeachingFigureCaption} from '../src/learning/teaching-figures.js';

const course=[...new Map([...lessons,...advancedLessons].map(lesson=>[lesson.id,lesson])).values()];
const languages=['en','es','fr','ru','he','ar'];
const title=svg=>svg.match(/<title[^>]*>([^<]+)<\/title>/)?.[1];
const description=svg=>svg.match(/<desc[^>]*>([^<]+)<\/desc>/)?.[1];

test('every course lesson has an accessible, localized teaching diagram in all six languages',()=>{
  assert.equal(course.length,51);
  for(const lesson of course) {
    const english=renderTeachingFigure(lesson,'en');
    for(const lang of languages) {
      const svg=renderTeachingFigure(lesson,lang),caption=getTeachingFigureCaption(lesson,lang);
      assert.match(svg,/^<svg/); assert.match(svg,/role="img"/);
      assert.match(svg,/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
      assert.match(svg,new RegExp(`lang="${lang}"`));
      assert.ok(title(svg),`${lesson.id}/${lang}: title`);
      assert.ok(description(svg)?.length>35,`${lesson.id}/${lang}: explanatory description`);
      assert.ok(caption.length>35,`${lesson.id}/${lang}: caption`);
      assert.doesNotMatch(svg,/undefined|NaN|<script|<foreignObject|\bonload=|\bonerror=|javascript:/i);
      if(lang!=='en') {
        assert.notEqual(title(svg),title(english),`${lesson.id}/${lang}: title translated`);
        assert.notEqual(caption,getTeachingFigureCaption(lesson,'en'),`${lesson.id}/${lang}: caption translated`);
      }
    }
  }
});

test('figures have unique accessible IDs when a lesson is visible in reader and zoom viewer',()=>{
  const seen=new Set();
  for(let i=0;i<3;i++) for(const lesson of course) {
    const svg=renderTeachingFigure(lesson,'en');
    const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.ok(ids.length>=2);
    for(const id of ids) {assert.ok(!seen.has(id));seen.add(id);assert.ok(svg.includes(id));}
    assert.match(svg,new RegExp(`aria-labelledby="${ids.slice(0,2).join(' ')}"`));
    for(const [,markerId] of svg.matchAll(/marker-end="url\(#([^\)]+)\)"/g)) {
      assert.ok(ids.includes(markerId),'arrow refers to a marker within its own SVG');
      assert.match(svg,new RegExp(`<marker id="${markerId}"[^>]+orient="auto"`));
    }
  }
});

test('engine arrows distinguish ahead/astern motion and use native tangent-following curved heads',()=>{
  for(const lang of languages) {
    const svg=renderTeachingFigure({id:'sail-29'},lang);
    const paths=[...svg.matchAll(/<path d="([^"]+)"[^>]+data-arrow-kind="([^"]+)"/g)];
    const byKind=Object.fromEntries(paths.map(([,d,kind])=>[kind,d]));
    for(const kind of ['ahead-motion','astern-motion','ahead-bow-turn','astern-bow-turn']) assert.ok(byKind[kind]);
    const vertical=d=>d.match(/^M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)$/).slice(1).map(Number);
    const [ax,ay,bx,by]=vertical(byKind['ahead-motion']);
    const [cx,cy,dx,dy]=vertical(byKind['astern-motion']);
    assert.equal(ax,bx); assert.ok(by<ay,'ahead points toward the bow');
    assert.equal(cx,dx); assert.ok(dy>cy,'astern points toward the stern');
    assert.match(byKind['ahead-bow-turn'],/A[\d.]+ [\d.]+ 0 0 1 /,'ahead curve sweeps clockwise');
    assert.match(byKind['astern-bow-turn'],/A[\d.]+ [\d.]+ 0 0 0 /,'astern curve sweeps counterclockwise');
    assert.equal(paths.length,4,'no duplicate straight head segments on curved arrows');
  }
});

test('unknown IDs have no misleading fallback image and lesson text cannot inject markup',()=>{
  for(const lesson of [null,{}, {id:'sail-00'}, {id:'sail-52'}, {id:'<img src=x onerror=alert(1)>'}]) {
    assert.equal(renderTeachingFigure(lesson),'');
    assert.equal(getTeachingFigureCaption(lesson),'');
  }
  const svg=renderTeachingFigure({id:'sail-01',title:'<script>alert(1)</script>',concepts:['<img src=x onerror=alert(1)>']},'en');
  assert.doesNotMatch(svg,/<script|onerror|alert\(/);
  assert.match(renderTeachingFigure(course[0],'ar-SA'),/lang="ar"/);
  assert.match(renderTeachingFigure(course[0],'unknown'),/lang="en"/);
});

test('lesson-specific concepts distinguish wind maneuvers, currents, depth and navigation evidence',()=>{
  assert.match(getTeachingFigureCaption({id:'sail-14'}),/bow crosses/i);
  assert.match(getTeachingFigureCaption({id:'sail-15'}),/crosses the stern/i);
  assert.match(getTeachingFigureCaption({id:'sail-17'}),/true airflow − boat velocity/);
  assert.match(getTeachingFigureCaption({id:'sail-29'}),/once water flow reverses/);
  assert.match(getTeachingFigureCaption({id:'sail-38'}),/2\.4 \+ 1\.1 − 1\.8 = 1\.7/);
  assert.match(getTeachingFigureCaption({id:'sail-39'}),/ground track/);
  assert.match(getTeachingFigureCaption({id:'sail-42'}),/not independent/);
  for(const lang of ['he','ar']) assert.match(getTeachingFigureCaption({id:'sail-38'},lang),/\u20662\.4 \+ 1\.1 − 1\.8 = 1\.7\u2069/);
});
