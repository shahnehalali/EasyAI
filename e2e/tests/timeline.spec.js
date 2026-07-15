const { test, expect } = require('@playwright/test');
const { signUpAndSignIn } = require('../fixtures/helpers');

test.describe('Compliance Timeline', () => {
  test('shows regulatory milestones and can filter + export .ics', async ({ page }) => {
    await signUpAndSignIn(page);
    await page.goto('/timeline');
    await expect(page.getByTestId('timeline')).toBeVisible();

    // Years are collapsed by default — the year header shows, items are hidden.
    await expect(page.getByTestId('tl-year-2026')).toBeVisible();
    await expect(page.getByText('EU AI Act: high-risk AI rules start to apply')).toBeHidden();
    // Expand 2026 to reveal its milestones.
    await page.getByTestId('tl-year-2026').click();
    await expect(page.getByText('EU AI Act: high-risk AI rules start to apply')).toBeVisible();

    // Filtering to "My reviews" (none yet) empties it; "All" restores the years.
    await page.getByTestId('tl-filter-reviews').click();
    await expect(page.getByText('Nothing to show for this filter.')).toBeVisible();
    await page.getByTestId('tl-filter-all').click();
    await expect(page.getByTestId('tl-year-2026')).toBeVisible();

    // The .ics export triggers a download.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('timeline-ics').click(),
    ]);
    expect(download.suggestedFilename()).toBe('compliance-timeline.ics');
  });
});
