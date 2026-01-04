import { test, expect } from '@playwright/test';

test.describe('Booking Flow E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Master (ADMIN)
        await page.goto('/auth/signin');
        const masterButton = page.getByRole('button', { name: /MASTER/i });
        await expect(masterButton).toBeVisible();
        await masterButton.click();
        await page.waitForTimeout(2000);
        await expect(page).not.toHaveURL(/\/auth\/signin/);
    });

    test('should view existing bookings in agenda', async ({ page }) => {
        // Go to Artist Agenda
        await page.goto('/artist/agenda');

        // Check if agenda grid is visible
        const agendaGrid = page.locator('.rbc-calendar'); // Standard Big Calendar class
        await expect(agendaGrid).toBeVisible();

        // Check for "Ricardo Mautone" (scenario data from master login)
        const booking = page.getByText(/Ricardo Mautone/i);
        await expect(booking).toBeVisible();
    });

    test('should trigger new booking modal', async ({ page }) => {
        await page.goto('/artist/agenda');

        // Click a slot (or the "New Booking" button if it exists)
        // Assuming there's a button or we can click the rbc-time-slot
        const newBookingBtn = page.getByRole('button', { name: /novo agendamento|agendar/i });
        if (await newBookingBtn.isVisible()) {
            await newBookingBtn.click();
        } else {
            // Fallback: click a specific time slot
            await page.locator('.rbc-time-slot').first().click();
        }

        // Verify modal is open
        await expect(page.getByText(/novo agendamento/i)).toBeVisible();

        // Fill basic data (client name)
        const clientInput = page.getByPlaceholder(/nome do cliente/i);
        await clientInput.fill('Test Playwright Client');

        // Select artist (if multiple)
        // ... logic for artist selection if needed ...

        // Save
        const saveButton = page.getByRole('button', { name: /confirmar|salvar/i });
        await saveButton.click();

        // Verify toast or closing
        await expect(page.getByText(/sucesso|agendado/i)).toBeVisible();
    });
});
