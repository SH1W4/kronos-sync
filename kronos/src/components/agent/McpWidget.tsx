'use client'

import { useState } from 'react'
import { Bot, X, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { queryAgent } from '@/app/actions/agent'

export default function McpWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [messages, setMessages] = useState<{ role: 'agent' | 'user', text: string }[]>([
        { role: 'agent', text: 'KAI v1.0 Online. Sistemas Sincronizados.\n\nExperimente:\n- "Status"\n- "Financeiro"\n- "Sugestão [texto]"' }
    ])
    const [input, setInput] = useState('')

    const handleSend = async () => {
        if (!input.trim()) return
        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setInput('')
        setIsTyping(true)

        try {
            const response = await queryAgent(userMsg, [])
            setMessages(prev => [...prev, { role: 'agent', text: response.text }])
        } catch (e) {
            setMessages(prev => [...prev, { role: 'agent', text: 'Erro de conexão com o núcleo.' }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 h-96 bg-black/90 backdrop-blur-md border border-primary/30 rounded-2xl shadow-[0_0_30px_var(--primary-glow)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-primary" />
                            <span className="font-orbitron font-bold text-sm text-white">MCP AGENT</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
                                <div className={`
                                    max-w-[85%] p-3 rounded-xl text-xs font-mono
                                    ${msg.role === 'user'
                                        ? 'bg-primary text-black rounded-br-none'
                                        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-white/5'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-black flex gap-2 border-t border-white/10">
                        <input
                            className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 text-xs focus:border-primary outline-none text-white font-mono"
                            placeholder="Comando ('Status', 'Sugestão...')..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" className="h-8 w-8 bg-primary hover:opacity-90 text-black border-none" onClick={handleSend}>
                            <Send size={14} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-[var(--primary-glow)] transition-all hover:scale-110 active:scale-95 text-black"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse group-hover:hidden"></div>
                {isOpen ? <X /> : <Bot className="w-6 h-6" />}

                {/* Notification Dot if needed */}
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full"></span>
            </button>
        </div>
    )
}
