'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import McpWidget from '@/components/agent/McpWidget'

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/auth/signin')
            return
        }

        // Proteção de Rota: Apenas ARTIST e ADMIN
        // @ts-ignore - role existe no nosso type customizado
        const userRole = session.user?.role
        if (userRole !== 'ARTIST' && userRole !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [session, status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse font-mono text-xs tracking-widest text-purple-500">INITIALIZING NEURAL LINK...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar Fixa */}
            <aside className="w-20 md:w-64 border-r border-white/5 bg-gray-900/20 flex flex-col justify-between transition-all duration-300">
                <div className="p-6">
                    <Link href="/artist/dashboard" className="block mb-10 group">
                        <h1 className="font-orbitron font-bold text-xl tracking-wider hidden md:block group-hover:text-purple-400 transition-colors">
                            KRONØS <span className="text-purple-600">OS</span>
                        </h1>
                        <span className="md:hidden font-orbitron font-bold text-2xl text-purple-600">K</span>
                    </Link>

                    <nav className="space-y-2">
                        <NavItem href="/artist/dashboard" icon={<LayoutDashboard size={20} />} label="VISÃO GERAL" active />
                        <NavItem href="/artist/calendar" icon={<Calendar size={20} />} label="AGENDA" />
                        <NavItem href="/artist/finance" icon={<DollarSign size={20} />} label="FINANCEIRO" />
                        <NavItem href="/artist/clients" icon={<Users size={20} />} label="CLIENTES" />
                        <NavItem href="/artist/settings" icon={<Settings size={20} />} label="SISTEMA" />
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-blue-500 flex-shrink-0"></div>
                        <div className="hidden md:block">
                            <p className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name}</p>
                            <p className="text-xs text-gray-500 font-mono">ARTISTA</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Área de Conteúdo Principal */}
            <main className="flex-1 overflow-y-auto bg-black relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none fixed"></div>
                {children}
                <McpWidget />
            </main>
        </div>
    )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`
                flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                ${active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-gray-500 hover:bg-white/5 hover:text-white'}
            `}>
                <span className="group-hover:scale-110 transition-transform duration-200">{icon}</span>
                <span className="text-xs font-mono tracking-wider font-bold hidden md:block">{label}</span>
            </div>
        </Link>
    )
}
