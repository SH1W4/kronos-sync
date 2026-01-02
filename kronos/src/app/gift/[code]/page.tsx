import { prisma } from "@/lib/prisma"
import { QRCodeSVG } from 'qrcode.react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { trackQrScan } from '@/app/actions/analytics'

export const dynamic = 'force-dynamic'

export default async function GiftCardPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params

    const coupon = await prisma.coupon.findUnique({
        where: { code },
        include: { originClient: true }
    })

    // Track Scan (Analytics)
    if (coupon) {
        await trackQrScan('COUPON', coupon.id, code)
    }

    if (!coupon) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center p-8 border border-red-500/30 bg-red-900/10 rounded-xl">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h1 className="text-xl font-bold font-orbitron">CUPOM INVÁLIDO</h1>
                    <p className="text-gray-400 mt-2">Este código não existe ou foi digitado incorretamente.</p>
                </div>
            </div>
        )
    }

    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
    const isValid = coupon.status === 'ACTIVE' && !isExpired

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Ticket Container */}
            <div className="relative w-full max-w-sm bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl shadow-[var(--primary-glow)] border border-white/10">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-primary z-10"></div>

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1614850523060-8da1d56ae167?q=80&w=1000&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-zinc-950/90"></div>
                </div>

                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-black rounded-full z-20"></div>
                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-black rounded-full z-20"></div>
                <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-white/10 z-20"></div>

                {/* Top Section */}
                <div className="p-8 text-center pb-12 relative z-10">
                    <div className="flex justify-center mb-6 opacity-90">
                        <BrandLogo size={40} animated={true} />
                    </div>
                    <h2 className="text-gray-400 text-xs tracking-[0.3em] font-medium uppercase mb-2">VOCÊ GANHOU</h2>
                    <h1 className="text-5xl font-orbitron font-bold text-white mb-2">{coupon.discountPercent}%</h1>
                    <p className="font-serif italic text-primary text-lg">de desconto</p>
                    <p className="text-zinc-200 text-sm font-medium mt-6 max-w-[240px] mx-auto drop-shadow-md leading-relaxed">
                        Válido para sua primeira sessão no Kronos Studio.
                    </p>
                </div>

                {/* Bottom Section (QR) */}
                <div className="bg-zinc-950/80 backdrop-blur-md p-8 pt-12 flex flex-col items-center relative z-10">
                    <div className="p-4 bg-white rounded-xl shadow-lg relative group">
                        {isValid ? (
                            <QRCodeSVG value={`https://kronos.art/redeem/${coupon.code}`} size={160} />
                        ) : (
                            <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded text-gray-400">
                                <AlertCircle size={40} />
                            </div>
                        )}
                        {/* Status Overlay */}
                        {!isValid && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl">
                                <span className="font-bold text-red-600 border-2 border-red-600 px-2 py-1 transform -rotate-12">
                                    {coupon.status === 'USED' ? 'JÁ UTILIZADO' : 'EXPIRADO'}
                                </span>
                            </div>
                        )}
                        {isValid && (
                            <div className="absolute -bottom-3 -right-3 text-green-500 bg-black rounded-full p-1 border border-green-500">
                                <CheckCircle size={20} fill="black" />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-xs uppercase mb-1">Código Promocional</p>
                        <p className="font-mono text-xl font-bold tracking-widest text-white selection:bg-primary/30 px-4 py-2 bg-white/5 rounded border border-white/10">
                            {coupon.code}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
                        <Clock size={12} />
                        <span>Presente de: <span className="text-gray-400 font-bold">{coupon.originClient?.name || 'Cliente Kronos'}</span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
