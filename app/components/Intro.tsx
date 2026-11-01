'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Logo className="w-16 h-16 text-white" />
          </motion.div>

          {/* thin loading line */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Monogram mark — angular "A" style glyph. */
export function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <path
        d="M24 4 L44 44 H33 L24 24 L15 44 H4 Z"
        fill="currentColor"
      />
      <path d="M18 34 H30 L27 28 H21 Z" fill="#0a0a0a" />
    </svg>
  );
}
