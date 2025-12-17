'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from "@/components/ui/button"
import { Eraser, Check } from 'lucide-react'

interface SignatureInputProps {
    onSave: (base64: string) => void
}

export function SignatureInput({ onSave }: SignatureInputProps) {
    const padRef = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const clear = () => {
        padRef.current?.clear()
        setIsEmpty(true)
    }

    const save = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            // Trim whitespace for better storage
            const data = padRef.current.getTrimmedCanvas().toDataURL('image/png')
            onSave(data)
        }
    }

    const handleEnd = () => {
        setIsEmpty(padRef.current?.isEmpty() ?? true)
    }

    return (
        <div className="space-y-4">
            <div className="border border-white/20 rounded-xl overflow-hidden bg-white">
                <SignatureCanvas
                    ref={padRef}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-[200px] cursor-crosshair',
                        style: { width: '100%', height: '200px' }
                    }}
                    onEnd={handleEnd}
                />
            </div>

            <div className="flex justify-between text-xs text-gray-500 font-mono uppercase">
                <span>Assine no quadro acima</span>
                <span>Caneta Digital v1.0</span>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={clear}
                    className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                >
                    <Eraser className="w-4 h-4 mr-2" />
                    Limpar
                </Button>

                <Button
                    type="button"
                    onClick={save}
                    disabled={isEmpty}
                    className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 disabled:opacity-50"
                >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Assinatura
                </Button>
            </div>
        </div>
    )
}
