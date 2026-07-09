"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    mediaId: string;
}

export default function CommentSection({ mediaId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchComments();
    }, [mediaId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?mediaId=${mediaId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || sending) return;

        const trimmedText = newComment.trim();

        // Optimistic update
        const optimisticComment: Comment = {
            id: `temp-${Date.now()}`,
            text: trimmedText,
            createdAt: new Date().toISOString(),
            user: { name: "You", image: null },
        };

        setComments((prev) => [optimisticComment, ...prev]);
        setNewComment("");
        setSending(true);

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mediaId, text: trimmedText }),
            });

            if (res.ok) {
                const savedComment = await res.json();
                setComments((prev) =>
                    prev.map((c) => (c.id === optimisticComment.id ? savedComment : c))
                );
            } else {
                // Rollback on failure
                setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
            }
        } catch {
            setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        } finally {
            setSending(false);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="flex h-full flex-col">
            <h3 className="font-outfit mb-4 text-lg font-semibold">
                Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            {/* Comment List */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="py-8 text-center text-sm text-neutral-500">
                        No comments yet. Be the first!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-neutral-800">
                                {comment.user.image ? (
                                    <img
                                        src={comment.user.image}
                                        alt={comment.user.name || ""}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-500">
                                        {comment.user.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-semibold">
                                        {comment.user.name || "Anonymous"}
                                    </span>
                                    <span className="text-[10px] text-neutral-600">
                                        {timeAgo(comment.createdAt)}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-sm text-neutral-300">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-white/5 pt-4">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-700"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || sending}
                    className="transition-all-custom flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-black disabled:opacity-30 hover:bg-neutral-200"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>
        </div>
    );
}
