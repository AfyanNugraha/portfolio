'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';
import LanyardFallback from './LanyardFallback';
import LanyardSkeleton from './LanyardSkeleton';

/** Waktu tunggu maksimum skeleton sebelum dilepas paksa (ms). */
const SKELETON_TIMEOUT = 8000;

// Chunk di-load non-SSR. Skeleton-nya TIDAK pakai opsi `loading` dynamic —
// dirender manual di bawah, supaya bisa bertahan sampai scene 3D benar-benar
// siap (onReady dari Lanyard3D), bukan cuma sampai chunk selesai di-download.
const Lanyard3D = dynamic(() => import('./Lanyard3D'), { ssr: false });

export default function LanyardSection() {
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Jaring pengaman: kalau onReady/onError tidak pernah datang
  // (device aneh, WebGL aneh), skeleton tetap dilepas — jangan sampai
  // section tertutup skeleton selamanya.
  useEffect(() => {
    if (ready || contextLost) return;
    const t = setTimeout(() => setReady(true), SKELETON_TIMEOUT);
    return () => clearTimeout(t);
  }, [ready, contextLost]);

  // Dengar WebGL context loss — terjadi di HP saat memory pressure,
  // pindah app, atau refresh cepat. Daripada layar putih, tampilkan fallback statis.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (e: Event) => {
      console.warn('[Lanyard3D] WebGL context lost');
      e.preventDefault();
      setContextLost(true);
      setReady(true); // lepas skeleton supaya fallback kelihatan
    };

    const handleContextRestored = () => {
      console.log('[Lanyard3D] WebGL context restored, remount canvas');
      setContextLost(false);
      setReady(false);
      // trigger remount Canvas dengan key baru (clean state)
      setRemountKey((k) => k + 1);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return (
    <section
      id="lanyard"
      className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden"
      ref={(el) => {
        if (el) {
          const canvas = el.querySelector('canvas');
          if (canvas && canvas !== canvasRef.current) {
            canvasRef.current = canvas;
          }
        }
      }}
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
          onError: crash = scene tak pernah siap → lepas skeleton langsung.
          key={remountKey}: remount canvas saat context restore (clean state). */}
      {!contextLost && (
        <ErrorBoundary
          name="Lanyard3D"
          fallback={<LanyardFallback />}
          onError={() => {
            setReady(true);
            setContextLost(true);
          }}
        >
          <Lanyard3D key={remountKey} onReady={() => setReady(true)} />
        </ErrorBoundary>
      )}

      {/* Context loss fallback — tampil saat GPU context hilang (putih/blank tidak terlihat). */}
      {contextLost && <LanyardFallback />}

      {/* Skeleton menutup section dari HTML awal sampai frame pertama 3D
          dirender, lalu fade-out 0.4s — tanpa celah blank di antaranya. */}
      <AnimatePresence>
        {!ready && !contextLost && (
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
