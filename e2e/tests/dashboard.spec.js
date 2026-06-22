const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Dashboard module', () => {
  test('shows the standing card and widgets for a new organisation', async ({ page }) => {
    await signUpAndSignIn(page);
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('widget-standing')).toBeVisible();
    await expect(page.getByTestId('overall-score')).toContainText('%');
    await expect(page.getByText('Upcoming reviews')).toBeVisible();
    await expect(page.getByText('Framework progress')).toBeVisible();
  });
});
