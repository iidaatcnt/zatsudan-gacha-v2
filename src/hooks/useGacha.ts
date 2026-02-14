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

    // New: Single selection state
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initialize selection from localStorage
    useEffect(() => {
        const storedSelection = localStorage.getItem('zatsudan_selection');
        if (storedSelection) {
            setSelectedId(storedSelection);
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


    const toggleSelection = useCallback((id: string) => {
        setSelectedId(prev => {
            const next = prev === id ? null : id;
            if (next) {
                localStorage.setItem('zatsudan_selection', next);
            } else {
                localStorage.removeItem('zatsudan_selection');
            }
            return next;
        });
    }, []);

    const spin = useCallback((categoryFilter: CategoryFilter, count: number = 2) => {
        if (topics.length === 0) return;

        setIsSpinning(true);
        setError(null);
        setSelectedId(null); // Clear selection on spin? Maybe keep it? Let's clear it to encourage new selection.
        localStorage.removeItem('zatsudan_selection');

        setTimeout(() => {
            // 1. Filter candidates
            let candidates = topics.filter(t =>
                t.enabled && !history.includes(t.id)
            );

            // 2. Category filter
            if (categoryFilter !== 'all') {
                candidates = candidates.filter(t => t.category === categoryFilter);
            }

            // 3. Fallback
            if (candidates.length < count) {
                const allInCategory = topics.filter(t =>
                    t.enabled && (categoryFilter === 'all' || t.category === categoryFilter)
                );

                if (allInCategory.length >= count) {
                    setHistory([]);
                    candidates = allInCategory;
                } else if (allInCategory.length > 0) {
                    candidates = allInCategory;
                    setHistory([]);
                } else {
                    setError("このカテゴリのネタはまだありません！");
                    setIsSpinning(false);
                    return;
                }
            }

            // 4. Random selection
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
        selectedId, // Exposed
        toggleSelection, // Exposed
        spin
    };
}
