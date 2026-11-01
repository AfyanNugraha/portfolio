'use client';

import React, { useState } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5); // 0, 5, 10 ... 100

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  const [pct, setPct] = useState(0);
  const [top, setTop] = useState(0);
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(progress, 'change', (v) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setPct(Math.round(clamped * 100));
    setTop(clamped * 100);
    setVisible(clamped > 0.002 && clamped < 0.998);
  });

  return (
    <div className="hidden lg:block fixed right-0 top-0 h-screen w-16 z-40 pointer-events-none select-none">
      {/* Ruler: ticks + labels 0..100 */}
      <div className="absolute inset-y-6 right-0 flex flex-col justify-between items-end pr-2">
        {TICKS.map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span
              className={`font-mono text-[9px] tracking-wider ${
                t % 25 === 0 ? 'text-zinc-500' : 'text-zinc-700'
              }`}
            >
              {t}
            </span>
            <span
              className={`block h-px ${
                t % 25 === 0 ? 'w-3 bg-zinc-600' : 'w-1.5 bg-zinc-800'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Blue marker + percent readout, travels along the ruler */}
      <div
        className="absolute right-0 w-full transition-[top] duration-100 ease-linear"
        style={{ top: `calc(1.5rem + ${top / 100} * (100% - 3rem))` }}
      >
        <div className="relative flex items-center justify-end">
          <span
            className={`font-mono text-[10px] tracking-widest text-blue-400 transition-opacity duration-300 mr-1 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {String(pct).padStart(3, '0')}%
          </span>
          <span className="block h-px w-6 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>
    </div>
  );
}
