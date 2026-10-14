import { ChevronDown, Info, Lock, MessageCircleHeart, Smartphone, Sparkles as SparklesIcon, Wind, Wrench, CalendarDays, Gamepad2 } from 'lucide-react';
import type { ReactNode } from 'react';

function Part({ icon, title, children, open = false }: { icon: ReactNode; title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="carte group p-5" open={open}>
      <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-lagon-100 text-lagon-900">{icon}</span>
        <span className="flex-1">{title}</span>
        <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3 flex flex-col gap-2 text-sm text-encre-700 [&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-encre-900 [&_li]:mt-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc">{children}</div>
    </details>
  );
}

/** Mode d'emploi condensé de l'app, pour les parents. */
export function GuideTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-encre-700">Tout ce qu’il faut savoir, en quelques minutes. Touchez un titre pour l’ouvrir.</p>

      <Part icon={<Smartphone size={18} aria-hidden />} title="1. Installer l’app" open>
        <p>Installée sur l’écran d’accueil, l’app s’ouvre en plein écran, marche sans Internet et garde mieux ses données. Prévoyez un appareil par enfant.</p>
        <h3>iPhone et iPad (Safari)</h3>
        <ol>
          <li>Ouvrez l’adresse de l’app dans Safari.</li>
          <li>Touchez le bouton Partager (carré avec une flèche).</li>
          <li>Choisissez « Sur l’écran d’accueil ».</li>
        </ol>
        <h3>Android (Chrome)</h3>
        <ol>
          <li>Ouvrez l’adresse dans Chrome.</li>
          <li>Touchez le menu ⋮, puis « Installer l’application ».</li>
        </ol>
      </Part>

      <Part icon={<Wrench size={18} aria-hidden />} title="2. Préparer les routines">
        <ul>
          <li><strong>Démarrage express</strong> (onglet Routines) : cochez 1 à 3 moments difficiles, les routines arrivent prêtes.</li>
          <li><strong>Créer une routine</strong> : un nom, un moment, une étape par ligne. C’est tout.</li>
          <li><strong>Bibliothèque</strong> : des modèles pour le matin, le soir, l’école, la maison et les émotions.</li>
          <li>Une bonne étape commence par un verbe et se voit : « Mets ta trousse dans ton sac », pas « Sois organisé ». 4 à 7 étapes, c’est idéal.</li>
          <li><strong>Indispensable</strong> : cochez les étapes à garder les jours difficiles. L’enfant pourra choisir la version courte.</li>
          <li>Dans « Aides, voix, photo » : enregistrez <strong>votre voix</strong> pour une étape, ajoutez une <strong>photo modèle</strong> si « fini » n’est pas évident.</li>
          <li>Gardez peu de routines au début. Vous en ajouterez quand les premières seront installées.</li>
        </ul>
      </Part>

      <Part icon={<Gamepad2 size={18} aria-hidden />} title="3. Ce que fait l’enfant">
        <ul>
          <li>L’accueil propose <strong>une seule quête</strong>, celle du moment (matin, après l’école, soir).</li>
          <li>Une étape à l’écran. Il la fait en vrai, puis touche <strong>« C’est fait ! »</strong>. Les XP s’ajoutent en haut, l’étape suivante arrive toute seule.</li>
          <li><strong>« J’ai besoin d’aide »</strong> : une étape plus petite, comment commencer, ou une pause. Ça ne fait jamais rien perdre.</li>
          <li><strong>« Plus tard »</strong> : il garde une étape bloquante pour la fin.</li>
          <li>À la fin : le niveau monte, l’île grandit, il choisit ses cadeaux. Il peut prendre son exploit en <strong>photo</strong> pour son album.</li>
          <li>Après plusieurs réussites, l’app lui propose moins d’aide (mode condensé, puis autonome). C’est le vrai objectif.</li>
        </ul>
      </Part>

      <Part icon={<Wind size={18} aria-hidden />} title="4. Le coin calme">
        <ul>
          <li>Pour les émotions fortes : la météo intérieure (jamais enregistrée), puis un outil au choix (respirer avec son compagnon, bouger, presser un squishy, le jeu des 5 sens…).</li>
          <li><strong>Entraînez-vous quand tout va bien</strong> : en pleine crise, un enfant prend rarement une tablette.</li>
          <li>Préparez ensemble, au calme, son <strong>plan tempête</strong> : « Quand je sens la colère monter, alors je… ».</li>
          <li>Ne l’utilisez jamais comme une punition (« va respirer ! »). Proposez-le.</li>
        </ul>
      </Part>

      <Part icon={<MessageCircleHeart size={18} aria-hidden />} title="5. Votre rôle">
        <ul>
          <li>Félicitez l’effort et la stratégie : « Tu as trouvé comment commencer », plutôt que « t’es trop fort ».</li>
          <li>Rappelez le plan, pas la tâche : « C’est quoi ton plan quand tu as fini de goûter ? »</li>
          <li>Laissez l’enfant tenir l’appareil et valider lui-même. Ne contrôlez pas chaque étape.</li>
          <li>En fin de semaine, regardez l’île et l’album ensemble, sans bilan chiffré.</li>
          <li>Jamais de menace ni de punition liée à l’app : elle doit rester un endroit agréable.</li>
        </ul>
      </Part>

      <Part icon={<Lock size={18} aria-hidden />} title="6. Verrouiller l’appareil sur Compagnon">
        <p>Pendant une routine, l’appareil ne sert qu’à ça : pas de jeux ni de vidéos à portée de doigt.</p>
        <h3>iPhone et iPad : l’Accès guidé</h3>
        <ol>
          <li>Réglages, Accessibilité, Accès guidé : activez-le et choisissez un code.</li>
          <li>Dans Compagnon, appuyez trois fois sur le bouton latéral, puis « Démarrer ».</li>
          <li>Pour sortir : trois appuis, puis le code.</li>
        </ol>
        <h3>Android : l’épinglage d’écran</h3>
        <ol>
          <li>Paramètres, Sécurité, Épinglage d’application : activez-le.</li>
          <li>Ouvrez Compagnon, affichez les applis récentes, touchez l’icône de l’app puis « Épingler ».</li>
        </ol>
      </Part>

      <Part icon={<CalendarDays size={18} aria-hidden />} title="7. Les premières semaines">
        <ol>
          <li><strong>Semaine 1</strong> : une ou deux routines. Accompagnez les premières quêtes, puis laissez faire.</li>
          <li><strong>Semaines 2 et 3</strong> : l’enthousiasme baisse souvent. Gardez le même déclencheur chaque jour ; regardez l’île ensemble.</li>
          <li><strong>Après 3 à 4 semaines</strong> : faites le point avec l’enfant (qu’est-ce qui aide ? qu’est-ce qui agace ?) et ajustez.</li>
        </ol>
        <p>Si l’app crée plus de tensions qu’elle n’en enlève, mettez-la de côté : c’est une information précieuse.</p>
      </Part>

      <Part icon={<SparklesIcon size={18} aria-hidden />} title="8. Astuces">
        <ul>
          <li>Voix plus naturelle : Réglages, Voix. Ou enregistrez la vôtre, étape par étape.</li>
          <li>Rappel à heure fixe : dans une routine, « Plus d’options », puis « Rappel dans l’agenda du téléphone ».</li>
          <li>Lecture difficile : Réglages, texte plus grand ou police adaptée à la dyslexie.</li>
          <li>Sauvegardez une fois par mois (onglet Données), surtout sur iPhone.</li>
        </ul>
      </Part>

      <Part icon={<Info size={18} aria-hidden />} title="À propos">
        <ul>
          <li>Compagnon est un prototype gratuit, sans publicité ni achat. Ce n’est pas un dispositif médical.</li>
          <li>Il s’inspire de pratiques documentées (découpage des tâches, renforcement immédiat, plans « si… alors… », retrait progressif de l’aide), sans garantie d’efficacité.</li>
        </ul>
      </Part>
    </div>
  );
}
