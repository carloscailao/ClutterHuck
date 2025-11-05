import { test, expect } from '@playwright/test';

test('create account shows error message', async ({ page }) => {
  await page.goto('/');

  await page.click('input[type="email"]');
  await page.type('input[type="email"]', 'youremail@example.com');

  await page.click('input[type="password"]');
  await page.type('input[type="password"]', '123456');

  // Click Create Account
  await page.getByText('Create Account').click();

  // Wait for UI to update
  await page.waitForTimeout(3000);

  // Debug: print all text
  console.log(await page.textContent('body'));

  // Assert error appears
  await expect(page.getByText('This email is already registered.', { exact: false })).toBeVisible({ timeout: 10000 });
});
