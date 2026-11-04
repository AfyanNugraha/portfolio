'use client';

import dynamic from 'next/dynamic';

const Lanyard3D = dynamic(() => import('./Lanyard3D'), { ssr: false });

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

      {/* Lanyard 3D interaktif */}
      <Lanyard3D />
    </section>
  );
}
