const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, signInAsAdmin } = require('../fixtures/helpers');

test.describe('Community moderation queue (platform admin)', () => {
  test('a reported reply appears in the admin queue and can be removed', async ({ page }) => {
    // A normal member posts a thread + reply, then reports the reply.
    await signUpAndSignIn(page, { organizationName: 'Reporter GmbH' });
    const thRes = await page.request.post('/api/community/threads', {
      data: { title: 'A thread for the moderation test', body: 'Starter body.', visibility: 'global' },
    });
    const { thread } = await thRes.json();
    const postRes = await page.request.post(`/api/community/threads/${thread.id}/posts`, {
      data: { body: 'This reply is spammy and should be reported.' },
    });
    const { post } = await postRes.json();
    await page.request.post('/api/community/report', {
      data: { targetType: 'post', targetId: post.id, reason: 'Spam content' },
    });

    // Switch to the seeded platform admin and open the admin page.
    await signInAsAdmin(page);
    await page.goto('/admin');
    await expect(page.getByTestId('moderation-queue')).toBeVisible();

    const row = page.getByTestId('report-row').filter({ hasText: 'spammy' });
    await expect(row).toBeVisible();
    await expect(row.getByTestId('report-count')).toContainText('1');

    // Remove the content; the row should leave the queue.
    await row.getByTestId('report-remove').click();
    await expect(page.getByTestId('report-row').filter({ hasText: 'spammy' })).toHaveCount(0);
  });

  test('a non-admin cannot reach the moderation queue', async ({ page }) => {
    await signUpAndSignIn(page);
    await page.goto('/admin');
    // The admin page renders an "admins only" empty state for non-platform-admins.
    await expect(page.getByTestId('moderation-queue')).toHaveCount(0);
  });
});
