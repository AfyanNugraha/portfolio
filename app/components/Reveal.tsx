'use client';

import React from 'react';
import { motion } from 'framer-motion';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  duration?: number;
  className?: string;
};

export default function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.6,
  className,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
