const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Documents module', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('upload, list and delete a document', async ({ page }) => {
    await page.goto('/documents');
    await expect(page.getByTestId('documents')).toBeVisible();

    await page.getByTestId('upload-file').setInputFiles({
      name: 'evidence.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('risk assessment evidence'),
    });

    const row = page.getByTestId('document-row').first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('evidence.txt');

    await row.getByTestId('delete-document').click();
    await expect(page.getByTestId('document-row')).toHaveCount(0);
  });
});
