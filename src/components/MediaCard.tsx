"use client";

import Image from "next/image";
import { MessageSquare, Play, Calendar, User } from "lucide-react";
import { clsx } from "clsx";
import { getThumbnailUrl } from "@/lib/cloudinary";

interface MediaCardProps {
    media: {
        id: string;
        cloudinaryId: string;
        url: string;
        thumbnailUrl: string;
        type: "IMAGE" | "VIDEO";
        caption?: string | null;
        takenAt?: Date | string | null;
        uploader: {
            name?: string | null;
            image?: string | null;
        };
        _count: {
            comments: number;
        };
    };
    onClick: (id: string) => void;
}

export default function MediaCard({ media, onClick }: MediaCardProps) {
    const isVideo = media.type === "VIDEO";

    return (
        <div
            onClick={() => onClick(media.id)}
            className="group transition-all-custom relative cursor-pointer overflow-hidden rounded-xl bg-neutral-900"
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                    src={getThumbnailUrl(media.cloudinaryId, media.type)}
                    alt={media.caption || "Family Memory"}
                    fill
                    className="transition-all-custom object-cover group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {isVideo && (
                    <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                        <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                )}

                {/* Overlay */}
                <div className="transition-all-custom absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 group-hover:opacity-100">
                    {media.caption && (
                        <p className="mb-2 line-clamp-2 text-sm font-medium text-white">
                            {media.caption}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-neutral-300">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[80px]">
                                    {media.uploader?.name || "Family"}
                                </span>
                            </div>
                            {media.takenAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {new Date(media.takenAt).toLocaleDateString(undefined, {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{media._count.comments}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
