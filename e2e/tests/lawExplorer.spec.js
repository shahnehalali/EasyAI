const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Law Explorer module', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  // The language toggle persists in localStorage by design; clear it so a
  // German selection here does not leak into later specs.
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('aic_lang')).catch(() => {});
  });

  test('renders the tiered map of laws', async ({ page }) => {
    await page.goto('/law-explorer');
    await expect(page.getByTestId('law-explorer')).toBeVisible();
    await expect(page.getByTestId('law-card-eu_ai_act')).toBeVisible();
    await expect(page.getByTestId('law-card-gdpr')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'German national' })).toBeVisible();
  });

  test('the applicability questionnaire highlights the right laws', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('fn-financial_services').click();
    // DORA and KWG should now be marked as likely to apply.
    await expect(page.getByTestId('law-card-dora').getByText('Likely applies')).toBeVisible();
    await expect(page.getByTestId('law-card-kwg').getByText('Likely applies')).toBeVisible();
  });

  test('opens a law detail drawer with rich plain-language content', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('law-card-gdpr').click();
    const drawer = page.getByTestId('law-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('In plain terms');
    await expect(drawer).toContainText('Who must comply');
    await expect(drawer).toContainText('Who enforces it');
    // The richer Phase LE-1 content: what to do, key dates, and penalties.
    await expect(drawer.getByTestId('drawer-what-to-do')).toContainText('What you must do');
    await expect(drawer.getByTestId('drawer-key-dates')).toContainText('Key dates');
    await expect(drawer.getByTestId('drawer-penalties')).toContainText('Penalties');
    await expect(drawer.getByTestId('drawer-penalties')).toContainText('20 million euros');
    await page.getByTestId('drawer-close').click();
    await expect(drawer).not.toBeVisible();
  });

  test('search filters the law list', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('law-search').fill('GDPR');
    await expect(page.getByTestId('law-card-gdpr')).toBeVisible();
    await expect(page.getByTestId('law-card-dora')).toHaveCount(0);
  });

  // ---- Phase LE-2 ----

  test('the questionnaire is grouped by category and the selection is saved', async ({ page }) => {
    await page.goto('/law-explorer');
    // Category headers from the expanded matrix.
    await expect(page.getByTestId('applicability')).toContainText('Your sector');
    await expect(page.getByTestId('applicability')).toContainText('Data and privacy');

    // Select a function; wait for it to be saved to the server.
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/organizations/current/functions') && r.request().method() === 'PATCH'),
      page.getByTestId('fn-financial_services').click(),
    ]);
    await expect(page.getByTestId('law-card-dora').getByText('Likely applies')).toBeVisible();

    // Reload: the saved selection is restored, so DORA is still highlighted.
    await page.reload();
    await expect(page.getByTestId('law-card-dora').getByText('Likely applies')).toBeVisible();
  });

  test('the drawer explains why a law applies to you', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('fn-hr_recruitment').click();
    await page.getByTestId('law-card-agg').click();
    const why = page.getByTestId('law-drawer').getByTestId('drawer-why');
    await expect(why).toContainText('Why this applies to you');
    await expect(why).toContainText('We use AI in HR or recruitment');
  });

  test('coverage status and bulk-start checklists for applicable laws', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('fn-financial_services').click();
    await expect(page.getByTestId('coverage-count')).toHaveText('0');

    await page.getByTestId('start-applicable').click();
    await expect(page.getByTestId('bulk-msg')).toContainText(/Started \d+ new checklist/);

    // Applicable laws now show as started, and assessments exist.
    await expect(page.getByTestId('law-card-dora').getByText('Checklist started')).toBeVisible();
    await page.goto('/assessments');
    await expect(page.getByTestId('assessment-row').first()).toBeVisible();
  });

  // ---- Phase LE-3 ----

  test('filter by jurisdiction and by has-a-checklist', async ({ page }) => {
    await page.goto('/law-explorer');
    // German-only hides EU laws.
    await page.getByTestId('filter-jurisdiction').selectOption('DE');
    await expect(page.getByTestId('law-card-bdsg')).toBeVisible();
    await expect(page.getByTestId('law-card-eu_ai_act')).toHaveCount(0);

    await page.getByTestId('clear-filters').click();
    // Only laws with a working checklist.
    await page.getByTestId('filter-haschecklist').check();
    await expect(page.getByTestId('law-card-eu_ai_act')).toBeVisible();
    await expect(page.getByTestId('law-card-agg')).toHaveCount(0);
  });

  test('related laws link between drawers', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('law-card-gdpr').click();
    const drawer = page.getByTestId('law-drawer');
    await expect(drawer.getByTestId('drawer-related')).toBeVisible();
    await drawer.getByTestId('related-bdsg').click();
    await expect(page.getByTestId('law-drawer')).toContainText('Federal Data Protection Act');
  });

  test('shows a watch-list of pending laws and a deadline timeline', async ({ page }) => {
    await page.goto('/law-explorer');
    await expect(page.getByTestId('watchlist')).toContainText('Pending and draft laws');
    await expect(page.getByTestId('watch-card-deepfake_law')).toBeVisible();

    const timeline = page.getByTestId('timeline');
    await expect(timeline).toContainText('Key compliance dates');
    await expect(timeline.getByTestId('timeline-item').first()).toBeVisible();
    await expect(timeline).toContainText('high-risk AI rules');
  });

  // ---- Phase LE-4 ----

  test('English/German language toggle switches the UI and law content', async ({ page }) => {
    await page.goto('/law-explorer');
    await expect(page.getByRole('heading', { name: 'Which laws govern AI in Germany?' })).toBeVisible();

    await page.getByTestId('lang-de').click();
    await expect(page.getByRole('heading', { name: 'Welche Gesetze regeln KI in Deutschland?' })).toBeVisible();
    await expect(page.getByTestId('fn-hr_recruitment')).toContainText('Personalauswahl');

    // Law content is German in the drawer.
    await page.getByTestId('law-card-gdpr').click();
    await expect(page.getByTestId('law-drawer')).toContainText('Datenschutz-Grundverordnung');
    await expect(page.getByTestId('law-drawer')).toContainText('Was Sie tun muessen');
  });

  test('guided wizard produces a personalised result', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('wizard-open').click();
    await expect(page.getByTestId('wizard')).toBeVisible();
    await page.getByTestId('wiz-fn-personal_data').click();
    // Step through all categories to the result.
    for (let i = 0; i < 6; i += 1) {
      const next = page.getByTestId('wizard-next');
      if (await next.count()) await next.click();
    }
    await expect(page.getByTestId('wizard-result')).toBeVisible();
    await expect(page.getByTestId('wiz-result-gdpr')).toBeVisible();
  });

  test('natural-language description maps to applicable laws', async ({ page }) => {
    await page.goto('/law-explorer');
    await page.getByTestId('describe-input').fill('We are a bank that uses AI to screen job candidates and score loans.');
    await page.getByTestId('find-laws').click();
    await expect(page.getByTestId('analyze-msg')).toContainText(/Matched \d+ area/);
    await expect(page.getByTestId('law-card-dora').getByText('Likely applies')).toBeVisible();
    await expect(page.getByTestId('law-card-agg').getByText('Likely applies')).toBeVisible();
  });
});
