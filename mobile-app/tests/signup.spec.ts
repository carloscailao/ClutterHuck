import { test, expect } from '@playwright/test';

// Utility to generate unique user data
function generateUser(prefix = 'test') {
  const timestamp = Date.now();
  return {
    email: `${prefix}${timestamp}@example.com`,
    firstName: `testFirst${timestamp}`,
    lastName: `testLast${timestamp}`,
    usernameLong: `testUser${timestamp}`, // too long (will fail)
    usernameShort: 'ab', // too short (will fail)
    usernameValid: `usr${timestamp.toString().slice(-3)}`, // valid and unique
    password: 'StrongPass123!',
    passwordShort: '123', // too short
  };
}


// Successful signup
test('User can sign up successfully with valid username', async ({ page }) => {
  const user = generateUser();

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('text-input-outlined').nth(2).fill(user.firstName);
  await page.getByTestId('text-input-outlined').nth(3).fill(user.lastName);
  await page.getByTestId('text-input-outlined').nth(4).fill(user.usernameValid);

  await page.waitForTimeout(3000); // wait before clicking Next
  await page.getByText('Next', { exact: true }).click();
  await page.getByText('Skip', { exact: true }).click();

  await expect(page).toHaveURL('http://localhost:8081/', { timeout: 10000 });
  console.log(`Successful signup: ${user.email} / ${user.usernameValid}`);
});


// Username too long
test('Signup fails with too long username', async ({ page }) => {
  const user = generateUser('long');

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('text-input-outlined').nth(2).fill(user.firstName);
  await page.getByTestId('text-input-outlined').nth(3).fill(user.lastName);
  await page.getByTestId('text-input-outlined').nth(4).fill(user.usernameLong);

  await page.waitForTimeout(3000);
  await page.getByText('Next', { exact: true }).click();

  const errorMsg = page.getByText('Username must be 3–20 chars', { exact: false });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`Signup failed as expected (too long username): ${user.usernameLong}`);
});


// Username too short
test('Signup fails with too short username', async ({ page }) => {
  const user = generateUser('short');

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.getByTestId('create-account-button').click();

  await page.getByTestId('text-input-outlined').nth(2).fill(user.firstName);
  await page.getByTestId('text-input-outlined').nth(3).fill(user.lastName);
  await page.getByTestId('text-input-outlined').nth(4).fill(user.usernameShort);

  await page.waitForTimeout(3000);
  await page.getByText('Next', { exact: true }).click();

  const errorMsg = page.getByText('Username must be 3–20 chars', { exact: false });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`Signup failed as expected (too short username): ${user.usernameShort}`);
});


// Email already registered
test('Signup fails if email already exists', async ({ page }) => {
  const email = 'simondioresambata@gmail.com';
  const password = 'waxdQSCrfv135$!';

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  const createBtn = page.getByTestId('create-account-button');
  await createBtn.click();

  const errorMsg = page.getByText('This email is already registered.', { exact: true });
  await expect(errorMsg).toBeVisible({ timeout: 5000 });

  console.log(`❌ Signup failed as expected: email already registered -> ${email}`);
});


// Invalid email format
test('Signup fails with invalid email format', async ({ page }) => {
  const email = 'simondioresambata@gmail'; // invalid
  const password = 'StrongPass123!';

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Check button via aria-disabled since it's a div
  const createBtn = page.getByTestId('create-account-button');
  await expect(createBtn).toHaveAttribute('aria-disabled', 'true');

  console.log(`Signup failed as expected: invalid email -> ${email} (button disabled)`);
});


// Password too short
test('Signup fails when password is too short', async ({ page }) => {
  const email = 'testshortpass@example.com';
  const password = '123'; // too short

  await page.goto('http://localhost:8081');
  await page.getByText('Get Started', { exact: true }).click();

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  const createBtn = page.getByTestId('create-account-button');
  await expect(createBtn).toHaveAttribute('aria-disabled', 'true');

  console.log(`Signup failed as expected: password too short -> ${password} (button disabled)`);
});
