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
    console.log('Focusing text input and navigating with arrow keys...');
    await textInput.focus();
    
    // Press ArrowDown several times across tasks
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(50);
    }

    // Press ArrowRight several times across brackets
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(50);
    }

    // Press ArrowLeft
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(50);
    }

    const valAfterArrows = await textInput.inputValue();
    console.log('Text after arrow navigation (should NOT have changed tasks):\n', valAfterArrows);

    // Verify tasks are intact
    if (valAfterArrows.includes('- [ ] Double tap canvas to create a task')) {
      console.log('PASSED: Arrow key navigation is 100% normal text navigation!');
    } else {
      console.error('FAILED: Arrow navigation altered text.');
    }
  }

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
