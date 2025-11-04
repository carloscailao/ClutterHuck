import { test, expect } from '@playwright/test';

test('welcome text and login inputs are visible', async ({ page }) => {
  await page.goto('/'); // open the app

  // Verify welcome text
  await expect(page.getByText('ClutterHuck')).toBeVisible();
  await expect(page.getByText('Create an Account')).toBeVisible();
  await expect(page.getByText('Join us to start decluttering with purpose.')).toBeVisible();

  // Verify Email input is visible and type into it
  const emailInput = page.getByPlaceholder('Email');
  await expect(emailInput).toBeVisible();
  await emailInput.fill('testuser@example.com');

  // Verify Password input is visible and type into it
  const passwordInput = page.getByPlaceholder('Password');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill('TestPassword123');
});
