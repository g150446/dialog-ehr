// 設定の型定義
export interface AppSettings {
  siteUrl: string;
  sttServerUrl: string;
  llmServerUrl: string;
}

// デフォルト値
export const DEFAULT_SETTINGS: AppSettings = {
  siteUrl: 'https://macbook-m1:3000',
  sttServerUrl: 'https://macbook-m1:9000',
  llmServerUrl: '',
};

// 設定を取得
export async function getSettings(): Promise<AppSettings> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '設定の取得に失敗しました' }));
      console.error('Settings API error:', errorData);
      // エラーが発生してもデフォルト値を返す（アプリが動作し続けるように）
      return DEFAULT_SETTINGS;
    }
    const data = await response.json();
    return {
      siteUrl: data.siteUrl || DEFAULT_SETTINGS.siteUrl,
      sttServerUrl: data.sttServerUrl || DEFAULT_SETTINGS.sttServerUrl,
      llmServerUrl: data.llmServerUrl || DEFAULT_SETTINGS.llmServerUrl,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    // ネットワークエラーなどでもデフォルト値を返す
    return DEFAULT_SETTINGS;
  }
}

// 設定を更新
export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('設定の更新に失敗しました');
    }
    
    const data = await response.json();
    return {
      siteUrl: data.siteUrl || DEFAULT_SETTINGS.siteUrl,
      sttServerUrl: data.sttServerUrl || DEFAULT_SETTINGS.sttServerUrl,
      llmServerUrl: data.llmServerUrl || DEFAULT_SETTINGS.llmServerUrl,
    };
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

