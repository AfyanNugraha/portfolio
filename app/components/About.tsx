'use client';

import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { getAbout } from '@/lib/content';

const { header, tools } = getAbout();

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-32 bg-[#0d0d0d] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="01"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        {/* ArtCraft-style grid for tools */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-5 rounded-xl bg-[#121212] border border-zinc-800/80 hover:border-blue-500 transition-all flex flex-col justify-between min-h-36 gap-4 group cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center font-mono text-xs text-zinc-300 group-hover:border-zinc-500 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div>
                <h4 className="text-white font-medium text-base group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">{tool.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
