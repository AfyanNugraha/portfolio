'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { getCerts } from '@/lib/content';

type Cert = {
  id: string;
  title: string;
  issuer: string;
  desc: string;
  date: string;
  pdf: string;
};

const { header, certs: CERTS } = getCerts();

export default function Certifications() {
  const [active, setActive] = useState<Cert | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  // Reset skeleton tiap ganti sertifikat; timeout = jaring pengaman
  // bila event load iframe PDF tidak pernah datang (browser tertentu).
  useEffect(() => {
    if (!active) return;
    setPdfLoading(true);
    const t = setTimeout(() => setPdfLoading(false), 4000);
    return () => clearTimeout(t);
  }, [active]);

  // Lock scroll + close on Escape while modal is open
  useEffect(() => {
    if (!active) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  return (
    <section
      id="certifications"
      className="py-20 sm:py-32 bg-[#0d0d0d] border-t border-zinc-900"
    >
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="05"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        <div className="grid md:grid-cols-3 gap-6">
          {CERTS.map((c, idx) => (
            <motion.button
              key={c.title}
              type="button"
              onClick={() => setActive(c)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-[#121212] border border-zinc-800 hover:border-blue-500 transition-all flex flex-col justify-between group text-left cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono text-zinc-500">{c.id}</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>

                <div className="text-xs font-mono text-blue-400/90 mb-2">{c.issuer}</div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-6">{c.desc}</p>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-mono">{c.date}</span>
                <span className="text-zinc-300 font-medium group-hover:text-blue-400 transition-colors flex items-center gap-1">
                  Preview PDF &rarr;
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* PDF preview modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="cert-modal"
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setActive(null)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#111111] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-zinc-800/80">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-blue-400/90 mb-1">
                    {active.issuer}
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg truncate">
                    {active.title}
                  </h3>
                  <div className="text-zinc-500 font-mono text-xs mt-0.5">{active.date}</div>
                </div>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setActive(null)}
                  className="shrink-0 w-9 h-9 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* PDF viewer (lazy: only rendered while open) */}
              <div
                className="relative flex-1 min-h-0 bg-[#0a0a0a] select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <iframe
                  src={`${active.pdf}#toolbar=0&navpanes=0&statusbar=0`}
                  title={active.title}
                  className="w-full h-full border-0"
                  style={{ minHeight: '60vh' }}
                  onLoad={() => setPdfLoading(false)}
                />

                {/* Skeleton halaman PDF — tampil sampai iframe load
                    (atau maks 4 detik sebagai fallback) */}
                {pdfLoading && (
                  <div
                    role="status"
                    aria-label="Memuat PDF"
                    className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 p-6"
                  >
                    <div className="w-full max-w-xs sm:max-w-sm aspect-[1/1.414] rounded-md border border-zinc-800 bg-[#111111] shadow-2xl p-6 flex flex-col gap-3.5">
                      <div className="h-5 w-2/3 rounded skeleton" />
                      <div className="h-2.5 w-full rounded skeleton" />
                      <div className="h-2.5 w-11/12 rounded skeleton" />
                      <div className="h-2.5 w-4/5 rounded skeleton" />
                      <div className="h-2.5 w-full rounded skeleton" />
                      <div className="mt-4 h-16 w-full rounded skeleton" />
                      <div className="h-2.5 w-10/12 rounded skeleton" />
                      <div className="h-2.5 w-3/4 rounded skeleton" />
                    </div>
                    <span className="font-mono text-xs text-zinc-600">
                      loading pdf…
                    </span>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-zinc-800/80">
                <span className="text-zinc-600 text-xs font-mono truncate hidden sm:block">
                  {active.pdf.replace('/certs/', '')}
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={active.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold rounded-md border border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-all"
                  >
                    Buka di Tab Baru
                  </a>
                  <a
                    href={active.pdf}
                    download
                    className="px-4 py-2.5 text-xs font-semibold rounded-md bg-white text-black hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
