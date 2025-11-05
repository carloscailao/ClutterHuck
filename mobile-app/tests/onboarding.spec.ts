import { test, expect } from '@playwright/test';

test('onboarding', async ({ page }) => {
    await page.goto('/');

    // Click "Get Started" to move to the sign-up screen.
    await page.getByText('Get Started').click();
    
    // Fill the email and password fields
    await page.getByLabel('Email').fill('stsweng@gmail.com');
    await page.getByLabel('Password').fill('SecurePassword123');

    // Click the main submission button
    await page.getByText('Create Account').click();

    // Enter First Name, Last Name, Username
    await page.getByLabel('First name').fill('ST');
    await page.getByLabel('Last name').fill('SWENG');
    await page.getByLabel('Username').fill('STSWENG123');

    // Wait UI to update
    await page.waitForTimeout(1500);

    // Click next
    await page.getByText('Next').click();

    // Skip the profile picture upload
    await page.getByText('Skip').click(); 

    // Assert that onboarding is complete by checking for a text element on the main app screen 
    await expect(page.getByText('Welcome to ClutterHuck', { exact: false })).toBeVisible({ timeout: 10000 });
});
