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

    // Get the prompt from the request
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call Groq Chat Completion API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a medical assistant that extracts vital signs from text. When given text about patient vital signs, extract the information and return ONLY a JSON object with the following fields (only include fields that are mentioned): temperature (in Celsius), spO2 (oxygen saturation percentage), heartRate (beats per minute), systolicBloodPressure (mmHg), diastolicBloodPressure (mmHg), weight (kg). Return ONLY the JSON object, no additional text or explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
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

    // Extract the response text from Groq's response
    const responseText = data.choices?.[0]?.message?.content || '';

    // Return in a format compatible with the Ollama response structure
    return NextResponse.json({
      response: responseText,
    });
  } catch (error) {
    console.error('Error in Groq generation:', error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to generate response with Groq'
      },
      { status: 500 }
    );
  }
}
