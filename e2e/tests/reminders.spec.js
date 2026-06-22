const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

test.describe('Reminders and notifications module', () => {
  test('a due reminder produces a notification and flags the assessment', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Reminder AI', answers: { interacts_with_people: true } });

    // Force all reminders due by running the job with a far-future clock.
    const future = new Date('2099-01-01T00:00:00.000Z').toISOString();
    const res = await page.request.post('/api/reminders/run-due', { data: { now: future } });
    const body = await res.json();
    expect(body.fired).toBeGreaterThan(0);

    // The in-app notification should now be visible.
    await page.goto('/notifications');
    await expect(page.getByTestId('notification-row').first()).toContainText(/annual review/i);

    // The assessment should be flagged needs review.
    await page.goto('/assessments');
    await expect(page.getByText('Needs review').first()).toBeVisible();
  });

  test('unread count and mark-all-read work', async ({ page }) => {
    await signUpAndSignIn(page);
    await createClassifiedSystem(page, { name: 'Bell AI', answers: { interacts_with_people: true } });
    const future = new Date('2099-01-01T00:00:00.000Z').toISOString();
    await page.request.post('/api/reminders/run-due', { data: { now: future } });

    await page.goto('/');
    await expect(page.getByTestId('notif-count')).toBeVisible();
    await page.goto('/notifications');
    await page.getByRole('button', { name: 'Mark all read' }).click();
    await expect(page.getByTestId('notif-count')).toHaveCount(0);
  });
});
