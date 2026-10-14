import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { playSound } from '../lib/sound';
import { useApp } from '../store/useApp';

type Variant = 'principal' | 'secondaire' | 'doux' | 'fantome' | 'danger';

const VARIANTS: Record<Variant, string> = {
  principal: 'bg-lagon-700 text-white shadow-bouton hover:bg-lagon-900 active:translate-y-[3px] active:shadow-none',
  secondaire: 'bg-white text-lagon-900 border-2 border-lagon-300 hover:bg-lagon-100 active:translate-y-[2px]',
  doux: 'bg-sable-200 text-encre-900 hover:bg-sable-300 active:translate-y-[2px]',
  fantome: 'bg-transparent text-encre-700 hover:bg-sable-200',
  danger: 'bg-corail-700 text-white hover:bg-corail-500 active:translate-y-[2px]'
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'normal' | 'grand' | 'petit';
  icon?: ReactNode;
  silent?: boolean;
}

export function Button({ variant = 'principal', size = 'normal', icon, className = '', children, onClick, silent, ...rest }: ButtonProps) {
  const sound = useApp((s) => s.data.preferences.soundEnabled);
  const sizes = {
    grand: 'min-h-[64px] px-6 text-xl rounded-3xl',
    normal: 'min-h-[52px] px-5 text-base rounded-2xl',
    petit: 'min-h-[40px] px-3 text-sm rounded-xl'
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
      onClick={(e) => {
        if (!silent) playSound('tap', sound);
        onClick?.(e);
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function IconButton({ label, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-encre-700 transition hover:bg-sable-200 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Feuille modale accessible (fermeture avec Échap, focus déplacé dedans). */
export function Sheet({ open, onClose, title, children, labelClose = 'Fermer' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; labelClose?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-encre-900/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-lg animate-apparait overflow-y-auto rounded-t-4xl bg-sable-50 p-5 pb-8 shadow-carte sm:rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-encre-900">{title}</h2>
          <IconButton label={labelClose} onClick={onClose} className="-mr-2 -mt-2">
            <X aria-hidden />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function XpBar({ ratio, label, className = '' }: { ratio: number; label: string; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100);
  return (
    <div className={className}>
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-sable-300/70"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-mousse-500 to-lagon-500 transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Pill({ children, tone = 'sable' }: { children: ReactNode; tone?: 'sable' | 'lagon' | 'corail' | 'mousse' }) {
  const tones = {
    sable: 'bg-sable-200 text-encre-700',
    lagon: 'bg-lagon-100 text-lagon-900',
    corail: 'bg-corail-100 text-corail-700',
    mousse: 'bg-mousse-100 text-mousse-700'
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${tones[tone]}`}>{children}</span>;
}

export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-4 pb-8 pt-3 sm:px-6 ${className}`}>{children}</main>;
}
