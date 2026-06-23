const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

test.describe('Assessments and checklist responses module', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Limited AI', answers: { interacts_with_people: true } });
  });

  test('lists generated assessments', async ({ page }) => {
    await page.goto('/assessments');
    await expect(page.getByTestId('assessments')).toBeVisible();
    await expect(page.getByTestId('assessment-row').first()).toBeVisible();
  });

  test('the project filter shows only the selected project table', async ({ page }) => {
    // A second AI system => two project groups => the filter bar appears.
    const secondId = await createClassifiedSystem(page, { name: 'Recruiter AI', answers: { recruitment_employment: true } });
    await page.goto('/assessments');

    await expect(page.getByTestId('assessment-project-filters')).toBeVisible();
    await expect(page.getByTestId('assessment-group')).toHaveCount(2);

    // Filter to the second project: only its table remains.
    await page.getByTestId(`assessment-filter-${secondId}`).click();
    await expect(page.getByTestId('assessment-group')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Recruiter AI' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Limited AI' })).toHaveCount(0);

    // Back to all.
    await page.getByTestId('assessment-filter-all').click();
    await expect(page.getByTestId('assessment-group')).toHaveCount(2);
  });

  test('write documentation, mark done, and see progress persist after reload', async ({ page }) => {
    await page.goto('/assessments');
    await page.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();
    await expect(page.getByTestId('assessment-editor')).toBeVisible();

    const firstItem = page.getByTestId('checklist-item').first();
    await firstItem.getByTestId('response-text').fill('We document our intended purpose and context here for the risk assessment.');
    await firstItem.getByTestId('status-done').click();
    await firstItem.getByTestId('save-item').click();
    await expect(firstItem.getByTestId('saved-flag')).toBeVisible();

    // Progress should be above zero now.
    await expect(page.getByTestId('assessment-progress')).not.toHaveText('0%');

    // Reload and confirm the text persisted.
    await page.reload();
    await expect(page.getByTestId('checklist-item').first().getByTestId('response-text'))
      .toHaveValue(/document our intended purpose/);
  });

  test('mark reviewed resets the next review date', async ({ page }) => {
    await page.goto('/assessments');
    await page.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();
    await page.getByTestId('mark-reviewed').click();
    await expect(page.locator('.banner-success')).toContainText(/Next review due/i);
  });
});
