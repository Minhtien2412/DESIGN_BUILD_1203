import { CATEGORIES, type Category, categoryPath } from '@/data/categories';
import { COMPANIES, type Company } from '@/data/companies';
import { DESIGNS, type Design } from '@/data/designs';
import { PRODUCTS, type Product } from '@/data/products';
// Remote video search removed; using local-only results
import type { Href } from 'expo-router';

export type SearchResultType = 'product' | 'design' | 'company' | 'category' | 'video';

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  to: Href;
  // optional image-like hints (not always used)
  // use require() images for local assets when available
  image?: any;
};

const norm = (s: string) => s.normalize('NFC').toLowerCase();

function scoreIncludes(hay: string, needle: string): number {
  const i = hay.indexOf(needle);
  if (i < 0) return -1;
  // basic scoring: earlier match and shorter title score higher
  return 1000 - i - Math.min(hay.length, 200);
}

export function searchLocal(query: string, limit = 8): SearchResult[] {
  const q = norm(query.trim());
  if (!q) return [];

  const prod: SearchResult[] = PRODUCTS.map((p: Product) => {
    const title = p.name;
    return {
      id: `p:${p.id}`,
      type: 'product',
      title,
      subtitle: p.description,
      to: (`/product/${p.id}` as const),
      image: p.image,
    };
  });

  const designs: SearchResult[] = DESIGNS.map((d: Design) => ({
    id: `d:${d.id}`,
    type: 'design',
    title: d.title,
    subtitle: d.description,
    to: (`/design/${d.id}` as const),
    image: d.images?.[0],
  }));

  const companies: SearchResult[] = COMPANIES.map((c: Company) => ({
    id: `c:${c.slug}`,
    type: 'company',
    title: c.name,
    subtitle: c.description,
    to: (`/company/${c.slug}` as const),
  }));

  const categories: SearchResult[] = CATEGORIES.map((c: Category) => ({
    id: `cat:${c.slug}`,
    type: 'category',
    title: c.title,
    subtitle: c.description,
    to: categoryPath(c.slug),
  }));

  const all = [...prod, ...designs, ...companies, ...categories];
  const qn = norm(q);
  const ranked = all
    .map((r) => ({ r, s: scoreIncludes(norm(r.title + ' ' + (r.subtitle || '')), qn) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.r);
  return ranked;
}

export async function searchAll(query: string, limit = 12): Promise<SearchResult[]> {
  const local = searchLocal(query, limit);
  // merge and de-duplicate by id
  const seen = new Set<string>();
  const merged = [...local].filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
  return merged.slice(0, limit);
}
