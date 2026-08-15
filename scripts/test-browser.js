const { chromium } = require('playwright');

async function checkBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    console.error('[Page Error]:', err.message);
  });

  console.log('Navigating to http://localhost:8081...');
  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log('Navigation event:', e.message);
  }

  await page.waitForTimeout(2000);

  console.log('\n--- Console Logs ---');
  consoleLogs.forEach((log) => {
    console.log(`[${log.type}] ${log.text}`);
  });

  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('\n--- Document Body HTML (first 500 chars) ---');
  console.log(bodyHtml.substring(0, 500));

  await page.screenshot({ path: 'screenshot.png' });
  console.log('\nScreenshot saved to screenshot.png');

  await browser.close();
}

checkBrowser().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
