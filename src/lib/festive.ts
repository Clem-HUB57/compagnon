// Cadre festif de la photo de fierté : bordure colorée, confettis, étoiles,
// le compagnon dans un coin et le nom de la quête. Tout est dessiné sur l'appareil.
import { loadImage } from './photos';

const CONFETTI = ['#E9774F', '#F6A98A', '#6F8FD6', '#A9D18B', '#F2C75C', '#8CCBC4', '#C6B4EE'];

/** Petit générateur pseudo-aléatoire reproductible. */
function seeded(seed: number) {
  let x = seed % 2147483647 || 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Coupe le texte pour qu'il tienne dans la largeur donnée. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

/** Convertit le SVG du compagnon affiché à l'écran en image. */
export function svgToDataUrl(svg: SVGSVGElement | null | undefined): string | null {
  if (!svg) return null;
  const xml = new XMLSerializer().serializeToString(svg);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
}

export async function makeFestive(raw: string, opts: { title: string; date: Date; companionSvg?: string | null; seed?: number }): Promise<string> {
  const photo = await loadImage(raw);
  const pad = Math.round(Math.max(photo.width, photo.height) * 0.06);
  const band = Math.round(Math.max(photo.width, photo.height) * 0.17);
  const W = photo.width + pad * 2;
  const H = photo.height + pad * 2 + band;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return raw;
  const rand = seeded(opts.seed ?? Date.now());

  // Fond et photo
  ctx.fillStyle = '#FFFBF5';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#DDF0EE';
  roundRect(ctx, pad * 0.35, pad * 0.35, W - pad * 0.7, H - pad * 0.7, pad * 0.8);
  ctx.fill();
  ctx.save();
  roundRect(ctx, pad, pad, photo.width, photo.height, pad * 0.5);
  ctx.clip();
  ctx.drawImage(photo, pad, pad);
  ctx.restore();

  // Confettis sur la bordure
  const unit = pad / 6;
  for (let i = 0; i < 70; i++) {
    const edge = rand();
    let x: number;
    let y: number;
    if (edge < 0.25) {
      x = rand() * W;
      y = rand() * pad;
    } else if (edge < 0.5) {
      x = rand() * pad;
      y = rand() * (H - band);
    } else if (edge < 0.75) {
      x = W - rand() * pad;
      y = rand() * (H - band);
    } else {
      x = rand() * W;
      y = H - band + rand() * band * 0.25;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI);
    ctx.fillStyle = CONFETTI[Math.floor(rand() * CONFETTI.length)];
    if (rand() < 0.5) ctx.fillRect(-unit, -unit * 0.4, unit * 2, unit * 0.8);
    else {
      ctx.beginPath();
      ctx.arc(0, 0, unit * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  // Quelques étoiles qui débordent sur la photo
  star(ctx, pad * 1.4, pad * 1.4, pad * 0.75, '#F2C75C');
  star(ctx, W - pad * 1.2, pad * 2.4, pad * 0.5, '#E9774F');
  star(ctx, pad * 2.6, pad * 0.9, pad * 0.35, '#6F8FD6');

  // Bandeau : titre et date
  const comp = band * 1.25;
  const textX = pad * 1.1;
  const textMax = W - textX - comp - pad;
  ctx.fillStyle = '#1E4447';
  ctx.font = `600 ${Math.round(band * 0.3)}px "Lexend Variable", "Lexend", system-ui, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(fit(ctx, 'Bravo, c’est fait !', textMax), textX, H - band * 0.52);
  ctx.fillStyle = '#3A4250';
  ctx.font = `400 ${Math.round(band * 0.19)}px "Lexend Variable", "Lexend", system-ui, sans-serif`;
  const date = opts.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  ctx.fillText(fit(ctx, `${opts.title} · ${date}`, textMax), textX, H - band * 0.2);

  // Le compagnon, en bas à droite, qui déborde sur la photo
  if (opts.companionSvg) {
    try {
      const c = await loadImage(opts.companionSvg);
      ctx.drawImage(c, W - comp - pad * 0.4, H - comp - pad * 0.3, comp, comp);
    } catch {
      /* sans compagnon, tant pis */
    }
  }
  return canvas.toDataURL('image/jpeg', 0.82);
}
