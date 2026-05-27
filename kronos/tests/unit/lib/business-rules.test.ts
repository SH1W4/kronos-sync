import { describe, it, expect } from 'vitest'
import {
    calculateCommission,
    calculateBookingSplit,
    calculateProductPrice,
    applyCoupon,
    BUSINESS_RULES
} from '@/lib/business-rules'

describe('Regras Financeiras do Estúdio KRONØS', () => {

    describe('BUSINESS_RULES — Constantes de Negócio', () => {
        it('deve ter valor mínimo de agendamento definido', () => {
            expect(BUSINESS_RULES.MINIMUM_BOOKING_VALUE).toBeGreaterThan(0)
        })

        it('deve ter taxa padrão de residente como número entre 0 e 1', () => {
            expect(BUSINESS_RULES.RESIDENT_INITIAL_COMMISSION_RATE).toBeGreaterThan(0)
            expect(BUSINESS_RULES.RESIDENT_INITIAL_COMMISSION_RATE).toBeLessThan(1)
        })
    })

    describe('calculateCommission() — Taxa de Comissão por Plano', () => {
        it('artista GUEST deve ter taxa de comissão fixa', () => {
            const rate = calculateCommission('GUEST', 0)
            expect(rate).toBeGreaterThan(0)
            expect(rate).toBeLessThanOrEqual(1)
        })

        it('artista ASSOCIATED deve ter a mesma taxa que GUEST', () => {
            const guestRate = calculateCommission('GUEST', 0)
            const associatedRate = calculateCommission('ASSOCIATED', 0)
            expect(associatedRate).toBe(guestRate)
        })

        it('artista RESIDENT abaixo do teto deve ter taxa inicial', () => {
            const rate = calculateCommission('RESIDENT', 0)
            expect(rate).toBe(BUSINESS_RULES.RESIDENT_INITIAL_COMMISSION_RATE)
        })

        it('artista RESIDENT acima do teto deve ter taxa reduzida', () => {
            const overThreshold = BUSINESS_RULES.RESIDENT_COMMISSION_THRESHOLD + 1
            const rate = calculateCommission('RESIDENT', overThreshold)
            expect(rate).toBe(BUSINESS_RULES.RESIDENT_REDUCED_COMMISSION_RATE)
        })

        it('artista RESIDENT exatamente no teto deve ter taxa reduzida', () => {
            const atThreshold = BUSINESS_RULES.RESIDENT_COMMISSION_THRESHOLD
            const rate = calculateCommission('RESIDENT', atThreshold)
            expect(rate).toBe(BUSINESS_RULES.RESIDENT_REDUCED_COMMISSION_RATE)
        })
    })

    describe('calculateBookingSplit() — Divisão de Valor de Sessão', () => {
        it('deve calcular corretamente sem desconto', () => {
            const result = calculateBookingSplit(1200, 0, 0.30)
            expect(result.finalValue).toBe(1200)
            expect(result.studioShare).toBeCloseTo(360, 2)
            expect(result.artistShare).toBeCloseTo(840, 2)
        })

        it('deve aplicar desconto antes de calcular a divisão', () => {
            const result = calculateBookingSplit(1200, 200, 0.30)
            expect(result.finalValue).toBe(1000)
            expect(result.studioShare).toBeCloseTo(300, 2)
            expect(result.artistShare).toBeCloseTo(700, 2)
        })

        it('soma de artistShare + studioShare deve ser igual a finalValue', () => {
            const result = calculateBookingSplit(850, 50, 0.25)
            expect(result.artistShare + result.studioShare).toBeCloseTo(result.finalValue, 5)
        })

        it('com taxa 0% o artista deve receber o valor total', () => {
            const result = calculateBookingSplit(1000, 0, 0)
            expect(result.artistShare).toBe(1000)
            expect(result.studioShare).toBe(0)
        })

        it('com taxa 100% o estúdio deve receber o valor total', () => {
            const result = calculateBookingSplit(1000, 0, 1)
            expect(result.studioShare).toBe(1000)
            expect(result.artistShare).toBe(0)
        })
    })

    describe('calculateProductPrice() — Cálculo de Preço com Markup', () => {
        it('deve aplicar markup de 20% corretamente', () => {
            expect(calculateProductPrice(100, 0.20)).toBeCloseTo(120, 5)
        })

        it('deve aplicar markup de 0% sem alterar o preço', () => {
            expect(calculateProductPrice(100, 0)).toBe(100)
        })

        it('deve aplicar markup de 50%', () => {
            expect(calculateProductPrice(200, 0.50)).toBeCloseTo(300, 5)
        })
    })

    describe('applyCoupon() — Descontos por Cupom', () => {
        it('deve calcular desconto percentual corretamente', () => {
            const discount = applyCoupon(1000, 'PERCENTAGE', 10)
            expect(discount).toBeCloseTo(100, 5) // 10% de 1000
        })

        it('deve calcular desconto fixo corretamente', () => {
            const discount = applyCoupon(1000, 'FIXED', 150)
            expect(discount).toBe(150)
        })

        it('desconto fixo não deve ultrapassar o valor total', () => {
            const discount = applyCoupon(100, 'FIXED', 500)
            expect(discount).toBe(100) // Limitado ao valor máximo
        })

        it('desconto de 0% não deve alterar nada', () => {
            const discount = applyCoupon(1000, 'PERCENTAGE', 0)
            expect(discount).toBe(0)
        })
    })
})
