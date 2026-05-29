import { test, expect } from '@playwright/test';

test('capture weapon assets', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('h1:has-text("WEAPON ATLAS")');

  // Wait for some assets to render
  await page.waitForTimeout(2000);

  // Take screenshot of the whole grid
  await page.screenshot({ path: '/app/verification/weapon_atlas_grid.png', fullPage: true });

  // Toggle some effects
  const fireButton = page.locator('button:has-text("Fire")');
  if (await fireButton.isVisible()) {
    await fireButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/app/verification/weapon_atlas_fire.png', fullPage: true });
  }

  const auraOnButton = page.locator('button:has-text("On")').first();
  if (await auraOnButton.isVisible()) {
    await auraOnButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/app/verification/weapon_atlas_aura.png', fullPage: true });
  }
});
