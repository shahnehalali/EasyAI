const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Language switch (English / German)', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  // Language persists in localStorage by design; clear it so the German
  // setting from these tests does not leak into later specs.
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('aic_lang')).catch(() => {});
  });

  test('the EN / DE switch translates the whole app chrome', async ({ page }) => {
    await page.goto('/');

    // Defaults to English.
    const sidebar = page.locator('.sidebar');
    await expect(sidebar.getByText('AI Systems', { exact: true })).toBeVisible();
    await expect(page.getByTestId('page-title')).toHaveText('Dashboard');

    // Switch to German.
    await page.getByTestId('lang-de').click();
    await expect(sidebar.getByText('KI-Systeme', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Gesetzes-Explorer', { exact: true })).toBeVisible();
    await expect(page.getByTestId('page-title')).toHaveText('Übersicht');

    // Switch back to English.
    await page.getByTestId('lang-en').click();
    await expect(sidebar.getByText('AI Systems', { exact: true })).toBeVisible();
    await expect(page.getByTestId('page-title')).toHaveText('Dashboard');
  });

  test('the language choice persists across reloads', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('lang-de').click();
    await expect(page.getByTestId('page-title')).toHaveText('Übersicht');

    await page.reload();
    await expect(page.getByTestId('page-title')).toHaveText('Übersicht');
  });

  test('the help assistant follows the selected language', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('lang-de').click();
    await page.getByTestId('help-launcher').click();
    await expect(page.getByTestId('help-panel')).toContainText('Hilfe-Assistent');
    await page.getByTestId('help-input').fill('wie funktioniert die einstufung');
    await page.getByTestId('help-send').click();
    await expect(page.getByTestId('help-panel')).toContainText('Verboten, Hoch, Begrenzt oder Minimal');
  });
});
