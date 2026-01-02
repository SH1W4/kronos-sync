'use client'

import React, { useState } from 'react'
import { QrScanner } from '@/components/scanner/QrScanner'
import { redeemCouponAction } from '@/app/actions/coupons'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, XCircle, Loader2, Sparkles, User, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function ScannerPage() {
    const { toast } = useToast()
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE')
    const [result, setResult] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState('')

    const handleScanSuccess = async (decodedText: string) => {
        if (status === 'PROCESSING') return

        setStatus('PROCESSING')
        setResult(null)
        setErrorMsg('')

        try {
            const res = await redeemCouponAction(decodedText)

            if (res.success && res.details) {
                setStatus('SUCCESS')
                setResult(res.details)
                toast({
                    title: "CUPOM RESGATADO!",
                    description: `Desconto de ${res.details.discount}% validado com sucesso.`,
                })
            } else {
                setStatus('ERROR')
                setErrorMsg(res.message || 'Erro ao processar cupom.')
                toast({
                    title: "ERRO NA VALIDAÇÃO",
                    description: res.message,
                    variant: "destructive"
                })
            }
        } catch (err) {
            setStatus('ERROR')
            setErrorMsg('Erro de conexão com o servidor.')
        }
    }

    const resetScanner = () => {
        setStatus('IDLE')
        setResult(null)
        setErrorMsg('')
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-white min-h-screen">
            <header className="space-y-2">
                <h1 className="text-3xl font-orbitron font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                    LEITOR DE CUPONS
                </h1>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Economia Colaborativa // Validação Cross-Artista
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Scanner Section */}
                <div className="space-y-6">
                    {(status === 'IDLE' || status === 'SCANNING' || status === 'PROCESSING') && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="relative group">
                                <QrScanner
                                    onScanSuccess={handleScanSuccess}
                                    qrbox={250}
                                />
                                {status === 'PROCESSING' && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                                        <span className="font-mono text-[10px] uppercase tracking-widest">Processando...</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-[10px] font-mono text-gray-400 animate-pulse">
                                POSICIONE O QR CODE NO CENTRO DA MOLDURA
                            </p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {status === 'SUCCESS' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center space-y-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 size={32} className="text-black" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-orbitron font-bold text-green-400">CUPOM VALIDADO!</h2>
                                    <p className="text-xs text-gray-400">O desconto agora está marcado como utilizado.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-left">
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-mono text-gray-500 uppercase">Economia Colaborativa</p>
                                            <p className="text-sm font-bold text-green-400">+ R$ 10,00 creditado ao criador</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                                            <Tag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-mono text-gray-500 uppercase">Benefício Cliente</p>
                                            <p className="text-lg font-orbitron font-bold">{result?.discount}% OFF</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-mono text-gray-500 uppercase">Origem/Cliente</p>
                                            <p className="text-sm font-bold">{result?.origin}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={resetScanner}
                                    className="w-full bg-white hover:bg-green-500 text-black font-black font-orbitron transition-all"
                                >
                                    PRÓXIMO SCAN
                                </Button>
                            </motion.div>
                        )}

                        {status === 'ERROR' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-6"
                            >
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-black">
                                        <XCircle size={32} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-orbitron font-bold text-red-500">ERRO NA LEITURA</h2>
                                    <p className="text-xs text-gray-400">{errorMsg}</p>
                                </div>
                                <Button
                                    onClick={resetScanner}
                                    variant="outline"
                                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-bold"
                                >
                                    TENTAR NOVAMENTE
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions Section */}
                <div className="space-y-8">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-orbitron font-bold text-primary flex items-center gap-2">
                            <Sparkles size={16} /> DIRETRIZES DO SCANNER
                        </h3>
                        <ul className="space-y-4 text-xs font-mono text-gray-400">
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">01.</span>
                                <span>Peça ao cliente para abrir o QR Code do cupom no celular.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">02.</span>
                                <span>Ao validar, o cupom é marcado como **USADO** e o desconto é garantido.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">03.</span>
                                <span>Você pode ler cupons de **qualquer artista** do ecossistema.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-primary font-bold">04.</span>
                                <span>O artista que gerou o cupom recebe **R$ 10,00 de comissão fixa** automaticamente pelo lead.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-center">
                            <p className="text-3xl font-black font-orbitron text-primary">1s</p>
                            <p className="text-[8px] font-mono text-gray-500 uppercase mt-1">Velocidade de Scan</p>
                        </div>
                        <div className="p-6 bg-black/40 border border-white/5 rounded-2xl text-center">
                            <p className="text-3xl font-black font-orbitron text-primary">∞</p>
                            <p className="text-[8px] font-mono text-gray-500 uppercase mt-1">Cross-Artista</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
