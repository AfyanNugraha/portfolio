'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ---------------- Fisika tali (verlet chain) ---------------- */
const N = 24;                 // ditambah untuk panjang lebih
const SEG = 0.05;             // panjang segmen
const GRAV = -9.8;             // gravitasi realistis (m/s^2 setara dunia nyata)
const DAMP = 0.993;           // redaman ringan — ayunan natural meredam perlahan seperti fisika nyata
const ITER = 12;              // perbanyak iterasi agar kaku & rigid seperti pita kain asli
const DT = 1 / 60;            // langkah waktu tetap
const ANCHOR_Y = 1.74;        // posisi anchor (atas layar) setelah jatuh
const START_Y = 4.2;          // posisi anchor sebelum jatuh (di luar layar)
const DROP_DELAY = 0.1;        // jeda sangat singkat
const DROP_DUR = 0.95;         // durasi jatuh diperlama agar lebih elegan
const CARD_W = 0.8;
const CARD_H = 1.15;
const CARD_D = 0.03;
const HALF_W = 0.075;         // setengah lebar pita tali (diperlebar dari 0.03)

const Z_AXIS = new THREE.Vector3(0, 0, 1);

type Shared = {
  drag: boolean;
  target: THREE.Vector3;   // posisi T (ujung bawah tali) yang diinginkan user
  grabOff: THREE.Vector3;  // offset grab: T - titik plano
  ndc: { x: number; y: number }; // posisi kursor (untuk tilt 3D)
  camera: THREE.Camera | null;
  T: THREE.Vector3;        // posisi T live (ditulis Scene)
  hits: THREE.Object3D[];  // mesh yang bisa di-hit untuk mulai drag
};

function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/* ---------------- Tekstur ---------------- */
function makeStrapTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, 64, 128);
  // anyaman tipis
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let y = 4; y < 128; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(64, y);
    ctx.stroke();
  }
  // teks sepanjang tali
  ctx.save();
  ctx.translate(32, 64);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = 'bold 21px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = '3px';
  } catch {
    /* browser lama */
  }
  ctx.fillText('ID CARD', 0, 0);
  ctx.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 6);
  return t;
}

function makeCardTexture(photo: THREE.Texture) {
  const img = photo.image as HTMLImageElement;
  const W = 512;
  const H = 736; // rasio kartu 0.8 : 1.15
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#081020';
  ctx.fillRect(0, 0, W, H);
  
  // Guard: cek apakah image benar-benar berhasil load
  // (img.width > 0 berarti <img> sudah dimuat; width === 0 = gagal/belum)
  if (img && img.width > 0) {
    const s = Math.max(W / img.width, H / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    // Fallback: foto tidak ada / gagal load — render placeholder teks
    ctx.fillStyle = 'rgba(100,100,120,0.3)';
    ctx.fillRect(50, 50, W - 100, H / 2 - 100);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('[photo]', W / 2, H / 4 + 40);
  }
  
  // label bawah
  const barH = 104;
  const barY = H - barH;
  ctx.fillStyle = 'rgba(3,7,18,0.66)';
  ctx.fillRect(0, barY, W, barH);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(0, barY, W, 1.5);
  ctx.textAlign = 'center';
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = '6px';
  } catch {
    /* browser lama */
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('ACHMAD AFYAN NUGRAHA', W / 2, barY + 46);
  try {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = '3px';
  } catch {
    /* browser lama */
  }
  ctx.font = '17px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillText('CYBERSECURITY ANALYST / DFIR', W / 2, barY + 78);
  // bingkai dalam
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.strokeRect(9, 9, W - 18, H - 18);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ---------------- Scene 3D ---------------- */
function Scene({
  shared,
  onReady,
}: {
  shared: Shared;
  onReady?: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const photo = useLoader(THREE.TextureLoader, '/id-card.jpeg');

  const cardRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const frameRef = useRef<THREE.Mesh>(null);
  const photoRef = useRef<THREE.Mesh>(null);

  /* rantai verlet — anchor tetap di tengah, kartu mulai miring dari kanan */
  const P = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const progress = i / (N - 1);
        // Offset horizontal dikurangi agar tidak terlalu miring di awal
        const xOffset = Math.sin((progress * Math.PI) / 2) * 0.2;
        // Mulai dari START_Y dengan jarak segmen alami
        const yPos = START_Y - i * SEG;
        return {
          pos: new THREE.Vector3(xOffset, yPos, 0),
          prev: new THREE.Vector3(xOffset, yPos, 0),
        };
      }),
    []
  );

  /* geometri pita tali */
  const ribbon = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 2 * 3);
    const uv = new Float32Array(N * 2 * 2);
    for (let i = 0; i < N; i++) {
      uv[i * 4] = 0;
      uv[i * 4 + 1] = i / (N - 1);
      uv[i * 4 + 2] = 1;
      uv[i * 4 + 3] = i / (N - 1);
    }
    const idx: number[] = [];
    for (let i = 0; i < N - 1; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      idx.push(a, b, d, a, d, c);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);

  const strapTex = useMemo(() => makeStrapTexture(), []);
  const cardTex = useMemo(() => makeCardTexture(photo), [photo]);

  useEffect(() => {
    shared.camera = camera;
    shared.T = P[N - 1].pos;
    if (frameRef.current && photoRef.current) {
      shared.hits = [frameRef.current, photoRef.current];
    }
    return () => {
      ribbon.dispose();
      strapTex.dispose();
      cardTex.dispose();
    };
  }, [camera, shared]);

  /*
   * Sinyal "scene siap" untuk skeleton di LanyardSection.
   * Scene ini baru commit setelah useLoader('/id-card.jpeg') selesai
   * (useLoader men-suspend di Suspense), jadi efek ini jalan tepat
   * saat texture sudah ada. Delay 2 requestAnimationFrame agar
   * benar-benar ada frame yang ter-render sebelum skeleton fade-out.
   * Ref: prop onReady berupa inline arrow — tidak boleh meng-cancel rAF.
   */
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => onReadyRef.current?.());
    });
    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, []);

  const acc = useRef(0);
  const elapsedTime = useRef(0);
  const tmpD = new THREE.Vector3();
  const tmpUp = new THREE.Vector3();
  const tmpSide = new THREE.Vector3();
  const tmpTan = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  // Low-pass velocity kartu (dipakai untuk tilt) — menekan noise osilasi
  const velSmooth = new THREE.Vector2();
  // State orientasi: yaw halus (anti-flip), gain tilt mulus, deteksi release
  const yawSmooth = useRef(0);
  const tiltGainSmooth = useRef(0);
  const wasDragging = useRef(false);

  function anchorY(t: number) {
    if (t < DROP_DELAY) return START_Y;
    if (t < DROP_DELAY + DROP_DUR) {
      const p = (t - DROP_DELAY) / DROP_DUR;
      return START_Y + (ANCHOR_Y - START_Y) * easeInOutCubic(p);
    }
    return ANCHOR_Y + Math.sin(t * 0.7) * 0.008;
  }

  function step(t: number) {
    const dragging = shared.drag;
    // anchor (titik paling atas, menempel navbar)
    const ax = t > DROP_DELAY + DROP_DUR ? Math.sin(t * 0.5) * 0.015 : 0;
    P[0].pos.set(ax, anchorY(t), 0);
    P[0].prev.copy(P[0].pos);

    // Warm-up / inisialisasi awal agar tidak ada sentakan di awal drop
    if (t < DROP_DELAY + 0.05) {
      for (let i = 1; i < N; i++) {
        P[i].prev.copy(P[i].pos);
      }
      return;
    }

    // Angin di-fade-in perlahan setelah selesai jatuh agar tidak menendang
    const dropEndTime = DROP_DELAY + DROP_DUR;
    const windMul = t > dropEndTime ? smoothstep(dropEndTime, dropEndTime + 1.2, t) * 0.35 : 0;

    for (let i = 1; i < N; i++) {
      if (dragging && i === N - 1) continue;
      const p = P[i].pos;
      const pr = P[i].prev;
      let vx = (p.x - pr.x) * DAMP;
      let vy = (p.y - pr.y) * DAMP;
      let vz = (p.z - pr.z) * DAMP;

      // Batasi kecepatan per frame — mencegah ledakan numerik,
      // tidak membatasi ayunan normal (pendulum alami < 0.12)
      const speed = Math.hypot(vx, vy, vz);
      const maxV = 0.12;
      if (speed > maxV) {
        const ratio = maxV / speed;
        vx *= ratio;
        vy *= ratio;
        vz *= ratio;
      }

      pr.copy(p);
      const fx = windMul * Math.sin(t * 0.9 + i * 0.25) * 0.04;
      const fz = windMul * Math.sin(t * 0.6 + i * 0.4) * 0.02;
      p.x += vx + fx * DT * DT;
      p.y += vy + GRAV * DT * DT;
      p.z += vz + fz * DT * DT;
      p.z = THREE.MathUtils.clamp(p.z, -0.8, 0.8);
    }

    // ujung bawah tali dipegang user
    if (dragging) {
      const tn = P[N - 1];
      tmpD.subVectors(shared.target, tn.pos);
      // Damping drag ringan — kartu mengikuti tangan tapi tetap ada bobot
      const dragDamp = 0.96;
      tn.prev.copy(tn.pos).addScaledVector(tmpD.subVectors(tn.pos, tn.prev), dragDamp);
      tn.pos.addScaledVector(tmpD.subVectors(shared.target, tn.pos), 0.4);

      // Limit kecepatan drag (mencegah snap, tapi tetap responsif)
      const v = tmpD.subVectors(tn.pos, tn.prev);
      const maxSpeed = 0.1;
      if (v.length() > maxSpeed) {
        v.setLength(maxSpeed);
        tn.prev.copy(tn.pos).sub(v);
      }
    } else {
      // Saat dilepas: sebagian besar momentum dipertahankan seperti
      // fisika nyata (pendulum berayun lalu meredam), hanya kelebihan
      // energi dari snap yang dipangkas.
      const tn = P[N - 1];
      tn.prev.lerp(tn.pos, 0.25);
    }

    // constraint jarak antar titik (tali tidak melar)
    for (let k = 0; k < ITER; k++) {
      for (let i = 0; i < N - 1; i++) {
        const a = P[i];
        const b = P[i + 1];
        tmpD.subVectors(b.pos, a.pos);
        const dist = tmpD.length();
        if (dist < 1e-6) continue;
        const fixA = i === 0;
        const fixB = dragging && i + 1 === N - 1;
        if (fixA && fixB) continue;
        const corr = (dist - SEG) / dist;
        if (fixA) b.pos.addScaledVector(tmpD, -corr);
        else if (fixB) a.pos.addScaledVector(tmpD, corr);
        else {
          a.pos.addScaledVector(tmpD, corr * 0.5);
          b.pos.addScaledVector(tmpD, -corr * 0.5);
        }
      }
    }
  }

  function updateVisuals() {
    // Deteksi transisi drag → lepas: reset velocity & ramp-in tilt
    // agar tidak ada kick / lompatan orientasi tepat saat jari melepas.
    if (wasDragging.current && !shared.drag) {
      velSmooth.set(0, 0);
      tiltGainSmooth.current = 0;
    }
    wasDragging.current = shared.drag;

    /* pita tali */
    const pos = ribbon.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const a = P[Math.max(i - 1, 0)].pos;
      const b = P[Math.min(i + 1, N - 1)].pos;
      tmpTan.subVectors(b, a);
      if (tmpTan.lengthSq() < 1e-8) tmpTan.set(0, -1, 0);
      tmpTan.normalize();
      tmpSide.crossVectors(tmpTan, Z_AXIS);
      if (tmpSide.lengthSq() < 1e-8) tmpSide.set(1, 0, 0);
      else tmpSide.normalize();
      const p = P[i].pos;
      const o = i * 6;
      pos[o] = p.x - tmpSide.x * HALF_W;
      pos[o + 1] = p.y - tmpSide.y * HALF_W;
      pos[o + 2] = p.z - tmpSide.z * HALF_W;
      pos[o + 3] = p.x + tmpSide.x * HALF_W;
      pos[o + 4] = p.y + tmpSide.y * HALF_W;
      pos[o + 5] = p.z + tmpSide.z * HALF_W;
    }
    ribbon.attributes.position.needsUpdate = true;
    ribbon.computeVertexNormals();

    /* kartu menempel di ujung tali */
    const T = P[N - 1].pos;
    const A = P[N - 2].pos;
    tmpD.subVectors(T, A);
    if (tmpD.lengthSq() < 1e-8) tmpD.set(0, -1, 0);
    tmpD.normalize();
    if (cardRef.current) {
      // Posisikan cardRef agar ujung tali (T) masuk dan berakhir di dalam
      // klip logam penjepit tali (crimp ferrule) di posisi CARD_H / 2 + 0.08
      cardRef.current.position.copy(T).addScaledVector(tmpD, CARD_H / 2 + 0.08);
      // Orientasi yaw 2D — kartu selalu menghadap kamera, tanpa ambiguitas flip.
      // (setFromUnitVectors bisa berputar 180° mendadak saat arah tali berbalik)
      tmpUp.copy(tmpD).negate();
      let sx = tmpUp.x;
      let sy = tmpUp.y;
      if (Math.abs(sx) < 1e-5 && Math.abs(sy) < 1e-5) {
        sx = 0;
        sy = 1;
      }
      const targetYaw = -Math.atan2(sx, sy);
      // Unwrap sudut terpendek (hindari lompat ±2π saat melewati ±π)
      let d = targetYaw - yawSmooth.current;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      // Batasi kecepatan rotasi per frame — mencegah flip mendadak
      d = THREE.MathUtils.clamp(d, -0.06, 0.06);
      // Smoothing adaptif: responsif saat drag, lebih lembut saat bebas
      yawSmooth.current += d * (shared.drag ? 0.35 : 0.18);
      quat.setFromAxisAngle(Z_AXIS, yawSmooth.current);
      cardRef.current.quaternion.copy(quat);
    }
    if (tiltRef.current) {
      // Low-pass velocity agar tidak mengikuti noise osilasi constraint
      const vx = T.x - P[N - 1].prev.x;
      const vy = T.y - P[N - 1].prev.y;
      velSmooth.x += (vx - velSmooth.x) * 0.3;
      velSmooth.y += (vy - velSmooth.y) * 0.3;

      // Tautness: jarak ujung tali vs SEG. Saat tali tegang (taut),
      // kartu sudah mengikuti arah tali (yaw) → tilt ekstra ditekan.
      const tautness = THREE.MathUtils.clamp(tmpD.length() / SEG, 0, 1);
      const targetGain = 1 - smoothstep(0.82, 1.0, tautness);
      // Low-pass gain → transisi tilt mulus, tidak melompat saat release
      tiltGainSmooth.current += (targetGain - tiltGainSmooth.current) * 0.1;
      const tiltGain = tiltGainSmooth.current;

      const twist = THREE.MathUtils.clamp(-velSmooth.x * 0.4, -0.07, 0.07) * tiltGain;
      const pitch = THREE.MathUtils.clamp(velSmooth.y * 0.2, -0.06, 0.06) * tiltGain;
      const tx = -shared.ndc.y * 0.1 + pitch;
      const ty = shared.ndc.x * 0.16 + twist;
      tiltRef.current.rotation.x += (tx - tiltRef.current.rotation.x) * 0.08;
      tiltRef.current.rotation.y += (ty - tiltRef.current.rotation.y) * 0.08;
    }
  }

  useFrame((state, delta) => {
    elapsedTime.current += delta;
    acc.current += Math.min(delta, 0.08);
    let n = 0;
    while (acc.current >= DT && n < 3) {
      step(elapsedTime.current);
      acc.current -= DT;
      n++;
    }
    if (n === 3) acc.current = 0;
    updateVisuals();
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 3]} intensity={1.3} />
      <directionalLight position={[-3, -1, 2]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[0, 0, 3]} intensity={6} distance={8} color="#dbeafe" />

      {/* Environment (PMREM) — hanya di desktop; di mobile lights saja cukup */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={4} position={[0, 3, -4]} scale={[8, 4, 1]} color="#dbeafe" />
          <Lightformer form="rect" intensity={2.5} position={[-4, 1, -3]} scale={[4, 6, 1]} color="#93c5fd" />
          <Lightformer form="circle" intensity={3} position={[3, -2, -3]} scale={3} color="#ffffff" />
        </Environment>
      )}

      {/* tali (pita 3D) */}
      <mesh geometry={ribbon} castShadow frustumCulled={false}>
        <meshStandardMaterial
          map={strapTex}
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.15}
          emissive="#111"
        />
      </mesh>

      {/* kartu ID */}
      <group ref={cardRef}>
        {/* 1. Klip logam penjepit ujung tali (crimp ferrule) — lebar 0.165 agar tali 0.15 masuk rapi */}
        <mesh position={[0, CARD_H / 2 + 0.08, 0]}>
          <boxGeometry args={[0.165, 0.06, 0.028]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* 2. Ring logam penghubung antara penjepit tali dan kartu */}
        <mesh position={[0, CARD_H / 2 + 0.035, 0]}>
          <torusGeometry args={[0.024, 0.006, 12, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* 3. Klip/tab pengait di tepi atas kartu */}
        <mesh position={[0, CARD_H / 2, 0]}>
          <boxGeometry args={[0.08, 0.035, 0.038]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} />
        </mesh>

        <group ref={tiltRef}>
          {/* badan kartu membulat */}
          <RoundedBox ref={frameRef} args={[CARD_W, CARD_H, CARD_D]} radius={0.028} smoothness={4}>
            <meshPhysicalMaterial color="#0c1c36" roughness={0.4} metalness={0} clearcoat={0.6} />
          </RoundedBox>
          {/* foto + label — margin 6% agar terlihat bingkai */}
          <mesh ref={photoRef} position={[0, 0, CARD_D / 2 + 0.001]}>
            <planeGeometry args={[CARD_W * 0.88, CARD_H * 0.88]} />
            <meshStandardMaterial map={cardTex} roughness={0.42} metalness={0} />
          </mesh>
          {/* kilau glossy */}
          <mesh position={[0, 0, CARD_D / 2 + 0.0025]}>
            <planeGeometry args={[CARD_W * 0.88, CARD_H * 0.88]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.07}
              roughness={0.05}
              metalness={0}
              envMapIntensity={3}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

/* ---------------- Host: canvas + area interaksi ---------------- */
export default function Lanyard3D({
  onReady,
  onContextLost,
  onContextRestored,
}: {
  onReady?: () => void;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}) {
  const sharedRef = useRef<Shared>({
    drag: false,
    target: new THREE.Vector3(0, ANCHOR_Y - N * SEG, 0),
    grabOff: new THREE.Vector3(),
    ndc: { x: 0, y: 0 },
    camera: null,
    T: new THREE.Vector3(0, ANCHOR_Y - N * SEG, 0),
    hits: [],
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  // Deteksi device type — mobile cukup DPR 1 atau 1.5; desktop 1-2
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const dprMax = isMobile ? 1.5 : 2;

  // Ref: prop callback inline — jangan bergantung pada identity-nya.
  const ctxLostRef = useRef(onContextLost);
  ctxLostRef.current = onContextLost;
  const ctxRestoredRef = useRef(onContextRestored);
  ctxRestoredRef.current = onContextRestored;

  // Pasang listener context loss langsung di canvas saat renderer dibuat
  // (onCreated → canvas pasti sudah ada; memasang di parent berisiko
  // keburu jalan sebelum dynamic import selesai, lalu tidak terpasang).
  // three.js sudah preventDefault + re-init sendiri saat restore — di sini
  // kita hanya melapor ke parent supaya fallback statis bisa tampil.
  const onCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
    const el = gl.domElement;
    el.addEventListener(
      'webglcontextlost',
      () => {
        ctxLostRef.current?.();
      },
      false
    );
    el.addEventListener(
      'webglcontextrestored',
      () => {
        ctxRestoredRef.current?.();
      },
      false
    );
  };

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const ndcVec = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hitPt = useMemo(() => new THREE.Vector3(), []);

  const toNdc = (clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const s = sharedRef.current;
    s.ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    s.ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    ndcVec.set(s.ndc.x, s.ndc.y);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sharedRef.current;
    if (!s.camera) return;
    toNdc(e.clientX, e.clientY);
    ray.setFromCamera(ndcVec, s.camera);
    if (!ray.ray.intersectPlane(plane, hitPt)) return;
    if (ray.intersectObjects(s.hits, false).length === 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    s.drag = true;
    s.grabOff.copy(s.T).sub(hitPt);
    s.target.copy(s.T);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sharedRef.current;
    if (!s.camera) return;
    toNdc(e.clientX, e.clientY);
    if (s.drag) {
      ray.setFromCamera(ndcVec, s.camera);
      if (ray.ray.intersectPlane(plane, hitPt)) {
        s.target.set(
          THREE.MathUtils.clamp(hitPt.x + s.grabOff.x, -0.5, 0.5),
          THREE.MathUtils.clamp(hitPt.y + s.grabOff.y, -0.5, 1.35),
          0
        );
      }
      e.preventDefault();
    }
  };

  const endDrag = () => {
    sharedRef.current.drag = false;
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: !isMobile, alpha: true }}
        dpr={[1, dprMax]}
        onCreated={onCreated}
      >
        <Suspense fallback={null}>
          <Scene shared={sharedRef.current} onReady={onReady} />
        </Suspense>
      </Canvas>

      {/* area interaksi: hanya di zona kartu, sisanya tetap bisa scroll */}
      <div
        className="absolute left-1/2 top-[10%] h-[55%] w-[75%] -translate-x-1/2 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      />
    </div>
  );
}
