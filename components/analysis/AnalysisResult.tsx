'use client';

import Link from 'next/link';

type CTA =
  | { label: string; href: string; variant: 'primary' | 'secondary' }
  | { label: string; onClick: () => void; variant: 'primary' | 'secondary' };

type Props = {
  result: string;
  isStreaming: boolean;
  /** Pass the /try teaser text to show the "Issue #1 (free preview)" recap above the full analysis. */
  teaserResult?: string;
  ctas: CTA[];
};

const primaryCls =
  'px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:from-purple-600 hover:to-cyan-600 transition-all text-center';
const secondaryCls =
  'px-8 py-3 rounded-full border border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition-all text-center';

export function AnalysisResult({ result, isStreaming, teaserResult, ctas }: Props) {
  return (
    <div>
      {/* Teaser recap — only shown on /try/results where teaserResult is passed */}
      {teaserResult && (
        <div className="mb-6 mt-4">
          <div className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Issue #1 (free preview)
                </h2>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-gray-400 leading-relaxed opacity-80">
                {teaserResult}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Full result */}
      {result && (
        <div>
          <div className="flex items-center gap-2 mb-4 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
              Your full analysis
            </h2>
          </div>
          <div className="bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
            <pre className="relative whitespace-pre-wrap font-sans text-sm text-gray-200 leading-relaxed">
              {result}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Post-analysis CTAs — only shown when streaming is complete */}
      {!isStreaming && result && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {ctas.map((cta, i) => {
            const cls = cta.variant === 'primary' ? primaryCls : secondaryCls;
            if ('href' in cta) {
              return (
                <Link key={i} href={cta.href} className={cls}>
                  {cta.label}
                </Link>
              );
            }
            return (
              <button key={i} onClick={cta.onClick} className={cls}>
                {cta.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
