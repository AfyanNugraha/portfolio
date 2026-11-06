'use client';

/**
 * PdfViewer — render PDF inline dengan pdf.js (react-pdf).
 * Render canvas pdf.js bekerja di semua browser termasuk mobile (Chrome Android).
 */

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Worker diserve dari public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type PdfViewerProps = {
  file: string;
  onDone?: () => void;
};

export default function PdfViewer({ file, onDone }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={onDone}
        className="py-4 sm:py-6"
        loading={null}
      >
        {numPages > 0 &&
          Array.from({ length: numPages }, (_, i) => (
            <div key={`page-${i}`} className="mx-auto mb-4 w-fit shadow-lg shadow-black/60">
              <Page
                pageNumber={i + 1}
                width={width || undefined}
                renderMode="canvas"
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={i === 0 ? onDone : undefined}
                className="rounded-sm"
              />
            </div>
          ))}
      </Document>
    </div>
  );
}
