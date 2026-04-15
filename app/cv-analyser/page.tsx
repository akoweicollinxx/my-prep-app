'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ScoreBreakdown = {
  keywords_match: number;
  experience_relevance: number;
  formatting: number;
  impact_strength: number;
};

type KeywordSuggestion = {
  keyword: string;
  why_it_matters: string;
  suggestion: string;
};

type WeakBullet = {
  original: string;
  improved: string;
};

type TailoringGap = {
  requirement: string;
  issue: string;
  fix: string;
};

type AnalysisResult = {
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  summary: string;
  missing_keywords: string[];
  keyword_suggestions: KeywordSuggestion[];
  weak_bullet_points: WeakBullet[];
  impact_issues: string[];
  tailoring_gaps: TailoringGap[];
  top_improvements: string[];
  ready_for_interview_score: number;
};

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

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70 ? 'from-emerald-500 to-green-400' :
    score >= 40 ? 'from-yellow-500 to-orange-400' :
    'from-red-500 to-pink-400';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span className="text-white font-semibold">{score}/100</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function CVAnalyserPage() {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [codeRain, setCodeRain] = useState<CodeRain[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setParticles(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 2,
      }))
    );
    setCodeRain(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: i * 5,
        animationDelay: i * 0.5,
        bits: '010110101'.split(''),
      }))
    );
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
      const response = await fetch('/api/analyse-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.details ? `${data.error} (${data.details})` : data.error || 'Analysis failed.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const atsColor = result
    ? result.ats_score >= 70 ? '#10b981' : result.ats_score >= 40 ? '#f59e0b' : '#ef4444'
    : '#a855f7';

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.3)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
        </div>

        {isClient && (
          <div className="absolute inset-0">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
                style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.animationDelay}s`, animationDuration: `${p.animationDuration}s` }}
              />
            ))}
          </div>
        )}

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />

        {isClient && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {codeRain.map((rain) => (
              <div
                key={rain.id}
                className="absolute text-cyan-400 font-mono text-sm animate-bounce"
                style={{ left: `${rain.left}%`, top: '-10px', animationDelay: `${rain.animationDelay}s`, animationDuration: '8s' }}
              >
                {rain.bits.map((bit, j) => <div key={j} className="mb-4">{bit}</div>)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 md:px-6 py-8 md:py-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Card */}
          <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
            <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_50px_rgba(147,51,234,0.3)]" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    NextEmployed
                  </h1>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm py-2 px-6 rounded-full w-max shadow-lg transform hover:scale-105 transition-all duration-300 border border-white/20 cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>

              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                CV Analyser
              </h2>
              <p className="mb-8 text-purple-200">
                Upload your CV and paste the job description to get your ATS score and actionable feedback.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Upload CV (PDF)
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
                      className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 backdrop-blur-sm focus:ring-purple-500 focus:border-purple-500"
                      rows={8}
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 px-6 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 border border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Analysing...</span>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : 'Analyse My CV'}
                  </button>

                  {error && (
                    <div className="p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-r-lg text-sm">
                      {error}
                    </div>
                  )}
                </div>

                {/* Empty state */}
                {!result && (
                  <div className="flex items-center justify-center border border-dashed border-white/20 rounded-2xl min-h-[300px]">
                    <div className="text-center">
                      <div className="text-6xl mb-4 opacity-30">📊</div>
                      <p className="text-gray-400 italic text-sm">
                        {loading ? 'AI is analysing your CV...' : 'Your analysis will appear here'}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/50 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-500/50 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-pink-500/50 rounded-br-lg" />
          </section>

          {/* Results */}
          {result && (
            <div className="space-y-6">

              {/* Score Overview */}
              <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center gap-8">

                  {/* ATS Score Ring */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <ScoreRing score={result.ats_score} label="ATS Score" color={atsColor} />
                    <span className="text-xs text-gray-400">Overall Match</span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-white">Score Breakdown</h3>
                    <ScoreBar score={result.score_breakdown.keywords_match} label="Keywords Match" />
                    <ScoreBar score={result.score_breakdown.experience_relevance} label="Experience Relevance" />
                    <ScoreBar score={result.score_breakdown.formatting} label="Formatting" />
                    <ScoreBar score={result.score_breakdown.impact_strength} label="Impact Strength" />
                  </div>

                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <ScoreRing score={result.ready_for_interview_score} label="Interview Ready" color="#06b6d4" />
                    <span className="text-xs text-gray-400">Readiness</span>
                  </div>
                </div>

                <p className="mt-6 text-gray-300 text-sm bg-white/5 rounded-xl p-4 border border-white/10">
                  {result.summary}
                </p>
              </section>

              {/* Top Improvements */}
              <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-cyan-300">Top Improvements</h3>
                <ol className="space-y-3">
                  {result.top_improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Missing Keywords */}
                <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 rounded-3xl shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 text-red-400">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Impact Issues */}
                <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 rounded-3xl shadow-2xl">
                  <h3 className="text-lg font-bold mb-4 text-orange-400">Impact Issues</h3>
                  <ul className="space-y-2">
                    {result.impact_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-orange-400 mt-0.5 shrink-0">⚠</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Keyword Suggestions */}
              <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Keyword Suggestions</h3>
                <div className="space-y-4">
                  {result.keyword_suggestions.map((ks, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                      <span className="text-emerald-300 font-semibold text-sm">{ks.keyword}</span>
                      <p className="text-gray-400 text-xs">{ks.why_it_matters}</p>
                      <p className="text-gray-200 text-sm">{ks.suggestion}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Weak Bullet Points */}
              {result.weak_bullet_points.length > 0 && (
                <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Weak Bullet Points — Rewritten</h3>
                  <div className="space-y-4">
                    {result.weak_bullet_points.map((bp, i) => (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-gray-400">
                          <span className="text-red-400 text-xs font-semibold block mb-1">Before</span>
                          {bp.original}
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-gray-200">
                          <span className="text-emerald-400 text-xs font-semibold block mb-1">After</span>
                          {bp.improved}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Tailoring Gaps */}
              <section className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-purple-300">Tailoring Gaps</h3>
                <div className="space-y-4">
                  {result.tailoring_gaps.map((gap, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
                      <span className="text-white font-semibold text-sm">{gap.requirement}</span>
                      <p className="text-red-300 text-xs">{gap.issue}</p>
                      <p className="text-cyan-200 text-sm">Fix: {gap.fix}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
