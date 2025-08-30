"use client";

import { SendCard } from "@/components/custom/SendCard";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GradientBlinds from "@/components/GradientBlinds";

export default function SendPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0B0F]">
            {/* GradientBlinds Background */}
            <div className="fixed inset-0 z-0 transition-all duration-500 hover:opacity-70">
                <GradientBlinds
                    gradientColors={['#6366F1', '#8B5CF6', '#EC4899']}
                    angle={60}
                    noise={0.3}
                    blindCount={12}
                    blindMinWidth={70}
                    spotlightRadius={0.5}
                    spotlightSoftness={1.1}
                    spotlightOpacity={0.85}
                    mouseDampening={0.10}
                    distortAmount={8}
                    shineDirection="left"
                    mixBlendMode="screen"
                />
            </div>

            {/* Back Button */}
            <Link href="/" passHref>
                <Button className="fixed top-4 sm:top-6 left-4 sm:left-6 z-20 glass-card h-10 sm:h-12 px-3 sm:px-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm transition-all text-sm sm:text-base">
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Back
                </Button>
            </Link>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
                <div className="text-center mb-8 sm:mb-12 px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sora text-white mb-4 sm:mb-6">
                        Send <span className="text-gray-300">Crypto</span>
                    </h1>
                    <p className="font-ibm-plex-mono text-white text-base sm:text-lg md:text-xl max-w-md sm:max-w-lg mx-auto">
                        Transform how you send money. USDC to anyone, anywhere, with just an email address.
                    </p>
                </div>
                
                <Toaster richColors position="top-center" />
                <div className="w-full max-w-md sm:max-w-lg md:max-w-xl px-4">
                    <SendCard />
                </div>
            </main>
        </div>
    )
}