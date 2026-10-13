// Buoyage card: IALA Region A lateral marks at a harbor entrance, and the four
// cardinal marks around a danger. Geometry is north-up and never mirrors in RTL.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  lateralTitle: ['Lateral marks, IALA Region A', 'Marcas laterales, región A de IALA', 'Marques latérales, région A de l’AISM', 'Латеральные знаки, регион A МАМС', 'מצופי צד, אזור A של IALA', 'العلامات الجانبية، المنطقة A في IALA'],
  cardinalTitle: ['Cardinal marks around a danger', 'Marcas cardinales alrededor de un peligro', 'Marques cardinales autour d’un danger', 'Кардинальные знаки вокруг опасности', 'מצופים קרדינליים סביב סכנה', 'العلامات الاتجاهية حول خطر'],
  fromSea: ['Coming in from sea', 'Entrando desde el mar', 'En venant du large', 'Вход с моря', 'נכנסים מהים', 'الدخول من البحر'],
  harbor: ['Harbor', 'Puerto', 'Port', 'Гавань', 'נמל', 'الميناء'],
  port: ['Port-hand mark: red can, red light', 'Marca de babor: cilindro rojo, luz roja', 'Marque bâbord : cylindre rouge, feu rouge', 'Левый знак: красный цилиндр, красный огонь', 'מצוף שמאל: גליל אדום, אור אדום', 'علامة اليسار: أسطوانة حمراء وضوء أحمر'],
  starboard: ['Starboard-hand mark: green cone, green light', 'Marca de estribor: cono verde, luz verde', 'Marque tribord : cône vert, feu vert', 'Правый знак: зелёный конус, зелёный огонь', 'מצוף ימין: חרוט ירוק, אור ירוק', 'علامة اليمين: مخروط أخضر وضوء أخضر'],
  keepLeft: ['Keep it on your left', 'Déjala a tu izquierda', 'Laissez-la à gauche', 'Оставляйте слева', 'השאירו משמאלכם', 'اتركها على يسارك'],
  keepRight: ['Keep it on your right', 'Déjala a tu derecha', 'Laissez-la à droite', 'Оставляйте справа', 'השאירו מימינכם', 'اتركها على يمينك'],
  regionB: ['Region B reverses the colors', 'La región B invierte los colores', 'La région B inverse les couleurs', 'В регионе B цвета наоборот', 'באזור B הצבעים הפוכים', 'المنطقة B تعكس الألوان'],
  danger: ['Danger', 'Peligro', 'Danger', 'Опасность', 'סכנה', 'خطر'],
  passNorth: ['Pass north', 'Pasa por el norte', 'Passez au nord', 'Проходите севернее', 'עברו מצפון', 'مرّ شمالًا'],
  passEast: ['Pass east', 'Pasa por el este', 'Passez à l’est', 'Проходите восточнее', 'עברו ממזרח', 'مرّ شرقًا'],
  passSouth: ['Pass south', 'Pasa por el sur', 'Passez au sud', 'Проходите южнее', 'עברו מדרום', 'مرّ جنوبًا'],
  passWest: ['Pass west', 'Pasa por el oeste', 'Passez à l’ouest', 'Проходите западнее', 'עברו ממערב', 'مرّ غربًا'],
  lateralCaption: [
    'Region A, coming in from sea: red can marks stay on your left and green cone marks on your right. A harbor entrance follows the same rule. Region B reverses the colors.',
    'Región A, entrando desde el mar: las marcas rojas cilíndricas quedan a tu izquierda y las verdes cónicas a tu derecha. La entrada de un puerto sigue la misma regla. La región B invierte los colores.',
    'Région A, en venant du large : les marques rouges cylindriques restent à gauche et les vertes coniques à droite. L’entrée d’un port suit la même règle. La région B inverse les couleurs.',
    'Регион A, вход с моря: красные цилиндрические знаки остаются слева, зелёные конические — справа. Вход в гавань подчиняется тому же правилу. В регионе B цвета наоборот.',
    'אזור A, בכניסה מהים: מצופי הגליל האדומים נשארים משמאלכם ומצופי החרוט הירוקים מימינכם. כניסה לנמל פועלת לפי אותו כלל. באזור B הצבעים הפוכים.',
    'المنطقة A عند الدخول من البحر: تبقى العلامات الحمراء الأسطوانية على يسارك والخضراء المخروطية على يمينك. ويتبع مدخل الميناء القاعدة نفسها. المنطقة B تعكس الألوان.',
  ],
  cardinalCaption: [
    'Each mark is named for the side of the danger where the safe water lies. Its two cones point toward the black band. Its white light flashes like a clock face: North continuous, East 3, South 6 plus a long flash, West 9.',
    'Cada marca lleva el nombre del lado del peligro donde está el agua segura. Sus dos conos apuntan hacia la franja negra. Su luz blanca destella como un reloj: norte continua, este 3, sur 6 y una larga, oeste 9.',
    'Chaque marque porte le nom du côté du danger où se trouvent les eaux saines. Ses deux cônes pointent vers la bande noire. Son feu blanc suit un cadran : nord continu, est 3, sud 6 plus un long, ouest 9.',
    'Каждый знак назван по стороне опасности, где лежит безопасная вода. Два его конуса указывают на чёрную полосу. Белый огонь мигает как циферблат: север непрерывно, восток 3, юг 6 и одна длинная, запад 9.',
    'כל מצוף נקרא על שם צד הסכנה שבו נמצאים המים הבטוחים. שני החרוטים שלו מצביעים אל הפס השחור. האור הלבן שלו מהבהב כמו שעון: צפון ברציפות, מזרח 3, דרום 6 ועוד הבזק ארוך, מערב 9.',
    'تُسمّى كل علامة باسم جهة الخطر التي تقع فيها المياه الآمنة. يشير مخروطاها إلى الشريط الأسود. ويومض ضوؤها الأبيض كوجه الساعة: الشمال باستمرار، والشرق 3، والجنوب 6 مع ومضة طويلة، والغرب 9.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#16232a', YELLOW = '#f2c230', RED = '#d23a2e', GREEN = '#2f9a4f';
let serial = 0;

export const isBuoyageFigure = figure => /^buoyage:/.test(String(figure ?? ''));
export const buoyageCaption = (figure, lang = 'en') =>
  words[String(figure).endsWith(':cardinal') ? 'cardinalCaption' : 'lateralCaption'][localeIndex(lang)];

const cone = (x, y, up, size = 9) => up
  ? `<path d="M${x - size} ${y + size * 0.8}H${x + size}L${x} ${y - size * 0.8}Z" fill="${INK}"/>`
  : `<path d="M${x - size} ${y - size * 0.8}H${x + size}L${x} ${y + size * 0.8}Z" fill="${INK}"/>`;

// A pillar buoy: bands top to bottom, then its two-cone top mark.
function pillar(x, y, bands, cones) {
  const h = 54, w = 22, step = h / bands.length;
  let out = `<path d="M${x - 24} ${y + h + 12}H${x + 24}L${x + 16} ${y + h}H${x - 16}Z" fill="#5d7480"/>`;
  bands.forEach((color, i) => { out += `<rect x="${x - w / 2}" y="${(y + i * step).toFixed(1)}" width="${w}" height="${step.toFixed(1)}" fill="${color}"/>`; });
  out += `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.2"/><path d="M${x} ${y}V${y - 10}" stroke="${INK}" stroke-width="2"/>`;
  out += cone(x, y - 18, cones[1]) + cone(x, y - 36, cones[0]);
  return out;
}

export function renderBuoyageFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4;
  const cardinal = String(figure).endsWith(':cardinal');
  const t = key => words[key][index], id = `buoyage-${locale}-${++serial}`;
  const text = (x, y, value, {size = 14, fill = '#173a4d', weight = 600, anchor = 'middle', max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  let art = `<rect width="760" height="430" rx="14" fill="#f4f7f3"/>`;
  if (cardinal) {
    art += text(380, 32, t('cardinalTitle'), {size: 21, max: 60});
    art += `<rect x="40" y="52" width="680" height="362" rx="12" fill="#cfe3ea"/>`;
    // The danger: a rock with breaking water around it.
    art += `<circle cx="380" cy="240" r="40" fill="none" stroke="#9db6bf" stroke-width="2" stroke-dasharray="5 5"/><path d="M358 244L367 222L380 214L394 225L402 244Z" fill="#6b5a4b"/>`;
    art += text(380, 264, t('danger'), {size: 12, fill: '#5a4636'});
    const marks = [
      {x: 380, y: 110, bands: [INK, YELLOW], cones: [true, true], label: 'N · Q', pass: 'passNorth', lx: 470, ly: 140},
      {x: 380, y: 336, bands: [YELLOW, INK], cones: [false, false], label: 'S · Q(6)+LFl', pass: 'passSouth', lx: 480, ly: 366},
      {x: 600, y: 210, bands: [INK, YELLOW, INK], cones: [true, false], label: 'E · Q(3)', pass: 'passEast', lx: 600, ly: 302},
      {x: 160, y: 210, bands: [YELLOW, INK, YELLOW], cones: [false, true], label: 'W · Q(9)', pass: 'passWest', lx: 160, ly: 302},
    ];
    for (const m of marks) {
      art += `<g data-cardinal="${m.label[0]}">${pillar(m.x, m.y, m.bands, m.cones)}`;
      art += `<text x="${m.lx}" y="${m.ly}" text-anchor="middle" fill="${INK}" font-size="15" font-weight="700" direction="ltr">${escape(m.label)}</text>`;
      art += text(m.lx, m.ly + 19, t(m.pass), {size: 13, weight: 500, fill: '#2f5560'}) + '</g>';
    }
  } else {
    art += text(380, 32, t('lateralTitle'), {size: 21, max: 60});
    // Plan view of a harbor entrance, north up, entering from the bottom.
    art += `<rect x="30" y="52" width="360" height="362" rx="12" fill="#cfe3ea"/><rect x="30" y="52" width="360" height="70" rx="12" fill="#e7dcc4"/>`;
    art += text(210, 92, t('harbor'), {size: 13, fill: '#6a5a3c'});
    art += `<path d="M30 122H170V170H150V138H30Z" fill="#8f9a9e"/><path d="M390 122H250V170H270V138H390Z" fill="#8f9a9e"/>`;
    const light = (x, y, color) => `<circle cx="${x}" cy="${y}" r="12" fill="${color}" opacity=".3"/><circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`;
    art += light(160, 172, RED) + light(260, 172, GREEN);
    // Channel marks: red cans to the left, green cones to the right.
    for (const y of [240, 320]) {
      art += `<rect x="146" y="${y - 10}" width="18" height="20" fill="${RED}" stroke="${INK}" stroke-width="1"/>`;
      art += `<path d="M256 ${y + 10}H274L265 ${y - 11}Z" fill="${GREEN}" stroke="${INK}" stroke-width="1"/>`;
    }
    art += `<path d="M210 400V200" stroke="#2f5560" stroke-width="2.5" stroke-dasharray="7 6"/><path d="M201 214L210 196L219 214Z" fill="#2f5560"/>`;
    art += `<path d="M203 404C203 388 206 378 210 372C214 378 217 388 217 404Z" fill="#fff" stroke="#2f5560" stroke-width="1.5"/>`;
    art += text(300, 398, t('fromSea'), {size: 13, fill: '#2f5560', max: 18});
    // Side views of the two marks, with what to do.
    const can = `<rect x="480" y="120" width="40" height="56" fill="${RED}" stroke="${INK}" stroke-width="1.2"/><path d="M462 188H538L530 176H470Z" fill="#5d7480"/><path d="M500 120V104" stroke="${INK}" stroke-width="2"/><rect x="491" y="88" width="18" height="16" fill="${RED}" stroke="${INK}"/>`;
    const conical = `<path d="M480 336H520L500 280Z" fill="${GREEN}" stroke="${INK}" stroke-width="1.2"/><path d="M462 348H538L530 336H470Z" fill="#5d7480"/><path d="M500 280V266" stroke="${INK}" stroke-width="2"/><path d="M490 266H510L500 248Z" fill="${GREEN}" stroke="${INK}"/>`;
    art += can + text(630, 132, t('port'), {size: 14, max: 22}) + text(630, 190, t('keepLeft'), {size: 13, weight: 500, fill: '#2f5560', max: 22});
    art += conical + text(630, 290, t('starboard'), {size: 14, max: 22}) + text(630, 348, t('keepRight'), {size: 13, weight: 500, fill: '#2f5560', max: 22});
    art += text(570, 400, t('regionB'), {size: 13, weight: 500, fill: '#6a5a3c', max: 40});
  }
  const title = t(cardinal ? 'cardinalTitle' : 'lateralTitle'), description = buoyageCaption(figure, lang);
  return `<svg class="teaching-figure" data-figure="buoyage" data-variant="${cardinal ? 'cardinal' : 'lateral'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>${art}</svg>`;
}
