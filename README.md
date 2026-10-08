# ActionForge

**AI that turns any meeting transcript into structured, assignable action items.**

Highest-ROI autonomous income micro-SaaS for operators who hate dropped commitments.

## Status (Verified 2026-10-08)

| Capability | Evidence Level | Notes |
|------------|----------------|-------|
| Core extraction | Level 2–3 | Works with Anthropic, OpenAI, or **Google Gemini** |
| Landing + Dashboard | Level 2 | Production UI |
| Rate limiting | Level 2 | In-memory per-IP (20/hr free) |
| Security headers | Level 2 | X-Frame-Options, nosniff, etc. |
| Health endpoint | Level 2 | `/api/health` |
| Auth | Level 0 | Next: Clerk or Supabase |
| Payments | Level 0 | Next: Stripe subscriptions |
| Persistence | Level 0 | Next: Postgres / Supabase |
| Integrations | Level 0 | Notion / Slack / Linear planned |
| Revenue | None | Zero verified transactions |

## Supported Models (Priority Order)

1. **Anthropic** (`ANTHROPIC_API_KEY`) → Claude Sonnet  
2. **OpenAI** (`OPENAI_API_KEY`) → GPT-4o  
3. **Google Gemini** (`GOOGLE_GENERATIVE_AI_API_KEY`) → `gemini-2.0-flash`  

Only one key is required. The system automatically selects the highest-priority available model.

## Live Demo / Deploy

One-click ready on Vercel.

1. Fork or clone
2. Add **at least one** of:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`  ← **your Gemini key goes here**
3. Deploy

Health check after deploy: `GET /api/health`

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your Gemini (or other) key
npm run dev
```

Open http://localhost:3000

## Core Features (Current MVP)

- Conversion-optimized landing page
- Dashboard with transcript paste + meeting-type selector
- High-quality structured extraction via Zod + AI SDK
  - Task (verb-first)
  - Owner
  - Deadline
  - Priority (High/Medium/Low)
  - Supporting quote
  - Optional notes
- Copy as Markdown or CSV
- Multi-provider support (Anthropic / OpenAI / Gemini)
- Input validation + size limits
- Simple rate limiting (20 generations / hour / IP on free tier)
- Security headers
- Latency + model metadata in response

## Architecture

```
USER → Landing / Dashboard
     → POST /api/generate
     → Rate limit + validation
     → Model routing (Anthropic → OpenAI → Gemini)
     → generateObject (Zod schema)
     → Structured items + meta
     → Client copy / future push
```

## Next Steps for Revenue (Prioritized)

1. **Auth** — Clerk or Supabase Auth (protect dashboard + usage)
2. **Stripe** — Free 5 meetings → Pro $29/mo (or $19 starter)
3. **Persistence** — Store history, usage counters server-side
4. **Integrations** — One-click push to Notion / Slack / Linear / Todoist
5. **Launch** — Product Hunt + Indie Hackers + targeted outreach to operators using Otter/Fireflies/Fathom

## Security Notes

- No secrets in client
- Rate limited
- Input length capped
- Security headers enabled
- Fail closed on missing API keys
- Do not log full transcripts in production

## Stack

- Next.js 15 (App Router)
- Vercel AI SDK
- Claude Sonnet / GPT-4o / Gemini 2.0 Flash
- Zod structured output
- Tailwind CSS
- TypeScript

## License

MIT — see LICENSE

---

Built for maximum speed to first verified revenue and true autonomy after launch.
