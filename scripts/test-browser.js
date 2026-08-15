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

  // Type some sample markdown note to see the full UI in action
  const editor = page.locator('textarea, input[data-testid="note-editor-input"]').first();
  if (await editor.count() > 0) {
    await editor.click();
    await editor.fill(
      `Ship the Android clone today.\n\n- [x] Research Mononote aesthetic\n- [ ] Design persistent lock screen channel\n- [ ] Add home screen widget\n\nPure single-note focus.`
    );
  }

  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot updated in screenshot.png');

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
