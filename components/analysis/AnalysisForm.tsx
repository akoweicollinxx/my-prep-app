'use client';

import { useState } from 'react';

type Props = {
  onSubmit: (cvText: string, jobDescription: string) => void;
  isLoading: boolean;
  error?: string | null;
};

export function AnalysisForm({ onSubmit, isLoading, error }: Props) {
  const [cvMode, setCvMode] = useState<'text' | 'file'>('text');
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const busy = isLoading || extracting;
  const cvReady = cvMode === 'text' ? cvText.trim().length >= 50 : cvFile !== null;
  const canSubmit = cvReady && jobDescription.trim().length >= 100 && !busy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtractError(null);

    let finalCvText = cvText.trim();

    if (cvMode === 'file') {
      if (!cvFile) return;
      setExtracting(true);
      try {
        const fd = new FormData();
        fd.append('cvFile', cvFile);
        const res = await fetch('/api/extract-cv-text', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not read the file.');
        finalCvText = data.cvText;
      } catch (err: unknown) {
        setExtractError(
          err instanceof Error
            ? err.message
            : 'Could not read the file. Try pasting your CV text instead.'
        );
        setExtracting(false);
        return;
      }
      setExtracting(false);
    }

    if (!finalCvText || !jobDescription.trim()) return;
    onSubmit(finalCvText, jobDescription.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Description */}
      <div>
        <label htmlFor="jobDescription" className="block text-sm font-medium text-purple-300 mb-2">
          Job Description
          <span className="ml-2 text-xs text-gray-500 font-normal">min 100 chars</span>
        </label>
        <textarea
          id="jobDescription"
          className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-purple-400 transition-colors resize-none"
          rows={6}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          required
          disabled={busy}
        />
      </div>

      {/* CV — paste or upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-purple-300">Your CV</label>
          <div className="flex rounded-full overflow-hidden border border-purple-500/30 text-xs">
            <button
              type="button"
              onClick={() => { setCvMode('text'); setExtractError(null); }}
              disabled={busy}
              className={`px-3 py-1 transition-colors ${cvMode === 'text' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
            >
              Paste text
            </button>
            <button
              type="button"
              onClick={() => { setCvMode('file'); setExtractError(null); }}
              disabled={busy}
              className={`px-3 py-1 transition-colors ${cvMode === 'file' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:text-white'}`}
            >
              Upload file
            </button>
          </div>
        </div>

        {cvMode === 'text' ? (
          <textarea
            id="cvText"
            className="w-full p-4 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-purple-400 transition-colors resize-none"
            rows={8}
            placeholder="Paste your CV text here..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            required
            disabled={busy}
          />
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-500/30 rounded-xl p-8 bg-black/20 min-h-[180px]">
            <div className="text-4xl mb-3 opacity-40">📄</div>
            <p className="text-sm text-gray-400 mb-4 text-center">
              PDF, DOCX, or TXT — text will be extracted automatically
            </p>
            <label htmlFor="cvFile" className="cursor-pointer px-5 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors">
              {cvFile ? cvFile.name : 'Choose file'}
            </label>
            <input
              id="cvFile"
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                setCvFile(e.target.files?.[0] ?? null);
                setExtractError(null);
              }}
            />
            {cvFile && (
              <button
                type="button"
                onClick={() => setCvFile(null)}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {/* Errors */}
      {(extractError || error) && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
          <span className="text-red-400 text-lg shrink-0">⚠</span>
          <p className="text-red-300 text-sm">{extractError ?? error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white py-3 px-6 rounded-full font-semibold shadow-lg transition-all duration-300 border border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {extracting ? (
          <span className="flex items-center justify-center gap-2">
            <span>Reading your CV...</span>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span>Analysing...</span>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </span>
        ) : (
          'Analyse My CV'
        )}
      </button>
    </form>
  );
}
