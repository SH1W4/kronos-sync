import Tesseract from 'tesseract.js'
import sharp from 'sharp'

export interface OcrResult {
    success: boolean
    text?: string
    confidence?: number
    extractedData?: {
        valor?: number
        destinatario?: string
        data?: string
    }
    error?: string
}

/**
 * Extrai texto de uma imagem usando Tesseract OCR
 * @param imageUrl URL da imagem (pode ser local ou remota)
 */
export async function extractTextFromImage(imageUrl: string): Promise<OcrResult> {
    try {
        // 1. Pré-processamento da imagem para melhor OCR
        const processedImageBuffer = await preprocessImage(imageUrl)

        // 2. Executar OCR
        const { data } = await Tesseract.recognize(
            processedImageBuffer,
            'por', // Português
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`)
                    }
                }
            }
        )

        const extractedText = data.text
        const confidence = data.confidence / 100 // Normalizar para 0-1

        console.log('[OCR] Extracted text:', extractedText)
        console.log('[OCR] Confidence:', confidence)

        // 3. Parsear dados financeiros do texto
        const extractedData = parsePixData(extractedText)

        return {
            success: true,
            text: extractedText,
            confidence,
            extractedData
        }

    } catch (error) {
        console.error('[OCR] Error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido no OCR'
        }
    }
}

/**
 * Pré-processa a imagem para melhorar a precisão do OCR
 */
async function preprocessImage(imageUrl: string): Promise<Buffer> {
    try {
        // Se for URL remota, fazer fetch primeiro
        let imageBuffer: Buffer

        if (imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl)
            imageBuffer = Buffer.from(await response.arrayBuffer())
        } else {
            // Assumir que é base64 ou path local
            imageBuffer = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        }

        // Aplicar transformações para melhorar OCR
        const processed = await sharp(imageBuffer)
            .grayscale() // Converter para escala de cinza
            .normalize() // Normalizar contraste
            .sharpen() // Aumentar nitidez
            .toBuffer()

        return processed

    } catch (error) {
        console.error('[OCR] Image preprocessing error:', error)
        throw error
    }
}

/**
 * Extrai dados estruturados de um comprovante PIX
 */
function parsePixData(text: string): OcrResult['extractedData'] {
    const data: OcrResult['extractedData'] = {}

    // Regex para valor em BRL (ex: R$ 150,00 ou 150.00)
    const valorMatch = text.match(/R\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i)
    if (valorMatch) {
        const valorStr = valorMatch[1].replace(/\./g, '').replace(',', '.')
        data.valor = parseFloat(valorStr)
    }

    // Regex para nomes (destinatário - geralmente após "Para:" ou "Destinatário:")
    const destinatarioMatch = text.match(/(?:para|destinat[aá]rio|recebedor)[\s:]+([A-ZÀ-Ú][a-zà-ú]+(?:\s[A-ZÀ-Ú][a-zà-ú]+)*)/i)
    if (destinatarioMatch) {
        data.destinatario = destinatarioMatch[1].trim()
    }

    // Regex para data (DD/MM/YYYY ou DD-MM-YYYY)
    const dataMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/
    )
    if (dataMatch) {
        data.data = dataMatch[1]
    }

    // Fallback: tentar encontrar qualquer nome próprio (capitalizado)
    if (!data.destinatario) {
        const nomeMatch = text.match(/([A-ZÀ-Ú][a-zà-ú]+(?:\s[A-ZÀ-Ú][a-zà-ú]+){1,3})/g)
        if (nomeMatch && nomeMatch.length > 0) {
            // Pegar o nome mais longo (geralmente é o destinatário)
            data.destinatario = nomeMatch.reduce((a, b) => a.length > b.length ? a : b)
        }
    }

    return data
}
