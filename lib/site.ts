export const SITE_NAME = 'PromptVerse';
export const SITE_TAGLINE = "The World's Largest AI Prompt Library";
export const SITE_DESCRIPTION =
  'PromptVerse is a premium static AI prompt library for image, video, audio, and chat workflows, with category-first discovery and category-first prompt pages.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.promptverse.com';

export const PRIMARY_NAV = [
  { href: '/image-prompts', label: 'Image' },
  { href: '/video-prompts', label: 'Video' },
  { href: '/audio-prompts', label: 'Audio' },
  { href: '/chat-prompts', label: 'Chat' },
  
] as const;
