/**
 * Base URL produksi — dipakai untuk metadataBase, canonical, og:image,
 * robots.txt, sitemap.xml, dan JSON-LD supaya URL selalu absolut.
 *
 * Override lewat env bila pindah domain:
 *   NEXT_PUBLIC_SITE_URL=https://domain-baru.com
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-b6ug.vercel.app'
).replace(/\/+$/, '');
