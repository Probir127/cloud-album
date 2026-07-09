import { signIn } from "@/auth";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="glass-card w-full max-w-md space-y-8 rounded-2xl p-8 text-center">
                <div className="space-y-2">
                    <h1 className="font-outfit text-4xl font-bold tracking-tight">
                        Cloud Album
                    </h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">
                        Family Memories
                    </p>
                </div>

                <div className="py-8">
                    <p className="text-muted-foreground mb-8 text-sm">
                        A private, collaborative space for your family's most precious
                        photos and videos.
                    </p>

                    <form
                        action={async () => {
                            "use server";
                            await signIn("google", { redirectTo: "/timeline" });
                        }}
                    >
                        <button
                            type="submit"
                            className="transition-all-custom flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-3 font-semibold text-black hover:bg-neutral-200"
                        >
                            <LogIn className="h-5 w-5" />
                            Sign in with Google
                        </button>
                    </form>
                </div>

                <p className="text-muted-foreground text-xs">
                    By signing in, you agree to our private family collection terms.
                </p>
            </div>
        </div>
    );
}
