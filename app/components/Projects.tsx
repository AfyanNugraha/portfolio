'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { getProjects } from '@/lib/content';

const { header, projects } = getProjects();

export default function Projects() {
  return (
    <section id="projects" className="py-20 sm:py-32 bg-[#0a0a0a] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="03"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-[#111111] border border-zinc-800/80 hover:border-zinc-600 transition-all flex flex-col justify-between group cursor-default"
            >
              <div className="flex flex-col">
                {/* Media preview: custom image or aesthetic DFIR fallback */}
                <div className="relative w-full h-40 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col justify-between relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)',
                          backgroundSize: '16px 16px',
                        }}
                      />
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 relative z-10">
                        <span>// EVIDENCE PREVIEW</span>
                        <span>{item.index}</span>
                      </div>
                      <div className="relative z-10 font-mono text-xs text-zinc-500">
                        &gt; {item.tag.toLowerCase()}.telemetry
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono text-zinc-500">{item.index}</span>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800/60">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
