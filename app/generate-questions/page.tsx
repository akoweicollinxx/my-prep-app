'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Page to allow users to upload their CV and paste a job description.
 * It uses the /api/generate-questions endpoint to generate tailored interview Q&A.
 */

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

export default function GenerateQuestionsPage() {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Background states
  const [particles, setParticles] = useState<Particle[]>([]);
  const [codeRain, setCodeRain] = useState<CodeRain[]>([]);
  const [isClient, setIsClient] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    if (!cvFile || !jobDescription) {
      setError('Please provide both your CV and the job description.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('API JSON response:', data);
      } else {
        const text = await response.text();
        console.error('API non-JSON response:', text);
        setError(`Server returned an unexpected response format: ${response.status} ${response.statusText}. Please check the server logs.`);
        setLoading(false);
        return;
      }

      if (response.ok) {
        setResult(data.result);
      } else {
        const errorMsg = data.details ? `${data.error} (${data.details})` : (data.error || 'Failed to generate questions.');
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

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
      <div className="relative z-10 min-h-screen grid place-items-center px-4 md:px-6 py-8 md:py-12 overflow-y-auto">
        <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-10 rounded-3xl max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
          <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_50px_rgba(147,51,234,0.3)]" />

          <div className="relative z-10 flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 w-full">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
                </div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  InterPrep
                </h1>
              </div>

              <button
                onClick={() => router.push("/")}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2 px-6 rounded-full w-max shadow-lg transform hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer flex items-center space-x-2"
              >
                <span>← Back to Dashboard</span>
              </button>
            </div>

            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent text-center md:text-left">
              Interview Question Generator
            </h2>
            <p className="mb-8 text-purple-200 text-center md:text-left">
              Upload your CV and paste the job description to get 15 tailored interview questions and answers.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Side: Form */}
              <div className="flex flex-col space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Upload CV (PDF format)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 file:cursor-pointer cursor-pointer border border-purple-500/30 p-2 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Job Description
                    </label>
                    <textarea
                      className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500 backdrop-blur-sm"
                      rows={8}
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 px-6 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 border border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Generating...</span>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </span>
                    ) : (
                      'Generate Questions & Answers'
                    )}
                  </button>
                </form>

                {error && (
                  <div className="p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-r-lg">
                    {error}
                  </div>
                )}
              </div>

              {/* Right Side: Result */}
              <div className="flex flex-col">
                <div className={`h-full min-h-[400px] p-6 bg-white/5 rounded-2xl border border-white/10 relative ${!result && 'flex items-center justify-center border-dashed'}`}>
                  {result ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-cyan-300">Your Tailored Interview Prep</h3>
                        <button
                          onClick={handleCopy}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer group relative flex items-center justify-center"
                          title="Copy to clipboard"
                        >
                          {copySuccess ? (
                            <span className="text-green-400 text-xs font-semibold">Copied!</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-cyan-400 transition-colors">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="prose prose-invert prose-cyan max-w-none whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                          {result}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-30">📄</div>
                      <p className="text-gray-400 italic">
                        {loading ? 'AI is processing your profile...' : 'Generated questions will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
