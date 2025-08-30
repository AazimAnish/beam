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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          {/* Hero Section */}
          <div className="space-y-8">
            
            <div className="mb-8">
              <BlurText 
                text="Beam It, Claim It." 
                className="text-5xl md:text-7xl font-bold font-sora text-white mb-2"
                duration={1.2}
              />
            </div>
            <p className="text-xl md:text-2xl font-ibm-plex-mono text-white/90 max-w-3xl mx-auto leading-relaxed">
              Send USDC to anyone with just their email. Recipients claim funds instantly via email, WhatsApp, Twitter, or any social platform.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Send Crypto Card */}
            <Link href="/send" className="block">
              <div className="action-card group">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Send className="w-10 h-10 text-golden-solid drop-shadow-lg" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sora font-bold text-2xl text-white">
                      Send Crypto Now
                    </h3>
                    <p className="font-ibm-plex-mono text-white/70 text-sm">
                      Send USDC to anyone, anywhere
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Claim Link Card */}
            <Link href="/claim" className="block">
              <div className="action-card group">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 bg-white/10 border border-white/20 backdrop-blur-sm">
                    <Gift className="w-10 h-10 text-golden-solid drop-shadow-lg" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sora font-bold text-2xl text-white">
                      I have a claim link
                    </h3>
                    <p className="font-ibm-plex-mono text-white/70 text-sm">
                      Claim your crypto payment
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="glass-card max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Zap className="w-8 h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-lg">Sponsored Gas</div>
                <div className="font-sora text-white/70 text-sm">Sender sponsors receiver&apos;s gas fees</div>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Clock className="w-8 h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-lg">Instant Claims</div>
                <div className="font-sora text-white/70 text-sm">Recipients get funds immediately</div>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Share2 className="w-8 h-8 text-golden-solid drop-shadow-lg" />
                </div>
                <div className="text-golden-solid font-ibm-plex-mono font-bold text-lg">Share Anywhere</div>
                <div className="font-sora text-white/70 text-sm">Email, WhatsApp, Twitter, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
