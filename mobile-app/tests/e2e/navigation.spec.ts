import { test, expect } from '@playwright/test';

test('User can log in and navigate tabs', async ({ page }) => {
  //LOGIN 
  await page.goto('http://localhost:8081/welcome/page');
  await page.getByText('Get Started', { exact: true }).click();
  await page.fill('input[type="email"]', 'simondioresambata@gmail.com');
  await page.fill('input[type="password"]', 'waxdQSCrfv135$!');

  await page.getByText('Log In', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Log In$/ }).first().click();

  //VERIFY LOGIN
  await expect(page).toHaveURL('http://localhost:8081/', { timeout: 10000 });
  const responsibleText = page.getByText('Responsible Decluttering for a Sustainable Future', { exact: true });
  await expect(responsibleText).toBeVisible({ timeout: 10000 });
  await responsibleText.click();

  //NAVIGATE TABS
  await page.getByRole('tab', { name: 'Listings' }).click();
  await expect(page.getByText('Listings').first()).toBeVisible();
  await expect(page).toHaveURL(/.*listings/);

  await page.getByRole('tab', { name: 'Inventory' }).click();
  await expect(page.getByText('My Inventory').first()).toBeVisible();
  await expect(page).toHaveURL(/.*inventory/);

  await page.getByRole('tab', { name: 'Chat' }).click();
  await expect(page.getByText('Chat').first()).toBeVisible();
  await expect(page).toHaveURL(/.*chat/);

  await page.getByRole('tab', { name: 'Profile' }).click();
  await expect(page.getByText('Account Info').first()).toBeVisible();
  await expect(page).toHaveURL(/.*profile/);

  await page.getByRole('tab', { name: '  Home' }).click();
  await expect(page.getByText('What You Can Do').first()).toBeVisible();
  await expect(page).toHaveURL('http://localhost:8081/');
});
