import {chromium,expect as baseExpect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const expect=baseExpect.configure({timeout:60000});
const url=process.env.SAIL_URL||'http://127.0.0.1:5187';
await mkdir('artifacts/keyboard',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.setDefaultTimeout(60000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
// Wait for actual animation frames, even on slow software WebGL.
const frames=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
const bodyFocus=()=>page.evaluate(()=>{document.activeElement?.blur();document.body.tabIndex=-1;document.body.focus();});
const helm=()=>page.locator('#rudder').inputValue();
try{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await expect(page.locator('#activity-status')).toHaveAttribute('data-state','ready');
 const dock=page.locator('.control-dock');
 await expect(dock).toHaveAttribute('aria-disabled','true');
 assert.equal(await dock.evaluate(node=>node.inert),true);
 assert.equal(await dock.locator('button,input,select').evaluateAll(nodes=>nodes.every(node=>node.disabled)),true);
 const initialControls=await dock.locator('input,select').evaluateAll(nodes=>nodes.map(node=>node.value));
 await bodyFocus();
 for(const key of ['ArrowRight','ArrowUp','q','w','c','n','h','r','l'])await page.keyboard.press(key);
 await frames();
 assert.deepEqual(await dock.locator('input,select').evaluateAll(nodes=>nodes.map(node=>node.value)),initialControls,'Inactive dashboard ignores sailing shortcuts');
 await page.locator('#dashboard-enlarge').evaluate(node=>node.click());
 await expect(page.locator('#modal')).not.toBeVisible();
 await page.locator('button[data-mode="explore"]').click();
 await expect(dock).toHaveAttribute('aria-disabled','false');
 await expect(page.locator('#rudder')).toBeEnabled();
 await page.locator('#rudder').fill('18');await bodyFocus();
 await page.keyboard.press('Control+c');await expect(page.locator('#rudder')).toHaveValue('18');
 await page.keyboard.press('Meta+c');await expect(page.locator('#rudder')).toHaveValue('18');
 await page.keyboard.press('Alt+m');await expect(page.locator('#modal')).not.toBeVisible();
 await page.keyboard.press('Shift+ArrowRight');await frames();await expect(page.locator('#rudder')).toHaveValue('18');
 // An unmodified shortcut still works when a normal toolbar button has focus.
 await page.locator('#center-helm').focus();await page.keyboard.down('ArrowRight');
 await page.waitForFunction(()=>Number(document.querySelector('#rudder').value)>18);
 // Moving focus to a native input cancels the held helm key immediately.
 await page.locator('#trim').focus();const afterFocus=await helm();await frames();
 assert.equal(await helm(),afterFocus,'Helm must stop changing after focus enters the trim slider');
 await page.keyboard.up('ArrowRight');
 const trim=Number(await page.locator('#trim').inputValue());await page.keyboard.press('ArrowRight');
 assert.equal(Number(await page.locator('#trim').inputValue()),trim+1,'Focused slider retains its native keyboard control');
 assert.equal(await helm(),afterFocus);
 await bodyFocus();await page.keyboard.press('c');await expect(page.locator('#rudder')).toHaveValue('0');
 await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('#rudder').value)>1);
 await page.keyboard.down('Control');const afterModifier=await helm();await frames();
 assert.equal(await helm(),afterModifier,'Modifier key cancels previously held sailing control');
 await page.keyboard.up('ArrowRight');await page.keyboard.up('Control');
 await bodyFocus();await page.keyboard.press('m');await expect(page.locator('#large-chart')).toBeVisible();
 const beforeModal=await helm();await page.keyboard.press('c');await expect(page.locator('#rudder')).toHaveValue(beforeModal);
 await page.locator('#close-modal').click();
 await page.locator('button[data-mode="learn"]').click();
 await page.locator('#lesson-briefing').click();await expect(page.locator('#lesson-reader')).toBeVisible();
 await page.keyboard.press('c');await page.keyboard.press('m');await expect(page.locator('#modal')).not.toBeVisible();
 await expect(page.locator('#rudder')).toHaveValue(beforeModal);
 await expect(dock).toHaveAttribute('aria-disabled','true');
 await page.locator('#reader-close').click();
 // Space in lesson mode prepares the task; it cannot start unassessed sailing.
 await bodyFocus();await page.keyboard.press('Space');
 await expect(page.locator('#activity-status')).toHaveAttribute('data-state','briefing');
 await expect(dock).toHaveAttribute('aria-disabled','true');
 await expect(page.locator('#practice-launch')).toBeVisible();
 const briefingHelm=await helm();await page.keyboard.press('c');await page.keyboard.press('ArrowRight');await frames();
 assert.equal(await helm(),briefingHelm,'Briefing owns keyboard input');
 await page.keyboard.press('Escape');await expect(page.locator('#activity-status')).toHaveAttribute('data-state','briefing');
 // Space on a focused button should activate it once; the sailing shortcut must not also toggle.
 await page.locator('button[data-mode="explore"]').click();await page.locator('#play').focus();await page.keyboard.press('Space');
 await expect(page.locator('#activity-status')).toHaveAttribute('data-state','free-running');
 await expect(dock).toHaveAttribute('aria-disabled','false');
 await page.keyboard.press('Space');await expect(page.locator('#activity-status')).toHaveAttribute('data-state','free-paused');
 await expect(dock).toHaveAttribute('aria-disabled','false');
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/keyboard/results.json',JSON.stringify({passed:true,checkedAt:new Date().toISOString(),checks:['browser shortcuts','modifier cancellation','held-key focus transfer','native slider keys','toolbar-focused helm','chart shortcut','modal isolation','reader isolation','lesson Space prepares without scoring','briefing keyboard isolation','native button Space'],errors},null,2));
 console.log('Keyboard control isolation checks passed.');
}catch(error){await page.screenshot({path:'artifacts/keyboard/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser.close();}
