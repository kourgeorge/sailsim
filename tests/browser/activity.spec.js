import { test, expect } from '@playwright/test';

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
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'ready');
}

async function selectLesson(page, index) {
  await page.locator('#course-library').click();
  await page.locator(`[data-library-lesson="${index}"]`).click();
}

const record = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('sail-training-v1') || '{}'));

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

test('changing language flushes the ended attempt before navigation', async ({ page }) => {
  await open(page);
  await selectLesson(page, 8);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-running');
  await page.locator('#language-select').selectOption('he');
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
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'scenario-running');
  await expect(page.locator('#play')).toBeHidden();
  await page.locator('#training-study').click();
  await expect(page.locator('#lesson-reader')).toBeVisible();
  await page.locator('#reader-start-training').click();
  await expect(page.locator('#decision-training')).toBeVisible();
  await page.locator('#training-close').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'review');
  await expect(page.locator('#play')).toBeHidden();
  await page.locator('#training-finish').click();
  await expect(page.locator('#play')).toBeVisible();
  await expect(page.locator('#play')).toBeEnabled();
  await page.locator('#play').click();
  await expect(page.locator('#practice-briefing')).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile sheets, resizing and study preserve the same physical attempt', async ({ page }) => {
  await open(page);
  await selectLesson(page, 8);
  await page.locator('#practice-start').click();
  await page.locator('#practice-launch').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-running');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#mobile-lesson-toggle').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-paused');
  await page.locator('#practice-toggle').click();
  await expect(page.locator('#mobile-lessons')).toBeHidden();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-running');
  await page.locator('#mobile-lesson-toggle').click();
  await page.locator('#lesson-briefing').click();
  await expect(page.locator('#lesson-reader')).toBeVisible();
  await page.locator('#reader-close').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-paused');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.sidebar > .lesson-card')).toBeVisible();
  await page.locator('#play').click();
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-running');
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
  await expect(page.locator('#activity-status')).toHaveAttribute('data-state', 'training-paused');
  await page.locator('#close-modal').click();
  await expect(page.locator('.practice-debrief')).toContainText('Training passed');
  await expect
    .poll(async () => (await record(page)).records?.['sail-04']?.lastPracticeResult?.score)
    .toBe(100);
});
