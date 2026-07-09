import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const DELETE = auth(async (req, { params }: { params: Promise<{ id: string }> }) => {
    if (!req.auth || req.auth.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    try {
        await prisma.invite.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete invite:", error);
        return NextResponse.json({ error: "Not found or already deleted" }, { status: 404 });
    }
});
