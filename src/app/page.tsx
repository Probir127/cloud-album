import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Camera, Share2, Shield, Users } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/timeline");
  }

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative flex h-[85vh] flex-col items-center justify-center px-4 text-center">
        <div className="absolute inset-0 z-[-1] overflow-hidden opacity-20">
          <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-white/20 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] h-64 w-64 rounded-full bg-neutral-500/20 blur-[100px]" />
        </div>

        <h1 className="font-outfit animate-in fade-in slide-in-from-bottom-4 duration-1000 text-6xl font-bold tracking-tight sm:text-7xl">
          Precious memories, <br />
          <span className="text-neutral-500">beautifully shared.</span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-1000 mt-8 max-w-2xl text-lg text-neutral-400">
          A private, collaborative space for your family's most cherished photos and videos.
          Store, organize, and relive Childhood milestones together.
        </p>

        <Link
          href="/login"
          className="transition-all-custom animate-in fade-in slide-in-from-bottom-4 delay-500 duration-1000 mt-12 group flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-black hover:bg-neutral-200"
        >
          Start Collecting
          <Camera className="h-5 w-5 transition-transform group-hover:rotate-12" />
        </Link>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass-card rounded-2xl p-8">
            <Shield className="mb-4 h-8 w-8 text-neutral-300" />
            <h3 className="mb-2 text-xl font-bold">Private & Secure</h3>
            <p className="text-neutral-400">Invite-only access ensures your family memories stay within the family.</p>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <Users className="mb-4 h-8 w-8 text-neutral-300" />
            <h3 className="mb-2 text-xl font-bold">Collaborative</h3>
            <p className="text-neutral-400">Everyone invited can contribute their photos and videos from any device.</p>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <Share2 className="mb-4 h-8 w-8 text-neutral-300" />
            <h3 className="mb-2 text-xl font-bold">Interactive</h3>
            <p className="text-neutral-400">React and comment on memories to share the love across generations.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-neutral-600">
        <p className="text-sm font-medium">Built for family, by family.</p>
      </footer>
    </div>
  );
}
