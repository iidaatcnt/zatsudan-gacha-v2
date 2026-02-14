

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Vercel Edge Functionsで高速化

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('url');

    // Default to env var, but override with custom URL if provided and safe
    let sheetUrl = process.env.SHEET_CSV_URL;

    if (customUrl) {
        // Simple security check to ensure it's a Google Sheet
        if (customUrl.startsWith('https://docs.google.com/spreadsheets/')) {
            sheetUrl = customUrl;
        }
    }

    if (!sheetUrl) {
        return NextResponse.json(
            { error: 'Sheet URL is not set' },
            { status: 500 }
        );
    }

    try {
        // キャッシュバスターをつけてスプレッドシートからCSVを取得
        // If the URL already has query params, append with &
        const separator = sheetUrl.includes('?') ? '&' : '?';
        const fetchUrl = `${sheetUrl}${separator}t=${Date.now()}`;

        const response = await fetch(fetchUrl);

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

