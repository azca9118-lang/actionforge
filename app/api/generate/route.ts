import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
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

export async function POST(req: NextRequest) {
  try {
    const { transcript, meetingType = 'general' } = await req.json();

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
      return NextResponse.json({ error: 'Transcript too short or missing' }, { status: 400 });
    }

    // Prefer Anthropic if key present, else OpenAI
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json(
        {
          error:
            'No AI API key configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY to your environment variables.',
        },
        { status: 500 }
      );
    }

    const model = anthropicKey
      ? createAnthropic({ apiKey: anthropicKey })('claude-sonnet-4-20250514')
      : createOpenAI({ apiKey: openaiKey })('gpt-4o');

    const systemPrompt = `You are an expert executive assistant specialized in extracting clear, assignable action items from meeting transcripts.

Meeting type context: ${meetingType}

Rules:
- Only extract genuine commitments or tasks that someone agreed to do.
- Prefer concrete, verb-first task descriptions.
- If an owner is not explicit, use the most likely speaker or "Unassigned".
- Infer reasonable priority (High/Medium/Low) based on language and urgency.
- Always include a supporting quote from the transcript.
- Ignore pure discussion, opinions, or past actions.
- Output only the structured action items.`;

    const { object } = await generateObject({
      model,
      schema: ActionItemSchema,
      system: systemPrompt,
      prompt: `Extract all action items from this meeting transcript:\n\n---\n${transcript.slice(0, 30000)}\n---`,
    });

    return NextResponse.json(object);
  } catch (err: any) {
    console.error('Generate error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate action items' },
      { status: 500 }
    );
  }
}