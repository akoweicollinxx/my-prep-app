"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PrivacyPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/40 to-black" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
            </div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                NextEmployed
            </h1>
        </Link>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Privacy Policy
        </h1>
        <div className="space-y-6 text-gray-400 leading-relaxed">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use NextEmployed.
          </p>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, update your profile, or use our AI-powered interview features. This may include your name, email address, and the content of your practice sessions.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, including personalizing your experience and training our AI models (anonymously) to better serve you.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized processing, accidental loss, destruction, or damage.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us.
            </p>
          </section>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 cealadigital. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
