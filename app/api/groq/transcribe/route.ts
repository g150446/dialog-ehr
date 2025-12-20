import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get settings from database
    const settings = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value || '';
    });

    const groqApiKey = settingsMap['groqApiKey'] || '';

    if (!groqApiKey || groqApiKey.trim() === '') {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 400 }
      );
    }

    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio_file') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert the audio file to a format Groq API can accept
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Create FormData for Groq API
    const groqFormData = new FormData();
    groqFormData.append('file', audioBlob, 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3-turbo');
    groqFormData.append('response_format', 'json');

    // Call Groq Transcription API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Groq API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return in the same format as the whisper server
    return NextResponse.json({
      transcription: data.text || '',
    });
  } catch (error) {
    console.error('Error in Groq transcription:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to transcribe audio with Groq'
      },
      { status: 500 }
    );
  }
}
