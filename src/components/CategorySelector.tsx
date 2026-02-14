
import React from 'react';
import { CategoryFilter } from '@/types';

interface Props {
    selected: CategoryFilter;
    onSelect: (cat: CategoryFilter) => void;
    disabled?: boolean;
    categories: string[];
}

export function CategorySelector({ selected, onSelect, disabled, categories }: Props) {

    const getColors = (cat: string) => {
        if (cat === 'all') return 'slate';
        if (cat.includes('貯める')) return 'red';
        if (cat.includes('稼ぐ')) return 'blue';
        if (cat.includes('増やす')) return 'emerald';
        if (cat.includes('守る')) return 'violet';
        if (cat.includes('使う')) return 'amber';
        if (cat.includes('リベ')) return 'indigo';
        if (cat.includes('雑談')) return 'cyan';

        // Simple consistent hashing for others
        const colors = ['pink', 'rose', 'fuchsia', 'purple', 'sky', 'teal', 'lime', 'orange'];
        let hash = 0;
        for (let i = 0; i < cat.length; i++) hash += cat.charCodeAt(i);
        return colors[hash % colors.length];
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
        <div className="flex flex-wrap justify-center gap-2">
            {allOptions.map((cat) => {
                const color = getColors(cat.value);
                // Dynamic class construction for Tailwind
                // Using style object for dynamic colors to be safe with Tailwind JIT if needed, 
                // but standard colors usually work if safe-listed. 
                // Here we rely on standard Tailwind classes being present or JIT picking them up.
                // Assuming standard pallete.

                return (
                    <label key={cat.value} className="relative cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={selected === cat.value}
                            onChange={() => onSelect(cat.value as CategoryFilter)}
                            disabled={disabled}
                            className="peer sr-only"
                        />
                        <span className={`
                        inline-block px-4 py-2 rounded-full text-sm font-bold border
                        transition-all duration-200 ease-out
                        shadow-sm
                        peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                        
                        /* Unselected State (Light Theme) */
                        bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300

                        /* Selected State */
                        peer-checked:bg-${color}-500 peer-checked:border-${color}-500 peer-checked:text-white
                        peer-checked:shadow-md peer-checked:scale-105
                    `}>
                            {cat.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}

