import { describe, it, expect } from 'vitest';
import { bookingSchema } from '@/lib/validations';

describe('validations', () => {
    describe('bookingSchema', () => {
        it('should validate a correct booking', () => {
            const validData = {
                artistId: 'artist-1234567890',
                clientId: 'client-1234567890',
                scheduledFor: new Date().toISOString(),
                duration: 240,
                estimatedPrice: 1200,
                type: 'TATTOO'
            };

            const result = bookingSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if clientId is too short', () => {
            const invalidData = {
                artistId: 'artist-1234567890',
                clientId: 'too-short',
                scheduledFor: new Date().toISOString(),
                duration: 240,
                estimatedPrice: 1200,
                type: 'TATTOO'
            };

            const result = bookingSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if estimatedPrice is negative', () => {
            const invalidData = {
                artistId: 'artist-1234567890',
                clientId: 'client-1234567890',
                scheduledFor: new Date().toISOString(),
                duration: 240,
                estimatedPrice: -100,
                type: 'TATTOO'
            };

            const result = bookingSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
