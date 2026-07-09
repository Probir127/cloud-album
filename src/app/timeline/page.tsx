import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Timeline from "@/components/Timeline";
import { redirect } from "next/navigation";

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q: query } = await searchParams;
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const where = query ? {
        OR: [
            { caption: { contains: query, mode: "insensitive" } } as any,
            { uploader: { name: { contains: query, mode: "insensitive" } } },
            { aiTags: { path: ["tags"], array_contains: query } },
        ]
    } : {};

    const initialMedia = await prisma.media.findMany({
        where,
        take: 20,
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
        initialMedia.length === 20 ? initialMedia[initialMedia.length - 1].id : null;

    return (
        <div className="flex-1 pt-16">
            <Timeline
                initialMedia={JSON.parse(JSON.stringify(initialMedia))}
                initialCursor={nextCursor}
                currentUserId={session.user?.id}
            />
        </div>
    );
}
