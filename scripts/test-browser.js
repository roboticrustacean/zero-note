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

  const textInput = page.locator('[data-testid="note-editor-input"]').first();
  if (await textInput.count() > 0) {
    // 1. Test double-tap / double-click to create task
    console.log('Double clicking on canvas...');
    await textInput.dblclick({ position: { x: 100, y: 320 } });
    await page.waitForTimeout(400);

    // 2. Type task description
    await textInput.type('Plan next sprint');
    await page.waitForTimeout(300);

    // 3. Mark one task as [x]
    const content = await textInput.inputValue();
    const updatedWithX = content.replace('- [ ] Tap checkbox to mark as done', '- [x] Tap checkbox to mark as done');
    await textInput.fill(updatedWithX);
    await page.waitForTimeout(400);

    await page.screenshot({ path: 'screenshot_unified_dashed_task.png' });
    console.log('Dashed task screenshot saved to screenshot_unified_dashed_task.png');
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
