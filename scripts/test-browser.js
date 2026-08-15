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
    // 1. Initial hovered screenshot
    await page.mouse.move(640, 400);
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshot_hovered_ui.png' });
    console.log('Hovered UI screenshot saved to screenshot_hovered_ui.png');

    // 2. Move mouse away to test ambient fade out
    console.log('Moving mouse outside the window...');
    await page.mouse.move(50, 50);
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'screenshot_faded_ui.png' });
    console.log('Faded UI screenshot saved to screenshot_faded_ui.png');

    // 3. Move mouse back in and test clicking whitespace inside [ ]
    console.log('Moving mouse back and clicking inside [ ] whitespace...');
    await page.mouse.move(640, 400);
    await page.waitForTimeout(300);

    // Get current text and find position of '[ ]' on the first task
    const val = await textInput.inputValue();
    const bracketIndex = val.indexOf('[ ]');
    if (bracketIndex !== -1) {
      console.log(`Setting cursor right inside [ ] at index ${bracketIndex + 1}...`);
      await textInput.focus();
      // Set selection right between [ and ]
      await page.evaluate((pos) => {
        const input = document.querySelector('[data-testid="note-editor-input"]');
        if (input) {
          input.setSelectionRange(pos, pos);
          input.dispatchEvent(new Event('select', { bubbles: true }));
        }
      }, bracketIndex + 1);
      await page.waitForTimeout(400);

      await page.screenshot({ path: 'screenshot_bracket_toggled_in_place.png' });
      console.log('Toggled in place screenshot saved to screenshot_bracket_toggled_in_place.png');
    }
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
