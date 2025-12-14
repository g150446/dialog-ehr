import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// デフォルト値の定義
const DEFAULT_SETTINGS: Record<string, string> = {
  siteUrl: 'https://macbook-m1:3000',
  sttServerUrl: 'https://macbook-m1:9000',
  llmServerUrl: '',
};

// GET: 全設定を取得
export async function GET() {
  try {
    const settings = await prisma.appSettings.findMany();
    
    // key-valueオブジェクトに変換
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value || '';
    });
    
    // デフォルト値とマージ（設定が存在しない場合はデフォルト値を使用）
    const result: Record<string, string> = {};
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      result[key] = settingsMap[key] ?? DEFAULT_SETTINGS[key];
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // エラーが発生してもデフォルト値を返す（アプリが動作し続けるように）
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PUT: 設定を更新
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: '無効なリクエストです' },
        { status: 400 }
      );
    }
    
    // 各設定を更新または作成
    const updates = Object.keys(body).map(async (key) => {
      const value = body[key] ?? '';
      
      return prisma.appSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });
    
    await Promise.all(updates);
    
    // 更新後の設定を取得して返す
    const settings = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value || '';
    });
    
    // デフォルト値とマージ
    const result: Record<string, string> = {};
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      result[key] = settingsMap[key] ?? DEFAULT_SETTINGS[key];
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: '設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}

