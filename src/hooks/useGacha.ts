
'use client';

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Topic, CategoryFilter, FALLBACK_DATA } from '@/types';

const HISTORY_LIMIT = 5;

export function useGacha(customSheetUrl?: string) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]); // ID list
    const [historyItems, setHistoryItems] = useState<Topic[]>([]); // Display objects
    const [isLoading, setIsLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<Topic[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [likedCounts, setLikedCounts] = useState<Record<string, number>>({});

    // Initialize likes from localStorage
    useEffect(() => {
        // ... (existing localStorage logic for likes) ...
        const storedLikesV2 = localStorage.getItem('zatsudan_likes_v2');
        if (storedLikesV2) {
            try {
                setLikedCounts(JSON.parse(storedLikesV2));
            } catch (e) {
                console.error("Failed to parse likes v2", e);
            }
        }
    }, []);

    // Load Data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                let url = '/api/sheet';
                if (customSheetUrl) {
                    url += `?url=${encodeURIComponent(customSheetUrl)}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error('Network response was not ok');
                const csvText = await res.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // ... (existing parsing logic) ...
                        const parsed = results.data.map((row: any, index: number) => ({
                            id: (row.ID || row.id || row["ネタID"] || `auto-${index + 1}`).toString(),
                            category: (row.Category || row.category || row["カテゴリ"] || row[0] || "未分類").trim(),
                            text: (row.Text || row.text || row["ネタ内容"] || row[1] || "").trim(),
                            enabled: (row.Enabled || row.enabled || "TRUE").toString().toUpperCase() === 'TRUE',
                            selectionCount: parseInt(row.Count || row.count || row["選択回数"] || row[2] || "0", 10)
                        })) as Topic[];

                        const validTopics = parsed.filter(t => t.text);
                        const cats = Array.from(new Set(validTopics.map(t => t.category))).filter(Boolean);

                        setCategories(cats);

                        if (validTopics.length > 0) {
                            setTopics(validTopics);
                        } else {
                            console.warn("Parsed CSV has no valid rows, using fallback.");
                            setTopics(FALLBACK_DATA);
                            setCategories(Array.from(new Set(FALLBACK_DATA.map(t => t.category))));
                        }
                        setIsLoading(false);
                    },
                    error: (err: any) => {
                        console.error("CSV Parse Error", err);
                        // ... fallback ...
                        setTopics(FALLBACK_DATA);
                        setCategories(Array.from(new Set(FALLBACK_DATA.map(t => t.category))));
                        setIsLoading(false);
                    }
                });

            } catch (err) {
                console.error("Fetch Error", err);
                setTopics(FALLBACK_DATA);
                setCategories(Array.from(new Set(FALLBACK_DATA.map(t => t.category))));
                setIsLoading(false);
            }
        }

        loadData();
    }, [customSheetUrl]);


    const cycleLike = useCallback((id: string) => {
        setLikedCounts(prev => {
            const current = prev[id] || 0;
            const next = current >= 3 ? 0 : current + 1;

            const newCounts = { ...prev };
            if (next === 0) {
                delete newCounts[id];
            } else {
                newCounts[id] = next;
            }

            localStorage.setItem('zatsudan_likes_v2', JSON.stringify(newCounts));
            return newCounts;
        });
    }, []);

    const spin = useCallback((categoryFilter: CategoryFilter, count: number = 2) => {
        if (topics.length === 0) return;

        setIsSpinning(true);
        setError(null);

        setTimeout(() => {
            // 1. Filter candidates
            let candidates = topics.filter(t =>
                t.enabled && !history.includes(t.id)
            );

            // 2. Category filter
            if (categoryFilter !== 'all') {
                candidates = candidates.filter(t => t.category === categoryFilter);
            }

            // 3. Fallback if no candidates (try removing history filter)
            if (candidates.length < count) {
                const allInCategory = topics.filter(t =>
                    t.enabled && (categoryFilter === 'all' || t.category === categoryFilter)
                );

                if (allInCategory.length >= count) {
                    // If we have enough topics overall, reset history partially or fully
                    setHistory([]);
                    candidates = allInCategory;
                } else if (allInCategory.length > 0) {
                    // Not enough topics even after reset, just take all
                    candidates = allInCategory;
                    setHistory([]);
                } else {
                    setError("このカテゴリのネタはまだありません！");
                    setIsSpinning(false);
                    return;
                }
            }

            // 4. Random selection of N items
            // Fisher-Yates shuffle
            const shuffled = [...candidates];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            const picked = shuffled.slice(0, Math.min(count, shuffled.length));

            setResult(picked);

            // Update history
            const pickedIds = picked.map(p => p.id);
            setHistory(prev => {
                const newHistory = [...prev, ...pickedIds];
                // Keep history limit reasonable (e.g. 50 items)
                if (newHistory.length > 50) return newHistory.slice(-50);
                return newHistory;
            });

            setHistoryItems(prev => {
                const newItems = [...picked, ...prev];
                if (newItems.length > 10) return newItems.slice(0, 10);
                return newItems;
            });

            setIsSpinning(false);

        }, 600);
    }, [topics, history]);

    return {
        topics,
        categories,
        isLoading,
        isSpinning,
        result,
        error,
        historyItems,
        likedCounts,
        spin,
        cycleLike
    };
}
