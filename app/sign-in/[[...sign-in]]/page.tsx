'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: number
  top: number
  animationDelay: number
  animationDuration: number
}

interface CodeRain {
  id: number
  left: number
  animationDelay: number
  bits: string[]
}

export default function Page() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [codeRain, setCodeRain] = useState<CodeRain[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const particleData: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 2,
    }))
    setParticles(particleData)

    const codeRainData: CodeRain[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: i * 5,
      animationDelay: i * 0.5,
      bits: '010110101'.split(''),
    }))
    setCodeRain(codeRainData)
  }, [])

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black" />
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse"></div>
      </div>

      {/* Particles */}
      {isClient && (
        <div className="absolute inset-0 z-0">
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

      {/* Code Rain */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden opacity-10 z-0">
          {codeRain.map((rain) => (
            <div
              key={rain.id}
              className="absolute text-cyan-400 font-mono text-sm animate-bounce"
              style={{
                left: `${rain.left}%`,
                top: `-10px`,
                animationDelay: `${rain.animationDelay}s`,
                animationDuration: '8s',
              }}
            >
              {rain.bits.map((bit, j) => (
                <div key={j} className="mb-4">{bit}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Glow Orbs */}
      <div className="absolute top-1/3 left-[20%] w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-1/3 right-[15%] w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse z-0"></div>

      {/* Sign-In Box */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900 to-black px-4">
        <div className="w-full max-w-md p-4 border border-purple-500/30 rounded-3xl backdrop-blur-xl bg-white/5 shadow-2xl">
          <SignIn />
        </div>
      </div>
    </main>
  )
}
