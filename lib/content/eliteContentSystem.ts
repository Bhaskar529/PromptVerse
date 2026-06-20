export type MarketplaceTool =
  | 'midjourney'
  | 'flux'
  | 'stable-diffusion'
  | 'kling'
  | 'veo'
  | 'runway'
  | 'suno'
  | 'udio'
  | 'elevenlabs'
  | 'chatgpt'
  | 'claude'
  | 'gemini';

export const IMAGE_DISTRIBUTION_TARGETS = {
  'realistic-photography': 0.40,
  'commercial-advertising': 0.20,
  portraits: 0.10,
  travel: 0.10,
  'product-photography': 0.10,
  architecture: 0.05,
  nature: 0.03,
  fantasy: 0.01,
  anime: 0.01,
} as const;

export const REFERENCE_PLACEHOLDERS = [
  '[USER_PHOTO]',
  '[FACE_REFERENCE]',
  '[PRODUCT_REFERENCE]',
  '[STYLE_REFERENCE]',
  '[POSE_REFERENCE]',
  '[COMPOSITION_REFERENCE]',
  '[CHARACTER_REFERENCE]',
  '[BRAND_REFERENCE]',
] as const;

export const BANNED_REPEAT_PATTERNS = [
  /^act as/i,
  /^create\s+\[[^\]]+\]\s+in\s+\[[^\]]+\]/i,
  /^generate\s+\[[^\]]+\]\s+with\s+\[[^\]]+\]/i,
] as const;

export const INDUSTRY_COVERAGE = [
  'technology',
  'healthcare',
  'education',
  'finance',
  'travel',
  'luxury-brands',
  'restaurants',
  'fitness',
  'sports',
  'architecture',
  'automotive',
  'movies',
  'music',
  'photography',
  'fashion',
  'real-estate',
  'artificial-intelligence',
  'cloud-computing',
  'cybersecurity',
  'programming',
  'e-commerce',
  'podcasting',
  'youtube',
  'content-creation',
  'history',
  'science',
  'space',
  'nature',
  'wildlife',
  'psychology',
  'self-improvement',
  'legal',
  'human-resources',
  'startups',
  'marketing',
] as const;

export const CATEGORY_VOICES = {
  photography: 'Use the language of photographers, editors, and art buyers.',
  advertising: 'Use the language of creative directors, agencies, and campaigns.',
  film: 'Use the language of directors, cinematographers, and storyboard artists.',
  music: 'Use the language of composers, producers, and sound designers.',
  coding: 'Use the language of architects, staff engineers, and reviewers.',
  cybersecurity: 'Use the language of consultants, responders, and security teams.',
  business: 'Use the language of operators, advisors, and strategists.',
} as const;

export const TOOL_STRENGTHS: Record<MarketplaceTool, string> = {
  midjourney: 'Best for stylized composition, visual atmosphere, and editorial art direction.',
  flux: 'Best for realism, commercial image quality, and premium photographic detail.',
  'stable-diffusion': 'Best for open workflows, customization, and local generation pipelines.',
  kling: 'Best for cinematic motion, scene continuity, and narrative video shots.',
  veo: 'Best for high-end generative video sequencing and scene-driven motion.',
  runway: 'Best for creator workflows, concept videos, and fast visual iteration.',
  suno: 'Best for full music generation with mood, genre, tempo, and hooks.',
  udio: 'Best for music ideation with strong melodic identity and tonal direction.',
  elevenlabs: 'Best for voiceovers, character narration, and spoken brand audio.',
  chatgpt: 'Best for structured drafting, ideation, reasoning, and reusable workflows.',
  claude: 'Best for nuanced analysis, long-form synthesis, and careful reasoning.',
  gemini: 'Best for broad multimodal reasoning and structured exploration.',
};
