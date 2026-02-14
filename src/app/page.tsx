'use client';

import { useState } from 'react';
import { useGacha } from '@/hooks/useGacha';
import { CategorySelector } from '@/components/CategorySelector';
import { CategoryFilter } from '@/types';

export default function Home() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  // Fixed to 2 topics as per requirement
  const count = 2;

  const {
    categories,
    isSpinning,
    result,
    error,
    historyItems,
    spin
  } = useGacha();

  const handleSpin = () => {
    spin(category, count);
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 px-4 pb-12 font-sans bg-white text-slate-800">

      <div className="w-full max-w-2xl flex flex-col items-center gap-8">

        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            雑談ネタガチャ
          </h1>
        </header>

        {/* Controls */}
        <div className="w-full flex flex-col items-center gap-6">

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="btn-primary w-full max-w-sm py-4 rounded-full text-xl font-bold flex justify-center items-center gap-3 shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-transform active:scale-95"
          >
            <span className="text-2xl">🎲</span>
            <span>{isSpinning ? '選定中...' : 'ガチャ（2ネタ）'}</span>
          </button>

          {/* Category Selector (Optional, kept simple) */}
          <div className="w-full max-w-md opacity-80 hover:opacity-100 transition-opacity">
            <CategorySelector
              selected={category}
              onSelect={setCategory}
              disabled={isSpinning}
              categories={categories}
            />
          </div>
        </div>

        {/* Result Area */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 card-shadow p-6 md:p-8 min-h-[200px] flex flex-col gap-6">
          {error ? (
            <div className="text-red-500 font-bold text-center py-8">{error}</div>
          ) : result.length > 0 ? (
            <div className="flex flex-col gap-8">
              {result.map((topic, index) => (
                <div
                  key={topic.id}
                  className={`flex flex-col gap-1 ${index !== result.length - 1 ? 'border-b border-dashed border-slate-200 pb-8' : ''} animate-[popIn_0.3s_ease-out]`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-lg md:text-2xl font-bold text-slate-800 leading-relaxed">
                    {topic.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      カテゴリ: {topic.category}
                    </span>
                    {topic.selectionCount !== undefined && topic.selectionCount >= 0 && (
                      <span className="text-xs text-slate-400 opacity-70">
                        (選出: {topic.selectionCount + 1}回目)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <span className="text-4xl opacity-20">💭</span>
              <p>ボタンを押して話題を生成してください</p>
            </div>
          )}
        </div>

        {/* History Section */}
        {historyItems.length > 0 && (
          <div className="w-full max-w-2xl mt-8">
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2">直前の履歴</h2>
            <ul className="flex flex-col gap-1">
              {historyItems.slice(0, 10).map((item, index) => (
                <li key={`${item.id}-${index}`} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap mt-0.5 w-24 overflow-hidden text-ellipsis text-right">[{item.category}]</span>
                  <span className="flex-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}
