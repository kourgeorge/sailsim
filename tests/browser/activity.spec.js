import { test, expect } from '@playwright/test';
import { practiceFlowUI } from '../../src/i18n/practice-flow.js';

// Exercise the production UI with its supported WebGL fallback. The separate
// rendering suite uses the real GPU pipeline; these tests stay fast and isolated.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/.test(type) ? null : getContext.call(this, type, ...args);
    };
  });
});

async function open(page) {
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'ready');
}

async function selectLesson(page, index) {
  await page.locator('button[data-mode=learn]').click();
  await page.locator('#cover-course').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
}

const record = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('sail-training-v1') || '{}'));

test('lesson briefing owns launch and displays the setup that will actually be assessed', async ({
  page,
}) => {
  await open(page);
  await expect(page.locator('#activity-status')).toHaveCount(0);
  await expect(page.locator('#play')).toBeHidden();
  await expect(page.locator('#conditions')).toBeHidden();
  await selectLesson(page, 8);
  await page.locator('#practice-start').click();
  const briefing = page.locator('#practice-briefing');
  await expect(briefing.locator('.practice-kind')).toContainText('Lesson 09');
  await expect(briefing.locator('h2')).toHaveText('Find a beam reach');
  const condition = (name) =>
    briefing
      .locator('.practice-conditions dl > div')
      .filter({ has: page.locator('dt', { hasText: name }) })
      .locator('dd');
  await expect(condition('Wind over ground from')).toHaveText('315° · 12 knots');
  await expect(condition('Current flowing toward')).toHaveText('No current');
  await expect(condition('Heading')).toHaveText('075°');
  await expect(condition('Speed through water')).toHaveText('3 knots');
  await expect(condition('Mainsail hoist')).toHaveText('100%');
  expect((await record(page)).records?.['sail-09']?.attempts || 0).toBe(0);
  await page.locator('#practice-briefing-close').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'briefing');
  await expect(page.locator('#play')).toBeHidden();
  await expect(page.locator('#training-goals')).toHaveCount(0);
  await page.locator('#practice-start').click();
  await expect(condition('Heading')).toHaveText('075°');
  await expect(page.locator('#heading')).toHaveText('075');
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await expect(page.locator('#play')).toBeVisible();
  await expect(page.locator('#conditions')).toBeHidden();
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  await page.locator('#training-goals').click();
  await expect(condition('Heading')).toHaveText('075°');
  await page.locator('#practice-launch').click();
  await expect.poll(async () => (await record(page)).records?.['sail-09']?.attempts).toBe(1);
});

test('free-sailing weather setup stays available after leaving a mobile session', async ({
  page,
}) => {
  await open(page);
  await page.locator('[data-mode="explore"]').click();
  await page.locator('#cover-conditions-button').click();
  await page.locator('#wind-speed').fill('18');
  await page.locator('#current-speed').fill('1.5');
  await page.locator('#current-direction').fill('90');
  await page.locator('#close-modal').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-paused');
  await page.locator('#cover-start-free').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-running');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.simulation-console > #play')).toBeVisible();
  await page.locator('#play').click();
  await page.locator('#mobile-menu-toggle').click();
  await page.locator('#session-exit').click();
  await page.locator('#cover-conditions-button').click();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.locator('#wind-speed')).toHaveValue('18');
  await expect(page.locator('#current-speed')).toHaveValue('1.5');
  await page.locator('#close-modal').click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'free-paused');
});

test('lesson conditions and start remain reachable in every language at 200% mobile text size', async ({
  page,
}) => {
  for (const language of ['en', 'es', 'fr', 'ru', 'he', 'ar']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`./?lang=${language}`);
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'ready');
    await selectLesson(page, 8);
    await page.locator('.text-size-control summary').click();
    await page.locator('#sail-text-size-range').fill('200');
    await page.locator('.text-size-control summary').click();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#play')).toBeHidden();
    await page.locator('#practice-start').click();
    await expect(page.locator('#mobile-lessons')).toBeHidden();
    const briefing = page.locator('#practice-briefing');
    await expect(briefing.locator('.practice-conditions summary')).toHaveText(
      practiceFlowUI[language]['Starting conditions'],
    );
    await expect(page.locator('#practice-launch')).toHaveText(
      practiceFlowUI[language]['Start simulation'],
    );
    await briefing.locator('.practice-conditions dl > div').last().scrollIntoViewIfNeeded();
    const fits = await briefing.evaluate((node) => {
      const box = node.getBoundingClientRect(),
        button = node.querySelector('#practice-launch').getBoundingClientRect();
      return (
        box.left >= 0 &&
        box.right <= innerWidth + 1 &&
        box.bottom <= innerHeight &&
        button.top >= box.top &&
        button.bottom <= innerHeight &&
        node.scrollWidth <= node.clientWidth + 1 &&
        document.documentElement.scrollWidth <= innerWidth
      );
    });
    expect(fits, `${language} briefing and launch fit the viewport`).toBe(true);
    await page.locator('#practice-launch').click();
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
    await expect(page.locator('.simulation-console > #play')).toBeVisible();
    await page.locator('#play').click();
    await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  }
});

test('simultaneous quiz submissions in two tabs count each answer exactly once', async ({
  page,
  context,
}) => {
  await open(page);
  const second = await context.newPage();
  await open(second);
  for (const tab of [page, second]) {
    await tab.locator('#lesson-briefing').click();
    await tab.locator('[data-reader-section="question"]').click();
    await tab.locator('input[name="q0"][value="0"]').check();
  }
  await Promise.all(
    [page, second].map((tab) => tab.locator('#knowledge-form button[type="submit"]').click()),
  );
  await expect.poll(async () => (await record(page)).records?.['sail-01']?.wrongAnswers).toBe(2);
  await second.locator('#reader-close').click();
  await selectLesson(second, 1);
  await expect.poll(async () => (await record(second)).selected).toBe('sail-02');
  expect((await record(page)).records['sail-01'].wrongAnswers).toBe(2);
});

test('leaving simulation before changing language preserves the ended attempt', async ({
  page,
}) => {
  await open(page);
  await selectLesson(page, 8);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await page.locator('#session-exit').click();
  await page.locator('#language-picker').click();
  await page.locator('#language-option-he').click();
  await expect(page).toHaveURL(/lang=he/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const saved = (await record(page)).records['sail-09'];
  expect(saved.attempts).toBe(1);
  expect(saved.lastPracticeResult.status).toBe('failed');
  expect(saved.lastPracticeResult.id).toBeTruthy();
});

test('two tabs retain quiz evidence and independent navigation after reload', async ({
  page,
  context,
}) => {
  await open(page);
  const second = await context.newPage();
  await open(second);
  await page.locator('#lesson-briefing').click();
  await page.locator('[data-reader-section="question"]').click();
  await page.locator('input[name="q0"][value="1"]').check();
  await page.locator('#knowledge-form button[type="submit"]').click();
  await page.locator('#reader-next').click();
  await page.locator('input[name="q1"][value="1"]').check();
  await page.locator('#knowledge-form button[type="submit"]').click();
  await expect.poll(async () => (await record(page)).records?.['sail-01']?.knowledge).toBe(true);
  await selectLesson(second, 1);
  await expect.poll(async () => (await record(second)).selected).toBe('sail-02');
  await expect.poll(async () => (await record(second)).records?.['sail-01']?.knowledge).toBe(true);
  await expect(page.locator('#lesson-reader h1')).toHaveText('Safety before speed');
  await second.reload();
  await expect(second.locator('#card-title')).toHaveText('Know your yacht');
  await expect.poll(async () => (await record(second)).records?.['sail-01']?.knowledge).toBe(true);
});

test('decision training has working navigation without an inert playback button', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await open(page);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'scenario-running');
  await expect(page.locator('#play')).toBeHidden();
  await page.locator('#training-study').click();
  await expect(page.locator('#lesson-reader')).toBeVisible();
  await page.locator('#reader-start-training').click();
  await expect(page.locator('#decision-training')).toBeVisible();
  await page.locator('#training-close').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'review');
  await expect(page.locator('#play')).toBeHidden();
  await page.locator('#training-finish').click();
  await expect(page.locator('#play')).toBeHidden();
  await page.locator('#practice-start').click();
  await expect(page.locator('#practice-briefing')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile sheets, resizing and study preserve the same physical attempt', async ({ page }) => {
  await open(page);
  await selectLesson(page, 8);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-lesson-toggle').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  await page.locator('#practice-toggle').click();
  await expect(page.locator('#mobile-lessons')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await page.locator('#mobile-lesson-toggle').click();
  await page.locator('#lesson-briefing').click();
  await expect(page.locator('#lesson-reader')).toBeVisible();
  await page.locator('#reader-close').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.session-mission > .lesson-card')).toBeVisible();
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-running');
  await page.locator('#practice-end').click();
  await expect(page.locator('.practice-debrief')).toBeVisible();
  await expect.poll(async () => (await record(page)).records?.['sail-09']?.attempts).toBe(1);
  await expect
    .poll(async () => (await record(page)).records?.['sail-09']?.lastPracticeResult?.status)
    .toBe('failed');
});

test('actual instrument checkpoints still complete and save a physical assessment', async ({
  page,
}) => {
  await open(page);
  await selectLesson(page, 3);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await page.locator('[data-camera="deck"]').click();
  await expect(page.locator('#practice-live-score')).toContainText('50 / 100');
  await page.locator('#chart-toggle').click();
  await expect(page.locator('body')).toHaveAttribute('data-activity', 'training-paused');
  await page.locator('#close-modal').click();
  await expect(page.locator('.practice-debrief')).toContainText('Training passed');
  await expect(page.locator('.practice-debrief .sailing-track canvas')).toHaveAttribute(
    'data-track-points',
    /\d+/,
  );
  await expect
    .poll(async () => (await record(page)).records?.['sail-04']?.lastPracticeResult?.score)
    .toBe(100);
});
