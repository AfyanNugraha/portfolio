'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getProfile } from '@/lib/content';

const profile = getProfile();

/** Pecah `**kata**` menjadi teks tebal. */
function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="text-white font-medium">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

const TILES = [
  {
    cls: 'top-[12%] left-[4%] w-44 h-32',
    tiltY: 14,
    tiltX: 6,
    anim: { y: [0, -18, 0], rotate: [0, 3, 0] },
    duration: 9,
    gradient: 'from-purple-600/40 via-indigo-500/20 to-transparent',
    icon: '&#9678;',
    label: 'WORK LOG',
  },
  {
    cls: 'top-[8%] right-[6%] w-52 h-36',
    tiltY: -12,
    tiltX: 4,
    anim: { y: [0, 16, 0], rotate: [0, -3, 0] },
    duration: 11,
    gradient: 'from-blue-600/40 via-sky-500/20 to-transparent',
    icon: '&#9673;',
    label: 'SOLVED',
  },
  {
    cls: 'bottom-[26%] right-[12%] w-44 h-40',
    tiltY: -16,
    tiltX: -5,
    anim: { y: [0, -22, 0], rotate: [0, 4, 0] },
    duration: 12,
    gradient: 'from-emerald-600/40 via-teal-500/20 to-transparent',
    icon: '&#9670;',
    label: 'IN PROGRESS',
  },
  {
    cls: 'bottom-[20%] left-[8%] w-40 h-32',
    tiltY: 16,
    tiltX: -4,
    anim: { y: [0, 20, 0], rotate: [0, -4, 0] },
    duration: 10,
    gradient: 'from-orange-600/40 via-amber-500/20 to-transparent',
    icon: '&#9632;',
    label: 'FOCUS',
  },
  {
    cls: 'top-[42%] right-[2%] w-32 h-28',
    tiltY: -20,
    tiltX: 8,
    anim: { y: [0, -14, 0], rotate: [0, 5, 0] },
    duration: 8,
    gradient: 'from-rose-600/40 via-red-500/20 to-transparent',
    icon: '&#10023;',
    label: 'NOTES',
  },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* Curved neon arcs (ArtCraft-style) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter id="arc-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="55%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <motion.ellipse
          cx="620" cy="450" rx="560" ry="380"
          fill="none" stroke="url(#g1)" strokeWidth="2.5"
          strokeDasharray="520 2200"
          filter="url(#arc-blur)"
          transform="rotate(-24 620 450)"
          animate={{ strokeDashoffset: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="820" cy="440" rx="600" ry="420"
          fill="none" stroke="url(#g2)" strokeWidth="2.5"
          strokeDasharray="460 2400"
          filter="url(#arc-blur)"
          transform="rotate(18 820 440)"
          animate={{ strokeDashoffset: [0, 110, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="720" cy="470" rx="520" ry="360"
          fill="none" stroke="url(#g3)" strokeWidth="2"
          strokeDasharray="380 2200"
          filter="url(#arc-blur)"
          transform="rotate(64 720 470)"
          animate={{ strokeDashoffset: [0, -70, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* Floating forensic tiles with 3D tilt */}
      {TILES.map((tile, i) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, scale: 0.8, rotateX: 0, rotateY: 0 }}
          animate={{
            opacity: 0.8,
            scale: 1,
            rotateX: tile.tiltX,
            rotateY: tile.tiltY,
            ...tile.anim,
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.5 + i * 0.12 },
            scale: { duration: 0.8, delay: 0.5 + i * 0.12 },
            rotateX: { duration: 0.9, delay: 0.5 + i * 0.12, ease: 'easeOut' },
            rotateY: { duration: 0.9, delay: 0.5 + i * 0.12, ease: 'easeOut' },
            y: { duration: tile.duration, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: tile.duration, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`absolute hidden md:block ${tile.cls} rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-[2px]`}
          style={{
            transformPerspective: 900,
            background: 'linear-gradient(135deg, #161616 0%, #0c0c0c 100%)',
          }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-60`}
          />
          {/* faint grid, like a forensic capture */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <span
              className="text-white/70 text-lg leading-none"
              dangerouslySetInnerHTML={{ __html: tile.icon }}
            />
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/60 uppercase">
              {tile.label}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 w-full relative z-10 text-center">
        {/* Giant logotype */}
        <h1
          className="flex justify-center text-white font-black leading-[0.85] mb-6 select-none"
          style={{ fontSize: 'clamp(4.5rem, 16vw, 14rem)', letterSpacing: '-0.04em' }}
          aria-label={profile.logotype}
        >
          {profile.logotype.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
        >
          {profile.tagline}{' '}
          <span className="italic font-normal text-white/60" style={{ fontFamily: 'Georgia, serif' }}>
            {profile.taglineItalic}
          </span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {renderBold(profile.bio)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="flex flex-wrap justify-center items-center gap-4"
        >
          <a
            href="#projects"
            className="px-8 py-4 bg-white text-black font-bold text-sm rounded-md hover:bg-blue-500 hover:text-white transition-all"
          >
            VIEW PROJECTS
          </a>
          <a
            href="#certifications"
            className="px-8 py-4 bg-transparent border-2 border-zinc-700 text-zinc-300 font-bold text-sm rounded-md hover:border-blue-500 hover:text-blue-400 transition-all"
          >
            CERTIFICATIONS
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.05 }}
          className="mt-14 pt-6 border-t border-zinc-900 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] text-zinc-600 uppercase tracking-[0.25em] font-mono"
        >
          {profile.heroTags.map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-zinc-800">·</span>}
              <span>{tag}</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
