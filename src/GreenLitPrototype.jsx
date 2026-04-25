import { useState, useRef, useEffect } from "react";
import { analyzeAudio } from "./gemini";

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const G = {
  bg:          "#F8F7F3",        // warm off-white
  bg2:         "#EEECEA",        // slightly deeper warm off-white
  card:        "#FFFFFF",        // pure white cards
  green:       "#2A7A50",        // deep sage green
  greenDim:    "rgba(42,122,80,0.08)",
  greenBorder: "rgba(42,122,80,0.22)",
  text:        "#1A1A1A",        // near black
  text2:       "#6B7280",        // medium warm gray
  text3:       "#A8A29E",        // light warm gray
  border:      "#E4E1D8",        // warm light border
  danger:      "#DC3545",
  amber:       "#92400E",
  amberDim:    "#FEF3C7",
  purple:      "#5B3FA6",        // deeper purple for readability
  purpleDim:   "rgba(91,63,166,0.08)",
  purpleBorder:"rgba(91,63,166,0.2)",
  // Tag palette
  tagGreenBg:  "#D6EDE2",
  tagGreenText:"#1A5C38",
  tagPurpleBg: "#E8E0F5",
  tagPurpleText:"#3D206E",
  tagAmberBg:  "#FEF3C7",
  tagAmberText:"#78350F",
  mono:        "'DM Mono', 'Courier New', monospace",
  sans:        "'Inter', system-ui, -apple-system, sans-serif",
};

// ── DATA ───────────────────────────────────────────────────────────────────────
const SURVEY_OPTIONS = [
  {
    id: "A", dial: 1,
    label: "Just messin' around",
    desc: "I just want to vibe out and experiment and see what happens. May not even release it.",
  },
  {
    id: "B", dial: 2,
    label: "Hmm... I made a thing!",
    desc: "I mostly want to get some material out there and let the universe take it from here. Standards and goals are pretty light.",
  },
  {
    id: "C", dial: 3,
    label: "A proper release",
    desc: "This song is me, but I want it to translate. I feel confident it will find its home somewhere. It doesn't need to be a gamechanger, but I want people to vibe to it.",
  },
  {
    id: "D", dial: 4,
    label: "Oh hot damn",
    desc: "Feeling like this one has some universal appeal and I want to make sure listeners end up hearing it in all the glory it deserves. Fingers crossed it pops off hard.",
  },
  {
    id: "E", dial: 5,
    label: "World takeover!",
    desc: "This has the blueprint of a true banger and needs to be constructed like sonic gold before release. HIGH standards: Top of the charts baby.",
  },
  {
    id: "F", dial: 1,
    label: "OFF MAN",
    desc: "I have no clue / I really don't freakin' care / This is stupid / I refuse to choose.",
  },
];

const DIAL_LEVELS = [
  { id: 1, name: "Vibes only",         sub: "No feedback, just analysis" },
  { id: 2, name: "Walk on the beach",  sub: "Light feedback" },
  { id: 3, name: "Hard lemonade",      sub: "50/50 balanced critique" },
  { id: 4, name: "Cigar and scotch",   sub: "Be bold, but don't hurt me pls" },
  { id: 5, name: "The Spitfire",       sub: "Roast me!" },
];

const PROJECT_TYPES = ["Single", "EP", "Album", "Remix", "Compilation", "Mixtape", "Demo"];
const PERSONA_CATS  = ["Artist", "Producer", "Songwriter", "Musician", "Composer", "Collaborator"];
const LOADING_STAGES = ["feeding...", "bitcrushing...", "dithering...", "smiling and nodding..."];

const MOCK_GEMINI = {
  audioProfile: { tempo: 87, key: "F# minor", timeSignature: "4/4", duration: "3:42" },
  sonicProfile:  { energy: 6.2, danceability: 4.8, acousticness: 2.1, valence: 3.4, speechiness: 5.8 },
  moodTags:   ["melancholic", "nocturnal", "introspective", "cinematic", "yearning"],
  genreTags:  ["alternative R&B", "dark pop", "ambient soul"],
  instrumentation: [
    "808 sub bass (sparse, sustained hits)",
    "Rhodes/electric piano (reverb-heavy chords)",
    "Atmospheric synth pads (evolving textures)",
    "Programmed drums (trap-influenced, half-time feel)",
    "Vocal layers (lead + stacked harmonies)",
  ],
  structure: [
    { name: "Intro",        start: "0:00", end: "0:18", notes: "Ambient pad buildup, filtered" },
    { name: "Verse 1",      start: "0:18", end: "1:02", notes: "Vocals enter, minimal production" },
    { name: "Pre-Chorus",   start: "1:02", end: "1:18", notes: "Energy lift, drum pattern shifts" },
    { name: "Chorus",       start: "1:18", end: "1:52", notes: "Full arrangement, layered vocals" },
    { name: "Verse 2",      start: "1:52", end: "2:28", notes: "New melodic elements introduced" },
    { name: "Chorus 2",     start: "2:28", end: "3:02", notes: "Extended, ad-libs added" },
    { name: "Outro/Bridge", start: "3:02", end: "3:42", notes: "Stripped back, vocal run, fade" },
  ],
  hookAnalysis: { firstHook: "0:22", chorusStrength: 7.8, memorability: 7.2, lyricCatch: 6.9 },
  mixReadiness: {
    score: 6.5,
    notes: "Vocals well-recorded, low end needs tightening, stereo field could be wider on the chorus. Overall balance is demo-quality but close to mixable.",
  },
  emotionalArc: "Opens with atmospheric tension, builds gradually through the verse with restrained delivery. Pre-chorus creates anticipation, chorus delivers emotional release with layered harmonies. Second verse deepens the narrative. Outro feels unresolved — could be intentional or could benefit from a stronger closing moment.",
  coachNote: {
    1: "There's something genuinely alive in this track. The way those atmospheric pads set the mood from the first second — that's not something you can manufacture. Your instincts are working. Let this breathe.",
    2: "This is a really compelling piece of work. The emotional world you've built is cohesive and real. One gentle thought: the outro has an opportunity to land even harder if you give it one more moment of resolution. But honestly? This is beautiful as-is.",
    3: "Strong foundation here. Your vocal delivery in the chorus is the undeniable anchor — a hook strength of 7.8 is nothing to sleep on. The low end needs attention before release (the 808 and kick are competing), and the outro doesn't fully deliver on the emotional promise built up in the pre-chorus. Both are fixable. The song itself is solid.",
    4: "The chorus is legitimately great — 7.8 hook strength backed by a vocal performance that earns it. But the verse arrangement is underperforming. You've got 44 seconds building to something and the tension isn't being used intentionally enough. The outro is the weakest part of an otherwise strong track — it fades when it should land. Push harder here. You're close.",
    5: "Okay. Real talk. That chorus melody? Genuinely the best thing you've done in recent memory. The hook sticks, the harmonies are stacked right, and the vocal tone is undeniable. But the 808 is eating your mix for breakfast and nobody told it to stop. The verse arrangement is marking time — you built a runway and didn't use it. And that outro? It just stops. Like you ran out of ideas at the finish line. You've got a great song hiding inside a good demo. Go find it.",
  },
  // Fallback elementBreakdown shown when Gemini API is unavailable
  elementBreakdown: {
    1: [
      { element: "Arrangement", note: "The way this track breathes and builds is genuinely special. Every section earns its place." },
      { element: "Vocal Performance", note: "The vocal tone here is distinctive — there's real emotional intelligence in the delivery." },
      { element: "Melody", note: "That hook is memorable. It's the kind of melody that stays with you long after the track ends." },
      { element: "Harmonies & Layers", note: "The layering adds real depth without cluttering the space. Beautiful restraint." },
      { element: "Rhythm & Groove", note: "The rhythmic feel is locked in. It moves in exactly the right way for this genre." },
      { element: "Instrumentation", note: "Every sound serves the song. The palette is cohesive and intentional." },
      { element: "Atmosphere & Texture", note: "The sonic world here is fully realized. You step into it immediately." },
      { element: "Production & Mix", note: "The production choices show real taste. This sounds like an artist who knows what they want." },
    ],
    2: [
      { element: "Arrangement", note: "The structure flows really naturally — the sections feel earned. One thought: the outro might have room for one more moment of release." },
      { element: "Vocal Performance", note: "Emotionally compelling delivery throughout. The chorus hits especially hard. One idea: the verse dynamics could play even more with intimacy vs. power." },
      { element: "Melody", note: "Strong melodic writing — the hook has real staying power. You might explore pushing the bridge melody even further from the verse." },
      { element: "Harmonies & Layers", note: "The harmony choices are tasteful and add real dimension. Could explore adding a wider interval somewhere in the chorus for extra lift." },
      { element: "Rhythm & Groove", note: "The groove is consistent and serves the track well. An option to explore: a subtle rhythmic variation in the second verse to keep the ear engaged." },
      { element: "Instrumentation", note: "Well-chosen sounds that work cohesively. One thing to consider: a new textural element in the bridge could reward a second listen." },
      { element: "Atmosphere & Texture", note: "The atmospheric world you've built is immersive. You might experiment with a moment of stark contrast somewhere to make the textures land harder." },
      { element: "Production & Mix", note: "Solid production instincts throughout. The low end could use a touch more definition to really lock in the groove." },
    ],
    3: [
      { element: "Arrangement", note: "The arrangement has strong bones — sections are clearly defined and the energy arc works. The outro, however, doesn't deliver on what the pre-chorus promises. Consider giving it a real landing moment rather than a fade." },
      { element: "Vocal Performance", note: "The chorus vocal is the undeniable anchor of this track — emotionally present and well-executed. The verse delivery is more reserved, which works stylistically, but a few phrases feel slightly under-committed. More specificity in the storytelling would strengthen it." },
      { element: "Melody", note: "The hook melody is genuinely strong and memorable. The verse melody does its job but stays fairly predictable in its phrasing. Introducing an unexpected interval or rhythmic displacement in the pre-chorus could make the hook hit even harder by contrast." },
      { element: "Harmonies & Layers", note: "The harmony approach is tasteful and adds real dimension. The stacked vocals in the chorus work well. The verse harmonies are sparse — that's a deliberate choice — but a hidden third voice somewhere might add depth without calling attention to itself." },
      { element: "Rhythm & Groove", note: "The groove is locked and appropriate for the genre. The half-time feel in the verse works. The transition into the chorus could use a more intentional rhythmic lift — right now it's a dynamic change without a real rhythmic event to mark it." },
      { element: "Instrumentation", note: "Sound choices are cohesive and serve the track's mood. The Rhodes is doing a lot of work and earning it. The 808 and kick drum are competing in the low end — they need separation, either by frequency or by rhythmic placement." },
      { element: "Atmosphere & Texture", note: "Strong atmospheric world. The reverb-heavy pads in the intro establish the emotional space well. The textures don't evolve much through the track — one new textural element introduced in the second verse or bridge would reward attentive listening." },
      { element: "Production & Mix", note: "The bones of the mix are solid. Vocal sits well in the mid-range. The main issues are the low end (808 and kick competing around 60-80Hz) and the stereo field, which could be wider on the chorus to give it more size. Otherwise this is close to mixable." },
    ],
    4: [
      { element: "Arrangement", note: "The arrangement structure is clear and the energy arc mostly works. But you've built a lot of runway in the verse and you're not using it intentionally enough. The outro is the weakest part of an otherwise strong track — it fades when it should land. That's a missed opportunity on a song this good." },
      { element: "Vocal Performance", note: "The chorus vocal is legitimately great — emotionally committed, well-pitched, and the tone is distinctive. The verse feels like a different, less-present artist. The gap between your verse and chorus delivery is too wide. Close it, and this track becomes a different conversation." },
      { element: "Melody", note: "The hook is strong and that's the foundation. The verse melody is too predictable — same phrasing structure, same rhythmic pattern, bar after bar. You have the melodic instinct to write surprises. Use it." },
      { element: "Harmonies & Layers", note: "The chorus harmonies work and add dimension. The interval choices are safe — they blend well but they don't challenge anything. Somewhere in this track there's a dissonant or unexpected harmony that would make the resolution feel earned. Find it." },
      { element: "Rhythm & Groove", note: "The groove is solid but it doesn't evolve. You're running the same rhythmic feel from verse through chorus with only a volume change to mark the transition. A real rhythmic event at the chorus — a drum fill, a pattern shift, a beat drop — would give the hook the launch it deserves." },
      { element: "Instrumentation", note: "Sound palette is cohesive. The Rhodes is working overtime and doing it well. The 808 is eating your mix and nobody told it to stop. You need to sidechain it or EQ it out of the kick's territory. Right now the low end is a muddy competition and both elements are losing." },
      { element: "Atmosphere & Texture", note: "The atmospheric world is well-established but static. You set it up in the intro and then just maintain it for the whole track. Great atmospheric production uses texture as a compositional tool — elements entering, leaving, mutating. Map out your texture changes bar by bar and be intentional." },
      { element: "Production & Mix", note: "Technically the mix has real problems that need to be solved before this is release-ready. Low end competition between 808 and kick. Stereo field too narrow on the chorus. Vocal reverb tail is slightly too long and muddying the mid-range. All fixable — but don't confuse a good demo with a finished record." },
    ],
    5: [
      { element: "Arrangement", note: "The arrangement is competent and the structure makes sense — that's the floor, not the ceiling. You built a full runway and delivered a decent takeoff. The outro is where I officially lost faith in you. It just stops. Like you ran out of ideas, looked at the clock, and decided 'good enough.' It's not. Finish the song." },
      { element: "Vocal Performance", note: "Your chorus vocal is the reason anyone would play this twice. It's genuinely good — distinctive tone, emotional commitment, correct pitching. Your verse vocal sounds like someone doing an impression of you at 60% effort. The gap between them is embarrassing. If you sang the verses with the same presence as the chorus, this would be a different conversation entirely." },
      { element: "Melody", note: "The hook melody earns its hook strength score — it sticks, it's well-constructed, it works. The verse melody is on autopilot. Same rhythm, same phrase length, same contour, bar after bar after bar. You have the ability to write the chorus. Apply it to the verses. Stop phoning it in." },
      { element: "Harmonies & Layers", note: "The chorus harmonies are stacked correctly and they add dimension. Fine. Safe. The interval choices throughout are so conservative they're practically apologizing for existing. You've written a song with genuine emotional stakes — put some harmonic tension in it somewhere. A suspended chord, a dissonant second, anything that makes the resolution mean something." },
      { element: "Rhythm & Groove", note: "The groove works. It's not exciting, it doesn't evolve, it won't make anyone lose their mind — but it works and it stays out of the way. The transition into the chorus has no rhythmic event. Just a volume increase. In a song built on tension and release, that's a wasted moment." },
      { element: "Instrumentation", note: "The Rhodes is the MVP of this production and it knows it. The 808? The 808 is a problem. It's sitting in the same frequency territory as your kick and both are drowning. This isn't a style choice — this is a technical mistake that's undermining every other production decision you made. Fix it before you play this for anyone who matters." },
      { element: "Atmosphere & Texture", note: "You nailed the opening atmosphere. Points. Then you ran the exact same texture for the entire track like you were afraid to touch it. Atmospheric production is not a set-it-and-forget-it decision. Your textures should move, breathe, open up and contract. Right now this sounds like someone who discovered reverb and decided one setting was enough for a whole song." },
      { element: "Production & Mix", note: "The mix has three problems you cannot ignore: (1) Low end is a disaster — 808 and kick competing and both losing. (2) Stereo field is too narrow on the chorus, which should be the widest moment in the track. (3) The reverb on your vocals is half a beat too long and muddying your mid-range. None of this is hard to fix. All of it will be noticed by anyone who listens on real speakers." },
    ],
  },
};

// ── COMPONENT ──────────────────────────────────────────────────────────────────
export default function GreenLitPrototype() {
  // ── All state at top level (Rules of Hooks) ──────────────────────────────
  const [phase,          setPhase]          = useState("entry");
  const [personas,       setPersonas]       = useState([]);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaCat,  setNewPersonaCat]  = useState("");
  const [activePersona,  setActivePersona]  = useState(null);
  const [projectType,    setProjectType]    = useState("");
  const [surveyAnswer,   setSurveyAnswer]   = useState(null);
  const [dialSetting,    setDialSetting]    = useState(3);
  const [songs,          setSongs]          = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading,      setUploading]      = useState(false);
  const [isDragOver,     setIsDragOver]     = useState(false);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [loadingStageIdx, setLoadingStageIdx] = useState(-1);
  const [critiqueReady,  setCritiqueReady]  = useState(false);
  const [showCritique,   setShowCritique]   = useState(false);
  const [showLibrary,    setShowLibrary]    = useState(false);
  const [geminiData,     setGeminiData]     = useState(null);
  const [geminiError,    setGeminiError]    = useState(null);
  const [savedProjects,  setSavedProjects]  = useState([]);
  const [viewingProject, setViewingProject] = useState(null);
  const [celebPhrase,    setCelebPhrase]    = useState("");
  const [isMobile,       setIsMobile]       = useState(() => window.innerWidth < 520);

  // Track viewport width for responsive layout
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 520);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const P = isMobile ? 16 : 28; // page-edge padding

  const audioRef      = useRef(null);
  const fileInputRef  = useRef(null);
  const celebAudioRef = useRef(null); // persistent audio across celebration → coach
  const celebFadeRef  = useRef(null); // the running fade interval — so player can cancel it

  // Auto-advance from celebrating → song-coach after animation finishes
  useEffect(() => {
    if (phase !== "celebrating") return;
    const timer = setTimeout(() => {
      setShowCritique(true);
      setPhase("song-coach");
    }, 7500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Play song when celebration starts:
  //   - fade IN from silence over 2.5s
  //   - after 5s, begin slow fade OUT (so it's already dipping before page transition)
  useEffect(() => {
    if (phase !== "celebrating") return;
    const song = songs[0];
    if (!song?.url) return;
    const audio = new Audio(song.url);
    audio.volume = 0;
    celebAudioRef.current = audio;
    audio.play().catch(() => {});

    // Fade in: 0 → 1.0 over 2.5s (50 steps × 50ms)
    let vol = 0;
    const fadeIn = setInterval(() => {
      vol = Math.min(1.0, vol + 0.02);
      try { audio.volume = vol; } catch (_) {}
      if (vol >= 1.0) clearInterval(fadeIn);
    }, 50);

    // After 5s on the celebration page, begin the long fade-out
    // (~2.5s of fading before the page transition at 7.5s, then ~17.5s more on coach page)
    const fadeOutTimer = setTimeout(() => {
      let fadeVol = audio.volume || 1.0;
      const STEPS = 100; // 100 × 200ms = 20s total fade
      const step  = fadeVol / STEPS;
      const fade  = setInterval(() => {
        fadeVol = Math.max(0, fadeVol - step);
        try { audio.volume = fadeVol; } catch (_) {}
        if (fadeVol <= 0) {
          audio.pause();
          celebAudioRef.current = null;
          celebFadeRef.current  = null;
          clearInterval(fade);
          setIsPlaying(false);
        }
      }, 200);
      celebFadeRef.current = fade;
    }, 5000);

    return () => {
      clearInterval(fadeIn);
      clearTimeout(fadeOutTimer);
      // Note: intentionally do NOT pause here — fade-out owns the audio lifecycle
    };
  }, [phase]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["mp3", "wav"].includes(ext)) {
      alert("Please upload an .mp3 or .wav file only.");
      return;
    }
    const sizeMB = file.size / 1024 / 1024;
    // Gemini inline_data limit is ~20MB total — base64 adds 33% so source must be under ~15MB
    const MP3_LIMIT_MB  = 15;
    const WAV_LIMIT_MB  = 15;

    if (ext === "mp3" && sizeMB > MP3_LIMIT_MB) {
      alert(`This MP3 is ${sizeMB.toFixed(1)}MB — a bit too large to send for analysis right now.\n\nTry trimming it to under 5 minutes, or export at 128kbps instead of 320kbps. Either gets it under the limit.`);
      return;
    }
    if (ext === "wav" && sizeMB > WAV_LIMIT_MB) {
      alert(`This WAV file is ${sizeMB.toFixed(1)}MB — too large for analysis.\n\nExport it as an MP3 (128–320kbps) and re-upload. That'll bring it well under the limit.`);
      return;
    }
    if (sizeMB > MP3_LIMIT_MB) {
      alert(`This file is ${sizeMB.toFixed(1)}MB — too large for analysis.\n\nExport as an MP3 (128–320kbps) under 5 minutes and re-upload.`);
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4;
      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setUploading(false);
        const url = URL.createObjectURL(file);
        const tempAudio = new Audio(url);
        const addSong = (duration) => {
          setSongs(prev => [...prev, {
            id: Date.now(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            format: ext.toUpperCase(),
            duration,
            url,
            file,
          }]);
        };
        tempAudio.onloadedmetadata = () => {
          const m = Math.floor(tempAudio.duration / 60);
          const s = Math.floor(tempAudio.duration % 60).toString().padStart(2, "0");
          addSong(`${m}:${s}`);
        };
        tempAudio.onerror = () => addSong("—");
      } else {
        setUploadProgress(progress);
      }
    }, 100);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const startAnalysis = async () => {
    setCritiqueReady(false);
    setShowCritique(false);
    setGeminiError(null);
    setGeminiData(null);

    // Go to the dedicated loading screen
    setPhase("analyzing");

    // Animate loading stages while Gemini works
    setLoadingStageIdx(0);
    const stageInterval = setInterval(() => {
      setLoadingStageIdx(prev => {
        const next = prev + 1;
        return next < LOADING_STAGES.length ? next : prev;
      });
    }, 1800);

    try {
      const activeSong = songs[0];
      const result = await analyzeAudio(activeSong.file);
      setGeminiData(result);
      saveProjectToDashboard(result);
    } catch (err) {
      setGeminiError(err.message);
    } finally {
      clearInterval(stageInterval);
      setLoadingStageIdx(LOADING_STAGES.length);
      setTimeout(() => setCritiqueReady(true), 400);
    }
  };

  const handleSurveySelect = (option) => {
    setSurveyAnswer(option.id);
    setDialSetting(option.dial);
  };

  const removeSong = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setIsPlaying(false);
    setCritiqueReady(false);
    setShowCritique(false);
    setLoadingStageIdx(-1);
  };

  // Auto-save project to dashboard when critique is revealed
  const saveProjectToDashboard = (data) => {
    setSavedProjects(prev => {
      const exists = prev.find(p => p.id === viewingProject);
      if (exists) return prev; // don't duplicate
      const project = {
        id: Date.now(),
        persona: activePersona,
        projectType,
        surveyAnswer,
        songs,
        geminiData: data,
        dialSetting,
        timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setViewingProject(project.id);
      return [project, ...prev];
    });
  };

  // Restore a saved project into view
  const openSavedProject = (project) => {
    setActivePersona(project.persona);
    setProjectType(project.projectType);
    setSurveyAnswer(project.surveyAnswer);
    setSongs(project.songs);
    setGeminiData(project.geminiData);
    setDialSetting(project.dialSetting);
    setCritiqueReady(true);
    setShowCritique(true);
    setLoadingStageIdx(LOADING_STAGES.length);
    setViewingProject(project.id);
    setPhase("song-coach");
  };

  // Start a fresh project flow
  const startNewProject = () => {
    setActivePersona(null);
    setProjectType("");
    setSurveyAnswer(null);
    setDialSetting(3);
    setSongs([]);
    setGeminiData(null);
    setGeminiError(null);
    setCritiqueReady(false);
    setShowCritique(false);
    setLoadingStageIdx(-1);
    setViewingProject(null);
    setPhase("lobby");
  };

  // ── Shared UI primitives ─────────────────────────────────────────────────
  const fonts = (
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  );

  const Label = ({ children, color }) => (
    <p style={{
      fontFamily: G.mono, fontSize: 10, letterSpacing: 1.5,
      textTransform: "uppercase", color: color || G.text3, marginBottom: 8,
    }}>
      {children}
    </p>
  );

  const GreenBtn = ({ onClick, children, style = {}, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? G.bg2 : G.green,
        color: disabled ? G.text3 : "#FFFFFF",
        border: "none", borderRadius: 8,
        padding: "12px 24px",
        fontFamily: G.mono, fontSize: 13, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        letterSpacing: 0.5, transition: "opacity 0.15s",
        boxShadow: disabled ? "none" : "0 1px 3px rgba(42,122,80,0.25)",
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.88"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );

  const GhostBtn = ({ onClick, children, style = {} }) => (
    <button
      onClick={onClick}
      style={{
        background: "#FFFFFF", color: G.text2,
        border: `1px solid ${G.border}`, borderRadius: 8,
        padding: "10px 20px",
        fontFamily: G.mono, fontSize: 12,
        cursor: "pointer", transition: "all 0.15s",
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = G.green;
        e.currentTarget.style.color = G.green;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = G.border;
        e.currentTarget.style.color = G.text2;
      }}
    >
      {children}
    </button>
  );

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: G.card, borderRadius: 14,
      padding: "20px 24px",
      border: `1px solid ${G.border}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      ...style,
    }}>
      {children}
    </div>
  );

  const NavBar = ({ back, onBack }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: isMobile ? 24 : 36,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 20 }}>
        <div
          onClick={() => setPhase("entry")}
          style={{ fontFamily: G.mono, fontSize: isMobile ? 13 : 15, color: G.green, letterSpacing: 2, fontWeight: 500, cursor: "pointer" }}
        >
          GREENLIT
        </div>
        {!isMobile && (
          <span
            onClick={() => setPhase("dashboard")}
            style={{ fontFamily: G.mono, fontSize: 11, color: G.text3, cursor: "pointer", letterSpacing: 0.5, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.green}
            onMouseLeave={e => e.currentTarget.style.color = G.text3}
          >
            Dashboard {savedProjects.length > 0 && `(${savedProjects.length})`}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {back && (
          <GhostBtn onClick={onBack} style={{ fontSize: 11, padding: isMobile ? "6px 10px" : "6px 14px" }}>
            ← {isMobile ? "" : back}
          </GhostBtn>
        )}
        {!isMobile && (
          <GhostBtn onClick={startNewProject} style={{ fontSize: 11, padding: "6px 14px" }}>
            + New project
          </GhostBtn>
        )}
      </div>
    </div>
  );

  // ── Beta banner (shared, shown on all pages except celebrating) ──────────
  const BetaBanner = () => (
    <div style={{
      width: "100%",
      background: G.amberDim,
      borderBottom: `0.5px solid rgba(146,64,14,0.15)`,
      padding: "7px 16px",
      textAlign: "center",
    }}>
      <p style={{
        fontFamily: G.mono, fontSize: 10, color: G.amber,
        letterSpacing: 0.8, lineHeight: 1,
      }}>
        ⚠ Beta Mode: This app is under construction. Not all features are live.
      </p>
    </div>
  );

  // ── Library modal (shared) ────────────────────────────────────────────────
  const LibraryModal = () => (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}>
      <div style={{
        background: G.bg2, border: `0.5px solid ${G.border}`,
        borderRadius: 16, padding: 32,
        width: 500, maxWidth: "90vw",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Label color={G.green}>Greenlit Library</Label>
          <span
            onClick={() => setShowLibrary(false)}
            style={{ cursor: "pointer", color: G.text2, fontSize: 22, lineHeight: 1 }}
          >×</span>
        </div>
        <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.7, marginBottom: 20 }}>
          All your uploaded files live here. Access them from any project, or add files directly.
        </p>
        <div style={{
          border: `1.5px dashed ${G.border}`, borderRadius: 12,
          padding: "36px 24px", textAlign: "center", marginBottom: 16,
        }}>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginBottom: 16, letterSpacing: 1 }}>
            DRAG FILES HERE OR
          </p>
          <GreenBtn style={{ fontSize: 12, padding: "10px 20px" }}>Add to library</GreenBtn>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginTop: 14 }}>
            .mp3 recommended · max 15MB · under 5 min
          </p>
        </div>
        <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, textAlign: "center" }}>
          No files yet
        </p>
      </div>
    </div>
  );

  // ── PHASE: ENTRY ─────────────────────────────────────────────────────────
  if (phase === "entry") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      {fonts}
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } input { outline: none; } input::placeholder { color: ${G.text3}; }`}</style>

      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `16px ${P}px`, borderBottom: `0.5px solid ${G.border}` }}>
        <div style={{ fontFamily: G.mono, fontSize: 16, color: G.green, letterSpacing: 2.5, fontWeight: 500 }}>GREENLIT</div>
        <div style={{ display: "flex", gap: isMobile ? 16 : 28 }}>
          {(isMobile ? ["Library"] : ["Library", "Account", "Settings", "Help"]).map(item => (
            <span key={item} onClick={() => item === "Library" && setShowLibrary(true)}
              style={{ fontFamily: G.mono, fontSize: 11, letterSpacing: 0.5, color: G.text2, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.color = G.text}
              onMouseLeave={e => e.currentTarget.style.color = G.text2}
            >{item}</span>
          ))}
        </div>
      </div>

      <BetaBanner />

      {/* Hero */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: `${isMobile ? 40 : 72}px ${P}px 0`, textAlign: "center" }}>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: 2, color: G.green, textTransform: "uppercase", marginBottom: 14 }}>
          AI-Powered Demo Coach
        </p>
        <h1 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 300, lineHeight: 1.25, letterSpacing: -0.5, marginBottom: 14 }}>
          Give yourself the green light.
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: G.text2, maxWidth: 420, margin: `0 auto ${isMobile ? 36 : 56}px` }}>
          Upload a demo. Get a full release strategy, element-by-element critique, and coaching — calibrated to exactly how you want to be coached.
        </p>

        {/* Two paths */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 40 }}>
          {/* Dashboard */}
          <div
            onClick={() => setPhase("dashboard")}
            style={{
              background: G.card, border: `0.5px solid ${G.border}`,
              borderRadius: 16, padding: isMobile ? "24px 20px" : "32px 24px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G.text3; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; }}
          >
            <div style={{ fontFamily: G.mono, fontSize: 22, color: G.text2, marginBottom: 16 }}>⬛</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 8 }}>My dashboard</div>
            <div style={{ fontSize: 13, color: G.text2, lineHeight: 1.7 }}>
              View your prior projects, songs, and critiques.
            </div>
            {savedProjects.length > 0 && (
              <div style={{ fontFamily: G.mono, fontSize: 10, color: G.green, marginTop: 14, letterSpacing: 0.5 }}>
                {savedProjects.length} project{savedProjects.length !== 1 ? "s" : ""} saved
              </div>
            )}
          </div>

          {/* New project */}
          <div
            onClick={startNewProject}
            style={{
              background: G.green, borderRadius: 16, padding: isMobile ? "24px 20px" : "32px 24px",
              cursor: "pointer", textAlign: "left", transition: "opacity 0.15s",
              boxShadow: "0 2px 12px rgba(42,122,80,0.2)",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <div style={{ fontSize: 22, marginBottom: 16 }}>＋</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: "#FFFFFF", marginBottom: 8 }}>New project</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
              Start a fresh project, upload a demo, and get coached.
            </div>
          </div>
        </div>

        {/* DEV SHORTCUT — remove before launch */}
        <div style={{ marginTop: 8, paddingBottom: 48 }}>
          <span
            onClick={() => {
              setActivePersona({ name: "Test Artist", category: "Artist" });
              setProjectType("Single");
              setSurveyAnswer("C");
              setDialSetting(3);
              setPhase("workspace");
            }}
            style={{
              fontFamily: G.mono, fontSize: 10, color: G.text3,
              cursor: "pointer", letterSpacing: 0.5,
              borderBottom: `1px dashed ${G.border}`,
              paddingBottom: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.color = G.green}
            onMouseLeave={e => e.currentTarget.style.color = G.text3}
          >
            ⚡ dev: skip to file upload
          </span>
        </div>
      </div>
      {showLibrary && <LibraryModal />}
    </div>
  );

  // ── PHASE: DASHBOARD ──────────────────────────────────────────────────────
  if (phase === "dashboard") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text, maxWidth: 720, margin: "0 auto" }}>
      {fonts}
      <BetaBanner />
      <div style={{ padding: `28px ${P}px` }}>
      <NavBar back="Home" onBack={() => setPhase("entry")} />

      <Label>Your workspace</Label>
      <h2 style={{ fontSize: 26, fontWeight: 300, letterSpacing: -0.3, marginBottom: 32 }}>Dashboard</h2>

      {savedProjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ fontSize: 15, color: G.text2, marginBottom: 24 }}>No projects yet. Start your first one.</p>
          <GreenBtn onClick={startNewProject} style={{ padding: "13px 28px" }}>+ New project</GreenBtn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {savedProjects.map(project => (
            <div
              key={project.id}
              onClick={() => openSavedProject(project)}
              style={{
                background: G.card, border: `0.5px solid ${G.border}`,
                borderRadius: 14, padding: "20px 24px", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = G.greenBorder; e.currentTarget.style.background = G.greenDim; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.card; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {/* Persona + project type */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{project.persona?.name}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text3 }}>·</span>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5 }}>{project.projectType}</span>
                  </div>
                  {/* Songs */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {project.songs.map(s => (
                      <span key={s.id} style={{ fontFamily: G.mono, fontSize: 11, color: G.text2, background: G.bg2, borderRadius: 6, padding: "3px 8px" }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                  {/* Dial + mood tags */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.green, background: G.greenDim, border: `0.5px solid ${G.greenBorder}`, borderRadius: 12, padding: "2px 8px" }}>
                      {DIAL_LEVELS.find(l => l.id === project.dialSetting)?.name}
                    </span>
                    {project.geminiData?.moodTags?.slice(0, 3).map(t => (
                      <span key={t} style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, background: G.bg2, borderRadius: 12, padding: "2px 8px" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", paddingLeft: 16 }}>
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginBottom: 6 }}>{project.timestamp}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.green }}>Open →</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );

  // ── PHASE: LOBBY ─────────────────────────────────────────────────────────
  if (phase === "lobby") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      {fonts}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input::placeholder { color: ${G.text3}; }
      `}</style>

      {/* Top nav */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: `16px ${P}px`,
        borderBottom: `0.5px solid ${G.border}`,
      }}>
        <div style={{ fontFamily: G.mono, fontSize: 16, color: G.green, letterSpacing: 2.5, fontWeight: 500 }}>
          GREENLIT
        </div>
        <div style={{ display: "flex", gap: isMobile ? 16 : 28 }}>
          {(isMobile ? ["Library"] : ["Library", "Account", "Settings", "Help"]).map(item => (
            <span
              key={item}
              onClick={() => item === "Library" && setShowLibrary(true)}
              style={{
                fontFamily: G.mono, fontSize: 11, letterSpacing: 0.5,
                color: G.text2, cursor: "pointer", transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = G.text}
              onMouseLeave={e => e.currentTarget.style.color = G.text2}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <BetaBanner />

      {/* Hero */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: `${isMobile ? 36 : 56}px ${P}px 0` }}>
        <p style={{
          fontFamily: G.mono, fontSize: 10, letterSpacing: 2,
          color: G.green, textTransform: "uppercase", marginBottom: 12,
        }}>
          {personas.length > 0 ? `Welcome back${activePersona ? ", " + activePersona.name : ""}` : "Welcome"}
        </p>
        <h1 style={{
          fontSize: isMobile ? 26 : 34, fontWeight: 300, lineHeight: 1.3,
          letterSpacing: -0.5, marginBottom: 12,
        }}>
          Your studio lobby.
        </h1>
        <p style={{
          fontSize: isMobile ? 14 : 15, lineHeight: 1.85, color: G.text2,
          maxWidth: 460, marginBottom: isMobile ? 32 : 48,
        }}>
          Upload a demo. Get a full release strategy, content direction, and coaching —
          calibrated to exactly how you want to be coached.
        </p>

        {/* Personas section */}
        <div style={{ marginBottom: 48 }}>
          <Label>Your personas</Label>
          {personas.length === 0 ? (
            <Card style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.75 }}>
                No personas yet. Create one to get started — artists, producers, songwriters, musicians,
                composers, collaborators. You can have as many as you need.
              </p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {personas.map((p, i) => (
                <div
                  key={i}
                  onClick={() => { setActivePersona(p); setPhase("project-type"); }}
                  style={{
                    padding: "12px 18px",
                    background: activePersona?.name === p.name ? G.greenDim : G.card,
                    border: activePersona?.name === p.name
                      ? `1px solid ${G.greenBorder}`
                      : `0.5px solid ${G.border}`,
                    borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {p.category}
                  </div>
                </div>
              ))}
            </div>
          )}
          <GreenBtn
            onClick={() => setPhase("persona")}
            style={{ fontSize: 12, padding: "10px 18px" }}
          >
            + Create persona
          </GreenBtn>
        </div>

        {/* Start project CTA */}
        {personas.length > 0 && (
          <GreenBtn
            onClick={() => setPhase("project-type")}
            style={{ width: "100%", padding: "15px", fontSize: 14, marginBottom: 40 }}
          >
            Start a new project →
          </GreenBtn>
        )}
      </div>

      {showLibrary && <LibraryModal />}
    </div>
  );

  // ── PHASE: PERSONA ────────────────────────────────────────────────────────
  if (phase === "persona") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      <BetaBanner />
    <div style={{ padding: `28px ${P}px`, maxWidth: 560, margin: "0 auto" }}>
      {fonts}
      <NavBar back="Lobby" onBack={() => setPhase("lobby")} />

      <Label>Create a persona</Label>
      <h2 style={{ fontSize: 26, fontWeight: 300, letterSpacing: -0.3, marginBottom: 10 }}>
        Who are you in this project?
      </h2>
      <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.75, marginBottom: 36 }}>
        You can create multiple personas — one for each hat you wear. Switch between them at any time.
      </p>

      {/* Name */}
      <div style={{ marginBottom: 24 }}>
        <Label>Your name / artist name</Label>
        <input
          value={newPersonaName}
          onChange={e => setNewPersonaName(e.target.value)}
          placeholder="e.g. NVRA, DJ Wavelength, The Composer..."
          style={{
            width: "100%", background: G.card,
            border: `0.5px solid ${G.border}`, borderRadius: 8,
            padding: "13px 16px", color: G.text,
            fontSize: 14, fontFamily: G.sans,
          }}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: 36 }}>
        <Label>I am a...</Label>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 8 }}>
          {PERSONA_CATS.map(cat => (
            <div
              key={cat}
              onClick={() => setNewPersonaCat(cat)}
              style={{
                padding: "13px 10px", textAlign: "center",
                background: newPersonaCat === cat ? G.greenDim : G.card,
                border: newPersonaCat === cat
                  ? `1px solid ${G.greenBorder}`
                  : `0.5px solid ${G.border}`,
                borderRadius: 10, cursor: "pointer",
                fontSize: 13,
                color: newPersonaCat === cat ? G.green : G.text2,
                transition: "all 0.15s",
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <GreenBtn
          disabled={!newPersonaName.trim() || !newPersonaCat}
          onClick={() => {
            const p = { name: newPersonaName.trim(), category: newPersonaCat };
            setPersonas(prev => [...prev, p]);
            setActivePersona(p);
            setNewPersonaName("");
            setNewPersonaCat("");
            setPhase("project-type");
          }}
          style={{ flex: 1, padding: "14px" }}
        >
          Create persona →
        </GreenBtn>
        <GhostBtn onClick={() => setPhase("lobby")}>Back</GhostBtn>
      </div>
    </div>
    </div>
  );

  // ── PHASE: PROJECT TYPE ───────────────────────────────────────────────────
  if (phase === "project-type") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      <BetaBanner />
    <div style={{
      padding: `28px ${P}px`,
      maxWidth: 560, margin: "0 auto",
    }}>
      {fonts}
      <NavBar back="Lobby" onBack={() => setPhase("lobby")} />

      <Label>{activePersona?.name}</Label>
      <h2 style={{ fontSize: 26, fontWeight: 300, letterSpacing: -0.3, marginBottom: 10 }}>
        What kind of project is this?
      </h2>
      <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.75, marginBottom: 36 }}>
        Don't overthink it — you can transform the project type at any time.
        An EP can become a single. A demo can become an album.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 36 }}>
        {PROJECT_TYPES.map(type => (
          <div
            key={type}
            onClick={() => setProjectType(type)}
            style={{
              padding: "18px 20px",
              background: projectType === type ? G.greenDim : G.card,
              border: projectType === type
                ? `1px solid ${G.greenBorder}`
                : `0.5px solid ${G.border}`,
              borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            <div style={{
              fontSize: 15, fontWeight: 400,
              color: projectType === type ? G.green : G.text,
            }}>
              {type}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <GreenBtn
          disabled={!projectType}
          onClick={() => setPhase("survey")}
          style={{ flex: 1, padding: "14px" }}
        >
          Continue →
        </GreenBtn>
        <GhostBtn onClick={() => setPhase("lobby")}>Back</GhostBtn>
      </div>
    </div>
    </div>
  );

  // ── PHASE: SURVEY ─────────────────────────────────────────────────────────
  if (phase === "survey") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      <BetaBanner />
    <div style={{ padding: `28px ${P}px`, maxWidth: 600, margin: "0 auto" }}>
      {fonts}
      <NavBar back="Project type" onBack={() => setPhase("project-type")} />

      <Label>{activePersona?.name} — {projectType}</Label>
      <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 300, letterSpacing: -0.3, marginBottom: 10 }}>
        What's your current state of mind about this project?
      </h2>
      <p style={{ fontSize: 14, color: G.text2, lineHeight: 1.7, marginBottom: 6 }}>
        Choose the option that resonates most.
      </p>
      <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginBottom: 30 }}>
        Don't worry too much about your choice — you can adjust your journey as you go. This is just to brainstorm.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {SURVEY_OPTIONS.map(opt => (
          <div
            key={opt.id}
            onClick={() => handleSurveySelect(opt)}
            style={{
              display: "flex", gap: 16, padding: "16px 20px",
              background: surveyAnswer === opt.id ? G.greenDim : G.card,
              border: surveyAnswer === opt.id
                ? `1px solid ${G.greenBorder}`
                : `0.5px solid ${G.border}`,
              borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
              alignItems: "flex-start",
            }}
          >
            <div style={{
              fontFamily: G.mono, fontSize: 14, fontWeight: 500,
              color: surveyAnswer === opt.id ? G.green : G.text3,
              minWidth: 22, paddingTop: 2,
            }}>
              {opt.id}.
            </div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 500, marginBottom: 5,
                color: surveyAnswer === opt.id ? G.green : G.text,
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 13, color: G.text2, lineHeight: 1.65 }}>
                {opt.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <GreenBtn
          disabled={!surveyAnswer}
          onClick={() => setPhase("workspace")}
          style={{ flex: 1, padding: "14px" }}
        >
          Set up my workspace →
        </GreenBtn>
        <GhostBtn onClick={() => setPhase("project-type")}>Back</GhostBtn>
      </div>
    </div>
    </div>
  );

  // ── PHASE: WORKSPACE ──────────────────────────────────────────────────────
  if (phase === "workspace") return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: G.sans, color: G.text }}>
      <BetaBanner />
    <div style={{ padding: `28px ${P}px`, maxWidth: 680, margin: "0 auto" }}>
      {fonts}

      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 32,
      }}>
        <div>
          <div style={{ fontFamily: G.mono, fontSize: 14, color: G.green, letterSpacing: 2, marginBottom: 8 }}>
            GREENLIT
          </div>
          <Label>{activePersona?.name} — {projectType}</Label>
          <h2 style={{ fontSize: 22, fontWeight: 300, letterSpacing: -0.3 }}>
            Project workspace
          </h2>
        </div>
        <GhostBtn
          onClick={() => {}}
          style={{ fontSize: 11, padding: "7px 14px", marginTop: 4 }}
        >
          Transform project
        </GhostBtn>
      </div>

      {/* Songs already uploaded */}
      {songs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Label>Songs in this project</Label>
          {songs.map(song => (
            <Card key={song.id} style={{ marginBottom: 12 }}>
              {/* Song header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 16,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{song.name}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text3 }}>{song.format}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text3 }}>{song.size}</span>
                    <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text3 }}>{song.duration}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: 12, color: G.text2, cursor: "pointer", textDecoration: "underline" }}
                  >
                    Replace file
                  </span>
                  <span
                    onClick={() => removeSong(song.id)}
                    style={{ fontSize: 12, color: G.danger, cursor: "pointer", textDecoration: "underline" }}
                  >
                    Delete file
                  </span>
                </div>
              </div>

              {/* Player */}
              <audio
                ref={audioRef}
                src={song.url}
                onEnded={() => setIsPlaying(false)}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {[
                  { icon: "▶", label: "Play",    action: () => { audioRef.current?.play();  setIsPlaying(true);  } },
                  { icon: "⏸", label: "Pause",   action: () => { audioRef.current?.pause(); setIsPlaying(false); } },
                  { icon: "↺", label: "Restart", action: () => {
                    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); setIsPlaying(true); }
                  }},
                ].map(({ icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    title={label}
                    style={{
                      background: G.bg2, border: `0.5px solid ${G.border}`,
                      borderRadius: 7, padding: "7px 14px",
                      color: G.text2, cursor: "pointer", fontSize: 12,
                    }}
                  >
                    {icon}
                  </button>
                ))}
                {isPlaying && (
                  <span style={{ fontFamily: G.mono, fontSize: 10, color: G.green, marginLeft: 6 }}>
                    playing
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload progress bar */}
      {uploading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: G.mono, fontSize: 11, color: G.text2 }}>Uploading...</span>
            <span style={{ fontFamily: G.mono, fontSize: 11, color: G.green }}>
              {Math.min(Math.round(uploadProgress), 100)}%
            </span>
          </div>
          <div style={{ height: 4, background: G.border, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(uploadProgress, 100)}%`,
              background: G.green,
              borderRadius: 4,
              transition: "width 0.08s linear",
            }} />
          </div>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginTop: 8 }}>
            Uploaded
          </p>
        </div>
      )}

      {/* Drop zone (shown when no songs yet) */}
      {!uploading && songs.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          style={{
            border: `1.5px dashed ${isDragOver ? G.green : G.border}`,
            borderRadius: 16,
            padding: isMobile ? "36px 16px" : "52px 24px",
            textAlign: "center",
            marginBottom: 16,
            background: isDragOver ? G.greenDim : "transparent",
            transition: "all 0.2s",
          }}
        >
          <p style={{
            fontFamily: G.mono, fontSize: 11, color: G.text3,
            letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 18,
          }}>
            Drag & drop your demo here
          </p>
          <p style={{ fontSize: 13, color: G.text3, marginBottom: 20 }}>or</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
            <GreenBtn
              onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 12, padding: "10px 18px" }}
            >
              Select from computer
            </GreenBtn>
            <GhostBtn
              onClick={() => setShowLibrary(true)}
              style={{ fontSize: 12, padding: "10px 18px" }}
            >
              Greenlit library
            </GhostBtn>
          </div>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3 }}>
            .mp3 recommended · max 15MB · under 5 min
          </p>
        </div>
      )}

      {/* Add more songs link (after first upload) */}
      {!uploading && songs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <GhostBtn
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: 12, padding: "8px 16px" }}
          >
            + Add song
          </GhostBtn>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav"
        style={{ display: "none" }}
        onChange={e => { handleFileSelect(e.target.files[0]); e.target.value = ""; }}
      />

      {/* Bottom navigation */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 36, paddingTop: 20,
        borderTop: `0.5px solid ${G.border}`,
      }}>
        <GhostBtn onClick={() => setPhase("survey")}>Go back</GhostBtn>
        <div style={{ display: "flex", gap: 10 }}>
          <GhostBtn onClick={() => setPhase("song-coach")} style={{ fontSize: 12 }}>
            Skip to release plans
          </GhostBtn>
          <GreenBtn
            disabled={songs.length === 0}
            onClick={() => setPhase("song-coach")}
            style={{ padding: "12px 20px" }}
          >
            Song coach →
          </GreenBtn>
        </div>
      </div>

      {showLibrary && <LibraryModal />}
    </div>
    </div>
  );

  // ── PHASE: ANALYZING ─────────────────────────────────────────────────────
  if (phase === "analyzing") {
    const isAnalyzing  = loadingStageIdx >= 0 && loadingStageIdx < LOADING_STAGES.length;
    const progressPct  = critiqueReady
      ? 100
      : Math.max(4, Math.round((loadingStageIdx / LOADING_STAGES.length) * 88));
    const stageLabel   = isAnalyzing ? LOADING_STAGES[loadingStageIdx] : "done.";

    return (
      <div style={{
        background: G.bg, minHeight: "100vh", fontFamily: G.sans,
        color: G.text, display: "flex", flexDirection: "column",
      }}>
        {fonts}
        <style>{`
          @keyframes dotPulse { 0%, 100% { opacity: 0.15; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.15); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes barGlow { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; } }
        `}</style>

        {/* Top wordmark — subtle anchor */}
        <div style={{ padding: `22px ${P}px` }}>
          <div style={{ fontFamily: G.mono, fontSize: 14, color: G.green, letterSpacing: 2.5, fontWeight: 500 }}>
            GREENLIT
          </div>
        </div>
        <BetaBanner />

        {/* Centered stage */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 28px 80px",
        }}>

          {/* Dots */}
          {!critiqueReady && (
            <div style={{ display: "flex", gap: 10, marginBottom: 36 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: G.green,
                  animation: `dotPulse 1.3s ease-in-out ${i * 0.28}s infinite`,
                }} />
              ))}
            </div>
          )}

          {/* Check mark when done */}
          {critiqueReady && (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: G.tagGreenBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 32,
              animation: "fadeUp 0.4s ease",
            }}>
              <span style={{ fontSize: 22, color: G.green }}>✓</span>
            </div>
          )}

          {/* Stage label */}
          <p style={{
            fontFamily: G.mono, fontSize: 18, color: G.text,
            letterSpacing: 0.5, marginBottom: 10,
            minHeight: 28,
            transition: "opacity 0.3s",
          }}>
            {stageLabel}
          </p>

          {/* Subtext */}
          <p style={{
            fontSize: 13, color: G.text3, marginBottom: 48,
            letterSpacing: 0.2, textAlign: "center", maxWidth: 280, lineHeight: 1.7,
          }}>
            {critiqueReady
              ? "Your critique is ready."
              : "Listening closely. This takes a moment — worth it."}
          </p>

          {/* Progress bar */}
          <div style={{ width: "100%", maxWidth: isMobile ? 280 : 340, marginBottom: 12 }}>
            <div style={{
              height: 5, background: G.border, borderRadius: 99,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${progressPct}%`,
                background: G.green,
                borderRadius: 99,
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: !critiqueReady ? "barGlow 2s ease-in-out infinite" : "none",
              }} />
            </div>
          </div>

          {/* Percentage */}
          <p style={{
            fontFamily: G.mono, fontSize: 11, color: G.text3,
            letterSpacing: 1, marginBottom: 48,
          }}>
            {progressPct}%
          </p>

          {/* Error state */}
          {critiqueReady && geminiError && (
            <div style={{
              background: "rgba(220,53,69,0.07)", border: `0.5px solid rgba(220,53,69,0.25)`,
              borderRadius: 12, padding: "14px 20px", marginBottom: 20,
              maxWidth: 340, textAlign: "center",
              animation: "fadeUp 0.4s ease",
            }}>
              <p style={{ fontFamily: G.mono, fontSize: 10, color: G.danger, marginBottom: 6, letterSpacing: 0.5 }}>
                GEMINI ERROR — showing mock data
              </p>
              <p style={{ fontSize: 12, color: G.text2, lineHeight: 1.6 }}>{geminiError}</p>
            </div>
          )}

          {/* Critique ready CTA */}
          {critiqueReady && (
            <div style={{ animation: "fadeUp 0.5s ease" }}>
              <GreenBtn
                onClick={() => {
                  const CELEBRATION_PHRASES = ["THIS IS DOPE", "WHOA....", "OMG I LOVE THIS"];
                  setCelebPhrase(CELEBRATION_PHRASES[Math.floor(Math.random() * CELEBRATION_PHRASES.length)]);
                  setIsPlaying(true); // music starts immediately; player shows ⏸ on coach page
                  setPhase("celebrating");
                }}
                style={{ padding: "16px 44px", fontSize: 15 }}
              >
                Critique ready →
              </GreenBtn>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PHASE: CELEBRATING ───────────────────────────────────────────────────
  if (phase === "celebrating") {
    const CONFETTI_COLORS = [
      "#FF6B6B","#FFE66D","#4ECDC4","#A78BFA","#F472B6","#FB923C",
      "#34D399","#60A5FA","#FFFFFF","#FCD34D","#F9A8D4","#6EE7B7",
      "#FF9F43","#EE5A24","#C44569","#786FA6","#F8EFBA","#58B19F",
    ];
    const MUSIC_NOTES = ["♩","♪","♫","♬","♩","♪","♫","♬","♩","♪","♫","♬","♩","♪","♫","♬","♩","♪","♫","♬"];
    const analysis   = geminiData ? { ...MOCK_GEMINI, ...geminiData } : MOCK_GEMINI;

    // Pull short positive phrases from Vibes Only coach note + emotional arc
    const extractPhrases = (text, maxWords = 8) => {
      if (!text) return [];
      return text
        .split(/[.!]+/)
        .map(s => s.replace(/^[\s,—–-]+/, "").trim())
        .filter(s => s.length > 18 && s.length < 120)
        .map(s => {
          const words = s.split(/\s+/);
          return (words.length > maxWords ? words.slice(0, maxWords).join(" ") + "..." : s).trim();
        })
        .filter(s => s.length > 0)
        .slice(0, 2);
    };

    const vibesNote = analysis.coachNotes?.["1"] || analysis.coachNote?.[1] || "";
    const critiquePhrases = [
      ...extractPhrases(vibesNote, 7),
      ...extractPhrases(analysis.emotionalArc, 7),
    ].slice(0, 3);

    // Combined float items: tags (single words) + phrases (short quotes)
    const floatItems = [
      ...analysis.moodTags.slice(0, 4).map(t  => ({ text: t, isPhrase: false })),
      ...analysis.genreTags.slice(0, 3).map(t => ({ text: t, isPhrase: false })),
      ...critiquePhrases.map(t                => ({ text: t, isPhrase: true  })),
    ].slice(0, 12);

    // 100 particles: 26 big notes + 74 confetti — deterministic so no re-render flicker
    const particles = Array.from({ length: 100 }, (_, i) => {
      const isNote  = i < 26;
      const angle   = (i / 100) * 360 + ((i * 37.3) % 22) - 11;
      const minDist = isNote ? 100 : 80;
      const maxDist = isNote ? 380 : 460;
      const dist    = minDist + ((i * 67 + 13) % (maxDist - minDist));
      const rad     = (angle * Math.PI) / 180;
      const noteIdx = i % MUSIC_NOTES.length;
      return {
        id:       i,
        tx:       Math.cos(rad) * dist,
        ty:       Math.sin(rad) * dist,
        color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size:     isNote ? 28 + (i % 6) * 6 : 9 + (i % 6) * 3,
        isNote,
        note:     MUSIC_NOTES[noteIdx],
        delay:    (i * 0.028) % 0.65,
        duration: isNote ? 1.6 + (i % 5) * 0.22 : 1.0 + (i % 6) * 0.18,
        rot:      (i * 53) % 720 - 360,
        // confetti shape variety
        isRect:   !isNote && i % 4 !== 0,
        isThin:   !isNote && i % 7 === 0,
      };
    });

    // Word/phrase slots: tags hug edges, phrase slots have a bit more room
    const wordSlots = [
      // Tags — tight to the edges
      { pos: { top: "9%",   left: "4%"   }, dx:  160, dy:  80 },
      { pos: { top: "7%",   right: "4%"  }, dx: -160, dy:  80 },
      { pos: { top: "41%",  left: "1%"   }, dx:  180, dy:   0 },
      { pos: { top: "53%",  right: "2%"  }, dx: -180, dy:   0 },
      { pos: { top: "78%",  left: "5%"   }, dx:  140, dy: -90 },
      { pos: { top: "81%",  right: "5%"  }, dx: -140, dy: -90 },
      { pos: { top: "22%",  left: "3%"   }, dx:  165, dy:  50 },
      // Phrases — slightly more central so text has room
      { pos: { top: "88%",  left: "12%"  }, dx:   60, dy: -110 },
      { pos: { top: "87%",  right: "10%" }, dx:  -60, dy: -110 },
      { pos: { top: "3%",   left: "18%"  }, dx:   50, dy:  110 },
      { pos: { top: "3%",   right: "16%" }, dx:  -50, dy:  110 },
      { pos: { top: "64%",  right: "3%"  }, dx: -165, dy:  -50 },
    ];

    return (
      <div style={{
        position: "fixed", inset: 0,
        background: G.green,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        animation: "celebPage 7.5s ease-out forwards",
      }}>
        {fonts}
        <style>{`
          @keyframes celebBurst {
            0%   { transform: translate(0,0) rotate(0deg) scale(1.1); opacity: 1; }
            50%  { opacity: 1; }
            100% { transform: translate(var(--p-tx), var(--p-ty)) rotate(var(--p-rot)) scale(0.3); opacity: 0; }
          }
          @keyframes celebPhraseAnim {
            0%   { transform: scale(0.08) rotate(-6deg); opacity: 0; }
            10%  { transform: scale(1.18) rotate(2.5deg); opacity: 1; }
            20%  { transform: scale(0.96) rotate(-1deg); }
            26%  { transform: scale(1.0)  rotate(0deg); }
            72%  { transform: scale(1.0)  rotate(0deg); opacity: 1; }
            100% { transform: scale(0.82) rotate(-3deg); opacity: 0; }
          }
          @keyframes wordConverge {
            0%   { opacity: 0; transform: translate(0, 0); }
            18%  { opacity: 1; transform: translate(calc(var(--p-dx) * 0.06), calc(var(--p-dy) * 0.06)); }
            72%  { opacity: 1; }
            100% { opacity: 0; transform: translate(var(--p-dx), var(--p-dy)); }
          }
          @keyframes celebPage {
            0%, 74% { opacity: 1; }
            100%    { opacity: 0; }
          }
        `}</style>

        {/* Confetti + music note particles — full disco burst */}
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position:   "absolute",
              top:        "50%",
              left:       "50%",
              width:      p.size,
              height:     p.isNote ? p.size : p.isThin ? p.size * 0.25 : p.isRect ? p.size * 0.45 : p.size,
              marginTop:  -(p.size / 2),
              marginLeft: -(p.size / 2),
              borderRadius: (p.isNote || (!p.isRect && !p.isThin)) ? "50%" : 3,
              background: p.isNote ? "transparent" : p.color,
              color:      p.isNote ? p.color : "transparent",
              fontSize:   p.isNote ? p.size : 0,
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              "--p-tx":   `${p.tx}px`,
              "--p-ty":   `${p.ty}px`,
              "--p-rot":  `${p.rot}deg`,
              animation:  `celebBurst ${p.duration}s ease-out ${p.delay}s both`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {p.isNote ? p.note : null}
          </div>
        ))}

        {/* Floating tags + critique phrases — start at edges, converge toward center */}
        {floatItems.map((item, i) => {
          const slot = wordSlots[i % wordSlots.length];
          return (
            <div
              key={item.text}
              style={{
                position:      "absolute",
                ...slot.pos,
                fontFamily:    item.isPhrase ? G.sans : G.mono,
                fontSize:      item.isPhrase ? 17 : 19,
                fontWeight:    item.isPhrase ? 400 : 600,
                fontStyle:     item.isPhrase ? "italic" : "normal",
                letterSpacing: item.isPhrase ? 0.2 : 3,
                textTransform: item.isPhrase ? "none" : "uppercase",
                color:         item.isPhrase ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.88)",
                maxWidth:      item.isPhrase ? 260 : "none",
                lineHeight:    item.isPhrase ? 1.4 : 1,
                "--p-dx":      `${slot.dx}px`,
                "--p-dy":      `${slot.dy}px`,
                animation:     `wordConverge ${item.isPhrase ? 6.0 : 5.5}s ease-in ${0.7 + i * 0.32}s both`,
                pointerEvents: "none",
                whiteSpace:    item.isPhrase ? "normal" : "nowrap",
                textShadow:    "0 2px 14px rgba(0,0,0,0.22)",
              }}
            >
              {item.text}
            </div>
          );
        })}

        {/* Big center celebration phrase */}
        <div style={{
          position:  "relative",
          zIndex:    10,
          textAlign: "center",
          animation: "celebPhraseAnim 7.2s ease both",
          padding:   "0 20px",
        }}>
          <div style={{
            fontSize:      "clamp(68px, 14vw, 120px)",
            fontWeight:    900,
            color:         "#FFFFFF",
            fontFamily:    G.sans,
            letterSpacing: -3,
            lineHeight:    1.0,
            textShadow:    "0 8px 60px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.2)",
          }}>
            {celebPhrase}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: SONG COACH ─────────────────────────────────────────────────────
  if (phase === "song-coach") {
    const currentLevel = DIAL_LEVELS.find(l => l.id === dialSetting);
    // Merge real Gemini data over mock — ensures no field is ever undefined
    const analysis = geminiData ? { ...MOCK_GEMINI, ...geminiData } : MOCK_GEMINI;

    return (
      <div style={{
        background: G.bg, minHeight: "100vh", fontFamily: G.sans,
        color: G.text,
      }}>
        {fonts}
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <BetaBanner />
        <div style={{ padding: `28px ${P}px`, maxWidth: 640, margin: "0 auto" }}>

        <NavBar back="Workspace" onBack={() => setPhase("workspace")} />

        <Label>{activePersona?.name} — {projectType}</Label>
        <h2 style={{ fontSize: 22, fontWeight: 300, letterSpacing: -0.3, marginBottom: 20 }}>
          Song coach
        </h2>

        {/* Mini player */}
        {songs.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: G.bg2, border: `0.5px solid ${G.border}`,
            borderRadius: 10, padding: "10px 16px", marginBottom: 28,
          }}>
            <audio
              ref={audioRef}
              src={songs[0].url}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              onClick={() => {
                if (isPlaying) {
                  // If celebration audio is fading, cancel it and stop
                  if (celebAudioRef.current) {
                    clearInterval(celebFadeRef.current);
                    celebFadeRef.current = null;
                    celebAudioRef.current.pause();
                    celebAudioRef.current = null;
                  }
                  audioRef.current?.pause();
                  setIsPlaying(false);
                } else {
                  // Play fresh from the JSX audio element
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                  }
                  setIsPlaying(true);
                }
              }}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: G.green, border: "none",
                color: "#FFF", fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: G.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {songs[0].name}
              </div>
              <div style={{ fontFamily: G.mono, fontSize: 9, color: isPlaying ? G.green : G.text3, letterSpacing: 0.5, marginTop: 2 }}>
                {isPlaying ? "now playing" : "tap to play"}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Card style={{ marginBottom: 28, borderLeft: `3px solid ${G.text3}` }}>
          <p style={{ fontSize: 13, lineHeight: 1.85, color: G.text2 }}>
            <strong style={{ color: G.text }}>Stop right here...</strong>{" "}
            This is where things can get a little crazy. As artists, we need to trust our instinct
            and feel confident and proud of our work. Don't forget — this is a freakin' AI. It's really
            good at what it does, but it's not human. For example, it may tell you there isn't a lot of
            room to breathe and the drums almost never stop, but maybe your track is mainroom / driving
            techno. Or it may tell you there's a buildup of 3–5kHz because AI ears read it as excessive
            in technical terms, but to human ears it may sound perfect — which is what matters. So take
            it with a grain of salt. Also keep in mind: it may try to give you mix or master critique,
            which it's not as good at as song, arrangement, performance, and lyrics. Best to ignore
            those notes, especially since this is not a final.
          </p>
        </Card>

        {/* Dial */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, marginBottom: 16, lineHeight: 1.6 }}>
            Tip: We recommend starting at 1 — Vibes only, especially if it's your first time.
            You don't even have to change it if you don't want. :)
          </p>

          <Label color={G.green}>Song coach dial</Label>

          <div style={{ display: "flex", gap: isMobile ? 4 : 6, marginBottom: 14 }}>
            {DIAL_LEVELS.map(level => (
              <div
                key={level.id}
                onClick={() => setDialSetting(level.id)}
                style={{
                  flex: 1, padding: isMobile ? "10px 2px" : "14px 6px", textAlign: "center",
                  background: dialSetting === level.id ? G.green : G.card,
                  border: dialSetting === level.id ? "none" : `0.5px solid ${G.border}`,
                  borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  fontFamily: G.mono, fontSize: isMobile ? 14 : 16, fontWeight: 500,
                  color: dialSetting === level.id ? "#FFFFFF" : G.text3,
                  marginBottom: isMobile ? 3 : 6,
                }}>
                  {level.id}
                </div>
                {!isMobile && (
                  <div style={{
                    fontFamily: G.mono, fontSize: 9,
                    color: dialSetting === level.id ? "rgba(255,255,255,0.7)" : G.text3,
                    letterSpacing: 0.2, lineHeight: 1.4,
                  }}>
                    {level.name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active level label */}
          <div style={{
            background: G.greenDim,
            border: `0.5px solid ${G.greenBorder}`,
            borderRadius: 10, padding: "13px 18px", textAlign: "center",
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: G.green, marginBottom: 3 }}>
              {currentLevel?.name}
            </div>
            <div style={{ fontSize: 12, color: G.text2 }}>{currentLevel?.sub}</div>
          </div>
        </div>

        {/* CTA — only shown when critique hasn't started yet */}
        {!critiqueReady && !showCritique && (
          <GreenBtn
            onClick={startAnalysis}
            style={{ width: "100%", padding: "18px", fontSize: 15, letterSpacing: 0.3 }}
          >
            analyze this.
          </GreenBtn>
        )}

        {/* Error state */}
        {critiqueReady && geminiError && (
          <div style={{ background: "rgba(255,69,69,0.08)", border: "0.5px solid rgba(255,69,69,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontFamily: G.mono, fontSize: 11, color: G.danger, marginBottom: 6, letterSpacing: 0.5 }}>
              ⚠ ANALYSIS FAILED — preview mode
            </p>
            <p style={{ fontSize: 13, color: G.text2, lineHeight: 1.65, marginBottom: 14 }}>{geminiError}</p>
            <button
              onClick={startAnalysis}
              style={{
                background: "transparent", border: `0.5px solid rgba(255,69,69,0.4)`,
                borderRadius: 8, padding: "8px 16px",
                fontFamily: G.mono, fontSize: 11, color: G.danger, letterSpacing: 0.5,
                cursor: "pointer",
              }}
            >
              Try again →
            </button>
          </div>
        )}

        {/* Critique callouts */}
        {showCritique && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Live badge */}
            {geminiData && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: G.greenDim, border: `0.5px solid ${G.greenBorder}`,
                borderRadius: 20, padding: "5px 12px", marginBottom: 20,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: G.green }} />
                <span style={{ fontFamily: G.mono, fontSize: 10, color: G.green, letterSpacing: 1 }}>
                  LIVE — analyzed by Gemini
                </span>
              </div>
            )}

            {/* Audio Profile */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Audio profile</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Tempo",           `${analysis.audioProfile.tempo} BPM`],
                  ["Key",             analysis.audioProfile.key],
                  ["Time signature",  analysis.audioProfile.timeSignature],
                  ["Duration",        analysis.audioProfile.duration],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: G.bg2, borderRadius: 8, padding: "11px 14px" }}>
                    <div style={{ fontFamily: G.mono, fontSize: 9, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mood & Genre */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Mood & genre</Label>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Mood</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {analysis.moodTags.map(t => (
                    <span key={t} style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 20,
                      background: G.tagGreenBg, color: G.tagGreenText,
                      fontWeight: 500,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: G.mono, fontSize: 9, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Genre</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {analysis.genreTags.map(t => (
                    <span key={t} style={{
                      fontSize: 12, padding: "4px 12px", borderRadius: 20,
                      background: G.tagPurpleBg, color: G.tagPurpleText,
                      fontWeight: 500,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Energy & Feel */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Energy & feel</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["Energy",        analysis.sonicProfile.energy],
                  ["Danceability",  analysis.sonicProfile.danceability],
                  ["Acousticness",  analysis.sonicProfile.acousticness],
                  ["Valence",       analysis.sonicProfile.valence],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: G.mono, fontSize: 10, color: G.text2 }}>{label}</span>
                      <span style={{ fontFamily: G.mono, fontSize: 10, color: G.green }}>{val} / 10</span>
                    </div>
                    <div style={{ height: 3, background: G.border, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${val * 10}%`,
                        background: G.green, borderRadius: 3,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Instrumentation */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Instrumentation</Label>
              {analysis.instrumentation.map((item, i) => (
                <p key={i} style={{ fontSize: 13, color: G.text2, lineHeight: 1.7 }}>— {item}</p>
              ))}
            </Card>

            {/* Song Structure */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Song structure</Label>
              {analysis.structure.map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, marginBottom: 10,
                  alignItems: "flex-start",
                  paddingBottom: i < analysis.structure.length - 1 ? 10 : 0,
                  borderBottom: i < analysis.structure.length - 1 ? `0.5px solid ${G.border}` : "none",
                }}>
                  <div style={{ fontFamily: G.mono, fontSize: 10, color: G.text3, minWidth: 72, paddingTop: 1 }}>
                    {s.start}–{s.end}
                  </div>
                  <div>
                    <div style={{ fontFamily: G.mono, fontSize: 11, color: G.text, marginBottom: 3 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: G.text2 }}>{s.notes}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Hook Analysis */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Hook analysis</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["First hook",           analysis.hookAnalysis.firstHook],
                  ["Chorus strength",      `${analysis.hookAnalysis.chorusStrength} / 10`],
                  ["Melodic memorability", `${analysis.hookAnalysis.memorability} / 10`],
                  ["Lyric catchiness",     `${analysis.hookAnalysis.lyricCatch} / 10`],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: G.bg2, borderRadius: 8, padding: "11px 14px" }}>
                    <div style={{ fontFamily: G.mono, fontSize: 9, color: G.text3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: G.green }}>{val}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mix Readiness — hidden at dial level 1 */}
            {dialSetting > 1 && (
              <Card style={{ marginBottom: 12 }}>
                <Label color={G.green}>Mix readiness</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                  <div style={{
                    fontFamily: G.mono, fontSize: 26, fontWeight: 500,
                    color: analysis.mixReadiness.score >= 7 ? G.green : G.amber,
                  }}>
                    {analysis.mixReadiness.score}
                    <span style={{ fontSize: 12, color: G.text3 }}> / 10</span>
                  </div>
                  <div style={{ flex: 1, height: 4, background: G.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${analysis.mixReadiness.score * 10}%`,
                      background: analysis.mixReadiness.score >= 7 ? G.green : "#D97706",
                      borderRadius: 4,
                    }} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: G.text2, lineHeight: 1.7 }}>
                  {analysis.mixReadiness.notes}
                </p>
              </Card>
            )}

            {/* Emotional Arc */}
            <Card style={{ marginBottom: 12 }}>
              <Label color={G.green}>Emotional arc</Label>
              <p style={{ fontSize: 14, lineHeight: 1.85, color: G.text2, fontStyle: "italic" }}>
                {analysis.emotionalArc}
              </p>
            </Card>

            {/* ── ELEMENT BREAKDOWN — the main meat ── */}
            {(geminiData?.elementBreakdown?.[dialSetting] || analysis.elementBreakdown?.[dialSetting]) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 14,
                }}>
                  <Label color={G.green}>Element breakdown — {currentLevel?.name}</Label>
                </div>
                {(geminiData?.elementBreakdown?.[dialSetting] || analysis.elementBreakdown?.[dialSetting]).map((el, i) => (
                  <Card key={i} style={{ marginBottom: 10 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                    }}>
                      <div style={{
                        fontFamily: G.mono, fontSize: 10, fontWeight: 500,
                        color: G.green, textTransform: "uppercase", letterSpacing: 1,
                      }}>
                        {el.element}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.85, color: G.text }}>
                      {el.note}
                    </p>
                  </Card>
                ))}
              </div>
            )}

            {/* Coach's Note */}
            <Card style={{ marginBottom: 32, borderLeft: `3px solid ${G.green}` }}>
              <Label color={G.green}>Coach's note — {currentLevel?.name}</Label>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: G.text }}>
                {geminiData?.coachNotes?.[dialSetting] || analysis.coachNote[dialSetting]}
              </p>
            </Card>

            {/* Navigation */}
            <div style={{
              display: "flex", gap: 10,
              paddingTop: 20,
              borderTop: `0.5px solid ${G.border}`,
            }}>
              <GhostBtn onClick={() => setPhase("workspace")}>Go back</GhostBtn>
              <GreenBtn
                onClick={() => {}}
                style={{ flex: 1, padding: "14px" }}
              >
                Next — Release plans →
              </GreenBtn>
            </div>
          </div>
        )}
        </div>{/* end inner padded div */}
      </div>
    );
  }

  return null;
}
