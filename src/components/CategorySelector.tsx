
import React from 'react';
import { CategoryFilter } from '@/types';

interface Props {
    selected: CategoryFilter;
    onSelect: (cat: CategoryFilter) => void;
    disabled?: boolean;
}

const CATEGORIES: { value: CategoryFilter; label: string; colorClass: string }[] = [
    { value: 'all', label: 'ALL', colorClass: 'peer-checked:bg-slate-500 peer-checked:border-slate-400 border-slate-400/50 text-slate-400' },
    { value: '貯める', label: '貯める', colorClass: 'peer-checked:bg-red-500/30 peer-checked:border-red-500 border-red-500/50 text-red-300' },
    { value: '稼ぐ', label: '稼ぐ', colorClass: 'peer-checked:bg-blue-500/30 peer-checked:border-blue-500 border-blue-500/50 text-blue-300' },
    { value: '増やす', label: '増やす', colorClass: 'peer-checked:bg-emerald-500/30 peer-checked:border-emerald-500 border-emerald-500/50 text-emerald-300' },
    { value: '守る', label: '守る', colorClass: 'peer-checked:bg-violet-500/30 peer-checked:border-violet-500 border-violet-500/50 text-violet-300' },
    { value: '使う', label: '使う', colorClass: 'peer-checked:bg-amber-500/30 peer-checked:border-amber-500 border-amber-500/50 text-amber-300' },
];

export function CategorySelector({ selected, onSelect, disabled }: Props) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CATEGORIES.map((cat) => (
                <label key={cat.value} className="relative cursor-pointer group">
                    <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={selected === cat.value}
                        onChange={() => onSelect(cat.value)}
                        disabled={disabled}
                        className="peer sr-only"
                    />
                    <span className={`
            inline-block px-4 py-1.5 rounded-full text-sm font-bold border
            transition-all duration-300 ease-out
            bg-white/5 
            group-hover:bg-white/10
            peer-checked:scale-105 peer-checked:text-white peer-checked:shadow-[0_0_10px_rgba(255,255,255,0.2)]
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            ${cat.colorClass}
          `}>
                        {cat.label}
                    </span>
                </label>
            ))}
        </div>
    );
}
