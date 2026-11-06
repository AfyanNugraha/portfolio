'use client';

/**
 * PdfViewer — render PDF inline dengan pdf.js (react-pdf).
 * Dipakai alih-alih <iframe> karena browser mobile (Chrome Android)
 * tidak bisa menampilkan PDF di dalam iframe — hanya memunculkan
 * tombol "Buka". Render canvas pdf.js bekerja di semua browser.
 *
 * Fitur: auto-crop ruang putih margin — konten sertifikat (bounding box
 * non-putih) dipotong agar tampil pas sesuai ukurannya sendiri, bukan
 * penuh A4/Letter yang menyisakan area kosong di bawah.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Worker di-copy dari node_modules ke public/ agar tidak bergantung
// pada bundler worker (Turbopack) dan ter-cache sebagai file statis.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type CropBox = {
  /** Posisi & ukuran konten sebagai pecahan (0–1) relatif halaman. */
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  /** Rasio tinggi/lebar halaman (resolusi-independent). */
  aspect: number;
};

// Cache per-URL: `false` = sudah dicek, tak perlu crop; CropBox = perlu crop.
const cropCache = new Map<string, CropBox | false>();

/**
 * Deteksi bounding box konten non-putih pada canvas.
 * Downscale dulu ke ≤240px agar scan cepat & hemat memori di mobile.
 * Mengembalikan pecahan (0–1) agar tetap valid saat ukuran berubah.
 */
function detectContentBox(canvas: HTMLCanvasElement): CropBox | null {
  const { width: bw, height: bh } = canvas;
  if (!bw || !bh) return null;

  // Downscale untuk kecepatan scan (fractions tetap sama)
  const scale = Math.min(1, 240 / Math.max(bw, bh));
  const tw = Math.max(1, Math.round(bw * scale));
  const th = Math.max(1, Math.round(bh * scale));
  const off = document.createElement('canvas');
  off.width = tw;
  off.height = th;
  const octx = off.getContext('2d', { willReadFrequently: true });
  if (!octx) return null;
  octx.drawImage(canvas, 0, 0, tw, th);

  let data: Uint8ClampedArray;
  try {
    data = octx.getImageData(0, 0, tw, th).data;
  } catch {
    // Canvas kena cross-origin (SecurityError) → tak bisa dibaca, jangan crop
    return null;
  }
  const T = 242; // threshold: piksel ≥ T dianggap putih (abaikan anti-aliasing)
  let minX = tw;
  let minY = th;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const i = (y * tw + x) * 4;
      if (data[i] < T || data[i + 1] < T || data[i + 2] < T) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null; // tidak ada konten terdeteksi

  // Padding kecil 1% agar tepi konten tidak terpotong
  const padX = (maxX - minX) * 0.01;
  const padY = (maxY - minY) * 0.01;
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(tw - 1, maxX + padX);
  maxY = Math.min(th - 1, maxY + padY);

  const fx = minX / tw;
  const fy = minY / th;
  const fw = (maxX - minX) / tw;
  const fh = (maxY - minY) / th;

  // Konten sudah memenuhi halaman (≥92% kedua dimensi) → tak perlu crop.
  // Juga menangani PDF berlatar gelap (semua piksel non-putih → bbox penuh).
  if (fw > 0.92 && fh > 0.92) return null;
  // Guard: bbox terlalu kecil kemungkinan noise → jangan crop.
  if (fw * fh < 0.05) return null;

  return { fx, fy, fw, fh, aspect: bh / bw };
}

type PdfViewerProps = {
  file: string;
  /** Dipanggil saat halaman pertama selesai dirender (atau gagal). */
  onDone?: () => void;
};

export default function PdfViewer({ file, onDone }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);

  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [crop, setCrop] = useState<CropBox | null>(null);
  const [failed, setFailed] = useState(false);

  // Sinkronkan ref callback terbaru (di effect, bukan saat render)
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Ukuran canvas mengikuti lebar container (responsif di semua layar)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(w > 0 ? Math.floor(w) : 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  // Halaman pertama selesai → deteksi crop lalu sembunyikan skeleton
  const onFirstPageRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      onDoneRef.current?.();
      return;
    }
    const cached = cropCache.get(file);
    if (cached !== undefined) {
      setCrop(cached || null);
      onDoneRef.current?.();
      return;
    }
    const detected = detectContentBox(canvas);
    cropCache.set(file, detected || false);
    setCrop(detected);
    onDoneRef.current?.();
  }, [file]);

  // PDF gagal dimuat → fallback (tetap bisa buka/download di footer)
  const onDocumentLoadError = useCallback(() => {
    setFailed(true);
    onDoneRef.current?.();
  }, []);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <span className="text-zinc-500 text-sm">Preview tidak dapat dimuat.</span>
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-sm font-semibold hover:underline"
        >
          Buka PDF di tab baru
        </a>
      </div>
    );
  }

  // Crop hanya bila lebar container sudah terukur (width > 0)
  const showCrop = !!crop && width > 0;
  const fullW = width;
  const fullH = crop ? width * crop.aspect : 0;
  const cropW = crop ? fullW * crop.fw : 0;
  const cropH = crop ? fullH * crop.fh : 0;
  const cropLeft = crop ? fullW * crop.fx : 0;
  const cropTop = crop ? fullH * crop.fy : 0;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="py-4 sm:py-6"
        loading={null}
      >
        {/* Render semua halaman (sertifikat umumnya 1–2 halaman) */}
        {numPages > 0 &&
          Array.from({ length: numPages }, (_, i) => {
            const isFirst = i === 0;
            const cropped = isFirst && showCrop;
            // Struktur elemen sama agar Page tidak unmount saat crop diterapkan
            return (
              <div
                key={`page-${i}`}
                className={
                  cropped
                    ? 'mb-4 mx-auto shadow-lg shadow-black/60'
                    : 'mx-auto mb-4 w-fit shadow-lg shadow-black/60'
                }
                style={
                  cropped
                    ? { width: cropW, height: cropH, overflow: 'hidden', position: 'relative' }
                    : undefined
                }
              >
                <div
                  style={
                    cropped ? { position: 'absolute', left: -cropLeft, top: -cropTop } : undefined
                  }
                >
                  <Page
                    pageNumber={i + 1}
                    width={fullW || undefined}
                    canvasRef={isFirst ? canvasRef : undefined}
                    onRenderSuccess={isFirst ? onFirstPageRender : undefined}
                    className="rounded-sm"
                  />
                </div>
              </div>
            );
          })}
      </Document>
    </div>
  );
}
