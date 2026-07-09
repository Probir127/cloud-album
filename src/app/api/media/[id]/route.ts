import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary-server";
import { NextResponse } from "next/server";

export const DELETE = auth(async (req, { params }) => {
    if (!req.auth || !req.auth.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const media = await prisma.media.findUnique({
            where: { id },
        });

        if (!media) {
            return NextResponse.json({ error: "Media not found" }, { status: 404 });
        }

        // Permission check: only admin or uploader
        // Note: Using 'any' for role check as types might be out of sync in some environments
        const userRole = (req.auth.user as any).role;
        const isAdmin = userRole === "ADMIN";
        const isUploader = media.uploaderId === req.auth.user.id;

        if (!isAdmin && !isUploader) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Delete from Cloudinary
        // For videos, we need to specify resource_type if it's not default 'image'
        await cloudinary.uploader.destroy(media.cloudinaryId, {
            resource_type: media.type === "VIDEO" ? "video" : "image"
        });

        // 2. Delete from Database
        await prisma.media.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Memory deleted permanently" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
});
