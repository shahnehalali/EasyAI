const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

const SECTOR_FRAMEWORKS = [
  ['dora', 'DORA Operational Resilience'],
  ['nis2', 'NIS2 Cybersecurity Measures'],
  ['eu_data_act', 'Data Act Compliance'],
  ['cra', 'Cyber Resilience Act Compliance'],
  ['bafin_ki', 'BaFin AI Governance'],
];

test.describe('Content depth module (Phase 3)', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('the five sector frameworks each have a working checklist with citation and review date', async ({ page }) => {
    for (const [key, templateName] of SECTOR_FRAMEWORKS) {
      await page.goto(`/frameworks/${key}`);
      await expect(page.getByTestId('framework-detail')).toBeVisible();
      // Source citation + last-reviewed badge.
      await expect(page.getByTestId('framework-source')).toContainText('Source');
      await expect(page.getByTestId('framework-source')).toContainText('Content reviewed');
      // Its checklist and a start control.
      await expect(page.getByRole('heading', { name: 'Checklists' })).toBeVisible();
      await expect(page.getByText(templateName)).toBeVisible();
      await expect(page.getByTestId('start-checklist').first()).toBeVisible();
    }
  });

  test('starting a sector checklist creates an organisation assessment', async ({ page }) => {
    await page.goto('/frameworks/dora');
    await page.getByTestId('start-checklist').first().click();
    await expect(page.getByTestId('assessment-editor')).toBeVisible();

    // It appears in the assessments list.
    await page.goto('/assessments');
    await expect(page.getByTestId('assessment-row').filter({ hasText: 'DORA Operational Resilience' })).toBeVisible();
  });

  test('starting the same checklist twice does not create a duplicate', async ({ page }) => {
    await page.goto('/frameworks/nis2');
    await page.getByTestId('start-checklist').first().click();
    await expect(page.getByTestId('assessment-editor')).toBeVisible();

    await page.goto('/frameworks/nis2');
    await page.getByTestId('start-checklist').first().click();
    await expect(page.getByTestId('assessment-editor')).toBeVisible();

    await page.goto('/assessments');
    await expect(page.getByTestId('assessment-row').filter({ hasText: 'NIS2 Cybersecurity Measures' })).toHaveCount(1);
  });

  test('classifying an AI system does NOT auto-attach sector frameworks', async ({ page }) => {
    await createClassifiedSystem(page, { name: 'Limited AI', answers: { interacts_with_people: true } });
    await page.goto('/assessments');
    // Risk-based checklists are created...
    await expect(page.getByTestId('assessment-row').first()).toBeVisible();
    // ...but sector frameworks are not auto-attached.
    await expect(page.getByText('DORA Operational Resilience')).toHaveCount(0);
    await expect(page.getByText('NIS2 Cybersecurity Measures')).toHaveCount(0);
  });
});
