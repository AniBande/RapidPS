import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "25mb" }));

const buildGeminiParts = ({ text, images = [], videos = [] }) => {
  const parts = [
    {
      text: `You are an anomaly detection engine for an online police complaint system.

You will receive:
- Optional complaint text
- Optional image evidence
- Optional video evidence

Your task is to analyze EACH modality SEPARATELY and INDEPENDENTLY. 
Do NOT let text influence image scoring. Do NOT let image influence text scoring. 
Each score must be based ONLY on its own modality.

Return ONLY valid JSON in exactly this structure:
{
  "text_score": number | null,
  "image_score": number | null,
  "video_score": number | null
}

Scoring Rules:
1. If text is provided:
   - Analyze only the TEXT.
   - Detect suspicious, fake, exaggerated, contradictory, inconsistent, or fabricated descriptions.
   - text_score must be between 0 and 1.
   - Higher score means more anomalous.
2. If NO text is provided:
   - text_score must be null.

3. If images are provided:
   - Analyze only the IMAGES.
   - Look for edits, manipulations, synthesis, inconsistencies, deepfake-like artifacts, unnatural lighting, mismatched shadows, etc.
   - image_score must be between 0 and 1.
   - Higher score means more anomalous.
4. If NO images are provided:
   - image_score must be null.

5. If videos are provided:
   - Analyze only the VIDEOS.
   - Detect deepfake indicators, temporal inconsistencies, face/edge artifacts, lip-sync mismatches, abnormal frame blending.
   - video_score must be between 0 and 1.
5. If NO videos are provided:
   - video_score must be null.

IMPORTANT:
- DO NOT reuse, mix, copy, or mirror the same score between modalities.
- Each score must be independently reasoned.
- If you lack data for a modality, return null for that modality.
- Do NOT generate explanations. Only return JSON.`,
    },
  ];

  // TEXT
  const hasText = text?.trim() !== "";
  if (hasText) {
    parts.push({
      text: `Complaint text:\n${text.trim()}`,
    });
  }

  // IMAGES
  const hasImages = Array.isArray(images) && images.length > 0;
  if (hasImages) {
    images.forEach((img) => {
      if (!img?.base64) return;
      parts.push({
        inline_data: {
          mime_type: img.mime || "image/*",
          data: img.base64,
        },
      });
    });
  }

  // VIDEOS
  const hasVideos = Array.isArray(videos) && videos.length > 0;
  if (hasVideos) {
    videos.forEach((vid) => {
      if (!vid?.base64) return;
      parts.push({
        inline_data: {
          mime_type: vid.mime || "video/*",
          data: vid.base64,
        },
      });
    });
  }

  return parts;
};

app.get('/', async(req, res) => {
  return res.status(200).json({
    message: "server is on bro",
  });
})

app.post("/analyze", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY in server/.env",
    });
  }

  const { text = "", images = [], videos = [] } = req.body || {};

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: buildGeminiParts({ text, images, videos }),
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Gemini request failed: ${errorText || "Unknown error"}`,
      });
    }

    const json = await response.json();
    const modelText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!modelText) {
      return res
        .status(500)
        .json({ error: "Gemini response did not include text output." });
    }

    const cleanedText = modelText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonPayload = jsonMatch ? jsonMatch[0] : cleanedText;

    let scores;
    try {
      scores = JSON.parse(jsonPayload);
    } catch (parseError) {
      return res.status(500).json({
        error: "Unable to parse Gemini response as JSON.",
        raw: modelText,
      });
    }

    return res.json(scores);
  } catch (error) {
    console.error("Gemini proxy error:", error);
    return res.status(500).json({
      error: "Unexpected error contacting Gemini.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini proxy listening on port ${PORT}`);
});

