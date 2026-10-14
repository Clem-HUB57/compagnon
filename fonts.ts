// Police OpenDyslexic (licence SIL OFL), chargée seulement si le parent la choisit.
import dys400 from '@fontsource/opendyslexic/files/opendyslexic-latin-400-normal.woff2?url';
import dys700 from '@fontsource/opendyslexic/files/opendyslexic-latin-700-normal.woff2?url';

let loaded = false;

export function loadDysFont() {
  if (loaded || typeof FontFace === 'undefined' || !document.fonts) return;
  loaded = true;
  for (const [src, weight] of [[dys400, '400'], [dys700, '700']] as const) {
    const face = new FontFace('OpenDyslexic', `url(${src}) format('woff2')`, { weight, display: 'swap' });
    face.load().then((f) => document.fonts.add(f)).catch(() => undefined);
  }
}
