const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

// A 1x1 transparent PNG data URL (valid per the plugin's screenshot regex).
const PNG_1PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test.describe('Screenshot-feedback plugin', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('the feedback trigger lives in the profile card, not floating', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
    // The plugin runs in 'manual' mode now: no floating button. The trigger sits
    // in the account menu next to Settings, and opens the annotation dialog.
    await expect(page.locator('[data-feedback-trigger="true"]')).toHaveCount(0);
    await page.getByTestId('account-menu').click();
    await expect(page.getByTestId('account-feedback')).toBeVisible();
    await page.getByTestId('account-feedback').click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('the backend accepts a valid submission', async ({ page }) => {
    await page.goto('/');
    const res = await page.request.post('/api/feedback', {
      data: {
        title: 'Sidebar overlaps content',
        description: 'On small screens the sidebar covers the page.',
        screenshot: PNG_1PX,
        pageUrl: 'http://localhost:5173/',
        viewport: { width: 1440, height: 900 },
        meta: { app: 'jurisai' },
      },
    });
    expect(res.status()).toBe(202);
    const body = await res.json();
    expect(body.ok).toBe(true);
    // After the email the router also opens a Spirex ticket. It reports the
    // created story (or null when SPIREX_* is not configured / the API errored),
    // so assert the shape rather than an exact body.
    expect(body).toHaveProperty('ticket');
  });

  test('the backend rejects an invalid submission', async ({ page }) => {
    await page.goto('/');
    const res = await page.request.post('/api/feedback', {
      data: { title: 'x', description: 'y' }, // too short + missing screenshot
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('invalid_payload');
  });

  test('the endpoint requires authentication', async ({ browser }) => {
    const fresh = await browser.newContext(); // no auth cookie
    const res = await fresh.request.post('http://localhost:4000/api/feedback', {
      data: { title: 'No auth', description: 'should be blocked', screenshot: PNG_1PX },
    });
    expect(res.status()).toBe(401);
    await fresh.close();
  });
});
