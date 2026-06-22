const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem } = require('../fixtures/helpers');

test.describe('GDPR/DPA data-protection profile', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('the API returns tailored obligations and flags a missing DPA', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'Profiled AI', answers: { interacts_with_people: true } });

    const res = await page.request.post(`/api/ai-systems/${id}/data-profile`, {
      data: {
        answers: {
          processes_personal_data: true,
          uses_third_party_processor: true,
          has_dpa: false, // -> DPA gap
          data_location: 'us', // -> international transfer + US DPF check
          lawful_basis: 'contract',
          subject_volume: 'under_1k',
          special_categories: [],
          retention_status: 'enforced',
          has_breach_process: true,
        },
      },
    });
    expect(res.status()).toBe(200);
    const { result } = await res.json();
    expect(result.appliesGdpr).toBe(true);

    const byId = Object.fromEntries(result.obligations.map((o) => [o.id, o]));
    expect(byId.dpa).toBeTruthy();
    expect(byId.dpa.status).toBe('gap'); // no DPA in place
    expect(byId.intl_transfer).toBeTruthy(); // data hosted in the US
    expect(byId.us_dpf).toBeTruthy(); // US provider -> DPF check
    expect(byId.lawful_basis).toBeTruthy(); // always when personal data
    expect(byId.intl_transfer.exemptionNote).toBeTruthy(); // carries a "where it does not apply" note
    expect(byId.dpia).toBeFalsy(); // no DPIA trigger answered
    expect(result.summary.gaps).toBeGreaterThan(0);
  });

  test('no personal data means GDPR mostly does not apply', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'No PII AI', answers: { interacts_with_people: true } });
    const res = await page.request.post(`/api/ai-systems/${id}/data-profile`, {
      data: { answers: { processes_personal_data: false } },
    });
    const { result } = await res.json();
    expect(result.appliesGdpr).toBe(false);
    expect(result.obligations).toHaveLength(0);
  });

  test('the profile page shows obligations with solutions', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'UI Profiled AI', answers: { interacts_with_people: true } });
    await page.goto(`/ai-systems/${id}/profile`);
    await expect(page.getByTestId('data-profile')).toBeVisible();

    // Answer enough to trigger DPA gap + international transfer; the rest default to "No".
    await page.getByTestId('profile-processes_personal_data-yes').click();
    await page.getByTestId('profile-uses_third_party_processor-yes').click();
    await page.getByTestId('profile-has_dpa-no').click();
    await page.getByTestId('profile-data_location-us').click(); // single-select option

    await page.getByTestId('profile-submit').click();

    await expect(page.getByTestId('obligation-dpa')).toBeVisible();
    await expect(page.getByTestId('obligation-dpa')).toContainText('Action needed');
    await expect(page.getByTestId('obligation-intl_transfer')).toBeVisible();
    await expect(page.getByTestId('profile-result')).toContainText('What to do');
    await expect(page.getByTestId('obligation-intl_transfer')).toContainText('When this may not apply');
  });
});
