import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  onClear?: () => void
  showClear?: boolean
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
  onClear,
  showClear = false
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-8" role="tablist" aria-label="Filtrar por categoría">
      {categories.map((cat) => (
        <button
          key={cat}
          role="tab"
          aria-selected={activeCategory === cat}
          onClick={() => onSelect(cat)}
          id={`cat-tab-${cat}`}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all focus-visible:ring-2 focus-visible:ring-primary",
            activeCategory === cat
              ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
              : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
          )}
        >
          {cat === 'Tecnología' && '⚙️ '}
          {cat === 'Educación' && '📚 '}
          {cat === 'Deportes' && '⚽ '}
          {cat === 'Música' && '🎵 '}
          {cat}
        </button>
      ))}

      {showClear && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-error border border-red-200 hover:bg-red-50 font-semibold transition-all"
          id="clear-filters-btn"
          aria-label="Limpiar filtros"
        >
          <X size={14} /> Limpiar
        </button>
      )}
    </div>
  )
}
