import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../src/App';
import { createInitialState, setProfile } from '../src/logic/engine';
import { resetStoreForTests, useApp } from '../src/store/useApp';

function withProfile() {
  resetStoreForTests(setProfile(createInitialState(), 'Léa', 'lyra', 'Lyra'));
}

const click = (name: RegExp | string) => fireEvent.click(screen.getByRole('button', { name }));

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
    expect(screen.getByText(/Quête suggérée/)).toBeInTheDocument();
  });

  it('lance une routine, valide une étape et fait réagir le compagnon', () => {
    withProfile();
    render(<App />);
    click('Aventures');
    const card = screen.getByRole('heading', { name: 'Préparer mon sac' }).closest('li')!;
    fireEvent.click(within(card).getByRole('button', { name: 'Lancer' }));
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

  it('modifie le titre d’une routine', () => {
    openParent();
    fireEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);
    fireEvent.change(screen.getByLabelText('Titre de la routine'), { target: { value: 'Mon cartable' } });
    click('Enregistrer');
    expect(screen.getByText(/« Mon cartable » est enregistrée/)).toBeInTheDocument();
    expect(useApp.getState().data.routines.find((r) => r.id === 'preparer-sac')?.title).toBe('Mon cartable');
  });

  it('crée une routine personnalisée', () => {
    openParent();
    click('Créer une routine');
    fireEvent.change(screen.getByLabelText('Titre de la routine'), { target: { value: 'Brosser mes dents' } });
    fireEvent.change(screen.getByLabelText('Étape 1'), { target: { value: 'Prends ta brosse' } });
    click('Ajouter une étape');
    fireEvent.change(screen.getByLabelText('Étape 2'), { target: { value: 'Brosse 2 minutes' } });
    click('Enregistrer');
    const r = useApp.getState().data.routines.find((x) => x.title === 'Brosser mes dents');
    expect(r?.isCustom).toBe(true);
    expect(r?.steps).toHaveLength(2);
  });

  it('affiche les outils de données (export et suppression)', () => {
    openParent();
    fireEvent.click(screen.getByRole('tab', { name: 'Données' }));
    expect(screen.getByRole('button', { name: /Exporter en JSON/ })).toBeInTheDocument();
    click('Supprimer toutes les données');
    expect(screen.getByRole('button', { name: /Oui, tout supprimer/ })).toBeInTheDocument();
  });
});
