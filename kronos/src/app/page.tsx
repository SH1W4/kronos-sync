import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans overflow-x-hidden">

            {/* Navbar Minimalista */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-orbitron font-bold text-xl tracking-widest flex items-center gap-2">
                        <div className="w-8 h-8 relative">
                            {/* Ícone reduzido apenas se necessário, mas aqui vamos focar no texto limpo */}
                            <div className="absolute inset-0 bg-primary blur-lg opacity-50 rounded-full"></div>
                            <div className="relative w-full h-full border-2 border-white transform rotate-45"></div>
                        </div>
                        <span>KRONOS</span>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/auth/signin">
                            <Button variant="ghost" className="text-sm font-mono hover:text-primary hover:bg-transparent">
                                LOGIN
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button className="bg-white text-black hover:bg-gray-200 font-bold font-orbitron text-sm tracking-wider px-6">
                                CADASTRO ANTECIPADO
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <div className="container mx-auto max-w-6xl relative z-10 flex flex-col items-center">

                    {/* A LOGO NEON QUE O USUÁRIO GOSTOU - DESTAQUE TOTAL */}
                    <div className="relative mb-12 group cursor-default transform hover:scale-105 transition-transform duration-700">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary via-secondary to-accent opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700"></div>
                        <Image
                            src="/brand/logo-neon.png"
                            alt="Kronos Neon Logo"
                            width={300}
                            height={300}
                            className="relative drop-shadow-2xl"
                            priority
                        />
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black text-center tracking-tighter mb-6 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-orbitron">
                        A EVOLUÇÃO <br />
                        DA TUA ARTE
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 text-center max-w-2xl font-mono mb-12 leading-relaxed">
                        O primeiro sistema operacional para estúdios que une gestão, estética e tecnologia. <span className="text-primary">Pare de usar papel. Comece a usar Kronos.</span>
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
                        <Link href="/auth/register" className="w-full">
                            <Button className="w-full h-16 text-lg bg-primary hover:bg-primary/90 text-black font-black font-orbitron tracking-widest shadow-[0_0_40px_-10px_rgba(0,255,136,0.5)] hover:shadow-[0_0_60px_-10px_rgba(0,255,136,0.7)] transition-all">
                                COMEÇAR AGORA
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-2 text-sm text-gray-500 font-mono">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Vagas limitadas para o Beta Fechado
                    </div>
                </div>
            </section>

            {/* Features Grid - Bento Grid Style */}
            <section className="py-24 px-6 border-t border-white/5 bg-black/50">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Feature 1 */}
                        <div className="cyber-card p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">AGENDA CINEMA 3x7</h3>
                            <p className="text-gray-400 font-mono mb-8 max-w-md">Visualização panorâmica de todas as suas macas e artistas. Arraste, solte e gerencie com zero fricção.</p>
                            <div className="w-full h-48 bg-gray-900/50 rounded border border-white/5 relative overflow-hidden">
                                {/* Mockup visual simplificado */}
                                <div className="absolute inset-4 grid grid-cols-7 gap-1 opacity-50">
                                    {[...Array(7)].map((_, i) => <div key={i} className="bg-white/5 rounded"></div>)}
                                </div>
                                <div className="absolute top-1/2 left-1/4 w-32 h-12 bg-primary/20 border border-primary text-primary text-xs font-mono flex items-center justify-center rounded shadow-[0_0_15px_rgba(0,255,136,0.2)] transform -rotate-3 hover:scale-110 transition-transform">
                                    BOOKING #402
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="cyber-card p-8 relative overflow-hidden group">
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">KIOSK MODE</h3>
                            <p className="text-gray-400 font-mono">Deixe o tablet na recepção. O cliente faz o check-in e assina a ficha digitalmente.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="cyber-card p-8 relative overflow-hidden group">
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">MARKETPLACE</h3>
                            <p className="text-gray-400 font-mono">Venda seus prints e flashs enquanto tatua.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="cyber-card p-8 col-span-1 md:col-span-2 relative overflow-hidden group">
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white p-2">FINANCEIRO AUTOMÁTICO</h3>
                            <div className="flex items-end gap-2 h-32 mt-4 ml-2">
                                <div className="w-12 h-[40%] bg-gray-800 rounded-t"></div>
                                <div className="w-12 h-[60%] bg-gray-700 rounded-t"></div>
                                <div className="w-12 h-[50%] bg-gray-800 rounded-t"></div>
                                <div className="w-12 h-[80%] bg-gray-700 rounded-t"></div>
                                <div className="w-12 h-[100%] bg-primary shadow-[0_0_15px_rgba(0,255,136,0.4)] rounded-t relative group-hover:h-[110%] transition-all"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center text-gray-600 font-mono text-xs">
                <p>KRONOS SYNC © 2025. CONSTRUÍDO PARA O FUTURO DA TATUAGEM.</p>
            </footer>
        </div>
    )
}
