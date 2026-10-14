import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, ErrorScreen } from './App';
import './index.css';
import { setupAudioUnlock } from './lib/sound';
import { useApp } from './store/useApp';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('[Compagnon]', error);
  }
  render() {
    return this.state.failed ? <ErrorScreen /> : this.props.children;
  }
}

useApp.getState().init();
setupAudioUnlock();

// Service worker (PWA) : désactivé dans la version « fichier unique » de démonstration.
if (import.meta.env.PROD && import.meta.env.VITE_NO_PWA !== '1' && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => undefined);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
