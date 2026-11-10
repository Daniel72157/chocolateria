import type { Category } from '../../../shared/types';

export default function CategoryTabs({ categories, value, onChange }: { categories: Category[]; value: string; onChange: (slug: string) => void }) {
  const tab = (active: boolean) => `shrink-0 rounded-full px-5 py-3 font-semibold transition ${active ? 'bg-bosque text-papel' : 'bg-papel text-ink hover:bg-arena'}`;
  return (
    <div role="group" aria-label="Categorías" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={value === ''} onClick={() => onChange('')} className={tab(value === '')}>Todo</button>
      {categories.map((c) => (
        <button key={c.id} type="button" aria-pressed={value === c.slug} onClick={() => onChange(c.slug)} className={tab(value === c.slug)}>{c.name}</button>
      ))}
    </div>
  );
}
