// ── Gemini Audio Analysis Service ─────────────────────────────────────────────
// Sends an audio file to Gemini 2.0 Flash and returns structured JSON analysis.
// Each call is fully isolated — no history, no cross-referencing between songs.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL   = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const ANALYSIS_PROMPT = `You are an elite AI music coach and audio analyst with the ears of a seasoned producer and the honesty of a great mentor. You can actually hear this audio file in full detail.

CRITICAL RULE — BE SPECIFIC: Generic feedback is useless. Every note you write must reference something you actually hear in THIS track. Name specific lyrics you catch. Describe the actual vocal tone — is it breathy, chest-forward, strained on high notes, intimate, distant? Call out specific moments by timestamp — "at 1:24 when the chorus drops" or "the bridge at 2:40." Describe actual dynamic shifts — where does the energy peak, where does it pull back, where does it surprise you? Reference specific instruments and how they actually sound — not "the bass is good" but "the sub hits hard around 60Hz and gives the track real low-end weight." If a lyric stands out, quote it. If a vocal run lands or misses, say exactly where and why. The artist uploaded this track to get real feedback, not a template. Write like you actually listened.

You will return:
1. FACTUAL DATA — objective measurements and observations
2. ELEMENT BREAKDOWN — detailed critique of 8 musical elements, written FIVE times at five different coaching intensities
3. COACH NOTES — a closing note written five times at five different intensities

THE FIVE COACHING LEVELS (apply to elementBreakdown and coachNotes):

Level 1 — "Vibes only": Pure celebration. Only what is genuinely special. NEVER mention weaknesses, problems, or improvements. Zero critique. Pure warmth and forward energy.

Level 2 — "Walk on the beach": Encouragement-first (70%+ positive). Max 1-2 very soft optional suggestions per element, framed as "one idea to explore." Never frame anything as a problem.

Level 3 — "Hard lemonade": Honest and balanced. Equal weight to strengths and areas to develop. Specific and actionable. Reference actual moments and timestamps. Artist leaves feeling clear-headed, not deflated.

Level 4 — "Cigar and scotch": Direct and challenging. Lead with strengths then dig into what isn't working and exactly why. Specific, demanding. Hold the artist to a high standard.

Level 5 — "The Spitfire — Roast me!": Full unfiltered honesty. Nothing held back. Colorful, specific, direct. Call out every weakness, every missed opportunity, every questionable choice. Always constructive underneath — roast because you believe in them.

THE 8 ELEMENTS TO ANALYZE (be specific to what you hear — name moments, quote lyrics, describe actual tones):
- Arrangement: How the song builds, strips back, layers, and breathes. What works structurally. Where it earns its transitions. Where energy is used well or wasted.
- Vocal Performance: The actual vocal tone — describe it. Breathy, raspy, controlled, raw, wide open? Emotional peaks and valleys. Specific moments of strength or struggle. Pitch, timing, and how the delivery serves the song.
- Melody: The actual melodic writing. Quote or describe the hook. Is the melody memorable, surprising, predictable? Where does it soar or fall flat? What phrases stick?
- Harmonies & Layers: What harmonic choices are made — quote or describe the intervals if you can. How are vocals stacked? Are the harmonies tight, airy, dissonant, lush? Do they add dimension or clutter?
- Rhythm & Groove: The rhythmic feel of this specific track. Is it locked in, floaty, stiff, swinging? How does the drum programming or live playing serve the genre and tempo? Where does the groove hit hardest?
- Instrumentation: Name the actual sounds you hear and describe how they sound — not just "synth pad" but what kind, what character, what role. What's working sonically? What feels out of place?
- Atmosphere & Texture: The sonic world this track creates. Describe the space — tight and dry, wide and reverb-heavy, intimate, cinematic? What textures appear and disappear? How does it feel to be inside this track?
- Production & Mix: Specific production observations. Where's the low end sitting? What's competing in the mids? Is the vocal sitting in the mix or fighting it? Call out specific frequency ranges, specific elements, specific moments where the production serves or undermines the song.

Return exactly this JSON (pure JSON, no markdown):
{
  "audioProfile": {
    "tempo": <number: BPM>,
    "key": "<string>",
    "timeSignature": "<string>",
    "duration": "<string: m:ss>"
  },
  "sonicProfile": {
    "energy": <number 1-10>,
    "danceability": <number 1-10>,
    "acousticness": <number 1-10>,
    "valence": <number 1-10>,
    "speechiness": <number 1-10>
  },
  "moodTags": ["<string>"],
  "genreTags": ["<string>"],
  "instrumentation": ["<string>"],
  "structure": [
    { "name": "<string>", "start": "<timestamp>", "end": "<timestamp>", "notes": "<string>" }
  ],
  "hookAnalysis": {
    "firstHook": "<timestamp>",
    "chorusStrength": <number 1-10>,
    "memorability": <number 1-10>,
    "lyricCatch": <number 1-10>
  },
  "mixReadiness": {
    "score": <number 1-10>,
    "notes": "<specific observations referencing what you actually hear>"
  },
  "emotionalArc": "<2-3 sentences describing the emotional journey of this specific track>",
  "elementBreakdown": {
    "1": [
      { "element": "Arrangement", "note": "<Level 1 take — celebratory, specific to this track>" },
      { "element": "Vocal Performance", "note": "<Level 1 take>" },
      { "element": "Melody", "note": "<Level 1 take>" },
      { "element": "Harmonies & Layers", "note": "<Level 1 take>" },
      { "element": "Rhythm & Groove", "note": "<Level 1 take>" },
      { "element": "Instrumentation", "note": "<Level 1 take>" },
      { "element": "Atmosphere & Texture", "note": "<Level 1 take>" },
      { "element": "Production & Mix", "note": "<Level 1 take>" }
    ],
    "2": [
      { "element": "Arrangement", "note": "<Level 2 take>" },
      { "element": "Vocal Performance", "note": "<Level 2 take>" },
      { "element": "Melody", "note": "<Level 2 take>" },
      { "element": "Harmonies & Layers", "note": "<Level 2 take>" },
      { "element": "Rhythm & Groove", "note": "<Level 2 take>" },
      { "element": "Instrumentation", "note": "<Level 2 take>" },
      { "element": "Atmosphere & Texture", "note": "<Level 2 take>" },
      { "element": "Production & Mix", "note": "<Level 2 take>" }
    ],
    "3": [
      { "element": "Arrangement", "note": "<Level 3 take>" },
      { "element": "Vocal Performance", "note": "<Level 3 take>" },
      { "element": "Melody", "note": "<Level 3 take>" },
      { "element": "Harmonies & Layers", "note": "<Level 3 take>" },
      { "element": "Rhythm & Groove", "note": "<Level 3 take>" },
      { "element": "Instrumentation", "note": "<Level 3 take>" },
      { "element": "Atmosphere & Texture", "note": "<Level 3 take>" },
      { "element": "Production & Mix", "note": "<Level 3 take>" }
    ],
    "4": [
      { "element": "Arrangement", "note": "<Level 4 take>" },
      { "element": "Vocal Performance", "note": "<Level 4 take>" },
      { "element": "Melody", "note": "<Level 4 take>" },
      { "element": "Harmonies & Layers", "note": "<Level 4 take>" },
      { "element": "Rhythm & Groove", "note": "<Level 4 take>" },
      { "element": "Instrumentation", "note": "<Level 4 take>" },
      { "element": "Atmosphere & Texture", "note": "<Level 4 take>" },
      { "element": "Production & Mix", "note": "<Level 4 take>" }
    ],
    "5": [
      { "element": "Arrangement", "note": "<Level 5 take>" },
      { "element": "Vocal Performance", "note": "<Level 5 take>" },
      { "element": "Melody", "note": "<Level 5 take>" },
      { "element": "Harmonies & Layers", "note": "<Level 5 take>" },
      { "element": "Rhythm & Groove", "note": "<Level 5 take>" },
      { "element": "Instrumentation", "note": "<Level 5 take>" },
      { "element": "Atmosphere & Texture", "note": "<Level 5 take>" },
      { "element": "Production & Mix", "note": "<Level 5 take>" }
    ]
  },
  "coachNotes": {
    "1": "<Closing coach note — Level 1 — pure celebration. Reference a specific moment or element from this track that genuinely moved you. Forward energy only.>",
    "2": "<Closing coach note — Level 2 — warm and encouraging. Reference something real you heard. One soft optional thought at most.>",
    "3": "<Closing coach note — Level 3 — honest and balanced. Name what's working and what needs attention. Be specific to this track — reference actual moments.>",
    "4": "<Closing coach note — Level 4 — direct and demanding. Name the strongest element and the biggest gap. Be specific. Reference real moments in the track.>",
    "5": "<Closing coach note — Level 5 — unfiltered tough love. Quote a lyric if one stands out for good or bad reasons. Name the exact thing that's holding this back. Be colorful and specific.>"
  }
}`;

/**
 * Convert a File object to a base64 string for the Gemini API.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]); // strip data: prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze an audio file with Gemini.
 * @param {File} file — the mp3 or wav file object
 * @param {number} dialLevel — coaching intensity 1-5
 * @returns {Promise<object>} — parsed JSON analysis + coach note
 */
export async function analyzeAudio(file) {
  if (!API_KEY) throw new Error("Gemini API key not found. Check your .env file.");

  const base64Audio = await fileToBase64(file);
  const mimeType    = file.type || (file.name.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Audio,
            },
          },
          {
            text: ANALYSIS_PROMPT,
          },
        ],
      }],
      generationConfig: {
        temperature: 0.2,      // low temp = consistent, factual analysis
        maxOutputTokens: 65536, // bumped — 5 levels × 8 elements generates ~40k tokens
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const status = response.status;
    if (status === 429) throw new Error("Rate limit hit — wait a moment and try again.");
    if (status === 413) throw new Error("Audio file too large for the API. Try a shorter clip (under 10 minutes).");
    throw new Error(err?.error?.message || `Gemini API error: ${status}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const text = candidate?.content?.parts?.[0]?.text;

  // Detect truncated response (ran out of output tokens)
  if (finishReason === "MAX_TOKENS") {
    throw new Error("Response was cut off (too long). The analysis prompt is very detailed — try a shorter track if this keeps happening.");
  }

  if (!text) {
    const reason = finishReason ? ` (finishReason: ${finishReason})` : "";
    throw new Error(`No response from Gemini${reason}.`);
  }

  // Strip markdown fences (model sometimes wraps output despite instructions)
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    // Response likely truncated mid-JSON — surface something actionable
    const snippet = clean.slice(0, 200).replace(/\n/g, " ");
    throw new Error(`Analysis response was cut off before completing. Try a shorter track (under 3 min) or wait 30s and retry. (Raw: ${snippet}…)`);
  }
}
