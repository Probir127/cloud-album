import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Prisma, no Node.js modules)
export default {
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
