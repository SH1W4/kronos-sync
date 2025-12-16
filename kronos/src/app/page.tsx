import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">

            {/* Navbar Minimalista */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <BrandLogo size={40} animated={false} />
                    <div className="flex items-center gap-8">
                        <Link href="#features" className="text-xs font-mono text-gray-400 hover:text-white tracking-widest transition-colors hidden md:block">
                            THE SYSTEM
                        </Link>
                        <Link href="#" className="text-xs font-mono text-gray-400 hover:text-white tracking-widest transition-colors hidden md:block">
                            MANIFESTO
                        </Link>
                        <Link href="/auth/signin">
                            <Button className="bg-white text-black hover:bg-gray-200 font-bold font-orbitron text-sm tracking-wider px-6 rounded-none">
                                LOGIN
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 blur-[120px] rounded-full opacity-30 pointer-events-none"></div>
                {/* Hero Background Image */}
                <Image
                    src="/hero-bg.png"
                    alt="Abstract Liquid Background"
                    fill
                    className="object-cover opacity-40 mix-blend-screen pointer-events-none"
                    priority
                />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                {/* --- FREQUENCY WAVES & SCANNER EFFECT --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40">
                    {/* Scanner Line */}
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent blur-sm opacity-20 animate-[scan_8s_ease-in-out_infinite]"></div>

                    {/* Waves Container */}
                    <div className="absolute w-[200%] h-full flex items-center opacity-30">
                        {/* Wave 1 (Slow & Wide) */}
                        <svg className="absolute w-full h-64 animate-[wave_15s_linear_infinite]" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M0,100 Q250,50 500,100 T1000,100" fill="none" stroke="#00FF88" strokeWidth="1" className="opacity-50" />
                        </svg>

                        {/* Wave 2 (Fast & Tight) */}
                        <svg className="absolute w-full h-64 animate-[wave_10s_linear_infinite_reverse] translate-y-4" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M0,100 Q150,150 300,100 T600,100 T900,100" fill="none" stroke="#8B5CF6" strokeWidth="1" className="opacity-40" />
                        </svg>

                        {/* Wave 3 (Background Pulse) */}
                        <svg className="absolute w-full h-96 animate-[pulse_4s_ease-in-out_infinite] opacity-20" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M0,100 Q500,0 1000,100" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5,5" />
                        </svg>
                    </div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center">

                    {/* BRAND LOGO PRINCIPAL (Minimalista & Central) */}
                    <div className="mb-12 relative group">
                        <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full animate-pulse-slow"></div>
                        <div className="relative hover:scale-105 transition-transform duration-700">
                            <BrandLogo size={200} variant="icon" animated={true} />
                        </div>
                    </div>

                    {/* Removido STUDIO FLOW H1 */}

                    <p className="text-lg md:text-xl text-gray-400 text-center max-w-2xl font-mono mb-12 leading-relaxed px-4">
                        Otimização inteligente de agenda, clientes e performance. <br className="hidden md:block" />
                        <span className="text-white">Redefinindo o padrão de gestão para estúdios high-end.</span>
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md px-4">
                        <Link href="/auth/signin" className="w-full">
                            <Button className="w-full h-14 text-base bg-white hover:bg-gray-100 text-black font-bold font-orbitron tracking-widest shadow-lg transition-all rounded-sm">
                                ACESSAR FLOW
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid - Internal Tools */}
            <section id="features" className="py-24 px-6 border-t border-white/5 bg-black/50">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1: AGENDA */}
                        <div className="cyber-card p-0 col-span-1 md:col-span-2 relative overflow-hidden group h-80">
                            <Image
                                src="/features/agenda.png"
                                alt="Agenda Holográfica"
                                fill
                                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-orbitron font-bold mb-2 text-white relative z-10">AGENDA GERAL 3x7</h3>
                                <p className="text-gray-300 font-mono max-w-md relative z-10 text-shadow">Controle total das macas e horários dos residentes e guests.</p>
                            </div>
                        </div>

                        {/* Feature 2: KIOSK */}
                        <div className="cyber-card p-0 relative overflow-hidden group h-80">
                            <Image
                                src="/features/kiosk.png"
                                alt="Kiosk Mode"
                                fill
                                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-orbitron font-bold mb-2 text-white relative z-10">KIOSK MODE</h3>
                                <p className="text-gray-300 font-mono relative z-10 text-shadow">Auto-atendimento futurista para check-in.</p>
                            </div>
                        </div>

                        {/* Feature 3: MARKETPLACE */}
                        <div className="cyber-card p-0 relative overflow-hidden group h-64">
                            <Image
                                src="/features/marketplace.png"
                                alt="Digital Marketplace"
                                fill
                                className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-orbitron font-bold mb-2 text-white relative z-10">MARKETPLACE</h3>
                                <p className="text-gray-300 font-mono relative z-10 text-shadow">Gestão de vendas de prints e produtos exclusivos.</p>
                            </div>
                        </div>

                        {/* Feature 4: PERFORMANCE */}
                        <div className="cyber-card p-0 col-span-1 md:col-span-2 relative overflow-hidden group h-64">
                            <Image
                                src="/features/performance.png"
                                alt="Performance Dashboard"
                                fill
                                className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-2xl font-orbitron font-bold mb-2 text-white relative z-10">PERFORMANCE DOS ARTISTAS</h3>
                                <p className="text-gray-300 font-mono relative z-10 text-shadow">Acompanhamento em tempo real de comissões e faturamento.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center text-gray-600 font-mono text-xs">
                <p>KRONOS SYNC v2.2 // INTERNAL USE ONLY</p>
            </footer>
        </div>
    )
}
