const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const getThumbnailUrl = (publicId: string, type: "IMAGE" | "VIDEO") => {
    if (type === "VIDEO") {
        return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/c_fill,w_600,h_800,g_center,f_auto,q_auto:best/${publicId}.jpg`;
    }
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_600,h_800,g_center,f_auto,q_auto:best/${publicId}`;
};

/**
 * Returns a high-quality, optimized URL for full-screen viewing.
 * Uses 'q_auto:best' for maximum visual fidelity and 'f_auto' for the best format.
 */
export const getOptimizedUrl = (publicId: string, type: "IMAGE" | "VIDEO") => {
    const resourceType = type === "VIDEO" ? "video" : "image";
    return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/f_auto,q_auto:best/${publicId}`;
};
