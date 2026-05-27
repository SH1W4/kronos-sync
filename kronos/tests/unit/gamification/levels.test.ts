import { describe, it, expect } from 'vitest'
import {
    calculateLevel,
    xpForNextLevel,
    calculateProgress,
    getLevelTitle,
    LEVEL_TITLES,
    XP_SOURCES
} from '@/data/gamification/levels'

describe('Gamificação — Motor de Progressão de XP', () => {

    describe('calculateLevel()', () => {
        it('deve retornar nível 1 para XP zero', () => {
            expect(calculateLevel(0)).toBe(1)
        })

        it('deve retornar nível 1 para XP negativo', () => {
            expect(calculateLevel(-500)).toBe(1)
        })

        it('deve retornar nível 2 exatamente ao atingir 100 XP', () => {
            expect(calculateLevel(100)).toBe(2)
        })

        it('deve retornar nível 2 para 399 XP (ainda não subiu)', () => {
            expect(calculateLevel(399)).toBe(2)
        })

        it('deve retornar nível 3 exatamente ao atingir 400 XP', () => {
            expect(calculateLevel(400)).toBe(3)
        })

        it('deve retornar nível 4 ao atingir 900 XP', () => {
            expect(calculateLevel(900)).toBe(4)
        })

        it('deve retornar nível 11 para 10.000 XP (Arquiteto de Pele)', () => {
            expect(calculateLevel(10000)).toBe(11)
        })

        it('deve retornar nível 23 para 50.000 XP (Tecelão do Tempo)', () => {
            expect(calculateLevel(50000)).toBe(23)
        })

        it('deve retornar nível 101 para 1.000.000 XP (Titã do Kronos)', () => {
            expect(calculateLevel(1000000)).toBe(101)
        })
    })

    describe('xpForNextLevel()', () => {
        it('deve retornar 100 XP para subir do nível 1 para o 2', () => {
            expect(xpForNextLevel(1)).toBe(100)
        })

        it('deve retornar 400 XP para subir do nível 2 para o 3', () => {
            expect(xpForNextLevel(2)).toBe(400)
        })

        it('deve retornar 900 XP para subir do nível 3 para o 4', () => {
            expect(xpForNextLevel(3)).toBe(900)
        })

        it('deve retornar 10000 XP para subir do nível 10 para o 11', () => {
            expect(xpForNextLevel(10)).toBe(10000)
        })

        it('deve retornar 12100 XP para subir do nível 11 para o 12', () => {
            expect(xpForNextLevel(11)).toBe(12100)
        })
    })

    describe('calculateProgress()', () => {
        it('deve retornar 0% de progresso para 0 XP', () => {
            expect(calculateProgress(0)).toBe(0)
        })

        it('deve retornar 50% de progresso para 50 XP (metade do nível 1)', () => {
            expect(calculateProgress(50)).toBe(50)
        })

        it('deve retornar 99% de progresso para 399 XP (quase nível 3)', () => {
            expect(calculateProgress(399)).toBe(99)
        })

        it('deve retornar 0% ao exatamente subir de nível', () => {
            expect(calculateProgress(400)).toBe(0)
        })

        it('deve retornar no máximo 100%', () => {
            // Nível máximo estimado — progresso não pode ultrapassar 100%
            expect(calculateProgress(0)).toBeLessThanOrEqual(100)
            expect(calculateProgress(99999999)).toBeLessThanOrEqual(100)
        })
    })

    describe('getLevelTitle()', () => {
        it('deve retornar "Iniciado da Tinta" para nível 1', () => {
            const { label } = getLevelTitle(1)
            expect(label).toBe('Iniciado da Tinta')
        })

        it('deve retornar "Andarilho da Agulha" para nível 5', () => {
            const { label } = getLevelTitle(5)
            expect(label).toBe('Andarilho da Agulha')
        })

        it('deve retornar "Arquiteto de Pele" para nível 10', () => {
            const { label } = getLevelTitle(10)
            expect(label).toBe('Arquiteto de Pele')
        })

        it('deve retornar "Tecelão do Tempo" para nível 20', () => {
            const { label } = getLevelTitle(20)
            expect(label).toBe('Tecelão do Tempo')
        })

        it('deve retornar "Escultor de Almas" para nível 50', () => {
            const { label } = getLevelTitle(50)
            expect(label).toBe('Escultor de Almas')
        })

        it('deve retornar "Titã do Kronos" para nível 100', () => {
            const { label } = getLevelTitle(100)
            expect(label).toBe('Titã do Kronos')
        })

        it('deve retornar badge path válido para todos os títulos', () => {
            LEVEL_TITLES.forEach(tier => {
                const { badge } = getLevelTitle(tier.minLevel)
                expect(badge).toMatch(/^\/assets\/gamification\/badges\/badge_\d_\d\.png$/)
            })
        })
    })

    describe('XP_SOURCES — Valores de Ganho de XP', () => {
        it('deve conceder 500 XP por sessão de tatuagem concluída', () => {
            expect(XP_SOURCES.TATTOO_SESSION).toBe(500)
        })

        it('deve conceder 200 XP por liquidação aprovada', () => {
            expect(XP_SOURCES.SETTLEMENT_APPROVED).toBe(200)
        })

        it('deve conceder 50 XP por lead capturado no Kiosk', () => {
            expect(XP_SOURCES.LEAD_GENERATED).toBe(50)
        })
    })
})
