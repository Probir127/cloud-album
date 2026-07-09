import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
    if (!req.auth || !req.auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { cloudinaryId, url, thumbnailUrl, type, caption, takenAt, aiTags } =
            await req.json();

        const media = await prisma.media.create({
            data: {
                cloudinaryId,
                url,
                thumbnailUrl,
                type,
                caption,
                aiTags: aiTags || null,
                takenAt: takenAt ? new Date(takenAt) : null,
                uploaderId: req.auth.user.id as string,
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error("Failed to create media:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    try {
        const media = await prisma.media.findMany({
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { uploadedAt: "desc" },
            include: {
                uploader: {
                    select: { name: true, image: true },
                },
                reactions: {
                    select: { emoji: true, userId: true },
                },
                _count: {
                    select: { comments: true },
                },
            },
        });

        const nextCursor =
            media.length === limit ? media[media.length - 1].id : null;

        return NextResponse.json({ media, nextCursor });
    } catch (error) {
        console.error("Failed to fetch media:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
