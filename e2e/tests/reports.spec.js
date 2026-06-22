const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

test.describe('Reporting and export module (Phase 4)', () => {
  test('export an assessment as a PDF', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Report AI', answers: { interacts_with_people: true } });
    await page.goto('/assessments');
    await page.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();
    await expect(page.getByTestId('assessment-editor')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-assessment-pdf').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('export the organisation report as PDF and CSV from the dashboard', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Org AI', answers: { interacts_with_people: true } });
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();

    const [pdf] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-org-pdf').click(),
    ]);
    expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);

    const [csv] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-org-csv').click(),
    ]);
    expect(csv.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('audit log lists actions and exports CSV', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Audited AI', answers: { interacts_with_people: true } });

    await page.goto('/audit');
    await expect(page.getByTestId('audit-page')).toBeVisible();
    await expect(page.getByTestId('audit-row').first()).toBeVisible();

    const [csv] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-audit-csv').click(),
    ]);
    expect(csv.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('export applicable laws from the Law Explorer', async ({ page }) => {
    await signUpAndSignIn(page);
    await page.goto('/law-explorer');
    await page.getByTestId('fn-financial_services').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-laws').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/applicable-laws\.csv$/);
  });
});
