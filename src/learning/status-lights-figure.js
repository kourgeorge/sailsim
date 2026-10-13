// Lights-and-shapes card: schematic views (side views have the bow to the right) of what a vessel
// shows at night and by day. Each lesson page picks a variant: a few related rows.
// Geometry stays left-to-right in every language; only the text column moves.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  title: ['Lights and day shapes', 'Luces y marcas diurnas', 'Feux et marques de jour', 'Огни и дневные знаки', 'אורות וסימני יום', 'الأضواء وعلامات النهار'],
  night: ['Night', 'Noche', 'Nuit', 'Ночью', 'לילה', 'ليلًا'],
  day: ['By day', 'De día', 'De jour', 'Днём', 'ביום', 'نهارًا'],
  none: ['No shape', 'Sin marca', 'Aucune marque', 'Без знака', 'ללא סימן', 'بلا علامة'],
  blocked: ['Blocked', 'Obstruido', 'Obstrué', 'Препятствие', 'חסום', 'مسدود'],
  pass: ['Pass', 'Paso', 'Passage', 'Проход', 'מעבר', 'مرور'],
  sailing: ['Sailing vessel underway', 'Velero navegando', 'Voilier faisant route', 'Парусное судно на ходу', 'מפרשית בתנועה', 'سفينة شراعية في طريقها'],
  sailOptional: ['Sailing, optional red over green', 'A vela, rojo sobre verde opcional', 'À la voile, rouge sur vert facultatif', 'Под парусом, красный над зелёным (по желанию)', 'במפרשים, אדום מעל ירוק (רשות)', 'بالشراع، أحمر فوق أخضر (اختياري)'],
  motorSailing: ['Under sail and engine', 'A vela y motor', 'Voile et moteur', 'Под парусом и двигателем', 'מפרשים ומנוע', 'بالشراع والمحرك'],
  nuc: ['Not under command', 'Sin gobierno', 'Non maître de sa manœuvre', 'Лишённое возможности управляться', 'ללא שליטה', 'غير خاضعة للقيادة'],
  ram: ['Restricted in ability to maneuver', 'Maniobrabilidad restringida', 'À capacité de manœuvre restreinte', 'Ограниченное в возможности маневрировать', 'מוגבל ביכולת התמרון', 'مقيدة القدرة على المناورة'],
  fishing: ['Fishing, not trawling', 'Pescando, no arrastre', 'En pêche, pas au chalut', 'Ловит рыбу, не тралом', 'דיג שאינו מכמורת', 'صيد بغير الجرّ'],
  trawling: ['Trawling', 'Arrastrando', 'Chalutier en pêche', 'Тралит', 'דיג במכמורת', 'صيد بالجرّ'],
  cbd: ['Constrained by draught', 'Restringido por su calado', 'Handicapé par son tirant d’eau', 'Стеснённое своей осадкой', 'מוגבל בשל שוקע', 'مقيدة بغاطسها'],
  powerSmall: ['Power-driven, under 50 m', 'De propulsión mecánica, menos de 50 m', 'À propulsion mécanique, moins de 50 m', 'Механическое, меньше 50 м', 'כלי ממונע, פחות מ־50 מ׳', 'آلية الدفع، أقل من 50 م'],
  powerLarge: ['Power-driven, 50 m or more', 'De propulsión mecánica, 50 m o más', 'À propulsion mécanique, 50 m ou plus', 'Механическое, 50 м и больше', 'כלי ממונע, 50 מ׳ ומעלה', 'آلية الدفع، 50 م أو أكثر'],
  ramWay: ['Restricted, making way', 'Restringido, con arrancada', 'Manœuvre restreinte, en route', 'Ограниченное, имеет ход', 'מוגבל בתמרון, בתנועה', 'مقيدة المناورة وتتحرك'],
  anchorSmall: ['At anchor, under 50 m', 'Fondeado, menos de 50 m', 'Au mouillage, moins de 50 m', 'На якоре, меньше 50 м', 'בעגינה, פחות מ־50 מ׳', 'راسية، أقل من 50 م'],
  anchorLarge: ['At anchor, 50 m or more', 'Fondeado, 50 m o más', 'Au mouillage, 50 m ou plus', 'На якоре, 50 м и больше', 'בעגינה, 50 מ׳ ומעלה', 'راسية، 50 م أو أكثر'],
  aground: ['Aground', 'Varado', 'Échoué', 'На мели', 'עלה על שרטון', 'جانحة'],
  towShort: ['Towing, tow up to 200 m', 'Remolcando, hasta 200 m', 'Remorquage, jusqu’à 200 m', 'Буксирует, до 200 м', 'גורר, עד 200 מ׳', 'تقطر، حتى 200 م'],
  towLong: ['Towing, tow over 200 m', 'Remolcando, más de 200 m', 'Remorquage, plus de 200 m', 'Буксирует, больше 200 м', 'גורר, מעל 200 מ׳', 'تقطر، أكثر من 200 م'],
  towed: ['Towed vessel, tow over 200 m', 'Buque remolcado, más de 200 m', 'Navire remorqué, plus de 200 m', 'Буксируемое, больше 200 м', 'כלי נגרר, מעל 200 מ׳', 'سفينة مقطورة، أكثر من 200 م'],
  pushing: ['Pushing ahead', 'Empujando', 'Poussant en avant', 'Толкает впереди себя', 'דוחף לפניו', 'تدفع أمامها'],
  tugRestricted: ['Tug restricted by her tow', 'Remolcador restringido por el remolque', 'Remorqueur restreint par sa remorque', 'Буксир, ограниченный буксировкой', 'גוררת מוגבלת בגלל הגרירה', 'قاطرة مقيدة بقطرها'],
  pilot: ['Pilot on duty, underway', 'Práctico de servicio, navegando', 'Pilote en service, en route', 'Лоцманское судно на ходу', 'כלי ניתוב בתפקיד, בתנועה', 'سفينة إرشاد في الخدمة، تتحرك'],
  pilotAnchor: ['Pilot on duty, at anchor', 'Práctico de servicio, fondeado', 'Pilote en service, au mouillage', 'Лоцманское судно на якоре', 'כלי ניתוב בתפקיד, בעגינה', 'سفينة إرشاد في الخدمة، راسية'],
  diving: ['Supporting divers', 'Apoyando a buceadores', 'Soutien de plongeurs', 'Обеспечивает водолазов', 'תומך בצוללים', 'تدعم غواصين'],
  dredger: ['Dredger, seen from astern', 'Draga, vista desde popa', 'Drague, vue de l’arrière', 'Земснаряд, вид с кормы', 'מחפרת, מבט מהירכתיים', 'كراءة، منظر من المؤخرة'],
  gear: ['Fishing gear out over 150 m', 'Aparejo a más de 150 m', 'Engins à plus de 150 m', 'Снасти дальше 150 м', 'ציוד דיג מעבר ל־150 מ׳', 'معدات صيد أبعد من 150 م'],
  hovercraft: ['Hovercraft on its air cushion', 'Aerodeslizador sobre su colchón', 'Aéroglisseur sur coussin d’air', 'Судно на воздушной подушке', 'רחפת על כרית אוויר', 'حوامة على وسادتها الهوائية'],
  caption: [
    'Schematic views; side views have the bow to the right. Lights shown at night, shapes shown by day. Not every light is visible from one angle, so read the whole vertical pattern.',
    'Vistas esquemáticas; en las laterales, la proa queda a la derecha. Luces de noche y marcas de día. No todas las luces se ven desde un mismo ángulo; lee el conjunto vertical completo.',
    'Vues schématiques ; dans les vues latérales, l’étrave est à droite. Feux de nuit et marques de jour. Tous les feux ne sont pas visibles sous un même angle ; lisez l’ensemble vertical complet.',
    'Схематичные виды; на видах сбоку нос справа. Огни ночью и знаки днём. Не все огни видны с одного ракурса, поэтому читайте вертикальный набор целиком.',
    'מבטים סכמטיים; במבט צד החרטום מימין. אורות בלילה וסימנים ביום. לא כל האורות נראים מזווית אחת, לכן קראו את כל המערך האנכי.',
    'مناظر تخطيطية؛ في المناظر الجانبية تكون المقدمة إلى اليمين. الأضواء ليلًا والعلامات نهارًا. لا تُرى كل الأضواء من زاوية واحدة، فاقرأ المجموعة الرأسية كاملة.',
  ],
};

// x: fraction along the hull, stern 0 to bow 1. l: height above deck, in light spacings.
const SIDE = {x: 0.58, l: 0.45, c: 'g'}, STERN = {x: 0.03, l: 0.45, c: 'w'};
const stack = (x, colors, base = 1) => colors.map((c, i) => ({x, l: base + colors.length - 1 - i, c}));
const shapes = (x, kinds, base = 1) => kinds.map((s, i) => ({x, l: base + kinds.length - 1 - i, s}));
const RWR = stack(0.45, ['r', 'w', 'r']), BDB = shapes(0.45, ['ball', 'diamond', 'ball']);
const CONES = shapes(0.45, ['coneDown', 'coneUp']);
const ROWS = {
  sailing: {night: [SIDE, STERN]},
  sailOptional: {night: [...stack(0.45, ['r', 'g'], 2.6), SIDE, STERN]},
  motorSailing: {night: [{x: 0.62, l: 3, c: 'w'}, SIDE, STERN], day: shapes(0.45, ['coneDown'], 2.5)},
  nuc: {night: stack(0.45, ['r', 'r'], 2), day: shapes(0.45, ['ball', 'ball'], 2)},
  ram: {night: RWR, day: BDB},
  fishing: {night: stack(0.45, ['r', 'w'], 2), day: CONES},
  trawling: {night: stack(0.45, ['g', 'w'], 2), day: CONES},
  cbd: {night: RWR.map(p => ({...p, c: 'r'})), day: shapes(0.45, ['cylinder'], 2)},
  powerSmall: {night: [{x: 0.7, l: 3, c: 'w'}, SIDE, STERN]},
  powerLarge: {night: [{x: 0.78, l: 2.2, c: 'w'}, {x: 0.32, l: 3.4, c: 'w'}, SIDE, STERN]},
  ramWay: {night: [{x: 0.75, l: 3.4, c: 'w'}, ...RWR, SIDE, STERN], day: BDB},
  anchorSmall: {night: [{x: 0.88, l: 2.4, c: 'w'}], day: shapes(0.88, ['ball'], 2.4)},
  anchorLarge: {night: [{x: 0.9, l: 3, c: 'w'}, {x: 0.06, l: 1.6, c: 'w'}], day: shapes(0.9, ['ball'], 3)},
  aground: {night: [{x: 0.9, l: 3, c: 'w'}, {x: 0.06, l: 1.6, c: 'w'}, ...stack(0.45, ['r', 'r'], 2)], day: shapes(0.45, ['ball', 'ball', 'ball'])},
  towShort: {night: [...stack(0.75, ['w', 'w'], 2.4), SIDE, STERN, {x: 0.03, l: 1.45, c: 'y'}]},
  towLong: {night: [...stack(0.75, ['w', 'w', 'w'], 1.6), SIDE, STERN, {x: 0.03, l: 1.45, c: 'y'}], day: shapes(0.45, ['diamond'], 2.5)},
  towed: {night: [SIDE, STERN], day: shapes(0.45, ['diamond'], 2.5)},
  pushing: {night: [...stack(0.75, ['w', 'w'], 2.4), SIDE, STERN]},
  tugRestricted: {night: [...stack(0.78, ['w', 'w'], 2.4), ...RWR, SIDE, STERN, {x: 0.03, l: 1.45, c: 'y'}], day: BDB},
  pilot: {night: [...stack(0.45, ['w', 'r'], 2.4), SIDE, STERN]},
  pilotAnchor: {night: [...stack(0.45, ['w', 'r'], 2.4), {x: 0.88, l: 1.6, c: 'w'}], day: shapes(0.88, ['ball'], 1.6)},
  diving: {night: RWR, day: shapes(0.45, ['flagA'], 2)},
  // Seen from astern: the blocked side carries reds or balls, the passing side greens or diamonds.
  dredger: {view: 'end', night: [...RWR.map(p => ({...p, x: 0.5, l: p.l + 0.4})), ...stack(0.2, ['r', 'r'], 1), ...stack(0.8, ['g', 'g'], 1)], day: [...BDB.map(p => ({...p, x: 0.5, l: p.l + 0.4})), ...shapes(0.2, ['ball', 'ball'], 1), ...shapes(0.8, ['diamond', 'diamond'], 1)], marks: true},
  gear: {night: [...stack(0.45, ['r', 'w'], 2), {x: 0.12, l: 1, c: 'w'}], day: [...CONES, {x: 0.12, l: 1, s: 'coneUp'}]},
  hovercraft: {night: [{x: 0.7, l: 3, c: 'w'}, {x: 0.42, l: 2.4, c: 'y', flash: true}, SIDE, STERN]},
};
const VARIANTS = {
  sailing: ['sailing', 'sailOptional', 'motorSailing'],
  status: ['nuc', 'ram', 'fishing', 'trawling', 'cbd'],
  when: ['sailing', 'powerSmall', 'motorSailing'],
  large: ['powerSmall', 'powerLarge', 'ramWay'],
  anchored: ['anchorSmall', 'anchorLarge'],
  aground: ['anchorLarge', 'aground', 'nuc'],
  tow: ['towShort', 'towLong', 'towed'],
  push: ['pushing', 'towShort', 'tugRestricted'],
  pilot: ['pilot', 'pilotAnchor'],
  diving: ['diving', 'ram'],
  dredger: ['dredger', 'ram'],
  gear: ['fishing', 'gear'],
  hovercraft: ['hovercraft', 'powerSmall'],
};
const COLORS = {w: '#fff8dc', r: '#ff5145', g: '#3fdc72', y: '#ffc12e'};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
let serial = 0;

export const statusLightVariants = Object.keys(VARIANTS);
export const isStatusLightsFigure = figure => /^status-lights:/.test(String(figure ?? ''));
export const statusLightsCaption = (lang = 'en') => words.caption[localeIndex(lang)];

function shape(kind, x, y) {
  const ink = '#16232a';
  if (kind === 'ball') return `<circle cx="${x}" cy="${y}" r="6.5" fill="${ink}"/>`;
  if (kind === 'diamond') return `<path d="M${x} ${y - 8}L${x + 6} ${y}L${x} ${y + 8}L${x - 6} ${y}Z" fill="${ink}"/>`;
  if (kind === 'coneDown') return `<path d="M${x - 7} ${y - 6}H${x + 7}L${x} ${y + 7}Z" fill="${ink}"/>`;
  if (kind === 'coneUp') return `<path d="M${x - 7} ${y + 6}H${x + 7}L${x} ${y - 7}Z" fill="${ink}"/>`;
  if (kind === 'cylinder') return `<rect x="${x - 5}" y="${y - 9}" width="10" height="18" fill="${ink}"/>`;
  // Code flag A: white at the hoist, blue swallow-tailed fly.
  return `<path d="M${x - 10} ${y - 9}V${y + 12}" stroke="${ink}" stroke-width="1.5"/><rect x="${x - 10}" y="${y - 9}" width="9" height="13" fill="#fff" stroke="${ink}" stroke-width=".8"/><path d="M${x - 1} ${y - 9}H${x + 12}L${x + 6} ${y - 2.5}L${x + 12} ${y + 4}H${x - 1}Z" fill="#1f4fa8" stroke="${ink}" stroke-width=".8"/>`;
}

function panel(x, y, w, h, row, side, t, rtl) {
  const night = side === 'night', items = row[side] ?? [];
  const base = y + h - (row.marks ? 18 : 12), left = x + 22, length = w - 44, step = 15;
  const px = f => (left + f * length).toFixed(1), py = l => (base - 9 - l * step).toFixed(1);
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${night ? '#13283a' : '#dce9ee'}"/>`;
  out += row.view === 'end'
    ? `<path d="M${x + w / 2 - 34} ${base - 9}H${x + w / 2 + 34}L${x + w / 2 + 22} ${base}H${x + w / 2 - 22}Z" fill="${night ? '#2d4658' : '#8aa1ab'}"/><path d="M${px(0.2)} ${py(1.4)}H${px(0.8)}" stroke="${night ? '#3e5a6e' : '#71878f'}" stroke-width="1.5"/>`
    : `<path d="M${left - 6} ${base - 11}H${left + length + 14}L${left + length - 4} ${base + 2}H${left + 4}Z" fill="${night ? '#2d4658' : '#8aa1ab'}"/>`;
  // A faint mast under every column of lights or shapes.
  const masts = new Map();
  for (const p of items) masts.set(p.x, Math.max(masts.get(p.x) ?? 0, p.l));
  for (const [mx, top] of masts) if (top > 1) out += `<path d="M${px(mx)} ${base - 9}V${py(top)}" stroke="${night ? '#3e5a6e' : '#71878f'}" stroke-width="1.5"/>`;
  if (!items.length) {
    out += `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" fill="#40606b" font-size="14" font-weight="600" direction="${rtl ? 'rtl' : 'ltr'}">${escape(t('none'))}</text>`;
  }
  for (const p of items) {
    const cx = px(p.x), cy = py(p.l);
    if (night) {
      const color = COLORS[p.c];
      out += `<circle cx="${cx}" cy="${cy}" r="8.5" fill="${color}" opacity=".22"/><circle cx="${cx}" cy="${cy}" r="5" fill="${color}"/>`;
      if (p.flash) out += `<circle cx="${cx}" cy="${cy}" r="8.5" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    } else out += shape(p.s, Number(cx), Number(cy));
  }
  if (row.marks) {
    const label = (f, key) => `<text x="${px(f)}" y="${base + 9}" text-anchor="middle" fill="${night ? '#b7cad3' : '#40606b'}" font-size="11" font-weight="600" direction="${rtl ? 'rtl' : 'ltr'}">${escape(t(key))}</text>`;
    out += label(0.2, 'blocked') + label(0.8, 'pass');
  }
  return out;
}

/** `figure` is "status-lights:<variant>"; unknown variants fall back to the status rows. */
export function renderStatusLightsFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4;
  const variant = String(figure).split(':')[1], keys = VARIANTS[variant] ?? VARIANTS.status;
  const t = key => words[key][index], id = `status-lights-${locale}-${++serial}`;
  const rowH = 104, top = 74, height = top + keys.length * rowH + 8;
  const textX = rtl ? 740 : 20, nightX = rtl ? 270 : 260, dayX = rtl ? 20 : 510, panelW = 230;
  const textAt = (x, y, value, {size = 15, fill = '#173a4d', weight = 600, anchor = 'start', max = 24} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  let art = textAt(380, 34, t('title'), {size: 22, anchor: 'middle', max: 60});
  art += textAt(nightX + panelW / 2, 64, t('night'), {size: 14, anchor: 'middle', fill: '#40606b'});
  art += textAt(dayX + panelW / 2, 64, t('day'), {size: 14, anchor: 'middle', fill: '#40606b'});
  keys.forEach((key, i) => {
    const y = top + i * rowH, row = ROWS[key];
    art += `<g data-status-row="${key}">${textAt(textX, y + rowH / 2 - 4, t(key))}`;
    art += panel(nightX, y, panelW, rowH - 10, row, 'night', t, rtl) + panel(dayX, y, panelW, rowH - 10, row, 'day', t, rtl) + '</g>';
  });
  const description = `${keys.map(t).join('; ')}. ${t('caption')}`;
  return `<svg class="teaching-figure" data-figure="status-lights" data-variant="${escape(VARIANTS[variant] ? variant : 'status')}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" width="760" height="${height}" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(t('title'))}</title><desc id="${id}-desc">${escape(description)}</desc><rect width="760" height="${height}" rx="14" fill="#f4f7f3"/>${art}</svg>`;
}
