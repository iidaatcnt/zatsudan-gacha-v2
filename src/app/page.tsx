
'use client';

import { useState } from 'react';
import { useGacha } from '@/hooks/useGacha';
import { CategorySelector } from '@/components/CategorySelector';
import { CategoryFilter } from '@/types';

export default function Home() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const {
    categories,
    isSpinning,
    result,
    error,
    historyItems,
    likedIds,
    spin,
    toggleLike
  } = useGacha();

  const handleSpin = () => {
    spin(category);
  };

  // バッジの色判定ヘルパー
  const getBadgeColor = (cat: string) => {
    if (cat.includes('貯める')) return 'bg-red-500/20 text-red-300 border-red-500/40';
    if (cat.includes('稼ぐ')) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (cat.includes('増やす')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (cat.includes('守る')) return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
    if (cat.includes('使う')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (cat.includes('リベ')) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Background Globes */}
      <div className="background-globes">
        <div className="globe globe-1"></div>
        <div className="globe globe-2"></div>
        <div className="globe globe-3"></div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-2">
            雑談<br />
            <span className="accent-text">ガチャ v3</span>
          </h1>

        </header>

        {/* Machine Card */}
        <div className="bg-[var(--color-card-bg)] backdrop-blur-md border border-[var(--color-card-border)] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">

          {/* Display Window */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center relative overflow-hidden transition-all">

            {/* Status Badge */}
            <div className={`
              mb-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border transition-all duration-300
              ${isSpinning ? 'bg-white/10 text-white border-white/20' :
                error ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                  result ? getBadgeColor(result.category) :
                    'bg-white/10 text-slate-400 border-white/10'}
            `}>
              {isSpinning ? 'CHOOSING...' : error ? 'ERROR' : result ? result.category : 'READY'}
            </div>

            {/* Content Text */}
            <div className={`
              w-full flex flex-col items-center gap-4 transition-all duration-500
              ${isSpinning ? 'opacity-50 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'}
              ${result ? 'animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]' : ''}
            `}>
              {error ? (
                <span className="text-red-400 text-base font-normal">{error}</span>
              ) : result ? (
                <>
                  <div className="text-xl md:text-2xl font-bold leading-relaxed">
                    {result.text}
                  </div>
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(result.id)}
                    className="mt-2 p-2 rounded-full hover:bg-white/10 transition-colors group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={likedIds.includes(result.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={`w-6 h-6 transition-all ${likedIds.includes(result.id)
                        ? "text-pink-500 scale-110"
                        : "text-slate-500 group-hover:text-pink-400"
                        }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </>
              ) : (
                <span className="text-slate-500 text-base font-normal">
                  ボタンを押して<br />話題をスキャン...
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div>
            <CategorySelector
              selected={category}
              onSelect={setCategory}
              disabled={isSpinning}
              categories={categories}
            />

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="group relative w-full py-4 rounded-2xl btn-gradient text-white font-bold text-lg tracking-wide shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/50 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSpinning ? '選定中...' : '話題を生成する'}
              </span>
              {/* Shine Effect */}
              <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] animate-[shine_6s_infinite]" />
            </button>
          </div>
        </div>

        {/* History Section */}
        {historyItems.length > 0 && (
          <section className="bg-[var(--color-card-bg)] backdrop-blur-sm border border-[var(--color-card-border)] rounded-3xl p-6">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-en">History</h2>
            <ul className="flex flex-col gap-3">
              {historyItems.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className={`
                    flex justify-between items-center p-3 rounded-xl bg-white/5 border-l-2 text-sm
                    animate-[popIn_0.3s_ease-out]
                    ${getBadgeColor(item.category).replace('text-', 'border-l-')}
                  `}
                >
                  <span className="truncate mr-4 opacity-90">{item.text}</span>
                  <div className="flex items-center gap-2">
                    {likedIds.includes(item.id) && (
                      <span className="text-pink-500">♥</span>
                    )}
                    <span className="text-[10px] opacity-60 whitespace-nowrap uppercase tracking-tighter">
                      {item.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </main>
  );
}
