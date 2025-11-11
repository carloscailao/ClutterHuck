import { test, expect } from '@playwright/test';

// Utility to generate unique user data
function generateUser(prefix = 'test') {
  const timestamp = Date.now();
  return {
    email: `${prefix}${timestamp}@example.com`,
    firstName: `testFirst${timestamp}`,
    lastName: `testLast${timestamp}`,
    usernameLong: `user${timestamp}verylongusername`, // too long
    usernameShort: 'ab', // too short
    usernameValid: `usr${timestamp.toString().slice(-3)}`, // valid
    password: 'StrongPass123!',
    passwordShort: '123', // too short
  };
}

// --- Successful signup ---
test('User can sign up successfully with valid username', async ({ page }) => {
  const user = generateUser();

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('firstNameInput').fill(user.firstName);
  await page.getByTestId('lastNameInput').fill(user.lastName);
  await page.getByTestId('usernameInput').fill(user.usernameValid);
  

  await page.waitForTimeout(3000);
  await page.getByTestId('nextButton').click();      // Next button with test ID
  await page.getByText('Skip', { exact: true }).click(); // Skip still uses text

  await expect(page).toHaveURL('http://localhost:8081/', { timeout: 10000 });
  console.log(`Successful signup: ${user.email} / ${user.usernameValid}`);
});

// --- Username too long ---
test('Signup fails with too long username', async ({ page }) => {
  const user = generateUser('long');

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('firstNameInput').fill(user.firstName);
  await page.getByTestId('lastNameInput').fill(user.lastName);
  await page.getByTestId('usernameInput').fill(user.usernameLong);

  
  await page.getByTestId('nextButton').click();

  const errorMsg = page.getByText('Username must be 3–20 chars', { exact: false });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`Signup failed as expected (too long username): ${user.usernameLong}`);
});

// --- Username too short ---
test('Signup fails with too short username', async ({ page }) => {
  const user = generateUser('short');

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('firstNameInput').fill(user.firstName);
  await page.getByTestId('lastNameInput').fill(user.lastName);
  await page.getByTestId('usernameInput').fill(user.usernameShort);

  await page.getByTestId('nextButton').click();

  const errorMsg = page.getByText('Username must be 3–20 chars', { exact: false });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`Signup failed as expected (too short username): ${user.usernameShort}`);
});

// --- Email already registered ---
test('Signup fails if email already exists', async ({ page }) => {
  const email = 'simondioresambata@gmail.com';
  const password = 'waxdQSCrfv135$!';

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page.getByTestId('create-account-button').click();

  const errorMsg = page.getByText('This email is already registered.', { exact: true });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`Signup failed as expected: email already registered -> ${email}`);
});

// --- Invalid email format ---
test('Signup fails with invalid email format', async ({ page }) => {
  const email = 'simondioresambata@gmail'; // invalid
  const password = 'StrongPass123!';

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  const createBtn = page.getByTestId('create-account-button');
  await expect(createBtn).toHaveAttribute('aria-disabled', 'true');

  console.log(`Signup failed as expected: invalid email -> ${email} (button disabled)`);
});

// --- Password too short ---
test('Signup fails when password is too short', async ({ page }) => {
  const email = 'testshortpass@example.com';
  const password = '123'; // too short

  await page.goto('http://localhost:8081/welcome/page');
  await page.locator('div').filter({ hasText: /^Get Started$/ }).first().click();

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  const createBtn = page.getByTestId('create-account-button');
  await expect(createBtn).toHaveAttribute('aria-disabled', 'true');

  console.log(`Signup failed as expected: password too short -> ${password} (button disabled)`);
});
