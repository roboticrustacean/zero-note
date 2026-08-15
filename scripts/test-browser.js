const { chromium } = require('playwright');

async function checkBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.error('[Page Error]:', err.message);
  });

  console.log('Navigating to http://localhost:8081...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 15000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of onboarding note with interactive checkboxes
  await page.screenshot({ path: 'screenshot_interactive_onboarding.png' });
  console.log('Onboarding saved to screenshot_interactive_onboarding.png');

  // Toggle first two tasks
  const firstCheckbox = page.locator('[data-testid="btn-toggle-task-2"]').first();
  if (await firstCheckbox.count() > 0) {
    console.log('Tapping first task checkbox...');
    await firstCheckbox.click();
    await page.waitForTimeout(400);
  }

  const secondCheckbox = page.locator('[data-testid="btn-toggle-task-3"]').first();
  if (await secondCheckbox.count() > 0) {
    console.log('Tapping second task checkbox...');
    await secondCheckbox.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: 'screenshot_tasks_checked.png' });
  console.log('Checked tasks saved to screenshot_tasks_checked.png');

  // Open Settings and test Reload Guide Note
  const logoBtn = page.locator('[data-testid="app-logo-mark"]').first();
  if (await logoBtn.count() > 0) {
    console.log('Opening Settings...');
    await logoBtn.click();
    await page.waitForTimeout(600);

    // Accept window.confirm automatically
    page.on('dialog', async (dialog) => {
      console.log('Dialog opened:', dialog.message());
      await dialog.accept();
    });

    const reloadBtn = page.locator('[data-testid="btn-reload-guide"]').first();
    if (await reloadBtn.count() > 0) {
      console.log('Clicking Reload Guide Note...');
      await reloadBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'screenshot_reloaded_guide.png' });
      console.log('Reloaded guide saved to screenshot_reloaded_guide.png');
    }
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
