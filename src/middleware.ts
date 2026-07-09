import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isAuthPage = nextUrl.pathname.startsWith("/login");
    const isPublicPage = nextUrl.pathname === "/";

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/timeline", nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicPage) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
