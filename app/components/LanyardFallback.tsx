'use client';

import React from 'react';
import Image from 'next/image';
import { getProfile } from '@/lib/content';

const profile = getProfile();

/**
 * Fallback statis untuk Lanyard3D — tampil jika WebGL/runtime error
 * (ditangkap ErrorBoundary) sehingga section home mobile tetap punya
 * konten, bukan layar kosong.
 */
export default function LanyardFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6">
      {/* Kartu ID statis */}
      <div className="relative w-56 sm:w-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111111]">
        {/* Strip atas ala tali lanyard */}
        <div className="h-2 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700" />

        <div className="p-5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4">
            <span>{profile.brand}</span>
            <span>ID CARD</span>
          </div>

          <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-800 mb-4 bg-zinc-900">
            <Image
              src="/id-card.jpeg"
              alt={`Foto ${profile.name}`}
              fill
              sizes="(min-width: 640px) 256px, 224px"
              className="object-cover"
            />
          </div>

          <h1 className="text-white font-semibold text-base leading-snug">
            {profile.name}
          </h1>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
            {profile.profession}
          </p>
        </div>

        <div className="h-10 border-t border-zinc-800 flex items-center justify-between px-5 font-mono text-[10px] text-zinc-600">
          <span>// 3D MODE UNAVAILABLE</span>
          <span>YZ4N</span>
        </div>
      </div>

      {/* Hint geser/drag tidak relevan tanpa 3D — tampilkan tagline saja */}
      <p className="font-mono text-xs text-zinc-600 text-center">
        {profile.tagline} <span className="italic">{profile.taglineItalic}</span>
      </p>
    </div>
  );
}
