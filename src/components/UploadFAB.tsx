"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function UploadFAB() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <Link
            href="/upload"
            className="transition-all-custom fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl shadow-white/20 hover:scale-110 active:scale-95"
        >
            <Plus className="h-6 w-6" />
        </Link>
    );
}
