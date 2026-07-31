const { test, expect } = require('@playwright/test');

test.describe('Auth pages language', () => {
  test('the login page has a working language switcher', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('lang-switch')).toBeVisible();
    await page.getByTestId('lang-de').click();
    await expect(page.getByTestId('lang-de')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('lang-en').click();
    await expect(page.getByTestId('lang-en')).toHaveAttribute('aria-pressed', 'true');
  });

  test('defaults to German when no language has been chosen', async ({ page }) => {
    // Ignore the suite-wide English storageState: clear the saved choice so the
    // app falls back to its real default.
    await page.addInitScript(() => { try { localStorage.removeItem('aic_lang'); } catch (e) { /* ignore */ } });
    await page.goto('/register');
    await expect(page.getByTestId('lang-de')).toHaveAttribute('aria-pressed', 'true');
  });
});
