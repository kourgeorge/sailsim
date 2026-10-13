// Spring lines, seen from above: a yacht lying starboard side to a dock, motoring
// gently against one spring so it pivots. Geometry never mirrors in RTL.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  title: ['Motoring against a spring line', 'Avante o atrás contra un esprín', 'Moteur contre une garde', 'Работа двигателем на шпринг', 'מנוע נגד חבל ספרינג', 'المحرك ضد حبل النابض'],
  dock: ['Dock', 'Muelle', 'Quai', 'Причал', 'רציף', 'الرصيف'],
  bowSpring: ['Ahead against the bow spring', 'Avante contra el esprín de proa', 'En avant contre la garde avant', 'Вперёд на носовой шпринг', 'קדימה נגד ספרינג חרטום', 'إلى الأمام ضد نابض المقدمة'],
  bowResult: ['The bow is held in; the stern swings out', 'La proa queda pegada; la popa se abre', 'L’avant reste plaqué ; l’arrière s’écarte', 'Нос прижат, корма отходит', 'החרטום נצמד; הירכתיים מתרחקות', 'تبقى المقدمة ملاصقة وتبتعد المؤخرة'],
  sternSpring: ['Astern against the stern spring', 'Atrás contra el esprín de popa', 'En arrière contre la garde arrière', 'Назад на кормовой шпринг', 'אחורה נגד ספרינג ירכתיים', 'إلى الخلف ضد نابض المؤخرة'],
  sternResult: ['The stern is held in; the bow swings out', 'La popa queda pegada; la proa se abre', 'L’arrière reste plaqué ; l’avant s’écarte', 'Корма прижата, нос отходит', 'הירכתיים נצמדות; החרטום מתרחק', 'تبقى المؤخرة ملاصقة وتبتعد المقدمة'],
  fender: ['Fender', 'Defensa', 'Pare-battage', 'Кранец', 'מגן', 'مصد'],
  thrust: ['Engine', 'Motor', 'Moteur', 'Двигатель', 'מנוע', 'المحرك'],
  caption: [
    'Starboard side to the dock, bow to the right. A spring runs diagonally and stops the boat moving along the dock. Motoring gently against it pivots the boat: use the bow spring and a fender at the bow to swing the stern out and leave a dock the wind pushes you onto.',
    'Costado de estribor al muelle, proa a la derecha. Un esprín va en diagonal e impide que el barco se desplace a lo largo del muelle. Dar máquina suave contra él hace pivotar el barco: con el esprín de proa y una defensa a proa, la popa se abre para salir de un muelle al que te empuja el viento.',
    'Tribord à quai, étrave à droite. Une garde part en diagonale et empêche le bateau de glisser le long du quai. Donner doucement du moteur contre elle fait pivoter le bateau : avec la garde avant et un pare-battage à l’avant, l’arrière s’écarte pour quitter un quai sur lequel le vent vous plaque.',
    'Правым бортом к причалу, нос справа. Шпринг идёт по диагонали и не даёт судну двигаться вдоль причала. Мягкая работа двигателем на шпринг разворачивает судно: на носовом шпринге с кранцем у носа корма отходит, и можно уйти от причала, к которому прижимает ветер.',
    'צד ימין לרציף, החרטום מימין. ספרינג נמתח באלכסון ומונע מהכלי לנוע לאורך הרציף. הפעלה עדינה של המנוע נגדו מסובבת את הכלי: עם ספרינג חרטום ומגן בחרטום הירכתיים מתרחקות, וכך יוצאים מרציף שהרוח דוחפת אליו.',
    'الجانب الأيمن إلى الرصيف والمقدمة إلى اليمين. يمتد النابض قطريًا ويمنع القارب من الحركة على طول الرصيف. تشغيل المحرك بلطف ضده يدير القارب: مع نابض المقدمة ومصد عند المقدمة تبتعد المؤخرة، فتغادر رصيفًا تدفعك الرياح نحوه.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#16232a', LINE = '#b5651d', SWING = '#c8352b';
let serial = 0;

export const isSpringLinesFigure = figure => figure === 'spring-lines';
export const springLinesCaption = (lang = 'en') => words.caption[localeIndex(lang)];

// One panel: hull alongside the dock along its bottom edge, bow to the right.
function panel(x0, kind, t, text) {
  const bow = kind === 'bow', dockY = 330, y = 292, left = x0 + 60, right = x0 + 290, mid = (left + right) / 2;
  let out = `<rect x="${x0 + 10}" y="70" width="340" height="300" rx="12" fill="#cfe3ea"/><rect x="${x0 + 10}" y="${dockY}" width="340" height="40" fill="#b9b0a0"/>`;
  out += text(x0 + 180, dockY + 26, t('dock'), {size: 12, fill: '#4f4536'});
  // Where the boat will swing to, ghosted.
  const angle = bow ? 14 : -14, pivotX = bow ? right - 24 : left + 24;
  out += `<g transform="rotate(${angle} ${pivotX} ${y + 14})" opacity=".28"><path d="M${left} ${y}H${right - 30}Q${right + 6} ${y + 14} ${right - 30} ${y + 28}H${left}Z" fill="#fff" stroke="${INK}"/></g>`;
  out += `<path data-hull="${kind}" d="M${left} ${y}H${right - 30}Q${right + 6} ${y + 14} ${right - 30} ${y + 28}H${left}Z" fill="#f4f1ea" stroke="${INK}" stroke-width="1.5"/>`;
  // The spring: bow cleat led aft, or stern cleat led forward, to a dock bollard.
  const cleatX = bow ? right - 34 : left + 6, bollardX = bow ? mid - 20 : mid + 20;
  out += `<path data-spring="${kind}" d="M${cleatX} ${y + 26}L${bollardX} ${dockY + 6}" stroke="${LINE}" stroke-width="3"/><circle cx="${bollardX}" cy="${dockY + 8}" r="5" fill="${INK}"/>`;
  if (bow) out += `<ellipse cx="${right - 22}" cy="${y + 30}" rx="9" ry="5" fill="#2f6f9a"/>` + text(right + 18, y + 54, t('fender'), {size: 11, fill: '#2f6f9a'});
  // Engine thrust and the resulting swing.
  const dir = bow ? 1 : -1;
  out += `<path d="M${left + 70} ${y + 14}h${dir * 60}" stroke="#2f5560" stroke-width="3"/><path d="M${left + 70 + dir * 60} ${y + 8}l${dir * 10} 6l${-dir * 10} 6Z" fill="#2f5560"/>`;
  out += text(left + 100, y - 8, t('thrust'), {size: 11, fill: '#2f5560'});
  const swingX = bow ? left + 10 : right - 30;
  out += `<path data-swing="${kind}" d="M${swingX} ${y - 14}V${y - 64}" stroke="${SWING}" stroke-width="3"/><path d="M${swingX - 7} ${y - 56}L${swingX} ${y - 70}L${swingX + 7} ${y - 56}Z" fill="${SWING}"/>`;
  out += text(x0 + 180, 100, t(bow ? 'bowSpring' : 'sternSpring'), {size: 15, max: 34});
  out += text(x0 + 180, 128, t(bow ? 'bowResult' : 'sternResult'), {size: 13, weight: 500, fill: '#2f5560', max: 40});
  return out;
}

export function renderSpringLinesFigure(lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4;
  const t = key => words[key][index], id = `spring-lines-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = '#173a4d', weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const art = `<rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 38, t('title'), {size: 21, max: 60})}` + panel(rtl ? 390 : 20, 'bow', t, text) + panel(rtl ? 20 : 390, 'stern', t, text);
  return `<svg class="teaching-figure" data-figure="spring-lines" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(t('title'))}</title><desc id="${id}-desc">${escape(words.caption[index])}</desc>${art}</svg>`;
}
