// Optional vision check for photo-based stamp collection: when the uploaded
// photo has no usable EXIF location, ask Claude whether it actually shows the
// place's landmark. Enabled only when ANTHROPIC_API_KEY is configured — the
// app stays fully functional (EXIF path only) without it.
import Anthropic from '@anthropic-ai/sdk';

export const LANDMARK_CHECK_ENABLED = Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

export interface LandmarkVerdict {
  match: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    match: {
      type: 'boolean',
      description: 'True only if the photo clearly shows this specific place or an unmistakable famous feature of it.',
    },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reason: { type: 'string', description: 'One short sentence explaining the verdict.' },
  },
  required: ['match', 'confidence', 'reason'],
  additionalProperties: false,
} as const;

let client: Anthropic | null = null;

export async function verifyLandmarkPhoto(
  placeName: string,
  country: string,
  photoDataUrl: string,
): Promise<LandmarkVerdict> {
  const match = photoDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('invalid photo data URL');
  client ??= new Anthropic();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: VERDICT_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: match[1] as 'image/jpeg' | 'image/png' | 'image/webp',
              data: match[2],
            },
          },
          {
            type: 'text',
            text:
              `Does this photo clearly show "${placeName}" in ${country}, or an unmistakable famous ` +
              `feature of that specific place? A generic scene that could be anywhere does not count. ` +
              `Be strict: match=true only when the place is identifiable.`,
          },
        ],
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('no verdict returned');
  return JSON.parse(text.text) as LandmarkVerdict;
}
