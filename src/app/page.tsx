'use client';

import { useState, useEffect } from 'react';
import { useGacha } from '@/hooks/useGacha';
import { CategorySelector } from '@/components/CategorySelector';
import { CategoryFilter } from '@/types';

const DEFAULT_TITLE = "雑談ガチャ";
const DEFAULT_URL = "https://docs.google.com/spreadsheets/d/1xugRnRxhA8UohWamOOVHj51g0cfnGXB1wOjDwq2YRrs/edit?gid=0#gid=0";

export default function Home() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const count = 2; // Fixed to 2 topics

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appTitle, setAppTitle] = useState(DEFAULT_TITLE);
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_URL);

  // Local storage loading
  useEffect(() => {
    const storedTitle = localStorage.getItem('zatsudan_title');
    const storedUrl = localStorage.getItem('zatsudan_url');
    if (storedTitle) setAppTitle(storedTitle);
    if (storedUrl) setSheetUrl(storedUrl);
  }, []);

  // useGacha hook with custom URL (convert edit URL to export URL for fetching)
  const getExportUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('/export?')) return url;
    // Simple conversion
    try {
      // Extract ID
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const id = match[1];
        // Extract GID
        const gidMatch = url.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : "0";
        return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
      }
    } catch (e) {
      console.error("URL conversion failed", e);
    }
    return url;
  };

  const exportUrl = getExportUrl(sheetUrl);

  const {
    categories,
    isSpinning,
    result,
    error,
    historyItems,
    likedCounts,
    spin,
    cycleLike
  } = useGacha(exportUrl);

  const handleSpin = () => {
    spin(category, count);
  };

  const saveSettings = (newTitle: string, newUrl: string) => {
    setAppTitle(newTitle);
    setSheetUrl(newUrl);
    localStorage.setItem('zatsudan_title', newTitle);
    localStorage.setItem('zatsudan_url', newUrl);
    setIsSettingsOpen(false);
  };

  // カテゴリごとの配色テーマを取得
  const getCategoryTheme = (cat: string) => {
    let theme = {
      bg: 'bg-slate-50',
      border: 'border-slate-100',
      text: 'text-slate-800',
      badge: 'bg-slate-200 text-slate-600'
    };

    if (cat.includes('貯める')) theme = { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-900', badge: 'bg-red-100 text-red-700' };
    else if (cat.includes('稼ぐ')) theme = { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-700' };
    else if (cat.includes('増やす')) theme = { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' };
    else if (cat.includes('守る')) theme = { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-900', badge: 'bg-violet-100 text-violet-700' };
    else if (cat.includes('使う')) theme = { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-700' };
    else if (cat.includes('リベ')) theme = { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-700' };
    else if (cat.includes('雑談')) theme = { bg: 'bg-cyan-50', border: 'border-cyan-100', text: 'text-cyan-900', badge: 'bg-cyan-100 text-cyan-700' };

    return theme;
  };

  const getLikeIcon = (count: number) => {
    if (count >= 3) return "💖";
    if (count === 2) return "❤️";
    if (count === 1) return "🤍";
    return "🩶";
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-20 px-4 pb-12 font-sans bg-white text-slate-800">

      <div className="w-full max-w-2xl flex flex-col items-center gap-8">

        {/* Header */}
        <header className="text-center mb-4 relative w-full flex justify-center items-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {appTitle}
          </h1>
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="設定"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
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

          {/* Category Selector */}
          <div className="w-full max-w-md">
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
            <div className="flex flex-col gap-6">
              {result.map((topic, index) => {
                const theme = getCategoryTheme(topic.category);
                return (
                  <div
                    key={topic.id}
                    className={`
                        p-6 rounded-xl border border-dashed flex flex-col gap-2
                        animate-[popIn_0.3s_ease-out] relative
                        ${theme.bg} ${theme.border}
                      `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className={`text-lg md:text-2xl font-bold leading-relaxed ${theme.text}`}>
                      {topic.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${theme.badge}`}>
                        {topic.category}
                      </span>
                      {topic.selectionCount !== undefined && topic.selectionCount >= 0 && (
                        <span className="text-xs text-slate-400 opacity-70">
                          (選出: {topic.selectionCount + 1}回目)
                        </span>
                      )}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => cycleLike(topic.id)}
                      className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-white/50 transition-transform active:scale-95"
                    >
                      <span className="text-xl filter drop-shadow-sm">{getLikeIcon(likedCounts[topic.id] || 0)}</span>
                    </button>
                  </div>
                );
              })}
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[popIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-800 border-b pb-4">設定</h2>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">アプリタイトル</span>
                <input
                  type="text"
                  className="border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-700">スプレッドシートURL</span>
                <p className="text-xs text-slate-500">Googleスプレッドシートの編集URL、または「ウェブに公開」したCSVのURLを入力してください。</p>
                <input
                  type="text"
                  className="border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-green-500 outline-none text-sm font-mono"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t mt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => saveSettings(appTitle, sheetUrl)}
                className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
