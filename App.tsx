import { useEffect } from 'react';
import { MyCompanion } from './components/shared';
import { useReducedMotion } from './lib/hooks';
import { setVoiceSettings } from './lib/voice';
import { loadDysFont } from './lib/fonts';
import { Adventures } from './screens/Adventures';
import { Cabane } from './screens/Cabane';
import { Calm } from './screens/Calm';
import { Home } from './screens/Home';
import { Mission } from './screens/Mission';
import { MissionEnd } from './screens/MissionEnd';
import { Onboarding } from './screens/Onboarding';
import { Parent } from './screens/parent/Parent';
import { useApp, type Route } from './store/useApp';

export function App() {
  const ready = useApp((s) => s.ready);
  const route = useApp((s) => s.route);
  const profile = useApp((s) => s.data.profile);
  const storageOk = useApp((s) => s.storageOk);
  const textSize = useApp((s) => s.data.preferences.displayPreferences.textSize);
  const font = useApp((s) => s.data.preferences.font);
  const voiceName = useApp((s) => s.data.preferences.voiceName);
  const voiceRate = useApp((s) => s.data.preferences.voiceRate);
  const reduced = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle('texte-grand', textSize === 'grand');
    if (font === 'dys') loadDysFont();
    document.documentElement.classList.toggle('police-dys', font === 'dys');
    document.documentElement.classList.toggle('reduire-animations', reduced);
  }, [textSize, font, reduced]);

  useEffect(() => setVoiceSettings({ name: voiceName, rate: voiceRate }), [voiceName, voiceRate]);

  // Bouton « retour » du téléphone : on revient à l'écran précédent de l'app.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const r = (e.state?.route as Route | undefined) ?? { name: 'accueil' };
      useApp.setState({ route: r.name === 'fin' ? { name: 'accueil' } : r });
    };
    window.addEventListener('popstate', onPop);
    try {
      window.history.replaceState({ route: useApp.getState().route }, '');
    } catch {
      /* ignoré */
    }
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" aria-busy="true">
        <p className="text-encre-500">Chargement de ton île…</p>
      </div>
    );
  }

  let screen;
  if (!profile && route.name !== 'parent') screen = <Onboarding />;
  else
    switch (route.name) {
      case 'onboarding':
        screen = <Onboarding />;
        break;
      case 'aventures':
        screen = <Adventures />;
        break;
      case 'mission':
        screen = <Mission key={route.sessionId} sessionId={route.sessionId} />;
        break;
      case 'fin':
        screen = <MissionEnd key={route.sessionId} sessionId={route.sessionId} />;
        break;
      case 'cabane':
        screen = <Cabane initialTab={route.tab} />;
        break;
      case 'parent':
        screen = <Parent />;
        break;
      case 'calme':
        screen = <Calm returnTo={route.returnTo} />;
        break;
      default:
        screen = <Home />;
    }

  return (
    <>
      {!storageOk && (
        <div className="bg-corail-100 px-4 py-2 text-center text-sm text-corail-700" role="alert">
          La sauvegarde n’est pas disponible sur ce navigateur (navigation privée ?). Ta progression ne sera pas gardée.
        </div>
      )}
      {screen}
    </>
  );
}

export function ErrorScreen() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center p-6 text-center">
      <MyCompanion expression="reflechit" />
      <p className="mt-4 text-lg">Oups, quelque chose n’a pas marché.</p>
      <button type="button" className="mt-4 rounded-2xl bg-lagon-700 px-5 py-3 font-semibold text-white" onClick={() => window.location.reload()}>
        Recharger
      </button>
    </div>
  );
}
