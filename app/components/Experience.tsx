'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { getExperience } from '@/lib/content';

const { header, experiences } = getExperience();

export default function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-32 bg-[#0a0a0a] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="04"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        <div className="space-y-12">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="border-l border-zinc-800 pl-8 relative"
            >
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-600 border border-[#0a0a0a]" />

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{exp.role}</h3>
                  <p className="text-blue-400/80 font-mono text-sm">{exp.org}</p>
                </div>
                <span className="text-zinc-500 font-mono text-xs">{exp.period}</span>
              </div>

              <ul className="space-y-2 mt-4 text-zinc-400 text-sm max-w-3xl">
                {exp.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-zinc-600 mt-1">&bull;</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
