const { chromium } = require('playwright');

async function checkBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.error('[Page Error]:', err.message);
  });

  console.log('Navigating to http://localhost:8081...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  // Click Settings icon to test fluid modal animation
  const settingsBtn = page.locator('[data-testid="btn-settings"]').first();
  if (await settingsBtn.count() > 0) {
    console.log('Clicking Settings button...');
    await settingsBtn.click();
    await page.waitForTimeout(600); // allow spring animation to settle
  }

  await page.screenshot({ path: 'screenshot_modal.png' });
  console.log('Modal screenshot saved to screenshot_modal.png');

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
