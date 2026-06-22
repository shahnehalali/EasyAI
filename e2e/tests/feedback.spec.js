const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

// A 1x1 transparent PNG data URL (valid per the plugin's screenshot regex).
const PNG_1PX =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test.describe('Screenshot-feedback plugin', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('the floating feedback trigger button renders in the app', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.locator('[data-feedback-trigger="true"]')).toBeVisible();
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
        meta: { app: 'easy-ai' },
      },
    });
    expect(res.status()).toBe(202);
    expect(await res.json()).toEqual({ ok: true });
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
