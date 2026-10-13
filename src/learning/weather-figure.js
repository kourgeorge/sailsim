// Weather teaching figures: a synoptic chart, a frontal low, the Beaufort scale,
// sea and land breezes, and an eastern Mediterranean overview. Schematic only;
// north is up and geometry never mirrors in RTL.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  chartTitle: ['Reading a weather chart', 'Leer un mapa meteorológico', 'Lire une carte météo', 'Как читать синоптическую карту', 'קריאת מפת מזג אוויר', 'قراءة خريطة الطقس'],
  low: ['Low', 'Baja', 'Dépression', 'Низкое', 'שקע', 'منخفض'],
  high: ['High', 'Alta', 'Anticyclone', 'Высокое', 'רמה', 'مرتفع'],
  close: ['Close isobars: strong wind', 'Isobaras juntas: viento fuerte', 'Isobares serrées : vent fort', 'Частые изобары: сильный ветер', 'איזוברים צפופים: רוח חזקה', 'خطوط ضغط متقاربة: رياح قوية'],
  wide: ['Wide isobars: light wind', 'Isobaras separadas: viento flojo', 'Isobares espacées : vent faible', 'Редкие изобары: слабый ветер', 'איזוברים מרווחים: רוח חלשה', 'خطوط ضغط متباعدة: رياح خفيفة'],
  hemisphere: ['Northern hemisphere', 'Hemisferio norte', 'Hémisphère nord', 'Северное полушарие', 'חצי הכדור הצפוני', 'نصف الكرة الشمالي'],
  frontsTitle: ['A frontal low passing', 'Paso de una baja con frentes', 'Passage d’une dépression frontale', 'Прохождение фронтального циклона', 'מעבר שקע עם חזיתות', 'مرور منخفض جبهي'],
  warmFront: ['Warm front', 'Frente cálido', 'Front chaud', 'Тёплый фронт', 'חזית חמה', 'جبهة دافئة'],
  coldFront: ['Cold front', 'Frente frío', 'Front froid', 'Холодный фронт', 'חזית קרה', 'جبهة باردة'],
  warmSector: ['Warm sector', 'Sector cálido', 'Secteur chaud', 'Тёплый сектор', 'אזור חם', 'القطاع الدافئ'],
  warmStep: ['Layered cloud, steady rain, pressure falls', 'Nubes en capas, lluvia continua, la presión baja', 'Nuages en couches, pluie continue, la pression baisse', 'Слоистые облака, обложной дождь, давление падает', 'עננות שכבתית, גשם מתמשך, הלחץ יורד', 'غيوم طبقية ومطر مستمر وانخفاض الضغط'],
  sectorStep: ['Mist or drizzle, pressure steady, poor visibility', 'Neblina o llovizna, presión estable, mala visibilidad', 'Brume ou bruine, pression stable, mauvaise visibilité', 'Дымка или морось, давление стабильно, плохая видимость', 'אובך או טפטוף, לחץ יציב, ראות לקויה', 'ضباب خفيف أو رذاذ وضغط ثابت ورؤية ضعيفة'],
  coldStep: ['Cumulonimbus, squalls, wind veers, pressure rises, clearer after', 'Cumulonimbos, turbonadas, el viento rola, la presión sube, luego aclara', 'Cumulonimbus, grains, le vent tourne, la pression monte, puis éclaircie', 'Кучево-дождевые, шквалы, ветер поворачивает, давление растёт, потом проясняется', 'קומולונימבוס, משבים, הרוח מסתובבת, הלחץ עולה ואחר כך מתבהר', 'غيوم ركامية مزنية وزوابع وتحوّل الريح وارتفاع الضغط ثم صفاء'],
  beaufortTitle: ['The Beaufort scale at sea', 'La escala de Beaufort en el mar', 'L’échelle de Beaufort en mer', 'Шкала Бофорта на море', 'סולם בופור בים', 'مقياس بوفورت في البحر'],
  force: ['Force', 'Fuerza', 'Force', 'Баллы', 'כוח', 'القوة'],
  knots: ['Knots', 'Nudos', 'Nœuds', 'Узлы', 'קשרים', 'عقدة'],
  sea: ['What the sea looks like', 'Aspecto del mar', 'Aspect de la mer', 'Вид моря', 'איך הים נראה', 'كيف يبدو البحر'],
  b3: ['Large wavelets, a few white horses', 'Olas pequeñas, algunos borregos', 'Vaguelettes, quelques moutons', 'Небольшие волны, редкие барашки', 'גלים קטנים, מעט כתמי קצף', 'أمواج صغيرة وبعض الزبد'],
  b4: ['Small waves, many white horses', 'Olas pequeñas, muchos borregos', 'Petites vagues, nombreux moutons', 'Небольшие волны, много барашков', 'גלים קטנים, הרבה כתמי קצף', 'أمواج صغيرة وزبد كثير'],
  b5: ['Moderate waves, some spray', 'Olas moderadas, algo de rociones', 'Vagues modérées, quelques embruns', 'Умеренные волны, брызги', 'גלים בינוניים, מעט רסס', 'أمواج متوسطة وبعض الرذاذ'],
  b6: ['Large waves, white foam crests everywhere', 'Olas grandes, crestas de espuma por todas partes', 'Grandes vagues, crêtes d’écume partout', 'Крупные волны, всюду пенные гребни', 'גלים גדולים, קצף לבן על כל הפסגות', 'أمواج كبيرة وقمم زبد أبيض في كل مكان'],
  b7: ['Sea heaps up, foam blown in streaks', 'La mar engruesa, espuma en franjas', 'La mer grossit, écume en traînées', 'Море вздымается, пена полосами', 'הים מתגבה, קצף נישא בפסים', 'يتراكم البحر ويتطاير الزبد في خطوط'],
  b8: ['Gale: high waves, spray blown off the crests', 'Temporal: olas altas, rociones arrancados de las crestas', 'Coup de vent : hautes vagues, embruns arrachés', 'Шторм: высокие волны, срывается пена', 'סערה: גלים גבוהים, רסס נקרע מהפסגות', 'عاصفة: أمواج عالية وتطاير الرذاذ من القمم'],
  breezeTitle: ['Sea breeze and land breeze', 'Brisa marina y terral', 'Brise de mer et brise de terre', 'Морской и береговой бриз', 'בריזת ים ובריזת יבשה', 'نسيم البحر ونسيم البر'],
  day: ['Sunny afternoon: sea breeze', 'Tarde soleada: brisa marina', 'Après-midi ensoleillé : brise de mer', 'Солнечный день: морской бриз', 'צהריים שמשיים: בריזת ים', 'ظهيرة مشمسة: نسيم البحر'],
  night: ['Night: land breeze', 'Noche: terral', 'Nuit : brise de terre', 'Ночь: береговой бриз', 'לילה: בריזת יבשה', 'ليلًا: نسيم البر'],
  land: ['Land', 'Tierra', 'Terre', 'Суша', 'יבשה', 'اليابسة'],
  seaArea: ['Sea', 'Mar', 'Mer', 'Море', 'ים', 'البحر'],
  warm: ['Warmer', 'Más cálido', 'Plus chaud', 'Теплее', 'חם יותר', 'أدفأ'],
  cool: ['Cooler', 'Más fresco', 'Plus frais', 'Прохладнее', 'קריר יותר', 'أبرد'],
  medTitle: ['Eastern Mediterranean winds', 'Vientos del Mediterráneo oriental', 'Vents de la Méditerranée orientale', 'Ветры восточного Средиземноморья', 'רוחות במזרח הים התיכון', 'رياح شرق المتوسط'],
  meltemi: ['Meltemi: north, July–August', 'Meltemi: norte, julio–agosto', 'Meltem : nord, juillet–août', 'Мельтеми: северный, июль–август', 'מלטמי: צפונית, יולי–אוגוסט', 'الملتيمي: شمالية، يوليو–أغسطس'],
  sharqiya: ['Sharqiya: dry easterly, spring and autumn', 'Sharqiya: levante seco, primavera y otoño', 'Charkiya : vent d’est sec, printemps et automne', 'Шаркия: сухой восточный, весна и осень', 'שרקייה: מזרחית יבשה, אביב וסתיו', 'الشرقية: شرقية جافة، الربيع والخريف'],
  winterLow: ['Winter low: south-west to west gales', 'Baja invernal: temporales del suroeste al oeste', 'Dépression d’hiver : coups de vent de sud-ouest à ouest', 'Зимний циклон: юго-западные и западные штормы', 'שקע חורפי: סערות דרום־מערביות עד מערביות', 'منخفض شتوي: عواصف جنوبية غربية إلى غربية'],
  breezeMed: ['Summer: north-west sea breeze', 'Verano: brisa del noroeste', 'Été : brise de nord-ouest', 'Лето: северо-западный бриз', 'קיץ: בריזת ים צפון־מערבית', 'الصيف: نسيم بحري شمالي غربي'],
  hotLow: ['Spring hot low: hot southerly, dust', 'Baja cálida de primavera: viento sur cálido, polvo', 'Dépression chaude de printemps : vent du sud chaud, poussière', 'Весенний тёплый циклон: жаркий южный, пыль', 'שקע חם באביב: רוח דרומית חמה, אבק', 'منخفض حار في الربيع: رياح جنوبية حارة وغبار'],
  cyprus: ['Cyprus', 'Chipre', 'Chypre', 'Кипр', 'קפריסין', 'قبرص'],
  israel: ['Israel', 'Israel', 'Israël', 'Израиль', 'ישראל', 'إسرائيل'],
  aegean: ['Aegean', 'Egeo', 'Égée', 'Эгейское', 'הים האגאי', 'إيجه'],
  chartCaption: [
    'Isobars join places of equal pressure. In the northern hemisphere the wind circles a low anticlockwise and spirals in, and circles a high clockwise and spirals out. The closer the isobars, the stronger the wind.',
    'Las isobaras unen puntos de igual presión. En el hemisferio norte el viento gira alrededor de una baja en sentido antihorario y hacia dentro, y alrededor de una alta en sentido horario y hacia fuera. Cuanto más juntas las isobaras, más fuerte el viento.',
    'Les isobares relient les points de même pression. Dans l’hémisphère nord, le vent tourne autour d’une dépression dans le sens inverse des aiguilles d’une montre en convergeant, et autour d’un anticyclone dans le sens des aiguilles en divergeant. Plus les isobares sont serrées, plus le vent est fort.',
    'Изобары соединяют точки с одинаковым давлением. В северном полушарии ветер обходит циклон против часовой стрелки, закручиваясь внутрь, а антициклон — по часовой стрелке, расходясь наружу. Чем гуще изобары, тем сильнее ветер.',
    'איזוברים מחברים מקומות בעלי לחץ שווה. בחצי הכדור הצפוני הרוח סובבת שקע נגד כיוון השעון ופונה פנימה, וסובבת רמה עם כיוון השעון ופונה החוצה. ככל שהאיזוברים צפופים יותר, הרוח חזקה יותר.',
    'تصل خطوط الضغط المتساوي بين أماكن متساوية الضغط. في نصف الكرة الشمالي تدور الرياح حول المنخفض عكس عقارب الساعة متجهة إلى الداخل، وحول المرتفع مع عقارب الساعة متجهة إلى الخارج. كلما تقاربت الخطوط اشتدت الرياح.',
  ],
  frontsCaption: [
    'A frontal low moving east: first the warm front, then the warm sector, then the cold front with the strongest wind and squalls. The pressure falls ahead of the warm front, steadies in the warm sector and rises behind the cold front.',
    'Una baja con frentes que avanza hacia el este: primero el frente cálido, luego el sector cálido y después el frente frío, con el viento más fuerte y turbonadas. La presión baja ante el frente cálido, se estabiliza en el sector cálido y sube tras el frente frío.',
    'Une dépression frontale qui se déplace vers l’est : d’abord le front chaud, puis le secteur chaud, puis le front froid avec le vent le plus fort et les grains. La pression baisse avant le front chaud, se stabilise dans le secteur chaud et remonte derrière le front froid.',
    'Фронтальный циклон смещается на восток: сначала тёплый фронт, потом тёплый сектор, затем холодный фронт с самым сильным ветром и шквалами. Перед тёплым фронтом давление падает, в тёплом секторе стабилизируется, за холодным фронтом растёт.',
    'שקע עם חזיתות שנע מזרחה: קודם החזית החמה, אחריה האזור החם ואז החזית הקרה עם הרוח החזקה והמשבים. הלחץ יורד לפני החזית החמה, מתייצב באזור החם ועולה אחרי החזית הקרה.',
    'منخفض جبهي يتحرك شرقًا: أولًا الجبهة الدافئة، ثم القطاع الدافئ، ثم الجبهة الباردة بأقوى الرياح والزوابع. ينخفض الضغط قبل الجبهة الدافئة ويثبت في القطاع الدافئ ويرتفع خلف الجبهة الباردة.',
  ],
  beaufortCaption: [
    'Name the force from the sea as well as the instrument. Force 6, 22–27 knots, has large waves with white foam crests everywhere; force 8 is a gale.',
    'Identifica la fuerza por el mar además de por el instrumento. Fuerza 6, 22–27 nudos, tiene olas grandes con crestas de espuma por todas partes; fuerza 8 es temporal.',
    'Estimez la force d’après la mer autant que d’après l’instrument. Force 6, 22–27 nœuds : grandes vagues, crêtes d’écume partout ; force 8 : coup de vent.',
    'Определяйте силу ветра и по морю, а не только по прибору. 6 баллов, 22–27 узлов: крупные волны, всюду пенные гребни; 8 баллов — шторм.',
    'זהו את הכוח לפי הים ולא רק לפי המכשיר. כוח 6, 22–27 קשרים: גלים גדולים עם קצף לבן על כל הפסגות; כוח 8 הוא סערה.',
    'حدّد القوة من شكل البحر لا من الجهاز وحده. القوة 6، من 22 إلى 27 عقدة: أمواج كبيرة وقمم زبد أبيض في كل مكان؛ والقوة 8 عاصفة.',
  ],
  breezeCaption: [
    'By day the land warms faster than the sea, air rises over the land and cooler sea air flows in toward the shore. At night the land cools and a lighter breeze may blow out to sea.',
    'De día la tierra se calienta antes que el mar, el aire sube sobre la tierra y el aire más fresco del mar entra hacia la costa. De noche la tierra se enfría y puede soplar una brisa más suave hacia el mar.',
    'Le jour, la terre se réchauffe plus vite que la mer, l’air monte au-dessus de la terre et l’air plus frais de la mer afflue vers la côte. La nuit, la terre refroidit et une brise plus faible peut souffler vers le large.',
    'Днём суша нагревается быстрее моря, воздух над ней поднимается, и прохладный морской воздух идёт к берегу. Ночью суша остывает, и более слабый бриз может дуть в море.',
    'ביום היבשה מתחממת מהר יותר מהים, אוויר עולה מעליה ואוויר קריר מהים זורם אל החוף. בלילה היבשה מתקררת ובריזה חלשה יותר עשויה לנשוב אל הים.',
    'نهارًا تسخن اليابسة أسرع من البحر فيرتفع الهواء فوقها ويتدفق هواء البحر الأبرد نحو الشاطئ. وليلًا تبرد اليابسة وقد يهب نسيم أخف نحو البحر.',
  ],
  medCaption: [
    'Schematic, not a forecast. Winter lows bring south-westerly to westerly gales; the Sharqiya blows off the land from the east; the Meltemi blows from the north across the Aegean in summer.',
    'Esquema, no un pronóstico. Las bajas invernales traen temporales del suroeste al oeste; la Sharqiya sopla de tierra desde el este; el Meltemi sopla del norte sobre el Egeo en verano.',
    'Schéma, pas une prévision. Les dépressions d’hiver apportent des coups de vent de sud-ouest à ouest ; la Charkiya souffle de terre depuis l’est ; le Meltem souffle du nord sur l’Égée en été.',
    'Схема, а не прогноз. Зимние циклоны приносят юго-западные и западные штормы; шаркия дует с суши с востока; летом над Эгейским морем дует северный мельтеми.',
    'תרשים, לא תחזית. שקעים חורפיים מביאים סערות דרום־מערביות עד מערביות; השרקייה נושבת מהיבשה ממזרח; המלטמי נושבת מצפון על הים האגאי בקיץ.',
    'مخطط وليس توقعًا. تجلب المنخفضات الشتوية عواصف جنوبية غربية إلى غربية؛ وتهب الشرقية من اليابسة من الشرق؛ ويهب الملتيمي من الشمال على بحر إيجه صيفًا.',
  ],
};
const VARIANTS = ['chart', 'fronts', 'beaufort', 'breeze', 'med'];
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', WIND = '#1f6f8b', RED = '#c8352b', BLUE = '#2f5fb3', WATER = '#cfe3ea', LAND = '#e7dcc4';
let serial = 0;

export const weatherVariants = VARIANTS;
export const isWeatherFigure = figure => /^weather:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'chart');
export const weatherCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

const arrowHead = (x, y, angle, color, size = 9) => {
  const a = (angle * Math.PI) / 180, l = a + 2.6, r = a - 2.6;
  return `<path d="M${x} ${y}L${(x + size * Math.cos(l)).toFixed(1)} ${(y + size * Math.sin(l)).toFixed(1)}L${(x + size * Math.cos(r)).toFixed(1)} ${(y + size * Math.sin(r)).toFixed(1)}Z" fill="${color}"/>`;
};
// A short wind arrow at (x,y) pointing toward screen angle `angle` (degrees, 0 = east).
const windArrow = (x, y, angle, color = WIND, length = 34) => {
  const a = (angle * Math.PI) / 180, x0 = x - (Math.cos(a) * length) / 2, y0 = y - (Math.sin(a) * length) / 2, x1 = x + (Math.cos(a) * length) / 2, y1 = y + (Math.sin(a) * length) / 2;
  return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${color}" stroke-width="3"/>` + arrowHead(x1, y1, angle, color);
};

function chart(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="#eef4f2"/>`;
  // A low with isobars bunched on its western side, and a high with wide isobars.
  const low = {x: 250, y: 236}, high = {x: 590, y: 226};
  [44, 84, 124, 164].forEach((r, i) => {
    art += `<ellipse cx="${low.x + i * 9}" cy="${low.y}" rx="${r}" ry="${r * 0.8}" fill="none" stroke="#7f98a3" stroke-width="1.6"/>`;
    art += `<text x="${low.x + i * 9 + r - 4}" y="${low.y - 4}" font-size="11" fill="#5c7480" direction="ltr">${996 + i * 4}</text>`;
  });
  [60, 120].forEach((r, i) => {
    art += `<ellipse cx="${high.x}" cy="${high.y}" rx="${r}" ry="${r * 0.85}" fill="none" stroke="#7f98a3" stroke-width="1.6"/>`;
    art += `<text x="${high.x - 6}" y="${high.y - r * 0.85 - 4}" font-size="11" fill="#5c7480" direction="ltr">${1024 - i * 4}</text>`;
  });
  art += `<text x="${low.x}" y="${low.y + 12}" text-anchor="middle" font-size="36" font-weight="800" fill="${RED}" direction="ltr">L</text>` + text(low.x, low.y + 38, t('low'), {size: 13, fill: RED});
  art += `<text x="${high.x}" y="${high.y + 12}" text-anchor="middle" font-size="36" font-weight="800" fill="${BLUE}" direction="ltr">H</text>` + text(high.x, high.y + 38, t('high'), {size: 13, fill: BLUE});
  // Anticlockwise and inward around the low; clockwise and outward around the high.
  for (const deg of [0, 60, 120, 180, 240, 300]) {
    const a = (deg * Math.PI) / 180, r = 104;
    const x = low.x + Math.cos(a) * r, y = low.y + Math.sin(a) * r * 0.8;
    art += windArrow(x, y, deg - 90 - 20);
  }
  for (const deg of [30, 150, 270]) {
    const a = (deg * Math.PI) / 180, r = 90;
    art += windArrow(high.x + Math.cos(a) * r, high.y + Math.sin(a) * r * 0.85, deg + 90 - 20);
  }
  art += text(130, 92, t('close'), {size: 13, max: 24}) + text(640, 392, t('wide'), {size: 13, max: 28});
  art += text(110, 392, t('hemisphere'), {size: 12, weight: 500, fill: '#5c7480', max: 26});
  return art;
}

function fronts(t, text) {
  let art = `<rect x="20" y="56" width="720" height="230" rx="12" fill="#eef4f2"/>`;
  // Plan view: warm front ahead (east), cold front behind (west), warm sector between.
  art += `<path d="M300 80L560 250L230 250Z" fill="#f6e2c6"/>`;
  art += text(395, 214, t('warmSector'), {size: 13, fill: '#8a5a1a'});
  art += `<path d="M300 80Q420 150 560 250" fill="none" stroke="${RED}" stroke-width="3"/>`;
  for (const f of [0.25, 0.5, 0.75]) {
    const x = 300 + (560 - 300) * f, y = 80 + (250 - 80) * f + Math.sin(f * Math.PI) * -22;
    art += `<circle cx="${x.toFixed(1)}" cy="${(y + 6).toFixed(1)}" r="9" fill="${RED}"/>`;
  }
  art += `<path d="M300 80Q250 170 230 250" fill="none" stroke="${BLUE}" stroke-width="3"/>`;
  for (const f of [0.3, 0.6, 0.85]) {
    const x = 300 - 70 * f, y = 80 + 170 * f;
    art += `<path d="M${(x - 9).toFixed(1)} ${(y - 6).toFixed(1)}L${(x + 2).toFixed(1)} ${(y + 8).toFixed(1)}L${(x - 14).toFixed(1)} ${(y + 8).toFixed(1)}Z" fill="${BLUE}"/>`;
  }
  art += `<text x="300" y="78" text-anchor="middle" font-size="28" font-weight="800" fill="${RED}" direction="ltr">L</text>`;
  art += text(600, 236, t('warmFront'), {size: 13, fill: RED}) + text(170, 236, t('coldFront'), {size: 13, fill: BLUE});
  art += windArrow(660, 120, 0, '#5c7480', 50);
  // What each part brings, in the order you meet it.
  const steps = [['warmFront', 'warmStep', RED], ['warmSector', 'sectorStep', '#8a5a1a'], ['coldFront', 'coldStep', BLUE]];
  steps.forEach(([name, step, color], i) => {
    const x = 30 + i * 240;
    art += `<rect x="${x}" y="300" width="220" height="110" rx="10" fill="#fff" stroke="#c9d6d4"/><text x="${x + 18}" y="330" font-size="20" font-weight="800" fill="${color}" direction="ltr">${i + 1}</text>`;
    art += text(x + 120, 330, t(name), {size: 14, fill: color, max: 20}) + text(x + 110, 358, t(step), {size: 12, weight: 500, max: 30});
  });
  return art;
}

function beaufort(t, text, rtl) {
  const rows = [[3, '7–10', 'b3', 1], [4, '11–16', 'b4', 2], [5, '17–21', 'b5', 3], [6, '22–27', 'b6', 4], [7, '28–33', 'b7', 5], [8, '34–40', 'b8', 6]];
  const fx = rtl ? 690 : 70, kx = rtl ? 600 : 160, sx = rtl ? 330 : 430, wx = rtl ? 70 : 640;
  let art = text(fx, 82, t('force'), {size: 13, fill: '#5c7480'}) + text(kx, 82, t('knots'), {size: 13, fill: '#5c7480'}) + text(sx, 82, t('sea'), {size: 13, fill: '#5c7480', max: 40});
  rows.forEach(([force, knots, key, height], i) => {
    const y = 96 + i * 52, highlight = force === 6;
    art += `<rect x="24" y="${y}" width="712" height="46" rx="8" fill="${highlight ? '#fbe9d0' : i % 2 ? '#eef4f2' : '#f7faf8'}"/>`;
    art += `<text x="${fx}" y="${y + 31}" text-anchor="middle" font-size="22" font-weight="800" fill="${INK}" direction="ltr">${force}</text>`;
    art += `<text x="${kx}" y="${y + 30}" text-anchor="middle" font-size="16" font-weight="600" fill="${INK}" direction="ltr">${knots}</text>`;
    art += text(sx, y + 29, t(key), {size: 13, max: 46});
    // Waves grow with the force; foam marks appear from force 4.
    let wave = `M${wx - 50} ${y + 30}`;
    for (let k = 0; k < 4; k++) wave += `q12.5 ${-height * 3} 25 0`;
    art += `<path d="${wave}" fill="none" stroke="${WIND}" stroke-width="2.5"/>`;
    if (force >= 4) for (let k = 0; k < Math.min(4, force - 3); k++) art += `<circle cx="${wx - 37 + k * 25}" cy="${y + 30 - height * 1.5}" r="2.6" fill="#fff" stroke="${WIND}" stroke-width=".8"/>`;
  });
  return art;
}

function breeze(t, text, rtl) {
  let art = '';
  for (const [i, kind] of [[0, 'day'], [1, 'night']]) {
    const x0 = 24 + (rtl ? 1 - i : i) * 368, dark = kind === 'night';
    art += `<rect x="${x0}" y="64" width="344" height="346" rx="12" fill="${dark ? '#1e3442' : '#e8f1f4'}"/>`;
    art += text(x0 + 172, 92, t(kind), {size: 14, fill: dark ? '#e8f1f4' : INK, max: 34});
    // Sea on the left, land on the right, in both panels.
    art += `<rect x="${x0}" y="300" width="172" height="110" fill="${dark ? '#24506a' : WATER}"/><path d="M${x0 + 172} 300H${x0 + 344}V410H${x0 + 172}Z" fill="${dark ? '#5a5240' : LAND}"/>`;
    art += text(x0 + 86, 388, t('seaArea'), {size: 13, fill: dark ? '#e8f1f4' : INK}) + text(x0 + 258, 388, t('land'), {size: 13, fill: dark ? '#f4ead2' : '#6a5a3c'});
    art += text(x0 + 86, 340, t(dark ? 'warm' : 'cool'), {size: 12, weight: 500, fill: dark ? '#cfe3ea' : WIND}) + text(x0 + 258, 340, t(dark ? 'cool' : 'warm'), {size: 12, weight: 500, fill: dark ? '#f4ead2' : RED});
    if (dark) art += `<circle cx="${x0 + 300}" cy="130" r="18" fill="#f4ead2"/><circle cx="${x0 + 309}" cy="124" r="16" fill="#1e3442"/>`;
    else art += `<circle cx="${x0 + 300}" cy="130" r="20" fill="#f2c230"/>`;
    // The surface wind and the return flow aloft make a loop.
    const toLand = !dark, color = dark ? '#cfe3ea' : WIND;
    const y = 270, ax = toLand ? x0 + 70 : x0 + 280, bx = toLand ? x0 + 280 : x0 + 70;
    art += `<path d="M${ax} ${y}L${bx} ${y}" stroke="${color}" stroke-width="4"/>` + arrowHead(bx, y, toLand ? 0 : 180, color, 12);
    art += `<path d="M${bx} ${y - 12}V${170}" stroke="${color}" stroke-width="2" stroke-dasharray="5 5"/><path d="M${bx} 160L${ax} 160" stroke="${color}" stroke-width="2" stroke-dasharray="5 5"/><path d="M${ax} 170V${y - 12}" stroke="${color}" stroke-width="2" stroke-dasharray="5 5"/>`;
    art += arrowHead(bx, 170, -90, color, 8) + arrowHead(ax, y - 14, 90, color, 8);
  }
  return art;
}

function med(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${WATER}"/>`;
  // Very rough schematic coastlines: Greece and Turkey to the north, the Levant coast to the east.
  art += `<path d="M20 56H420L400 110L340 120L300 100L250 130L200 110L150 140L90 120L20 150Z" fill="${LAND}"/>`;
  art += `<path d="M420 56H740V200L700 210L640 190L560 170L500 150L440 120Z" fill="${LAND}"/>`;
  art += `<path d="M740 200V410H610L620 380L640 340L655 300L670 250L690 215Z" fill="${LAND}"/>`;
  art += `<path d="M20 410V350L120 360L250 375L400 380L520 390L610 410Z" fill="${LAND}"/>`;
  art += `<ellipse cx="560" cy="240" rx="52" ry="18" fill="${LAND}"/>` + text(560, 245, t('cyprus'), {size: 12, fill: '#6a5a3c'});
  art += text(700, 300, t('israel'), {size: 13, fill: '#6a5a3c'}) + text(250, 170, t('aegean'), {size: 12, fill: '#4f6d78'});
  // Meltemi in the Aegean, from the north.
  art += windArrow(250, 215, 90, BLUE, 56) + windArrow(300, 205, 95, BLUE, 56) + text(200, 268, t('meltemi'), {size: 12, fill: BLUE, max: 24});
  // Winter low near Cyprus and its south-westerly gales toward the coast.
  art += `<text x="470" y="315" text-anchor="middle" font-size="28" font-weight="800" fill="${RED}" direction="ltr">L</text>` + windArrow(540, 320, -40, RED, 60) + windArrow(600, 290, -40, RED, 50) + text(430, 352, t('winterLow'), {size: 12, fill: RED, max: 28});
  // Sharqiya off the land; summer north-westerly sea breeze onto the coast; spring hot low from the south.
  art += windArrow(650, 270, 180, '#8a5a1a', 60) + text(560, 196, t('sharqiya'), {size: 12, fill: '#8a5a1a', max: 30});
  art += windArrow(620, 360, 50, WIND, 40) + text(650, 400, t('breezeMed'), {size: 11, fill: WIND, max: 26});
  art += windArrow(520, 400, -90, '#a0522d', 40) + text(300, 400, t('hotLow'), {size: 11, fill: '#a0522d', max: 34});
  return art;
}

/** `figure` is "weather:<variant>"; unknown variants fall back to the chart. */
export function renderWeatherFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index], id = `weather-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = {chart, fronts, beaufort, breeze, med}[variant](t, text, rtl);
  return `<svg class="teaching-figure" data-figure="weather" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(weatherCaption(figure, lang))}</desc><rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 36, title, {size: 21, max: 60})}${body}</svg>`;
}
