// Chart-work figures: the latitude/longitude grid, the compass rose and its errors,
// a three-bearing fix, the horizon distance, the course-to-steer triangle, and the
// rule of twelfths. Schematic only, not to scale.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  gridTitle: ['Latitude, longitude and the chart scale', 'Latitud, longitud y la escala de la carta', 'Latitude, longitude et échelle de la carte', 'Широта, долгота и масштаб карты', 'קווי רוחב, קווי אורך וקנה המידה של המפה', 'خطوط العرض والطول ومقياس الخريطة'],
  equator: ['Equator 0°', 'Ecuador 0°', 'Équateur 0°', 'Экватор 0°', 'קו המשווה 0°', 'خط الاستواء 0°'],
  greenwich: ['Greenwich 0°', 'Greenwich 0°', 'Greenwich 0°', 'Гринвич 0°', 'גריניץ׳ 0°', 'غرينتش 0°'],
  latScale: ['Latitude scale: 1′ = 1 NM', 'Escala de latitud: 1′ = 1 NM', 'Échelle des latitudes : 1′ = 1 NM', 'Шкала широт: 1′ = 1 NM', 'סרגל קווי הרוחב: 1′ = 1 מייל ימי', 'مقياس خطوط العرض: 1′ = 1 NM'],
  position: ['32°05′ N, 034°46′ E', '32°05′ N, 034°46′ E', '32°05′ N, 034°46′ E', '32°05′ N, 034°46′ E', '32°05′ N, 034°46′ E', '32°05′ N, 034°46′ E'],
  noLon: ['Never measure distance on the longitude scale', 'Nunca midas distancias en la escala de longitud', 'Ne mesurez jamais une distance sur l’échelle des longitudes', 'Никогда не измеряйте расстояние по шкале долгот', 'לעולם אל תמדדו מרחק בסרגל קווי האורך', 'لا تقس المسافة أبدًا على مقياس خطوط الطول'],
  gridCaption: ['Latitude is measured north or south of the equator and longitude east or west of Greenwich. On a Mercator chart, measure distance on the latitude scale beside your position: one minute is one nautical mile.', 'La latitud se mide al norte o al sur del ecuador, y la longitud al este o al oeste de Greenwich. En una carta Mercator, mide las distancias en la escala de latitud junto a tu posición: un minuto es una milla náutica.', 'La latitude se mesure au nord ou au sud de l’équateur, et la longitude à l’est ou à l’ouest de Greenwich. Sur une carte Mercator, mesurez les distances sur l’échelle des latitudes, à hauteur de votre position : une minute vaut un mille marin.', 'Широту отсчитывают к северу или югу от экватора, а долготу — к востоку или западу от Гринвича. На карте Меркатора измеряйте расстояние по шкале широт рядом со своим местом: одна минута — одна морская миля.', 'קו רוחב נמדד צפונה או דרומה מקו המשווה, וקו אורך מזרחה או מערבה מגריניץ׳. במפת מרקטור מודדים מרחק בסרגל קווי הרוחב בגובה המיקום שלכם: דקה אחת היא מייל ימי אחד.', 'يُقاس خط العرض شمال خط الاستواء أو جنوبه، وخط الطول شرق غرينتش أو غربه. على خريطة مركاتور، قِس المسافة على مقياس خطوط العرض بمحاذاة موقعك: الدقيقة الواحدة تساوي ميلًا بحريًا واحدًا.'],
  compassTitle: ['True, magnetic and compass north', 'Norte verdadero, magnético y de compás', 'Nord vrai, nord magnétique et nord compas', 'Истинный, магнитный и компасный север', 'צפון אמיתי, מגנטי ומצפן', 'الشمال الحقيقي والمغناطيسي وشمال البوصلة'],
  trueN: ['True north', 'Norte verdadero', 'Nord vrai', 'Истинный север', 'צפון אמיתי', 'الشمال الحقيقي'],
  magN: ['Magnetic north', 'Norte magnético', 'Nord magnétique', 'Магнитный север', 'צפון מגנטי', 'الشمال المغناطيسي'],
  compN: ['Compass north', 'Norte de compás', 'Nord compas', 'Компасный север', 'צפון מצפן', 'شمال البوصلة'],
  variation: ['Variation 5° E', 'Declinación 5° E', 'Déclinaison 5° E', 'Склонение 5° E', 'סטייה 5° מזרח', 'الاختلاف 5° E'],
  deviation: ['Deviation 2° W', 'Desvío 2° W', 'Déviation 2° W', 'Девиация 2° W', 'הטיה 2° מערב', 'الانحراف 2° W'],
  rule: ['Compass → True: add East, subtract West', 'Compás → Verdadero: suma el Este, resta el Oeste', 'Compas → Vrai : ajoutez l’Est, retranchez l’Ouest', 'Компасный → истинный: восток прибавить, запад вычесть', 'ממצפן לאמיתי: מוסיפים מזרח, מחסירים מערב', 'البوصلة ← الحقيقي: أضف الشرق، واطرح الغرب'],
  compassCaption: ['Variation turns true into magnetic, and deviation turns magnetic into what your compass shows. From compass to true, add East errors and subtract West ones; from true to compass, do the opposite.', 'La declinación convierte el rumbo verdadero en magnético, y el desvío convierte el magnético en lo que marca tu compás. Del compás al verdadero, suma los errores Este y resta los Oeste; del verdadero al compás, haz lo contrario.', 'La déclinaison fait passer du vrai au magnétique, et la déviation du magnétique à ce que montre votre compas. Du compas au vrai, ajoutez les erreurs Est et retranchez les erreurs Ouest ; du vrai au compas, faites l’inverse.', 'Склонение переводит истинное направление в магнитное, а девиация — магнитное в то, что показывает компас. От компасного к истинному восточные поправки прибавляют, а западные вычитают; от истинного к компасному — наоборот.', 'הסטייה הופכת כיוון אמיתי למגנטי, וההטיה הופכת כיוון מגנטי למה שהמצפן שלכם מראה. ממצפן לאמיתי, הוסיפו שגיאות מזרחיות והחסירו מערביות; מאמיתי למצפן, עשו את ההפך.', 'الاختلاف المغناطيسي يحوّل الحقيقي إلى مغناطيسي، والانحراف يحوّل المغناطيسي إلى ما تُظهره بوصلتك. من البوصلة إلى الحقيقي، أضف الأخطاء الشرقية واطرح الغربية؛ ومن الحقيقي إلى البوصلة، افعل العكس.'],
  fixTitle: ['A three-bearing fix', 'Una situación por tres demoras', 'Un point par trois relèvements', 'Обсервация по трём пеленгам', 'קביעת מיקום משלושה תכוונים', 'تحديد الموقع بثلاثة سموت'],
  lighthouse: ['Lighthouse', 'Faro', 'Phare', 'Маяк', 'מגדלור', 'منارة'],
  tower: ['Church tower', 'Torre de iglesia', 'Clocher', 'Колокольня', 'מגדל כנסייה', 'برج كنيسة'],
  headland: ['Headland', 'Cabo', 'Cap', 'Мыс', 'לשון יבשה', 'رأس بري'],
  cocked: ['Cocked hat: use the corner nearest danger', 'Triángulo de error: usa el vértice más cercano al peligro', 'Chapeau : prenez le coin le plus proche du danger', 'Треугольник погрешностей: берите угол, ближайший к опасности', 'משולש טעות: השתמשו בפינה הקרובה לסכנה', 'مثلث الخطأ: استخدم الزاوية الأقرب إلى الخطر'],
  legend: ['DR + · EP △ · Fix ⊙', 'DR + · EP △ · Situación ⊙', 'DR + · EP △ · Point ⊙', 'DR + · EP △ · Обсервация ⊙', 'DR + · EP △ · קביעת מיקום ⊙', 'DR + · EP △ · الموقع ⊙'],
  fixCaption: ['Bearings of three well-spaced objects cross in a small triangle, the cocked hat. A small triangle is a good fix; take the corner nearest to danger until you can check it.', 'Las demoras de tres objetos bien separados se cruzan en un pequeño triángulo, el triángulo de error. Un triángulo pequeño es una buena situación; toma el vértice más cercano al peligro hasta que puedas comprobarlo.', 'Les relèvements de trois objets bien écartés se croisent en un petit triangle, le « chapeau ». Un petit triangle donne un bon point ; prenez le coin le plus proche du danger jusqu’à pouvoir le vérifier.', 'Пеленги на три хорошо разнесённых ориентира пересекаются маленьким треугольником — треугольником погрешностей. Маленький треугольник — хорошая обсервация; пока не сможете проверить, принимайте угол, ближайший к опасности.', 'תכוונים לשלושה עצמים מרוחקים זה מזה נחתכים במשולש קטן, משולש הטעות. משולש קטן הוא קביעת מיקום טובה; השתמשו בפינה הקרובה ביותר לסכנה עד שתוכלו לבדוק.', 'سموت ثلاثة معالم متباعدة جيدًا تتقاطع في مثلث صغير هو مثلث الخطأ. المثلث الصغير تحديد جيد للموقع؛ اعتمد الزاوية الأقرب إلى الخطر حتى تتمكن من التحقق.'],
  horizonTitle: ['How far can you see a light?', '¿Desde qué distancia se ve una luz?', 'À quelle distance voit-on un feu ?', 'Как далеко виден огонь?', 'מאיזה מרחק רואים אור?', 'من أي مسافة ترى الضوء؟'],
  eye: ['Eye 2.5 m: 3.3 NM', 'Ojo a 2,5 m: 3,3 NM', 'Œil 2,5 m : 3,3 NM', 'Глаз 2,5 м: 3,3 NM', 'עין בגובה 2.5 מ׳: 3.3 מייל ימי', 'العين 2.5 م: 3.3 NM'],
  tower49: ['Light 49 m: 14.6 NM', 'Luz a 49 m: 14,6 NM', 'Feu 49 m : 14,6 NM', 'Огонь 49 м: 14,6 NM', 'אור בגובה 49 מ׳: 14.6 מייל ימי', 'الضوء 49 م: 14.6 NM'],
  sum: ['Seen from up to 17.9 NM', 'Visible hasta 17,9 NM', 'Visible jusqu’à 17,9 NM', 'Виден до 17,9 NM', 'נראה עד 17.9 מייל ימי', 'يُرى من مسافة تصل إلى 17.9 NM'],
  formula: ['Distance (NM) = 2.08 × √height (m)', 'Distancia (NM) = 2,08 × √altura (m)', 'Distance (NM) = 2,08 × √hauteur (m)', 'Дальность (NM) = 2,08 × √высота (м)', 'מרחק (מייל ימי) = 2.08 × √גובה (מ׳)', 'المسافة (NM) = 2.08 × √الارتفاع (م)'],
  horizonCaption: ['Your horizon and the light’s horizon add up: 2.08 × (√2.5 + √49) ≈ 17.9 NM. You see the light at this distance or at its luminous range, whichever is shorter.', 'Tu horizonte y el horizonte de la luz se suman: 2,08 × (√2,5 + √49) ≈ 17,9 NM. Ves la luz a esta distancia o a su alcance luminoso, la que sea menor.', 'Votre horizon et celui du feu s’additionnent : 2,08 × (√2,5 + √49) ≈ 17,9 NM. Vous voyez le feu à cette distance ou à sa portée lumineuse, selon celle qui est la plus courte.', 'Ваш горизонт и горизонт огня складываются: 2,08 × (√2,5 + √49) ≈ 17,9 NM. Огонь виден на этой дальности или на его оптической дальности — смотря что меньше.', 'האופק שלכם והאופק של האור מצטרפים: 2.08 × (√2.5 + √49) ≈ 17.9 מייל ימי. תראו את האור מהמרחק הזה או מטווח האור שלו, הקצר מביניהם.', 'أفقك وأفق الضوء يُجمعان: 2.08 × (√2.5 + √49) ≈ 17.9 NM. ترى الضوء عند هذه المسافة أو عند مداه الضوئي، أيهما أقصر.'],
  currentTitle: ['The course-to-steer triangle', 'El triángulo del rumbo a gobernar', 'Le triangle du cap à suivre', 'Треугольник скоростей', 'משולש כיוון ההיגוי', 'مثلث اتجاه التوجيه'],
  pointA: ['A: start', 'A: salida', 'A : départ', 'A: начало', 'A: התחלה', 'A: البداية'],
  pointB: ['B: destination', 'B: destino', 'B : destination', 'B: пункт назначения', 'B: יעד', 'B: الوجهة'],
  currentVec: ['Current 090°, 2 kn', 'Corriente 090°, 2 nudos', 'Courant 090°, 2 kn', 'Течение 090°, 2 уз', 'זרם 090°, 2 קשר', 'التيار 090°، 2 kn'],
  steer: ['Course to steer 336°, 5 kn', 'Rumbo a gobernar 336°, 5 nudos', 'Cap à suivre 336°, 5 kn', 'Курс, которым править, 336°, 5 уз', 'כיוון היגוי 336°, 5 קשר', 'اتجاه التوجيه 336°، 5 kn'],
  ground: ['Track made good 000°, 4.6 kn', 'Derrota sobre el fondo 000°, 4,6 nudos', 'Route fond 000°, 4,6 kn', 'Путь над грунтом 000°, 4,6 уз', 'מסלול מעל הקרקע 000°, 4.6 קשר', 'المسار المحقق 000°، 4.6 kn'],
  currentCaption: ['Draw the current for one hour from A, then swing your boat speed from its end to cut the track line. That line is the course to steer; the distance along the track is your speed over the ground.', 'Dibuja desde A la corriente de una hora y, desde su extremo, abre la velocidad del barco hasta cortar la línea de la derrota. Esa línea es el rumbo a gobernar; la distancia a lo largo de la derrota es tu velocidad sobre el fondo.', 'Tracez le courant pour une heure à partir de A, puis, depuis son extrémité, reportez la vitesse du bateau jusqu’à couper la ligne de route. Cette ligne est le cap à suivre ; la distance le long de la route est votre vitesse fond.', 'От A отложите течение за один час, затем от его конца разверните скорость яхты до пересечения с линией пути. Эта линия — курс, которым нужно править; расстояние по линии пути — ваша скорость относительно грунта.', 'ציירו מ־A את הזרם לשעה אחת, ואז מקצהו פתחו את מהירות הסירה עד שתחתוך את קו המסלול. הקו הזה הוא כיוון ההיגוי; המרחק לאורך המסלול הוא המהירות שלכם מעל הקרקע.', 'ارسم التيار لساعة واحدة من A، ثم افتح سرعة قاربك من نهايته لتقطع خط المسار. هذا الخط هو اتجاه التوجيه؛ والمسافة على طول المسار هي سرعتك فوق القاع.'],
  tideTitle: ['The rule of twelfths', 'La regla de los doceavos', 'La règle des douzièmes', 'Правило двенадцатых', 'כלל השנים־עשר', 'قاعدة الأجزاء الاثني عشر'],
  hour: ['Hour', 'Hora', 'Heure', 'Час', 'שעה', 'الساعة'],
  twelfths: ['Rise in twelfths of the range', 'Subida en doceavos de la amplitud', 'Montée en douzièmes du marnage', 'Подъём в двенадцатых величины прилива', 'עלייה בחלקים של 1/12 מטווח הגאות', 'الارتفاع بأجزاء من اثني عشر من المدى'],
  utc: ['Israel: UTC+2 in winter, UTC+3 in summer', 'Israel: UTC+2 en invierno, UTC+3 en verano', 'Israël : UTC+2 en hiver, UTC+3 en été', 'Израиль: UTC+2 зимой, UTC+3 летом', 'ישראל: UTC+2 בחורף, UTC+3 בקיץ', 'إسرائيل: UTC+2 في الشتاء، وUTC+3 في الصيف'],
  tideCaption: ['From low to high water the tide rises 1, 2, 3, 3, 2 and 1 twelfths of its range in the six hours, fastest in the middle. Check whether the tide table uses UTC or local time.', 'De bajamar a pleamar, la marea sube 1, 2, 3, 3, 2 y 1 doceavos de su amplitud en las seis horas, más rápido en el medio. Comprueba si la tabla de mareas usa UTC u hora local.', 'De la basse mer à la pleine mer, la marée monte de 1, 2, 3, 3, 2 et 1 douzièmes de son marnage pendant les six heures, plus vite au milieu. Vérifiez si l’annuaire des marées utilise l’heure UTC ou l’heure locale.', 'За шесть часов от малой до полной воды уровень поднимается на 1, 2, 3, 3, 2 и 1 двенадцатую величины прилива, быстрее всего в середине. Проверьте, какое время использует таблица приливов: UTC или местное.', 'משפל לגאות המים עולים 1, 2, 3, 3, 2 ו־1 חלקים של 1/12 מטווח הגאות בשש השעות, הכי מהר באמצע. בדקו אם לוח הגאות משתמש ב־UTC או בשעון המקומי.', 'من الجزر المنخفض إلى المد العالي يرتفع الماء 1 و2 و3 و3 و2 و1 من اثني عشر جزءًا من مداه في الساعات الست، وأسرع ما يكون في المنتصف. تحقق هل يستخدم جدول المد توقيت UTC أم التوقيت المحلي.'],
};
const VARIANTS = ['grid', 'compass', 'fix', 'horizon', 'current', 'tide'];
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', RED = '#b53743', TEAL = '#087d7b', BLUE = '#176aa1', AMBER = '#925800', SEA = '#e1edf2', LAND = '#d9d2b8';
let serial = 0;

export const chartworkVariants = VARIANTS;
export const isChartworkFigure = figure => /^chartwork:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'grid');
export const chartworkCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

const arrow = (id, d, color, width = 3) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#${id}-${color.slice(1)})"/>`;
const marker = (id, color) => `<marker id="${id}-${color.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`;

function grid(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/>`;
  for (let k = 0; k < 6; k++) art += `<path d="M${110 + k * 110} 70V396" stroke="#9fb7c2" stroke-width="1.5"/><path d="M60 ${90 + k * 60}H700" stroke="#9fb7c2" stroke-width="1.5"/>`;
  art += `<path d="M60 390H700" stroke="${BLUE}" stroke-width="3"/>` + text(380, 384, t('equator'), {size: 13, fill: BLUE});
  art += `<path d="M330 70V396" stroke="${BLUE}" stroke-width="3"/>` + text(330, 86, t('greenwich'), {size: 13, fill: BLUE});
  // Latitude scale with minute ticks on the left edge.
  art += `<rect x="36" y="70" width="18" height="326" fill="#fff" stroke="${INK}"/>`;
  for (let k = 0; k <= 32; k++) art += `<path d="M36 ${70 + k * 10}H${k % 5 ? 44 : 54}" stroke="${INK}" stroke-width="1"/>`;
  art += text(150, 230, t('latScale'), {size: 13, fill: TEAL, max: 16});
  art += `<circle cx="550" cy="170" r="7" fill="${RED}"/>` + text(550, 150, t('position'), {size: 14, fill: RED});
  art += text(560, 320, t('noLon'), {size: 13, fill: AMBER, max: 26});
  return art;
}

function compass(t, text, id) {
  const cx = 380, cy = 250, r = 140, ray = deg => {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(v => v.toFixed(1));
  };
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  for (let d = 0; d < 360; d += 10) {const [x, y] = ray(d), a = (d - 90) * Math.PI / 180; art += `<path d="M${(cx + (r - 10) * Math.cos(a)).toFixed(1)} ${(cy + (r - 10) * Math.sin(a)).toFixed(1)}L${x} ${y}" stroke="${INK}" stroke-width="1"/>`;}
  const [tx, ty] = ray(0), [mx, my] = ray(15), [kx, ky] = ray(9);
  art += arrow(id, `M${cx} ${cy}L${tx} ${ty}`, INK, 4) + arrow(id, `M${cx} ${cy}L${mx} ${my}`, BLUE) + arrow(id, `M${cx} ${cy}L${kx} ${ky}`, RED);
  art += text(cx - 70, 90, t('trueN'), {size: 13}) + text(cx + 110, 104, t('magN'), {size: 13, fill: BLUE, max: 16}) + text(cx + 34, 74, t('compN'), {size: 13, fill: RED, max: 18});
  art += text(620, 220, t('variation'), {size: 14, fill: BLUE}) + text(620, 250, t('deviation'), {size: 14, fill: RED});
  art += text(150, 300, t('rule'), {size: 14, fill: TEAL, max: 20});
  return art;
}

function fix(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><path d="M20 56H740V120Q560 150 380 112Q200 80 20 130Z" fill="${LAND}"/>`;
  const objects = [[140, 100, 'lighthouse'], [400, 104, 'tower'], [680, 110, 'headland']], hat = [[380, 300], [404, 312], [392, 288]];
  objects.forEach(([x, y, key], i) => {
    const [hx, hy] = hat[i];
    art += `<path d="M${x} ${y}L${hx + (hx - x) * 0.25} ${hy + (hy - y) * 0.25}" stroke="${BLUE}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="6" fill="${INK}"/>` + text(x, y - 14, t(key), {size: 13});
  });
  art += `<path d="M380 300L404 312L392 288Z" fill="#f6d4d8" stroke="${RED}" stroke-width="2"/>`;
  art += text(560, 330, t('cocked'), {size: 13, fill: RED, max: 24}) + text(170, 370, t('legend'), {size: 14, fill: TEAL});
  return art;
}

function horizon(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><path d="M20 330Q380 250 740 330V410H20Z" fill="#9cc3d3"/>`;
  art += `<path d="M90 316l40 0l-8 14h-24z" fill="#fff" stroke="${INK}"/><path d="M110 316V296" stroke="${INK}" stroke-width="3"/><circle cx="110" cy="292" r="5" fill="${RED}"/>`;
  art += `<path d="M640 320V170" stroke="${INK}" stroke-width="10"/><circle cx="640" cy="164" r="9" fill="#f5c542" stroke="${INK}"/>`;
  art += `<path d="M110 292L380 270L640 164" fill="none" stroke="${AMBER}" stroke-width="2" stroke-dasharray="7 5"/><circle cx="380" cy="270" r="5" fill="${AMBER}"/>`;
  art += text(200, 250, t('eye'), {size: 13, fill: RED, max: 18}) + text(590, 120, t('tower49'), {size: 13, max: 20}) + text(380, 220, t('sum'), {size: 14, fill: TEAL});
  art += text(380, 92, t('formula'), {size: 15, fill: BLUE, max: 40});
  return art;
}

function current(t, text, id) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/>`;
  // A at the bottom, B straight north; current east; course to steer from the current's end.
  const A = [300, 380], C = [420, 380], X = [300, 110];
  art += `<path d="M${A[0]} ${A[1]}L${A[0]} 80" stroke="${INK}" stroke-width="2" stroke-dasharray="6 5"/>`;
  art += arrow(id, `M${A[0]} ${A[1]}L${C[0]} ${C[1]}`, BLUE) + arrow(id, `M${C[0]} ${C[1]}L${X[0] + 4} ${X[1] + 10}`, RED) + arrow(id, `M${A[0]} ${A[1]}L${X[0]} ${X[1] + 4}`, TEAL, 4);
  art += `<circle cx="${A[0]}" cy="${A[1]}" r="6" fill="${INK}"/><circle cx="${A[0]}" cy="80" r="6" fill="${INK}"/>`;
  art += text(220, 396, t('pointA'), {size: 13}) + text(220, 84, t('pointB'), {size: 13});
  art += text(500, 396, t('currentVec'), {size: 13, fill: BLUE}) + text(560, 240, t('steer'), {size: 13, fill: RED, max: 18}) + text(170, 230, t('ground'), {size: 13, fill: TEAL, max: 16});
  return art;
}

function tide(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><path d="M90 360H690M90 360V110" stroke="${INK}" stroke-width="2"/>`;
  const parts = [1, 2, 3, 3, 2, 1];
  parts.forEach((p, i) => {
    const x = 110 + i * 96, h = p * 34;
    art += `<rect x="${x}" y="${360 - h}" width="60" height="${h}" fill="${i === 2 || i === 3 ? TEAL : BLUE}" opacity=".85"/>` + text(x + 30, 352 - h, String(p), {size: 15, fill: INK});
    art += text(x + 30, 380, String(i + 1), {size: 12});
  });
  art += text(390, 400, t('hour'), {size: 12}) + text(250, 100, t('twelfths'), {size: 13, fill: BLUE, max: 26}) + text(560, 100, t('utc'), {size: 13, fill: TEAL, max: 24});
  return art;
}

/** `figure` is "chartwork:<variant>"; unknown variants fall back to the grid. */
export function renderChartworkFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index] ?? words[key][0], id = `chartwork-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = {grid, compass, fix, horizon, current, tide}[variant](t, text, id);
  const markers = [INK, BLUE, RED, TEAL].map(color => marker(id, color)).join('');
  return `<svg class="teaching-figure" data-figure="chartwork" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(t(`${variant}Caption`))}</desc><defs>${markers}</defs>${text(380, 38, title, {size: 18, weight: 700, max: 60})}${body}</svg>`;
}
