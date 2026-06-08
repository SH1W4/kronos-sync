// src/lib/whatsapp.ts

interface SendMessageOptions {
    phone: string
    text: string
}

/**
 * Sends a WhatsApp message via the Evolution API in the background (fire-and-forget).
 * Resilient against Evolution API network failures, timeouts, and missing configurations.
 */
export async function sendWhatsAppMessage({ phone, text }: SendMessageOptions) {
    const apiUrl = process.env.EVOLUTION_API_URL
    const apiKey = process.env.EVOLUTION_API_TOKEN
    const instance = process.env.EVOLUTION_API_INSTANCE || 'kronos'

    if (!apiUrl || !apiKey) {
        console.warn('⚠️ Evolution API variables (EVOLUTION_API_URL or EVOLUTION_API_TOKEN) are not configured. Skipping WhatsApp notification.')
        return { success: false, error: 'Not configured' }
    }

    // Formatar número de telefone: remover caracteres não numéricos
    let formattedPhone = phone.replace(/\D/g, '')

    // Se o número não tem DDI (código do país), assume Brasil (55)
    if (formattedPhone.length > 0 && !formattedPhone.startsWith('55')) {
        // Correção de nono dígito opcional para números brasileiros de 10 dígitos (DDD + 8 dígitos)
        if (formattedPhone.length === 10) {
            formattedPhone = '55' + formattedPhone.substring(0, 2) + '9' + formattedPhone.substring(2)
        } else {
            formattedPhone = '55' + formattedPhone
        }
    }

    try {
        const url = `${apiUrl}/message/sendText/${instance}`
        
        console.log(`[WhatsApp API] Dispatching message to ${formattedPhone} via instance "${instance}"...`)

        // Despacha a requisição sem travar a thread (fire-and-forget)
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                number: formattedPhone,
                text: text,
                delay: 1200,
                linkPreview: true
            })
        })
        .then(async (res) => {
            if (!res.ok) {
                const errText = await res.text()
                console.error(`[WhatsApp API Error] Evolution returned HTTP ${res.status}:`, errText)
            } else {
                console.log(`[WhatsApp API Success] Message successfully dispatched to ${formattedPhone}`)
            }
        })
        .catch((fetchErr) => {
            console.error('[WhatsApp API Fetch Error] Failed in background network call:', fetchErr)
        })

        return { success: true }
    } catch (error) {
        console.error('[WhatsApp API Exception] Failed to initialize WhatsApp trigger:', error)
        return { success: false, error }
    }
}
