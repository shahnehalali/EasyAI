const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

test.describe('Monthly report (Phase 4b)', () => {
  test('the monthly report can be sent and creates a notification', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Monthly AI', answers: { interacts_with_people: true } });

    const res = await page.request.post('/api/reports/monthly/run');
    const body = await res.json();
    expect(body.sent).toBeGreaterThan(0);

    await page.goto('/notifications');
    await expect(page.getByTestId('notification-row').filter({ hasText: 'Monthly compliance summary' })).toBeVisible();
  });
});
