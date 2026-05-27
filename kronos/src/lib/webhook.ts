// src/lib/webhook.ts

interface WebhookPayload {
    event: 'BOOKING_CREATED' | 'BOOKING_COMPLETED' | 'BOOKING_CANCELLED'
    data: any
}

/**
 * Dispatches an event to the n8n automation webhook.
 * This function fires asynchronously and does not block the main thread.
 */
export async function dispatchWebhook(payload: WebhookPayload) {
    // URL do Webhook do n8n configurada via variável de ambiente
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
        console.warn('⚠️ N8N_WEBHOOK_URL is not defined. Skipping automation trigger.')
        return
    }

    try {
        // Envia a requisição em background (fire-and-forget)
        fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Chave de segurança opcional
                'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET || ''}`
            },
            body: JSON.stringify({
                ...payload,
                timestamp: new Date().toISOString()
            }),
        }).catch((err) => {
            console.error('🚨 Failed to dispatch webhook to n8n (Background Error):', err)
        })

        console.log(`✅ Webhook dispatched: ${payload.event}`)
    } catch (error) {
        console.error('🚨 Failed to dispatch webhook to n8n:', error)
    }
}
