"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function UploadPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
            takenAt: info.original_filename?.includes("IMG_") ? new Date() : null,
        };

        try {
            const response = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mediaData),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => router.push("/timeline"), 1500);
            } else {
                const data = await response.json().catch(() => null);
                setError(data?.error || "Failed to save media. Please try again.");
            }
        } catch (error) {
            console.error("Error saving media:", error);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="glass-card w-full max-w-xl rounded-2xl p-12 text-center">
                <h1 className="font-outfit mb-2 text-3xl font-bold">Upload Memories</h1>
                <p className="text-muted-foreground mb-12">
                    Share your favorite photos and videos with the family.
                </p>

                {/* Error Alert */}
                {error && (
                    <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-left">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                        <div>
                            <p className="text-sm font-medium text-red-300">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-1 text-xs text-red-400 underline hover:text-red-300"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-amber-800/50 bg-amber-900/10 py-16 px-8">
                        <Upload className="h-12 w-12 text-amber-500/70" />
                        <p className="text-amber-400 font-semibold">Cloudinary Not Configured</p>
                        <p className="text-sm text-neutral-400 text-center max-w-sm">
                            Add <code className="text-amber-300">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code className="text-amber-300">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to your .env file to enable uploads.
                        </p>
                    </div>
                ) : !isSuccess ? (
                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={handleUploadSuccess}
                        onUpload={() => setIsUploading(true)}
                        options={{
                            maxFiles: 1,
                            resourceType: "auto",
                            clientAllowedFormats: ["png", "jpeg", "webp", "mp4", "mov"],
                        }}
                    >
                        {({ open }) => (
                            <button
                                onClick={() => open()}
                                disabled={isUploading}
                                className="transition-all-custom group flex w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-900/50 py-16 hover:border-neutral-600 hover:bg-neutral-900"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-12 w-12 animate-spin text-neutral-400" />
                                ) : (
                                    <Upload className="h-12 w-12 text-neutral-400 group-hover:text-white" />
                                )}
                                <span className="text-neutral-400 group-hover:text-white">
                                    {isUploading ? "Uploading..." : "Click to upload photos or videos"}
                                </span>
                                <span className="text-xs text-neutral-600">
                                    Max 50MB per file • Videos up to 5 min
                                </span>
                            </button>
                        )}
                    </CldUploadWidget>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-xl font-semibold">Upload Complete!</p>
                        <p className="text-muted-foreground">Redirecting to timeline...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
