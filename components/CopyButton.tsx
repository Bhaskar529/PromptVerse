'use client';

import { useState, useRef, useCallback } from 'react';
import { ClipboardCopy, CheckCircle2 } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label?: string;
  variant?: 'default' | 'example';
}

export function CopyButton({ value, label = 'Copy', variant = 'default' }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'success'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ripple, setRipple] = useState(false);

  const handleCopy = useCallback(async () => {
    if (state === 'success') return;
    try {
      await navigator.clipboard.writeText(value ?? '');
    } catch {
      // Fallback for environments without clipboard API
      try {
        const ta = document.createElement('textarea');
        ta.value = value ?? '';
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch { /* Silent fail */ }
    }
    setState('success');
    setRipple(true);
    window.setTimeout(() => setRipple(false), 600);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState('idle'), 2400);
  }, [state, value]);

  const isSuccess = state === 'success';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${isSuccess ? 'Copied' : label} to clipboard`}
      className={[
        'copy-button',
        variant === 'example' ? 'copy-button--example' : '',
        'relative overflow-hidden',
        isSuccess ? 'copy-button--success' : '',
      ].filter(Boolean).join(' ')}
    >
      {ripple && <span className="copy-button__ripple" aria-hidden="true" />}
      <span className="flex items-center gap-1.5 relative z-10" style={{ transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}>
        {isSuccess
          ? <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden="true" />
          : <ClipboardCopy size={15} strokeWidth={2} aria-hidden="true" />
        }
        <span>{isSuccess ? 'Copied' : label}</span>
      </span>
    </button>
  );
}
