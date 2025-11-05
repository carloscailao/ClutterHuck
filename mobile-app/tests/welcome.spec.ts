import { test, expect } from '@playwright/test';

test('onboarding + verify main routes', async ({ page }) => {
  // Step 1: Go to Welcome Page
  await page.goto('http://localhost:8081/');
  await page.getByText('Skip to Onboarding (Sample)').click();
  await page.waitForTimeout(3000);

  // Step 2: Onboarding flow
  // Enter username
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('Simon');
  await page.waitForTimeout(3000);
  await page.getByText('Next').nth(0).click();
  await page.waitForTimeout(3000);

  // Enter display name
  await page.getByRole('textbox', { name: 'Enter your display name' }).fill('Simon');
  await page.waitForTimeout(3000);
  await page.getByText('Continue').click();
  await page.waitForTimeout(3000);

  // Step 3: Verify main tabs/routes
  const tabs = [
    { name: '  Home', uniqueText: 'Responsible Decluttering for' },
    { name: 'Listings', uniqueText: 'Discover items listed by' },
    { name: 'Inventory', uniqueText: 'Digitize your clutter inventory to track items you no longer use — from clothes' },
    { name: 'Chat', uniqueText: 'Digitize your clutter inventory to track items you no longer use — from clothes' },
    { name: 'Profile', uniqueText: 'Unnamed User' }
  ];

  for (const tab of tabs) {
    await page.waitForTimeout(3000);
    await page.getByRole('tab', { name: tab.name }).click();
    await page.waitForTimeout(3000);
    await expect(page.getByText(tab.uniqueText, { exact: false })).toBeVisible();
  }

  // Navigate back to Home
  await page.waitForTimeout(3000);
  await page.getByRole('tab', { name: '  Home' }).click();
  await expect(page.getByText('Responsible Decluttering for', { exact: false })).toBeVisible();
});
