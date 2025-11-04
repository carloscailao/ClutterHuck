import { test, expect } from '@playwright/test';

test('skip to onboarding', async ({ page }) => {
  await page.goto('/');

  // Skip to Onboarding
  await page.getByText('Skip to Onboarding (Sample)').click();

  // enter username
  await page.click('input[placeholder*="username"]');  
  await page.type('input[placeholder*="username"]', 'JohnDoe');

  // Wait for UI to update
  await page.waitForTimeout(10000);

  // Click next
  await page.getByText('Next').click();

  // Click skip
  // await page.locator('div.css-text-146c3p1', { hasText: /^Skip$/ }).click();
  await page.getByText('Skip').first().click();

  // enter organization name
  await page.click('input[placeholder*="Search or type organization name"]');  
  await page.type('input[placeholder*="Search or type organization name"]', 'TestOrg');

  // Wait for UI to update
  await page.waitForTimeout(10000);

  // Click next
  await page.getByText('Next').nth(1).click();

  // Select privacy option
  await page.getByText('Keep my profile private').click();

  // Click finish
  await page.getByText('Finish').click();

  // Assert onboarding complete
  await expect(page.getByText('Welcome to ClutterHuck', { exact: false })).toBeVisible({ timeout: 10000 });

});
