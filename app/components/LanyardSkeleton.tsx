/**
 * Skeleton untuk section home mobile — tampil selama chunk
 * Lanyard3D (three.js + R3F) masih di-load oleh next/dynamic.
 * Geometrinya meniru kartu ID final (tali → strip → foto → baris teks)
 * supaya tidak ada layout shift saat konten asli muncul.
 */
export default function LanyardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat ID card 3D"
      className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none"
    >
      {/* Tali lanyard */}
      <div className="w-1.5 h-32 rounded-full skeleton" />

      {/* Kartu ID */}
      <div className="w-56 sm:w-64 rounded-2xl border border-white/10 bg-[#111111] overflow-hidden shadow-2xl">
        {/* Strip atas (posisi biru di kartu asli) */}
        <div className="h-2 skeleton" />

        <div className="p-5 flex flex-col gap-4">
          {/* Foto */}
          <div className="aspect-square rounded-xl skeleton" />
          {/* Nama + profesi */}
          <div className="h-4 w-3/4 rounded skeleton" />
          <div className="h-3 w-1/2 rounded skeleton" />
        </div>

        {/* Footer strip */}
        <div className="h-10 border-t border-zinc-800 flex items-center px-5">
          <div className="h-2.5 w-2/3 rounded skeleton" />
        </div>
      </div>

      {/* Tagline */}
      <div className="h-3 w-40 rounded skeleton mt-8" />
    </div>
  );
}
