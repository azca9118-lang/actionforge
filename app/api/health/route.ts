import { NextResponse } from 'next/server';

export async function GET() {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    status: 'ok',
    service: 'actionforge',
    timestamp: new Date().toISOString(),
    models: {
      anthropic: hasAnthropic ? 'configured' : 'missing',
      openai: hasOpenAI ? 'configured' : 'missing',
      preferred: hasAnthropic ? 'anthropic' : hasOpenAI ? 'openai' : 'none',
    },
    version: '0.1.1',
  });
}
