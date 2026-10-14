// Rappel quotidien sans serveur : on crée un fichier d'agenda (.ics) que le téléphone
// importe dans son calendrier, avec une alerte à l'heure choisie.

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function escapeText(t: string) {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Contenu iCalendar d'un rappel quotidien (ou en semaine seulement). */
export function buildReminderIcs(opts: { title: string; time: string; weekdaysOnly: boolean; now?: Date; uid: string }): string {
  const now = opts.now ?? new Date();
  const [h, m] = opts.time.split(':').map((x) => Number(x));
  const start = new Date(now);
  start.setHours(h || 0, m || 0, 0, 0);
  if (start < now) start.setDate(start.getDate() + 1);
  const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const end = new Date(start.getTime() + 10 * 60_000);
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const rule = opts.weekdaysOnly ? 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' : 'RRULE:FREQ=DAILY';
  const summary = escapeText(`Compagnon : ${opts.title}`);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Compagnon//Rappels//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.uid}@compagnon`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    `DTEND:${local(end)}`,
    rule,
    `SUMMARY:${summary}`,
    'DESCRIPTION:C’est le moment de ta petite quête. Ouvre Compagnon !',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
