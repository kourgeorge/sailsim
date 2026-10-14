// Gear-failure figures: the emergency tiller, a broken windward shroud, and a tow
// line long enough to keep both boats in step with the waves. Schematic only.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  tillerTitle: ['Emergency tiller', 'Caña de emergencia', 'Barre franche de secours', 'Аварийный румпель', 'מוט הגה לחירום', 'ذراع الدفة الاحتياطي'],
  wheel: ['Wheel and cable: failed', 'Rueda y guardín: averiados', 'Roue et drosses : en panne', 'Штурвал и штуртрос: отказ', 'הגה וכבל: תקולים', 'العجلة والكابل: معطلان'],
  stock: ['Rudder stock under a deck plate', 'Mecha del timón bajo una tapa de cubierta', 'Mèche du safran sous une trappe de pont', 'Баллер руля под палубной крышкой', 'ציר ההגה מתחת למכסה בסיפון', 'محور الدفة تحت غطاء السطح'],
  tiller: ['Emergency tiller fitted on the stock', 'Caña de emergencia sobre la mecha', 'Barre de secours sur la mèche', 'Аварийный румпель на баллере', 'מוט חירום מורכב על הציר', 'الذراع الاحتياطي مركّب على المحور'],
  rudder: ['Rudder', 'Pala del timón', 'Safran', 'Перо руля', 'להב ההגה', 'الدفة'],
  shroudTitle: ['A broken windward shroud', 'Obenque de barlovento roto', 'Hauban au vent cassé', 'Лопнувшая наветренная ванта', 'ונט צד הרוח שנקרע', 'شريط جهة الريح المقطوع'],
  wind: ['Wind', 'Viento', 'Vent', 'Ветер', 'רוח', 'الريح'],
  broken: ['Broken: it was carrying the load', 'Roto: soportaba la carga', 'Cassé : il portait la charge', 'Лопнула: она несла нагрузку', 'נקרע: הוא נשא את העומס', 'مقطوع: كان يحمل الحمل'],
  tackNow: ['Tack at once: the broken side goes to leeward', 'Vira de inmediato: el lado roto queda a sotavento', 'Virez aussitôt : le côté cassé passe sous le vent', 'Сразу поворачивайте: сломанный борт уходит под ветер', 'בצעו סיבוב מיד: הצד הקרוע עובר לצד המוגן', 'غيّر الاتجاه فورًا: يصبح الجانب المقطوع في ظل الريح'],
  towTitle: ['Towing in waves', 'Remolcar con olas', 'Remorquer dans les vagues', 'Буксировка на волне', 'גרירה בגלים', 'القطر في الأمواج'],
  longLine: ['Long, heavy, stretchy line: the boats ride in step', 'Cabo largo, pesado y elástico: los barcos van acompasados', 'Bosse longue, lourde et élastique : les bateaux suivent le même rythme', 'Длинный тяжёлый растяжимый конец: суда идут в такт', 'חבל ארוך, כבד ונמתח: הכלים נעים באותו קצב', 'حبل طويل ثقيل مرن: يسير القاربان بإيقاع واحد'],
  shortLine: ['Short line: it snatches tight, and a sharp turn makes the tow sheer', 'Cabo corto: da tirones, y un giro brusco hace guiñar al remolcado', 'Bosse courte : elle se tend brutalement, et un virage serré fait embarder la remorque', 'Короткий конец: рвёт, а при резком повороте буксируемое рыскает', 'חבל קצר: נמתח בבת אחת, ופנייה חדה גורמת לנגרר לסטות', 'حبل قصير: يشتد فجأة، والانعطاف الحاد يجعل المقطور ينحرف'],
  tillerCaption: [
    'When the wheel’s cable or shaft fails, the emergency tiller fits straight onto the top of the rudder stock, usually under a deck plate in the cockpit.',
    'Si falla el guardín o el eje de la rueda, la caña de emergencia encaja directamente en la parte alta de la mecha del timón, normalmente bajo una tapa en la bañera.',
    'Si les drosses ou l’axe de la roue lâchent, la barre de secours se fixe directement en haut de la mèche du safran, en général sous une trappe dans le cockpit.',
    'Если отказал штуртрос или вал штурвала, аварийный румпель надевается прямо на верх баллера руля, обычно под крышкой в кокпите.',
    'כשהכבל או הציר של ההגה נכשלים, מוט החירום מורכב ישירות על ראש ציר ההגה, בדרך כלל מתחת למכסה בקוקפיט.',
    'عندما يتعطل كابل العجلة أو محورها، يُركّب الذراع الاحتياطي مباشرة على أعلى محور الدفة، عادة تحت غطاء في قمرة القيادة.',
  ],
  shroudCaption: [
    'Seen from astern on starboard tack, the wind comes from the right and the starboard shroud carries the load. If it breaks, tack at once so that side is to leeward.',
    'Visto desde popa amurado a estribor, el viento llega por la derecha y el obenque de estribor soporta la carga. Si se rompe, vira de inmediato para dejar ese lado a sotavento.',
    'Vu de l’arrière, tribord amures, le vent vient de droite et le hauban tribord porte la charge. S’il casse, virez aussitôt pour mettre ce côté sous le vent.',
    'Вид с кормы на правом галсе: ветер справа, нагрузку несёт правая ванта. Если она лопнула, сразу поворачивайте, чтобы этот борт оказался под ветром.',
    'במבט מהירכתיים בהפלגה ברוח מימין, הרוח מגיעה מימין והוונט הימני נושא את העומס. אם הוא נקרע, בצעו סיבוב מיד כדי שהצד הזה יהיה הצד המוגן.',
    'عند النظر من المؤخرة والريح على الجانب الأيمن، تأتي الريح من اليمين ويحمل الشريط الأيمن الحمل. إذا انقطع فغيّر الاتجاه فورًا ليصبح ذلك الجانب في ظل الريح.',
  ],
  towCaption: [
    'A long, heavy line sags into a curve and lets both boats ride the waves in step. A short line snatches tight, and after a sharp turn it jerks the towed boat’s bow round after you.',
    'Un cabo largo y pesado forma una curva y deja que ambos barcos suban las olas acompasados. Un cabo corto da tirones y, tras un giro brusco, hace girar de golpe la proa del remolcado tras de ti.',
    'Une bosse longue et lourde forme une courbe et laisse les deux bateaux suivre les vagues au même rythme. Une bosse courte se tend brutalement et, après un virage serré, fait pivoter l’étrave de la remorque derrière vous.',
    'Длинный тяжёлый конец провисает дугой, и оба судна идут по волнам в такт. Короткий конец рвёт, а после резкого поворота дёргает нос буксируемого за вами.',
    'חבל ארוך וכבד שוקע בקשת ומאפשר לשני הכלים לעלות על הגלים באותו קצב. חבל קצר נמתח בבת אחת, ואחרי פנייה חדה הוא מושך את חרטום הנגרר אחריכם.',
    'الحبل الطويل الثقيل يتدلى في قوس ويترك القاربين يركبان الأمواج بإيقاع واحد. أما الحبل القصير فيشتد فجأة، وبعد انعطاف حاد يدير مقدمة المقطور خلفك بعنف.',
  ],
};
const VARIANTS = ['tiller', 'shroud', 'tow'];
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', RED = '#d23a2e', TEAL = '#2f6f62', WATER = '#cfe3ea';
let serial = 0;

export const gearVariants = VARIANTS;
export const isGearFigure = figure => /^gear:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'tiller');
export const gearCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

function tiller(t, text) {
  // Side view of the cockpit floor, the rudder stock and the rudder below the hull.
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="#eef4f2"/><rect x="20" y="270" width="720" height="140" fill="${WATER}"/>`;
  art += `<path d="M60 250H700L660 290H100Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/>`;
  // Wheel with a broken cable.
  art += `<circle cx="220" cy="170" r="46" fill="none" stroke="${INK}" stroke-width="5"/><path d="M220 216V250" stroke="${INK}" stroke-width="5"/><path d="M226 250Q300 262 340 252" fill="none" stroke="${RED}" stroke-width="3" stroke-dasharray="6 5"/><path d="M336 244l10 10M346 244l-10 10" stroke="${RED}" stroke-width="3"/>`;
  art += text(220, 100, t('wheel'), {size: 13, fill: RED, max: 24});
  // Rudder stock and rudder, with the emergency tiller fitted on top.
  art += `<path d="M470 250V330" stroke="${INK}" stroke-width="8"/><path d="M470 300H540Q556 330 536 390H470Z" fill="#c9d2d6" stroke="${INK}" stroke-width="2"/>`;
  art += `<rect x="446" y="238" width="48" height="12" rx="3" fill="#8a7a5a"/><path d="M470 236L470 214L380 176" fill="none" stroke="${TEAL}" stroke-width="8" stroke-linecap="round"/>`;
  art += text(600, 230, t('stock'), {size: 13, max: 24}) + text(410, 140, t('tiller'), {size: 13, fill: TEAL, max: 24}) + text(600, 360, t('rudder'), {size: 13});
  return art;
}

function shroud(t, text) {
  // From astern: starboard on the viewer's right, wind from the right (starboard tack).
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${WATER}"/>`;
  art += `<path d="M300 352H460L440 392H320Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/><path d="M380 352V90" stroke="${INK}" stroke-width="4"/><path d="M340 180H420" stroke="${INK}" stroke-width="3"/>`;
  art += `<path d="M380 92L340 180L304 350" fill="none" stroke="#7f98a3" stroke-width="2"/>`;
  // Starboard (windward) shroud, broken near the chainplate.
  art += `<path d="M380 92L420 180L440 270" fill="none" stroke="${RED}" stroke-width="3"/><path d="M448 300L456 350" stroke="${RED}" stroke-width="3"/><path d="M434 280l16 8M440 270l14 18" stroke="${RED}" stroke-width="2"/>`;
  art += text(590, 280, t('broken'), {size: 13, fill: RED, max: 22});
  for (const y of [130, 180, 230]) art += `<path d="M700 ${y}H560" stroke="#5c7480" stroke-width="3"/><path d="M560 ${y - 7}l-12 7l12 7Z" fill="#5c7480"/>`;
  art += text(640, 110, t('wind'), {size: 13, fill: '#5c7480'});
  art += text(160, 200, t('tackNow'), {size: 14, fill: TEAL, max: 22});
  return art;
}

function tow(t, text) {
  let art = '';
  for (const [y0, long] of [[64, true], [244, false]]) {
    art += `<rect x="20" y="${y0}" width="720" height="168" rx="12" fill="${WATER}"/>`;
    let wave = `M30 ${y0 + 110}`;
    for (let k = 0; k < 14; k++) wave += `q25 -18 50 0`;
    art += `<path d="${wave}" fill="none" stroke="#4f8aa3" stroke-width="2"/>`;
    const boat = (x, y) => `<path d="M${x - 46} ${y}H${x + 46}L${x + 34} ${y + 18}H${x - 34}Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/><path d="M${x} ${y}V${y - 50}" stroke="${INK}" stroke-width="2"/>`;
    const lead = 620, towed = long ? 160 : 470, y = y0 + 92;
    art += boat(lead, y) + boat(towed, y);
    art += long
      ? `<path d="M${lead - 46} ${y + 6}Q${(lead + towed) / 2} ${y + 60} ${towed + 46} ${y + 6}" fill="none" stroke="#b5651d" stroke-width="3"/>`
      : `<path d="M${lead - 46} ${y + 6}L${towed + 46} ${y + 6}" stroke="${RED}" stroke-width="3"/>`;
    art += text(380, y0 + 30, t(long ? 'longLine' : 'shortLine'), {size: 13, fill: long ? TEAL : RED, max: 70});
  }
  return art;
}

/** `figure` is "gear:<variant>"; unknown variants fall back to the tiller. */
export function renderGearFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index], id = `gear-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = {tiller, shroud, tow}[variant](t, text);
  return `<svg class="teaching-figure" data-figure="gear" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(gearCaption(figure, lang))}</desc><rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 36, title, {size: 21, max: 60})}${body}</svg>`;
}
