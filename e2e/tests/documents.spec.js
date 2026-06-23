const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

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

  test('a document can be attached to a checklist item and then removed', async ({ page }) => {
    await createClassifiedSystem(page, { name: 'Doc AI', answers: { interacts_with_people: true } });
    await page.goto('/assessments');
    await page.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();

    const item = page.getByTestId('checklist-item').first();
    await item.getByTestId('attach-file').setInputFiles({
      name: 'proof.txt', mimeType: 'text/plain', buffer: Buffer.from('evidence'),
    });
    await expect(item.getByTestId('attached-document')).toContainText('proof.txt');

    // Removing it (accept the confirm dialog) clears it from the item.
    page.once('dialog', (d) => d.accept());
    await item.getByTestId('remove-document').click();
    await expect(item.getByTestId('attached-document')).toHaveCount(0);
  });
});
