
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Vercel Edge Functionsで高速化

export async function GET() {
    const sheetUrl = process.env.SHEET_CSV_URL;

    if (!sheetUrl) {
        return NextResponse.json(
            { error: 'Environment variable SHEET_CSV_URL is not set' },
            { status: 500 }
        );
    }

    try {
        // キャッシュバスターをつけてスプレッドシートからCSVを取得
        const response = await fetch(`${sheetUrl}?t=${Date.now()}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        }

        const csvData = await response.text();

        return new NextResponse(csvData, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Cache-Control': 's-maxage=60, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
