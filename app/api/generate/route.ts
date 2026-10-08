import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const ActionItemSchema = z.object({
  actionItems: z.array(
    z.object({
      task: z.string().describe('Clear, actionable task description starting with a verb'),
      owner: z.string().describe('Person responsible. Use "Unassigned" if unclear'),
      deadline: z.string().describe('Deadline or timeframe mentioned, or "Not specified"'),
      priority: z.enum(['High', 'Medium', 'Low']).describe('Inferred priority'),
      quote: z.string().describe('Exact or near-exact quote from the transcript that supports this item'),
      notes: z.string().optional().describe('Any extra context'),
    })
  ),
});

// Simple in-memory rate limiter (per IP). Resets on cold start — replace with Redis/Upstash in production.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             req.headers.get('x-real-ip') ||
             'unknown';

  try {
    // Rate limit
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Free tier allows 20 generations per hour. Upgrade for higher limits.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { transcript, meetingType = 'general' } = body;

    // Strict validation
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Transcript is required and must be a string' }, { status: 400 });
    }

    const trimmed = transcript.trim();
    if (trimmed.length < 30) {
      return NextResponse.json({ error: 'Transcript too short. Provide at least ~30 characters of content.' }, { status: 400 });
    }

    if (trimmed.length > 100_000) {
      return NextResponse.json({ error: 'Transcript too long. Maximum 100k characters.' }, { status: 400 });
    }

    const allowedTypes = ['general', 'client', 'standup', 'sales', 'planning'];
    const safeMeetingType = allowedTypes.includes(meetingType) ? meetingType : 'general';

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!anthropicKey && !openaiKey && !googleKey) {
      return NextResponse.json(
        {
          error:
            'No AI API key configured. Add ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY to environment variables.',
          code: 'MISSING_API_KEY',
        },
        { status: 500 }
      );
    }

    // Priority: Anthropic → OpenAI → Gemini
    let model;
    let modelName: string;

    if (anthropicKey) {
      model = createAnthropic({ apiKey: anthropicKey })('claude-sonnet-4-20250514');
      modelName = 'claude-sonnet-4';
    } else if (openaiKey) {
      model = createOpenAI({ apiKey: openaiKey })('gpt-4o');
      modelName = 'gpt-4o';
    } else {
      // Gemini — use Flash for speed/cost on structured extraction
      model = createGoogleGenerativeAI({ apiKey: googleKey! })('gemini-2.0-flash');
      modelName = 'gemini-2.0-flash';
    }

    const systemPrompt = `You are an expert executive assistant specialized in extracting clear, assignable action items from meeting transcripts.

Meeting type context: ${safeMeetingType}

Rules:
- Only extract genuine commitments or tasks that someone agreed to do or was assigned.
- Prefer concrete, verb-first task descriptions.
- If an owner is not explicit, use the most likely speaker or "Unassigned".
- Infer reasonable priority (High/Medium/Low) based on language and urgency.
- Always include a supporting quote from the transcript.
- Ignore pure discussion, opinions, brainstorming without commitment, or past actions already completed.
- Output only the structured action items. Do not invent items not supported by the text.`;

    const { object } = await generateObject({
      model,
      schema: ActionItemSchema,
      system: systemPrompt,
      prompt: `Extract all action items from this meeting transcript:\n\n---\n${trimmed.slice(0, 30000)}\n---`,
    });

    const latency = Date.now() - start;

    return NextResponse.json(
      {
        ...object,
        meta: {
          model: modelName,
          latencyMs: latency,
          itemCount: object.actionItems?.length ?? 0,
          rateLimitRemaining: remaining,
        },
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-Model-Used': modelName,
          'X-Latency-Ms': String(latency),
        },
      }
    );
  } catch (err: any) {
    console.error('Generate error:', {
      message: err.message,
      name: err.name,
      ip,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    // Distinguish common failure modes
    const msg = err.message || 'Failed to generate action items';
    let status = 500;
    let code = 'GENERATION_FAILED';

    if (msg.includes('rate limit') || msg.includes('429')) {
      status = 429;
      code = 'PROVIDER_RATE_LIMIT';
    } else if (msg.includes('API key') || msg.includes('auth') || msg.includes('401') || msg.includes('403') || msg.includes('API_KEY')) {
      status = 502;
      code = 'PROVIDER_AUTH';
    } else if (msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
      status = 504;
      code = 'PROVIDER_TIMEOUT';
    }

    return NextResponse.json(
      { error: msg, code },
      { status }
    );
  }
}
