import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const albums = await prisma.album.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                coverMedia: {
                    select: { thumbnailUrl: true, url: true }
                },
                _count: {
                    select: { media: true }
                }
            }
        });

        return NextResponse.json(albums);
    } catch (error) {
        console.error("Failed to fetch albums:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = auth(async (req) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { name, coverMediaId, isSmartAlbum, smartCriteria } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const album = await prisma.album.create({
            data: {
                name,
                coverMediaId,
                isSmartAlbum: !!isSmartAlbum,
                smartCriteria: smartCriteria || null,
            },
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error("Failed to create album:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
