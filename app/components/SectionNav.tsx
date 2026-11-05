'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SECTIONS = [
  { id: 'home', label: 'OVERVIEW' },
  { id: 'about', label: 'ABOUT' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'certifications', label: 'CERTIFICATIONS' },
  { id: 'contact', label: 'CONTACT' },
];

export default function SectionNav() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeLabel =
    SECTIONS.find((s) => s.id === active)?.label ?? 'OVERVIEW';

  return (
    <>
      {/* Rotated vertical label — changes with active section */}
      <div className="hidden lg:flex fixed right-16 top-1/2 -translate-y-1/2 z-40 h-64 items-center justify-end pointer-events-none select-none">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeLabel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="text-zinc-500 font-bold uppercase tracking-widest text-sm whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {activeLabel}
          </motion.span>
        </AnimatePresence>
      </div>
    </>
  );
}
