'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSettings, updateSettings, type AppSettings } from '@/lib/settings';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    siteUrl: '',
    sttServerUrl: '',
    llmServerUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      // エラーが発生してもデフォルト値を使用
      setSettings({
        siteUrl: 'https://macbook-m1:3000',
        sttServerUrl: 'https://macbook-m1:9000',
        llmServerUrl: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateSettings(settings);
      setMessage({ type: 'success', text: '設定を保存しました' });
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 md:gap-6">
          <h1 className="text-white text-base md:text-lg font-semibold tracking-wide">Dialog Hospital</h1>
          <div className="h-6 w-px bg-blue-500 hidden md:block"></div>
          <div className="flex gap-2 md:gap-3 text-xs md:text-sm text-blue-100">
            <span className="hover:text-white cursor-pointer">ヘルプ(H)</span>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="px-3 md:px-4 py-1 md:py-1.5 bg-white hover:bg-gray-50 border border-blue-500 rounded text-xs md:text-sm text-gray-700 font-medium shadow-sm transition-colors"
        >
          戻る
        </button>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">設定</h2>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site URL */}
            <div>
              <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                このサイトのアドレス
              </label>
              <input
                type="text"
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => handleChange('siteUrl', e.target.value)}
                placeholder="https://macbook-m1:3000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                このアプリケーションのベースURLを入力してください
              </p>
            </div>

            {/* STT Server URL */}
            <div>
              <label htmlFor="sttServerUrl" className="block text-sm font-medium text-gray-700 mb-2">
                STTサーバーのアドレス
              </label>
              <input
                type="text"
                id="sttServerUrl"
                value={settings.sttServerUrl}
                onChange={(e) => handleChange('sttServerUrl', e.target.value)}
                placeholder="https://macbook-m1:9000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                音声認識（STT）サーバーのURLを入力してください（例: https://macbook-m1:9000）
              </p>
            </div>

            {/* LLM Server URL */}
            <div>
              <label htmlFor="llmServerUrl" className="block text-sm font-medium text-gray-700 mb-2">
                ollamaサーバーのアドレス
              </label>
              <input
                type="text"
                id="llmServerUrl"
                value={settings.llmServerUrl}
                onChange={(e) => handleChange('llmServerUrl', e.target.value)}
                placeholder=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

