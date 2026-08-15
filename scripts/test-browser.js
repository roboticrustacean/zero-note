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

  // Take screenshot of pre-installed onboarding checklist note
  await page.screenshot({ path: 'screenshot_zero_onboarding.png' });
  console.log('Onboarding screenshot saved to screenshot_zero_onboarding.png');

  // Open Settings via clicking the Ø logo
  const logoBtn = page.locator('[data-testid="app-logo-mark"]').first();
  if (await logoBtn.count() > 0) {
    console.log('Tapping Ø logo to open Settings...');
    await logoBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot_zero_settings_v2.png' });
    console.log('Settings screenshot saved to screenshot_zero_settings_v2.png');
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
