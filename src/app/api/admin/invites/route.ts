import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const POST = auth(async (req) => {
    if (!req.auth || req.auth.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { role, email, expiresInDays } = await req.json();

        const validRoles = ["ADMIN", "MEMBER", "GUEST"];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const expiresAt = expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
            : null;

        const invite = await prisma.invite.create({
            data: {
                code: nanoid(12),
                email: email || null,
                role: role || "MEMBER",
                expiresAt,
            },
        });

        return NextResponse.json(invite);
    } catch (error) {
        console.error("Failed to create invite:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const GET = auth(async (req) => {
    if (!req.auth || req.auth.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invites = await prisma.invite.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(invites);
});
