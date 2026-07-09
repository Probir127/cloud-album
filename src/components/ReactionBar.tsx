"use client";

import { useState } from "react";
import { Smile } from "lucide-react";

interface Reaction {
    emoji: string;
    userId: string;
}

interface ReactionBarProps {
    mediaId: string;
    initialReactions: Reaction[];
    currentUserId: string | undefined;
}

const COMMON_EMOJIS = ["❤️", "😂", "😍", "🥺", "🎉", "🔥"];

export default function ReactionBar({ mediaId, initialReactions, currentUserId }: ReactionBarProps) {
    const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
    const [isLoading, setIsLoading] = useState(false);

    const toggleReaction = async (emoji: string) => {
        if (!currentUserId || isLoading) return;

        setIsLoading(true);

        // Optimistic UI
        const isActive = reactions.some(r => r.emoji === emoji && r.userId === currentUserId);
        if (isActive) {
            setReactions(prev => prev.filter(r => !(r.emoji === emoji && r.userId === currentUserId)));
        } else {
            setReactions(prev => [...prev, { emoji, userId: currentUserId }]);
        }

        try {
            const res = await fetch("/api/reactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mediaId, emoji }),
            });
            if (!res.ok) throw new Error("Failed to toggle reaction");
        } catch (error) {
            console.error(error);
            // Revert on error
            setReactions(initialReactions);
        } finally {
            setIsLoading(false);
        }
    };

    const getReactionCount = (emoji: string) => reactions.filter(r => r.emoji === emoji).length;
    const isEmojiActive = (emoji: string) => reactions.some(r => r.emoji === emoji && r.userId === currentUserId);

    return (
        <div className="flex flex-wrap gap-2 py-4">
            {COMMON_EMOJIS.map(emoji => {
                const count = getReactionCount(emoji);
                const active = isEmojiActive(emoji);

                return (
                    <button
                        key={emoji}
                        onClick={() => toggleReaction(emoji)}
                        disabled={!currentUserId || isLoading}
                        className={`transition-all-custom flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border ${active
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/5 border-transparent text-neutral-400 hover:bg-white/10"
                            }`}
                    >
                        <span>{emoji}</span>
                        {count > 0 && <span>{count}</span>}
                    </button>
                );
            })}

            {!currentUserId && (
                <p className="text-xs text-neutral-500 mt-1">Login to react</p>
            )}
        </div>
    );
}
