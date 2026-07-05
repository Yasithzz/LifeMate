// Self-contained SVG avatar presets (no network calls) — flat bust-style icons
// grouped by gender so users can pick a default profile picture instead of uploading one.

const SHIRT = '#211B36'

function bust({ bg, skin, hairBack = '', hairTop, extra = '' }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bg}" />
      ${hairBack}
      <ellipse cx="50" cy="108" rx="40" ry="30" fill="${SHIRT}" />
      <rect x="43" y="66" width="14" height="16" rx="5" fill="${skin}" />
      <circle cx="50" cy="50" r="21" fill="${skin}" />
      ${hairTop}
      ${extra}
      <circle cx="42.5" cy="49" r="2.3" fill="#2B2140" />
      <circle cx="57.5" cy="49" r="2.3" fill="#2B2140" />
      <path d="M 42 59 Q 50 65 58 59" stroke="#2B2140" stroke-width="2" fill="none" stroke-linecap="round" />
    </svg>
  `.trim()
}

const MALE = [
  {
    id: 'm1', label: 'Short crop',
    svg: bust({
      bg: '#6D28D9', skin: '#E0AC69',
      hairTop: `<ellipse cx="50" cy="37" rx="22" ry="15" fill="#1C1B18" /><rect x="27" y="42" width="46" height="10" fill="#1C1B18" />`,
    }),
  },
  {
    id: 'm2', label: 'Side part',
    svg: bust({
      bg: '#0EA5E9', skin: '#F1C27D',
      hairTop: `<path d="M 28 44 Q 30 22 50 21 Q 70 22 72 44 Q 60 34 50 36 Q 38 34 28 44 Z" fill="#3B2415" /><rect x="26" y="38" width="8" height="16" rx="3" fill="#3B2415" /><rect x="66" y="38" width="8" height="16" rx="3" fill="#3B2415" />`,
    }),
  },
  {
    id: 'm3', label: 'Buzz + beard',
    svg: bust({
      bg: '#059669', skin: '#8D5524',
      hairTop: `<ellipse cx="50" cy="36" rx="21" ry="12" fill="#151515" />`,
      extra: `<path d="M 30 56 Q 32 70 50 72 Q 68 70 70 56 Q 68 66 50 67 Q 32 66 30 56 Z" fill="#151515" opacity="0.85" />`,
    }),
  },
  {
    id: 'm4', label: 'Curly top',
    svg: bust({
      bg: '#D97706', skin: '#C68642',
      hairTop: `<circle cx="33" cy="36" r="8" fill="#1C1B18" /><circle cx="42" cy="30" r="9" fill="#1C1B18" /><circle cx="53" cy="28" r="9" fill="#1C1B18" /><circle cx="64" cy="32" r="8.5" fill="#1C1B18" /><circle cx="70" cy="41" r="7" fill="#1C1B18" />`,
    }),
  },
]

const FEMALE = [
  {
    id: 'f1', label: 'Long straight',
    svg: bust({
      bg: '#DB2777', skin: '#F1C27D',
      hairBack: `<path d="M 22 100 Q 18 40 50 30 Q 82 40 78 100 L 66 100 Q 70 55 50 50 Q 30 55 34 100 Z" fill="#3B2415" />`,
      hairTop: `<path d="M 28 42 Q 30 20 50 19 Q 70 20 72 42 Q 60 30 50 32 Q 40 30 28 42 Z" fill="#3B2415" />`,
    }),
  },
  {
    id: 'f2', label: 'Bob cut',
    svg: bust({
      bg: '#4F46E5', skin: '#E0AC69',
      hairBack: `<path d="M 27 76 Q 22 40 50 32 Q 78 40 73 76 Q 74 62 66 58 Q 68 78 60 82 L 60 60 Q 50 68 40 60 L 40 82 Q 32 78 34 58 Q 26 62 27 76 Z" fill="#1C1B18" />`,
      hairTop: `<path d="M 28 42 Q 30 21 50 20 Q 70 21 72 42 Q 60 30 50 32 Q 40 30 28 42 Z" fill="#1C1B18" />`,
    }),
  },
  {
    id: 'f3', label: 'High bun',
    svg: bust({
      bg: '#0891B2', skin: '#C68642',
      hairBack: `<path d="M 30 70 Q 27 45 50 40 Q 73 45 70 70 L 63 70 Q 66 52 50 50 Q 34 52 37 70 Z" fill="#5C3A21" />`,
      hairTop: `<path d="M 29 40 Q 31 22 50 21 Q 69 22 71 40 Q 60 30 50 32 Q 40 30 29 40 Z" fill="#5C3A21" />`,
      extra: `<circle cx="50" cy="17" r="8" fill="#5C3A21" />`,
    }),
  },
  {
    id: 'f4', label: 'Wavy pink',
    svg: bust({
      bg: '#7C3AED', skin: '#8D5524',
      hairBack: `<path d="M 20 98 Q 14 42 50 29 Q 86 42 80 98 L 68 98 Q 74 55 50 48 Q 26 55 32 98 Z" fill="#4A2C1B" />`,
      hairTop: `<path d="M 27 43 Q 29 19 50 18 Q 71 19 73 43 Q 60 29 50 31 Q 40 29 27 43 Z" fill="#4A2C1B" />`,
    }),
  },
]

function toDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const MALE_AVATARS = MALE.map(p => ({ ...p, gender: 'male', src: toDataUri(p.svg) }))
export const FEMALE_AVATARS = FEMALE.map(p => ({ ...p, gender: 'female', src: toDataUri(p.svg) }))
export const AVATAR_PRESETS = [...MALE_AVATARS, ...FEMALE_AVATARS]
