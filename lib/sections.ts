export type PromptType = 'image' | 'video' | 'audio' | 'chat';
export type SectionSlug = 'image-prompts' | 'video-prompts' | 'audio-prompts' | 'chat-prompts';

export type SectionConfig = {
  slug: SectionSlug;
  type: PromptType;
  singular: string;
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
  glow: string;
  badge: string;
};

export const SECTIONS: SectionConfig[] = [
  {
    slug: 'image-prompts',
    type: 'image',
    singular: 'Image Prompt',
    title: 'Image Prompts',
    eyebrow: 'Visual generation',
    description: 'Cinematic, stylized, editorial, and technical prompts for still-image models.',
    accent: '#B79CFF',
    glow: 'from-[#8A63FF]/40 via-[#B79CFF]/20 to-transparent',
    badge: 'Creative Studio',
  },
  {
    slug: 'video-prompts',
    type: 'video',
    singular: 'Video Prompt',
    title: 'Video Prompts',
    eyebrow: 'Motion storytelling',
    description: 'Concept-to-shot prompts for ads, reels, cinematic scenes, and generative video.',
    accent: '#7AA2FF',
    glow: 'from-[#4B73FF]/40 via-[#7AA2FF]/20 to-transparent',
    badge: 'Motion & Storytelling',
  },
  {
    slug: 'audio-prompts',
    type: 'audio',
    singular: 'Audio Prompt',
    title: 'Audio Prompts',
    eyebrow: 'Music and voice',
    description: 'Prompt frameworks for music, SFX, voice design, narration, and sonic branding.',
    accent: '#F08CFF',
    glow: 'from-[#D964FF]/40 via-[#F08CFF]/20 to-transparent',
    badge: 'Sound & Music',
  },
  {
    slug: 'chat-prompts',
    type: 'chat',
    singular: 'Chat Prompt',
    title: 'Chat Prompts',
    eyebrow: 'Reasoning workflows',
    description: 'Structured prompts for coding, strategy, analysis, ideation, and productivity.',
    accent: '#8F8BFF',
    glow: 'from-[#6A67FF]/40 via-[#8F8BFF]/20 to-transparent',
    badge: 'Reasoning & Intelligence',
  },
];

export function getSectionBySlug(slug: string) {
  return SECTIONS.find((section) => section.slug === slug);
}

export function getSectionByType(type: PromptType) {
  return SECTIONS.find((section) => section.type === type)!;
}

export function titleCaseSlug(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
