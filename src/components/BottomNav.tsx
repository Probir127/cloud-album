"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Images, LayoutGrid, User as UserIcon, Shield } from "lucide-react";
import { useState } from "react";
import UploadDrawer from "./UploadDrawer";

export default function BottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [uploadOpen, setUploadOpen] = useState(false);

    if (!session) return null;

    const navItems = [
        {
            label: "Timeline",
            href: "/timeline",
            icon: Images,
        },
        {
            label: "Albums",
            href: "/albums",
            icon: LayoutGrid,
        },
    ];

    return (
        <>
            {/* Bottom Nav — mobile only */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
                {/* Blurred glass background */}
                <div className="glass border-t border-white/5">
                    <div className="flex items-center justify-around px-2 pb-safe">
                        {navItems.map(({ label, href, icon: Icon }) => {
                            const isActive = pathname === href || pathname.startsWith(href + "/");
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex flex-1 flex-col items-center gap-1 py-3 transition-all"
                                >
                                    <Icon
                                        className={`h-6 w-6 transition-all ${isActive ? "text-white" : "text-neutral-500"
                                            }`}
                                    />
                                    <span
                                        className={`text-[10px] font-medium transition-all ${isActive ? "text-white" : "text-neutral-500"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                    {isActive && (
                                        <span className="absolute top-0 h-0.5 w-8 rounded-full bg-white" />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Upload — center action button */}
                        <button
                            onClick={() => setUploadOpen(true)}
                            className="relative flex flex-col items-center gap-1 py-3 flex-1 transition-all"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg shadow-white/20 transition-all active:scale-95">
                                <Camera className="h-5 w-5 text-black" />
                            </div>
                        </button>

                        {/* Profile */}
                        <Link
                            href={session.user?.role === "ADMIN" ? "/admin" : "/timeline"}
                            className="flex flex-1 flex-col items-center gap-1 py-3 transition-all"
                        >
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || ""}
                                    className={`h-6 w-6 rounded-full object-cover ring-2 transition-all ${pathname === "/admin" ? "ring-white" : "ring-transparent"}`}
                                />
                            ) : (
                                <UserIcon
                                    className={`h-6 w-6 transition-all ${pathname === "/admin" ? "text-white" : "text-neutral-500"}`}
                                />
                            )}
                            <span className={`text-[10px] font-medium transition-all ${pathname === "/admin" ? "text-white" : "text-neutral-500"}`}>
                                {session.user?.role === "ADMIN" ? "Admin" : "Profile"}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            <UploadDrawer isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
        </>
    );
}
