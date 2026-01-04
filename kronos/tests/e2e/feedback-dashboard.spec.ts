import { test, expect } from '@playwright/test';

// This test assumes you have a test admin user with credentials defined in env vars
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123';

test.describe('Admin Feedback Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to custom sign-in page
        await page.goto('/auth/signin');

        // Click the DevLogin MASTER button (only available in dev mode)
        const masterButton = page.getByRole('button', { name: /MASTER/i });
        await expect(masterButton).toBeVisible();
        await masterButton.click();

        // Wait for redirect to dashboard/home
        await page.waitForTimeout(2000); // Give it a moment to process session
        await expect(page).not.toHaveURL(/\/auth\/signin/);
    });

    test('should display feedback list and allow status change', async ({ page }) => {
        // Navigate to admin feedback page
        await page.goto('/artist/feedback');
        await expect(page).toHaveURL(/\/artist\/feedback/);

        // Verify at least one feedback card exists
        const cards = page.locator('.hover\\:border-primary\\/50');
        await expect(cards.first()).toBeVisible();
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThan(0);

        // Grab first card and change status
        const firstCard = cards.first();
        const statusButton = firstCard.getByRole('button', { name: /Marcar como Revisado/i });

        if (await statusButton.isVisible()) {
            await statusButton.click();
            // Verify button is gone or changed (depending on logic)
            await expect(statusButton).not.toBeVisible();
        }
    });
});
