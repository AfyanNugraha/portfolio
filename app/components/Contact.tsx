'use client';

import { motion } from 'framer-motion';
import SectionHeader from './SectionHeader';
import { getContact } from '@/lib/content';

const { header, socials } = getContact();

export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-32 bg-[#0d0d0d] border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="05"
          label={header.label}
          meta={header.meta}
          title={header.title}
          description={header.description}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          {socials.map((s, idx) => (
            <motion.a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-[#121212] border border-zinc-800 hover:border-blue-500 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">{s.name}</div>
                <div className="text-white font-medium group-hover:text-blue-400 transition-colors text-sm sm:text-base">
                  {s.value}
                </div>
              </div>
              <div className="text-zinc-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
