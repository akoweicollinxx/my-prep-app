"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";

// ✅ Type definitions
type Particle = {
  id: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
};

type CodeRain = {
  id: number;
  left: number;
  animationDelay: number;
  bits: string[];
};

export default function Dashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [codeRain, setCodeRain] = useState<CodeRain[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    setIsClient(true);

    const particleData: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 2,
    }));
    setParticles(particleData);

    const codeRainData: CodeRain[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: i * 5,
      animationDelay: i * 0.5,
      bits: "010110101".split(""),
    }));
    setCodeRain(codeRainData);
  }, []);

  if (!isLoaded) {
    return (
      <main className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  // const handleSignOut = async () => {
  //   setIsSigningOut(true);
  //   try {
  //     await signOut();
  //     router.push("/sign-in");
  //   } catch (error) {
  //     console.error("Sign out error:", error);
  //     setIsSigningOut(false);
  //   }
  // };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse"></div>
        </div>

        {/* Floating Particles */}
        {isClient && (
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  animationDelay: `${particle.animationDelay}s`,
                  animationDuration: `${particle.animationDuration}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-20 animate-pulse" />

        {/* Matrix Code Rain */}
        {isClient && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {codeRain.map((rain) => (
              <div
                key={rain.id}
                className="absolute text-cyan-400 font-mono text-sm animate-bounce"
                style={{
                  left: `${rain.left}%`,
                  top: `-10px`,
                  animationDelay: `${rain.animationDelay}s`,
                  animationDuration: "8s",
                }}
              >
                {rain.bits.map((bit, j) => (
                  <div key={j} className="mb-4">
                    {bit}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen grid place-items-center px-6 py-12">
        <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-10 rounded-3xl max-w-5xl w-full shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
          <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_50px_rgba(147,51,234,0.3)]" />

          {/* Left Side */}
          <div className="flex flex-col justify-center space-y-6 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
              </div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                InterPrep
              </h1>
            </div>

            {/* Welcome Message with User Info */}
            {user && (
              <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-300 text-sm">Welcome back,</p>
                <p className="text-white font-semibold text-lg">
                  {user.firstName || user.username || user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-bold leading-snug bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              Get Interview-Ready with AI-<br className="hidden md:block" />
              Powered Practice & Feedback
            </h2>

            <p className="text-gray-300 text-lg">
              Practice on real interview questions & get instant feedback
            </p>

            <button
              onClick={() => router.push("/interview")}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold text-sm py-3 px-6 rounded-full w-max shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse border border-purple-400/50"
            >
              <span className="flex items-center cursor-pointer space-x-2">
                <span>Start an Interview</span>
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              </span>
            </button>
          </div>

          {/* Right Side */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="w-96 h-96 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-purple-500/30 relative overflow-hidden">
                <div className="text-6xl animate-bounce">🤖</div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-0 left-10 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs animate-bounce">
              HTML
            </div>
            <div
              className="absolute top-0 right-10 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              CSS
            </div>
            <div
              className="absolute bottom-0 left-10 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs animate-bounce"
              style={{ animationDelay: "1s" }}
            >
              JS
            </div>
            <div
              className="absolute bottom-0 right-10 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xs animate-bounce"
              style={{ animationDelay: "1.5s" }}
            >
              PHP
            </div>
          </div>

          {/* Sign Out Button */}
          {/* <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="absolute bottom-6 right-6 cursor-pointer bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2 px-5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 border border-red-400/50"
          >
            <span className="flex items-center space-x-2">
              <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
              {isSigningOut && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </span>
          </button> */}

          {/* Corner Decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/50 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-500/50 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-500/50 rounded-br-lg" />
        </section>
      </div>
    </main>
  );
}