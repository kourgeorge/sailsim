import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
const expect=baseExpect.configure({timeout:60000}),url=process.env.SAIL_URL||'http://127.0.0.1:5196';
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto(`${url}/?lang=he`,{waitUntil:'domcontentloaded',timeout:120000});
 await expect(page.locator('html')).toHaveAttribute('data-text-size','100');
 const group=page.locator('.camera-views');
 await expect(group).toBeVisible();
 assert.deepEqual(await group.locator('[data-camera]').evaluateAll(buttons=>buttons.map(b=>b.dataset.camera)),['chase','helm','deck']);
 assert.deepEqual(await page.locator('#mobile-camera option').evaluateAll(options=>options.map(o=>o.value)),['chase','helm','deck']);
 await expect(page.locator('[data-camera=aerial]')).toHaveCount(0);
 await expect(group.locator('#chart-toggle,#systems-toggle')).toHaveCount(0);
 await expect(group).toHaveCSS('border-top-width','1px');
 for(const camera of ['helm','deck','chase']){
  await group.locator(`[data-camera=${camera}]`).click();
  await expect(page.locator('.simulator')).toHaveAttribute('data-view',camera);
  await expect(group.locator(`[data-camera=${camera}]`)).toHaveAttribute('aria-pressed','true');
 }
 await page.locator('#chart-toggle').click();await expect(page.locator('#large-chart')).toBeVisible();await page.locator('#close-modal').click();
 await page.locator('#systems-toggle').click();await expect(page.locator('#systems-drawer')).toBeVisible();await page.locator('#systems-close').click();
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="12"]').click();
 for(const viewport of [{width:1440,height:900},{width:1366,height:768},{width:1024,height:768}]){
  await page.setViewportSize(viewport);
  await page.waitForTimeout(350);
  const layout=await page.evaluate(()=>{const title=document.querySelector('.scene-title').getBoundingClientRect(),card=document.querySelector('.lesson-card').getBoundingClientRect(),location=document.querySelector('.location').getBoundingClientRect();return {titleBottom:title.bottom,cardTop:card.top,titleLeft:title.left,titleRight:title.right,locationLeft:location.left,locationRight:location.right};});
  assert.ok(layout.cardTop-layout.titleBottom>=8, 'Lesson heading stays clear of its instruction card');
  assert.ok(layout.locationRight<=layout.titleLeft, 'Location is on the opposite side of the scene');
  console.log('lesson-layout',viewport,layout);
 }
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:'/tmp/sail-camera-group-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#mobile-menu-toggle').click();
 await expect(page.locator('#mobile-menu .camera-views')).toBeVisible();
 for(const button of await page.locator('#mobile-menu [data-camera]').all())await expect(button).toBeHidden();
 await page.locator('#mobile-camera').selectOption('deck');
 await expect(page.locator('.simulator')).toHaveAttribute('data-view','deck');
 await expect(page.locator('#mobile-menu')).not.toBeVisible();
 await page.locator('#mobile-menu-toggle').click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.screenshot({path:'/tmp/sail-camera-group-mobile.png'});
 await page.locator('#chart-toggle').click();await expect(page.locator('#large-chart')).toBeVisible();await page.locator('#close-modal').click();
 await page.setViewportSize({width:1440,height:1000});await expect(page.locator('.simulator .view-controls .camera-views')).toBeVisible();
 await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('200');await page.locator('.text-size-control summary').click();
 const layout=await page.locator('.view-controls').evaluate(root=>{const group=root.querySelector('.camera-views').getBoundingClientRect(),chart=root.querySelector('#chart-toggle').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,separate:group.right<=chart.left||chart.right<=group.left||group.bottom<=chart.top||chart.bottom<=group.top};});
 assert.equal(layout.overflow,false);assert.equal(layout.separate,true);
 await page.goto(`${url}/?lang=en`,{waitUntil:'domcontentloaded',timeout:120000});
 await expect(page.locator('html')).toHaveAttribute('data-text-size','200');
 await page.locator('.text-size-control summary').click();await page.locator('#sail-text-size-range').fill('125');await page.locator('.text-size-control summary').click();
 await page.locator('#course-library').click();await page.locator('[data-library-lesson="12"]').click();
 for(const viewport of [{width:1440,height:900},{width:1366,height:768},{width:1024,height:768}]){
  await page.setViewportSize(viewport);
  await expect.poll(()=>page.evaluate(()=>{const title=document.querySelector('.scene-title').getBoundingClientRect(),card=document.querySelector('.lesson-card').getBoundingClientRect(),location=document.querySelector('.location').getBoundingClientRect();return {gap:card.top-title.bottom,separate:location.left>=title.right};})).toMatchObject({separate:true});
  const gap=await page.evaluate(()=>document.querySelector('.lesson-card').getBoundingClientRect().top-document.querySelector('.scene-title').getBoundingClientRect().bottom);
  assert.ok(gap>=8,`English ${viewport.width}: title and instruction card remain separate (${gap}px)`);
 }
 await page.locator('.text-size-control summary').click();await page.locator('.text-size-reset').click();
 await expect(page.locator('html')).toHaveAttribute('data-text-size','100');
 await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('html')).toHaveAttribute('data-text-size','100');
 assert.deepEqual(errors,[]);console.log('Scene layout passed: three camera views, English/Hebrew lesson spacing, desktop/mobile, 100% default/reset and saved 200% text.');
}catch(error){await page.screenshot({path:'/tmp/sail-camera-group-failure.png'}).catch(()=>{});throw error;}finally{await browser.close();}
