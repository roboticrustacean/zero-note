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

  // Take screenshot of pure unified single text input canvas
  await page.screenshot({ path: 'screenshot_unified_editor_idle.png' });
  console.log('Idle screenshot saved to screenshot_unified_editor_idle.png');

  // Click directly into the text input
  const textInput = page.locator('[data-testid="note-editor-input"]').first();
  if (await textInput.count() > 0) {
    console.log('Clicking directly into text input...');
    await textInput.click();
    await page.waitForTimeout(400);

    // Verify there is ZERO layout jump or mode change
    await page.screenshot({ path: 'screenshot_unified_editor_focused.png' });
    console.log('Focused screenshot saved to screenshot_unified_editor_focused.png');

    // Type a new task with []
    console.log('Typing new task with [] syntax...');
    await textInput.fill('Ø Zero Note\n\n- [ ] First task\n[] Second task auto expanded');
    await page.waitForTimeout(400);

    await page.screenshot({ path: 'screenshot_unified_editor_typed.png' });
    console.log('Typed screenshot saved to screenshot_unified_editor_typed.png');
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
