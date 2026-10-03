import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { colregsScenarios } from '../../src/learning/colregs-scenarios.js';

test.beforeEach(async ({ context }) => {
  // These checks exercise learning UI, independently of the 3D renderer.
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : original.call(this, type, ...args);
    };
  });
});

async function selectLesson(page, index) {
  if (page.viewportSize().width <= 900) {
    await page.locator('#mobile-menu-toggle').click();
  }
  await page.locator('button[data-mode=learn]').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
}

async function openBriefing(page) {
  await page.locator('#lesson-briefing').click();
}

test('colregs lessons load in every language with diagrams and official rule references', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const lang of ['en', 'he', 'es', 'ar', 'ru', 'fr']) {
    await page.setViewportSize({ width: ['he', 'ar'].includes(lang) ? 390 : 1440, height: 844 });
    await page.goto(`./?lang=${lang}`);
    const pack = JSON.parse(
      readFileSync(new URL(`../../public/locales/${lang}.json`, import.meta.url), 'utf8'),
    );
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    for (let index = 45; index < 51; index++) {
      await selectLesson(page, index);
      await openBriefing(page);
      await expect(page.locator('.reader-heading h1')).toHaveText(
        pack.lessons[`sail-${index + 1}`].title,
      );
      await expect(page.locator('.reader-figure svg')).toHaveAttribute('lang', lang);
      await expect(page.locator('.reader-rule-source a')).toHaveAttribute(
        'href',
        'https://www.navcen.uscg.gov/navigation-rules-amalgamated',
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      if (lang === 'he')
        await page.screenshot({
          path: testInfo.outputPath(`lesson-${index + 1}-he.png`),
          fullPage: true,
        });
      await page.locator('#reader-close').click();
    }
  }
  expect(errors).toEqual([]);
});

test('colregs decisions require observation and preserve completed Hebrew evidence after reload', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?lang=he');
  for (const scenario of colregsScenarios) {
    await selectLesson(page, Number(scenario.lessonId.split('-')[1]) - 1);
    await openBriefing(page);
    await page.locator('#reader-start-training').click();
    await page.locator('#practice-launch').click();
    await expect(page.locator('#decision-training')).toBeVisible();
    for (const [index, stage] of scenario.stages.entries()) {
      await page.locator('#training-field-response').selectOption(stage.fields[0].expected);
      if (index === 0) {
        await page.locator('#training-form button[type="submit"]').click();
        await expect(page.locator('.training-milestones [aria-current="step"]')).toContainText('1');
      }
      await page.locator('[data-required-observation="report"]').click();
      await expect(page.locator('.scenario-visual__report')).not.toBeEmpty();
      await expect(page.locator('.scenario-visual__drawing svg')).toHaveAttribute('lang', 'he');
      await page.locator('#training-form button[type="submit"]').click();
    }
    await expect(page.locator('.training-debrief')).toBeVisible();
    await expect(page.locator('.training-score strong')).toContainText('100');
    await page.screenshot({
      path: testInfo.outputPath(`${scenario.lessonId}-decision-he.png`),
      fullPage: true,
    });
    await page.locator('#training-finish').click();
  }
  await page.reload();
  const records = await page.evaluate(
    () => JSON.parse(localStorage.getItem('sail-training-v1')).records,
  );
  for (const scenario of colregsScenarios) {
    const record = records[scenario.lessonId];
    expect(record.decision).toBe(true);
    expect(record.practice).toBe(false);
    expect(record.lastDecisionResult.score).toBe(100);
    expect(record.lastDecisionResult.objectives.map((row) => row.inspected)).toEqual([
      ['report'],
      ['report'],
      ['report'],
    ]);
  }
});
