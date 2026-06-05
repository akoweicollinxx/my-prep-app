'use client';

import { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import TailoredCvDocument, { type TailoredCvData } from './TailoredCvDocument';

type Props = {
  data: TailoredCvData;
  filename: string;
  onDownload?: () => void;
};

export default function PdfDownloader({ data, filename, onDownload }: Props) {
  const [instance, updateInstance] = usePDF({
    document: <TailoredCvDocument data={data} />,
  });

  // Regenerate PDF whenever data changes (e.g. after user edits)
  useEffect(() => {
    updateInstance(<TailoredCvDocument data={data} />);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (instance.loading) {
    return (
      <button
        disabled
        className="px-8 py-3.5 rounded-full bg-white/10 text-white font-bold text-sm opacity-60 cursor-not-allowed"
      >
        Generating PDF...
      </button>
    );
  }

  if (instance.error || !instance.url) {
    return (
      <button
        disabled
        className="px-8 py-3.5 rounded-full bg-red-500/30 text-red-300 font-bold text-sm cursor-not-allowed"
      >
        PDF error — try reloading
      </button>
    );
  }

  return (
    <a
      href={instance.url}
      download={filename}
      onClick={onDownload}
      className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg transition-all inline-block text-center"
    >
      Download PDF
    </a>
  );
}