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

  // Take screenshot of magic text-construct onboarding
  await page.screenshot({ path: 'screenshot_magic_text_tasks.png' });
  console.log('Magic text tasks screenshot saved to screenshot_magic_text_tasks.png');

  // Click the first magic [ ] token
  const firstBracket = page.locator('[data-testid="btn-toggle-task-2"]').first();
  if (await firstBracket.count() > 0) {
    console.log('Tapping [ ] magic construct token...');
    await firstBracket.click();
    await page.waitForTimeout(500);
  }

  // Take screenshot after checking and auto-moving to bottom
  await page.screenshot({ path: 'screenshot_magic_task_checked_bottom.png' });
  console.log('Checked and moved to bottom saved to screenshot_magic_task_checked_bottom.png');

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
