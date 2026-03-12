import { CATEGORIES } from '@/data/categories';

export type LayoutPackId = 'modern' | 'classic' | 'simple' | 'luxury';
export type LayoutPack = {
  id: LayoutPackId;
  name: string;
  description: string;
  // text-only styling
  bgColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontScale?: number;
  // media layout suggestion
  layoutPreference?: 'auto' | 'two-col' | 'mosaic-3' | 'grid-4' | 'grid-5';
};

const PACKS: LayoutPack[] = [
  { id: 'modern', name: 'Hiện đại', description: 'Tươi sáng, hiện đại', bgColor: '#ffffff', textColor: '#111', textAlign: 'left', fontScale: 1.1, layoutPreference: 'mosaic-3' },
  { id: 'classic', name: 'Cổ điển', description: 'Trầm ấm, cổ điển', bgColor: '#fff4e6', textColor: '#4b3d2a', textAlign: 'center', fontScale: 1.0, layoutPreference: 'grid-4' },
  { id: 'simple', name: 'Đơn giản', description: 'Tối giản, tinh gọn', bgColor: '#f3f4f6', textColor: '#111', textAlign: 'center', fontScale: 1.0, layoutPreference: 'two-col' },
  { id: 'luxury', name: 'Luxury', description: 'Sang trọng, nổi bật', bgColor: '#111111', textColor: '#f5f5f5', textAlign: 'center', fontScale: 1.15, layoutPreference: 'grid-5' },
];

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .split(/[^a-z0-9àáãạảăắằẵặẳâấầẫậẩđèéẹẽẻêếềễệểìíịĩỉòóõọỏôốồỗộổơớờỡợởùúũụủưứừữựửỳýỵỹỷ_\-]+/i)
    .filter(Boolean);
}

const BASE_TAGS = ['#thietke', '#xaydung', '#noithat', '#kts', '#kientruc', '#mau', '#yTuong'];

function tagsForCategory(slug?: string): string[] {
  if (!slug) return [];
  const map: Record<string, string[]> = {
    'dich-vu': ['#dichVu', '#thietKeNha', '#thiCong'],
    'mau-nha': ['#mauNha', '#yTuongNhaDep', '#nhaDep'],
    'bang-mau': ['#bangMau', '#phoiMau'],
    'san-vuon': ['#sanVuon', '#thietKeCanhQuan'],
    'thiet-bi': ['#thietBi', '#noiThat'],
    'store': ['#sanPham', '#muaSam'],
  };
  return map[slug] ?? [];
}

export async function suggestHashtags(input: { caption: string; categorySlug?: string; existing?: string[] }): Promise<string[]> {
  const tokens = tokenize(input.caption);
  const existing = new Set((input.existing ?? []).map(t => t.replace(/^#/, '').toLowerCase()));
  const catTags = tagsForCategory(input.categorySlug);
  const guessed: string[] = [];
  for (const t of tokens) {
    if (t.length < 3) continue;
    const tag = `#${t}`;
    if (!existing.has(t) && !guessed.includes(tag)) guessed.push(tag);
  }
  const all = [...catTags, ...BASE_TAGS, ...guessed];
  // unique and cap suggestions
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of all) {
    const key = tag.replace(/^#/, '').toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(tag); }
    if (out.length >= 12) break;
  }
  return out;
}

export async function suggestTitles(input: { caption: string; categorySlug?: string }): Promise<string[]> {
  const cat = CATEGORIES.find(c => c.slug === input.categorySlug);
  const topic = cat?.title || 'Dự án';
  const tokens = tokenize(input.caption).slice(0, 3).join(' ');
  const now = new Date().getFullYear();
  const ideas = [
    `Ý tưởng ${topic} ${now}`,
    `${topic} phong cách hiện đại`,
    `Mẫu ${topic.toLowerCase()} đẹp – ${tokens || 'gợi ý'}`,
  ];
  return ideas;
}

export function listLayoutPacks(): LayoutPack[] {
  return PACKS;
}
