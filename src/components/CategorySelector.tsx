
import React from 'react';
import { CategoryFilter } from '@/types';

interface Props {
    selected: CategoryFilter;
    onSelect: (cat: CategoryFilter) => void;
    disabled?: boolean;
}

export function CategorySelector({ selected, onSelect, disabled, categories }: Props & { categories: string[] }) {

    const getColorClass = (cat: string) => {
        if (cat === 'all') return 'peer-checked:bg-slate-600 peer-checked:border-slate-400 peer-checked:text-white border-slate-600 text-slate-400 hover:border-slate-500';

        let color = 'slate';

        // Manual mapping for 5 Powers + others
        if (cat.includes('貯める')) color = 'red';
        else if (cat.includes('稼ぐ')) color = 'blue';
        else if (cat.includes('増やす')) color = 'emerald';
        else if (cat.includes('守る')) color = 'violet';
        else if (cat.includes('使う')) color = 'amber';
        else if (cat.includes('リベ')) color = 'indigo';
        else if (cat.includes('雑談')) color = 'cyan';
        else {
            // Simple consistent hashing for others
            const colors = ['pink', 'rose', 'fuchsia', 'purple', 'sky', 'teal', 'lime', 'orange'];
            let hash = 0;
            for (let i = 0; i < cat.length; i++) hash += cat.charCodeAt(i);
            color = colors[hash % colors.length];
        }

        // More visible style: solid bg when checked, brighter border
        return `peer-checked:bg-${color}-600 peer-checked:border-${color}-400 peer-checked:text-white border-slate-700 text-slate-300 hover:bg-white/5 hover:border-${color}-500/50 hover:text-${color}-200 peer-checked:shadow-[0_0_15px_rgba(255,255,255,0.1)]`;
    };

    // Ensure 5 Powers order if they exist, then others
    const fivePowers = ['貯める', '稼ぐ', '増やす', '守る', '使う'];
    const sortedCategories = [
        ...fivePowers.filter(c => categories.includes(c)),
        ...categories.filter(c => !fivePowers.includes(c))
    ];

    const allOptions = [
        { value: 'all', label: 'ランダム' },
        ...sortedCategories.map(c => ({ value: c, label: c }))
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
            inline-block px-4 py-2 rounded-full text-base font-bold border-2
            transition-all duration-200 ease-out
            bg-black/20 backdrop-blur-sm
            peer-checked:scale-105 
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
