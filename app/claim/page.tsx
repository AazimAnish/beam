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
                <Button className="fixed top-6 left-6 z-20 glass-card h-12 px-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </Button>
            </Link>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-sora text-white mb-4">
                        Claim Your <span className="text-gray-300">Funds</span>
                    </h1>
                    <p className="font-ibm-plex-mono text-white text-lg max-w-md mx-auto">
                        Enter your claim code to receive your payment
                    </p>
                </div>
                
                <div className="glass-card w-full max-w-md p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Gift className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    
                    <div className="space-y-6 text-center">
                        <div>
                            <h2 className="text-2xl font-bold font-sora text-white mb-2">Claim Your Funds</h2>
                            <p className="font-ibm-plex-mono text-white/70 text-sm">
                                Enter the code you received to claim your payment.
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <Input 
                                placeholder="Enter your claim code"
                                value={claimCode}
                                onChange={(e) => setClaimCode(e.target.value)}
                                className="input-field h-14 text-center text-lg font-ibm-plex-mono placeholder:text-white/40"
                            />
                            <Button
                                onClick={handleClaim}
                                disabled={!claimCode.trim()}
                                className="button-primary w-full h-14 text-lg font-bold"
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