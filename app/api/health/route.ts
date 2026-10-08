import { NextResponse } from 'next/server';

export async function GET() {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  let preferred = 'none';
  if (hasAnthropic) preferred = 'anthropic';
  else if (hasOpenAI) preferred = 'openai';
  else if (hasGoogle) preferred = 'google';

  return NextResponse.json({
    status: 'ok',
    service: 'actionforge',
    timestamp: new Date().toISOString(),
    models: {
      anthropic: hasAnthropic ? 'configured' : 'missing',
      openai: hasOpenAI ? 'configured' : 'missing',
      google: hasGoogle ? 'configured' : 'missing',
      preferred,
    },
    version: '0.1.1',
  });
}
