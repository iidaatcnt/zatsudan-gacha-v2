
import React from 'react';
import { CategoryFilter } from '@/types';

interface Props {
    selected: CategoryFilter;
    onSelect: (cat: CategoryFilter) => void;
    disabled?: boolean;
    categories: string[];
}

// Fixed color palette to ensure visibility
const PALETTE = [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#8b5cf6', // violet-500
    '#f59e0b', // amber-500
    '#6366f1', // indigo-500
    '#06b6d4', // cyan-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#84cc16', // lime-500
    '#14b8a6', // teal-500
    '#d946ef', // fuchsia-500
];

export function CategorySelector({ selected, onSelect, disabled, categories }: Props) {

    const getColor = (cat: string) => {
        if (cat === 'all') return '#1e293b'; // slate-800

        // 5 Powers specific mapping (optional, but nice to keep)
        if (cat.includes('貯める')) return '#ef4444';
        if (cat.includes('稼ぐ')) return '#3b82f6';
        if (cat.includes('増やす')) return '#10b981';
        if (cat.includes('守る')) return '#8b5cf6';
        if (cat.includes('使う')) return '#f59e0b';
        if (cat.includes('リベ')) return '#6366f1';
        if (cat.includes('雑談')) return '#06b6d4';

        // Deterministic color assignment for others
        let hash = 0;
        for (let i = 0; i < cat.length; i++) hash += cat.charCodeAt(i);
        return PALETTE[hash % PALETTE.length];
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
                const isSelected = selected === cat.value;
                const color = getColor(cat.value);

                return (
                    <label key={cat.value} className="relative cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={isSelected}
                            onChange={() => onSelect(cat.value as CategoryFilter)}
                            disabled={disabled}
                            className="peer sr-only"
                        />
                        <span
                            className={`
                            inline-block px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 ease-out shadow-sm
                            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                            ${isSelected
                                    ? 'text-white shadow-md scale-105 border-transparent'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                }
                        `}
                            style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
                        >
                            {cat.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
