
export interface Topic {
    id: string;
    category: string;
    text: string;
    enabled: boolean;
}

export type CategoryFilter = 'all' | '貯める' | '稼ぐ' | '増やす' | '守る' | '使う';

export const FALLBACK_DATA: Topic[] = [
    { id: "1", category: "貯める", text: "最近節約できたことは？", enabled: true },
    { id: "2", category: "軽い雑談", text: "朝ごはんはパン派？ご飯派？", enabled: true },
    { id: "3", category: "増やす", text: "10年後の自分に言いたいことは？", enabled: true },
    { id: "4", category: "稼ぐ", text: "理想の年収は？", enabled: true },
    { id: "5", category: "守る", text: "セキュリティ対策してる？", enabled: true },
    { id: "6", category: "使う", text: "最近買った一番の高価なものは？", enabled: true },
    { id: "7", category: "リベネタ", text: "人生で一番影響を受けた本は？", enabled: true },
    { id: "8", category: "軽い雑談", text: "最近見たYouTube動画は？", enabled: true },
    { id: "9", category: "リベネタ", text: "理想のリーダー像とは？", enabled: true },
    { id: "10", category: "軽い雑談", text: "透明人間になれたら何する？", enabled: true },
];
