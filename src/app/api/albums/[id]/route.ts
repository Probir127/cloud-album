import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = auth(async (req, { params }) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;

        const album = await prisma.album.findUnique({
            where: { id: id as string },
            include: {
                media: {
                    include: {
                        media: {
                            include: {
                                uploader: {
                                    select: { name: true, image: true }
                                },
                                reactions: {
                                    select: { emoji: true, userId: true }
                                },
                                _count: {
                                    select: { comments: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!album) {
            return NextResponse.json({ error: "Album not found" }, { status: 404 });
        }

        // Flatten the media structure for the frontend
        const flatMedia = album.media.map(am => am.media);

        return NextResponse.json({ ...album, media: flatMedia });
    } catch (error) {
        console.error("Failed to fetch album details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const POST = auth(async (req, { params }) => {
    if (!req.auth) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: albumId } = await params;
        const { mediaId } = await req.json();

        if (!mediaId) {
            return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
        }

        const albumMedia = await prisma.albumMedia.create({
            data: {
                albumId: albumId as string,
                mediaId: mediaId as string,
            }
        });

        return NextResponse.json(albumMedia);
    } catch (error) {
        console.error("Failed to add media to album:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
