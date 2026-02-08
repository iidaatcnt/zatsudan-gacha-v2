
import React from 'react';
import { CategoryFilter } from '@/types';

interface Props {
    selected: CategoryFilter;
    onSelect: (cat: CategoryFilter) => void;
    disabled?: boolean;
}

export function CategorySelector({ selected, onSelect, disabled, categories }: Props & { categories: string[] }) {

    const getColorClass = (cat: string) => {
        if (cat === 'all') return 'peer-checked:bg-slate-500 peer-checked:border-slate-400 border-slate-400/50 text-slate-400';

        // Simple consistent hashing for colors
        const colors = [
            'red', 'blue', 'emerald', 'violet', 'amber', 'indigo', 'pink', 'cyan', 'rose', 'fuchsia'
        ];
        let hash = 0;
        for (let i = 0; i < cat.length; i++) hash += cat.charCodeAt(i);
        const color = colors[hash % colors.length];

        return `peer-checked:bg-${color}-500/30 peer-checked:border-${color}-500 border-${color}-500/50 text-${color}-300`;
    };

    const allOptions = [
        { value: 'all', label: 'ランダム' },
        ...categories.map(c => ({ value: c, label: c }))
    ];

    return (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
            {allOptions.map((cat) => (
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
            ${getColorClass(cat.value)}
          `}>
                        {cat.label}
                    </span>
                </label>
            ))}
        </div>
    );
}
