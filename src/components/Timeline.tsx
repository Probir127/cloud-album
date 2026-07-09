"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import MediaCard from "./MediaCard";
import Lightbox from "./Lightbox";
import { Loader2 } from "lucide-react";

interface TimelineProps {
    initialMedia: any[];
    initialCursor: string | null;
    currentUserId: string | undefined;
}

export default function Timeline({ initialMedia, initialCursor, currentUserId }: TimelineProps) {
    const [media, setMedia] = useState(initialMedia);
    const [cursor, setCursor] = useState(initialCursor);
    const [loading, setLoading] = useState(false);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

    const observerTarget = useRef(null);
    const cursorRef = useRef(cursor);
    const loadingRef = useRef(loading);

    // Keep refs in sync with state
    cursorRef.current = cursor;
    loadingRef.current = loading;

    const fetchMore = useCallback(async () => {
        if (loadingRef.current || !cursorRef.current) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/media?cursor=${cursorRef.current}&limit=20`);
            const data = await res.json();
            setMedia((prev) => [...prev, ...data.media]);
            setCursor(data.nextCursor);
        } catch (error) {
            console.error("Failed to load more media:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchMore]);

    // Group media by month/year
    const groupedMedia: { [key: string]: any[] } = media.reduce((acc, item) => {
        const date = new Date(item.takenAt || item.uploadedAt);
        const key = date.toLocaleString("default", { month: "long", year: "numeric" });
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as any);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
            {Object.entries(groupedMedia).map(([monthYear, items]) => (
                <section key={monthYear} className="mb-12">
                    <header className="sticky top-16 z-10 mb-6 bg-background/80 py-2 backdrop-blur-md">
                        <h2 className="font-outfit text-xl font-bold tracking-tight text-neutral-400">
                            {monthYear}
                        </h2>
                    </header>

                    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
                        {items.map((item) => (
                            <div key={item.id} className="mb-6 break-inside-avoid">
                                <MediaCard
                                    media={item}
                                    onClick={(id) => setSelectedMediaId(id)}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* Empty State */}
            {media.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-900 border-2 border-dashed border-neutral-700">
                        <svg className="h-10 w-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="font-outfit text-2xl font-bold">No memories yet</h3>
                    <p className="mt-2 max-w-sm text-neutral-500">
                        Start collecting your family's precious moments. Upload your first photo or video to get started.
                    </p>
                    <a
                        href="/upload"
                        className="mt-8 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-neutral-200"
                    >
                        Upload First Memory
                    </a>
                </div>
            )}

            {/* Infinite Scroll Loader */}
            <div ref={observerTarget} className="flex h-32 items-center justify-center">
                {loading && <Loader2 className="h-8 w-8 animate-spin text-neutral-600" />}
            </div>


            {/* Lightbox Modal */}
            {selectedMediaId && (
                <Lightbox
                    mediaId={selectedMediaId}
                    allMedia={media}
                    onClose={() => setSelectedMediaId(null)}
                    onDelete={(id) => {
                        setMedia((prev) => prev.filter((m) => m.id !== id));
                        setSelectedMediaId(null);
                    }}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}
