'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import vapi from '@/lib/vapi';
import { track } from '@/lib/track';
import { SUBMISSION_KEY } from '@/lib/submission-key';

// TODO: Drop final portrait at /public/interviewers/sarah-chen.jpg
// Recommended specs: 512×512px, neutral expression, head-and-shoulders,
// professional lighting, transparent or solid neutral (#0a0a0a) background.
// Generation prompt (Midjourney / Flux / DALL-E):
//   "Professional headshot portrait of a woman in her mid-30s, Asian descent,
//    confident friendly expression, business casual attire, soft studio lighting,
//    neutral dark background, photorealistic, 512x512"
const PORTRAIT_SRC = '/interviewers/sarah-chen.jpg';
const JD_CONTEXT_KEY = 'nextemployed_jd_context';

type JdContext = { role: string | null; company: string | null };
type TranscriptEntry = { role: 'user' | 'assistant'; text: string };

// ---------------------------------------------------------------------------
// Helpers — same name extraction pattern as the rest of the app
// ---------------------------------------------------------------------------
function extractNameFromEmail(email: string): string {
  const local = email.split('@')[0];
  return local.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getUserDisplayName(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return 'You';
  if (user.firstName) return user.firstName;
  if (user.username) return user.username;
  const email = user.emailAddresses?.[0]?.emailAddress;
  if (email) return extractNameFromEmail(email);
  return 'You';
}

function getFullUserName(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return 'You';
  const first = user.firstName || '';
  const last = user.lastName || '';
  if (first && last) return `${first} ${last}`;
  return getUserDisplayName(user);
}

// ---------------------------------------------------------------------------
// InterviewerPortrait
// Renders the portrait image, falling back to a gradient circle with initials
// if the file doesn't exist or fails to load.
// ---------------------------------------------------------------------------
function InterviewerPortrait({
  src,
  isSpeaking,
}: {
  src: string;
  isSpeaking: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing ring shown while AI is speaking */}
      {isSpeaking && (
        <>
          <div className="absolute w-56 h-56 rounded-full border-2 border-purple-400/50 animate-ping" />
          <div className="absolute w-52 h-52 rounded-full border border-cyan-400/30 animate-pulse" />
        </>
      )}

      {/* Portrait container */}
      <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_60px_rgba(147,51,234,0.25)] relative z-10">
        {!imgError ? (
          <img
            src={src}
            alt="Sarah Chen, Senior Hiring Manager"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          // Placeholder — clean gradient circle with interviewer initials
          <div className="w-full h-full bg-gradient-to-br from-purple-700 via-purple-800 to-cyan-800 flex items-center justify-center select-none">
            <span className="text-4xl font-bold text-white/90 tracking-tight">SC</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JdModal
// Accepts a JD paste, calls back with the raw text so the parent can parse.
// ---------------------------------------------------------------------------
function JdModal({
  onSave,
  onClose,
  isParsing,
}: {
  onSave: (text: string) => void;
  onClose: () => void;
  isParsing: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-950 border border-white/10 rounded-3xl p-8 w-full max-w-lg space-y-5 shadow-2xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Add job description</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Paste the full job description and we&apos;ll tailor the interview questions to the role
            and company.
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full job description here…"
          className="w-full h-52 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
          autoFocus
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isParsing}
            className="px-5 py-2.5 rounded-full border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onSave(text.trim())}
            disabled={!text.trim() || isParsing}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all"
          >
            {isParsing ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Parsing…
              </span>
            ) : (
              'Save context'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function InterviewPage() {
  const { user } = useUser();
  const router = useRouter();

  const displayName = getUserDisplayName(user);
  const fullName = getFullUserName(user);
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'anonymous';
  const userImage = user?.imageUrl || null;

  const [isClient, setIsClient] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vapiConnecting, setVapiConnecting] = useState(false);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  // Stays false until the Vapi call-start event fires in this session.
  // Prevents transcript from ever rendering before "Start interview" is clicked.
  const [callEverStarted, setCallEverStarted] = useState(false);
  const [jdContext, setJdContext] = useState<JdContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Parse JD text → { role, company }, cache result, update state
  const parseAndCacheContext = useCallback(async (jdText: string): Promise<JdContext | null> => {
    setContextLoading(true);
    try {
      const res = await fetch('/api/parse-jd-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const ctx: JdContext = {
        role: typeof data.role === 'string' ? data.role : null,
        company: typeof data.company === 'string' ? data.company : null,
      };
      setJdContext(ctx);
      try {
        sessionStorage.setItem(
          JD_CONTEXT_KEY,
          JSON.stringify({ ...ctx, parsedAt: Date.now() })
        );
      } catch {}
      track('interview_jd_context_parsed', { role: ctx.role, company: ctx.company });
      return ctx;
    } catch {
      return null;
    } finally {
      setContextLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Kill any call that may have survived a previous navigation before we
    // register new listeners — prevents buffered transcript events from a
    // prior session from leaking into this mount's state.
    vapi.stop();

    // ── Load context ───────────────────────────────────────────────
    // 1. Try the parsed-context cache first (no re-parse needed)
    let contextPresent = false;
    try {
      const cached = sessionStorage.getItem(JD_CONTEXT_KEY);
      if (cached) {
        const { role, company } = JSON.parse(cached) as JdContext & { parsedAt?: number };
        if (role || company) {
          setJdContext({ role: role ?? null, company: company ?? null });
          contextPresent = true;
        }
      }
    } catch {}

    // 2. If no cache, try to parse from the /try submission JD
    if (!contextPresent) {
      try {
        const sub = sessionStorage.getItem(SUBMISSION_KEY);
        if (sub) {
          const { jobDescription } = JSON.parse(sub) as { jobDescription?: string };
          if (jobDescription) {
            // Async — fires track('interview_jd_context_parsed') internally
            parseAndCacheContext(jobDescription);
          }
        }
      } catch {}
    }

    track('interview_page_viewed', { context_present: contextPresent });

    // ── Vapi listeners ─────────────────────────────────────────────
    const handleCallStart = () => {
      setIsCalling(true);
      setVapiConnecting(false);
      setCallEverStarted(true);
    };
    const handleCallEnd = () => {
      setIsCalling(false);
      setIsSpeaking(false);
    };
    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);
    const handleMessage = (message: {
      type: string;
      transcriptType?: string;
      role?: string;
      transcript?: string;
    }) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === 'user' ? 'user' : 'assistant',
            text: message.transcript ?? '',
          },
        ]);
      }
    };
    const handleError = (err: unknown) => {
      console.error('Vapi error:', err);
      setVapiConnecting(false);
      setVapiError("Couldn't connect to the interviewer. Please try again.");
    };

    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('message', handleMessage);
      vapi.off('error', handleError);
      vapi.stop();
    };
  }, [parseAndCacheContext]);

  // Auto-scroll transcript to latest entry
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    if (isCalling) {
      vapi.stop();
      return;
    }
    setVapiError(null);
    setVapiConnecting(true);
    track('interview_started', {
      role: jdContext?.role ?? null,
      company: jdContext?.company ?? null,
      context_present: !!jdContext,
    });
    try {
      // variableValues keys must match the {{placeholder}} names in the
      // Vapi dashboard prompt. "role" and "company" map to {{role}} / {{company}}.
      // This is the correct shape for a workflow ID (not assistantOverrides,
      // which only applies when overriding a standalone assistant).
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: displayName,
          userid: userEmail,
          firstName: user?.firstName || displayName.split(' ')[0],
          lastName: user?.lastName || '',
          fullName,
          userDisplayName: displayName,
          userEmail,
          role: jdContext?.role || '',
          company: jdContext?.company || '',
        },
      });
    } catch (err) {
      console.error('Failed to start Vapi call:', err);
      setVapiConnecting(false);
      setVapiError("Couldn't connect to the interviewer. Please try again.");
    }
  };

  const handleSaveJd = async (jdText: string) => {
    // Persist the new JD text so other pages (/try/results, etc.) can use it
    try {
      const existingRaw = sessionStorage.getItem(SUBMISSION_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      sessionStorage.setItem(
        SUBMISSION_KEY,
        JSON.stringify({ ...existing, jobDescription: jdText, submittedAt: existing.submittedAt || Date.now() })
      );
    } catch {}
    // Bust the context cache so it re-parses with the new text
    try { sessionStorage.removeItem(JD_CONTEXT_KEY); } catch {}

    await parseAndCacheContext(jdText);
    setShowJdModal(false);
  };

  // ── Derived display values ───────────────────────────────────────
  const contextLabel = jdContext
    ? [jdContext.role, jdContext.company].filter(Boolean).join(' at ')
    : null;

  const primaryLabel = isCalling
    ? 'End interview'
    : vapiConnecting
    ? 'Connecting…'
    : jdContext
    ? 'Start interview'
    : 'Add a job description to start';

  // Primary button is disabled when: no context (and not already in call), or connecting
  const primaryDisabled = (!jdContext && !isCalling) || vapiConnecting;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen relative overflow-x-hidden flex flex-col items-center text-white">

      {/* ── Background ──────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-purple-950/60 to-black">
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(147,51,234,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.4)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      {/* ── Context bar ─────────────────────────────────────────── */}
      <div className="w-full z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-2 text-sm min-h-[44px]">
          {contextLoading ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-purple-500 border-t-transparent animate-spin shrink-0" />
              <span className="text-gray-500">Analysing job description…</span>
            </>
          ) : contextLabel ? (
            <>
              <span className="text-gray-600 text-xs uppercase tracking-widest font-medium shrink-0">
                Interviewing for
              </span>
              <span className="text-purple-300 font-medium truncate">{contextLabel}</span>
            </>
          ) : (
            <>
              {/* Warn icon */}
              <svg
                className="w-4 h-4 text-amber-400/70 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span className="text-gray-500">No interview context ·</span>
              <button
                onClick={() => {
                  setShowJdModal(true);
                  track('interview_jd_modal_opened');
                }}
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
              >
                Add a job description
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="w-full z-10 flex items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            NextEmployed
          </span>
        </div>
      </nav>

      {/* ── Interview room ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 z-10 w-full max-w-lg mx-auto">

        {/* Interviewer focal area */}
        <div className="flex flex-col items-center text-center mb-10">
          <InterviewerPortrait src={PORTRAIT_SRC} isSpeaking={isSpeaking} />

          <div className="mt-6 space-y-1">
            <h2 className="text-2xl font-bold text-white">Sarah Chen</h2>
            <p className="text-gray-400 text-sm">Senior Hiring Manager</p>
          </div>

          {/* Status indicator */}
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {isCalling ? (
              isSpeaking ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400">Speaking</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-400">Listening</span>
                </>
              )
            ) : vapiConnecting ? (
              <>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400/80">Connecting…</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                <span className="text-purple-300">Ready to start</span>
              </>
            )}
          </div>
        </div>

        {/* Pre-call priming text (hidden during the call) */}
        {!isCalling && !vapiConnecting && (
          <p className="text-gray-400 text-sm text-center mb-8">
            Take a breath. The interview begins when you&apos;re ready.
          </p>
        )}

        {/* Vapi error state */}
        {vapiError && (
          <div className="w-full bg-red-950/40 border border-red-500/30 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-red-400 text-sm">{vapiError}</p>
            <button
              onClick={() => {
                setVapiError(null);
                handleStartInterview();
              }}
              className="text-red-400 border border-red-500/40 rounded-full px-4 py-1.5 text-xs hover:bg-red-500/10 transition-colors whitespace-nowrap shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={handleStartInterview}
          disabled={primaryDisabled}
          className={`w-full max-w-xs py-4 px-8 rounded-full font-bold text-base transition-all active:scale-95 ${
            isCalling
              ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]'
              : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none'
          }`}
        >
          {primaryLabel}
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-3 mt-5 text-sm text-gray-400 flex-wrap justify-center">
          <button
            onClick={() => {
              track('interview_back_to_dashboard_clicked');
              router.push('/');
            }}
            className="hover:text-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </button>

          {contextLabel && !isCalling && (
            <>
              <span className="text-gray-700">·</span>
              <button
                onClick={() => {
                  setShowJdModal(true);
                  track('interview_jd_modal_opened');
                }}
                className="hover:text-gray-300 transition-colors"
              >
                Change interview context
              </button>
            </>
          )}
        </div>

        {/* ── Transcript ──────────────────────────────────────────
             Hidden until Vapi fires call-start in THIS session (callEverStarted)
             AND at least one transcript entry exists.
             callEverStarted resets to false on every mount, so stale messages
             from a previous call can never bleed through. */}
        {callEverStarted && transcript.length > 0 && (
          <div className="w-full mt-10">
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                      entry.role === 'assistant'
                        ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {entry.role === 'assistant' ? 'AI' : (displayName?.[0]?.toUpperCase() || 'U')}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      entry.role === 'assistant'
                        ? 'bg-purple-950/60 border border-purple-500/20 text-gray-200 rounded-tl-sm'
                        : 'bg-white/5 border border-white/5 text-gray-300 rounded-tr-sm'
                    }`}
                  >
                    {entry.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── User self-view (Zoom-style PIP) ─────────────────────── */}
      {isClient && (
        <div className="fixed bottom-6 right-6 z-20">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-3 flex flex-col items-center gap-2 w-[130px]">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
              {userImage ? (
                <img
                  src={userImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  {displayName?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center truncate w-full leading-tight">
              {displayName}
            </p>
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">You</span>
          </div>
        </div>
      )}

      {/* ── JD Modal ─────────────────────────────────────────────── */}
      {showJdModal && (
        <JdModal
          onSave={handleSaveJd}
          onClose={() => setShowJdModal(false)}
          isParsing={contextLoading}
        />
      )}
    </main>
  );
}
