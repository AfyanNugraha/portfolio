'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getProfile, getContact } from '@/lib/content';

const profile = getProfile();
const { socials } = getContact();

export default function Footer() {
  const currentYear = 2026;
  const socialLinks = socials.filter((s) => s.name.toLowerCase() !== 'email');

  return (
    <footer className="bg-[#0a0a0a] border-t border-zinc-900 py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid sm:grid-cols-3 gap-12 mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="text-white font-bold text-lg mb-2">{profile.name}</h4>
            <p className="text-zinc-500 text-sm">{profile.profession}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h5 className="text-zinc-300 font-mono text-xs uppercase tracking-wider mb-4">Quick Links</h5>
            <div className="flex flex-col gap-2 text-sm text-zinc-400">
              <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#skills" className="hover:text-blue-400 transition-colors">Skills</a>
              <a href="#projects" className="hover:text-blue-400 transition-colors">Projects</a>
              <a href="#certifications" className="hover:text-blue-400 transition-colors">Certs</a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h5 className="text-zinc-300 font-mono text-xs uppercase tracking-wider mb-4">Social</h5>
            <div className="flex flex-col gap-2 text-sm text-zinc-400">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-zinc-900 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-mono">
            <div>© {currentYear} {profile.name}. All rights reserved.</div>
            <div>{profile.creditFooter}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
