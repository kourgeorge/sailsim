// An enlarged example of the live north-up dial. Bearings never mirror in RTL.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  title: ['Reading the app compass', 'Leer el compás de la app', 'Lire le compas de l’application', 'Как читать компас приложения', 'קריאת המצפן באפליקציה', 'قراءة بوصلة التطبيق'],
  source: ['Wind comes from', 'El viento viene de', 'Le vent vient de', 'Откуда дует ветер', 'הרוח מגיעה מכיוון', 'الرياح قادمة من'],
  heading: ['Boat heading', 'Rumbo de la proa', 'Cap du bateau', 'Направление носа', 'כיוון החרטום', 'اتجاه مقدمة القارب'],
  sector: ['No-go sector', 'Sector no navegable a vela', 'Secteur non navigable à la voile', 'Сектор, куда нельзя идти под парусами', 'גזרה ללא הנעה במפרשים', 'قطاع لا يمكن الإبحار فيه بالشراع'],
  around: ['Around the wind’s source', 'Alrededor del origen del viento', 'Autour de la provenance du vent', 'Вокруг направления на источник ветра', 'סביב הכיוון שממנו מגיעה הרוח', 'حول الاتجاه الذي تأتي منه الرياح'],
  north: ['North stays at the top', 'El norte permanece arriba', 'Le nord reste en haut', 'Север всегда сверху', 'הצפון נשאר למעלה', 'يبقى الشمال في الأعلى'],
  example: ['Example · wind over water', 'Ejemplo · viento respecto al agua', 'Exemple · vent relatif à l’eau', 'Пример · ветер относительно воды', 'דוגמה · רוח ביחס למים', 'مثال · الرياح بالنسبة إلى الماء'],
  caption: [
    'The white bow gives heading 045°. The gold arrow and shaded sector face the wind’s source at 315°. North stays at the top. This is a beam reach; airflow travels toward 135°, opposite the gold pointer.',
    'La proa blanca indica un rumbo de 045°. La flecha dorada y el sector sombreado señalan el origen del viento en 315°. El norte permanece arriba. El barco navega de través; el aire se mueve hacia 135°, en sentido opuesto a la flecha dorada.',
    'L’étrave blanche indique le cap 045°. La flèche dorée et le secteur ombré indiquent la provenance du vent, au 315°. Le nord reste en haut. Le bateau est au travers ; l’air se déplace vers le 135°, à l’opposé de la flèche dorée.',
    'Белый нос показывает курс 045°. Золотая стрелка и затенённый сектор направлены на источник ветра — 315°. Север всегда сверху. Яхта идёт галфвиндом; воздух движется к 135°, противоположно золотой стрелке.',
    'החרטום הלבן מצביע לכיוון 045°. החץ הזהוב והגזרה המוצללת פונים למקור הרוח ב־315°. הצפון נשאר למעלה. זו הפלגה ברוח צד; האוויר נע לכיוון 135°, הפוך מהחץ הזהוב.',
    'تشير المقدمة البيضاء إلى اتجاه 045°. يتجه السهم الذهبي والقطاع المظلل نحو مصدر الرياح عند 315°. يبقى الشمال في الأعلى. القارب يبحر والرياح من جانبه؛ يتحرك الهواء نحو 135°، عكس السهم الذهبي.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial = 0;

export const appCompassCaption = (lang = 'en') => words.caption[localeIndex(lang)];

export function renderAppCompassFigure(lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4;
  const id = `app-compass-${locale}-${++serial}`, cx = 210, cy = 218;
  const text = (x, y, value, {size = 19, fill = '#173a4d', max = 29, ltr = false, weight = 600} = {}) => {
    const lines = [];
    for (const word of value.split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl && !ltr ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.22 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const label = (x, y, key, options) => text(x, y, words[key][index], options);
  const badge = (x, y, n) => `<circle cx="${x}" cy="${y}" r="13" fill="#e9b87c" stroke="#173a4d" stroke-width="1.5"/>${text(x, y + 5, String(n), {size: 15, ltr: true})}`;
  const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#a6bdc3" stroke-width="1.5"/>`;
  let art = label(380, 30, 'title', {size: 23, max: 60});
  art += `<circle cx="${cx}" cy="${cy}" r="137" fill="#173946" stroke="#8ba1a8" stroke-width="2"/>`;
  for (let bearing = 0; bearing < 360; bearing += 15) {
    art += `<path d="M0 -133V-125" transform="translate(${cx} ${cy}) rotate(${bearing})" stroke="#849fa7" stroke-width="${bearing % 90 === 0 ? 2 : 1}"/>`;
  }
  art += `<g transform="translate(${cx} ${cy})"><path data-compass-part="no-go" d="M0 0L-59.1 -75.6A96 96 0 0 1 59.1 -75.6Z" transform="rotate(315)" fill="#de9f774d"/>
    <svg x="-125" y="-125" width="250" height="250" viewBox="0 0 100 100" transform="rotate(315)" data-compass-part="wind-from"><path d="M50 14v60M43 25l7-12 7 12" fill="none" stroke="#e9b87c" stroke-width="2"/></svg>
    <svg x="-17" y="-25.5" width="34" height="51" viewBox="0 0 40 60" transform="rotate(45)" data-compass-part="boat-heading"><path d="M20 3C8 17 8 42 11 53h18c3-11 3-36-9-50Z" fill="#edf5ed"/><path d="M20 12v33" stroke="#31505a" stroke-width="2"/></svg></g>`;
  for (const [bearing, cardinal] of [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]) {
    const angle = bearing * Math.PI / 180;
    art += text(cx + Math.sin(angle) * 113, cy - Math.cos(angle) * 113 + 6, cardinal, {fill: '#e3eeeb', size: 19, ltr: true});
  }
  for (const bearing of [45, 135, 225, 315]) {
    const angle = bearing * Math.PI / 180;
    art += text(cx + Math.sin(angle) * 114, cy - Math.cos(angle) * 114 + 4, `${bearing}°`, {fill: '#b3c9cf', size: 12, ltr: true});
  }
  art += line(115, 160, 150, 159) + badge(102, 160, 1);
  art += line(237, 209, 262, 209) + badge(275, 209, 2);
  art += line(88, 239, 145, 205) + badge(75, 239, 3);
  art += line(cx, 75, cx, 88) + badge(cx, 62, 4);
  art += text(cx, 383, '12.0 kn', {size: 23, ltr: true});
  art += badge(405, 94, 1) + label(560, 100, 'source') + text(560, 135, '315° · NW', {size: 24, fill: '#865200', ltr: true});
  art += badge(405, 175, 2) + label(560, 181, 'heading') + text(560, 216, '045° · NE', {size: 24, ltr: true});
  art += badge(405, 252, 3) + label(560, 258, 'sector', {size: 18, max: 30}) + label(560, 302, 'around', {size: 14, max: 38, weight: 500});
  art += badge(405, 348, 4) + label(560, 354, 'north', {size: 18});
  art += label(380, 418, 'example', {size: 14, max: 70, weight: 500});
  return `<svg class="teaching-figure" data-figure="app-compass" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(words.title[index])}</title><desc id="${id}-desc">${escape(appCompassCaption(locale))}</desc><rect width="760" height="430" rx="20" fill="#e1e9dd"/><g aria-hidden="true">${art}</g></svg>`;
}
