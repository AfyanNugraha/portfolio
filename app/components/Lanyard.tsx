'use client';

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimationControls,
  useMotionTemplate,
} from 'framer-motion';
import { useEffect, useRef } from 'react';

/** Jarak anchor (ujung atas tali) → kartu, saat posisi diam. */
const REST_LEN = 160;
const STRAP_W = 18;

export default function Lanyard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const swing = useAnimationControls();

  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useTransform(mouseY, [-1, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [-1, 1], [-15, 15]);

  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Posisi kartu (di-drag user) → tali mengikuti: panjang & sudut
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const strapAngle = useTransform([x, y], ([dx, dy]: number[]) =>
    // Dinegasikan: rotasi CSS positif memutar ujung tali yang menggantung ke kiri
    -Math.atan2(dx, Math.max(REST_LEN + dy, 20)) * (180 / Math.PI)
  );
  const strapLen = useTransform([x, y], ([dx, dy]: number[]) =>
    Math.sqrt(dx * dx + Math.max(REST_LEN + dy, 20) ** 2)
  );

  // Glossy reflection mengikuti kursor (tanpa re-render)
  const glossX = useTransform(mouseX, (v) => 50 + v * 40);
  const glossY = useTransform(mouseY, (v) => 50 + v * 40);
  const gloss = useMotionTemplate`radial-gradient(circle at ${glossX}% ${glossY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 30%, transparent 60%)`;

  // Drop-in → ayunan pendulum meredam → sway idle pelan
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await swing.start({
        rotate: [0, -8, 6, -4, 2.5, -1.5, 0.8, 0],
        transition: { duration: 2.6, delay: 1.4, ease: 'easeInOut' },
      });
      if (cancelled) return;
      swing.start({
        rotate: [0, 1.8, -1.8, 0],
        transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
      });
    })();
    return () => {
      cancelled = true;
      swing.stop();
    };
  }, [swing]);

  return (
    <motion.div
      className="relative z-40 select-none"
      initial={{ y: -400, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: 0.5,
        type: 'spring',
        stiffness: 90,
        damping: 12,
      }}
    >
      {/* Pendulum wrapper — putar dari anchor atas */}
      <motion.div
        animate={swing}
        className="relative flex flex-col items-center"
        style={{ transformOrigin: '50% 0%', perspective: 800 }}
      >
        {/* Tali — hitam lebar, teks "ID CARD" berulang, ikut posisi kartu */}
        <motion.div
          className="absolute top-0 z-20 w-[18px] bg-gradient-to-b from-neutral-800 via-black to-neutral-800 rounded-sm shadow-lg overflow-hidden pointer-events-none"
          style={{
            left: `calc(50% - ${STRAP_W / 2}px)`,
            height: strapLen,
            rotate: strapAngle,
            transformOrigin: '50% 0%',
          }}
        >
          {/* tekstur anyaman */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
            }}
          />
          {/* teks berulang */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-white/85 text-[7px] font-bold tracking-[0.18em] uppercase whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              ID CARD · ID CARD · ID CARD
            </span>
          </div>
          {/* sisi tali */}
          <div className="absolute inset-y-0 left-0 w-px bg-white/10" />
          <div className="absolute inset-y-0 right-0 w-px bg-white/5" />

          {/* Klip logam — di ujung tali, ikut berputar */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1 z-10">
            <div className="w-5 h-6 bg-gradient-to-b from-neutral-600 via-neutral-800 to-black rounded-[3px] shadow-md flex items-center justify-center">
              <div className="w-1 h-4 bg-neutral-700 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Kartu — SATU-SATUNYA elemen yang bisa di-drag */}
        <motion.div
          ref={cardRef}
          className="relative z-10 w-28 h-40 sm:w-32 sm:h-48 rounded-xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing"
          style={{
            marginTop: REST_LEN,
            x,
            y,
            rotateX: rotateXSpring,
            rotateY: rotateYSpring,
            transformStyle: 'preserve-3d',
          }}
          drag
          dragSnapToOrigin
          dragConstraints={{ left: -90, right: 90, top: -60, bottom: 80 }}
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 14 }}
          whileDrag={{ scale: 1.05, zIndex: 30 }}
          onMouseMove={(e) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            mouseX.set((e.clientX - centerX) / (rect.width / 2));
            mouseY.set((e.clientY - centerY) / (rect.height / 2));
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          {/* Latar kartu */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800" />

          {/* Foto */}
          <img
            src="/id-card.jpeg"
            alt="ID Card"
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Glossy reflection */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: gloss }}
          />

          {/* Border glow */}
          <div className="absolute inset-2 border border-white/15 rounded-lg pointer-events-none" />

          {/* Label bawah */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md px-3 py-2 border-t border-white/10">
            <p className="text-[10px] text-white/90 font-mono text-center tracking-widest uppercase">
              Afyan Portfolio
            </p>
            <p className="text-[8px] text-white/60 text-center mt-0.5 font-mono">
              Cybersecurity Analyst
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
