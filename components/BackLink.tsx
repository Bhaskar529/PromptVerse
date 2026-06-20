import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href = '/', label = 'Back to home', className = '' }: { href?: string; label?: string; className?: string }) {
  return (
    <Link href={href} className={`back-link ${className}`.trim()}>
      <ArrowLeft size={16} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
