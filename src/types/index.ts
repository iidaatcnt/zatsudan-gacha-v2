
export interface Topic {
    id: string;
    category: string;
    text: string;
    enabled: boolean;
    likes?: number;
    selectionCount?: number;
}

export type CategoryFilter = string;

export const FALLBACK_DATA: Topic[] = [
    { id: "1", category: "貯める", text: "最近節約できたことは？", enabled: true, selectionCount: 5 },
    { id: "2", category: "軽い雑談", text: "朝ごはんはパン派？ご飯派？", enabled: true, selectionCount: 3 },
    { id: "3", category: "増やす", text: "10年後の自分に言いたいことは？", enabled: true, selectionCount: 0 },
    { id: "4", category: "稼ぐ", text: "理想の年収は？", enabled: true, selectionCount: 8 },
    { id: "5", category: "守る", text: "セキュリティ対策してる？", enabled: true, selectionCount: 1 },
    { id: "6", category: "使う", text: "最近買った一番の高価なものは？", enabled: true, selectionCount: 12 },
    { id: "7", category: "リベネタ", text: "人生で一番影響を受けた本は？", enabled: true, selectionCount: 4 },
    { id: "8", category: "軽い雑談", text: "最近見たYouTube動画は？", enabled: true, selectionCount: 9 },
    { id: "9", category: "リベネタ", text: "理想のリーダー像とは？", enabled: true, selectionCount: 2 },
    { id: "10", category: "軽い雑談", text: "透明人間になれたら何する？", enabled: true, selectionCount: 6 },
];
