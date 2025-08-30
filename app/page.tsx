"use client";

import { Send, Gift, Zap, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import GradientBlinds from "@/components/GradientBlinds";
import { WalletStatus } from "@/components/custom/WalletStatus";
import BlurText from "@/components/ui/blur-text";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0B0F]">
      {/* GradientBlinds Background */}
      <div className="fixed inset-0 z-0 transition-all duration-300 hover:opacity-80">
        <GradientBlinds
          gradientColors={['#FF6B35', '#F7931E', '#FFD700']}
          angle={45}
          noise={0.25}
          blindCount={15}
          blindMinWidth={60}
          spotlightRadius={0.6}
          spotlightSoftness={1.2}
          spotlightOpacity={0.9}
          mouseDampening={0.08}
          distortAmount={5}
          shineDirection="left"
          mixBlendMode="screen"
        />
      </div>

      {/* Wallet Status - Top Left */}
      <WalletStatus />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-16 lg:py-20 mt-24 sm:mt-28 md:mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-20">
          {/* Hero Section */}
          <div className="space-y-6 sm:space-y-8">

            <div className="mb-6 sm:mb-8">
              <BlurText
                text="Beam It, Claim It."
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-sora text-white mb-2 px-4"
                duration={1.2}
              />
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-ibm-plex-mono text-white/90 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4">
              Send money like it should be. Simple. Fast. Secure.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto px-4">
            {/* Send Crypto Card */}
            <Link href="/send" className="block">
              <div className="action-card group h-full flex flex-col justify-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Send className="w-8 h-8 sm:w-10 sm:h-10 text-golden-solid drop-shadow-lg" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sora font-bold text-xl sm:text-2xl text-white">
                      Send Crypto Now
                    </h3>
                    <p className="font-ibm-plex-mono text-white/70 text-xs sm:text-sm">
                      Send USDC to anyone, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Claim Link Card */}
            <Link href="/claim" className="block">
              <div className="action-card group h-full flex flex-col justify-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-golden-solid drop-shadow-lg" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sora font-bold text-xl sm:text-2xl text-white">
                      I have a claim link
                    </h3>
                    <p className="font-ibm-plex-mono text-white/70 text-xs sm:text-sm">
                      Claim your crypto payment
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="glass-card max-w-3xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-base sm:text-lg">Sponsored Gas</div>
                <div className="font-sora text-white/70 text-xs sm:text-sm">We cover all transaction fees</div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-base sm:text-lg">Instant Claims</div>
                <div className="font-sora text-white/70 text-xs sm:text-sm">Funds available immediately</div>
              </div>
              <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-base sm:text-lg">Share Anywhere</div>
                <div className="font-sora text-white/70 text-xs sm:text-sm">Email, WhatsApp, Twitter, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
