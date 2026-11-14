'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from './Intro';
import { getProfile, getContact } from '@/lib/content';

const profile = getProfile();
const { socials } = getContact();

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#certifications', label: 'Certs' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash !== '#home') {
      window.history.pushState(null, '', '#home');
    }
  };

  const isExpanded = !scrolled || hovered;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* ── Desktop: Morphed Floating Pill ── */}
      <div className="hidden md:flex justify-center pt-4 px-6">
        <nav
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`pointer-events-auto flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] h-12 overflow-hidden
            bg-[#0d0d0d]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]
            ${isExpanded ? 'px-3 py-2 rounded-full gap-1 justify-between' : 'w-12 h-12 px-0 py-0 rounded-full justify-center gap-0'}
          `}
          style={{
            width: isExpanded ? 'auto' : '48px',
            maxWidth: isExpanded ? '1000px' : '48px',
          }}
          aria-label="Site navigation"
        >
          {/* Logo + Brand (Brand disappears when shrunk) */}
          <a
            href="#home"
            onClick={goHome}
            className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group
              ${isExpanded ? 'gap-2 px-3 py-1 mr-1 rounded-full text-white hover:text-blue-400 hover:bg-blue-500/10 shrink-0' : 'justify-center w-full text-white'}
            `}
          >
            <Logo className="w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" />
            <span 
              className={`font-semibold tracking-tight text-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap
                ${isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}
              `}
            >
              {profile.brand}
            </span>
          </a>

          {/* Divider */}
          <span 
            className={`w-px h-4 bg-white/10 mx-1 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isExpanded ? 'opacity-100' : 'opacity-0 scale-0'}
            `} 
          />

          {/* Nav links (Clipped when shrunk) */}
          <div 
            className={`flex items-center gap-1 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap
              ${isExpanded ? 'max-w-[800px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'}
            `}
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Mobile: full-width bar + dropdown (unchanged) ── */}
      <div className="md:hidden backdrop-blur-md bg-[#0a0a0a]/80 border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" onClick={goHome} className="flex items-center gap-3 group">
            <Logo className="w-7 h-7 text-white transition-colors group-hover:text-blue-400" />
            <span className="text-white font-semibold tracking-tight text-sm">
              {profile.brand}
            </span>
          </a>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-1
              text-zinc-300 hover:text-blue-400 transition-colors"
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

        <div
          className={`grid transition-all duration-300 ease-out bg-[#0a0a0a]/95 backdrop-blur-xl border-b shadow-2xl ${
            open
              ? 'grid-rows-[1fr] opacity-100 border-[#1f1f1f]'
              : 'grid-rows-[0fr] opacity-0 border-transparent pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <nav className="px-6 py-6 flex flex-col gap-5 text-base text-zinc-300 font-medium">
              {LINKS.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
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
      </div>
    </header>
  );
}
