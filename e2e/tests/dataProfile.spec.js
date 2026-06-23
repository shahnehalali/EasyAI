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

  test('a downloadable PDF is produced once a profile is saved', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'PDF AI', answers: { interacts_with_people: true } });

    // Before any profile is saved, the PDF endpoint refuses.
    const before = await page.request.get(`/api/ai-systems/${id}/data-profile/pdf`);
    expect(before.status()).toBe(400);

    await page.request.post(`/api/ai-systems/${id}/data-profile`, {
      data: { answers: { processes_personal_data: true, uses_third_party_processor: true, has_dpa: false, data_location: 'us' } },
    });

    const pdf = await page.request.get(`/api/ai-systems/${id}/data-profile/pdf`);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    const body = await pdf.body();
    expect(body.length).toBeGreaterThan(800); // a real PDF, not an empty stream
  });

  test('the profiler content is localised to German', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'DE AI', answers: { interacts_with_people: true } });

    // API returns German questions when lang=de.
    const q = await page.request.get(`/api/ai-systems/${id}/data-profile?lang=de`);
    const qjson = await q.json();
    const personal = qjson.questions.find((x) => x.code === 'processes_personal_data');
    expect(personal.prompt).toContain('personenbezogene Daten');

    // German obligations.
    const ev = await page.request.post(`/api/ai-systems/${id}/data-profile?lang=de`, {
      data: { answers: { processes_personal_data: true, uses_third_party_processor: true, has_dpa: false } },
    });
    const { result } = await ev.json();
    const dpa = result.obligations.find((o) => o.id === 'dpa');
    expect(dpa.title).toContain('Auftragsverarbeitungsvertrag');

    // The page itself switches: open in German and check chrome + a question are German.
    await page.goto('/');
    await page.getByTestId('lang-de').click();
    await page.goto(`/ai-systems/${id}/profile`);
    await expect(page.getByTestId('data-profile')).toContainText('Datenschutzprofil');
    // The questionnaire shows by default (even with a saved profile).
    await expect(page.getByTestId('data-profile')).toContainText('personenbezogene Daten');
    await expect(page.getByTestId('profile-submit')).toContainText('Anzeigen, was gilt');

    await page.evaluate(() => localStorage.removeItem('aic_lang')).catch(() => {});
  });

  test('a profile can be turned into a working assessment', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'Assessable AI', answers: { interacts_with_people: true } });
    await page.request.post(`/api/ai-systems/${id}/data-profile`, {
      data: { answers: { processes_personal_data: true, uses_third_party_processor: true, has_dpa: false, data_location: 'us', automated_decisions: true } },
    });

    const res = await page.request.post(`/api/ai-systems/${id}/data-profile/assessment`);
    expect(res.status()).toBe(201);
    const { assessmentId } = await res.json();
    expect(assessmentId).toBeTruthy();

    // The new assessment opens and contains the GDPR/DPA obligations as checklist items.
    await page.goto(`/assessments/${assessmentId}`);
    await expect(page.getByTestId('assessment-editor')).toBeVisible();
    await expect(page.getByText('GDPR & DPA action plan')).toBeVisible();
    await expect(page.getByText(/Data Processing Agreement/i).first()).toBeVisible();
  });

  test('the profile page shows the AI system name, obligations and a download button', async ({ page }) => {
    const id = await createClassifiedSystem(page, { name: 'UI Profiled AI', answers: { interacts_with_people: true } });
    await page.goto(`/ai-systems/${id}/profile`);
    await expect(page.getByTestId('data-profile')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'UI Profiled AI' })).toBeVisible();

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
    await expect(page.getByTestId('profile-pdf')).toBeVisible(); // download button appears with results
    await expect(page.getByTestId('profile-create-assessment')).toBeVisible();

    // The quiz collapses once it is done; the toggle re-opens it.
    await expect(page.getByTestId('profile-section-basics')).toHaveCount(0);
    await page.getByTestId('quiz-toggle').click();
    await expect(page.getByTestId('profile-section-basics')).toBeVisible();
  });
});
