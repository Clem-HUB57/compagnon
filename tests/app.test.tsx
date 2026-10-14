import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../src/App';
import { createInitialState, setProfile } from '../src/logic/engine';
import { resetStoreForTests, useApp } from '../src/store/useApp';

function withProfile() {
  resetStoreForTests(setProfile(createInitialState(), 'Léa', 'lyra', 'Lyra'));
}

/** Passe le petit rituel « C’est le moment ! » s'il est affiché. */
function skipIntro() {
  const intro = screen.queryByText('Touche l’écran pour commencer');
  if (intro) fireEvent.click(intro);
}

const click = (name: RegExp | string) => {
  skipIntro();
  fireEvent.click(screen.getByRole('button', { name }));
  skipIntro();
};

describe('Parcours enfant', () => {
  it('accueille un nouvel enfant et lui fait choisir un compagnon', () => {
    resetStoreForTests();
    render(<App />);
    click('Commencer');
    fireEvent.click(screen.getByRole('radio', { name: /Boulon/ }));
    click('Suivant');
    expect(screen.getByLabelText(/nom de ton compagnon/i)).toHaveValue('Boulon');
    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'Noé' } });
    click(/C’est parti/);
    expect(useApp.getState().data.profile?.companionId).toBe('boulon');
    expect(screen.getByText(/Coucou Noé/)).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: /Moments de ma journée/ })).toBeInTheDocument();
  });

  it('lance une routine, valide une étape et fait réagir le compagnon', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    skipIntro();
    expect(screen.getByRole('heading', { name: /Pose ton sac/ })).toBeInTheDocument();
    click(/C’est fait/);
    expect(screen.getByText('+10 XP')).toBeInTheDocument();
    expect(screen.getByText(/1 étape faite sur 6/)).toBeInTheDocument();
    expect(useApp.getState().data.progression.totalXp).toBe(10);
    click(/Étape suivante/);
    expect(screen.getByRole('heading', { name: /Regarde ce dont/ })).toBeInTheDocument();
  });

  it('propose les trois aides et la pause sans pénalité', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    click(/besoin d’aide/);
    click(/plus facile/);
    expect(screen.getByText(/Touche simplement ton sac/)).toBeInTheDocument();
    click(/petit pas/);
    expect(screen.getByText(/Tu as commencé/)).toBeInTheDocument();
    click(/besoin d’aide/);
    click(/comment commencer/);
    expect(screen.getByText(/Va chercher ton sac/)).toBeInTheDocument();
    click(/J’ai compris/);
    click(/besoin d’aide/);
    click(/besoin d’une pause/);
    expect(screen.getByRole('heading', { name: 'C’est la pause' })).toBeInTheDocument();
    const xpBefore = useApp.getState().data.progression.totalXp;
    click('Je reprends');
    expect(useApp.getState().data.progression.totalXp).toBe(xpBefore);
    expect(screen.getByRole('heading', { name: /Pose ton sac/ })).toBeInTheDocument();
  });

  it('termine une routine et affiche l’écran de fin', () => {
    vi.useFakeTimers();
    withProfile();
    render(<App />);
    click('Aventures');
    fireEvent.click(screen.getByRole('tab', { name: 'Maison' }));
    const card = screen.getByRole('heading', { name: 'Mettre mon linge au sale' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    click(/C’est fait/);
    click(/Étape suivante/);
    click(/C’est fait/);
    click(/Étape suivante/);
    click(/C’est fait/);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    vi.useRealTimers();
    expect(screen.getByText(/XP gagnés/)).toBeInTheDocument();
    expect(screen.getByText(/bouteille est arrivée/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuer l’aventure/ })).toBeInTheDocument();
  });
});

describe('Ma journée, plan et sablier', () => {
  it('affiche les trois moments et laisse l’enfant choisir son plan', () => {
    withProfile();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Soir/ }));
    expect(screen.getByRole('heading', { name: 'Préparer mon sac' })).toBeInTheDocument();
    click(/Changer mon plan/);
    fireEvent.click(screen.getByRole('radio', { name: /Quand j’ai mis mon pyjama/ }));
    expect(useApp.getState().data.routines.find((r) => r.id === 'preparer-sac')?.trigger).toBe('Quand j’ai mis mon pyjama');
    expect(screen.getByRole('group', { name: /Mon plan : Quand j’ai mis mon pyjama, alors : Préparer mon sac/ })).toBeInTheDocument();
    expect(screen.getByText(/Ton plan : Quand j’ai mis mon pyjama/)).toBeInTheDocument();
  });

  it('rappelle le plan au lancement de la quête, puis montre la première étape', () => {
    withProfile();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Soir/ }));
    fireEvent.click(screen.getByRole('button', { name: /C’est parti/ }));
    expect(screen.getByText('C’est le moment !')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Touche l’écran pour commencer'));
    expect(screen.getByRole('heading', { name: /Pose ton sac/ })).toBeInTheDocument();
  });

  it('propose de choisir un moment quand la quête n’a pas de plan', () => {
    resetStoreForTests(setProfile(createInitialState(), 'Léa', 'lyra', 'Lyra'));
    useApp.setState((st) => ({ data: { ...st.data, routines: st.data.routines.map((r) => ({ ...r, trigger: '' })) } }));
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Soir/ }));
    expect(screen.getByRole('button', { name: /Choisis ton moment/ })).toBeInTheDocument();
  });

  it('active le sablier facultatif pendant une mission', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    expect(screen.queryByRole('img', { name: /Sablier en cours/ })).not.toBeInTheDocument();
    click('Sablier');
    click('Avec sablier');
    click('2 min');
    click('C’est noté');
    expect(screen.getByRole('img', { name: /Sablier en cours/ })).toBeInTheDocument();
    expect(useApp.getState().data.preferences.displayPreferences.timerMinutes).toBe(2);
  });
});

describe('Coin calme', () => {
  it('propose la météo intérieure puis un outil, et récompense l’entraînement', () => {
    withProfile();
    render(<App />);
    click('Mon coin calme');
    fireEvent.click(screen.getByRole('radio', { name: /Orage/ }));
    expect(screen.getByText(/Merci de me le dire/)).toBeInTheDocument();
    click(/Bouger pour vider/);
    for (let i = 0; i < 3; i++) click('C’est fait');
    click('J’ai fini');
    expect(screen.getByText('Tu as pris soin de toi.')).toBeInTheDocument();
    expect(screen.getByText('+15 XP d’entraînement')).toBeInTheDocument();
    expect(useApp.getState().data.calm.history[0].tool).toBe('bouger');
  });

  it('enregistre un plan tempête', () => {
    withProfile();
    render(<App />);
    click('Mon coin calme');
    click('Passer');
    click('Préparer mon plan tempête');
    click('… je sens la colère monter');
    click(/Presser un squishy/);
    click('Enregistrer mon plan');
    expect(useApp.getState().data.calm.plan).toEqual({ feeling: 'je sens la colère monter', tool: 'presser' });
    expect(screen.getByText(/Mon plan/)).toBeInTheDocument();
  });

  it('depuis une pause, mène au coin calme puis ramène à la quête', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    click(/besoin d’aide/);
    click(/besoin d’une pause/);
    click('Aller dans mon coin calme');
    click('Passer');
    click('Voir les autres outils');
    click('De l’eau');
    click('C’est fait');
    click('J’ai fini');
    click('Revenir à ma quête');
    expect(screen.getByRole('heading', { name: /Pose ton sac/ })).toBeInTheDocument();
  });
});

describe('Ajustements', () => {
  it('permet de remettre une étape à plus tard', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
    click('Plus tard');
    expect(screen.getByRole('heading', { name: /Regarde ce dont/ })).toBeInTheDocument();
  });

  it('propose une version courte pour les jours difficiles', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Version courte' }));
    skipIntro();
    expect(screen.getByText('Étape 1 sur 4')).toBeInTheDocument();
  });
});

describe('Espace parent', () => {
  function openParent() {
    withProfile();
    render(<App />);
    click(/Espace parent/);
    const q = screen.getByText(/Combien font/).textContent!;
    const [, a, b] = q.match(/(\d+) × (\d+)/)!;
    fireEvent.change(screen.getByLabelText(/Combien font/), { target: { value: String(Number(a) * Number(b)) } });
    click('Entrer');
  }

  it('refuse une mauvaise réponse à la confirmation parentale', () => {
    withProfile();
    render(<App />);
    click(/Espace parent/);
    fireEvent.change(screen.getByLabelText(/Combien font/), { target: { value: '1' } });
    click('Entrer');
    expect(screen.getByText(/pas la bonne réponse/)).toBeInTheDocument();
  });

  const tab = (name: string) => fireEvent.click(screen.getByRole('tab', { name }));

  it('accueille le parent la première fois, puis ouvre directement les routines', () => {
    openParent();
    expect(screen.getByText('Bienvenue dans Compagnon')).toBeInTheDocument();
    expect(screen.getByText('Vous accompagner, vous aussi')).toBeInTheDocument();
    expect(screen.getByText(/0 805 382 300/)).toBeInTheDocument();
    expect(useApp.getState().data.preferences.parentVisited).toBe(true);
    cleanup();
    render(<App />); // l'app est restée sur l'espace parent : la question revient
    const q = screen.getByText(/Combien font/).textContent!;
    const [, a, b] = q.match(/(\d+) × (\d+)/)!;
    fireEvent.change(screen.getByLabelText(/Combien font/), { target: { value: String(Number(a) * Number(b)) } });
    click('Entrer');
    expect(screen.getByRole('tab', { name: 'Routines' })).toHaveAttribute('aria-selected', 'true');
  });

  it('propose un mode d’emploi', () => {
    openParent();
    tab('Mode d’emploi');
    expect(screen.getByText('1. Installer l’app')).toBeInTheDocument();
    expect(screen.getByText('6. Verrouiller l’appareil sur Compagnon')).toBeInTheDocument();
  });

  it('prépare les routines en démarrage express', () => {
    openParent();
    click('Démarrage express');
    click('S’habiller le matin');
    click('Préparer le sac');
    click('Préparer mes 2 routines');
    expect(screen.getByText('C’est prêt !')).toBeInTheDocument();
    const routines = useApp.getState().data.routines;
    expect(routines.map((r) => r.templateId ?? r.id).sort()).toEqual(['modele-habiller', 'preparer-sac']);
  });

  it('crée une routine en saisissant une étape par ligne', () => {
    openParent();
    tab('Routines');
    click('Créer une routine');
    fireEvent.change(screen.getByLabelText('Nom de la routine'), { target: { value: 'Ranger ma chambre' } });
    fireEvent.change(screen.getByLabelText('Les étapes, une par ligne'), { target: { value: '- ramasse les vêtements\n- range les jouets\n\n3. fais ton lit' } });
    click('Créer la routine');
    const r = useApp.getState().data.routines.find((x) => x.title === 'Ranger ma chambre');
    expect(r?.isCustom).toBe(true);
    expect(r?.illustration).toBe('ranger');
    expect(r?.steps.map((x) => x.title)).toEqual(['Ramasse les vêtements', 'Range les jouets', 'Fais ton lit']);
    expect(screen.getByText(/est créée, avec 3 étapes/)).toBeInTheDocument();
  });

  it('modifie le titre d’une routine', () => {
    openParent();
    tab('Routines');
    fireEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    fireEvent.change(screen.getByLabelText('Nom de la routine'), { target: { value: 'Mon cartable' } });
    click('Enregistrer');
    expect(screen.getByText(/« Mon cartable » est enregistrée/)).toBeInTheDocument();
    expect(useApp.getState().data.routines.find((r) => r.id === 'preparer-sac')?.title).toBe('Mon cartable');
  });

  it('ajoute une routine depuis la bibliothèque', () => {
    openParent();
    tab('Routines');
    click('Bibliothèque');
    click('Ajouter « Me brosser les dents »');
    const r = useApp.getState().data.routines.find((x) => x.templateId === 'modele-dents-matin');
    expect(r?.moment).toBe('matin');
    expect(screen.getAllByText('Ajoutée').length).toBeGreaterThan(0);
  });

  it('ajoute l’étape « Montre à un adulte », colle une liste et marque une étape indispensable', () => {
    openParent();
    tab('Routines');
    fireEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    click('Coller une liste');
    fireEvent.change(screen.getByLabelText('Ajouter plusieurs étapes, une par ligne'), { target: { value: 'Vérifie ta gourde\nPrends ton goûter' } });
    click('Ajouter 2 étapes');
    click('Finir par « Montre à un adulte »');
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Indispensable' })[0]);
    click('Enregistrer');
    const r = useApp.getState().data.routines[0];
    const titles = [...r.steps].sort((x, y) => x.order - y.order).map((x) => x.title);
    expect(titles.slice(-3)).toEqual(['Vérifie ta gourde', 'Prends ton goûter', 'Montre à un adulte ce que tu as fait']);
    expect(r.steps[0].essential).toBe(true);
  });

  it('active la police adaptée à la dyslexie', () => {
    openParent();
    tab('Réglages');
    fireEvent.click(screen.getByLabelText(/Police adaptée à la dyslexie/));
    expect(useApp.getState().data.preferences.font).toBe('dys');
    expect(document.documentElement).toHaveClass('police-dys');
  });

  it('affiche les outils de données (export et suppression)', () => {
    openParent();
    fireEvent.click(screen.getByRole('tab', { name: 'Données' }));
    expect(screen.getByRole('button', { name: /Exporter en JSON/ })).toBeInTheDocument();
    click('Supprimer toutes les données');
    expect(screen.getByRole('button', { name: /Oui, tout supprimer/ })).toBeInTheDocument();
  });
});
