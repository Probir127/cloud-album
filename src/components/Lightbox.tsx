"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, User, Trash2, Download } from "lucide-react";
import Image from "next/image";
import CommentSection from "./CommentSection";
import ReactionBar from "./ReactionBar";
import { getOptimizedUrl } from "@/lib/cloudinary";

interface LightboxProps {
    mediaId: string;
    allMedia: any[];
    onClose: () => void;
    onDelete?: (id: string) => void;
    currentUserId: string | undefined;
}

export default function Lightbox({ mediaId, allMedia, onClose, onDelete, currentUserId }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(
        allMedia.findIndex((m) => m.id === mediaId)
    );
    const [showInfo, setShowInfo] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    const currentMedia = allMedia[currentIndex];

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/media/${currentMedia.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                if (onDelete) {
                    onDelete(currentMedia.id);
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);

        try {
            const url = currentMedia.type === "IMAGE"
                ? getOptimizedUrl(currentMedia.cloudinaryId, "IMAGE")
                : currentMedia.url;

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            const ext = currentMedia.type === "VIDEO" ? "mp4" : "jpg";
            link.download = `memory-${currentMedia.id}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev < allMedia.length - 1 ? prev + 1 : prev));
    }, [allMedia.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, handlePrev, handleNext]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDy > absDx && dy > 80) {
            // Swipe down to close
            onClose();
        } else if (absDx > absDy && absDx > 50) {
            // Swipe left/right to navigate
            if (dx < 0) handleNext();
            else handlePrev();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    // Lock body scroll when lightbox is open
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    if (!currentMedia) return null;

    return (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                onClick={onClose}
            />

            <div
                className="relative flex h-full w-full flex-col lg:flex-row"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Main Content Area */}
                <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 lg:p-12">
                    {/* Controls */}
                    <button
                        onClick={onClose}
                        className="transition-all-custom absolute right-6 top-6 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {currentIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="transition-all-custom absolute left-6 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-white/20"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {currentIndex < allMedia.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="transition-all-custom absolute right-6 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-white/20"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}

                    {/* Media Display */}
                    <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-xl">
                        {currentMedia.type === "IMAGE" ? (
                            <Image
                                src={getOptimizedUrl(currentMedia.cloudinaryId, "IMAGE")}
                                alt={currentMedia.caption || ""}
                                fill
                                className="object-contain"
                                priority
                            />
                        ) : (
                            <video
                                src={currentMedia.url}
                                controls
                                autoPlay
                                className="h-full w-full object-contain"
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar (Comments/Info) */}
                <div className="glass h-full w-full border-l border-white/10 p-6 lg:max-w-md">
                    <div className="flex flex-col h-full">
                        <div className="mb-8 flex items-start justify-between">
                            <div>
                                <h2 className="font-outfit text-2xl font-bold">Details</h2>
                                <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        <span>{currentMedia.uploader?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(currentMedia.takenAt || currentMedia.uploadedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentMedia.caption && (
                            <p className="mb-8 text-neutral-200">{currentMedia.caption}</p>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            <ReactionBar
                                mediaId={currentMedia.id}
                                initialReactions={currentMedia.reactions || []}
                                currentUserId={currentUserId}
                            />
                            <CommentSection mediaId={currentMedia.id} />
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-2 pt-6 border-t border-white/5 space-y-4">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="transition-all-custom w-full rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200 disabled:opacity-50"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                                    {isDownloading ? "Downloading..." : "Download Memory"}
                                </div>
                            </button>

                            {(currentUserId === currentMedia.uploaderId) && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className={`transition-all-custom w-full rounded-xl px-6 py-3 font-semibold text-white border border-white/10 ${confirmDelete ? "bg-red-600 hover:bg-red-700" : "bg-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Trash2 className={`h-4 w-4 ${isDeleting ? "animate-pulse" : ""}`} />
                                        {isDeleting ? "Deleting..." : confirmDelete ? "Confirm Permanent Delete" : "Permanent Delete"}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
