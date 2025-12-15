'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getSettings, DEFAULT_SETTINGS } from '@/lib/settings';
import { saveMonitoringRecord } from '@/lib/api';
import type { MonitoringRecord } from '@/types/patient';

type RecordingState = 'idle' | 'recording' | 'processing' | 'completed';

export default function FloatingButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [sttServerUrl, setSttServerUrl] = useState<string>(DEFAULT_SETTINGS.sttServerUrl);
  const [llmServerUrl, setLlmServerUrl] = useState<string>(DEFAULT_SETTINGS.llmServerUrl);
  const [isOllamaLoading, setIsOllamaLoading] = useState<boolean>(false);
  const [ollamaResponse, setOllamaResponse] = useState<string>('');
  const [ollamaVitals, setOllamaVitals] = useState<any | null>(null);
  const [isSavingMonitoringRecord, setIsSavingMonitoringRecord] = useState<boolean>(false);
  const [ollamaJsonRecognized, setOllamaJsonRecognized] = useState<boolean | null>(null);
  const [hasSavedMonitoringRecord, setHasSavedMonitoringRecord] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');
  const pathname = usePathname();

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setSttServerUrl(settings.sttServerUrl || DEFAULT_SETTINGS.sttServerUrl);
        setLlmServerUrl(settings.llmServerUrl || DEFAULT_SETTINGS.llmServerUrl);
      } catch (error) {
        console.error('Error loading server URLs from settings:', error);
        // エラー時はデフォルト値を使用
        setSttServerUrl(DEFAULT_SETTINGS.sttServerUrl);
        setLlmServerUrl(DEFAULT_SETTINGS.llmServerUrl);
      }
    };
    loadSettings();
  }, []);

  // 現在のURLから患者IDを取得（/patients/[id] のみ対応）
  useEffect(() => {
    if (!pathname) {
      setPatientId(null);
      return;
    }
    const match = pathname.match(/^\/patients\/([^/]+)/);
    if (match && match[1]) {
      setPatientId(match[1]);
    } else {
      setPatientId(null);
    }
  }, [pathname]);

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
      setSaveMessage('');
      setTranscription('');
      setOllamaResponse('');
      setOllamaVitals(null);
      setOllamaJsonRecognized(null);
       setHasSavedMonitoringRecord(false);
      
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

  const sendToOllama = async () => {
    if (!transcription || transcription.trim() === '') {
      setError('送信するテキストがありません。');
      return;
    }

    try {
      setIsOllamaLoading(true);
      setError('');
      setSaveMessage('');
      setOllamaResponse('');
      setOllamaVitals(null);
      setOllamaJsonRecognized(null);
      setHasSavedMonitoringRecord(false);

      // 最新の設定を読み込む（設定ページで更新された場合に対応）
      const settings = await getSettings();
      const currentLlmServerUrl = settings.llmServerUrl || DEFAULT_SETTINGS.llmServerUrl;
      
      // 状態も更新する
      setLlmServerUrl(currentLlmServerUrl);

      // デバッグ用: 設定が読み込まれているか確認
      if (!currentLlmServerUrl || currentLlmServerUrl.trim() === '') {
        setError('Ollamaサーバーのアドレスが設定されていません。設定ページでollamaサーバーのアドレスを設定してください。');
        setIsOllamaLoading(false);
        return;
      }

      // Next.js APIルート経由でollamaにリクエストを送信（CORSとSSL証明書の問題を回避）
      const response = await fetch('/api/ollama/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: transcription,
        }),
      }).catch((fetchError) => {
        // ネットワークエラーや接続エラーの場合
        console.error('Fetch error:', fetchError);
        throw new Error(`ネットワークエラー: ${fetchError.message || 'サーバーに接続できませんでした'}`);
      });

      if (!response.ok) {
        let errorMessage = `サーバーエラー: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // JSONパースに失敗した場合は、レスポンステキストを取得
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (textError) {
            // テキスト取得にも失敗した場合は、デフォルトメッセージを使用
            console.error('Failed to parse error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Ollamaからのレスポンスの形式に応じて処理を分岐
      // 1) バイタルサインJSONとみなせる場合は、記録登録用に保持
      let candidate: any = null;

      // バイタルキーをチェックする関数
      const hasVitalKeys = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
          return false;
        }
        return (
          'temperature' in obj ||
          'spO2' in obj ||
          'sPO2' in obj ||
          'heartRate' in obj ||
          'pulse' in obj ||
          'systolicBloodPressure' in obj ||
          'diastolicBloodPressure' in obj
        );
      };

      // まず data 自体が文字列の場合（``` や ''' で囲まれたJSON文字列を想定）を処理
      if (typeof data === 'string') {
        let str = data.trim();

        // ``` または ```json で囲まれている場合
        if (str.startsWith('```')) {
          // 先頭の ``` または ```json を削除
          const firstLineEnd = str.indexOf('\n');
          if (firstLineEnd !== -1) {
            const firstLine = str.substring(0, firstLineEnd);
            if (firstLine.startsWith('```')) {
              str = str.substring(firstLineEnd + 1).trim();
            }
          }
          // 末尾の ``` を削除
          if (str.endsWith('```')) {
            str = str.slice(0, -3).trim();
          }
        }

        // ''' で囲まれている場合
        if (str.startsWith("'''") && str.endsWith("'''")) {
          str = str.slice(3, -3).trim();
        }

        if (str.startsWith('{') && str.endsWith('}')) {
          try {
            const parsed = JSON.parse(str);
            if (hasVitalKeys(parsed)) {
              candidate = parsed;
            }
          } catch (parseError) {
            console.debug('Failed to parse data as JSON string:', parseError);
          }
        }
      }
      // data 自体がバイタルJSONオブジェクトかチェック
      else if (hasVitalKeys(data)) {
        candidate = data;
      }
      // data.response がオブジェクトの場合
      else if (data && typeof data === 'object' && data.response && typeof data.response === 'object' && !Array.isArray(data.response)) {
        if (hasVitalKeys(data.response)) {
          candidate = data.response;
        }
      }
      // data.response がJSON文字列の場合はパースしてみる
      else if (data && typeof data.response === 'string') {
        let trimmed = data.response.trim();

        // ``` または ```json で囲まれている場合
        if (trimmed.startsWith('```')) {
          const firstLineEnd = trimmed.indexOf('\n');
          if (firstLineEnd !== -1) {
            const firstLine = trimmed.substring(0, firstLineEnd);
            if (firstLine.startsWith('```')) {
              trimmed = trimmed.substring(firstLineEnd + 1).trim();
            }
          }
          if (trimmed.endsWith('```')) {
            trimmed = trimmed.slice(0, -3).trim();
          }
        }

        // 先頭と末尾が ''' で囲まれている場合は取り除く
        if (trimmed.startsWith("'''") && trimmed.endsWith("'''")) {
          trimmed = trimmed.slice(3, -3).trim();
        }

        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (hasVitalKeys(parsed)) {
              candidate = parsed;
            }
          } catch (parseError) {
            // パース失敗時は無視
            console.debug('Failed to parse data.response as JSON:', parseError);
          }
        }
      }

      if (candidate) {
        // バイタルJSONとして認識できた
        setOllamaVitals(candidate);
        setOllamaJsonRecognized(true);
        // 表示用にはJSONを整形して見せる
        try {
          setOllamaResponse(JSON.stringify(candidate, null, 2));
        } catch {
          setOllamaResponse(String(candidate));
        }
      } else {
        // バイタルJSONとして認識できなかった場合は通常テキストとして表示
        const responseText =
          typeof data?.response === 'string'
            ? data.response
            : typeof data === 'string'
            ? data
            : JSON.stringify(data, null, 2);

        setOllamaResponse(responseText);
        setOllamaVitals(null);
        setOllamaJsonRecognized(false);
      }
    } catch (err) {
      console.error('Error sending to Ollama:', err);
      setError(
        err instanceof Error 
          ? `エラー: ${err.message}` 
          : 'Ollamaへの送信に失敗しました。サーバーが起動しているか、設定を確認してください。'
      );
      setOllamaVitals(null);
    } finally {
      setIsOllamaLoading(false);
    }
  };

  // Ollamaから取得したバイタルJSONをモニタリング記録として登録
  const handleRegisterMonitoringRecord = async () => {
    if (!ollamaVitals) {
      setError('バイタルサインJSONとして認識できるデータがありません。');
      return;
    }

    if (!patientId) {
      setError('患者詳細ページ以外では記録登録は行えません。患者詳細ページからご利用ください。');
      return;
    }

    try {
      setIsSavingMonitoringRecord(true);
      setError('');
      setSaveMessage('');

      // OllamaからのキーをMonitoringRecord API用のフィールドにマッピング
      const vitals = ollamaVitals as any;

      const payload: Partial<MonitoringRecord> & { recordId: string } = {
        recordId: typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `AUTO_${Date.now()}`,
      };

      if (vitals.temperature !== undefined) {
        payload.temperature = Number(vitals.temperature);
      }

      // spO2 / sPO2 両方に対応
      const spO2Value = vitals.spO2 ?? vitals.sPO2;
      if (spO2Value !== undefined) {
        payload.spO2 = Number(spO2Value);
      }

      const heartRateValue = vitals.heartRate ?? vitals.pulse;
      if (heartRateValue !== undefined) {
        payload.heartRate = Number(heartRateValue);
      }

      if (vitals.systolicBloodPressure !== undefined) {
        payload.systolicBloodPressure = Number(vitals.systolicBloodPressure);
      }

      if (vitals.diastolicBloodPressure !== undefined) {
        payload.diastolicBloodPressure = Number(vitals.diastolicBloodPressure);
      }

      if (vitals.weight !== undefined) {
        payload.weight = Number(vitals.weight);
      }

      // ここではdateを送らず、API側で現在時刻を使用させる

      const saved = await saveMonitoringRecord(patientId, payload);

      setHasSavedMonitoringRecord(true);
      setSaveMessage('モニタリング記録を登録しました。');
    } catch (err) {
      console.error('Error saving monitoring record from Ollama vitals:', err);
      setError(
        err instanceof Error
          ? `記録登録エラー: ${err.message}`
          : 'モニタリング記録の登録に失敗しました。'
      );
    } finally {
      setIsSavingMonitoringRecord(false);
    }
  };

  const handleClose = () => {
    // 記録登録に成功している場合は、患者詳細ページの過去モニタリング記録を表示しつつ最新データを読み込む
    if (hasSavedMonitoringRecord && patientId && typeof window !== 'undefined') {
      sessionStorage.setItem('showPastMonitoring', 'true');
      window.location.href = `/patients/${patientId}`;
      return;
    }

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
    setOllamaResponse('');
    setOllamaVitals(null);
    setSaveMessage('');
    setOllamaJsonRecognized(null);
    setHasSavedMonitoringRecord(false);
    setIsOllamaLoading(false);
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

              {/* Ollama Loading State */}
              {isOllamaLoading && (
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">
                      Ollamaに送信中...
                    </p>
                  </div>
                </div>
              )}

              {/* Ollama Response */}
              {ollamaResponse && !isOllamaLoading && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Ollama応答:</p>
                  <pre className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-gray-800 whitespace-pre-wrap break-words text-sm">
                    {ollamaResponse}
                  </pre>
                </div>
              )}

              {/* 保存成功メッセージ */}
              {saveMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">{saveMessage}</p>
                </div>
              )}

              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3 justify-center">
                {recordingState === 'completed' && !isOllamaLoading && (
                  <>
                    {/* まだOllama解析をしていない or 再送したい場合 */}
                    {ollamaJsonRecognized === null && (
                      <button
                        onClick={sendToOllama}
                        disabled={isSavingMonitoringRecord}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Send to ollama
                      </button>
                    )}

                    {/* バイタルJSONとして認識できた場合のみ「記録登録」を表示 */}
                    {ollamaJsonRecognized === true && ollamaVitals && (
                      <button
                        onClick={handleRegisterMonitoringRecord}
                        disabled={isSavingMonitoringRecord || !patientId}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isSavingMonitoringRecord ? '登録中...' : '記録登録'}
                      </button>
                    )}
                    {/* ollamaJsonRecognized === false の場合は「閉じる」のみ表示（追加ボタンなし） */}
                  </>
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
