
'use client';

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Topic, CategoryFilter, FALLBACK_DATA } from '@/types';

const HISTORY_LIMIT = 5;

export function useGacha() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [history, setHistory] = useState<string[]>([]); // ID list
    const [historyItems, setHistoryItems] = useState<Topic[]>([]); // Display objects
    const [isLoading, setIsLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<Topic | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load Data
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/sheet');
                if (!res.ok) throw new Error('Network response was not ok');
                const csvText = await res.text();

                Papa.parse(csvText, {
                    header: true, // ヘッダー行を使う
                    skipEmptyLines: true,
                    complete: (results) => {
                        // CSVのカラム名が大文字小文字気にならないように正規化したり、型変換したり
                        // ここでは簡易的に、期待されるカラム名であることを信じるか、マッピングする
                        // 想定: id, category, text, enabled
                        const parsed = results.data.map((row: any) => ({
                            id: row.ID || row.id,
                            category: row.Category || row.category,
                            text: row.Text || row.text,
                            enabled: (row.Enabled || row.enabled || "").toString().toUpperCase() === 'TRUE'
                        })) as Topic[];

                        // 有効なデータのみにフィルタリング
                        const validTopics = parsed.filter(t => t.id && t.text);

                        if (validTopics.length > 0) {
                            setTopics(validTopics);
                        } else {
                            console.warn("Parsed CSV has no valid rows, using fallback.");
                            setTopics(FALLBACK_DATA);
                        }
                        setIsLoading(false);
                    },
                    error: (err: any) => {
                        console.error("CSV Parse Error", err);
                        setTopics(FALLBACK_DATA);
                        setIsLoading(false);
                    }
                });

            } catch (err) {
                console.error("Fetch Error", err);
                setTopics(FALLBACK_DATA);
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const spin = useCallback((categoryFilter: CategoryFilter) => {
        if (topics.length === 0) return;

        setIsSpinning(true);
        setError(null);

        // 少し待たせる演出
        setTimeout(() => {
            // 1. 候補抽出 (有効かつ履歴にない)
            let candidates = topics.filter(t =>
                t.enabled && !history.includes(t.id)
            );

            // 2. カテゴリフィルタ
            if (categoryFilter !== 'all') {
                candidates = candidates.filter(t => t.category.includes(categoryFilter));
            }

            // 3. 候補がない場合の処理
            if (candidates.length === 0) {
                // そのカテゴリで、履歴を無視すればあるか？
                const allInCategory = topics.filter(t =>
                    t.enabled && (categoryFilter === 'all' || t.category.includes(categoryFilter))
                );

                if (allInCategory.length > 0) {
                    // 履歴リセットして再試行
                    setHistory([]);
                    // ここで再帰的に呼び出すと無限ループのリスクがあるので、簡易的にリセット後の候補から選ぶ
                    candidates = allInCategory;
                } else {
                    setError("このカテゴリのネタはまだありません！");
                    setIsSpinning(false);
                    return;
                }
            }

            // 4. ランダム選出
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const picked = candidates[randomIndex];

            setResult(picked);

            // 履歴更新
            setHistory(prev => {
                const newHistory = [...prev, picked.id];
                if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
                return newHistory;
            });

            setHistoryItems(prev => {
                const newItems = [picked, ...prev];
                if (newItems.length > 5) newItems.pop();
                return newItems;
            });

            setIsSpinning(false);

        }, 600); // 600ms delay
    }, [topics, history]);

    return {
        topics,
        isLoading,
        isSpinning,
        result,
        error,
        historyItems,
        spin
    };
}
