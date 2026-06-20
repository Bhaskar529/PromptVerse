import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={SITE_NAME}>
      {/* Square icon mark */}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.6rem',
          background: 'linear-gradient(145deg, #1e1b3a 0%, #0d0d1f 100%)',
          border: '1px solid rgba(183,156,255,0.22)',
          boxShadow: '0 4px 16px rgba(138,99,255,0.18)',
          flexShrink: 0,
          transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
        }}
        className="group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
          {/* Sparkle / star mark */}
          <path
            d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z"
            stroke="url(#logoGrad)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="18" cy="5" r="1.2" fill="rgba(183,156,255,0.7)" />
          <defs>
            <linearGradient id="logoGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e879a8" />
              <stop offset="55%" stopColor="#b79cff" />
              <stop offset="100%" stopColor="#6b8eff" />
            </linearGradient>
          </defs>
        </svg>
      </span>

      {!compact && (
        <span className="flex flex-col leading-none gap-0.5">
          {/* "PromptVerse" — pink → purple → blue gradient matching reference */}
          <span
            style={{
              fontFamily: 'var(--font-display, "Zodiak", serif)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1,
              background: 'linear-gradient(90deg, #e879a8 0%, #b79cff 45%, #6b8eff 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            PromptVerse
          </span>
          {/* "PROMPT LIBRARY" subtitle */}
          <span
            style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(189,189,215,0.7)',
              lineHeight: 1,
            }}
          >
            Prompt Library
          </span>
        </span>
      )}
    </Link>
  );
}
