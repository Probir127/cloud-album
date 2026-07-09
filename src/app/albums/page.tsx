import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import CreateAlbumModal from "@/components/CreateAlbumModal";

export default async function AlbumsPage() {
    const session = await auth();
    if (!session) return null;

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

    // Extract smart collections (AI tags)
    const allMedia = await prisma.media.findMany({
        where: { aiTags: { not: Prisma.AnyNull } },
        select: { aiTags: true, thumbnailUrl: true, url: true }
    });

    const tagCounts: { [key: string]: { count: number; cover: string } } = {};
    allMedia.forEach((m: any) => {
        const tags = m.aiTags?.tags || [];
        tags.forEach((tag: string) => {
            if (!tagCounts[tag]) tagCounts[tag] = { count: 0, cover: m.thumbnailUrl || m.url };
            tagCounts[tag].count++;
        });
    });

    const smartCollections = Object.entries(tagCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8); // Top 8 tags

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-24">
            <header className="mb-12 flex items-end justify-between">
                <div>
                    <h1 className="font-outfit text-4xl font-bold tracking-tight">Gallery</h1>
                    <p className="mt-2 text-neutral-400">Your memories, intelligently organized.</p>
                </div>
                <CreateAlbumModal />
            </header>

            {/* Smart Collections Section */}
            {smartCollections.length > 0 && (
                <section className="mb-16">
                    <h2 className="font-outfit mb-6 text-xl font-bold text-neutral-400 uppercase tracking-widest text-sm">Smart Collections</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                        {smartCollections.map(([tag, data]) => (
                            <Link
                                key={tag}
                                href={`/timeline?q=${encodeURIComponent(tag)}`}
                                className="transition-all-custom group flex flex-col items-center gap-3"
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-full bg-neutral-900 border-2 border-transparent group-hover:border-white/20">
                                    <Image
                                        src={data.cover}
                                        alt={tag}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold capitalize">{tag}</p>
                                    <p className="text-[10px] text-neutral-500">{data.count} items</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Manual Albums Section */}
            <section>
                <h2 className="font-outfit mb-6 text-xl font-bold text-neutral-400 uppercase tracking-widest text-sm">Manual Albums</h2>
                {albums.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-900/50 py-24 text-center">
                        <ImageIcon className="mb-4 h-12 w-12 text-neutral-600" />
                        <h3 className="text-xl font-semibold opacity-80">No manual albums</h3>
                        <p className="mt-2 text-neutral-500 text-sm">Create collections to group specific memories.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {albums.map((album) => (
                            <Link
                                key={album.id}
                                href={`/albums/${album.id}`}
                                className="transition-all-custom group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900"
                            >
                                {album.coverMedia ? (
                                    <Image
                                        src={album.coverMedia.thumbnailUrl || album.coverMedia.url}
                                        alt={album.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-neutral-700">
                                        <ImageIcon className="h-12 w-12 transition-colors group-hover:text-neutral-500" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <h3 className="font-outfit text-xl font-bold text-white">{album.name}</h3>
                                    <p className="mt-1 text-sm text-neutral-300">
                                        {album._count.media} {album._count.media === 1 ? 'memory' : 'memories'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
