"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, AlertTriangle, HeartPulse, ShieldCheck, PenTool } from "lucide-react"

interface AnamnesisFormProps {
    bookingId: string
    clientId: string
    initialData: {
        name: string | null
        phone: string | null
        email: string | null
    }
}

export function AnamnesisForm({ bookingId, clientId, initialData }: AnamnesisFormProps) {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState({
        condicaoMedica: false,
        detalhesCondicao: "",
        cicatrizacao: false,
        detalhesCicatrizacao: "",
        alergias: false,
        detalhesAlergias: "",
        termos: false
    })

    const questions = [
        {
            id: "intro",
            title: "Bem-vindo ao KRONOS",
            subtitle: "Vamos preparar sua sessão com segurança.",
            icon: <ShieldCheck size={48} className="text-purple-500" />,
            type: "intro"
        },
        {
            id: "condicaoMedica",
            title: "Histórico Médico",
            subtitle: "Você tem alguma condição médica que devamos saber? (Diabetes, Epilepsia, etc)",
            icon: <HeartPulse size={32} className="text-red-400" />,
            type: "yesno",
            detailPlaceholder: "Qual condição?"
        },
        {
            id: "cicatrizacao",
            title: "Cicatrização",
            subtitle: "Você tem histórico de quelóide ou problemas de cicatrização?",
            icon: <AlertTriangle size={32} className="text-yellow-400" />,
            type: "yesno",
            detailPlaceholder: "Descreva o problema..."
        },
        {
            id: "alergias",
            title: "Alergias",
            subtitle: "Alergia a látex, tintas, pomadas ou lâminas?",
            icon: <AlertTriangle size={32} className="text-orange-400" />,
            type: "yesno",
            detailPlaceholder: "A que você tem alergia?"
        },
        {
            id: "termos",
            title: "Termo de Responsabilidade",
            subtitle: "Você confirma que as informações prestadas são verdadeiras e assume os riscos do procedimento?",
            icon: <PenTool size={32} className="text-green-400" />,
            type: "termos"
        }
    ]

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1)
        } else {
            console.log("Submitting:", formData)
            // Aqui chamaremos a Server Action para salvar no banco
            alert("Ficha salva com sucesso! (Simulação)")
        }
    }

    const currentQ = questions[step]

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="h-1 w-full bg-zinc-800 mb-8 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[400px] flex flex-col justify-center gap-6"
                >
                    <div className="flex flex-col gap-4">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            {currentQ.icon}
                        </div>
                        <h2 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                            {currentQ.title}
                        </h2>
                        <p className="text-lg text-zinc-400 font-light leading-relaxed max-w-lg">
                            {currentQ.subtitle}
                        </p>
                    </div>

                    <div className="mt-4">
                        {currentQ.type === "intro" && (
                            <button
                                onClick={handleNext}
                                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold tracking-wide hover:bg-purple-500 hover:text-white transition-all duration-300"
                            >
                                INICIAR FICHA <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        {currentQ.type === "yesno" && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setFormData({ ...formData, [currentQ.id]: false })}
                                        className={`flex-1 py-4 border rounded-xl font-mono text-sm transition-all ${!formData[currentQ.id as keyof typeof formData] ? 'bg-zinc-800 border-zinc-600 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        NÃO
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, [currentQ.id]: true })}
                                        className={`flex-1 py-4 border rounded-xl font-mono text-sm transition-all ${formData[currentQ.id as keyof typeof formData] ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                    >
                                        SIM
                                    </button>
                                </div>

                                {formData[currentQ.id as keyof typeof formData] && (
                                    <motion.textarea
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 100 }}
                                        placeholder={currentQ.detailPlaceholder}
                                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 placeholder:text-zinc-600 resize-none"
                                        onChange={(e) => {
                                            const fieldName = `detalhes${currentQ.id.charAt(0).toUpperCase() + currentQ.id.slice(1)}`
                                            setFormData({ ...formData, [fieldName]: e.target.value })
                                        }}
                                    />
                                )}

                                <button onClick={handleNext} className="w-full mt-4 bg-purple-600/20 border border-purple-500/50 text-purple-300 py-4 rounded-xl hover:bg-purple-600 hover:text-white transition-all font-bold tracking-wider">
                                    PRÓXIMO
                                </button>
                            </div>
                        )}

                        {currentQ.type === "termos" && (
                            <div className="space-y-6">
                                <div
                                    onClick={() => setFormData({ ...formData, termos: !formData.termos })}
                                    className={`p-6 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${formData.termos ? 'bg-green-900/10 border-green-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center mt-1 ${formData.termos ? 'bg-green-500 border-green-500' : 'border-zinc-600'}`}>
                                        {formData.termos && <Check size={14} className="text-black" />}
                                    </div>
                                    <div className="text-sm text-zinc-400 leading-relaxed">
                                        Declaro que li e compreendi todos os cuidados informados. Sei que a tatuagem é um procedimento definitivo e assumo total responsabilidade pelos cuidados pós-procedimento.
                                    </div>
                                </div>

                                <button
                                    onClick={handleNext}
                                    disabled={!formData.termos}
                                    className="w-full bg-green-500 text-black py-4 rounded-xl font-bold tracking-wide hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ASSINAR E FINALIZAR
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
