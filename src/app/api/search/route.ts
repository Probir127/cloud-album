import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ media: [] });
        }

        const limit = parseInt(searchParams.get("limit") || "50");

        const media = await prisma.media.findMany({
            where: {
                OR: [
                    { caption: { contains: query, mode: "insensitive" } },
                    { aiTags: { path: ["tags"], array_contains: query } }, // JSON search
                    { uploader: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            take: limit,
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
            orderBy: { uploadedAt: "desc" },
        });

        return NextResponse.json({ media });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
