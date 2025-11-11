import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {

  test('User can log in successfully', async ({ page }) => {
    // Step 1: Go to welcome page
    await page.goto('http://localhost:8081/welcome/page');

    // Step 2: Click "Get Started"
    await page.getByText('Get Started', { exact: true }).click();

    // Step 3: Fill valid credentials
    await page.fill('input[type="email"]', 'simondioresambata@gmail.com');
    await page.fill('input[type="password"]', 'waxdQSCrfv135$!');

    // Step 4: Click the "Log In" text toggle
    await page.getByText('Log In', { exact: true }).click();

    // Step 5: Click the actual "Log In" button
    await page.locator('div').filter({ hasText: /^Log In$/ }).first().click();

    // Step 6: Verify navigation to root
    await expect(page).toHaveURL('http://localhost:8081/', { timeout: 10000 });


   page.getByText('Welcome to ClutterHuck', { exact: true }).first();

  });


  test('User login fails with incorrect credentials', async ({ page }) => {
    // Step 1: Go to welcome page
    await page.goto('http://localhost:8081/welcome/page');

    // Step 2: Click "Get Started"
    await page.getByText('Get Started', { exact: true }).click();

    // Step 3: Fill invalid credentials
    await page.fill('input[type="email"]', 'invaliduser@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');

    // Step 4: Click the "Log In" text toggle
    await page.getByText('Log In', { exact: true }).click();

    // Step 5: Click the actual "Log In" button
    await page.locator('div').filter({ hasText: /^Log In$/ }).first().click();

    // Step 6: Verify error message appears
    const errorMessage = page.getByText('Incorrect email or password.', { exact: true });
    await expect(errorMessage).toBeVisible();

    // Step 7: Ensure still on register page
await expect(page).toHaveURL('http://localhost:8081/register/page');
  });

});
