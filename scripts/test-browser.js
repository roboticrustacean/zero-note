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
    const val = await textInput.inputValue();
    const bracketIndex = val.indexOf('[ ]');
    if (bracketIndex !== -1) {
      console.log(`Clicking whitespace inside [ ] at index ${bracketIndex + 1}...`);
      await textInput.focus();
      await page.evaluate((pos) => {
        const input = document.querySelector('[data-testid="note-editor-input"]');
        if (input) {
          input.setSelectionRange(pos, pos);
          input.dispatchEvent(new Event('select', { bubbles: true }));
        }
      }, bracketIndex + 1);
      await page.waitForTimeout(400);

      const afterVal = await textInput.inputValue();
      console.log('Text after toggle:\n', afterVal);

      await page.screenshot({ path: 'screenshot_clean_no_tildes.png' });
      console.log('Clean screenshot saved to screenshot_clean_no_tildes.png');
    }
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
