// Safety teaching figures: harness and jacklines, flares, extinguishers, the life
// raft, and sea anchor versus drogue. Schematic only; geometry never mirrors in RTL.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  harnessTitle: ['Harness and jacklines', 'Arnés y líneas de vida', 'Harnais et lignes de vie', 'Страховочный пояс и леера', 'רתמה וקווי בטיחות', 'حزام الأمان وخطوط الأمان'],
  jackline: ['Jackline, bow to stern', 'Línea de vida, de proa a popa', 'Ligne de vie, de l’avant à l’arrière', 'Леер от носа до кормы', 'קו בטיחות מהחרטום לירכתיים', 'خط أمان من المقدمة إلى المؤخرة'],
  tether: ['Short tether to a strong point', 'Amarre corto a un punto fuerte', 'Longe courte sur un point solide', 'Короткий страховочный конец на прочную точку', 'רצועה קצרה לנקודה חזקה', 'حبل قصير إلى نقطة متينة'],
  clipFirst: ['Clip on before leaving the cockpit', 'Engánchate antes de salir de la bañera', 'Accrochez-vous avant de quitter le cockpit', 'Пристегнитесь до выхода из кокпита', 'התחברו לפני שיוצאים מהקוקפיט', 'اربط نفسك قبل مغادرة قمرة القيادة'],
  flaresTitle: ['Which flare when', 'Qué bengala usar', 'Quel signal utiliser', 'Какой сигнал когда', 'איזה זיקוק מתי', 'أي شعلة ومتى'],
  rocket: ['Red parachute rocket', 'Cohete rojo con paracaídas', 'Fusée parachute rouge', 'Красная парашютная ракета', 'זיקוק מצנח אדום', 'صاروخ مظلي أحمر'],
  rocketUse: ['Far away, day or night: climbs about 300 m', 'Lejos, de día o de noche: sube unos 300 m', 'Loin, de jour comme de nuit : monte à environ 300 m', 'Далеко, днём и ночью: поднимается примерно на 300 м', 'למרחק, ביום ובלילה: עולה לכ־300 מ׳', 'للبعيد ليلًا ونهارًا: يرتفع نحو 300 م'],
  hand: ['Red hand flare', 'Bengala roja de mano', 'Feu à main rouge', 'Красный фальшфейер', 'זיקוק יד אדום', 'شعلة يدوية حمراء'],
  handUse: ['Close by: shows your exact position, burns even in water', 'Cerca: marca tu posición exacta, arde incluso en el agua', 'De près : montre votre position exacte, brûle même dans l’eau', 'Вблизи: показывает точное место, горит даже в воде', 'מקרוב: מראה את המיקום המדויק, בוער גם במים', 'للقريب: يبيّن موقعك بدقة ويشتعل حتى في الماء'],
  smoke: ['Orange smoke', 'Humo naranja', 'Fumée orange', 'Оранжевый дым', 'עשן כתום', 'دخان برتقالي'],
  smokeUse: ['By day only: also shows the wind to a helicopter', 'Solo de día: también indica el viento a un helicóptero', 'De jour seulement : indique aussi le vent à un hélicoptère', 'Только днём: показывает вертолёту ветер', 'ביום בלבד: מראה גם למסוק את כיוון הרוח', 'نهارًا فقط: ويبيّن اتجاه الريح للمروحية'],
  expiry: ['Replace before the expiry date', 'Sustitúyelas antes de caducar', 'Remplacez avant la date de péremption', 'Заменяйте до истечения срока', 'החליפו לפני תאריך התפוגה', 'استبدلها قبل انتهاء صلاحيتها'],
  extTitle: ['Which extinguisher for which fire', 'Qué extintor para cada fuego', 'Quel extincteur pour quel feu', 'Какой огнетушитель для какого огня', 'איזה מטף לאיזו שריפה', 'أي مطفأة لأي حريق'],
  solids: ['Wood, cloth, paper', 'Madera, tela, papel', 'Bois, tissu, papier', 'Дерево, ткань, бумага', 'עץ, בד, נייר', 'خشب وقماش وورق'],
  liquids: ['Fuel, oil', 'Combustible, aceite', 'Carburant, huile', 'Топливо, масло', 'דלק, שמן', 'وقود وزيت'],
  electric: ['Live electrics', 'Electricidad con tensión', 'Électricité sous tension', 'Электрика под напряжением', 'חשמל פעיל', 'كهرباء موصولة'],
  pan: ['Galley pan', 'Sartén en la cocina', 'Poêle en cuisine', 'Сковорода на камбузе', 'מחבת במטבח', 'مقلاة في المطبخ'],
  water: ['Water', 'Agua', 'Eau', 'Вода', 'מים', 'ماء'],
  foam: ['Foam', 'Espuma', 'Mousse', 'Пена', 'קצף', 'رغوة'],
  powder: ['Dry powder', 'Polvo seco', 'Poudre', 'Порошок', 'אבקה', 'مسحوق جاف'],
  co2: ['CO2', 'CO2', 'CO2', 'CO2', 'CO2', 'CO2'],
  blanket: ['Fire blanket', 'Manta ignífuga', 'Couverture anti-feu', 'Противопожарное покрывало', 'שמיכת כיבוי', 'بطانية إطفاء'],
  raftTitle: ['Launching and righting the life raft', 'Lanzar y adrizar la balsa salvavidas', 'Mettre à l’eau et redresser le radeau', 'Спуск и переворот спасательного плота', 'השקה ויישור של רפסודת ההצלה', 'إنزال طوف النجاة وقلبه'],
  step1: ['Tie the painter, throw the raft to leeward', 'Ata la boza y lanza la balsa a sotavento', 'Amarrez la bosse, lancez le radeau sous le vent', 'Закрепите фалинь, сбросьте плот под ветер', 'קשרו את חבל הקשירה וזרקו את הרפסודה לצד המוגן', 'اربط حبل الطوف وارمه في جهة ظل الريح'],
  step2: ['Pull the painter out: the gas bottle inflates it', 'Tira de la boza: la botella de gas la infla', 'Tirez la bosse : la bouteille de gaz le gonfle', 'Вытяните фалинь: баллон надувает плот', 'משכו את החבל: מכל הגז מנפח אותה', 'اسحب الحبل: تنفخه أسطوانة الغاز'],
  step3: ['Upside down? Stand on the bottle, pull the strap', '¿Del revés? Súbete a la botella y tira de la cincha', 'À l’envers ? Montez sur la bouteille, tirez la sangle', 'Перевернулся? Встаньте на баллон, тяните за лямку', 'הפוכה? עמדו על המכל ומשכו ברצועה', 'مقلوب؟ قف على الأسطوانة واسحب الحزام'],
  hydrostatic: ['Hydrostatic release: frees the raft if the boat sinks', 'Zafa hidrostática: libera la balsa si el barco se hunde', 'Largueur hydrostatique : libère le radeau si le bateau coule', 'Гидростат: освобождает плот, если судно тонет', 'משחרר הידרוסטטי: משחרר את הרפסודה אם הכלי שוקע', 'محرّر هيدروستاتيكي: يحرّر الطوف إذا غرق القارب'],
  anchorTitle: ['Sea anchor and drogue', 'Ancla de capa y drogue', 'Ancre flottante et traînard', 'Плавучий якорь и дрог', 'עוגן ים ובולם', 'المرساة العائمة والكابح'],
  seaAnchor: ['Sea anchor from the bow: holds the bow to the waves, cuts drift', 'Ancla de capa por la proa: mantiene la proa a las olas y reduce la deriva', 'Ancre flottante à l’avant : garde l’étrave face aux vagues, réduit la dérive', 'Плавучий якорь с носа: держит нос на волну, уменьшает дрейф', 'עוגן ים מהחרטום: מחזיק את החרטום מול הגלים ומקטין סחיפה', 'مرساة عائمة من المقدمة: تبقي المقدمة نحو الأمواج وتقلل الانجراف'],
  drogue: ['Drogue astern: slows the boat running down waves', 'Drogue por la popa: frena el barco al bajar las olas', 'Traînard à l’arrière : freine le bateau qui dévale les vagues', 'Дрог с кормы: тормозит судно на спуске с волны', 'בולם מהירכתיים: מאט את הכלי בירידה מגלים', 'كابح من المؤخرة: يبطئ القارب وهو ينحدر مع الأمواج'],
  waves: ['Waves', 'Olas', 'Vagues', 'Волны', 'גלים', 'الأمواج'],
  harnessCaption: [
    'Jacklines run along both side decks from bow to stern. Clip a short tether to them, or to a strong point, before leaving the cockpit, and stay clipped on while you work on deck.',
    'Las líneas de vida recorren ambas bandas de proa a popa. Engancha un amarre corto a ellas, o a un punto fuerte, antes de salir de la bañera, y no te sueltes mientras trabajas en cubierta.',
    'Les lignes de vie courent le long des deux passavants, de l’avant à l’arrière. Accrochez une longe courte, ou un point solide, avant de quitter le cockpit, et restez accroché pendant le travail sur le pont.',
    'Леера идут по обоим бортам от носа до кормы. Пристегните к ним короткий конец или к прочной точке до выхода из кокпита и не отстёгивайтесь, пока работаете на палубе.',
    'קווי הבטיחות נמתחים לאורך שני צידי הסיפון מהחרטום לירכתיים. חברו אליהם רצועה קצרה, או לנקודה חזקה, לפני שיוצאים מהקוקפיט, והישארו מחוברים בזמן העבודה על הסיפון.',
    'تمتد خطوط الأمان على جانبي السطح من المقدمة إلى المؤخرة. اربط بها حبلًا قصيرًا، أو بنقطة متينة، قبل مغادرة قمرة القيادة، وابقَ مربوطًا أثناء العمل على السطح.',
  ],
  flaresCaption: [
    'A parachute rocket is seen from far away by day or night; a hand flare marks your exact position for someone close; orange smoke works by day. Replace flares before they expire.',
    'El cohete con paracaídas se ve desde lejos de día o de noche; la bengala de mano marca tu posición exacta a quien está cerca; el humo naranja sirve de día. Sustituye las bengalas antes de que caduquen.',
    'La fusée parachute se voit de loin, de jour comme de nuit ; le feu à main indique votre position exacte à qui est proche ; la fumée orange sert de jour. Remplacez les signaux avant leur péremption.',
    'Парашютную ракету видно издалека днём и ночью; фальшфейер показывает точное место тому, кто рядом; оранжевый дым работает днём. Меняйте сигналы до истечения срока.',
    'זיקוק מצנח נראה מרחוק ביום ובלילה; זיקוק יד מסמן את המיקום המדויק למי שקרוב; עשן כתום פועל ביום. החליפו זיקוקים לפני תאריך התפוגה.',
    'يُرى الصاروخ المظلي من بعيد ليلًا ونهارًا؛ وتحدد الشعلة اليدوية موقعك بدقة لمن هو قريب؛ ويعمل الدخان البرتقالي نهارًا. استبدل الشعلات قبل انتهاء صلاحيتها.',
  ],
  extinguishersCaption: [
    'A tick means the extinguisher suits that fire. Foam is mainly for burning liquids; powder works on most fires; CO2 suits electrical fires; never put water on burning fuel or live electrics.',
    'La marca indica que el extintor sirve para ese fuego. La espuma es sobre todo para líquidos; el polvo sirve para casi todos; el CO2 para fuegos eléctricos; nunca eches agua sobre combustible ardiendo ni sobre electricidad con tensión.',
    'Une coche indique que l’extincteur convient à ce feu. La mousse sert surtout aux liquides ; la poudre à la plupart des feux ; le CO2 aux feux électriques ; jamais d’eau sur du carburant en feu ni sur de l’électricité sous tension.',
    'Галочка означает, что огнетушитель подходит для этого огня. Пена — в основном для жидкостей; порошок — для большинства пожаров; CO2 — для электрики; никогда не лейте воду на горящее топливо и электрику под напряжением.',
    'סימן וי פירושו שהמטף מתאים לשריפה הזו. קצף מיועד בעיקר לנוזלים בוערים; אבקה מתאימה לרוב השריפות; CO2 לשריפות חשמל; לעולם אין לשפוך מים על דלק בוער או על חשמל פעיל.',
    'العلامة تعني أن المطفأة تناسب هذا الحريق. الرغوة أساسًا للسوائل المشتعلة؛ والمسحوق لمعظم الحرائق؛ وCO2 للحرائق الكهربائية؛ ولا تسكب الماء أبدًا على وقود مشتعل أو كهرباء موصولة.',
  ],
  raftCaption: [
    'Tie the painter before throwing the raft over to leeward, then pull the painter out to inflate it. If it comes up upside down, stand on the gas bottle and lean back on the righting strap.',
    'Ata la boza antes de lanzar la balsa a sotavento y luego tira de ella para inflarla. Si sale del revés, súbete a la botella de gas y échate hacia atrás tirando de la cincha.',
    'Amarrez la bosse avant de lancer le radeau sous le vent, puis tirez-la pour le gonfler. S’il se retourne, montez sur la bouteille de gaz et penchez-vous en arrière sur la sangle de redressement.',
    'Закрепите фалинь, прежде чем сбросить плот под ветер, затем вытяните фалинь, чтобы его надуть. Если плот перевернулся, встаньте на газовый баллон и откиньтесь назад, держась за лямку.',
    'קשרו את חבל הקשירה לפני שזורקים את הרפסודה לצד המוגן מהרוח, ואז משכו את החבל כדי לנפח אותה. אם היא הפוכה, עמדו על מכל הגז ונטו לאחור תוך משיכה ברצועת היישור.',
    'اربط حبل الطوف قبل رميه في جهة ظل الريح، ثم اسحب الحبل لنفخه. وإذا انقلب فقف على أسطوانة الغاز وامِل إلى الخلف ساحبًا حزام القلب.',
  ],
  anchorCaption: [
    'A sea anchor streamed from the bow holds a boat or raft end-on to the waves and reduces drift. A smaller drogue towed astern slows a boat running before big waves so it does not broach.',
    'Un ancla de capa largada por la proa mantiene el barco o la balsa con la proa a las olas y reduce la deriva. Un drogue más pequeño remolcado por la popa frena el barco que corre ante olas grandes para que no atraviese.',
    'Une ancre flottante filée à l’avant tient le bateau ou le radeau face aux vagues et réduit la dérive. Un traînard plus petit, remorqué à l’arrière, freine le bateau qui fuit devant de grosses vagues pour éviter le départ au lof.',
    'Плавучий якорь, отданный с носа, держит судно или плот носом на волну и уменьшает дрейф. Меньший дрог, буксируемый за кормой, тормозит судно, идущее по большой волне, чтобы оно не встало лагом.',
    'עוגן ים שמשוחרר מהחרטום מחזיק כלי או רפסודה מול הגלים ומקטין סחיפה. בולם קטן יותר שנגרר מהירכתיים מאט כלי שבורח לפני גלים גדולים כדי שלא יסתובב לרוחב.',
    'المرساة العائمة المطلقة من المقدمة تبقي القارب أو الطوف مواجهًا للأمواج وتقلل الانجراف. والكابح الأصغر المسحوب من المؤخرة يبطئ القارب الهارب أمام الأمواج الكبيرة كي لا ينقلب عرضيًا.',
  ],
};
const VARIANTS = ['harness', 'flares', 'extinguishers', 'raft', 'anchor'];
const TITLES = {harness: 'harnessTitle', flares: 'flaresTitle', extinguishers: 'extTitle', raft: 'raftTitle', anchor: 'anchorTitle'};
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', RED = '#d23a2e', ORANGE = '#f08a24', TEAL = '#2f6f62', WATER = '#cfe3ea';
let serial = 0;

export const safetyVariants = VARIANTS;
export const isSafetyFigure = figure => /^safety:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'harness');
export const safetyCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

// Top view of a yacht, bow up, centred on (x, y).
const hull = (x, y, scale = 1) => `<path transform="translate(${x} ${y}) scale(${scale})" d="M0 -150C50 -100 62 40 52 140H-52C-62 40 -50 -100 0 -150Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/>`;

function harness(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${WATER}"/>` + hull(250, 236, 1.1);
  art += `<rect x="208" y="300" width="84" height="60" rx="8" fill="#e5e0d2" stroke="${INK}"/>`;
  // Jacklines along both side decks.
  for (const side of [-1, 1]) art += `<path d="M${250 + side * 18} 90L${250 + side * 46} 380" stroke="${ORANGE}" stroke-width="4" stroke-dasharray="10 6"/>`;
  // Crew member clipped on by a short tether.
  art += `<circle cx="286" cy="200" r="11" fill="#d7ad88" stroke="${INK}" stroke-width="2"/><path d="M286 211L286 236" stroke="${INK}" stroke-width="4"/><path d="M286 222L${250 + 33} 214" stroke="${RED}" stroke-width="3"/>`;
  art += `<path d="M430 120H330L${250 + 30} 150" fill="none" stroke="#5c7480" stroke-width="1.5"/>` + text(560, 126, t('jackline'), {max: 26});
  art += `<path d="M430 216H300" fill="none" stroke="#5c7480" stroke-width="1.5"/>` + text(560, 222, t('tether'), {max: 26});
  art += `<path d="M430 330H296" fill="none" stroke="#5c7480" stroke-width="1.5"/>` + text(560, 336, t('clipFirst'), {max: 26});
  return art;
}

function flares(t, text) {
  let art = '';
  const cards = [['rocket', 'rocketUse'], ['hand', 'handUse'], ['smoke', 'smokeUse']];
  cards.forEach(([name, use], i) => {
    const x = 30 + i * 240;
    art += `<rect x="${x}" y="62" width="220" height="300" rx="12" fill="#eef4f2"/>`;
    const cx = x + 110;
    if (name === 'rocket') art += `<path d="M${cx - 50} 250Q${cx - 30} 150 ${cx} 120" fill="none" stroke="#9aa9af" stroke-width="2" stroke-dasharray="4 4"/><path d="M${cx - 18} 112A20 14 0 0 1 ${cx + 22} 112Z" fill="#e8e2d2" stroke="${INK}"/><path d="M${cx - 16} 112L${cx + 2} 136M${cx + 20} 112L${cx + 2} 136" stroke="${INK}"/><circle cx="${cx + 2}" cy="140" r="8" fill="${RED}"/>`;
    if (name === 'hand') art += `<rect x="${cx - 7}" y="140" width="14" height="70" rx="3" fill="#6b7d86"/><circle cx="${cx}" cy="128" r="22" fill="${RED}" opacity=".25"/><circle cx="${cx}" cy="128" r="11" fill="${RED}"/><path d="M${cx - 60} 232Q${cx} 222 ${cx + 60} 232" stroke="#4f8aa3" stroke-width="3" fill="none"/>`;
    if (name === 'smoke') art += `<rect x="${cx - 9}" y="190" width="18" height="28" rx="2" fill="#6b7d86"/><circle cx="${cx - 6}" cy="172" r="14" fill="${ORANGE}" opacity=".85"/><circle cx="${cx + 12}" cy="150" r="17" fill="${ORANGE}" opacity=".7"/><circle cx="${cx + 34}" cy="128" r="15" fill="${ORANGE}" opacity=".55"/>`;
    art += text(cx, 266, t(name), {size: 15, max: 22}) + text(cx, 296, t(use), {size: 12, weight: 500, max: 28});
  });
  art += text(380, 396, t('expiry'), {size: 14, fill: RED, max: 60});
  return art;
}

function extinguishers(t, text, rtl) {
  const fires = ['solids', 'liquids', 'electric', 'pan'], agents = ['water', 'foam', 'powder', 'co2', 'blanket'];
  // Which agent suits which fire: water solids only; foam liquids (and solids); powder all but pan; CO2 electrics and liquids; blanket pan.
  const ok = {water: ['solids'], foam: ['solids', 'liquids'], powder: ['solids', 'liquids', 'electric'], co2: ['liquids', 'electric'], blanket: ['pan']};
  const never = {water: ['liquids', 'electric', 'pan'], foam: ['electric']};
  const col = i => (rtl ? 640 - i * 128 : 240 + i * 128), rowY = i => 130 + i * 56;
  let art = '';
  fires.forEach((fire, i) => { art += text(col(i), 84, t(fire), {size: 13, max: 14}); });
  agents.forEach((agent, j) => {
    const y = rowY(j);
    art += `<rect x="24" y="${y - 26}" width="712" height="48" rx="8" fill="${j % 2 ? '#eef4f2' : '#f7faf8'}"/>`;
    art += text(rtl ? 700 - 40 : 100, y + 5, t(agent), {size: 14, max: 18});
    fires.forEach((fire, i) => {
      const x = col(i), good = ok[agent].includes(fire), bad = never[agent]?.includes(fire);
      art += good ? `<path d="M${x - 10} ${y}L${x - 3} ${y + 8}L${x + 12} ${y - 10}" fill="none" stroke="${TEAL}" stroke-width="4"/>`
        : bad ? `<path d="M${x - 9} ${y - 9}L${x + 9} ${y + 9}M${x + 9} ${y - 9}L${x - 9} ${y + 9}" stroke="${RED}" stroke-width="4"/>`
        : `<circle cx="${x}" cy="${y}" r="3" fill="#9aa9af"/>`;
    });
  });
  return art;
}

function raft(t, text) {
  let art = `<rect x="20" y="56" width="720" height="250" rx="12" fill="${WATER}"/>`;
  const steps = [['step1', 70], ['step2', 300], ['step3', 530]];
  // 1: canister going over the side with the painter tied.
  art += `<path d="M30 140H170L160 170H40Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/><rect x="150" y="186" width="44" height="28" rx="8" fill="#eceae2" stroke="${INK}"/><path d="M150 150Q170 165 170 186" fill="none" stroke="${ORANGE}" stroke-width="3"/>`;
  // 2: inflated raft with canopy, painter running back to the boat.
  art += `<ellipse cx="360" cy="230" rx="80" ry="24" fill="${ORANGE}" stroke="${INK}"/><path d="M300 228Q360 150 420 228Z" fill="#f6b45e" stroke="${INK}"/><path d="M280 230Q240 200 230 170" fill="none" stroke="${ORANGE}" stroke-width="3"/>`;
  // 3: upturned raft, swimmer on the gas bottle pulling the righting strap.
  art += `<ellipse cx="610" cy="236" rx="78" ry="22" fill="#2d3c44" stroke="${INK}"/><rect x="596" y="206" width="30" height="16" rx="5" fill="#eceae2" stroke="${INK}"/><path d="M560 230Q610 196 660 230" fill="none" stroke="#f2c230" stroke-width="3"/>`;
  art += `<circle cx="611" cy="176" r="9" fill="#d7ad88" stroke="${INK}" stroke-width="2"/><path d="M611 185L606 206M609 192L585 210" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  steps.forEach(([key, x], i) => {
    art += `<circle cx="${x}" cy="88" r="15" fill="${INK}"/><text x="${x}" y="94" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" direction="ltr">${i + 1}</text>`;
    art += text(x + 95, 330, t(key), {size: 13, max: 26});
  });
  art += text(380, 400, t('hydrostatic'), {size: 13, fill: TEAL, max: 70});
  return art;
}

function anchor(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${WATER}"/>`;
  // Waves arrive from the left in both panels.
  for (let k = 0; k < 4; k++) art += `<path d="M40 ${110 + k * 80}q20 -12 40 0t40 0" fill="none" stroke="#4f8aa3" stroke-width="2.5"/>`;
  art += text(80, 92, t('waves'), {size: 12, fill: '#4f8aa3'});
  // Sea anchor from the bow, bow facing the waves.
  art += `<g transform="translate(470 150) rotate(-90)"><path d="M0 -60C20 -40 24 15 20 56H-20C-24 15 -20 -40 0 -60Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/></g>`;
  art += `<path d="M410 150L220 150" stroke="${INK}" stroke-width="2"/><path d="M220 150L190 128L190 172Z" fill="${ORANGE}" stroke="${INK}"/>`;
  art += text(470, 214, t('seaAnchor'), {size: 13, max: 40});
  // Drogue astern of a boat running before the waves.
  art += `<g transform="translate(470 320) rotate(90)"><path d="M0 -60C20 -40 24 15 20 56H-20C-24 15 -20 -40 0 -60Z" fill="#fbfaf6" stroke="${INK}" stroke-width="2"/></g>`;
  art += `<path d="M414 320L260 320" stroke="${INK}" stroke-width="2"/><path d="M260 320L244 310L244 330Z" fill="${ORANGE}" stroke="${INK}"/>`;
  art += windArrow(560, 320) + text(470, 384, t('drogue'), {size: 13, max: 40});
  return art;
}
const windArrow = (x, y) => `<path d="M${x} ${y}h40" stroke="#5c7480" stroke-width="3"/><path d="M${x + 40} ${y - 7}l12 7l-12 7Z" fill="#5c7480"/>`;

/** `figure` is "safety:<variant>"; unknown variants fall back to the harness. */
export function renderSafetyFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index], id = `safety-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(TITLES[variant]);
  const body = {harness, flares, extinguishers, raft, anchor}[variant](t, text, rtl);
  return `<svg class="teaching-figure" data-figure="safety" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(safetyCaption(figure, lang))}</desc><rect width="760" height="430" rx="14" fill="#f4f7f3"/>${text(380, 36, title, {size: 21, max: 60})}${body}</svg>`;
}
