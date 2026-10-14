import { BookOpen, ChevronDown, ExternalLink, Heart, ShieldCheck, Sparkles as SparklesIcon } from 'lucide-react';
import { MyCompanion } from '../../components/shared';
import { Button } from '../../components/ui';
import { SUPPORT_CHECKED_ON, SUPPORT_SECTIONS, weeklyTip } from '../../data/support';

/** Page d'accueil de l'espace parent : le projet, par où commencer, et l'accompagnement des parents. */
export function WelcomeTab({ onExpress, onGuide }: { onExpress: () => void; onGuide: () => void }) {
  const tip = weeklyTip();
  return (
    <div className="flex flex-col gap-4">
      <section className="carte overflow-hidden">
        <div className="flex items-center gap-4 bg-lagon-100 p-5">
          <MyCompanion size={84} expression="joie" />
          <div>
            <h2 className="text-xl font-semibold text-lagon-900">Bienvenue dans Compagnon</h2>
            <p className="text-sm text-encre-700">Un petit compagnon pour aider votre enfant à démarrer, finir et, peu à peu, se passer d’aide.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5 text-encre-700">
          <p>
            Avec un TDAH, savoir quoi faire ne suffit pas toujours : c’est <strong>démarrer</strong>, <strong>rester sur la tâche</strong> et <strong>ne pas oublier d’étape</strong> qui coûte. Compagnon découpe les routines du quotidien (le sac, les devoirs, les tâches de la maison) en petites quêtes, une étape à la fois, avec une récompense tout de suite.
          </p>
          <p>
            Il s’appuie sur ce que la recherche recommande : consignes courtes et visibles, renforcement immédiat, plans « Quand…, alors… », aide qui diminue avec le temps. Le but n’est pas que l’enfant joue plus, mais qu’il ait de moins en moins besoin de l’app.
          </p>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex gap-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-mousse-700" aria-hidden /> Ni série à tenir, ni points perdus, ni pub, ni achat. Rien n’est jamais perdu.
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-mousse-700" aria-hidden /> Tout reste sur cet appareil : pas de compte, rien n’est envoyé sur Internet.
            </li>
            <li className="flex gap-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-mousse-700" aria-hidden /> Ce n’est pas un dispositif médical : il ne diagnostique ni ne soigne rien.
            </li>
          </ul>
        </div>
      </section>

      <section className="carte p-5">
        <h2 className="font-semibold">Par où commencer ?</h2>
        <ol className="mt-3 flex flex-col gap-3">
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lagon-700 text-sm font-semibold text-white">1</span>
            <div className="flex-1">
              <p className="font-medium">Préparez 1 à 3 routines, en 2 minutes</p>
              <p className="text-sm text-encre-700">Cochez les moments difficiles : les routines arrivent toutes prêtes.</p>
              <Button size="petit" className="mt-2" icon={<SparklesIcon size={18} aria-hidden />} onClick={onExpress}>
                Démarrage express
              </Button>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lagon-700 text-sm font-semibold text-white">2</span>
            <div className="flex-1">
              <p className="font-medium">Faites la première quête avec votre enfant</p>
              <p className="text-sm text-encre-700">Laissez-le choisir son compagnon et son plan. Ensuite, laissez-le faire seul.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lagon-700 text-sm font-semibold text-white">3</span>
            <div className="flex-1">
              <p className="font-medium">Lisez le mode d’emploi (5 minutes)</p>
              <p className="text-sm text-encre-700">Installer l’app, verrouiller l’appareil, bien encourager.</p>
              <Button size="petit" variant="secondaire" className="mt-2" icon={<BookOpen size={18} aria-hidden />} onClick={onGuide}>
                Mode d’emploi
              </Button>
            </div>
          </li>
        </ol>
      </section>

      <section className="carte bg-corail-100 p-5">
        <p className="flex items-center gap-2 text-sm font-medium text-corail-700">
          <Heart size={16} aria-hidden /> Le conseil de la semaine
        </p>
        <p className="mt-2 text-lg font-semibold">{tip.tip}</p>
        {tip.say && <p className="mt-1 text-encre-700">À essayer : {tip.say}</p>}
      </section>

      <section className="carte p-5">
        <h2 className="font-semibold">Les jours sans</h2>
        <p className="mt-1 text-sm text-encre-700">
          Il y aura des jours où rien ne démarre. C’est normal, pour l’enfant comme pour vous. L’app ne perd rien et ne fait aucun reproche : reprenez simplement au moment habituel. Les petites routines gagnent sur la durée, pas en une semaine.
        </p>
      </section>

      <div className="mt-2">
        <h2 className="text-xl font-semibold">Vous accompagner, vous aussi</h2>
        <p className="mt-1 text-sm text-encre-700">
          Compagnon aide au quotidien, mais ne remplace ni un bilan, ni un suivi, ni le soutien dont vous avez besoin. Voici des pistes, en France, pour aller plus loin. Informations générales vérifiées le {SUPPORT_CHECKED_ON} : demandez toujours conseil à un professionnel.
        </p>
      </div>
      {SUPPORT_SECTIONS.map((sec) => (
        <details key={sec.id} className="carte group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
            {sec.title}
            <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-2 text-sm text-encre-700">{sec.intro}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {sec.items.map((it) => (
              <li key={it.title} className="rounded-2xl bg-sable-100 p-4">
                <p className="font-medium">{it.title}</p>
                <p className="mt-1 text-sm text-encre-700">{it.text}</p>
                {it.link && (
                  <a href={it.link.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-lagon-900 underline underline-offset-2">
                    {it.link.label} <ExternalLink size={14} aria-hidden />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
