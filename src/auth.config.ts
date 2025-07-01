import { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/admin'

export const authConfig = {
  debug: process.env.NODE_ENV === 'development',
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async authorized({ auth, request }) {
      // Allow public routes
      if (!request.nextUrl.pathname.startsWith('/admin')) {
        return true
      }

      // Protect admin routes
      if (auth?.user?.email) {
        return isAdmin(auth.user.email)
      }

      return false
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isAdmin: isAdmin(session.user?.email),
        },
      }
    },
  },
} satisfies NextAuthConfig
