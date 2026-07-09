"use client";

import { useState } from "react";
import { FolderPlus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateAlbumModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/albums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (res.ok) {
                setName("");
                setIsOpen(false);
                router.refresh();
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.error || "Failed to create album.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="transition-all-custom flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
            >
                <FolderPlus className="h-5 w-5" />
                New Album
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="glass relative w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="font-outfit text-2xl font-bold">New Album</h2>
                            <p className="mt-1 text-sm text-neutral-400">
                                Give your collection a name to get started.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="e.g. Summer 2024, Birthday Party…"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                    maxLength={60}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none transition-all"
                                />
                                <p className="mt-1 text-right text-xs text-neutral-600">
                                    {name.length}/60
                                </p>
                            </div>

                            {error && (
                                <p className="rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-neutral-400 transition-colors hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || isLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-40"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FolderPlus className="h-4 w-4" />
                                    )}
                                    {isLoading ? "Creating…" : "Create Album"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
