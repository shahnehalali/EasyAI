const { test, expect } = require('@playwright/test');
const { uniqueEmail } = require('../fixtures/helpers');

test.describe('Auth module', () => {
  test('register, verify via link, then land on dashboard', async ({ page }) => {
    const email = uniqueEmail('auth');
    const password = 'Test12345!';

    await page.goto('/register');
    await page.getByTestId('fullName').fill('Ada Lovelace');
    await page.getByTestId('organizationName').fill('Analytical Engines GmbH');
    await page.getByTestId('email').fill(email);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('register-success')).toBeVisible();

    // Fetch the verification link the app would have emailed, then visit it.
    const tokRes = await page.request.post('/api/auth/dev/verification-token', { data: { email } });
    const { token } = await tokRes.json();
    await page.goto(`/verify-email?token=${token}`);
    await expect(page.getByTestId('verify-success')).toBeVisible();
    await expect(page.getByTestId('dashboard')).toBeVisible();
  });

  test('login is blocked before email verification', async ({ page }) => {
    const email = uniqueEmail('unverified');
    const password = 'Test12345!';
    await page.request.post('/api/auth/register', { data: { fullName: 'Unverified', email, password } });

    await page.goto('/login');
    await page.getByTestId('email').fill(email);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('submit').click();
    await expect(page.locator('.banner-error')).toContainText(/verify/i);
  });

  test('wrong password shows an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email').fill('demo@aicompliance.local');
    await page.getByTestId('password').fill('wrong-password');
    await page.getByTestId('submit').click();
    await expect(page.locator('.banner-error')).toBeVisible();
  });

  test('seeded user can sign in and sign out', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email').fill('demo@aicompliance.local');
    await page.getByTestId('password').fill('Demo12345!');
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('dashboard')).toBeVisible();

    await page.getByTestId('account-menu').click();
    await page.getByTestId('logout').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
