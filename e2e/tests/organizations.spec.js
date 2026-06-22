const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Organizations module', () => {
  test('an organisation is created on registration and shown in the top bar', async ({ page }) => {
    await signUpAndSignIn(page, { organizationName: 'Brandenburg Data GmbH' });
    await page.goto('/');
    await expect(page.getByTestId('org-name')).toContainText('Brandenburg Data GmbH');
  });

  test('owner can edit the organisation profile and see members', async ({ page }) => {
    await signUpAndSignIn(page, { fullName: 'Owner One' });
    await page.goto('/settings');
    await expect(page.getByTestId('settings')).toBeVisible();

    await page.getByTestId('org-name-input').fill('Renamed Org GmbH');
    await page.getByTestId('save-org').click();
    await expect(page.locator('.banner-success')).toBeVisible();
    await expect(page.getByTestId('org-name')).toContainText('Renamed Org GmbH');

    // The owner appears in the members table.
    await expect(page.getByText('Owner One', { exact: true })).toBeVisible();
  });
});
