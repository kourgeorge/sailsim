// Velocity arrows show travel direction, not the wind-from convention of the dial.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  title: ['30 knots in a 20-knot wind', '30 nudos con viento de 20', '30 nœuds dans un vent de 20', '30 узлов при ветре 20 узлов', '30 קשר ברוח של 20 קשר', '30 عقدة في رياح سرعتها 20 عقدة'],
  boat: ['Boat velocity', 'Velocidad del barco', 'Vitesse du bateau', 'Скорость яхты', 'מהירות הסירה', 'سرعة القارب'],
  true: ['True airflow', 'Flujo de aire real', 'Écoulement réel', 'Истинный поток воздуха', 'זרימת אוויר אמיתית', 'تدفق الهواء الحقيقي'],
  apparent: ['Apparent airflow', 'Flujo de aire aparente', 'Écoulement apparent', 'Вымпельный поток воздуха', 'זרימת אוויר מדומה', 'تدفق الهواء الظاهري'],
  reference: ['No current or leeway · airflow = true wind − boat velocity', 'Sin corriente ni abatimiento · aire aparente = viento real − velocidad del barco', 'Sans courant ni dérive · vent apparent = vent réel − vitesse du bateau', 'Без течения и дрейфа · вымпельный ветер = истинный − скорость яхты', 'ללא זרם או סטייה · רוח מדומה = רוח אמיתית − מהירות הסירה', 'دون تيار أو انزلاق جانبي · الرياح الظاهرية = الحقيقية − سرعة القارب'],
  caption: [
    'Assume a boat moving north at 30 knots and wind blowing east at 20 knots, with no current or leeway. Apparent airflow travels southeast at about 36.1 knots, arriving about 34° to port of the bow. Arrows show where air travels. This velocity calculation assumes the boat speed; achievable speed also depends on sail force and resistance.',
    'Se supone un barco que avanza al norte a 30 nudos y viento hacia el este a 20, sin corriente ni abatimiento. El aire aparente va al sureste a unos 36,1 nudos y llega unos 34° por babor de la proa. Las flechas indican hacia dónde viaja el aire. El cálculo supone la velocidad del barco; alcanzarla depende de la fuerza vélica y la resistencia.',
    'On suppose un bateau allant au nord à 30 nœuds et un vent soufflant vers l’est à 20, sans courant ni dérive. L’air apparent va au sud-est à environ 36,1 nœuds et arrive à environ 34° sur bâbord avant. Les flèches indiquent le déplacement de l’air. La vitesse du bateau est une hypothèse ; l’atteindre dépend de la force vélique et de la résistance.',
    'Предположим, яхта идёт на север со скоростью 30 узлов, а ветер дует на восток со скоростью 20, без течения и дрейфа. Вымпельный поток направлен на юго-восток со скоростью около 36,1 узла и приходит примерно под 34° слева от носа. Стрелки показывают движение воздуха. Скорость яхты задана; её достижение зависит от тяги парусов и сопротивления.',
    'נניח שהסירה נעה צפונה ב־30 קשר והרוח נושבת מזרחה ב־20 קשר, ללא זרם או סטייה הצדה. האוויר היחסי נע לדרום־מזרח בכ־36.1 קשר ומגיע בכ־34° משמאל לחרטום. החצים מראים לאן האוויר נע. מהירות הסירה היא נתון בדוגמה; השגתה תלויה בכוח המפרשים ובהתנגדות.',
    'نفترض قاربًا يتحرك شمالًا بسرعة 30 عقدة ورياحًا تهب شرقًا بسرعة 20 عقدة، دون تيار أو انزلاق جانبي. يتجه الهواء الظاهري إلى الجنوب الشرقي بنحو 36.1 عقدة ويأتي من زاوية نحو 34° إلى يسار المقدمة. توضح الأسهم اتجاه حركة الهواء. سرعة القارب مفترضة؛ تحقيقها يعتمد على قوة الشراع والمقاومة.',
  ],
};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let serial = 0;
export const apparentWindCaption = (lang = 'en') => words.caption[localeIndex(lang)];
export function renderApparentWindFigure(lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], id = `wind-example-${++serial}`;
  const colors = ['#246482', '#167569', '#925b0c'];
  const text = (x, y, value, size = 19, color = '#173a4d', ltr = false, max = 30) => {
    const lines = [];
    for (const word of value.split(/\s+/)) {
      if (!lines.length || `${lines.at(-1)} ${word}`.length > max) lines.push(word);
      else lines[lines.length - 1] += ` ${word}`;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" fill="${color}" font-weight="600" direction="${index >= 4 && !ltr ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, n) => `<tspan x="${x}" dy="${n ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const arrow = (kind, x, y, color) => `<path data-wind-vector="${kind}" d="M210 204L${x} ${y}" fill="none" stroke="${colors[color]}" stroke-width="4" marker-end="url(#${id}-arrow-${color})"/>`;
  let art = text(380, 32, words.title[index], 24, '#173a4d', false, 65);
  art += `<path d="M210 190C183 219 183 248 189 261H231C237 248 237 219 210 190Z" fill="#f8faf5" stroke="#81949b" stroke-width="2"/>`;
  art += arrow('boat', 210, 84, 0) + arrow('true', 290, 204, 1) + arrow('apparent', 290, 324, 2);
  art += `<path d="M290 204V324" fill="none" stroke="#81949b" stroke-width="2" stroke-dasharray="6 5"/>`;
  art += text(143, 102, '30 kn', 20, colors[0], true) + text(267, 184, '20 kn', 20, colors[1], true) + text(321, 345, '36.1 kn', 20, colors[2], true);
  ['boat', 'true', 'apparent'].forEach((key, n) => {
    art += text(544, 104 + n * 91, words[key][index], 19, colors[n]);
    art += text(544, 147 + n * 91, ['30 kn', '20 kn', '≈ 36.1 kn'][n], 25, colors[n], true);
  });
  art += text(380, 374, '√(20² + 30²) ≈ 36.1 kn', 21, '#173a4d', true, 60);
  art += text(380, 404, words.reference[index], 13, '#173a4d', false, 100);
  return `<svg class="teaching-figure" data-figure="faster-than-wind" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 440" width="760" height="440" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(words.title[index])}</title><desc id="${id}-desc">${escape(apparentWindCaption(locale))}</desc><defs>${colors.map((color, n) => `<marker id="${id}-arrow-${n}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')}</defs><rect width="760" height="440" rx="20" fill="#e1e9dd"/><g aria-hidden="true">${art}</g></svg>`;
}
