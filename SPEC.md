
# 雑談ネタガチャ v3 技術仕様書

## 概要
本アプリケーションは、ユーザーが入力したジャンルに基づいてランダムに「雑談の話題」を提供するWebアプリケーションです。
データソースとしてGoogleスプレッドシート（CSV形式）を利用し、非エンジニアでも容易にコンテンツを更新できることを特徴としています。

---

## 🏗️ アーキテクチャ

### 1. フロントエンド
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**:
  - `page.tsx`: メインページ。状態管理（Topics, History, Selection）を担当。
  - `CategorySelector.tsx`: カテゴリ選択ボタン郡。インラインスタイルによる色分け制御。
  - `useGacha.ts`: コアロジック（データ取得、シャッフル、フィルタリング、履歴管理）をカプセル化したカスタムフック。

### 2. バックエンド (Serverless Function)
- **Runtime**: Vercel Edge Runtime
- **Endpoint**: `/api/sheet`
- **Role**: GoogleスプレッドシートのCSVエクスポートAPIへのプロキシ。CORS回避およびキャッシュ制御を行う。

### 3. データソース
- **Google Sheets**: 
  - データはCSV形式 (`export?format=csv`) で取得。
  - `PapaParse` ライブラリを使用してクライアントサイドでパース。
  - **Column Structure**:
    - `id` (A): 一意のID（自動生成または手動指定）
    - `category` (B): カテゴリ名（例: 「軽い雑談」「PC・IT」）
    - `text` (C): 話題本文（例: 「最近ハマっていることは？」）
    - `enabled` (D): 有効/無効フラグ (TRUE/FALSE)
    - `selectionCount` (E): 選択回数（任意、トラッキング用）

---

## 🔄 データフロー

1. **初期ロード**:
   - `useGacha` フックが発火。
   - `localStorage` からユーザー設定（タイトル、カスタムURL）を読み込む。
   - デフォルトURLまたはカスタムURLを使用して `/api/sheet` 経由でCSVを取得。

2. **データ取得**:
   - `/api/sheet` はGoogle Sheets APIへリクエストを飛ばす。
   - レスポンス（CSVテキスト）を `PapaParse` でJSON配列に変換。
   - データを `Topic` オブジェクトにマッピングし、ステートに保存。
   - 同時にユニークな `Category` リストを抽出。

3. **ガチャ実行 (Spin)**:
   - ユーザーが「ガチャ」ボタンを押下。
   - 現在のカテゴリフィルタ (`category` state) に基づいて候補を絞り込み。
   - 直前の履歴 (`history` state) にあるIDを除外（重複防止）。
   - Fisher-Yatesアルゴリズムでシャッフルし、指定数（2件）を抽出。
   - 結果 (`result` state) にセットし、画面表示。

4. **選択 (Selection)**:
   - ユーザーが結果カードをクリック。
   - `toggleSelection` 関数が呼び出され、選択されたID (`selectedId`) を更新。
   - `localStorage` に選択状態を永続化。

---

## 🎨 UI/UX デザイン

### カラーパレット
- **Primary**: Green (`#10b981`) -> 成功、긍定的アクション、ガチャボタン
- **Text**: Slate (`#0f172a`, `#334155`) -> 可読性重視のダークグレー
- **Background**: White -> クリーンで清潔感のあるベース
- **Category Colors**: 
  - パステルカラーパレット（Red, Blue, Emerald, Violet, Amber...）を定義し、カテゴリ名からハッシュ値で決定的に割り当て。
  - 選択時は濃い色、未選択時は白背景で枠線のみ。

### アニメーション
- **Tailwind Config**: `popIn`, `spin` などのカスタムキーフレームを定義。
- **Interaction**: ボタン押下時の `scale` 効果、ホバー時の `shadow` 変化でフィードバックを提供。

---

## 🛠️ 将来の拡張性 (Roadmap)

1. **認証機能**: ユーザーごとのカスタム設定や履歴の保存（Supabase等）
2. **履歴のCSVエクスポート**: 「今日話したこと」を議事録用にエクスポート
3. **PWA対応**: モバイルアプリ化、ホーム画面への追加
4. **音声読み上げ**: 表示された話題を読み上げるアクセシビリティ対応
5. **多言語対応**: i18nによる英語/中国語対応

---

## 📦 環境変数 (.env)

| 変数名 | 説明 | 必須 |
| --- | --- | --- |
| `SHEET_CSV_URL` | デフォルトのGoogle Sheets CSVエクスポートURL | Yes |
| `NEXT_PUBLIC_APP_URL` | ベースURL（OGP用など） | No |

---

## 📝 貢献ガイド

1. `main` ブランチから機能ブランチ (`feat/xxx`) を作成。
2. 変更を加えたら `npm run lint` で構文チェック。
3. PRを作成し、レビュー後にマージ。

---

Copyright (c) 2024-2026 iidaatcnt. All rights reserved.
