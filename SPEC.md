# 雑談ガチャ v3 仕様書

## 1. 概要 (Overview)
Googleスプレッドシートをマスターデータとして利用し、リストアップされた話題をランダムに提供するWebアプリケーション。
非エンジニアでもスプレッドシートを編集するだけで、アプリ内のコンテンツ（話題・カテゴリ）を容易に更新・拡張できることを設計思想とする。

## 2. データソース (Data Source)
*   **プラットフォーム**: Google Sheets (公開CSV)
*   **連携方式**:
    *   `.env.local` の `SHEET_CSV_URL` に設定されたURLからCSV形式で取得。
    *   `src/app/api/sheet/route.ts` 経由でブラウザからアクセス。
    *   読み取り専用 (Read Only)。アプリからの書き込みは行わない。
*   **データ構造**:
    | 列名 (日本語) | 列名 (英語) | 説明 |
    |---|---|---|
    | **ネタID** | ID | 一意のID（例: N001）。いいね機能の識別子として使用。 |
    | **カテゴリ** | Category | 話題の分類（例: 軽い雑談, リベネタ）。選択ボタンを動的に生成。 |
    | **ネタ内容** | Text | 画面に表示されるテキスト本体。 |
    
    ※ 日本語・英語ヘッダーのどちらにも対応している。

## 3. 機能仕様 (Features)

### 3.1 ガチャ機能 (Gacha Logic)
*   **基本動作**: 「話題を生成する」ボタン押下により、条件に合致する話題をランダムに1つ選出・表示する。
*   **フィルタリング**:
    *   選択されたカテゴリに属する話題のみを候補とする。
    *   「ランダム」選択時は全カテゴリが対象。
*   **重複防止**: 直近5件の履歴に含まれるIDは選出候補から除外する（候補が尽きた場合はリセット）。

### 3.2 カテゴリ機能 (Dynamic Categories)
*   **動的生成**: スプレッドシートの「カテゴリ」列からユニークな値を抽出し、自動的に選択ボタンを生成する。
*   **色分け**: カテゴリ名に基づいて自動的に色（Tailwind CSSクラス）を割り当てる。
*   **ランダム**: デフォルトで「ランダム (All)」が選択されており、全カテゴリから抽選される。

### 3.3 いいね機能 (Like System)
*   **動作**: 結果画面および履歴リストのハートボタンでON/OFFを切り替える。
*   **データ保存**: ブラウザの `localStorage` にIDリスト (`zatsudan_likes`) として保存する。
*   **永続性**: ブラウザを閉じても保持されるが、デバイス間同期やスプレッドシートへの書き戻しは行わない。

### 3.4 履歴機能 (History)
*   直近5件の選出履歴をリスト表示する。
*   履歴リスト上でもカテゴリ色やいいね状態を確認可能。

## 4. 技術仕様 (Tech Stack)
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Data Fetching**:
    *   Client-side fetching via internal API Route (`/api/sheet`)
    *   API Route uses Vercel Edge Runtime for performance
    *   CSV Parsing: `papaparse`
*   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
*   **Deploy**: Vercel

## 5. 環境変数 (Environment Variables)
*   `SHEET_CSV_URL`: Googleスプレッドシートの公開CSV URL
