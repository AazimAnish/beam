"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import GradientBlinds from '@/components/GradientBlinds';

export default function ClaimLandingPage() {
    const [claimCode, setClaimCode] = useState('');
    const router = useRouter();

    const handleClaim = () => {
        if (claimCode.trim()) {
            router.push(`/claim/${claimCode.trim()}`);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0B0F]">
            {/* GradientBlinds Background */}
            <div className="fixed inset-0 z-0 transition-all duration-700 hover:opacity-75">
                <GradientBlinds
                    gradientColors={['#10B981', '#059669', '#047857']}
                    angle={120}
                    noise={0.28}
                    blindCount={10}
                    blindMinWidth={85}
                    spotlightRadius={0.65}
                    spotlightSoftness={1.3}
                    spotlightOpacity={0.8}
                    mouseDampening={0.12}
                    distortAmount={6}
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
                        Claim Your <span className="text-gray-300">Funds</span>
                    </h1>
                    <p className="font-ibm-plex-mono text-white text-base sm:text-lg md:text-xl max-w-md sm:max-w-lg mx-auto">
                        Secure and instant access to your crypto payment. Enter your claim code to receive your funds.
                    </p>
                </div>
                
                <div className="glass-card w-full max-w-sm sm:max-w-md md:max-w-lg p-6 sm:p-8 mx-4">
                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6 text-center">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold font-sora text-white mb-2">Claim Your Funds</h2>
                            <p className="font-ibm-plex-mono text-white/70 text-xs sm:text-sm">
                                Enter the secure code you received to claim your payment instantly.
                            </p>
                        </div>
                        
                        <div className="space-y-3 sm:space-y-4">
                            <Input 
                                placeholder="Enter your claim code"
                                value={claimCode}
                                onChange={(e) => setClaimCode(e.target.value)}
                                className="input-field h-12 sm:h-14 text-center text-base sm:text-lg font-ibm-plex-mono placeholder:text-white/40"
                            />
                            <Button
                                onClick={handleClaim}
                                disabled={!claimCode.trim()}
                                className="button-primary w-full h-12 sm:h-14 text-base sm:text-lg font-bold"
                            >
                                Claim Funds
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}