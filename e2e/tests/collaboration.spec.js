const { test, expect } = require('@playwright/test');
const { signUpAndSignIn, createClassifiedSystem, uniqueEmail } = require('../fixtures/helpers');

test.describe('Collaboration and roles module', () => {
  test('owner invites a teammate who accepts and can work on an assessment', async ({ page, browser }) => {
    // Owner sets up an org with a classified system (so assessments exist).
    await signUpAndSignIn(page, { fullName: 'Olive Owner', organizationName: 'Collab GmbH' });
    await createClassifiedSystem(page, { name: 'Shared AI', answers: { interacts_with_people: true } });

    // Owner sends an invitation via the UI and reads the share link.
    const inviteEmail = uniqueEmail('mate');
    await page.goto('/settings');
    await page.getByTestId('invite-email').fill(inviteEmail);
    await page.getByTestId('invite-role').selectOption('member');
    await page.getByTestId('send-invite').click();
    await expect(page.getByTestId('invite-link')).toBeVisible();
    const inviteUrl = await page.getByTestId('invite-link').locator('a').getAttribute('href');
    expect(inviteUrl).toContain('/accept-invite?token=');
    await expect(page.getByTestId('pending-invite')).toBeVisible();

    // The teammate accepts in a fresh browser context (a separate person).
    const ctx = await browser.newContext();
    const page2 = await ctx.newPage();
    await page2.goto(inviteUrl);
    await expect(page2.getByTestId('accept-invite')).toContainText('Collab GmbH');
    await page2.getByTestId('fullName').fill('Mara Member');
    await page2.getByTestId('password').fill('Member12345!');
    await page2.getByTestId('submit').click();
    await expect(page2.getByTestId('dashboard')).toBeVisible();

    // The teammate can open the shared assessment and add a comment.
    await page2.goto('/assessments');
    await page2.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();
    const firstItem = page2.getByTestId('checklist-item').first();
    await firstItem.getByTestId('comment-input').fill('Looks good from my side.');
    await firstItem.getByTestId('add-comment').click();
    await expect(firstItem.getByTestId('comment-item')).toContainText('Looks good from my side.');

    await ctx.close();

    // Back in the owner context, the new member appears in the members table.
    await page.goto('/settings');
    await expect(page.getByText('Mara Member')).toBeVisible();
  });

  test('owner can change a member role and remove them', async ({ page, browser }) => {
    await signUpAndSignIn(page, { fullName: 'Otto Owner' });
    // Invite + accept a member via API + a fresh context.
    const email = uniqueEmail('role');
    const res = await page.request.post('/api/invitations', { data: { email, role: 'member' } });
    const { inviteUrl } = await res.json();
    const ctx = await browser.newContext();
    const p2 = await ctx.newPage();
    await p2.goto(inviteUrl);
    await p2.getByTestId('fullName').fill('Rae Role');
    await p2.getByTestId('password').fill('Member12345!');
    await p2.getByTestId('submit').click();
    await expect(p2.getByTestId('dashboard')).toBeVisible();
    await ctx.close();

    await page.goto('/settings');
    const memberRow = page.getByTestId('member-row').filter({ hasText: 'Rae Role' });
    await expect(memberRow).toBeVisible();

    // Promote to admin, then remove.
    await memberRow.getByTestId('member-role').selectOption('admin');
    await expect(memberRow.getByTestId('member-role')).toHaveValue('admin');

    await memberRow.getByTestId('remove-member').click();
    await expect(page.getByTestId('member-row').filter({ hasText: 'Rae Role' })).toHaveCount(0);
  });

  test('assignee, comment and activity appear on a checklist item', async ({ page }) => {
    await signUpAndSignIn(page, { fullName: 'Ada Assignee' });
    await createClassifiedSystem(page, { name: 'Assigned AI', answers: { interacts_with_people: true } });

    await page.goto('/assessments');
    await page.getByTestId('assessment-row').first().getByRole('link', { name: 'Open' }).click();
    const item = page.getByTestId('checklist-item').first();

    // Assign to self.
    await item.getByTestId('assignee-select').selectOption({ label: 'Ada Assignee' });
    await expect(item.getByTestId('assignee-select')).toHaveValue(/.+/);

    // Comment.
    await item.getByTestId('comment-input').fill('Starting on this item.');
    await item.getByTestId('add-comment').click();
    await expect(item.getByTestId('comment-item')).toContainText('Starting on this item');

    // Make a change so activity is recorded, then check the activity panel.
    await item.getByTestId('status-in_progress').click();
    await expect(page.getByTestId('activity-panel').getByTestId('activity-item').first()).toBeVisible();

    // Comment persists across reload.
    await page.reload();
    await expect(page.getByTestId('checklist-item').first().getByTestId('comment-item')).toContainText('Starting on this item');
  });

  test('a member cannot manage members', async ({ page, browser }) => {
    await signUpAndSignIn(page, { fullName: 'Manager One' });
    const email = uniqueEmail('viewer');
    const res = await page.request.post('/api/invitations', { data: { email, role: 'member' } });
    const { inviteUrl } = await res.json();

    const ctx = await browser.newContext();
    const p2 = await ctx.newPage();
    await p2.goto(inviteUrl);
    await p2.getByTestId('fullName').fill('Vince Viewer');
    await p2.getByTestId('password').fill('Member12345!');
    await p2.getByTestId('submit').click();
    await expect(p2.getByTestId('dashboard')).toBeVisible();

    // Member opens settings: no invite form, no role selects.
    await p2.goto('/settings');
    await expect(p2.getByTestId('settings')).toBeVisible();
    await expect(p2.getByTestId('send-invite')).toHaveCount(0);
    await expect(p2.getByTestId('member-role')).toHaveCount(0);
    await ctx.close();
  });
});
