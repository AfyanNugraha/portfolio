import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getContact, getProfile, getSkills, professionRoles } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const profile = getProfile();
const { socials } = getContact();
const { categories } = getSkills();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: profile.seoTitle,
  description: profile.seoDescription,
  applicationName: profile.name,
  keywords: [
    'portfolio',
    'cybersecurity',
    'DFIR',
    'digital forensics',
    'incident response',
    'web development',
    'software engineering',
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: profile.seoTitle,
    title: profile.seoTitle,
    description: profile.seoDescription,
    // og:image otomatis dari app/opengraph-image.tsx (file-based > object)
  },
  twitter: {
    card: 'summary_large_image',
    title: profile.seoTitle,
    description: profile.seoDescription,
    // twitter:image jatuh ke og:image (opengraph-image.tsx)
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
};

/** Structured data Person — dibaca Google sebagai knowledge panel/knowledge graph. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: SITE_URL,
  image: `${SITE_URL}/id-card.jpeg`,
  jobTitle: professionRoles(profile.profession),
  description: profile.seoDescription,
  sameAs: socials
    .map((s) => s.href)
    .filter((href) => /^https?:\/\//.test(href))
    // buang parameter tracking (?cplk=, ?utm_...) → URL profil bersih
    .map((href) => href.split('?')[0]),
  knowsAbout: categories.flatMap((c) => c.skills.map((s) => s.name)),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* JSON-LD: render sebagai <script> native, scrub "<" cegah XSS (panduan Next.js) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  );
}
