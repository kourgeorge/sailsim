// Signal-flag figures: the single code flags a skipper meets most, and where the
// ensign, courtesy flag and Q flag fly on arrival abroad. Schematic only.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  codeTitle: ['Code flags you should know', 'Banderas del código que debes conocer', 'Pavillons du code à connaître', 'Флаги свода сигналов, которые нужно знать', 'דגלי קוד שכדאי להכיר', 'أعلام المدونة التي يجب معرفتها'],
  A: ['A: diver down, keep well clear at slow speed', 'A: buceador abajo, mantente lejos y despacio', 'A : plongeur en immersion, au large et lentement', 'A: водолаз под водой, держитесь дальше, малым ходом', 'A: צוללן במים, התרחקו והאטו', 'A: غواص تحت الماء، ابتعد وخفف السرعة'],
  B: ['B: dangerous goods such as fuel, keep clear', 'B: mercancías peligrosas como combustible, mantente apartado', 'B : marchandises dangereuses, au large', 'B: опасный груз, например топливо, держитесь в стороне', 'B: מטען מסוכן כמו דלק, התרחקו', 'B: بضائع خطرة كالوقود، ابتعد'],
  O: ['O: man overboard', 'O: hombre al agua', 'O : un homme à la mer', 'O: человек за бортом', 'O: אדם במים', 'O: رجل في الماء'],
  Q: ['Q: my vessel is healthy, I request free pratique', 'Q: buque sano, solicito libre plática', 'Q : navire sain, je demande la libre pratique', 'Q: судно здорово, прошу свободную практику', 'Q: כלי השיט בריא, מבקש היתר כניסה', 'Q: سفينتي سليمة وأطلب الإذن بالدخول'],
  NC: ['N over C: distress', 'N sobre C: socorro', 'N sur C : détresse', 'N над C: бедствие', 'N מעל C: מצוקה', 'N فوق C: استغاثة'],
  courtesyTitle: ['Flags on arrival in another country', 'Banderas al llegar a otro país', 'Pavillons à l’arrivée dans un autre pays', 'Флаги при прибытии в другую страну', 'דגלים בהגעה למדינה אחרת', 'الأعلام عند الوصول إلى بلد آخر'],
  starboard: ['Starboard spreader: host country’s courtesy flag', 'Cruceta de estribor: bandera de cortesía del país', 'Barre de flèche tribord : pavillon de courtoisie', 'Правая краспица: гостевой флаг страны', 'מוט פיזור ימני: דגל המדינה המארחת', 'الذراع اليمنى: علم مجاملة البلد المضيف'],
  port: ['Port spreader: yellow Q flag until cleared', 'Cruceta de babor: bandera Q amarilla hasta el despacho', 'Barre de flèche bâbord : pavillon Q jaune jusqu’au dédouanement', 'Левая краспица: жёлтый флаг Q до оформления', 'מוט פיזור שמאלי: דגל Q צהוב עד לאישור', 'الذراع اليسرى: علم Q الأصفر حتى التخليص'],
  stern: ['Stern: your own ensign', 'Popa: tu pabellón nacional', 'Poupe : votre pavillon national', 'Корма: ваш собственный флаг', 'ירכתיים: הדגל שלכם', 'المؤخرة: علمك الوطني'],
  seenFromAstern: ['Seen from astern', 'Vista desde popa', 'Vu de l’arrière', 'Вид с кормы', 'מבט מהירכתיים', 'منظر من المؤخرة'],
  codeCaption: [
    'Single code flags carry short urgent messages; none of them on its own means distress. N over C, or a square flag with a ball, is a distress signal.',
    'Las banderas sueltas del código transmiten mensajes breves y urgentes; ninguna sola significa socorro. N sobre C, o una bandera cuadrada con una bola, es señal de socorro.',
    'Les pavillons isolés du code transmettent des messages brefs et urgents ; aucun seul ne signifie détresse. N sur C, ou un pavillon carré avec une boule, est un signal de détresse.',
    'Одиночные флаги свода сигналов передают короткие срочные сообщения; ни один из них сам по себе не означает бедствие. N над C или квадратный флаг с шаром — сигнал бедствия.',
    'דגלי קוד בודדים מעבירים הודעות קצרות ודחופות; אף אחד מהם לבדו אינו אות מצוקה. N מעל C, או דגל מרובע עם כדור, הוא אות מצוקה.',
    'تحمل أعلام المدونة المفردة رسائل قصيرة عاجلة، ولا يعني أي منها وحده استغاثة. أما N فوق C أو علم مربع مع كرة فإشارة استغاثة.',
  ],
  courtesyCaption: [
    'Seen from astern, starboard is on the right. The courtesy flag flies under the starboard spreader, the Q flag under the port spreader until you are cleared, and your own ensign at the stern.',
    'Vista desde popa, estribor queda a la derecha. La bandera de cortesía va en la cruceta de estribor, la Q en la de babor hasta el despacho, y tu pabellón en la popa.',
    'Vu de l’arrière, tribord est à droite. Le pavillon de courtoisie va sous la barre de flèche tribord, le Q sous la barre bâbord jusqu’au dédouanement, et votre pavillon à la poupe.',
    'Если смотреть с кормы, правый борт справа. Гостевой флаг — под правой краспицей, флаг Q — под левой до оформления, а ваш флаг — на корме.',
    'במבט מהירכתיים, ימין הוא בצד ימין. דגל המדינה המארחת מונף מתחת למוט הפיזור הימני, דגל Q מתחת למוט השמאלי עד לאישור, והדגל שלכם בירכתיים.',
    'عند النظر من المؤخرة يكون الجانب الأيمن على اليمين. يُرفع علم المجاملة تحت الذراع اليمنى، وعلم Q تحت الذراع اليسرى حتى التخليص، وعلمك الوطني في المؤخرة.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', BLUE = '#1f4fa8', RED = '#d23a2e', YELLOW = '#f2c230';
let serial = 0;

export const isFlagsFigure = figure => /^flags:/.test(String(figure ?? ''));
const variantOf = figure => (String(figure).endsWith(':courtesy') ? 'courtesy' : 'code');
export const flagsCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

// Code flags drawn at (x, y) with width w; swallow-tailed flags get a notched fly.
const FLAGS = {
  A: (x, y, w, h) => `<path d="M${x} ${y}H${x + w / 2}V${y + h}H${x}Z" fill="#fff"/><path d="M${x + w / 2} ${y}H${x + w}L${x + w * 0.78} ${y + h / 2}L${x + w} ${y + h}H${x + w / 2}Z" fill="${BLUE}"/>`,
  B: (x, y, w, h) => `<path d="M${x} ${y}H${x + w}L${x + w * 0.78} ${y + h / 2}L${x + w} ${y + h}H${x}Z" fill="${RED}"/>`,
  O: (x, y, w, h) => `<path d="M${x} ${y}H${x + w}V${y + h}Z" fill="${RED}"/><path d="M${x} ${y}L${x + w} ${y + h}H${x}Z" fill="${YELLOW}"/>`,
  Q: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${YELLOW}"/>`,
  N: (x, y, w, h) => [0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => `<rect x="${x + (c * w) / 4}" y="${y + (r * h) / 4}" width="${w / 4}" height="${h / 4}" fill="${(r + c) % 2 ? '#fff' : BLUE}"/>`)).join(''),
  C: (x, y, w, h) => [BLUE, '#fff', RED, '#fff', BLUE].map((color, i) => `<rect x="${x}" y="${y + (i * h) / 5}" width="${w}" height="${h / 5}" fill="${color}"/>`).join(''),
};
const outlined = (letter, x, y, w = 70, h = 48) => {
  const notch = letter === 'A' || letter === 'B';
  const outline = notch ? `<path d="M${x} ${y}H${x + w}L${x + w * 0.78} ${y + h / 2}L${x + w} ${y + h}H${x}Z" fill="none" stroke="${INK}"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}"/>`;
  return `<path d="M${x} ${y}V${y + h + 22}" stroke="${INK}" stroke-width="2"/>` + FLAGS[letter](x, y, w, h) + outline;
};

function code(t, text) {
  let art = '';
  ['A', 'B', 'O', 'Q'].forEach((letter, i) => {
    const col = i % 2, row = Math.floor(i / 2), x = 40 + col * 360, y = 70 + row * 120;
    art += `<rect x="${x - 16}" y="${y - 10}" width="340" height="104" rx="12" fill="#eef4f2"/>` + outlined(letter, x, y + 14);
    art += text(x + 200, y + 44, t(letter), {size: 13, max: 26});
  });
  // N over C, hoisted together.
  const x = 300, y = 314;
  art += `<rect x="${x - 76}" y="${y - 12}" width="320" height="110" rx="12" fill="#fbe9d0"/>`;
  art += `<path d="M${x} ${y}V${y + 96}" stroke="${INK}" stroke-width="2"/>` + FLAGS.N(x, y, 60, 40) + `<rect x="${x}" y="${y}" width="60" height="40" fill="none" stroke="${INK}"/>` + FLAGS.C(x, y + 46, 60, 40) + `<rect x="${x}" y="${y + 46}" width="60" height="40" fill="none" stroke="${INK}"/>`;
  art += text(x + 140, y + 50, t('NC'), {size: 15, fill: RED, max: 18});
  return art;
}

function courtesy(t, text) {
  // A yacht seen from astern: starboard on the viewer's right.
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="#cfe3ea"/>`;
  art += `<path d="M300 352H460L440 392H320Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/><path d="M380 352V90" stroke="${INK}" stroke-width="4"/><path d="M330 170H430" stroke="${INK}" stroke-width="3"/>`;
  art += `<path d="M330 170L300 352M430 170L460 352M380 90L300 352M380 90L460 352" stroke="#7f98a3" stroke-width="1"/>`;
  // Courtesy flag (a plain host flag) under the starboard spreader, Q under the port spreader.
  art += `<path d="M430 170V190" stroke="${INK}"/><rect x="430" y="190" width="44" height="28" fill="#fff" stroke="${INK}"/><rect x="430" y="190" width="44" height="9" fill="${RED}"/><rect x="430" y="209" width="44" height="9" fill="${RED}"/>`;
  art += `<path d="M330 170V190" stroke="${INK}"/><rect x="286" y="190" width="44" height="28" fill="${YELLOW}" stroke="${INK}"/>`;
  // Ensign on a staff at the stern.
  art += `<path d="M380 352V318" stroke="${INK}" stroke-width="2"/><rect x="380" y="318" width="40" height="24" fill="${BLUE}" stroke="${INK}"/>`;
  art += `<path d="M480 204H540" stroke="#5c7480"/>` + text(630, 200, t('starboard'), {size: 13, max: 26});
  art += `<path d="M280 204H220" stroke="#5c7480"/>` + text(130, 200, t('port'), {size: 13, max: 24});
  art += `<path d="M425 330H540" stroke="#5c7480"/>` + text(630, 334, t('stern'), {size: 13, max: 26});
  art += text(380, 80, t('seenFromAstern'), {size: 12, weight: 500, fill: '#5c7480'});
  return art;
}

/** `figure` is "flags:code" or "flags:courtesy". */
export function renderFlagsFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index], id = `flags-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = variant === 'courtesy' ? courtesy(t, text) : code(t, text);
  return `<svg class="teaching-figure" data-figure="flags" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(flagsCaption(figure, lang))}</desc><rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 36, title, {size: 21, max: 60})}${body}</svg>`;
}
