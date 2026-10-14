// Ropes teaching figures: rope fibres and their jobs, wire construction, and
// counting the parts of a block and tackle. Schematic only.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  typesTitle: ['Which rope for which job', 'Qué cabo para cada uso', 'Quel cordage pour quel usage', 'Какой трос для чего', 'איזה חבל לאיזה תפקיד', 'أي حبل لأي مهمة'],
  nylon: ['Nylon', 'Nailon', 'Nylon', 'Нейлон', 'ניילון', 'نايلون'],
  nylonUse: ['Stretches, absorbs shocks: anchor and mooring lines', 'Estira y absorbe tirones: fondeo y amarras', 'S’étire, amortit : mouillage et amarrage', 'Растягивается, гасит рывки: якорные и швартовные концы', 'נמתח ובולם טלטלות: עוגן ועגינה', 'يتمدد ويمتص الهزات: المرساة والرسو'],
  polyester: ['Polyester', 'Poliéster', 'Polyester', 'Полиэстер', 'פוליאסטר', 'بوليستر'],
  polyesterUse: ['Stretches little: sheets and halyards', 'Estira poco: escotas y drizas', 'S’étire peu : écoutes et drisses', 'Почти не тянется: шкоты и фалы', 'נמתח מעט: מיתרים ומעלנים', 'قليل التمدد: حبال الضبط والرفع'],
  polypropylene: ['Polypropylene', 'Polipropileno', 'Polypropylène', 'Полипропилен', 'פוליפרופילן', 'بولي بروبيلين'],
  polypropyleneUse: ['Floats: rescue throwing line; weak in sunlight', 'Flota: guía de rescate; se debilita al sol', 'Flotte : ligne de sauvetage ; craint le soleil', 'Плавает: спасательный конец; боится солнца', 'צף: חבל הצלה לזריקה; נחלש בשמש', 'يطفو: حبل الإنقاذ؛ تضعفه الشمس'],
  aramid: ['Kevlar, Dyneema', 'Kevlar, Dyneema', 'Kevlar, Dyneema', 'Кевлар, дайнима', 'קוולר, דיינימה', 'كيفلار ودينيما'],
  aramidUse: ['Strongest for its size, hardly stretches', 'El más resistente para su grosor, casi no estira', 'Le plus solide à diamètre égal, presque sans allongement', 'Самый прочный на свою толщину, почти не тянется', 'החזק ביותר לפי עובי, כמעט לא נמתח', 'الأقوى بالنسبة لسمكه ولا يكاد يتمدد'],
  stretch: ['Stretch', 'Elasticidad', 'Allongement', 'Растяжение', 'מתיחות', 'التمدد'],
  strength: ['Strength', 'Resistencia', 'Résistance', 'Прочность', 'חוזק', 'المتانة'],
  wireTitle: ['Wire rope: strands and wires', 'Cable: cordones y alambres', 'Câble : torons et fils', 'Стальной трос: пряди и проволоки', 'כבל פלדה: גדילים וחוטים', 'الحبل السلكي: الجدائل والأسلاك'],
  w119: ['1×19: one strand of 19 wires. Stiff, low stretch: shrouds and guardrails', '1×19: un cordón de 19 alambres. Rígido, poco elástico: obenques y guardamancebos', '1×19 : un toron de 19 fils. Rigide, peu d’allongement : haubans et filières', '1×19: одна прядь из 19 проволок. Жёсткий, мало тянется: ванты и леера', '1×19: גדיל אחד של 19 חוטים. קשיח ומעט נמתח: ונטים ומעקות', '1×19: جديلة واحدة من 19 سلكًا. صلب وقليل التمدد: الأشرطة والحواجز'],
  w719: ['7×19: seven strands of 19 wires. Flexible: running rigging round sheaves', '7×19: siete cordones de 19 alambres. Flexible: jarcia de labor por roldanas', '7×19 : sept torons de 19 fils. Souple : manœuvres courantes sur réas', '7×19: семь прядей по 19 проволок. Гибкий: бегучий такелаж через шкивы', '7×19: שבעה גדילים של 19 חוטים. גמיש: חבלים נעים סביב גלגלות', '7×19: سبع جدائل من 19 سلكًا. مرن: الحبال المتحركة حول البكرات'],
  w612: ['A marking such as 6/12 means 6 strands of 12 wires each', 'Una marca como 6/12 significa 6 cordones de 12 alambres', 'Un marquage comme 6/12 signifie 6 torons de 12 fils', 'Маркировка вроде 6/12 означает 6 прядей по 12 проволок', 'סימון כמו 6/12 פירושו 6 גדילים של 12 חוטים כל אחד', 'علامة مثل 6/12 تعني 6 جدائل في كل منها 12 سلكًا'],
  tackleTitle: ['Counting a block and tackle', 'Contar un aparejo', 'Compter un palan', 'Как считать тали', 'ספירת מערכת גלגלות', 'حساب البكرات'],
  fixed: ['Fixed block', 'Motón fijo', 'Poulie fixe', 'Неподвижный блок', 'גלגלת קבועה', 'البكرة الثابتة'],
  moving: ['Moving block', 'Motón móvil', 'Poulie mobile', 'Подвижный блок', 'גלגלת נעה', 'البكرة المتحركة'],
  parts4: ['4 parts: 320 kg needs 80 kg', '4 guarnes: 320 kg requieren 80 kg', '4 brins : 320 kg demandent 80 kg', '4 лопаря: для 320 кг нужно 80 кг', '4 חלקים: 320 ק״ג דורשים 80 ק״ג', '4 أجزاء: 320 كغ تحتاج 80 كغ'],
  parts5: ['Rope leaving the moving block: 5 parts, 5 to 1', 'Cabo que sale del motón móvil: 5 guarnes, 5 a 1', 'Brin sortant de la poulie mobile : 5 brins, 5 pour 1', 'Конец идёт от подвижного блока: 5 лопарей, 5 к 1', 'החבל יוצא מהגלגלת הנעה: 5 חלקים, יחס 5 ל־1', 'الحبل يخرج من البكرة المتحركة: 5 أجزاء، 5 إلى 1'],
  pull: ['Pull', 'Tiro', 'Traction', 'Тяга', 'משיכה', 'السحب'],
  load: ['Load', 'Carga', 'Charge', 'Груз', 'משא', 'الحمل'],
  typesCaption: [
    'Choose the fibre for the job: nylon stretches and absorbs shocks, polyester holds its length, polypropylene floats, and aramid fibres are the strongest for their size.',
    'Elige la fibra según el uso: el nailon estira y absorbe tirones, el poliéster mantiene su longitud, el polipropileno flota y las fibras de aramida son las más resistentes para su grosor.',
    'Choisissez la fibre selon l’usage : le nylon s’étire et amortit, le polyester garde sa longueur, le polypropylène flotte, et les fibres aramides sont les plus solides à diamètre égal.',
    'Подбирайте волокно под задачу: нейлон тянется и гасит рывки, полиэстер держит длину, полипропилен плавает, арамид прочнее всего при той же толщине.',
    'בחרו סיב לפי התפקיד: ניילון נמתח ובולם טלטלות, פוליאסטר שומר על אורכו, פוליפרופילן צף, וסיבי ארמיד הם החזקים ביותר לפי עובי.',
    'اختر الألياف حسب المهمة: النايلون يتمدد ويمتص الهزات، والبوليستر يحافظ على طوله، والبولي بروبيلين يطفو، وألياف الأراميد الأقوى بالنسبة لسمكها.',
  ],
  wireCaption: [
    'Cross-sections of two common wires. The first number is the number of strands, the second the wires in each strand.',
    'Secciones de dos cables habituales. El primer número es el de cordones; el segundo, los alambres de cada cordón.',
    'Coupes de deux câbles courants. Le premier nombre indique les torons, le second les fils de chaque toron.',
    'Сечения двух распространённых тросов. Первое число — количество прядей, второе — проволок в каждой пряди.',
    'חתכים של שני כבלים נפוצים. המספר הראשון הוא מספר הגדילים, השני מספר החוטים בכל גדיל.',
    'مقطعان لحبلين سلكيين شائعين. الرقم الأول عدد الجدائل والثاني عدد الأسلاك في كل جديلة.',
  ],
  tackleCaption: [
    'The gain equals the number of rope parts holding up the moving block. Ignoring friction, the pull is the load divided by that number.',
    'La ganancia es igual al número de guarnes que sostienen el motón móvil. Sin contar el rozamiento, el tiro es la carga dividida por ese número.',
    'Le gain est égal au nombre de brins qui soutiennent la poulie mobile. Sans frottement, la traction est la charge divisée par ce nombre.',
    'Выигрыш равен числу лопарей, держащих подвижный блок. Без учёта трения тяга равна грузу, делённому на это число.',
    'היחס שווה למספר חלקי החבל שמחזיקים את הגלגלת הנעה. בלי חיכוך, המשיכה היא המשא חלקי המספר הזה.',
    'الربح يساوي عدد أجزاء الحبل التي تحمل البكرة المتحركة. وبإهمال الاحتكاك، السحب هو الحمل مقسومًا على ذلك العدد.',
  ],
};
const VARIANTS = ['types', 'wire', 'tackle'];
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d';
let serial = 0;

export const ropesVariants = VARIANTS;
export const isRopesFigure = figure => /^ropes:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'types');
export const ropesCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

function types(t, text, rtl) {
  // Each row: rope sample, name, use, and two small bars for stretch and strength.
  const rows = [['nylon', '#f2f2ee', 5, 3], ['polyester', '#2f5fb3', 2, 3], ['polypropylene', '#f2c230', 3, 2], ['aramid', '#d9b44a', 1, 5]];
  const nameX = rtl ? 600 : 160, useX = rtl ? 360 : 400, barX = rtl ? 40 : 620;
  let art = text(barX + 30, 82, t('stretch'), {size: 12, fill: '#5c7480', max: 12}) + text(barX + 90, 82, t('strength'), {size: 12, fill: '#5c7480', max: 12});
  rows.forEach(([key, color, stretch, strength], i) => {
    const y = 104 + i * 76, sx = rtl ? 690 : 40;
    art += `<rect x="24" y="${y}" width="712" height="66" rx="10" fill="${i % 2 ? '#eef4f2' : '#f7faf8'}"/>`;
    // A short length of three-strand rope.
    let rope = '';
    for (let k = 0; k < 6; k++) rope += `<path d="M${sx + k * 9} ${y + 22}l9 22" stroke="${INK}" stroke-width="1" opacity=".5"/>`;
    art += `<rect x="${sx}" y="${y + 22}" width="54" height="22" rx="11" fill="${color}" stroke="${INK}"/>` + rope;
    art += text(nameX, y + 38, t(key), {size: 15, max: 16}) + text(useX, y + 30, t(`${key}Use`), {size: 12, weight: 500, max: 34});
    for (const [n, x0] of [[stretch, barX], [strength, barX + 62]]) for (let k = 0; k < 5; k++) art += `<rect x="${x0 + k * 11}" y="${y + 28}" width="8" height="12" rx="2" fill="${k < n ? '#2f6f62' : '#d4dedb'}"/>`;
  });
  return art;
}

function wire(t, text) {
  const circle = (x, y, r, fill) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width=".8"/>`;
  const strand = (cx, cy, r, fill) => {
    // 19 wires: 1 + 6 + 12 in rings.
    let out = circle(cx, cy, r, fill);
    for (let k = 0; k < 6; k++) out += circle(cx + Math.cos(k * Math.PI / 3) * r * 2, cy + Math.sin(k * Math.PI / 3) * r * 2, r, fill);
    for (let k = 0; k < 12; k++) out += circle(cx + Math.cos(k * Math.PI / 6) * r * 4, cy + Math.sin(k * Math.PI / 6) * r * 4, r, fill);
    return out;
  };
  let art = `<rect x="24" y="60" width="350" height="290" rx="12" fill="#eef4f2"/><rect x="386" y="60" width="350" height="290" rx="12" fill="#eef4f2"/>`;
  art += strand(199, 190, 14, '#c9d2d6') + text(199, 312, t('w119'), {size: 12, max: 40});
  let seven = strand(561, 190, 5, '#c9d2d6');
  for (let k = 0; k < 6; k++) seven += strand(561 + Math.cos(k * Math.PI / 3) * 46, 190 + Math.sin(k * Math.PI / 3) * 46, 5, '#c9d2d6');
  art += seven + text(561, 312, t('w719'), {size: 12, max: 40});
  art += text(380, 392, t('w612'), {size: 14, fill: '#2f6f62', max: 70});
  return art;
}

function tackle(t, text) {
  const block = (x, y, sheaves, label) => {
    let out = `<path d="M${x} ${y - 46}V${y - 26}" stroke="${INK}" stroke-width="3"/><rect x="${x - 30}" y="${y - 26}" width="60" height="52" rx="12" fill="#e5e0d2" stroke="${INK}" stroke-width="2"/>`;
    for (let k = 0; k < sheaves; k++) out += `<circle cx="${x - (sheaves - 1) * 9 + k * 18}" cy="${y}" r="8" fill="#fff" stroke="${INK}"/>`;
    return out + text(x + 92, y + 5, label, {size: 12, weight: 500, max: 16});
  };
  // Left: a 4-part tackle lifting 320 kg. Right: two double blocks, rope off the moving block, 5 parts.
  let art = '';
  for (const [x0, parts, caption] of [[190, 4, 'parts4'], [560, 5, 'parts5']]) {
    art += `<path d="M${x0 - 120} 74H${x0 + 120}" stroke="#8a7a5a" stroke-width="6"/>` + block(x0, 120, 2, t('fixed')) + block(x0, 290, parts === 5 ? 2 : 2, t('moving'));
    for (let k = 0; k < 4; k++) {
      const x = x0 - 27 + k * 18;
      art += `<path d="M${x} 146V264" stroke="#b5651d" stroke-width="2.5"/>`;
    }
    // The hauling part: from the fixed block for 4:1, from the moving block for 5:1.
    art += parts === 5
      ? `<path d="M${x0 + 30} 290H${x0 + 48}V150" fill="none" stroke="#b5651d" stroke-width="2.5"/>` + `<path d="M${x0 + 42} 160l6 -12l6 12Z" fill="#b5651d"/>`
      : `<path d="M${x0 + 30} 120H${x0 + 48}V250" fill="none" stroke="#b5651d" stroke-width="2.5"/>` + `<path d="M${x0 + 42} 240l6 12l6 -12Z" fill="#b5651d"/>`;
    art += text(x0 + 70, parts === 5 ? 150 : 262, t('pull'), {size: 11, fill: '#b5651d'});
    art += `<path d="M${x0} 316V336" stroke="${INK}" stroke-width="3"/><rect x="${x0 - 40}" y="336" width="80" height="30" rx="6" fill="#5c7480"/>` + text(x0, 356, `${t('load')}`, {size: 12, fill: '#fff'});
    art += text(x0, 396, t(caption), {size: 13, max: 36});
  }
  return art;
}

/** `figure` is "ropes:<variant>"; unknown variants fall back to rope types. */
export function renderRopesFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index], id = `ropes-${locale}-${++serial}`;
  // Wire sizes such as 1×19 and 6/12 stay left-to-right inside Hebrew and Arabic text.
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).replace(/\d+[×/]\d+/g, m => (rtl ? `\u2066${m}\u2069` : m)).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = {types, wire, tackle}[variant](t, text, rtl);
  return `<svg class="teaching-figure" data-figure="ropes" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(ropesCaption(figure, lang))}</desc><rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 36, title, {size: 21, max: 60})}${body}</svg>`;
}
