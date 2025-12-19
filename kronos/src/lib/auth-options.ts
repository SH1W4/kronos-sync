import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

console.log("⚠️ PRE-BOOT CHECK:")
console.log("ID:", process.env.GOOGLE_CLIENT_ID?.substring(0, 10))
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10))


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
            name: "Modo Dev (Bypass)",
            credentials: {
                username: { label: "Username (use 'dev')", type: "text", placeholder: "dev" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (credentials?.username === "dev") {
                        console.log("🔓 ACESSO DEV: Procurando Artista...")

                        // Busca usuário existente
                        let user = await prisma.user.findFirst({
                            where: { role: "ARTIST" }
                        })

                        if (!user) {
                            console.log("⚠️ Criando 'Dev Artist' completo...")

                            // Cria User E Artist em uma transação
                            user = await prisma.user.create({
                                data: {
                                    email: "dev@kronos.com",
                                    name: "Dev Artist",
                                    role: "ARTIST",
                                    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                                    artist: {
                                        create: {
                                            plan: "RESIDENT",
                                            commissionRate: 0.30,
                                            isActive: true
                                        }
                                    }
                                }
                            })

                            console.log("✅ Dev Artist criado com ID:", user.id)
                        }

                        // Retorna objeto limpo (sem relações nested)
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                            role: user.role
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
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { role: true }
                })

                if (dbUser) {
                    token.role = dbUser.role
                }

                const memberships = await prisma.workspaceMember.findMany({
                    where: { userId: token.id as string },
                    include: { workspace: true }
                })

                token.workspaces = memberships.map(m => ({
                    id: m.workspaceId,
                    name: m.workspace.name,
                    slug: m.workspace.slug,
                    role: m.role,
                    primaryColor: m.workspace.primaryColor
                }))

                // Define o workspace ativo se não tiver um ou se o atual não estiver mais na lista
                const currentWorkspaces = token.workspaces as any[]
                if (currentWorkspaces.length > 0) {
                    const isValid = currentWorkspaces.some(w => w.id === token.activeWorkspaceId)
                    if (!token.activeWorkspaceId || !isValid) {
                        token.activeWorkspaceId = currentWorkspaces[0].id
                    }
                } else {
                    token.activeWorkspaceId = null
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
            }
            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    debug: process.env.NODE_ENV === 'development',
}
