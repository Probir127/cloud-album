"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface UploadDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadDrawer({ isOpen, onClose }: UploadDrawerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Reset state when drawer opens
    useEffect(() => {
        if (isOpen) {
            setIsSuccess(false);
            setError(null);
            setIsUploading(false);
        }
    }, [isOpen]);

    // Lock body scroll while drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const handleUploadSuccess = async (result: any) => {
        const info = result.info;
        setError(null);

        const mediaData = {
            cloudinaryId: info.public_id,
            url: info.secure_url,
            thumbnailUrl: info.thumbnail_url || info.secure_url,
            type: info.resource_type === "video" ? "VIDEO" : "IMAGE",
            caption: "",
            aiTags: info.tags ? { tags: info.tags } : null,
            takenAt: null,
        };

        try {
            const response = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mediaData),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    router.refresh();
                }, 1200);
            } else {
                const data = await response.json().catch(() => null);
                setError(data?.error || "Failed to save. Please try again.");
            }
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Drawer — slides up from bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-[70] animate-in slide-in-from-bottom duration-300">
                <div className="glass rounded-t-3xl border-t border-white/10 px-6 pb-10 pt-4">
                    {/* Handle */}
                    <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/20" />

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-outfit text-xl font-bold">Upload Memory</h2>
                            <p className="text-sm text-neutral-500">Share a photo or video with family</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-400 transition-colors hover:bg-white/20 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Content */}
                    {isSuccess ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <CheckCircle2 className="h-14 w-14 text-green-500" />
                            <p className="font-semibold text-lg">Uploaded!</p>
                            <p className="text-sm text-neutral-500">Refreshing your timeline…</p>
                        </div>
                    ) : !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-amber-800/50 bg-amber-900/10 py-10 text-center">
                            <Upload className="h-8 w-8 text-amber-500/70" />
                            <p className="text-sm text-amber-400 font-semibold">Cloudinary not configured</p>
                        </div>
                    ) : (
                        <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={handleUploadSuccess}
                            onUpload={() => setIsUploading(true)}
                            options={{
                                maxFiles: 1,
                                resourceType: "auto",
                                clientAllowedFormats: ["png", "jpeg", "webp", "mp4", "mov"],
                                sources: ["local", "camera"],
                            }}
                        >
                            {({ open }) => (
                                <button
                                    onClick={() => open()}
                                    disabled={isUploading}
                                    className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/50 py-12 transition-all hover:border-neutral-500 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-10 w-10 animate-spin text-neutral-400" />
                                    ) : (
                                        <Upload className="h-10 w-10 text-neutral-400" />
                                    )}
                                    <div className="text-center">
                                        <p className="font-semibold text-neutral-300">
                                            {isUploading ? "Uploading…" : "Tap to choose photo or video"}
                                        </p>
                                        <p className="mt-1 text-xs text-neutral-600">
                                            Max 50MB · PNG, JPG, WEBP, MP4, MOV
                                        </p>
                                    </div>
                                </button>
                            )}
                        </CldUploadWidget>
                    )}
                </div>
            </div>
        </>
    );
}
