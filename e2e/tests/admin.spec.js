const { test, expect } = require('@playwright/test');
const { signInAsAdmin } = require('../fixtures/helpers');

test.describe('Admin module - expandability proof', () => {
  test('a platform admin adds a brand new framework that appears everywhere with no code change', async ({ page }) => {
    await signInAsAdmin(page);

    // Unique key so the test is repeatable.
    const suffix = String(Date.now()).slice(-6);
    const key = `bafin_ki_${suffix}`;
    const name = `BaFin AI Supervision ${suffix}`;

    await page.goto('/admin');
    await expect(page.getByTestId('admin')).toBeVisible();

    await page.getByTestId('fw-key').fill(key);
    await page.getByTestId('fw-name').fill(name);
    await page.getByTestId('fw-shortName').fill('BaFin AI');
    await page.getByTestId('fw-tier').selectOption('3');
    await page.getByTestId('fw-desc').fill('Rules for AI used by banks and financial firms, supervised by BaFin.');
    await page.getByTestId('create-framework').click();

    await expect(page.locator('.banner-success')).toBeVisible();

    // It now appears in the Law Explorer...
    await page.goto('/law-explorer');
    await expect(page.getByTestId(`law-card-${key}`)).toBeVisible();

    // ...and in the Frameworks list...
    await page.goto('/frameworks');
    await expect(page.getByTestId(`framework-row-${key}`)).toBeVisible();

    // ...and its detail page renders the starter checklist, end to end.
    await page.goto(`/frameworks/${key}`);
    await expect(page.getByTestId('framework-detail')).toContainText(name);
    await expect(page.getByRole('heading', { name: 'Checklists' })).toBeVisible();
  });
});
