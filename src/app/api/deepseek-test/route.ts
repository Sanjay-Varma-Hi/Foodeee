import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Missing DEEPSEEK_API_KEY' }, { status: 500 });
  }

  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ success: false, error: 'Missing question' }, { status: 400 });
    }

    // Replace with the actual DeepSeek API endpoint and payload structure
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: question }
        ]
      })
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 