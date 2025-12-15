import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/calendar",
                    access_type: "offline",
                    prompt: "consent", // Força perguntar permissão sempre, pra garantir o refresh token
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            // Adiciona o ID do usuário na sessão para fácil acesso
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        // error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development',
}
