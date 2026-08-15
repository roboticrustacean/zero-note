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
  await page.waitForTimeout(1000);

  // Type note content into the floating window
  const editor = page.locator('textarea, input[data-testid="note-editor-input"]').first();
  if (await editor.count() > 0) {
    await editor.click();
    await editor.fill(
      `Ø Floating Window Mode\n\n- [x] Mononote instant Archive flow\n- [x] Resizable desktop window\n- [ ] Focus on one active thought`
    );
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_floating_window.png' });
  console.log('Floating window screenshot saved to screenshot_floating_window.png');

  // Test Archive button click
  const archiveBtn = page.locator('[data-testid="btn-archive"]').first();
  if (await archiveBtn.count() > 0) {
    console.log('Clicking Archive button...');
    await archiveBtn.click();
    await page.waitForTimeout(800);
  }

  // Open Archive drawer to verify archived note
  const historyBtn = page.locator('[data-testid="btn-history"]').first();
  if (await historyBtn.count() > 0) {
    console.log('Clicking History button...');
    await historyBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot_floating_archive.png' });
    console.log('Archive drawer screenshot saved to screenshot_floating_archive.png');
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
