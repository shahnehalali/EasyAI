const path = require('path');
const { test, expect } = require('@playwright/test');
// Reuse the server's otplib to generate valid TOTP codes in the test.
const { authenticator } = require(path.join(__dirname, '..', '..', 'server', 'node_modules', 'otplib'));
const { signUpAndSignIn } = require('../fixtures/helpers');

async function enableMfa(page) {
  const setup = await (await page.request.post('/api/auth/mfa/setup')).json();
  const res = await page.request.post('/api/auth/mfa/enable', { data: { code: authenticator.generate(setup.secret) } });
  return { setup, enableBody: await res.json(), status: res.status() };
}

test.describe('Two-factor authentication (TOTP)', () => {
  test('enable, then login requires a valid code', async ({ page }) => {
    const { email, password } = await signUpAndSignIn(page);

    const { setup, enableBody, status } = await enableMfa(page);
    expect(setup.secret).toBeTruthy();
    expect(setup.qr).toContain('data:image/png;base64');
    expect(status).toBe(200);
    expect(enableBody.enabled).toBe(true);
    expect(enableBody.backupCodes).toHaveLength(10);

    // Log out; logging back in must now demand a second factor.
    await page.request.post('/api/auth/logout');
    const loginBody = await (await page.request.post('/api/auth/login', { data: { email, password } })).json();
    expect(loginBody.mfaRequired).toBe(true);
    expect(loginBody.mfaToken).toBeTruthy();
    expect(loginBody.user).toBeUndefined(); // no session handed out yet

    // Wrong code is rejected.
    const bad = await page.request.post('/api/auth/mfa/verify', { data: { mfaToken: loginBody.mfaToken, code: '000000' } });
    expect(bad.status()).toBe(401);

    // Correct code completes the login.
    const good = await page.request.post('/api/auth/mfa/verify', { data: { mfaToken: loginBody.mfaToken, code: authenticator.generate(setup.secret) } });
    expect(good.status()).toBe(200);
    const me = await (await page.request.get('/api/auth/me')).json();
    expect(me.user.email).toBe(email);
    expect(me.user.mfaEnabled).toBe(true);
  });

  test('a backup code works once and is then consumed', async ({ page }) => {
    const { email, password } = await signUpAndSignIn(page);
    const { enableBody } = await enableMfa(page);
    const backup = enableBody.backupCodes[0];

    await page.request.post('/api/auth/logout');
    let mfaToken = (await (await page.request.post('/api/auth/login', { data: { email, password } })).json()).mfaToken;
    const first = await page.request.post('/api/auth/mfa/verify', { data: { mfaToken, code: backup } });
    expect(first.status()).toBe(200); // works once

    await page.request.post('/api/auth/logout');
    mfaToken = (await (await page.request.post('/api/auth/login', { data: { email, password } })).json()).mfaToken;
    const second = await page.request.post('/api/auth/mfa/verify', { data: { mfaToken, code: backup } });
    expect(second.status()).toBe(401); // already used
  });

  test('the login UI shows the second-factor step', async ({ page }) => {
    const { email, password } = await signUpAndSignIn(page);
    const { setup } = await enableMfa(page);
    await page.request.post('/api/auth/logout');

    await page.goto('/login');
    await page.getByTestId('email').fill(email);
    await page.getByTestId('password').fill(password);
    await page.getByTestId('submit').click();

    await expect(page.getByTestId('mfa-code')).toBeVisible();
    await page.getByTestId('mfa-code').fill(authenticator.generate(setup.secret));
    await page.getByTestId('mfa-submit').click();

    // Signed in: the app shell (top bar avatar) is now present.
    await expect(page.getByTestId('account-menu')).toBeVisible();
  });
});
