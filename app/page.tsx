"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const [isClient, setIsClient] = useState(false);

  if (!isLoaded || isSignedIn) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

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
        <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
                </div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    NextEmployed
                </h1>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/sign-in"
            className="px-3 py-1.5 sm:px-6 sm:py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs sm:text-base font-medium hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-3 py-1.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-xs sm:text-base font-medium hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-purple-400 mb-4 animate-fade-in">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            New: AI-Powered Interview Simulations
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] max-w-4xl mx-auto">
              Walk Into Any Interview <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 animate-gradient-x bg-[length:200%_200%]">
              Ready to Win
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Fix your CV, understand the role, and practice with AI before the real interview.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center group"
            >
              Start Practicing Free
              <svg 
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 transition-all"
            >
              How it works
            </Link>
          </div>
        </div>

        <section className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              title: "CV Scoring That Shows What to Fix",
              desc: "Get a clear match score for your target job, see what’s missing, and improve your CV with simple, actionable suggestions.",
              icon: "📊"
            },
            {
              title: "AI Interview Practice That Feels Real",
              desc: "Practice with an AI interviewer that asks realistic questions and gives instant feedback to improve your answers.",
              icon: "🤖"
            },
            {
              title: "Job-Specific Preparation",
              desc: "Prepare for the exact role you’re applying for with questions and insights tailored to the job description.",
              icon: "🎯"
            },
            
          ].map((feature, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-colors group"
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2026 cealadigital. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://www.instagram.com/cealadigital/" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
