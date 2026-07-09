import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Timeline from "@/components/Timeline";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session) return null;

    const album = await prisma.album.findUnique({
        where: { id },
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

    if (!album) notFound();

    const mediaList = album.media.map(am => am.media);

    return (
        <div className="flex flex-col min-h-screen">
            <div className="mx-auto w-full max-w-7xl px-4 pt-24">
                <Link
                    href="/albums"
                    className="transition-all-custom mb-6 inline-flex items-center gap-2 text-neutral-400 hover:text-white"
                >
                    <ChevronLeft className="h-5 w-5" />
                    Back to Collections
                </Link>

                <header className="mb-12">
                    <h1 className="font-outfit text-4xl font-bold tracking-tight">{album.name}</h1>
                    <p className="mt-2 text-neutral-400">
                        {mediaList.length} {mediaList.length === 1 ? 'memory' : 'memories'} in this collection
                    </p>
                </header>
            </div>

            <Timeline
                initialMedia={JSON.parse(JSON.stringify(mediaList))}
                initialCursor={null}
                currentUserId={session.user?.id}
            />
        </div>
    );
}
