import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { mediaId, emoji } = await req.json();

        if (!mediaId || !emoji) {
            return NextResponse.json({ error: "Missing mediaId or emoji" }, { status: 400 });
        }

        const userId = req.auth.user?.id;
        if (!userId) return NextResponse.json({ error: "User ID not found" }, { status: 401 });

        // Try to find an existing reaction
        const existing = await prisma.reaction.findUnique({
            where: {
                mediaId_userId_emoji: {
                    mediaId,
                    userId,
                    emoji,
                },
            },
        });

        if (existing) {
            // Toggle off: Delete reaction
            await prisma.reaction.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ status: "removed" });
        } else {
            // Toggle on: Create reaction
            await prisma.reaction.create({
                data: {
                    mediaId,
                    userId,
                    emoji,
                },
            });
            return NextResponse.json({ status: "added" });
        }
    } catch (error) {
        console.error("Reaction error:", error);
        return NextResponse.json({ error: "Failed to process reaction" }, { status: 500 });
    }
});
