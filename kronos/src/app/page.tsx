import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">

            {/* Navbar Minimalista */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <BrandLogo size={40} animated={false} />
                    <div className="flex gap-4">
                        <Link href="/auth/register">
                            <Button variant="ghost" className="text-sm font-mono hover:text-white hover:bg-transparent text-gray-500">
                                NOVO ARTISTA
                            </Button>
                        </Link>
                        <Link href="/auth/signin">
                            <Button className="bg-white text-black hover:bg-gray-200 font-bold font-orbitron text-sm tracking-wider px-6">
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
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center">

                    {/* BRAND LOGO PRINCIPAL (Minimalista) */}
                    <div className="mb-16 hover:scale-105 transition-transform duration-700">
                        <BrandLogo size={180} variant="icon" animated={true} />
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-center tracking-tighter mb-6 leading-[0.9] text-white font-orbitron uppercase">
                        Sistema<br />
                        Operacional
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 text-center max-w-2xl font-mono mb-12 leading-relaxed">
                        Plataforma central de gestão de fluxo, agenda e performance do <span className="text-white font-bold">Kronos Tattoo Studio</span>.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
                        <Link href="/auth/signin" className="w-full">
                            <Button className="w-full h-16 text-lg bg-white hover:bg-gray-200 text-black font-black font-orbitron tracking-widest shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.5)] transition-all border-none">
                                ACESSAR SISTEMA
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid - Internal Tools */}
            <section className="py-24 px-6 border-t border-white/5 bg-black/50">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1 */}
                        <div className="cyber-card p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">AGENDA GERAL 3x7</h3>
                            <p className="text-gray-400 font-mono mb-8 max-w-md">Controle total das macas e horários dos residentes e guests.</p>
                            <div className="w-full h-48 bg-gray-900/50 rounded border border-white/5 relative overflow-hidden">
                                <div className="absolute inset-4 grid grid-cols-7 gap-1 opacity-50">
                                    {[...Array(7)].map((_, i) => <div key={i} className="bg-white/5 rounded"></div>)}
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="cyber-card p-8 relative overflow-hidden group">
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">KIOSK MODE</h3>
                            <p className="text-gray-400 font-mono">Terminal de auto-atendimento para recepção e check-in de clientes.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="cyber-card p-8 relative overflow-hidden group">
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">MARKETPLACE</h3>
                            <p className="text-gray-400 font-mono">Gestão de vendas de prints e produtos exclusivos do estúdio.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="cyber-card p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white p-2">PERFORMANCE DOS ARTISTAS</h3>
                            <p className="text-gray-400 font-mono pl-2">Acompanhamento em tempo real de comissões e faturamento.</p>
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
