const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Help assistant module', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('the help launcher opens a chat panel with a greeting', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('help-launcher')).toBeVisible();
    await page.getByTestId('help-launcher').click();
    await expect(page.getByTestId('help-panel')).toBeVisible();
    await expect(page.getByTestId('help-panel')).toContainText('help assistant');
  });

  test('asking about classification shows its explanation', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('help-launcher').click();
    await page.getByTestId('help-input').fill('how does risk classification work');
    await page.getByTestId('help-send').click();
    await expect(page.getByTestId('help-panel')).toContainText('Prohibited, High, Limited, or Minimal');
  });

  test('typing a question returns a matching answer', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('help-launcher').click();
    await page.getByTestId('help-input').fill('how do I export a report as pdf');
    await page.getByTestId('help-send').click();
    await expect(page.getByTestId('help-panel')).toContainText('Export report (PDF)');
  });

  test('an unrecognised question falls back to topic guidance', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('help-launcher').click();
    await page.getByTestId('help-input').fill('zzzzz qqqqq nonsense');
    await page.getByTestId('help-send').click();
    await expect(page.getByTestId('help-panel')).toContainText('Try one of the topics below');
  });

  test('the assistant is available on other pages too', async ({ page }) => {
    await page.goto('/frameworks');
    await expect(page.getByTestId('help-launcher')).toBeVisible();
  });
});
