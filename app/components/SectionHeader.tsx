'use client';

import React from 'react';
import Reveal from './Reveal';

type SectionHeaderProps = {
  number: string;
  label: string;
  meta?: string;
  /** Judul dari markdown — teks di dalam *bintang* tampil italic serif. */
  title: string;
  description?: string;
  className?: string;
};

/** Pecah `*kata*` menjadi span italic serif ala ArtCraft. */
function renderTitle(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
      <span
        key={i}
        className="italic font-normal text-white/60"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {part.slice(1, -1)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function SectionHeader({
  number,
  label,
  meta,
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-14 ${className}`}>
      {/* Hairline strip: "01 / ABOUT ......... CASE STUDIES" */}
      <Reveal y={12} duration={0.5}>
        <div className="flex items-center justify-between border-y border-zinc-800/80 py-3 mb-10 text-[11px] font-mono uppercase tracking-[0.2em]">
          <span className="text-zinc-400">
            <span className="text-white mr-1">{number}</span>
            <span className="text-zinc-600 mr-1">/</span>
            {label}
          </span>
          {meta && <span className="text-zinc-600 hidden sm:block">{meta}</span>}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <h2 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl">
          {renderTitle(title)}
        </h2>
      </Reveal>

      {description && (
        <Reveal delay={0.12}>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mt-6 leading-relaxed">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
