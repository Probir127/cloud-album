import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import UploadFAB from "@/components/UploadFAB";
import BottomNav from "@/components/BottomNav";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Cloud Album | Family Memories",
  description: "A private, collaborative space for your family's most precious photos and videos.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cloud Album",
  },
  themeColor: "#0d0d0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen font-sans antialiased",
          outfit.variable,
          inter.variable
        )}
      >
        <SessionProvider>
          <Navbar />
          <main className="relative flex min-h-screen flex-col pb-20 md:pb-0">
            {children}
          </main>
          <UploadFAB />
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
