"use client";

export function Hero() {
  return (
    <section className="max-w-4xl text-center">
      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter font-sora text-white drop-shadow-2xl">
        Beam It,
        <span className="block">Claim It.</span>
      </h1>
      <p className="text-white/90 mt-8 text-lg sm:text-xl max-w-2xl mx-auto font-ibm-plex-mono leading-relaxed">
        Send USDC to anyone with just their email. Recipients claim funds instantly via email, WhatsApp, Twitter, or any social platform. No gas fees, no complexity.
      </p>
    </section>
  );
}
