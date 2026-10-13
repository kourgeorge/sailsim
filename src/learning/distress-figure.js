// Distress signals card (COLREG Annex IV): what you may see, and what you may
// hear or receive. Simple icons with a label each; any one signal means distress.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  seenTitle: ['Distress signals you can see', 'Señales de socorro que se ven', 'Signaux de détresse visibles', 'Сигналы бедствия, которые видно', 'אותות מצוקה שרואים', 'إشارات استغاثة تُرى'],
  heardTitle: ['Distress signals you can hear or receive', 'Señales de socorro que se oyen o se reciben', 'Signaux de détresse entendus ou reçus', 'Сигналы бедствия, которые слышно или принимают', 'אותות מצוקה שומעים או קולטים', 'إشارات استغاثة تُسمع أو تُستقبل'],
  handFlare: ['Red hand flare', 'Bengala roja de mano', 'Feu à main rouge', 'Красный фальшфейер', 'זיקוק יד אדום', 'شعلة يدوية حمراء'],
  rocket: ['Red parachute rocket', 'Cohete rojo con paracaídas', 'Fusée parachute rouge', 'Красная парашютная ракета', 'זיקוק מצנח אדום', 'صاروخ مظلي أحمر'],
  smoke: ['Orange smoke', 'Humo naranja', 'Fumée orange', 'Оранжевый дым', 'עשן כתום', 'دخان برتقالي'],
  flames: ['Flames on the vessel', 'Llamas a bordo', 'Flammes à bord', 'Пламя на судне', 'להבות על הכלי', 'لهب على السفينة'],
  nc: ['Code flags N over C', 'Banderas N sobre C', 'Pavillons N sur C', 'Флаги N над C', 'דגלי קוד N מעל C', 'العلمان N فوق C'],
  flagBall: ['Square flag with a ball', 'Bandera cuadrada con una bola', 'Pavillon carré et une boule', 'Квадратный флаг и шар', 'דגל מרובע וכדור', 'علم مربع مع كرة'],
  arms: ['Arms raised and lowered, slowly and repeatedly', 'Brazos que suben y bajan, despacio y repetidamente', 'Bras levés et baissés lentement, à plusieurs reprises', 'Медленно и многократно поднимать и опускать руки', 'הרמה והורדה של הידיים, לאט ושוב ושוב', 'رفع الذراعين وخفضهما ببطء وبتكرار'],
  explosion: ['Explosion about once a minute', 'Explosión cada minuto aproximadamente', 'Explosion environ chaque minute', 'Взрыв примерно раз в минуту', 'פיצוץ בערך פעם בדקה', 'انفجار نحو مرة كل دقيقة'],
  horn: ['Continuous horn or fog signal', 'Bocina o señal de niebla continua', 'Corne ou signal de brume continu', 'Непрерывный звук горна или туманного сигнала', 'צופר או אות ערפל רצוף', 'بوق أو إشارة ضباب مستمرة'],
  sos: ['SOS: three short, three long, three short', 'SOS: tres cortas, tres largas, tres cortas', 'SOS : trois brèves, trois longues, trois brèves', 'SOS: три коротких, три длинных, три коротких', 'SOS: שלוש קצרות, שלוש ארוכות, שלוש קצרות', 'SOS: ثلاث قصيرة وثلاث طويلة وثلاث قصيرة'],
  mayday: ['MAYDAY by radio, VHF channel 16', 'MAYDAY por radio, canal 16 de VHF', 'MAYDAY à la radio, canal VHF 16', 'MAYDAY по радио, 16-й канал УКВ', 'MAYDAY בקשר, ערוץ VHF 16', 'MAYDAY باللاسلكي، قناة VHF 16'],
  dsc: ['DSC distress alert', 'Alerta de socorro LSD (DSC)', 'Alerte de détresse ASN (DSC)', 'Сигнал бедствия ЦИВ (DSC)', 'התראת מצוקה DSC', 'إنذار استغاثة DSC'],
  beacon: ['Emergency beacon (EPIRB or PLB)', 'Radiobaliza (EPIRB o PLB)', 'Balise de détresse (EPIRB ou PLB)', 'Аварийный радиобуй (EPIRB или PLB)', 'משדר חירום EPIRB או PLB', 'منارة طوارئ EPIRB أو PLB'],
  seenCaption: [
    'Any one of these signals means a vessel needs immediate help. A single code flag on its own is not a distress signal.',
    'Cualquiera de estas señales significa que un buque necesita ayuda inmediata. Una sola bandera del código no es una señal de socorro.',
    'Chacun de ces signaux signifie qu’un navire a besoin d’aide immédiate. Un seul pavillon du code n’est pas un signal de détresse.',
    'Любой из этих сигналов означает, что судну нужна немедленная помощь. Один флаг свода сигналов сам по себе не сигнал бедствия.',
    'כל אחד מהאותות האלה פירושו שכלי שיט זקוק לעזרה מיידית. דגל קוד יחיד לבדו אינו אות מצוקה.',
    'أي واحدة من هذه الإشارات تعني أن سفينة تحتاج إلى مساعدة فورية. علم واحد من المدونة وحده ليس إشارة استغاثة.',
  ],
  heardCaption: [
    'Sound and radio distress signals. Other horn patterns, such as six short, three long, six short, have no meaning.',
    'Señales de socorro sonoras y por radio. Otros patrones de bocina, como seis cortas, tres largas, seis cortas, no significan nada.',
    'Signaux de détresse sonores et radio. Les autres séquences de corne, comme six brèves, trois longues, six brèves, ne signifient rien.',
    'Звуковые и радиосигналы бедствия. Другие сочетания гудков, например шесть коротких, три длинных, шесть коротких, ничего не значат.',
    'אותות מצוקה קוליים ובקשר. דפוסי צפירה אחרים, כמו שש קצרות, שלוש ארוכות, שש קצרות, אינם אומרים דבר.',
    'إشارات استغاثة صوتية ولاسلكية. أنماط البوق الأخرى، مثل ست قصيرة وثلاث طويلة وست قصيرة، لا تعني شيئًا.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#16232a', RED = '#e0362c', ORANGE = '#f08a24', BLUE = '#1f4fa8';
let serial = 0;

// Icons are drawn around (0,0) within roughly ±42 px.
const ICONS = {
  handFlare: `<rect x="-6" y="-6" width="12" height="40" rx="3" fill="#6b7d86"/><circle cx="0" cy="-16" r="18" fill="${RED}" opacity=".25"/><circle cx="0" cy="-16" r="9" fill="${RED}"/>`,
  rocket: `<path d="M-28 36Q-14 -6 6 -18" fill="none" stroke="#9aa9af" stroke-width="2" stroke-dasharray="4 4"/><path d="M4 -40A18 14 0 0 1 36 -40Z" fill="#e8e2d2" stroke="${INK}" stroke-width="1"/><path d="M6 -40L20 -18M34 -40L20 -18" stroke="${INK}" stroke-width="1"/><circle cx="20" cy="-14" r="7" fill="${RED}"/>`,
  smoke: `<rect x="-8" y="14" width="16" height="22" rx="2" fill="#6b7d86"/><circle cx="-6" cy="0" r="12" fill="${ORANGE}" opacity=".85"/><circle cx="8" cy="-14" r="14" fill="${ORANGE}" opacity=".75"/><circle cx="-4" cy="-30" r="11" fill="${ORANGE}" opacity=".6"/>`,
  flames: `<path d="M-40 18H40L30 34H-30Z" fill="#5d7480"/><path d="M-14 18C-20 4 -10 -6 -8 -22C0 -10 6 -14 4 -30C18 -14 20 4 14 18Z" fill="${ORANGE}"/><path d="M-6 18C-8 8 0 2 2 -10C8 0 10 8 6 18Z" fill="${RED}"/>`,
  nc: `<path d="M-26 -40V40" stroke="${INK}" stroke-width="2"/>${[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => `<rect x="${-24 + c * 11}" y="${-38 + r * 9}" width="11" height="9" fill="${(r + c) % 2 ? '#fff' : BLUE}"/>`)).join('')}<rect x="-24" y="-38" width="44" height="36" fill="none" stroke="${INK}" stroke-width=".8"/>${[BLUE, '#fff', RED, '#fff', BLUE].map((color, i) => `<rect x="-24" y="${2 + i * 7.2}" width="44" height="7.2" fill="${color}"/>`).join('')}<rect x="-24" y="2" width="44" height="36" fill="none" stroke="${INK}" stroke-width=".8"/>`,
  flagBall: `<path d="M-20 -40V40" stroke="${INK}" stroke-width="2"/><circle cx="4" cy="-26" r="11" fill="${INK}"/><rect x="-18" y="-8" width="42" height="36" fill="${ORANGE}" stroke="${INK}" stroke-width="1"/>`,
  arms: `<circle cx="0" cy="-26" r="8" fill="${INK}"/><path d="M0 -18V12M0 12L-10 36M0 12L10 36" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M0 -12L-30 -22M0 -12L30 -22" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M-36 -36V-4M-41 -30L-36 -38L-31 -30M-41 -10L-36 -2L-31 -10M36 -36V-4M31 -30L36 -38L41 -30M31 -10L36 -2L41 -10" fill="none" stroke="${RED}" stroke-width="2"/>`,
  explosion: `<path d="M0 -34L8 -12L30 -20L16 -2L34 10L10 12L12 34L0 16L-12 34L-10 12L-34 10L-16 -2L-30 -20L-8 -12Z" fill="${ORANGE}" stroke="${RED}" stroke-width="2"/><text x="0" y="6" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}" direction="ltr">1 min</text>`,
  horn: `<path d="M-36 -6H-18L18 -26V26L-18 6H-36Z" fill="#6b7d86"/><path d="M24 -14Q32 0 24 14M30 -22Q42 0 30 22" fill="none" stroke="${INK}" stroke-width="2"/><rect x="-36" y="32" width="72" height="5" rx="2" fill="${RED}"/>`,
  sos: `<text x="0" y="-8" text-anchor="middle" font-size="22" font-weight="800" fill="${INK}" direction="ltr">SOS</text>${[0, 1, 2].map(i => `<circle cx="${-40 + i * 7}" cy="14" r="2.6" fill="${RED}"/>`).join('')}${[0, 1, 2].map(i => `<rect x="${-16 + i * 11}" y="12" width="8" height="4" fill="${RED}"/>`).join('')}${[0, 1, 2].map(i => `<circle cx="${24 + i * 7}" cy="14" r="2.6" fill="${RED}"/>`).join('')}`,
  mayday: `<rect x="-14" y="-26" width="28" height="56" rx="6" fill="#33505c"/><path d="M-6 -26V-40" stroke="#33505c" stroke-width="4"/><rect x="-9" y="-18" width="18" height="12" fill="#9fd0c0"/><text x="0" y="-9" text-anchor="middle" font-size="8" font-weight="700" fill="${INK}" direction="ltr">16</text><text x="30" y="-24" font-size="12" font-weight="800" fill="${RED}" direction="ltr">MAYDAY</text>`,
  dsc: `<rect x="-34" y="-20" width="68" height="44" rx="5" fill="#33505c"/><rect x="-26" y="-12" width="30" height="16" fill="#9fd0c0"/><circle cx="20" cy="4" r="9" fill="${RED}" stroke="#fff" stroke-width="2"/><text x="-11" y="-1" text-anchor="middle" font-size="9" font-weight="700" fill="${INK}" direction="ltr">DSC</text>`,
  beacon: `<rect x="-10" y="-14" width="20" height="44" rx="4" fill="#f2c230" stroke="${INK}" stroke-width="1"/><path d="M0 -14V-34" stroke="${INK}" stroke-width="2"/><path d="M-12 -34Q0 -46 12 -34M-20 -38Q0 -56 20 -38" fill="none" stroke="${RED}" stroke-width="2"/>`,
};
const SETS = {
  seen: ['handFlare', 'rocket', 'smoke', 'flames', 'nc', 'flagBall', 'arms'],
  heard: ['explosion', 'horn', 'sos', 'mayday', 'dsc', 'beacon'],
};

export const isDistressFigure = figure => /^distress:/.test(String(figure ?? ''));
export const distressCaption = (figure, lang = 'en') =>
  words[String(figure).endsWith(':heard') ? 'heardCaption' : 'seenCaption'][localeIndex(lang)];

export function renderDistressFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4;
  const variant = String(figure).endsWith(':heard') ? 'heard' : 'seen', keys = SETS[variant];
  const t = key => words[key][index], id = `distress-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = '#173a4d', weight = 600, max = 22} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const columns = variant === 'seen' ? 4 : 3, cellW = 700 / columns, cellH = 176;
  let art = `<rect width="760" height="430" rx="14" fill="#f4f7f3"/>` + text(380, 34, t(`${variant}Title`), {size: 21, max: 60});
  keys.forEach((key, i) => {
    const row = Math.floor(i / columns), inRow = row ? keys.length - columns : columns, col = i % columns;
    // RTL reading order runs right to left; a short last row is centered.
    const slot = rtl ? inRow - 1 - col : col, x = 30 + (700 - inRow * cellW) / 2 + slot * cellW + cellW / 2, y = 58 + row * (cellH + 10);
    art += `<g data-distress="${key}"><rect x="${x - cellW / 2 + 6}" y="${y}" width="${cellW - 12}" height="${cellH}" rx="10" fill="#dce9ee"/>`;
    art += `<g transform="translate(${x} ${y + 64})">${ICONS[key]}</g>${text(x, y + 132, t(key), {max: variant === 'seen' ? 20 : 24})}</g>`;
  });
  const description = `${keys.map(t).join('; ')}. ${distressCaption(figure, lang)}`;
  return `<svg class="teaching-figure" data-figure="distress" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(t(`${variant}Title`))}</title><desc id="${id}-desc">${escape(description)}</desc>${art}</svg>`;
}
