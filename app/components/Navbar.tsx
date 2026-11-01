'use client';

import React, { useState } from 'react';
import { Logo } from './Intro';
import { getProfile, getContact } from '@/lib/content';

const profile = getProfile();
const { socials } = getContact();

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#certifications', label: 'Certs' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-3 group">
          <Logo className="w-7 h-7 text-white transition-colors group-hover:text-blue-400" />
          <span className="text-white font-semibold tracking-tight text-sm">
            {profile.brand}
          </span>
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400 font-medium">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-blue-400 transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-9 h-9 -mr-2 flex flex-col items-center justify-center gap-1.5 text-zinc-300 hover:text-blue-400 transition-colors"
        >
          <span
            className={`block w-5 h-px bg-current transition-transform duration-300 ${
              open ? 'translate-y-[3.5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-current transition-transform duration-300 ${
              open ? '-translate-y-[3.5px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out bg-[#0a0a0a]/95 border-b border-[#1f1f1f] ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-6 py-4 flex flex-col gap-4 text-sm text-zinc-400 font-medium">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="hover:text-blue-400 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
