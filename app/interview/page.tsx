'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Vapi from '@vapi-ai/web';
import { useUser } from '@clerk/nextjs';

const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);

// ✅ Type definitions for background
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

// Helper function to extract name from email
const extractNameFromEmail = (email: string): string => {
  if (!email) return 'User';
  
  // Split email at @ symbol and take the first part
  const localPart = email.split('@')[0];
  
  // Handle common email patterns
  // Replace dots, hyphens, underscores with spaces
  let name = localPart.replace(/[._-]/g, ' ');
  
  // Capitalize first letter of each word
  name = name.replace(/\b\w/g, letter => letter.toUpperCase());
  
  return name;
};

// Helper function to get the best available user name
const getUserDisplayName = (user: any): string => {
  if (!user) return 'User';
  
  // Priority: firstName > username > extracted from email > fallback
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.emailAddresses?.[0]?.emailAddress) {
    return extractNameFromEmail(user.emailAddresses[0].emailAddress);
  }
  
  return 'User';
};

// Helper function to get full name for formal address
const getFullUserName = (user: any): string => {
  if (!user) return 'User';
  
  // Try to construct full name
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  // Fallback to display name logic
  return getUserDisplayName(user);
};

export default function InterviewPage() {
  const { user } = useUser();
  const router = useRouter();
  
  // Get the best available user name using the same pattern as your reference
  const userName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress || 'User';
  const displayName = getUserDisplayName(user);
  const fullName = getFullUserName(user);
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'anonymous';
  const userImage = user?.imageUrl || '/icons/user.svg';

  const [isClient, setIsClient] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  // Background states
  const [particles, setParticles] = useState<Particle[]>([]);
  const [codeRain, setCodeRain] = useState<CodeRain[]>([]);

  useEffect(() => {
    setIsClient(true);

    // Background animation data
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

    const handleCallStart = () => setIsCalling(true);
    const handleCallEnd = () => setIsCalling(false);
    const handleMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript((prev) => [...prev, message.transcript]);
      }
    };
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);
    const handleError = (err: any) => console.error('Vapi error:', err);

    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('message', handleMessage);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('error', handleError);

    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('message', handleMessage);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('error', handleError);
    };
  }, []);

  const handleCall = async () => {
    if (isCalling) {
      vapi.stop();
    } else {
      try {
        // Enhanced variable values with proper name handling following your pattern
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: displayName, // Use the properly extracted/formatted name
            userid: userEmail,
            firstName: user?.firstName || displayName.split(' ')[0], // Extract first name
            lastName: user?.lastName || '',
            fullName: fullName, // Full name for formal address
            userDisplayName: displayName, // Clean display name
            userEmail: userEmail,
          },
        });
      } catch (err) {
        console.error('Failed to start Vapi call:', err);
      }
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-white px-4 py-8">

      {/* Background Gradient + Orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
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

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
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

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
        </div>
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          InterPrep
        </h1>
      </div>

      {/* Welcome Message with User Info - Following your reference pattern */}
      {/* {user && (
        <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 mb-6 z-10">
          <p className="text-purple-300 text-sm">Welcome back,</p>
          <p className="text-white font-semibold text-lg">
            {user.firstName || user.username || (user.emailAddresses?.[0]?.emailAddress && extractNameFromEmail(user.emailAddresses[0].emailAddress))}
          </p>
        </div>
      )} */}

      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-center z-10 mb-10 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-fadeIn">
        Make the call to get started
      </h2>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl w-full mb-8 md:mb-12 animate-fadeIn delay-300">
        <div className="p-6 md:p-10 rounded-3xl border border-purple-500/50 bg-gradient-to-br from-[#1c1f3f] to-[#1a1a2e] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 ease-in-out text-center transform hover:scale-105">
          <div className="flex flex-col items-center space-y-4 md:space-y-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center shadow-lg relative">
              <Image src="/myai.png" alt="AI Interviewer" width={50} height={50} />
              {isSpeaking && (
                <span className="absolute w-4 h-4 rounded-full bg-green-400 animate-ping top-0 right-0" />
              )}
            </div>
            <h2 className="text-xl font-semibold">AI Interviewer</h2>
          </div>
        </div>

        <div className="p-6 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out text-center transform hover:scale-105">
          <div className="flex flex-col items-center space-y-4 md:space-y-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#1e293b] flex items-center justify-center shadow-inner">
              {userImage && userImage !== '/icons/user.svg' ? (
                <img
                  src={userImage}
                  alt={displayName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src="/icons/user.svg"
                  alt={displayName}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-300">{displayName}</h2>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 w-full max-w-2xl text-sm space-y-2 border border-white/10 mb-24 overflow-y-auto max-h-64 z-10">
        {transcript.length > 0 ? (
          transcript.map((line, index) => (
            <p key={index} className="text-gray-300">{line}</p>
          ))
        ) : (
          <p className="text-gray-500 italic">Transcript will appear here...</p>
        )}
      </div>

      {/* Buttons Row */}
      <div className="mt-8 md:mt-0 md:fixed md:bottom-6 z-10 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <button
          onClick={handleCall}
          className={`w-full md:w-auto font-semibold cursor-pointer py-3 px-10 rounded-full shadow-lg transition transform hover:scale-105 ${
            isCalling
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isCalling ? 'End Call' : 'Call'}
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full md:w-auto bg-gradient-to-r cursor-pointer from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}
