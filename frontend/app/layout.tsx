import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { PredictionProvider } from "@/context/PredictionContext";
import PredictionDialogSet from "@/components/prediction/PredictionDialog";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "UTI Classification",
    description: "Classify Microscopic Images For UTI Infections",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <PredictionProvider>
                    <Navbar />

                    {children}
                    <Toaster position="top-center" />

                    <PredictionDialogSet />
                </PredictionProvider>

                <div className="w-full grid bg-[var(--dark-lime)] text-xs text-white place-items-center">
                    <div className="p-4">
                        Copyrights @ 2025, all rights reserved.
                    </div>
                </div>
            </body>
        </html>
    );
}
