const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('FAQ page', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('aic_lang')).catch(() => {});
  });

  test('is reachable from the sidebar and lists categories', async ({ page }) => {
    await page.goto('/');
    await page.locator('.sidebar').getByText('FAQ', { exact: true }).click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.getByTestId('faq')).toBeVisible();
    await expect(page.getByTestId('faq-category-basics')).toBeVisible();
    await expect(page.getByTestId('faq-category-assessments')).toBeVisible();
  });

  test('a question expands to reveal its answer', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByTestId('faq-a-what-is')).toHaveCount(0);
    await page.getByTestId('faq-q-what-is').click();
    await expect(page.getByTestId('faq-a-what-is')).toBeVisible();
    await expect(page.getByTestId('faq-a-what-is')).toContainText('Easy AI helps companies in Germany');
  });

  test('the FAQ follows the selected language', async ({ page }) => {
    await page.goto('/faq');
    await page.getByTestId('lang-de').click();
    await expect(page.getByTestId('faq')).toContainText('Häufig gestellte Fragen');
    await page.getByTestId('faq-q-what-is').click();
    await expect(page.getByTestId('faq-a-what-is')).toContainText('Easy AI hilft Unternehmen in Deutschland');
    // The disclaimer at the very bottom of the page also switches.
    await expect(page.getByTestId('faq')).toContainText('keine Rechtsberatung');
    await expect(page.getByTestId('faq')).not.toContainText('not legal advice');
  });
});
