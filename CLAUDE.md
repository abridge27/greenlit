# Greenlit — Claude Code Project Context

## What this is
Greenlit is an AI music coach web app. Artists upload an MP3, Gemini 2.5 Flash analyzes the audio, and the app returns a full structured critique across 8 musical elements at 5 coaching intensity levels. It is currently in beta at **greenlit.music**.

This is a portfolio/demo project. Stability, clean UX, and real Gemini data matter. It is being used to demonstrate product and technical skills for a marketing ops role at Meta.

## Stack
- **Frontend**: React (single component architecture) + Vite 5
- **AI**: Gemini 2.5 Flash via Google Cloud API
- **Backend**: Vercel serverless functions (`api/`)
- **Deployment**: Vercel → greenlit.music (Porkbun DNS)
- **Repo**: github.com/abridge27/greenlit

## Project structure
```
greenlit-app/
├── CLAUDE.md                  ← you are here
├── api/
│   └── analyze.js             ← Vercel serverless function (Gemini proxy, holds API key)
├── src/
│   ├── main.jsx               ← React entry point
│   ├── GreenLitPrototype.jsx  ← entire app (single component, all state at top level)
│   └── gemini.js              ← thin client — calls /api/analyze only, no key here
├── index.html
├── vite.config.js
└── package.json
```

## Key files to know
- **`src/GreenLitPrototype.jsx`** — the entire app lives here. All state, all phases, all UI. Do not split into sub-components without discussion. Rules of Hooks apply — all state must be declared at the top level of the component.
- **`api/analyze.js`** — Vercel serverless function. Holds the Gemini API key server-side. The full ANALYSIS_PROMPT lives here. This is where all Gemini API logic runs.
- **`src/gemini.js`** — client-side only. Converts file to base64, does a pre-flight size check, POSTs to `/api/analyze`, parses the response. No API key, no prompt.

## CRITICAL SECURITY RULES — read before touching anything

### Never expose API keys in the client bundle
- **Never use `VITE_` prefixed env vars for API keys.** Vite bakes all `VITE_` vars into the public JS bundle. Anyone can read them in page source.
- The Gemini API key lives in Vercel as `GEMINI_API_KEY` (no `VITE_` prefix) — server-side only.
- All Gemini API calls must go through `api/analyze.js`, never directly from the browser.
- This project was suspended by Google Cloud in May 2026 because the key was exposed in the bundle. Do not repeat this.

### Always use the server-side proxy pattern
- Any new external API that requires a secret key must follow the same pattern: a Vercel serverless function in `api/` holds the key, the client calls that function.
- Never add a new `VITE_` prefixed secret under any circumstances.

## App phases (the full user flow)
1. **entry** — home screen with GREENLIT wordmark and CTA
2. **dashboard** — saved projects list
3. **lobby** — "let's get started" bridge screen
4. **persona** — create/select an artist persona
5. **project-type** — select project type (single, EP, album, etc.)
6. **survey** — select coaching intensity (sets `dialSetting` 1–5)
7. **workspace** — upload song, library, analyze button
8. **analyzing** — full-screen loading screen while Gemini works
9. **celebrating** — confetti + music notes explosion, song plays, critique phrases float in from edges
10. **song-coach** — full critique output with element breakdown, dial controls, coach note

## The five coaching levels (dialSetting 1–5)
| Level | Name | Vibe |
|-------|------|------|
| 1 | Vibes only | Pure celebration, zero critique |
| 2 | Walk on the beach | 70%+ positive, max 1-2 soft suggestions |
| 3 | Hard lemonade | Honest and balanced |
| 4 | Cigar and scotch | Direct and demanding |
| 5 | The Spitfire — Roast me! | Unfiltered tough love |

## Gemini API details
- **Model**: `gemini-2.5-flash`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- **Auth**: API key as query param (`?key=...`) — key stored in Vercel env as `GEMINI_API_KEY`
- **maxOutputTokens**: 65536 — do not lower this. The prompt generates ~40k tokens (5 levels × 8 elements).
- **Temperature**: 0.2 — keep low for consistent factual analysis
- **Audio delivery**: inline_data (base64) — file must be under ~15MB source / ~20MB encoded
- **Response**: pure JSON (no markdown) — strip ``` fences with `text.replace(/\`\`\`json|\`\`\`/g, "")` before parsing

## File upload rules
- Accepted formats: `.mp3`, `.wav`
- Max file size: **15MB** for all formats (base64 adds 33% — keeps encoded payload under 20MB Gemini limit)
- WAV files over 15MB: block with message to export as MP3
- MP3 files over 15MB: block with message to trim or lower bitrate
- Drop zone hint: `.mp3 recommended · max 15MB · under 5 min`
- These limits exist because of the Gemini inline_data ceiling. Do not raise them without implementing the Gemini File API.

## Design system
All design tokens live in the `G` object in `GreenLitPrototype.jsx`:
- Background: warm off-white (`#FAF9F6`)
- Accent: sage green (`#4A7C59`)
- Font: Inter (sans) + JetBrains Mono (mono) via Google Fonts
- Mobile breakpoint: 520px — `isMobile` state with resize listener
- Page padding: `P = isMobile ? 16 : 28`

## Beta banner
A `<BetaBanner />` component appears at the top of every phase **except** the celebrating phase. It reads: "⚠ Beta Mode: This app is under construction. Not all features are live."

## Celebration screen behavior
- Triggered when user clicks "Critique ready →" on the analyzing screen
- Confetti + music notes burst from center
- Mood/genre tags and short phrases from the Gemini critique float in from edges and drift toward center
- Song auto-plays with fade-in; fades out after 5 seconds
- Auto-advances to song-coach after 7.5 seconds
- No beta banner on this screen

## Audio playback
- `audioRef` — main player ref for the uploaded song
- `celebAudioRef` — ref for the celebration auto-play instance
- `celebFadeRef` — stores the fade-out interval ID so it can be cancelled by the mini player
- When the user hits play/pause on song-coach, always cancel `celebFadeRef` and stop `celebAudioRef` first to avoid two audio instances competing

## Fallback / mock data
- `MOCK_GEMINI` in `GreenLitPrototype.jsx` provides complete fallback data when the API fails
- It includes `elementBreakdown` for all 5 levels × 8 elements — do not remove this
- When API fails, `geminiData` is null and `analysis = MOCK_GEMINI` — all sections must still render
- The error banner shows "⚠ ANALYSIS FAILED — preview mode" with a "Try again →" button

## Deployment workflow
```bash
# Make changes locally
npm run build          # verify clean build before every push
git add <files>
git commit -m "..."
git push               # Vercel auto-deploys on push to main
```
- Always run `npm run build` before pushing — catch errors locally, not in Vercel logs
- Vercel deploys in ~60 seconds after push
- Check Vercel dashboard to confirm deployment is green before telling anyone the fix is live

## Environment variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | Vercel (server-side, Production) | Gemini API key — never VITE_ prefixed |

## Do not
- Do not use `VITE_` prefixed variables for any secret or API key
- Do not call the Gemini API directly from the browser
- Do not split GreenLitPrototype.jsx into sub-components without discussion
- Do not add a database without discussion — the app is intentionally stateless
- Do not add frontend framework dependencies beyond what's already installed
- Do not lower `maxOutputTokens` below 65536 — the response will be truncated
- Do not raise the file size limit above 15MB without implementing the Gemini File API
- Do not remove the `elementBreakdown` from `MOCK_GEMINI` — fallback mode depends on it

## Known limitations (beta)
- Large WAV files (>15MB) are blocked — users must export as MP3
- No Google Drive integration yet (future layer)
- "Next — Release plans →" button is a placeholder (Layer 2 feature)
- Dashboard is functional but sparse (Layer 2/3)
- Gemini calls can take 20–40 seconds — Vercel Hobby plan has a 60s function timeout, most calls complete in time but very complex tracks may occasionally timeout
