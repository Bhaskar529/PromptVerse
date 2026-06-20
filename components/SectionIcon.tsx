import { BrainCircuit, Camera, Film, Headphones, MessageCircle, PlayCircle, Sparkles, AudioLines } from 'lucide-react';

type Props = {
  slug: string;
  size?: number;
  className?: string;
};

export function SectionIcon({ slug, size = 24, className = '' }: Props) {
  const map = {
    'image-prompts': { Primary: Camera,       Secondary: Sparkles,       theme: 'image' },
    'video-prompts': { Primary: Film,          Secondary: PlayCircle,     theme: 'video' },
    'audio-prompts': { Primary: Headphones,    Secondary: AudioLines,     theme: 'audio' },
    'chat-prompts':  { Primary: BrainCircuit,  Secondary: MessageCircle,  theme: 'chat'  },
  } as const;

  const entry = (map as Record<string, typeof map[keyof typeof map]>)[slug] ?? map['image-prompts'];
  const Primary   = entry.Primary;
  const Secondary = entry.Secondary;

  return (
    <span
      className={['section-icon', `section-icon--${entry.theme}`, className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <Primary size={size} strokeWidth={1.75} />
      <span className="section-icon__echo">
        <Secondary size={Math.max(12, Math.round(size * 0.55))} strokeWidth={1.9} />
      </span>
    </span>
  );
}
