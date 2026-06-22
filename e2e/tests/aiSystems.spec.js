const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('AI Systems and classification module', () => {
  test.beforeEach(async ({ page }) => { await signUpAndSignIn(page); });

  test('register a system then classify it as high risk', async ({ page }) => {
    await page.goto('/ai-systems');
    await page.getByTestId('new-ai-system').click();
    await page.getByTestId('name').fill('Resume Screener');
    await page.getByTestId('purpose').fill('Screens job applicants');
    await page.getByTestId('submit').click();

    // On the classify page, answer the questionnaire.
    await expect(page.getByTestId('classify')).toBeVisible();
    // Critical area (hiring) => high risk.
    await page.getByTestId('q-critical_area-yes').click();
    await page.getByTestId('q-social_scoring-no').click();
    await page.getByTestId('classify-submit').click();

    await expect(page.getByTestId('classify-result')).toBeVisible();
    await expect(page.getByTestId('result-risk')).toContainText('High risk');
    // High-risk plus baseline templates create more than one assessment.
    const created = await page.getByTestId('result-assessments').textContent();
    expect(Number(created)).toBeGreaterThan(0);
  });

  test('a generative chatbot is classified as limited risk', async ({ page }) => {
    await page.goto('/ai-systems/new');
    await page.getByTestId('name').fill('Support Chatbot');
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('classify')).toBeVisible();
    await page.getByTestId('q-interacts_with_people-yes').click();
    await page.getByTestId('classify-submit').click();
    await expect(page.getByTestId('result-risk')).toContainText('Limited risk');
  });

  test('a social-scoring system is flagged prohibited', async ({ page }) => {
    await page.goto('/ai-systems/new');
    await page.getByTestId('name').fill('Citizen Scorer');
    await page.getByTestId('submit').click();
    await page.getByTestId('q-social_scoring-yes').click();
    await page.getByTestId('classify-submit').click();
    await expect(page.getByTestId('result-risk')).toContainText('Prohibited');
  });

  test('a recruitment AI is classified as high risk', async ({ page }) => {
    await page.goto('/ai-systems/new');
    await page.getByTestId('name').fill('Hiring Ranker');
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('classify')).toBeVisible();
    await page.getByTestId('q-recruitment_employment-yes').click();
    await page.getByTestId('classify-submit').click();
    await expect(page.getByTestId('result-risk')).toContainText('High risk');
  });

  test('emotion recognition at work is flagged prohibited', async ({ page }) => {
    await page.goto('/ai-systems/new');
    await page.getByTestId('name').fill('Mood Monitor');
    await page.getByTestId('submit').click();
    await page.getByTestId('q-emotion_workplace-yes').click();
    await page.getByTestId('classify-submit').click();
    await expect(page.getByTestId('result-risk')).toContainText('Prohibited');
  });

  test('a system with no risky uses is classified as minimal risk', async ({ page }) => {
    await page.goto('/ai-systems/new');
    await page.getByTestId('name').fill('Internal Note Summariser');
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('classify')).toBeVisible();
    await page.getByTestId('classify-submit').click();
    await expect(page.getByTestId('result-risk')).toContainText('Minimal risk');
  });

  test('an AI system can be deleted', async ({ page }) => {
    const { createClassifiedSystem } = require('../fixtures/helpers');
    const id = await createClassifiedSystem(page, { name: 'Deletable AI', answers: { interacts_with_people: true } });
    page.on('dialog', (d) => d.accept());

    await page.goto(`/ai-systems/${id}`);
    await expect(page.getByTestId('ai-system-detail')).toBeVisible();
    await page.getByTestId('delete-ai-system').click();

    await expect(page).toHaveURL(/\/ai-systems$/);
    await expect(page.getByTestId('ai-systems')).toBeVisible();
    await expect(page.getByText('Deletable AI')).toHaveCount(0);
  });
});
