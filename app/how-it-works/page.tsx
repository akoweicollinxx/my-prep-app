"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HowItWorks() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/40 to-black" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[160px]" />
        
        {isClient && (
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => {
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              const delay = Math.random() * 5;
              const duration = 3 + Math.random() * 2;
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full animate-ping"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
          </div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            NextEmployed
          </h1>
        </Link>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium hover:bg-white/10 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-32">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1]">
            How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Works</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Watch this video to understand how NextEmployed can help you master your next technical interview.
          </p>
        </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                  className="w-full h-full"
                  src="https://youtu.be/ZeO4GjcGAgU"
                  title="How NextEmployed Works"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              />
          </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
                <div className="text-3xl">📝</div>
                <h3 className="text-xl font-bold">Practice the Exact Interview</h3>
                <p className="text-gray-400">Answer questions based on the role and get feedback to improve your performance.</p>
            </div>
            <div className="space-y-4">
                <div className="text-3xl">🤖</div>
                <h3 className="text-xl font-bold">Upload Your CV & Target Job</h3>
                <p className="text-gray-400">Add your CV and paste the job you’re applying for. Everything is tailored to this role from the start.</p>
            </div>
            <div className="space-y-4">
                <div className="text-3xl">📈</div>
                <h3 className="text-xl font-bold">Optimise Your CV for This Role</h3>
                <p className="text-gray-400">See your match score, missing keywords, and exactly what to fix to align with the job requirements.</p>
            </div>
        </div>

        <div className="mt-24 text-center">
             <Link
                href="/sign-up"
                className="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-all transform hover:scale-105 active:scale-95 group"
              >
                Start Your First Session
                <svg 
                  className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 cealadigital. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
