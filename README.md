# ActionForge

**AI that turns any meeting transcript into structured, assignable action items.**

Highest-ROI autonomous income micro-SaaS for 2026.

## Live Demo / Deploy

This repo is ready for one-click deploy on Vercel.

1. Fork or clone
2. Add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in Vercel Environment Variables
3. Deploy

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your Anthropic or OpenAI key
npm run dev
```

Open http://localhost:3000

## Core Features (MVP)

- Landing page optimized for conversion
- Dashboard with transcript paste + meeting-type selector
- High-quality structured extraction (Task, Owner, Deadline, Priority, Quote)
- Copy as Markdown or CSV
- Ready for Stripe + auth expansion

## Next Steps for Revenue

1. Add Clerk or Supabase Auth
2. Add Stripe subscriptions (Free 5 meetings → Pro $29/mo)
3. Add history storage
4. Add Notion / Slack / Linear one-click push
5. Launch on Product Hunt + Indie Hackers

## Stack

- Next.js 15
- Vercel AI SDK
- Claude Sonnet or GPT-4o
- Tailwind CSS
- Zod structured output

Built for maximum speed to first revenue and true autonomy after launch.
