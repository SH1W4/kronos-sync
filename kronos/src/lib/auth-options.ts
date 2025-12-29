import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

console.log("⚠️ Auth initialized")


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            id: "magic-link",
            name: "Magic Link",
            credentials: {
                email: { label: "Email", type: "email" },
                code: { label: "Code", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.code) return null

                try {
                    // 1. Validate Code
                    const verificationCode = await prisma.verificationCode.findFirst({
                        where: {
                            email: credentials.email.toLowerCase(),
                            code: credentials.code.trim(),
                            used: false,
                            expiresAt: { gte: new Date() }
                        },
                        orderBy: { createdAt: 'desc' }
                    })

                    if (!verificationCode) {
                        throw new Error("Código inválido ou expirado")
                    }

                    // 2. Mark code as used
                    await prisma.verificationCode.update({
                        where: { id: verificationCode.id },
                        data: { used: true }
                    })

                    // 3. Find or Create User
                    let user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() }
                    })

                    if (!user) {
                        user = await prisma.user.create({
                            data: {
                                email: credentials.email.toLowerCase(),
                                name: credentials.email.split('@')[0],
                                role: 'CLIENT'
                            }
                        })
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image
                    }
                } catch (error) {
                    console.error("❌ Magic Link Error:", error)
                    return null
                }
            }
        }),
        CredentialsProvider({
            id: "credentials", // Dev Mode
            name: "Modo Dev (Bypass)",
            credentials: {
                username: { label: "Username (use 'dev')", type: "text", placeholder: "dev" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // MESTRE / ADMIN BYPASS
                    if (credentials?.username === "master") {
                        console.log("👑 ACESSO MESTRE: Iniciando Sessão Administrativa...")

                        // 1. Vincula ao Workspace Principal do Seed
                        let workspace = await prisma.workspace.findFirst({
                            where: { OR: [{ slug: 'kronos-studio' }, { slug: 'demo-studio' }] }
                        })

                        if (!workspace) {
                            workspace = await prisma.workspace.create({
                                data: {
                                    name: "Kronus Master Studio",
                                    slug: "kronos-studio",
                                    primaryColor: "#00FF88",
                                    owner: {
                                        create: {
                                            email: "admin@kronosync.com",
                                            name: "Mestre Supremo",
                                            role: "ADMIN"
                                        }
                                    }
                                }
                            })
                        }

                        // 2. Garante Usuário Master
                        let masterUser = await prisma.user.findUnique({
                            where: { email: "admin@kronosync.com" }
                        })

                        if (!masterUser) {
                            masterUser = await prisma.user.create({
                                data: {
                                    email: "admin@kronosync.com",
                                    name: "Mestre Supremo",
                                    role: "ADMIN",
                                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mestre",
                                }
                            })
                        }

                        // 3. Garante Perfis (Membro e Artista)
                        await prisma.workspaceMember.upsert({
                            where: { workspaceId_userId: { workspaceId: workspace.id, userId: masterUser.id } },
                            create: { workspaceId: workspace.id, userId: masterUser.id, role: "ADMIN" },
                            update: { role: "ADMIN" }
                        })

                        const artist = await prisma.artist.upsert({
                            where: { userId: masterUser.id },
                            create: {
                                userId: masterUser.id,
                                workspaceId: workspace.id,
                                plan: "RESIDENT",
                                commissionRate: 0.10,
                                isActive: true
                            },
                            update: { workspaceId: workspace.id, isActive: true }
                        })

                        // 4. GERA DADOS DE APRESENTAÇÃO (Cenários Reais)
                        console.log("🎭 Preparando Cenários de Apresentação...")

                        const scenarios = [
                            {
                                id: 'scenario-1',
                                name: 'Ricardo Mautone',
                                email: 'ricardo@kronos.com',
                                time: 10, // 10:00
                                anamnesis: {
                                    medicalConditionsTattoo: 'Nenhuma condição reportada.',
                                    medicalConditionsHealing: 'Nenhuma',
                                    medicalConditionsHealingDetails: 'Cicatrizacão normal e rápida em tatuagens anteriores.',
                                    knownAllergies: 'Nenhuma alergia conhecida.',
                                    artDescription: 'Samurai Full Sleeve Blackwork',
                                    artDescriptionDetails: 'Projeto grande com muito contraste.',
                                    agreedValue: '4500.00',
                                    understandPermanence: true,
                                    followInstructions: true,
                                    acceptedTerms: true
                                }
                            },
                            {
                                id: 'scenario-2',
                                name: 'Lucas Mendonça',
                                email: 'lucas@kronos.com',
                                time: 14, // 14:00
                                color: 'text-red-500', // Dica visual no log se necessário
                                anamnesis: {
                                    medicalConditionsTattoo: 'Portador de HEPATITE C (Em tratamento/Controlado).',
                                    medicalConditionsHealing: 'Sim, uso contínuo de anticoagulantes.',
                                    medicalConditionsHealingDetails: 'Sangramento pode ser mais persistente durante o procedimento.',
                                    knownAllergies: 'ALERGIA SEVERA A IODO (Povidine).',
                                    artDescription: 'Realismo de Leão no Antebraço',
                                    agreedValue: '2800.00',
                                    understandPermanence: true,
                                    followInstructions: true,
                                    acceptedTerms: true
                                }
                            },
                            {
                                id: 'scenario-3',
                                name: 'Beatriz Oliveira',
                                email: 'beatriz@kronos.com',
                                time: 18, // 18:00
                                anamnesis: {
                                    medicalConditionsTattoo: 'DIABETES TIPO 1. Tendência a hipoglicemia em sessões longas.',
                                    medicalConditionsHealing: 'Cicatrização periférica mais lenta.',
                                    knownAllergies: 'ALERGIA A LÁTEX (Usar luvas de nitrilo).',
                                    artDescription: 'Floral Fineline Minimalista',
                                    agreedValue: '850.00',
                                    understandPermanence: true,
                                    followInstructions: true,
                                    acceptedTerms: true
                                }
                            }
                        ]

                        for (const s of scenarios) {
                            const user = await prisma.user.upsert({
                                where: { email: s.email },
                                create: { name: s.name, email: s.email, role: 'CLIENT', phone: '(11) 99999-0000' },
                                update: { name: s.name }
                            })

                            const startTime = new Date()
                            startTime.setHours(s.time, 0, 0, 0)
                            const endTime = new Date(startTime)
                            endTime.setHours(s.time + 3, 0, 0, 0)

                            // Verifica se já existe agendamento hoje para este cenário
                            const existingBooking = await prisma.booking.findFirst({
                                where: {
                                    artistId: artist.id,
                                    clientId: user.id,
                                    scheduledFor: {
                                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                        lte: new Date(new Date().setHours(23, 59, 59, 999))
                                    }
                                }
                            })

                            if (!existingBooking) {
                                console.log(`📝 Criando cenário para ${s.name}...`)
                                const slot = await prisma.slot.create({
                                    data: { workspaceId: workspace.id, startTime, endTime, macaId: 1, isActive: true }
                                })

                                const booking = await prisma.booking.create({
                                    data: {
                                        workspaceId: workspace.id,
                                        artistId: artist.id,
                                        clientId: user.id,
                                        slotId: slot.id,
                                        status: 'CONFIRMED',
                                        value: parseFloat(s.anamnesis.agreedValue),
                                        finalValue: parseFloat(s.anamnesis.agreedValue),
                                        studioShare: parseFloat(s.anamnesis.agreedValue) * 0.1,
                                        artistShare: parseFloat(s.anamnesis.agreedValue) * 0.9,
                                        scheduledFor: startTime,
                                        duration: 180,
                                        fichaStatus: 'COMPLETED'
                                    }
                                })

                                await prisma.anamnesis.create({
                                    data: {
                                        clientId: user.id,
                                        workspaceId: workspace.id,
                                        bookingId: booking.id,
                                        fullName: s.name,
                                        whatsapp: user.phone,
                                        ...s.anamnesis
                                    }
                                })
                            }
                        }

                        return {
                            id: masterUser.id,
                            email: masterUser.email,
                            name: masterUser.name,
                            image: masterUser.image,
                            role: masterUser.role
                        }
                    }

                    // DEV / ARTIST BYPASS
                    if (credentials?.username === "dev") {
                        console.log("🔓 ACESSO DEV: Garantindo Perfil de Artista...")

                        // 1. Garante que o Workspace de demonstração exista
                        let workspace = await prisma.workspace.findFirst()
                        if (!workspace) {
                            workspace = await prisma.workspace.create({
                                data: {
                                    name: "Kronus Demo Studio",
                                    slug: "demo-studio",
                                    primaryColor: "#8B5CF6",
                                    owner: {
                                        create: {
                                            email: "admin@kronos.com",
                                            name: "Admin System",
                                            role: "ADMIN"
                                        }
                                    }
                                }
                            })
                        }

                        // 2. Garante que o usuário 'dev' específico exista
                        let devUser = await prisma.user.findUnique({
                            where: { email: "dev@kronos.com" },
                            include: { artist: true }
                        })

                        if (!devUser) {
                            devUser = await prisma.user.create({
                                data: {
                                    email: "dev@kronos.com",
                                    name: "Dev Artist",
                                    role: "ARTIST",
                                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                                },
                                include: { artist: true }
                            })
                        } else if (devUser.role !== "ARTIST") {
                            devUser = await prisma.user.update({
                                where: { id: devUser.id },
                                data: { role: "ARTIST" },
                                include: { artist: true }
                            })
                        }

                        // 3. Garante que o registro de Artist exista
                        if (!devUser.artist) {
                            await prisma.artist.create({
                                data: {
                                    userId: devUser.id,
                                    workspaceId: workspace.id,
                                    plan: "RESIDENT",
                                    commissionRate: 0.30,
                                    isActive: true
                                }
                            })
                        } else if (!devUser.artist.workspaceId) {
                            await prisma.artist.update({
                                where: { id: devUser.artist.id },
                                data: { workspaceId: workspace.id }
                            })
                        }

                        // 4. Garante que o Membership no workspace exista
                        const membership = await prisma.workspaceMember.findUnique({
                            where: {
                                workspaceId_userId: {
                                    workspaceId: workspace.id,
                                    userId: devUser.id
                                }
                            }
                        })

                        if (!membership) {
                            await prisma.workspaceMember.create({
                                data: {
                                    workspaceId: workspace.id,
                                    userId: devUser.id,
                                    role: "ADMIN"
                                }
                            })
                        }

                        console.log("✅ Perfil Dev Artista verificado e pronto.")

                        return {
                            id: devUser.id,
                            email: devUser.email,
                            name: devUser.name,
                            image: devUser.image,
                            role: devUser.role
                        }
                    }
                    return null
                } catch (error) {
                    console.error("❌ ERRO NO DEV MODE:", error)
                    throw error // Joga o erro para NextAuth capturar
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Se houver usuário (primeiro login), preenche os dados iniciais
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            }

            // Sempre busca/atualiza os dados de workspace e role se tivermos o ID
            // Isso permite que o update() do frontend funcione para convites e promoções
            if (token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        include: { artist: true }
                    })

                    if (dbUser) {
                        token.name = dbUser.name // Sincroniza o nome
                        token.role = dbUser.role
                        token.customColor = dbUser.customColor
                        if (dbUser.artist) {
                            token.isArtist = true
                            token.instagram = dbUser.artist.instagram // Sincroniza o instagram
                            token.commissionRate = dbUser.artist.commissionRate
                            token.validUntil = dbUser.artist.validUntil?.toISOString() || null

                            // VERIFICAÇÃO DE REVOGAÇÃO AUTOMÁTICA (GUEST EXPIRADO)
                            if (dbUser.artist.validUntil && new Date(dbUser.artist.validUntil) < new Date()) {
                                console.log(`⏳ ACESSO EXPIRADO para ${dbUser.name}. Revogando automaticamente...`)
                                token.role = 'CLIENT'
                                token.workspaces = []
                                token.activeWorkspaceId = null
                                token.isArtist = false
                            }
                        }
                    }

                    const memberships = await prisma.workspaceMember.findMany({
                        where: { userId: token.id as string },
                        include: { workspace: true }
                    })

                    if (memberships && memberships.length > 0) {
                        token.workspaces = memberships.map(m => ({
                            id: m.workspaceId,
                            name: m.workspace?.name || "Sem Nome",
                            slug: m.workspace?.slug || "",
                            role: m.role,
                            primaryColor: m.workspace?.primaryColor || "#8B5CF6",
                            pixKey: m.workspace?.pixKey || "",
                            pixRecipient: m.workspace?.pixRecipient || ""
                        }))

                        // Define o workspace ativo
                        const currentWorkspaces = token.workspaces as any[]
                        const isValid = currentWorkspaces.some(w => w.id === token.activeWorkspaceId)
                        if (!token.activeWorkspaceId || !isValid) {
                            token.activeWorkspaceId = currentWorkspaces[0].id
                        }
                    } else {
                        token.workspaces = []
                        token.activeWorkspaceId = null
                    }
                } catch (error) {
                    console.error("❌ Erro ao buscar dados do usuário no JWT callback:", error)
                    // Não lança erro para não quebrar o login, apenas mantém o token base
                }
            }

            // Permite troca manual de workspace via update({ activeWorkspaceId: '...' })
            if (trigger === "update" && session?.activeWorkspaceId) {
                token.activeWorkspaceId = session.activeWorkspaceId
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).workspaces = token.workspaces;
                (session.user as any).activeWorkspaceId = token.activeWorkspaceId;
                (session.user as any).commissionRate = token.commissionRate;
                (session.user as any).isArtist = token.isArtist;
                (session.user as any).instagram = token.instagram;
                (session.user as any).customColor = token.customColor;
                (session.user as any).validUntil = token.validUntil;
            }

            // Map to session root as well for compatibility with legacy components
            (session as any).activeWorkspaceId = token.activeWorkspaceId;
            (session as any).role = token.role;

            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    debug: process.env.NODE_ENV === 'development',
}
