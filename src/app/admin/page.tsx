import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
    const session = await auth();

    if (!session) redirect("/login");
    if (session.user?.role !== "ADMIN") redirect("/timeline");

    const [users, invites] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                _count: { select: { media: true, comments: true } },
            },
        }),
        prisma.invite.findMany({
            orderBy: { createdAt: "desc" },
        }),
    ]);

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-24">
            <header className="mb-12">
                <h1 className="font-outfit text-4xl font-bold tracking-tight">Admin Panel</h1>
                <p className="mt-2 text-neutral-400">Manage users, roles, and invite codes.</p>
            </header>
            <AdminPanel
                users={JSON.parse(JSON.stringify(users))}
                invites={JSON.parse(JSON.stringify(invites))}
                currentUserId={session.user?.id}
            />
        </div>
    );
}
