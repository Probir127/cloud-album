"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Users, Link2, Copy, Check, Trash2, Shield,
    UserCircle, RefreshCw, Loader2, Plus
} from "lucide-react";

const ROLES = ["ADMIN", "MEMBER", "GUEST"] as const;
type Role = typeof ROLES[number];

function roleBadgeClass(role: string) {
    if (role === "ADMIN") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (role === "MEMBER") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
}

export default function AdminPanel({
    users,
    invites,
    currentUserId,
}: {
    users: any[];
    invites: any[];
    currentUserId: string | undefined;
}) {
    const [activeTab, setActiveTab] = useState<"users" | "invites">("users");
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isCreatingInvite, setIsCreatingInvite] = useState(false);
    const [newInviteRole, setNewInviteRole] = useState<Role>("MEMBER");
    const [localInvites, setLocalInvites] = useState(invites);
    const [localUsers, setLocalUsers] = useState(users);
    const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
    const router = useRouter();

    const handleRoleChange = async (userId: string, newRole: Role) => {
        setUpdatingUserId(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (res.ok) {
                setLocalUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
                );
            }
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleCreateInvite = async () => {
        setIsCreatingInvite(true);
        try {
            const res = await fetch("/api/admin/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newInviteRole }),
            });
            if (res.ok) {
                const invite = await res.json();
                setLocalInvites((prev) => [invite, ...prev]);
            }
        } finally {
            setIsCreatingInvite(false);
        }
    };

    const handleDeleteInvite = async (id: string) => {
        setDeletingInviteId(id);
        try {
            const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
            if (res.ok) {
                setLocalInvites((prev) => prev.filter((i) => i.id !== id));
            }
        } finally {
            setDeletingInviteId(null);
        }
    };

    const copyInviteLink = (code: string) => {
        const url = `${window.location.origin}/login?invite=${code}`;
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div>
            {/* Tabs */}
            <div className="mb-8 flex gap-1 rounded-xl bg-white/5 p-1 w-fit">
                {(["users", "invites"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${activeTab === tab
                            ? "bg-white text-black"
                            : "text-neutral-400 hover:text-white"
                            }`}
                    >
                        {tab === "users" ? <Users className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                        {tab} {tab === "users" ? `(${localUsers.length})` : `(${localInvites.length})`}
                    </button>
                ))}
            </div>

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="space-y-3">
                    {localUsers.map((user) => (
                        <div
                            key={user.id}
                            className="glass flex items-center gap-4 rounded-2xl border border-white/5 p-4"
                        >
                            {user.image ? (
                                <img src={user.image} alt={user.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-800">
                                    <UserCircle className="h-6 w-6 text-neutral-500" />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate font-semibold">{user.name || "Unnamed"}</p>
                                    {user.id === currentUserId && (
                                        <span className="text-xs text-neutral-500">(you)</span>
                                    )}
                                </div>
                                <p className="truncate text-xs text-neutral-500">{user.email}</p>
                                <p className="text-xs text-neutral-600 mt-0.5">
                                    {user._count.media} uploads · {user._count.comments} comments
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {updatingUserId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                                ) : (
                                    <select
                                        value={user.role}
                                        disabled={user.id === currentUserId}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                                        className={`rounded-lg border px-2 py-1 text-xs font-semibold bg-transparent transition-all ${roleBadgeClass(user.role)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {ROLES.map((r) => (
                                            <option key={r} value={r} className="bg-neutral-900 text-white">
                                                {r}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Invites Tab */}
            {activeTab === "invites" && (
                <div>
                    {/* Create Invite */}
                    <div className="glass mb-6 flex items-center gap-3 rounded-2xl border border-white/5 p-4">
                        <Shield className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                        <p className="text-sm text-neutral-400 flex-1">Generate a new invite link</p>
                        <select
                            value={newInviteRole}
                            onChange={(e) => setNewInviteRole(e.target.value as Role)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:outline-none"
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r} className="bg-neutral-900">{r}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCreateInvite}
                            disabled={isCreatingInvite}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 disabled:opacity-50 transition-all"
                        >
                            {isCreatingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Create Link
                        </button>
                    </div>

                    {localInvites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-800 py-16 text-center">
                            <Link2 className="mb-4 h-10 w-10 text-neutral-700" />
                            <p className="font-semibold text-neutral-500">No invite links yet</p>
                            <p className="mt-1 text-sm text-neutral-600">Create one above to invite family members.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {localInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="glass flex items-center gap-3 rounded-2xl border border-white/5 p-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <code className="block truncate rounded-lg bg-white/5 px-3 py-1.5 text-xs text-neutral-300 font-mono">
                                            {`${typeof window !== "undefined" ? window.location.origin : ""}/login?invite=${invite.code}`}
                                        </code>
                                        <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-500">
                                            <span className={`rounded px-1.5 py-0.5 border text-[10px] font-semibold ${roleBadgeClass(invite.role)}`}>
                                                {invite.role}
                                            </span>
                                            <span>Created {new Date(invite.createdAt).toLocaleDateString()}</span>
                                            {invite.expiresAt && (
                                                <span className="text-amber-500">
                                                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => copyInviteLink(invite.code)}
                                            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-neutral-300 transition-all hover:bg-white/10"
                                        >
                                            {copiedCode === invite.code ? (
                                                <Check className="h-3.5 w-3.5 text-green-400" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                            {copiedCode === invite.code ? "Copied!" : "Copy"}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteInvite(invite.id)}
                                            disabled={deletingInviteId === invite.id}
                                            className="rounded-lg border border-red-800/50 px-3 py-2 text-xs text-red-400 transition-all hover:bg-red-900/20 disabled:opacity-50"
                                        >
                                            {deletingInviteId === invite.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
