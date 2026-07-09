import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const PATCH = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
    if (!req.auth || req.auth.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const currentUserId = req.auth.user?.id;

    // Prevent admins from demoting themselves
    if (id === currentUserId) {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    try {
        const { role } = await req.json();
        const validRoles = ["ADMIN", "MEMBER", "GUEST"];

        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, role: true },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Failed to update user role:", error);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
});
