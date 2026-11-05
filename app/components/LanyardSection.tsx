'use client';

import dynamic from 'next/dynamic';
import ErrorBoundary from './ErrorBoundary';
import LanyardFallback from './LanyardFallback';
import LanyardSkeleton from './LanyardSkeleton';

// loading: skeleton tampil selama chunk three.js/R3F masih di-load
const Lanyard3D = dynamic(() => import('./Lanyard3D'), {
  ssr: false,
  loading: () => <LanyardSkeleton />,
});

export default function LanyardSection() {
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

      {/* Lanyard 3D interaktif — ErrorBoundary: fallback statis jika WebGL crash */}
      <ErrorBoundary name="Lanyard3D" fallback={<LanyardFallback />}>
        <Lanyard3D />
      </ErrorBoundary>
    </section>
  );
}
