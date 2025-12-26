import { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
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
        /*
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
        */
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
                        token.role = dbUser.role
                        token.customColor = dbUser.customColor
                        if (dbUser.artist) {
                            token.isArtist = true
                            token.commissionRate = dbUser.artist.commissionRate
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
                (session.user as any).customColor = token.customColor;
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
