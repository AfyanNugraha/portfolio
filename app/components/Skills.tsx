'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Atom,
  Box,
  Code,
  CodeXml,
  Cpu,
  FileCode,
  GitBranch,
  Hexagon,
  Palette,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import SectionHeader from './SectionHeader';
import { getSkills, type SkillItem } from '@/lib/content';

const { header, categories } = getSkills();

/** Nama ikon dari data/skills.md → komponen Lucide. Fallback: Wrench. */
const ICONS: Record<string, LucideIcon> = {
  Atom,
  Box,
  Code,
  CodeXml,
  Cpu,
  FileCode,
  GitBranch,
  Hexagon,
  Palette,
};

function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? Wrench;
}

/** Satu baris skill: ikon + nama + persentase + bar yang mengisi saat masuk viewport. */
function SkillRow({ skill, index }: { skill: SkillItem; index: number }) {
  const Icon = iconFor(skill.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group/skill"
    >
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-lg bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center text-zinc-300 group-hover/skill:text-blue-400 group-hover/skill:border-blue-500/50 transition-colors">
            <Icon size={16} />
          </span>
          <span className="text-sm font-medium text-white truncate">{skill.name}</span>
        </div>
        <span className="font-mono text-xs text-zinc-500 group-hover/skill:text-blue-400 transition-colors tabular-nums">
          {skill.level}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={skill.level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={skill.name}
        className="h-1.5 rounded-full bg-zinc-900 overflow-hidden"
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
          initial={{ width: '0%' }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay: 0.15 + index * 0.08, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

/** Panel satu kategori (dipakai carousel desktop & stack mobile). */
function CategoryPanel({ title, skills }: { title: string; skills: SkillItem[] }) {
  return (
    <div className="h-full p-6 rounded-2xl bg-[#111111] border border-zinc-800/80 hover:border-blue-500 transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
          {title}
        </span>
        <span className="h-px flex-1 bg-zinc-800" />
        <span className="font-mono text-[11px] text-zinc-600 tabular-nums">
          {String(skills.length).padStart(2, '0')}
        </span>
      </div>
      <div className="space-y-5">
        {skills.map((s, i) => (
          <SkillRow key={s.name} skill={s} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false });
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect).off('reInit', onSelect);
    };
  }, [emblaApi]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev();
      if (e.key === 'ArrowRight') emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  return (
    <section id="skills" className="py-20 sm:py-32 bg-[#0a0a0a] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="02"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        {/* Carousel per kategori — mobile: 1 panel/layar, desktop: ~66% + peek */}
        <div>
          <div
            className="overflow-hidden"
            ref={emblaRef}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Skill categories"
            onKeyDown={onKeyDown}
          >
            <div className="flex">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className="flex-[0_0_100%] lg:flex-[0_0_66%] min-w-0 pr-5 flex flex-col"
                >
                  <CategoryPanel title={cat.title} skills={cat.skills} />
                </div>
              ))}
            </div>
          </div>

          {/* Kontrol: dots + panah */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {categories.map((cat, i) => (
                <button
                  key={cat.title}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to ${cat.title}`}
                  aria-current={selected === i}
                  className={`h-1.5 rounded-full transition-all ${
                    selected === i
                      ? 'w-6 bg-blue-500'
                      : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Previous category"
                className="w-9 h-9 rounded-full border border-zinc-800 text-zinc-400 flex items-center justify-center hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                aria-label="Next category"
                className="w-9 h-9 rounded-full border border-zinc-800 text-zinc-400 flex items-center justify-center hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
