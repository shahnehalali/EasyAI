const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Frameworks module', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('lists frameworks from seeded data', async ({ page }) => {
    await page.goto('/frameworks');
    await expect(page.getByTestId('frameworks')).toBeVisible();
    await expect(page.getByTestId('framework-row-eu_ai_act')).toBeVisible();
    await expect(page.getByTestId('framework-row-gdpr')).toBeVisible();
  });

  test('the tier filter narrows the table to EU, national or sector laws', async ({ page }) => {
    await page.goto('/frameworks');
    await expect(page.getByTestId('framework-filters')).toBeVisible();

    // National law (tier 2): BDSG shows, EU AI Act is hidden.
    await page.getByTestId('framework-filter-national').click();
    await expect(page.getByTestId('framework-row-bdsg')).toBeVisible();
    await expect(page.getByTestId('framework-row-eu_ai_act')).toHaveCount(0);

    // Sector (tier 3): BaFin shows, BDSG is hidden.
    await page.getByTestId('framework-filter-sector').click();
    await expect(page.getByTestId('framework-row-bafin_ki')).toBeVisible();
    await expect(page.getByTestId('framework-row-bdsg')).toHaveCount(0);

    // EU (tier 1): EU AI Act shows again.
    await page.getByTestId('framework-filter-eu').click();
    await expect(page.getByTestId('framework-row-eu_ai_act')).toBeVisible();
    await expect(page.getByTestId('framework-row-bafin_ki')).toHaveCount(0);

    // All: everything is back.
    await page.getByTestId('framework-filter-all').click();
    await expect(page.getByTestId('framework-row-eu_ai_act')).toBeVisible();
    await expect(page.getByTestId('framework-row-bdsg')).toBeVisible();
    await expect(page.getByTestId('framework-row-bafin_ki')).toBeVisible();
  });

  test('framework detail shows requirements, guidance and a law link', async ({ page }) => {
    await page.goto('/frameworks/eu_ai_act');
    await expect(page.getByTestId('framework-detail')).toBeVisible();
    await expect(page.getByText('Requirements in plain language')).toBeVisible();
    await expect(page.getByText('Human oversight', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /Official text/i })).toBeVisible();
  });

  test('the framework detail page switches to German', async ({ page }) => {
    await page.goto('/frameworks/gdpr');
    await expect(page.getByTestId('framework-detail')).toBeVisible();
    await expect(page.getByText('Requirements in plain language')).toBeVisible();

    await page.getByTestId('lang-de').click();
    // Static section titles switch...
    await expect(page.getByText('Anforderungen in einfacher Sprache')).toBeVisible();
    await expect(page.getByText('Wer muss es einhalten')).toBeVisible();
    // ...and the law content itself is localised.
    await expect(page.getByTestId('framework-detail')).toContainText('Datenschutz-Grundverordnung');

    await page.evaluate(() => localStorage.removeItem('aic_lang')).catch(() => {});
  });
});
