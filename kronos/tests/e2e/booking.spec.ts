import { test, expect } from '@playwright/test';

test.describe('Booking Flow E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Master (ADMIN)
        await page.goto('/auth/signin');
        const masterButton = page.getByRole('button', { name: /MASTER/i });
        await expect(masterButton).toBeVisible();
        await masterButton.click();

        // Wait for redirect to dashboard/home with a generous timeout for dev compilation
        await expect(page).toHaveURL(/\/artist\/dashboard/, { timeout: 30000 });
    });

    test('should view existing bookings in agenda', async ({ page }) => {
        // Go to Artist Agenda
        await page.goto('/artist/agenda');

        // Check if agenda grid is visible (Custom CalendarView container)
        const agendaGrid = page.locator('.min-w-\\[800px\\]');
        await expect(agendaGrid).toBeVisible();

        // Check for "Ricardo Mautone" (scenario data from master login)
        const booking = page.getByText(/Ricardo Mautone/i);
        await expect(booking.first()).toBeVisible();
    });

    test('should trigger new booking modal', async ({ page }) => {
        await page.goto('/artist/agenda');

        const newBookingBtn = page.getByRole('button', { name: /novo/i });
        await expect(newBookingBtn).toBeVisible();
        await newBookingBtn.click();

        // Verify modal is open
        await expect(page.getByText(/novo agendamento/i)).toBeVisible();

        // Fill basic data (client search)
        const clientInput = page.getByPlaceholder(/buscar cliente/i);
        await expect(clientInput).toBeVisible();
        await clientInput.fill('Ricardo');
        await page.waitForTimeout(1000); // Wait for debounce and API

        // Verify some results appear
        const result = page.getByRole('button').filter({ hasText: /Ricardo Mautone/i });
        await expect(result.first()).toBeVisible();
        await result.first().click();

        // Verify client selected
        await expect(page.getByText(/Ricardo Mautone/i).nth(1)).toBeVisible();

        // Save
        const saveButton = page.getByRole('button', { name: /criar agendamento/i });
        await saveButton.click();

        // Verify toast or closing
        await expect(page.getByText(/agendamento realizado/i).first()).toBeVisible();
    });
});
