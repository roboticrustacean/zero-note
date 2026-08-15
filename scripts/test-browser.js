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

  // Type note content
  const editor = page.locator('textarea, input[data-testid="note-editor-input"]').first();
  if (await editor.count() > 0) {
    await editor.click();
    await editor.fill(
      `Ø Zero Note\n\n- [x] Radical single-note minimalism\n- [ ] Slashed zero logo identity\n- [ ] Zero distractions, pure focus`
    );
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_zero_minimal.png' });
  console.log('Main screen saved to screenshot_zero_minimal.png');

  // Open Settings to verify streamlined preferences
  const settingsBtn = page.locator('[data-testid="btn-settings"]').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot_zero_settings.png' });
    console.log('Settings screen saved to screenshot_zero_settings.png');
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
