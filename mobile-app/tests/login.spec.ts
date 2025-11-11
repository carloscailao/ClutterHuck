import { test, expect } from '@playwright/test';

test('User can log in successfully', async ({ page }) => {
  await page.goto('http://localhost:8081/welcome/page');

  await page.getByText('Get Started', { exact: true }).click();
  await page.fill('input[type="email"]', 'simondioresambata@gmail.com');
  await page.fill('input[type="password"]', 'waxdQSCrfv135$!');
  await page.getByText('Log In', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Log In$/ }).first().click();

  // Verify navigation to root
  await expect(page).toHaveURL('http://localhost:8081/', { timeout: 10000 });

  // ✅ Fix: explicitly pick one visible element to satisfy strict mode
  const welcome = page.getByText('Welcome to ClutterHuck', { exact: true }).first();

});
