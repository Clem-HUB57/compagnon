import { ArrowRight, Clock } from 'lucide-react';
import { RoutineArt } from '../art/RoutineArt';
import type { Routine } from '../types';

/** Découpe le déclencheur : « Quand j’ai fini de goûter » → { label: 'Quand…', text: 'j’ai fini de goûter' }. */
export function splitTrigger(trigger: string): { label: string; text: string } {
  const t = trigger.trim();
  const m = t.match(/^quand\s+(.*)$/i);
  if (m) return { label: 'Quand…', text: m[1] };
  return { label: 'Mon moment', text: t.charAt(0).toLowerCase() + t.slice(1) };
}

/** Phrase du plan, pour la bulle du compagnon et la lecture à voix haute. */
export function planSentence(routine: Routine): string {
  const { label, text } = splitTrigger(routine.trigger);
  return label === 'Quand…' ? `Quand ${text}, alors : ${routine.title}.` : `${text.charAt(0).toUpperCase()}${text.slice(1)}, alors : ${routine.title}.`;
}

/**
 * Le plan « Quand…, alors… » en deux blocs reliés par une flèche.
 * Sans plan, il devient un bouton pour le choisir.
 */
export function PlanBridge({ routine, onEdit, big = false }: { routine: Routine; onEdit?: () => void; big?: boolean }) {
  if (!routine.trigger.trim()) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 rounded-3xl border-2 border-dashed border-corail-500 bg-corail-100 px-4 py-3 text-left transition hover:bg-corail-300/40"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-corail-500 text-white">
          <Clock aria-hidden />
        </span>
        <span>
          <span className="block text-xs font-bold uppercase tracking-wide text-corail-700">Quand ?</span>
          <span className="block text-lg font-semibold leading-snug text-encre-900">Choisis ton moment</span>
          <span className="block text-sm text-encre-700">Un moment précis, c’est plus facile pour démarrer.</span>
        </span>
      </button>
    );
  }
  const { label, text } = splitTrigger(routine.trigger);
  const When = onEdit ? 'button' : 'div';
  return (
    <div className={`flex items-stretch gap-1.5 rounded-3xl bg-corail-100 p-2 ${big ? 'text-lg' : ''}`} aria-label={`Mon plan : ${planSentence(routine)}`} role="group">
      <When
        {...(onEdit ? { type: 'button' as const, onClick: onEdit, 'aria-label': `Changer mon plan : ${label} ${text}` } : {})}
        className={`flex min-w-0 flex-1 flex-col justify-center rounded-2xl bg-white px-3 py-2 text-left ${onEdit ? 'transition hover:bg-sable-50' : ''}`}
      >
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-corail-700">
          <Clock size={14} aria-hidden /> {label}
        </span>
        <span className={`font-semibold leading-snug text-encre-900 ${big ? 'text-xl' : 'text-base'}`}>{text}</span>
      </When>
      <span className="flex shrink-0 items-center text-corail-700" aria-hidden>
        <ArrowRight size={big ? 28 : 22} strokeWidth={2.5} />
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-left">
        <RoutineArt illustration={routine.illustration} size={big ? 52 : 40} />
        <span className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-wide text-corail-700">Alors…</span>
          <span className={`block font-semibold leading-snug text-encre-900 ${big ? 'text-xl' : 'text-base'}`}>{routine.title}</span>
        </span>
      </div>
    </div>
  );
}
