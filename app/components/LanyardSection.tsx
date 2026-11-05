'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import LanyardFallback from './LanyardFallback';
import LanyardSkeleton from './LanyardSkeleton';

// Chunk di-load non-SSR. Skeleton-nya TIDAK pakai opsi `loading` dynamic —
// dirender manual di bawah, supaya bisa bertahan sampai scene 3D benar-benar
// siap (onReady dari Lanyard3D), bukan cuma sampai chunk selesai di-download.
const Lanyard3D = dynamic(() => import('./Lanyard3D'), { ssr: false });

/** Waktu tunggu maksimum skeleton sebelum dilepas paksa (ms). */
const SKELETON_TIMEOUT = 8000;

export default function LanyardSection() {
  const [ready, setReady] = useState(false);

  // Jaring pengaman: kalau onReady/onError tidak pernah datang
  // (device aneh, WebGL aneh), skeleton tetap dilepas — jangan sampai
  // section tertutup skeleton selamanya.
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setReady(true), SKELETON_TIMEOUT);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <section
      id="lanyard"
      className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden"
    >
      {/* subtle backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/15 via-transparent to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(59,130,246,0.12), transparent 70%)',
        }}
      />

      {/* Lanyard 3D interaktif — ErrorBoundary: fallback statis jika WebGL crash.
          onError: crash = scene tak pernah siap → lepas skeleton langsung. */}
      <ErrorBoundary
        name="Lanyard3D"
        fallback={<LanyardFallback />}
        onError={() => setReady(true)}
      >
        <Lanyard3D onReady={() => setReady(true)} />
      </ErrorBoundary>

      {/* Skeleton menutup section dari HTML awal sampai frame pertama 3D
          dirender, lalu fade-out 0.4s — tanpa celah blank di antaranya. */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="lanyard-skeleton"
            className="absolute inset-0 z-10 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <LanyardSkeleton />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
