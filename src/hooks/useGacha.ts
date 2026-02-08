
'use client';

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Topic, CategoryFilter, FALLBACK_DATA } from '@/types';

const HISTORY_LIMIT = 5;

export function useGacha() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]); // ID list
    const [historyItems, setHistoryItems] = useState<Topic[]>([]); // Display objects
    const [isLoading, setIsLoading] = useState(true);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<Topic | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [likedIds, setLikedIds] = useState<string[]>([]);

    // Initialize likes from localStorage
    useEffect(() => {
        const storedLikes = localStorage.getItem('zatsudan_likes');
        if (storedLikes) {
            try {
                setLikedIds(JSON.parse(storedLikes));
            } catch (e) {
                console.error("Failed to parse likes", e);
            }
        }
    }, []);

    // Load Data
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/sheet');
                if (!res.ok) throw new Error('Network response was not ok');
                const csvText = await res.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const parsed = results.data.map((row: any, index: number) => ({
                            id: (row.ID || row.id || row["ネタID"] || `auto-${index + 1}`).toString(),
                            category: (row.Category || row.category || row["カテゴリ"] || "未分類").trim(),
                            text: (row.Text || row.text || row["ネタ内容"] || "").trim(),
                            enabled: (row.Enabled || row.enabled || "").toString().toUpperCase() === 'TRUE'
                        })) as Topic[];

                        const validTopics = parsed.filter(t => t.text);

                        // Extract unique categories
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
    }, []);

    const toggleLike = useCallback((id: string) => {
        setLikedIds(prev => {
            const next = prev.includes(id)
                ? prev.filter(lid => lid !== id)
                : [...prev, id];
            localStorage.setItem('zatsudan_likes', JSON.stringify(next));
            return next;
        });
    }, []);

    const spin = useCallback((categoryFilter: CategoryFilter) => {
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

            // 3. Fallback if no candidates
            if (candidates.length === 0) {
                const allInCategory = topics.filter(t =>
                    t.enabled && (categoryFilter === 'all' || t.category === categoryFilter)
                );

                if (allInCategory.length > 0) {
                    setHistory([]);
                    candidates = allInCategory;
                } else {
                    setError("このカテゴリのネタはまだありません！");
                    setIsSpinning(false);
                    return;
                }
            }

            // 4. Random selection
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const picked = candidates[randomIndex];

            setResult(picked);

            // Update history
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
        likedIds,
        spin,
        toggleLike
    };
}
