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
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            // Home section selalu di posisi paling atas (desktop & mobile),
            // jadi scroll langsung ke atas — scrollIntoView pada elemen
            // display:none (duplikat id="home") itu no-op.
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.location.hash !== '#home') {
              window.history.pushState(null, '', '#home');
            }
          }}
          className="flex items-center gap-3 group"
        >
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
          className="md:hidden w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-1 text-zinc-300 hover:text-blue-400 transition-colors relative group"
        >
          <div className="w-5 flex flex-col items-center justify-center gap-1">
            <span
              className={`block w-5 h-0.5 bg-current transition-all duration-300 transform origin-center ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-all duration-200 ${
                open ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-current transition-all duration-300 transform origin-center ${
                open ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden grid transition-all duration-300 ease-out bg-[#0a0a0a]/95 backdrop-blur-xl border-b shadow-2xl ${
          open ? 'grid-rows-[1fr] opacity-100 border-[#1f1f1f]' : 'grid-rows-[0fr] opacity-0 border-transparent pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <nav className="px-6 py-6 flex flex-col gap-5 text-base text-zinc-300 font-medium">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: open ? `${i * 60}ms` : '0ms',
                }}
                className={`flex items-center justify-between hover:text-blue-400 hover:pl-2 transition-all duration-300 ${
                  open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-xs text-zinc-600 font-mono">0{i + 1}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
