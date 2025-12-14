'use client';

import { useState, useRef, useEffect } from 'react';
import { getSettings, DEFAULT_SETTINGS } from '@/lib/settings';

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

export default function FloatingButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [sttServerUrl, setSttServerUrl] = useState<string>(DEFAULT_SETTINGS.sttServerUrl);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setSttServerUrl(settings.sttServerUrl || DEFAULT_SETTINGS.sttServerUrl);
      } catch (error) {
        console.error('Error loading STT server URL from settings:', error);
        // エラー時はデフォルト値を使用
        setSttServerUrl(DEFAULT_SETTINGS.sttServerUrl);
      }
    };
    loadSettings();
  }, []);

  // ブラウザのサポートを確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMediaDevices = !!(navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices);
      // MediaRecorderの存在を確認（古いブラウザでは存在しない可能性がある）
      const hasMediaRecorder = 'MediaRecorder' in window;
      const isSecureContext = window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1';
      
      const supported = hasMediaDevices && hasMediaRecorder && isSecureContext;
      setIsSupported(supported);
      
      if (!isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setError('音声録音を使用するには、HTTPS接続が必要です。現在のアドレス（' + window.location.hostname + '）ではHTTP接続のため、MediaRecorder APIが使用できません。HTTPSでアクセスするか、localhost:3000を使用してください。');
      }
    }
  }, []);

  // クリーンアップ処理
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setTranscription('');
      
      // ブラウザのサポートを確認
      if (typeof window === 'undefined') {
        throw new Error('ブラウザ環境で実行されていません。');
      }
      
      // セキュアコンテキストの確認
      const isSecureContext = window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        throw new Error('音声録音を使用するには、HTTPS接続が必要です。現在のアドレス（' + window.location.hostname + '）ではHTTP接続のため、MediaRecorder APIが使用できません。HTTPSでアクセスするか、localhost:3000を使用してください。');
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('このブラウザは音声録音をサポートしていません。');
      }
      
      // マイクへのアクセスを要求
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // MediaRecorderのサポートを確認
      if (!('MediaRecorder' in window)) {
        throw new Error('MediaRecorder APIがサポートされていません。');
      }

      // MediaRecorderの初期化
      // ブラウザがサポートするMIMEタイプを確認
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // フォールバック: ブラウザがサポートする形式を使用
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          // デフォルト形式を使用（ブラウザが自動選択）
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      mimeTypeRef.current = mimeType || 'audio/webm'; // フォールバック
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // ストリームを停止
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // 音声データをBlobとして作成（実際に使用したMIMEタイプを使用）
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
        
        // Whisper serverに送信
        await sendToWhisperServer(audioBlob);
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。';
      setError(errorMessage);
      setRecordingState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
  };

  const sendToWhisperServer = async (audioBlob: Blob) => {
    try {
      setError('');
      setRecordingState('processing');

      // FormDataを作成して音声ファイルを追加
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      // Whisper serverに送信（設定から読み込んだURLを使用）
      const whisperServerUrl = `${sttServerUrl}/transcribe`;
      
      const response = await fetch(whisperServerUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTranscription(data.transcription || '');
      setRecordingState('completed');
    } catch (err) {
      console.error('Error sending to Whisper server:', err);
      setError(
        err instanceof Error 
          ? `エラー: ${err.message}` 
          : '音声の変換に失敗しました。Whisper serverが起動しているか確認してください。'
      );
      setRecordingState('idle');
    }
  };

  const handleClose = () => {
    // 録音中の場合は停止
    if (recordingState === 'recording' && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    // ストリームを停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 状態をリセット
    setRecordingState('idle');
    setTranscription('');
    setError('');
    setIsDialogOpen(false);
  };

  const handleButtonClick = async () => {
    setError(''); // エラーをクリア
    setIsDialogOpen(true); // ダイアログを開く（録音状態を表示するため）
    await startRecording(); // すぐに録音を開始
  };

  return (
    <>
      {/* Floating Round Button */}
      <button
        onClick={handleButtonClick}
        className="fixed bottom-[100px] left-5 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-40 flex items-center justify-center"
        aria-label="音声録音を開始"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      {/* Dialog Modal - 録音中、処理中、完了時、またはエラー時にのみ表示 */}
      {isDialogOpen && (recordingState !== 'idle' || error) && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          
          {/* Dialog Content */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 min-w-[400px] max-w-[600px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                音声録音
              </h2>

              {/* ブラウザサポート警告 */}
              {!isSupported && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>音声録音が使用できません</strong>
                  </p>
                  <p className="text-sm text-yellow-800">
                    MediaRecorder APIを使用するには、HTTPS接続またはlocalhostでのアクセスが必要です。
                  </p>
                  {typeof window !== 'undefined' && 
                   window.location.hostname !== 'localhost' && 
                   window.location.hostname !== '127.0.0.1' && 
                   window.location.protocol !== 'https:' && (
                    <div className="mt-2 text-xs text-yellow-700">
                      <p>現在のアドレス: <code className="bg-yellow-100 px-1 rounded">{window.location.protocol}//{window.location.hostname}:{window.location.port}</code></p>
                      <p className="mt-1">解決方法:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>HTTPSでアクセスする（<code className="bg-yellow-100 px-1 rounded">https://{window.location.hostname}:3000</code>）</li>
                        <li>または <code className="bg-yellow-100 px-1 rounded">http://localhost:3000</code> を使用する</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {recordingState === 'recording' && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                    <p className="text-lg font-medium text-red-600">
                      録音中...
                    </p>
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                    録音停止
                  </button>
                </div>
              )}

              {recordingState === 'processing' && (
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">
                      音声をテキストに変換しています...
                    </p>
                  </div>
                </div>
              )}

              {recordingState === 'completed' && transcription && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">変換結果:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">
                      {transcription}
                    </p>
                  </div>
                </div>
              )}

              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 閉じるボタン */}
              <div className="flex gap-3 justify-center">
                {recordingState === 'completed' && (
                  <button
                    onClick={() => {
                      setRecordingState('idle');
                      setTranscription('');
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                  >
                    もう一度録音
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
