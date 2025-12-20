import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import https from 'https';
import http from 'http';

// 自己署名証明書を許可するカスタムエージェント（開発環境用）
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // 開発環境でのみ使用（本番環境では適切な証明書を使用）
});

// https/httpモジュールを使用してリクエストを送信（自己署名証明書をサポート）
function makeRequest(url: string, options: { method: string; headers: Record<string, string>; body: string }): Promise<{ status: number; statusText: string; data: string; headers: Record<string, string | string[]> }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method,
      headers: options.headers,
      ...(isHttps && { agent: httpsAgent }),
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode || 200,
          statusText: res.statusMessage || 'OK',
          data: data,
          headers: res.headers as Record<string, string | string[]>,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // 設定を取得（データベースから直接読み込む）
    const settings = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value || '';
    });

    const groqEnabled = settingsMap['groqEnabled'] === 'true';
    const groqApiKey = settingsMap['groqApiKey'] || '';
    const llmServerUrl = settingsMap['llmServerUrl'] || '';

    // Groqが有効な場合
    if (groqEnabled) {
      if (!groqApiKey || groqApiKey.trim() === '') {
        return NextResponse.json(
          { error: 'Groq API key is not configured' },
          { status: 400 }
        );
      }

      // Groq APIにリクエストを送信
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error('Groq API error:', groqResponse.status, errorText);
        return NextResponse.json(
          { error: `Groq API error: ${groqResponse.status} ${groqResponse.statusText}` },
          { status: groqResponse.status }
        );
      }

      const groqData = await groqResponse.json();

      // Groqのレスポンスを Ollama 形式に変換
      return NextResponse.json({
        response: groqData.choices?.[0]?.message?.content || '',
      });
    }

    // Groqが無効な場合は従来のOllama APIを使用
    if (!llmServerUrl || llmServerUrl.trim() === '') {
      return NextResponse.json(
        { error: 'Ollama server URL is not configured' },
        { status: 400 }
      );
    }

    // Ollama APIにリクエストを送信
    const ollamaApiUrl = `${llmServerUrl}/api/generate`;

    const requestBody = JSON.stringify({
      model: 'ehr-gemma',
      prompt: prompt,
      stream: false,
    });

    const response = await makeRequest(ollamaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody).toString(),
      },
      body: requestBody,
    });

    if (response.status < 200 || response.status >= 300) {
      console.error('Ollama API error:', response.status, response.data);
      return NextResponse.json(
        { error: `Ollama server error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = JSON.parse(response.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to LLM:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to communicate with LLM server'
      },
      { status: 500 }
    );
  }
}
