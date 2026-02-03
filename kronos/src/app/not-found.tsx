
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
      
      <div className="relative z-10 space-y-6 max-w-md">
        <h1 className="text-9xl font-black text-primary/20 tracking-tighter">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-orbitron font-black uppercase italic tracking-tighter">Coordenadas Perdidas</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest leading-relaxed">
            O hub que você está procurando não existe ou foi removido do silo de dados.
          </p>
        </div>
        
        <div className="pt-4">
          <Link href="/artist/dashboard">
            <Button className="bg-primary text-black font-black px-8 h-12 rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
              RETORNAR AO DASHBOARD
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
