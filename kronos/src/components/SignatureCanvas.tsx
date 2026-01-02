'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Eraser, PenTool } from 'lucide-react'

interface SignatureCanvasProps {
    onSave: (data: string) => void
    onClear: () => void
}

export function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set line style
        // Set line style - uses primary color from theme if available
        const primaryColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#a855f7' : '#a855f7'
        ctx.strokeStyle = primaryColor
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Scale for high DPI
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        ctx.scale(2, 2)
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            onSave(canvas.toDataURL('image/png'))
        }
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const rect = canvas.getBoundingClientRect()
        let x, y

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left
            y = e.touches[0].clientY - rect.top
        } else {
            x = e.clientX - rect.left
            y = e.clientY - rect.top
        }

        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const clear = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()
        onClear()
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-[2/1] bg-black rounded-2xl border border-white/10 overflow-hidden cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full touch-none"
                />

                <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clear}
                        className="bg-black/50 hover:bg-black text-xs font-mono text-zinc-500 rounded-lg border border-white/5"
                    >
                        <Eraser size={14} className="mr-2" /> LIMPAR
                    </Button>
                </div>

                <div className="absolute top-4 left-4 pointer-events-none opacity-20">
                    <div className="flex items-center gap-2 text-zinc-500 uppercase text-[10px] font-mono">
                        <PenTool size={12} /> Assine aqui
                    </div>
                </div>
            </div>
        </div>
    )
}
