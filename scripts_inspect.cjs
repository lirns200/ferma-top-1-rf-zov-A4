const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  
  console.log('Navigating to http://89.125.129.62:3000 ...');
  await page.goto('http://89.125.129.62:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click intro start button if present
  const startBtn = await page.getByText('НАЧАТЬ ПРИКЛЮЧЕНИЕ').first();
  if (await startBtn.count() > 0) {
    console.log('Clicking Start Adventure button...');
    await startBtn.click();
    await page.waitForTimeout(2500);
  }
  
  const brainDir = 'C:/Users/sivma/.gemini/antigravity/brain/37f8cfc5-7abd-4783-9a1d-996f97d5c60e';
  
  // 1. Main Farm View
  await page.screenshot({ path: path.join(brainDir, '01_mobile_farm.png') });
  console.log('1. Captured 01_mobile_farm.png');
  
  // 2. Open Daily Missions
  const missionsBtn = page.getByTitle('Ежедневные миссии');
  if (await missionsBtn.count() > 0) {
    await missionsBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(brainDir, '02_mobile_missions.png') });
    console.log('2. Captured 02_mobile_missions.png');
    const closeBtn = page.getByTitle('Закрыть');
    if (await closeBtn.count() > 0) await closeBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 3. Open Weather Widget
  const weatherBtn = page.getByTitle('Нажмите, чтобы открыть прозрачный прогноз погоды');
  if (await weatherBtn.count() > 0) {
    await weatherBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(brainDir, '03_mobile_weather.png') });
    console.log('3. Captured 03_mobile_weather.png');
    await weatherBtn.click();
    await page.waitForTimeout(500);
  }
  
  // 4. Open Daily Bonus
  const bonusBtn = page.getByTitle('Забрать ежедневный бонус');
  if (await bonusBtn.count() > 0) {
    await bonusBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(brainDir, '04_mobile_daily_bonus.png') });
    console.log('4. Captured 04_mobile_daily_bonus.png');
    const modalClose = page.getByText('✕').first();
    if (await modalClose.count() > 0) await modalClose.click();
    await page.waitForTimeout(500);
  }
  
  // 5. Open Bottom Dock - Friends
  const friendsDock = page.getByRole('button', { name: /Друзья/i }).first();
  if (await friendsDock.count() > 0) {
    await friendsDock.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(brainDir, '05_mobile_friends.png') });
    console.log('5. Captured 05_mobile_friends.png');
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
