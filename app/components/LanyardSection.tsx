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

/** Cek dukungan WebGL — device tanpa WebGL langsung pakai fallback statis. */
function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    // Lepas context uji supaya tidak menahan slot context browser
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function LanyardSection() {
  const [ready, setReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [sceneOk, setSceneOk] = useState<boolean | null>(null);
  const retryCountRef = useRef(0);

  // Cek WebGL dengan retry singkat (hingga 3x, jeda 300ms) untuk
  // mengatasi kondisi race saat browser baru inisialisasi context.
  useEffect(() => {
    let active = true;
    const check = () => {
      if (!active) return;
      if (supportsWebGL()) {
        setSceneOk(true);
      } else if (retryCountRef.current < 3) {
        retryCountRef.current++;
        setTimeout(check, 300);
      } else {
        setSceneOk(false);
      }
    };
    check();
    return () => {
      active = false;
    };
  }, []);

  // Jaring pengaman: kalau onReady tidak pernah datang
  useEffect(() => {
    if (ready || contextLost) return;
    const t = setTimeout(() => setReady(true), SKELETON_TIMEOUT);
    return () => clearTimeout(t);
  }, [ready, contextLost]);

  // Auto-retry saat context lost (1x percobaan otomatis, tanpa perlu reload manual)
  useEffect(() => {
    if (!contextLost) return;
    const t = setTimeout(() => {
      console.log('[LanyardSection] Auto-recovering lost WebGL context...');
      setContextLost(false);
      setReady(false);
      setRemountKey((k) => k + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [contextLost]);

  // sceneOk === null && ready → timeout menembak sebelum cek preload selesai
  // → tampilkan fallback dulu; kalau foto akhirnya load, scene mount dan
  // fallback hilang (self-healing).
  const showFallback =
    contextLost || crashed || sceneOk === false || (sceneOk === null && ready);
  const showScene = sceneOk === true;

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

      {/* Lanyard 3D interaktif.
          - sceneOk false → tidak pernah mount (WebGL/foto bermasalah).
          - contextLost → scene TETAP ter-mount supaya event restore diterima;
            canvas rusaknya ditutup fallback di bawah.
          - crashed (JS error) → ErrorBoundary unmount, fallback statis.
          - key={remountKey} → remount scene bersih saat context restore. */}
      {showScene && !crashed && (
        <ErrorBoundary
          name="Lanyard3D"
          fallback={<LanyardFallback />}
          onError={() => {
            setReady(true);
            setCrashed(true);
          }}
        >
          <Lanyard3D
            key={remountKey}
            onReady={() => setReady(true)}
            onContextLost={() => {
              console.warn('[Lanyard3D] WebGL context lost');
              setContextLost(true);
              setReady(true); // lepas skeleton supaya fallback kelihatan
            }}
            onContextRestored={() => {
              console.log('[Lanyard3D] WebGL context restored, remount');
              setContextLost(false);
              setReady(false); // skeleton tampil sebentar saat remount
              setRemountKey((k) => k + 1); // scene baru, state bersih
            }}
          />
        </ErrorBoundary>
      )}

      {/* Fallback statis — menutup canvas saat context lost, atau menggantikan
          scene sepenuhnya saat WebGL/foto tidak layak / scene crash. */}
      {showFallback && (
        <div className="absolute inset-0 z-20">
          <LanyardFallback />
        </div>
      )}

      {/* Skeleton menutup section dari HTML awal sampai scene 3D benar-benar
          siap (onReady), lalu fade-out 0.4s — tanpa celah blank di antaranya. */}
      <AnimatePresence>
        {!ready && !showFallback && (
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
