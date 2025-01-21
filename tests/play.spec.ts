import { test, expect } from '@playwright/test';

test.describe('KROZ', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/The Forgotton Adventures of Kroz/);
  });

  test('plays level 1', async ({ page }) => {
    let delay = 120;

    await page.locator('body').pressSequentially('AAAAAAAAA', { delay });

    await page.evaluate(() => {
      const api = window['krozDebugAPI'];
      api.levels.level = 1;
    });

    await page.locator('body').pressSequentially('AAAAAAAAA', { delay });
    await page.waitForTimeout(1000);

    delay = 120;
    await page.locator('body').pressSequentially('36666', { delay });

    let stats = await page.evaluate(() => {
      const api = window['krozDebugAPI'];
      return api.stats;
    });
    await expect(stats.keys).toBe(1);

    await page.locator('body').pressSequentially('447996666666', { delay });
    await page.waitForTimeout(2000);

    stats = await page.evaluate(() => {
      const api = window['krozDebugAPI'];
      return api.stats;
    });
    await expect(stats.keys).toBe(0);

    await page
      .locator('body')
      .pressSequentially('666333696369966636336666', { delay });
    await page.waitForTimeout(340);
    await page
      .locator('body')
      .pressSequentially('3636633211144444447741441', { delay });
    await page.waitForTimeout(340);
    await page
      .locator('body')
      .pressSequentially('77777444411144444441111111111144444441111111', {
        delay,
      });
    await page.waitForTimeout(340);
    await page
      .locator('body')
      .pressSequentially('4444444444444444444448888888', { delay });
    await page.waitForTimeout(340);
    await page
      .locator('body')
      .pressSequentially('66666666666666666666222222', { delay });
    await page.waitForTimeout(340);

    stats = await page.evaluate(() => {
      const api = window['krozDebugAPI'];
      return api.stats;
    });
    await expect(stats.whips).toBe(13);

    await page.locator('body').pressSequentially('66666666666', { delay });
    await page.waitForTimeout(680);
    await page.locator('body').pressSequentially('22222233333333', { delay });
    await page.waitForTimeout(680);
    await page.locator('body').pressSequentially('6666666', { delay });
    await page.waitForTimeout(680);
    await page
      .locator('body')
      .pressSequentially('333336666663333366666633333', { delay });
    await page.waitForTimeout(680);
    await page
      .locator('body')
      .pressSequentially('666699999999966663333333333', { delay });
    await page.waitForTimeout(680);
    await page.locator('body').pressSequentially('666666669999999', { delay });
    await page.waitForTimeout(680);
    await page
      .locator('body')
      .pressSequentially('66666333666699998888888', { delay });
    await page.waitForTimeout(680);
    await page
      .locator('body')
      .pressSequentially('777777888889999999999997777777', { delay });
    await page.waitForTimeout(680);
    await page.locator('body').pressSequentially('7777777', { delay });
    await page.waitForTimeout(680);

    await page.locator('body').pressSequentially('8', { delay });
    await page.waitForTimeout(1000);
    await page.locator('body').pressSequentially('YYY', { delay });
    await page.waitForTimeout(1000);
    await page.locator('body').pressSequentially('8', { delay });
    // await page.waitForTimeout(5000);
    // await page.locator('body').pressSequentially('888', { delay });
    // await page.waitForTimeout(1000);

    // stats = await page.evaluate(() => {
    //   const api = window['krozDebugAPI'];
    //   return api.levels;
    // });
    // await expect(stats.level).toBe(2);
  });
});
