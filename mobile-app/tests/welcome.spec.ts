import { test, expect } from '@playwright/test';

test('onboarding + verify all main routes', async ({ page }) => {
  // --- Step 1: Go to Welcome Page ---
  await page.goto('http://localhost:8081/');

  // --- Step 2: Onboarding flow ---
  await page.getByTestId('email-input').click();
  await page.getByText('Skip to Onboarding (Sample)').click();

  // Enter username
  const usernameInput = page.getByRole('textbox', { name: 'Enter your username' });
  await usernameInput.fill('Simon');
  await page.waitForTimeout(5000);
  await page.getByText('Next').nth(0).click();

  // Select category
  await page.getByText('Furniture').click();
  await page.waitForTimeout(5000);
  await page.getByText('Next').nth(1).click();

  // Enter organization name
  const orgInput = page.getByRole('textbox', { name: 'Search or type organization' });
  await orgInput.fill('hello');
  await page.waitForTimeout(5000);
  await page.getByText('Next').nth(2).click();

  // Select privacy option
  await page.waitForTimeout(5000);
  await page.getByText('Keep my profile private').click();

  // Finish onboarding
  await page.waitForTimeout(5000);
  await page.getByText('Finish').click();

  // --- Step 3: Verify main tabs/routes ---
  const tabs = [
    { name: '  Home', uniqueText: 'Responsible Decluttering for' },
    { name: 'Listings', uniqueText: 'Discover items listed by' },
    { name: 'Inventory', uniqueText: 'Digitize your clutter inventory to track items you no longer use — from clothes' },
    { name: 'Chat', uniqueText: 'Digitize your clutter inventory to track items you no longer use — from clothes' },
    { name: 'Profile', uniqueText: 'Unnamed User' }
  ];

  for (const tab of tabs) {
    await page.waitForTimeout(5000); // wait before clicking tab
    await page.getByRole('tab', { name: tab.name }).click();

    // Wait for unique page content to be visible
    await expect(page.getByText(tab.uniqueText, { exact: false })).toBeVisible({ timeout: 5000 });
  }

  // --- Optional: Navigate back to Home ---
  await page.waitForTimeout(5000);
  await page.getByRole('tab', { name: '  Home' }).click();
  await expect(page.getByText('Responsible Decluttering for', { exact: false })).toBeVisible();
});
