'use client';

/**
 * PdfViewer — render PDF inline dengan pdf.js (react-pdf).
 * Dipakai alih-alih <iframe> karena browser mobile (Chrome Android)
 * tidak bisa menampilkan PDF di dalam iframe — hanya memunculkan
 * tombol "Buka". Render canvas pdf.js bekerja di semua browser.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Worker di-copy dari node_modules ke public/ agar tidak bergantung
// pada bundler worker (Turbopack) dan ter-cache sebagai file statis.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type PdfViewerProps = {
  file: string;
  /** Dipanggil saat halaman pertama selesai dirender (atau gagal). */
  onDone?: () => void;
};

export default function PdfViewer({ file, onDone }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [failed, setFailed] = useState(false);

  // Ukuran canvas mengikuti lebar container (responsif di semua layar)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      // Width Page = lebar container dikurangi padding halaman
      setWidth(w > 0 ? Math.floor(w) : 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
  }, []);

  // Halaman pertama selesai → sembunyikan skeleton
  const onFirstPageRender = useCallback(() => {
    onDoneRef.current?.();
  }, []);

  // PDF gagal Termuat → tampilkan fallback (tetap bisa buka/download di footer)
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
          Array.from({ length: numPages }, (_, i) => (
            <div key={`page-${i}`} className="mx-auto mb-4 w-fit shadow-lg shadow-black/60">
              <Page
                pageNumber={i + 1}
                width={width || undefined}
                renderMode="canvas"
                onRenderSuccess={i === 0 ? onFirstPageRender : undefined}
                className="rounded-sm"
              />
            </div>
          ))}
      </Document>
    </div>
  );
}
