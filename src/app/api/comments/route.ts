import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId) {
        return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { mediaId },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { name: true, image: true },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Failed to fetch comments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = auth(async (req) => {
    if (!req.auth || !req.auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { mediaId, text } = await req.json();

        if (!mediaId || !text?.trim()) {
            return NextResponse.json({ error: "mediaId and text are required" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                text: text.trim(),
                mediaId,
                userId: req.auth.user.id as string,
            },
            include: {
                user: {
                    select: { name: true, image: true },
                },
            },
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("Failed to create comment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
