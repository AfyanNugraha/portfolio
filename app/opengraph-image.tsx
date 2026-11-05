import { ImageResponse } from 'next/og';
import { getProfile, professionRoles } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

/**
 * OG image digenerate saat build (ImageResponse → PNG 1200×630).
 * Next.js otomatis menambahkan <meta property="og:image"> dari file ini —
 * dipakai saat link dibagikan ke WhatsApp/Twitter/Discord/dll.
 *
 * Catatan: pakai default font Noto Sans (regular saja) — jangan set
 * fontWeight bold, karena font bold tidak dimuat di generator.
 */

export const alt = 'Portfolio — Cybersecurity, DFIR & Software Development';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const profile = getProfile();
const role = professionRoles(profile.profession);
const hostname = new URL(SITE_URL).hostname;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: '#0a0a0a',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Glow biru neon di pojok kanan atas */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 56,
            width: 380,
            height: 380,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(59,130,246,0.38) 0%, rgba(59,130,246,0) 68%)',
          }}
        />

        {/* Hairline atas: brand kiri, PORTFOLIO kanan */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            letterSpacing: 6,
            color: '#71717a',
            textTransform: 'uppercase',
            position: 'relative',
          }}
        >
          <span>{profile.brand}</span>
          <span>Portfolio</span>
        </div>

        {/* Judul utama */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 84, letterSpacing: -1.5 }}>{profile.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div
              style={{
                width: 88,
                height: 8,
                borderRadius: 9999,
                background: '#3b82f6',
                display: 'flex',
              }}
            />
            <div style={{ fontSize: 34, color: '#a1a1aa' }}>{role}</div>
          </div>
          <div style={{ fontSize: 28, color: '#52525b' }}>
            {`${profile.tagline} ${profile.taglineItalic}`}
          </div>
        </div>

        {/* Hairline bawah */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            color: '#3f3f46',
            letterSpacing: 4,
            position: 'relative',
          }}
        >
          <span>// PROJECTS · CERTIFICATIONS · EXPERIENCE</span>
          <span>{hostname}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
