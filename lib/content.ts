import profileRaw from '@/data/profile.md';
import aboutRaw from '@/data/about.md';
import experienceRaw from '@/data/experience.md';
import projectsRaw from '@/data/projects.md';
import certificationsRaw from '@/data/certifications.md';
import contactRaw from '@/data/contact.md';
import skillsRaw from '@/data/skills.md';

/**
 * Parser markdown sederhana untuk file konten di folder `data/`.
 * Format:
 *   Kunci: Nilai      → properti
 *   - Item            → daftar
 *   ## Judul          → kelompok baru
 *   <!-- ... -->      → komentar (diabaikan)
 */

export type MdGroup = {
  title: string;
  props: Record<string, string>;
  items: string[];
};

export type ParsedMd = {
  props: Record<string, string>;
  groups: MdGroup[];
};

export function parseMd(raw: string): ParsedMd {
  const props: Record<string, string> = {};
  const groups: MdGroup[] = [];
  let current: MdGroup | null = null;
  let inComment = false;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    // HTML comments
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      continue;
    }
    if (line.startsWith('<!--')) {
      if (!line.includes('-->')) inComment = true;
      continue;
    }

    if (line.startsWith('## ')) {
      current = { title: line.slice(3).trim(), props: {}, items: [] };
      groups.push(current);
      continue;
    }

    if (line.startsWith('# ')) continue; // document title, ignored

    if (line.startsWith('- ')) {
      const item = line.slice(2).trim();
      if (current) current.items.push(item);
      continue;
    }

    // "Key: value" — key = letters/spaces/digits only, split on first colon
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (/^[A-Za-z][A-Za-z0-9 ]*$/.test(key) && value) {
        const target = current ? current.props : props;
        target[key] = value;
        continue;
      }
    }
  }

  return { props, groups };
}

function group(parsed: ParsedMd, title: string): MdGroup {
  const g = parsed.groups.find((x) => x.title.toLowerCase() === title.toLowerCase());
  if (!g) throw new Error(`data/*.md: grup "## ${title}" tidak ditemukan`);
  return g;
}

/** Judul section: { label, meta, title, description } dari props `Label/Meta/Judul/Deskripsi`. */
function header(parsed: ParsedMd) {
  return {
    label: parsed.props.Label ?? '',
    meta: parsed.props.Meta ?? '',
    title: parsed.props.Judul ?? '',
    description: parsed.props.Deskripsi ?? '',
  };
}

function splitRow(item: string, parts: number): string[] {
  return item.split('|').map((s) => s.trim()).slice(0, parts);
}

/**
 * Ekstrak peran dari field `Profesi` di profile.md.
 * Format: "...software engineering - CySec Analyst/DFIR - Software Developer"
 * Hasil: "CySec Analyst/DFIR / Software Developer" (fallback: Profesi penuh).
 */
export function professionRoles(profession: string): string {
  const parts = profession
    .split(' - ')
    .map((s) => s.trim())
    .filter(Boolean);
  return (parts.length > 1 ? parts.slice(1) : parts).join(' / ');
}

/* ---------------- profile.md ---------------- */

const profile = parseMd(profileRaw);

export function getProfile() {
  const p = profile.props;
  return {
    brand: p.Brand ?? 'Afyan.dfir',
    logotype: p.Logotype ?? 'PORTFOLIO',
    name: p.Nama ?? '',
    profession: p.Profesi ?? '',
    tagline: p.Tagline ?? '',
    taglineItalic: p['Tagline Italic'] ?? '',
    bio: p.Bio ?? '',
    seoTitle: p['SEO Judul'] ?? '',
    seoDescription: p['SEO Deskripsi'] ?? '',
    creditFooter: p['Credit Footer'] ?? '',
    heroTags: group(profile, 'Tags Hero').items,
  };
}

/* ---------------- about.md ---------------- */

const about = parseMd(aboutRaw);

export function getAbout() {
  return {
    header: header(about),
    tools: group(about, 'Tools').items.map((item) => {
      const [name = '', desc = ''] = splitRow(item, 2);
      return { name, desc };
    }),
  };
}

/* ---------------- experience.md ---------------- */

const experience = parseMd(experienceRaw);

export function getExperience() {
  return {
    header: header(experience),
    experiences: experience.groups.map((g) => ({
      role: g.title,
      org: g.props.Perusahaan ?? '',
      period: g.props.Periode ?? '',
      points: g.items,
    })),
  };
}

/* ---------------- projects.md ---------------- */

const projects = parseMd(projectsRaw);

export function getProjects() {
  return {
    header: header(projects),
    projects: projects.groups.map((g, idx) => ({
      index: String(idx + 1).padStart(2, '0'),
      tag: g.props.Kategori ?? '',
      title: g.title,
      description: g.props.Deskripsi ?? '',
      image: g.props.Gambar ?? '',
      tags: g.items,
    })),
  };
}

/* ---------------- certifications.md ---------------- */

const certifications = parseMd(certificationsRaw);

export function getCerts() {
  return {
    header: header(certifications),
    certs: certifications.groups.map((g, idx) => ({
      id: String(idx + 1).padStart(2, '0'),
      title: g.title,
      issuer: g.props.Penerbit ?? '',
      desc: g.props.Deskripsi ?? '',
      date: g.props.Tanggal ?? '',
      pdf: g.props.File ?? '',
    })),
  };
}

/* ---------------- skills.md ---------------- */

const skills = parseMd(skillsRaw);

export type SkillItem = {
  name: string;
  /** Persentase 0–100 dari baris `Nama | Persentase | Icon`. */
  level: number;
  /** Nama ikon Lucide React (opsional). */
  icon: string;
};

export function getSkills() {
  return {
    header: header(skills),
    categories: skills.groups.map((g) => ({
      title: g.title,
      skills: g.items.map<SkillItem>((item) => {
        const [name = '', levelRaw = '', icon = ''] = splitRow(item, 3);
        const parsed = parseInt(levelRaw, 10);
        return {
          name,
          level: Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)),
          icon,
        };
      }),
    })),
  };
}

/* ---------------- contact.md ---------------- */

const contact = parseMd(contactRaw);

export function getContact() {
  return {
    header: header(contact),
    socials: group(contact, 'Sosial').items.map((item) => {
      const [name = '', value = '', href = ''] = splitRow(item, 3);
      return { name, value, href };
    }),
  };
}
