"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Image as ImageIcon, Plus, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/timeline?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // ⌘K / Ctrl+K keyboard shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!session) return null;

    return (
        <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-white/5">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
                <Link href="/timeline" className="font-outfit text-xl font-bold tracking-tight">
                    Cloud <span className="text-neutral-500">Album</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/timeline"
                        className="hidden text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:block"
                    >
                        Gallery
                    </Link>
                    <Link
                        href="/albums"
                        className="hidden text-sm font-medium text-neutral-400 transition-colors hover:text-white sm:block"
                    >
                        Collections
                    </Link>

                    {/* Search Bar */}
                    <div className="relative hidden w-64 md:block">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search memories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-4 pr-10 text-sm focus:border-white/20 focus:outline-none focus:ring-0 transition-all hover:bg-white/10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-[10px] font-medium text-neutral-500 border border-white/10 rounded px-1.5 py-0.5 bg-black/50">⌘K</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/50 p-1 pr-3 transition-colors hover:bg-neutral-800"
                        >
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="h-7 w-7 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                            <span className="text-xs font-semibold">{session.user?.name?.split(' ')[0]}</span>
                        </button>

                        {isOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-[-1]"
                                    onClick={() => setIsOpen(false)}
                                />
                                <div className="glass absolute right-0 mt-2 w-48 rounded-xl border border-white/10 p-2 shadow-2xl">
                                    <Link
                                        href="/upload"
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Upload Media
                                    </Link>
                                    {session.user?.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-500/10"
                                        >
                                            <Shield className="h-4 w-4" />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => signOut()}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
