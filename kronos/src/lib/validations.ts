import { z } from 'zod'

/**
 * Valida CPF brasileiro
 */
function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '')

    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit >= 10) digit = 0
    if (digit !== parseInt(cpf.charAt(10))) return false

    return true
}

// ============================================
// VALIDAÇÕES DE DADOS PESSOAIS
// ============================================

export const nameSchema = z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')

export const emailSchema = z.string()
    .email('E-mail inválido')
    .toLowerCase()

export const phoneSchema = z.string()
    .regex(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, 'Formato esperado: (11) 99999-9999')

export const cpfSchema = z.string()
    .regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, 'Formato esperado: 000.000.000-00')
    .refine((cpf) => validateCPF(cpf), 'CPF inválido')

export const birthDateSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .refine((date) => {
        const d = new Date(date)
        const now = new Date()
        const age = now.getFullYear() - d.getFullYear()
        return age >= 18 && age <= 120
    }, 'Idade deve estar entre 18 e 120 anos')

// ============================================
// VALIDAÇÕES FINANCEIRAS
// ============================================

export const pixKeySchema = z.string()
    .min(11, 'Chave PIX muito curta')
    .refine((key) => {
        // CPF: 11 dígitos
        if (/^[0-9]{11}$/.test(key)) return true
        // CNPJ: 14 dígitos
        if (/^[0-9]{14}$/.test(key)) return true
        // E-mail
        if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(key)) return true
        // Telefone: +5511999999999
        if (/^\+[0-9]{13}$/.test(key)) return true
        // Chave aleatória: UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return true
        return false
    }, 'Chave PIX inválida')

export const moneySchema = z.number()
    .min(0, 'Valor não pode ser negativo')
    .max(100000, 'Valor máximo: R$ 100.000')

export const commissionRateSchema = z.number()
    .min(0, 'Comissão mínima: 0%')
    .max(100, 'Comissão máxima: 100%')

// ============================================
// VALIDAÇÕES DE TEMA/BRANDING
// ============================================

export const colorSchema = z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato de cor inválido (use #RRGGBB)')

export const workspaceNameSchema = z.string()
    .min(3, 'Nome do workspace muito curto')
    .max(50, 'Nome do workspace muito longo')
    .regex(/^[a-zA-Z0-9À-ÿ\s\-_]+$/, 'Nome contém caracteres inválidos')

// ============================================
// SCHEMAS COMPOSTOS
// ============================================

export const anamnesisSchema = z.object({
    name: nameSchema,
    phone: phoneSchema,
    birthDate: birthDateSchema,
    allergies: z.string().max(500, 'Texto muito longo').optional(),
    medications: z.string().max(500, 'Texto muito longo').optional(),
    healthConditions: z.string().max(500, 'Texto muito longo').optional(),
    signature: z.string().min(100, 'Assinatura obrigatória'),
    consentGiven: z.boolean().refine((val) => val === true, 'Consentimento obrigatório')
})

export const bookingSchema = z.object({
    clientId: z.string().uuid('ID de cliente inválido'),
    artistId: z.string().uuid('ID de artista inválido'),
    slotId: z.string().uuid('ID de slot inválido'),
    value: moneySchema.min(50, 'Valor mínimo: R$ 50'),
    duration: z.number()
        .min(30, 'Duração mínima: 30 minutos')
        .max(480, 'Duração máxima: 8 horas'),
    description: z.string().max(1000, 'Descrição muito longa').optional()
})

export const kioskEntrySchema = z.object({
    name: nameSchema,
    email: emailSchema.optional(),
    phone: phoneSchema,
    type: z.enum(['CLIENT', 'COMPANION'], {
        errorMap: () => ({ message: 'Tipo inválido' })
    }),
    tattooDesire: z.string().max(500, 'Texto muito longo').optional(),
    barriers: z.array(z.string()).optional(),
    marketingOptIn: z.boolean()
})

export const inviteSchema = z.object({
    role: z.enum(['ARTIST', 'ADMIN'], {
        errorMap: () => ({ message: 'Cargo inválido' })
    }),
    targetPlan: z.enum(['GUEST', 'RESIDENT', 'ASSOCIATED'], {
        errorMap: () => ({ message: 'Plano inválido' })
    }).optional(),
    customCode: z.string()
        .min(6, 'Código deve ter pelo menos 6 caracteres')
        .max(12, 'Código deve ter no máximo 12 caracteres')
        .regex(/^[A-Z0-9]+$/, 'Código deve conter apenas letras maiúsculas e números')
        .optional()
})

export const productSchema = z.object({
    title: z.string().min(3, 'Título muito curto').max(100, 'Título muito longo'),
    description: z.string().max(1000, 'Descrição muito longa'),
    basePrice: moneySchema.min(10, 'Preço mínimo: R$ 10'),
    finalPrice: moneySchema.min(10, 'Preço mínimo: R$ 10'),
    type: z.enum(['PHYSICAL', 'DIGITAL'], {
        errorMap: () => ({ message: 'Tipo de produto inválido' })
    }),
    imageUrl: z.string().url('URL de imagem inválida').optional()
})

export const workspaceBrandingSchema = z.object({
    name: workspaceNameSchema.optional(),
    primaryColor: colorSchema.optional()
})

export const userThemeSchema = z.object({
    customColor: colorSchema
})

export const artistSettingsSchema = z.object({
    name: nameSchema.optional(),
    commissionRate: commissionRateSchema.optional(),
    instagram: z.string()
        .regex(/^@?[a-zA-Z0-9._]+$/, 'Username do Instagram inválido')
        .optional()
})

// ============================================
// HELPER TYPES
// ============================================

export type AnamnesisInput = z.infer<typeof anamnesisSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type KioskEntryInput = z.infer<typeof kioskEntrySchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type ProductInput = z.infer<typeof productSchema>
export type WorkspaceBrandingInput = z.infer<typeof workspaceBrandingSchema>
export type UserThemeInput = z.infer<typeof userThemeSchema>
export type ArtistSettingsInput = z.infer<typeof artistSettingsSchema>
