import { test, expect } from '@playwright/test';

test('welcome text and login inputs are visible', async ({ page }) => {
  await page.goto('/'); // open the app

  // Verify welcome text
  await expect(page.getByText('ClutterHuck')).toBeVisible();
  await expect(page.getByText('Create an Account')).toBeVisible();
  await expect(page.getByText('Join us to start decluttering with purpose.')).toBeVisible();

  // Verify Email input is visible and type into it
  const emailInput = page.getByText('Email').first();
  await expect(emailInput).toBeVisible();
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', 'youremail@example.com');

  // Verify Password input is visible and type into it
  const passwordInput = page.getByText('Password').first();
  await expect(passwordInput).toBeVisible();
  await page.click('input[type="password"]');
  await page.type('input[type="password"]', '123456');
});
