// ── Gemini Audio Analysis Client ───────────────────────────────────────────
// Calls our own server-side proxy (/api/analyze) which holds the API key.
// The key is never in this file or the client bundle.

/**
 * Convert a File object to a base64 string.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze an audio file via the server-side proxy.
 * @param {File} file — the mp3 or wav file object
 * @returns {Promise<object>} — parsed JSON analysis
 */
export async function analyzeAudio(file) {
  const base64Audio = await fileToBase64(file);
  const mimeType    = file.type || (file.name.endsWith(".wav") ? "audio/wav" : "audio/mpeg");

  // Pre-flight: warn if file is too large before attempting the request
  const estimatedMB = (base64Audio.length * 0.75) / 1024 / 1024;
  if (estimatedMB > 18) {
    throw new Error(
      `File is too large to send (${estimatedMB.toFixed(1)}MB encoded). ` +
      `Export as a shorter MP3 or at a lower bitrate (128kbps) and try again.`
    );
  }

  let response;
  try {
    response = await fetch("/api/analyze", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ base64Audio, mimeType }),
    });
  } catch (networkErr) {
    throw new Error(
      "Could not reach the analysis server — check your connection and try again."
    );
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const status = response.status;
    if (status === 429) throw new Error("Rate limit hit — wait a moment and try again.");
    if (status === 413) throw new Error("Audio file too large for the API. Try a shorter clip.");
    throw new Error(err?.error || `Server error: ${status}`);
  }

  const data = await response.json();
  const candidate   = data?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  const text         = candidate?.content?.parts?.[0]?.text;

  if (finishReason === "MAX_TOKENS") {
    throw new Error("Response was cut off — try a shorter track and retry.");
  }

  if (!text) {
    throw new Error(`No response from Gemini${finishReason ? ` (${finishReason})` : ""}.`);
  }

  // Strip any stray markdown fences just in case
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(
      "Analysis response was cut off before completing. Try a shorter track or retry."
    );
  }
}
