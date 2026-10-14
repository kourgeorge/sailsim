// Skipper figures: sail balance (centre of effort and lateral resistance), stability
// and free surface, heaving to, a watch rota, and the skipper's papers and duties.
// Schematic only, not to scale.
const languages = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const words = {
  balanceTitle: ['Sail balance and weather helm', 'Equilibrio de las velas y timón ardiente', 'Équilibre des voiles et barre ardente', 'Балансировка парусов и наветренность', 'איזון המפרשים והגה רוח', 'اتزان الأشرعة وثقل الدفة'],
  wind: ['Wind', 'Viento', 'Vent', 'Ветер', 'רוח', 'الريح'],
  ce: ['CE: where the sails push', 'CE: donde empujan las velas', 'CE : là où poussent les voiles', 'CE: где давят паруса', 'CE: הנקודה שבה המפרשים דוחפים', 'CE: حيث تدفع الأشرعة'],
  clr: ['CLR: where the water resists', 'CLR: donde resiste el agua', 'CLR : là où l’eau résiste', 'CLR: где сопротивляется вода', 'CLR: הנקודה שבה המים מתנגדים', 'CLR: حيث يقاوم الماء'],
  weatherHelm: ['CE behind CLR: the bow turns toward the wind (weather helm)', 'CE detrás del CLR: la proa gira hacia el viento (timón ardiente)', 'CE derrière le CLR : l’étrave remonte vers le vent (barre ardente)', 'CE позади CLR: нос поворачивает к ветру (наветренность)', 'CE מאחורי CLR: החרטום פונה אל הרוח (הגה רוח)', 'CE خلف CLR: تتجه المقدمة نحو الريح (ثقل الدفة)'],
  balanceCaption: ['The boat turns around its centre of lateral resistance. When the sails’ centre of effort is behind it, the bow turns into the wind. Ease or reef the mainsail to move the push forward.', 'El barco gira alrededor de su centro de resistencia lateral. Cuando el centro vélico de las velas está detrás de él, la proa gira hacia el viento. Larga o toma rizos en la mayor para llevar el empuje hacia proa.', 'Le bateau tourne autour de son centre de résistance latérale. Quand le centre de voilure est derrière lui, l’étrave remonte au vent. Choquez la grand-voile ou prenez un ris pour avancer la poussée.', 'Яхта поворачивается вокруг центра бокового сопротивления. Когда центр парусности позади него, нос приводится к ветру. Потравите грот или возьмите на нём риф, чтобы сместить тягу вперёд.', 'הסירה מסתובבת סביב מרכז ההתנגדות הצידית. כשמרכז המאמץ של המפרשים נמצא מאחוריו, החרטום פונה אל הרוח. שחררו את המפרש הראשי או צמצמו אותו כדי להעביר את הדחיפה קדימה.', 'يدور القارب حول مركز المقاومة الجانبية. عندما يكون مركز الدفع الشراعي خلفه، تتجه المقدمة نحو الريح. أرخِ الشراع الرئيسي أو صغّره لتنقل الدفع إلى الأمام.'],
  stabilityTitle: ['Stability and free surface', 'Estabilidad y superficie libre', 'Stabilité et carène liquide', 'Остойчивость и свободная поверхность', 'יציבות ומשטח חופשי', 'الاتزان والسطح الحر'],
  g: ['G: centre of gravity', 'G: centro de gravedad', 'G : centre de gravité', 'G: центр тяжести', 'G: מרכז הכובד', 'G: مركز الثقل'],
  b: ['B: centre of buoyancy', 'B: centro de carena', 'B : centre de carène', 'B: центр величины', 'B: מרכז הציפה', 'B: مركز الطفو'],
  gz: ['GZ: righting lever', 'GZ: brazo adrizante', 'GZ : bras de levier de redressement', 'GZ: плечо остойчивости', 'GZ: זרוע ההתיישרות', 'GZ: ذراع الاستقامة'],
  freeWater: ['Free water runs to the low side', 'El agua suelta corre hacia el lado bajo', 'L’eau libre court vers le côté bas', 'Свободная вода перетекает к низкому борту', 'מים חופשיים זורמים לצד הנמוך', 'الماء الحر يجري إلى الجانب المنخفض'],
  stabilityCaption: ['When the boat heels, the centre of buoyancy moves to the low side and the righting lever GZ turns the boat upright. Water sloshing in the bilge runs the same way and reduces stability.', 'Cuando el barco escora, el centro de carena se desplaza hacia el lado bajo y el brazo adrizante GZ endereza el barco. El agua que se mueve en la sentina corre hacia el mismo lado y reduce la estabilidad.', 'Quand le bateau gîte, le centre de carène se déplace vers le côté bas et le bras de levier GZ redresse le bateau. L’eau qui clapote dans les fonds court dans le même sens et réduit la stabilité.', 'Когда яхта кренится, центр величины смещается к низкому борту, и плечо остойчивости GZ возвращает яхту в прямое положение. Вода, плещущаяся в трюме, перетекает туда же и уменьшает остойчивость.', 'כשהסירה נוטה, מרכז הציפה זז לצד הנמוך, וזרוע ההתיישרות GZ מחזירה את הסירה לעמידה זקופה. מים שמתנודדים בבילג׳ זורמים לאותו צד ומקטינים את היציבות.', 'عندما يميل القارب، ينتقل مركز الطفو إلى الجانب المنخفض، ويعيد ذراع الاستقامة GZ القارب إلى الوضع المنتصب. والماء المتحرك في الآسن يجري في الاتجاه نفسه ويقلل الاتزان.'],
  heavyTitle: ['Heaving to', 'Ponerse al pairo', 'Se mettre à la cape', 'Ложимся в дрейф', 'עצירת המתנה', 'التوقف بالأشرعة'],
  jib: ['Jib backed to windward', 'Foque acuartelado a barlovento', 'Foc à contre, au vent', 'Стаксель на обратном ветре', 'ג׳יב מגובה לצד הרוח', 'الجيب معكوس نحو الجانب المواجه للريح'],
  main: ['Mainsail eased', 'Mayor largada', 'Grand-voile choquée', 'Грот потравлен', 'מפרש ראשי משוחרר', 'الشراع الرئيسي مُرخى'],
  helm: ['Helm lashed to turn the bow toward the wind', 'Timón trincado para llevar la proa hacia el viento', 'Barre amarrée pour faire remonter l’étrave au vent', 'Руль принайтовлен, чтобы поворачивать нос к ветру', 'ההגה קשור כך שיפנה את החרטום אל הרוח', 'الدفة مربوطة لتدير المقدمة نحو الريح'],
  drift: ['Lies about 50° to the wind and drifts slowly', 'Queda a unos 50° del viento y deriva despacio', 'Reste à environ 50° du vent et dérive lentement', 'Лежит примерно под 50° к ветру и медленно дрейфует', 'שוכבת בכ־50° לרוח ונסחפת לאט', 'يستلقي بزاوية نحو 50° من الريح وينجرف ببطء'],
  heavyCaption: ['A hove-to boat lies quietly at about 50° to the wind: the backed jib pushes the bow away, the helm turns it back, and the boat drifts slowly downwind. Use it to rest, reef or cook.', 'Un barco al pairo queda tranquilo a unos 50° del viento: el foque acuartelado aparta la proa, el timón la devuelve y el barco deriva despacio a sotavento. Úsalo para descansar, tomar rizos o cocinar.', 'Un bateau à la cape reste tranquille à environ 50° du vent : le foc à contre repousse l’étrave, la barre la ramène, et le bateau dérive lentement sous le vent. Utilisez-la pour vous reposer, prendre un ris ou cuisiner.', 'Яхта, лёгшая в дрейф, спокойно лежит примерно под 50° к ветру: стаксель на обратном ветре отталкивает нос, руль возвращает его, и яхта медленно дрейфует под ветер. Так можно отдохнуть, взять риф или приготовить еду.', 'סירה בעצירת המתנה שוכבת בשקט בכ־50° לרוח: הג׳יב המגובה דוחף את החרטום מהרוח, ההגה מחזיר אותו, והסירה נסחפת לאט במורד הרוח. השתמשו בזה כדי לנוח, לצמצם מפרש או לבשל.', 'القارب المتوقف بالأشرعة يستلقي بهدوء بزاوية نحو 50° من الريح: الجيب المعكوس يدفع المقدمة بعيدًا، والدفة تعيدها، والقارب ينجرف ببطء مع الريح. استخدم ذلك للراحة أو التصغير أو الطبخ.'],
  watchTitle: ['A two-watch system and the handover', 'Un sistema de dos guardias y el relevo', 'Deux bordées et la relève du quart', 'Две вахты и сдача вахты', 'שיטת שתי משמרות והחלפת משמרת', 'نظام النوبتين والتسليم'],
  watchA: ['Watch A', 'Guardia A', 'Bordée A', 'Вахта A', 'משמרת A', 'النوبة A'],
  watchB: ['Watch B', 'Guardia B', 'Bordée B', 'Вахта B', 'משמרת B', 'النوبة B'],
  handover: ['Hand over: course, position, traffic, weather, sails, orders', 'Relevo: rumbo, posición, tráfico, tiempo, velas, órdenes', 'Relève : cap, position, trafic, météo, voiles, consignes', 'Сдача вахты: курс, место, суда, погода, паруса, распоряжения', 'מסירה: כיוון, מיקום, תנועה, מזג אוויר, מפרשים, הוראות', 'التسليم: المسار، والموقع، وحركة السفن، والطقس، والأشرعة، والأوامر'],
  callSkipper: ['In doubt? Call the skipper', '¿Dudas? Llama al patrón', 'Un doute ? Appelez le chef de bord', 'Есть сомнения? Позовите шкипера', 'בספק? קראו לסקיפר', 'عندك شك؟ استدعِ الربّان'],
  watchCaption: ['Two watches share the night in turns of a few hours. At each change the new watch comes up early, and the old watch hands over the course, position, traffic, weather, sails and the skipper’s orders.', 'Dos guardias se reparten la noche en turnos de pocas horas. En cada cambio, la nueva guardia sube antes de tiempo, y la saliente le entrega el rumbo, la posición, el tráfico, el tiempo, las velas y las órdenes del patrón.', 'Deux bordées se partagent la nuit par quarts de quelques heures. À chaque relève, le nouveau quart monte en avance, et l’ancien lui transmet le cap, la position, le trafic, la météo, les voiles et les consignes du chef de bord.', 'Две вахты делят ночь, сменяясь через несколько часов. При каждой смене новая вахта выходит раньше, а старая сдаёт курс, место, суда вокруг, погоду, паруса и распоряжения шкипера.', 'שתי משמרות מתחלקות בלילה בתורות של כמה שעות. בכל החלפה המשמרת החדשה עולה מוקדם, והמשמרת היוצאת מוסרת את הכיוון, המיקום, התנועה, מזג האוויר, המפרשים והוראות הסקיפר.', 'تتقاسم نوبتان الليل بالتناوب كل بضع ساعات. عند كل تبديل تصعد النوبة الجديدة مبكرًا، وتسلّم النوبة القديمة المسار والموقع وحركة السفن والطقس والأشرعة وأوامر الربّان.'],
  lawTitle: ['The skipper’s papers and duties', 'Los documentos y deberes del patrón', 'Papiers et devoirs du chef de bord', 'Документы и обязанности шкипера', 'המסמכים והחובות של הסקיפר', 'أوراق الربّان وواجباته'],
  papers: ['Aboard and valid', 'A bordo y en vigor', 'À bord et valides', 'На борту и действительны', 'בסירה ובתוקף', 'على متن القارب وسارية'],
  licence: ['Boat licence', 'Licencia del barco', 'Licence du bateau', 'Судовой билет', 'רישיון כלי השיט', 'رخصة القارب'],
  seaworthy: ['Seaworthiness certificate', 'Certificado de navegabilidad', 'Certificat de navigabilité', 'Свидетельство о годности к плаванию', 'תעודת כשירות לשיט', 'شهادة صلاحية الإبحار'],
  insurance: ['Insurance', 'Seguro', 'Assurance', 'Страховка', 'ביטוח', 'التأمين'],
  skipperLicence: ['Skipper’s licence', 'Título de patrón', 'Permis du chef de bord', 'Права шкипера', 'רישיון משיט', 'رخصة الربّان'],
  duties: ['Duties', 'Deberes', 'Devoirs', 'Обязанности', 'חובות', 'الواجبات'],
  rescue: ['Help people in distress', 'Ayudar a quien está en peligro', 'Porter assistance aux personnes en détresse', 'Помогать терпящим бедствие', 'לעזור לאנשים במצוקה', 'ساعد المعرضين للخطر'],
  notices: ['Read Notices to Mariners', 'Leer los Avisos a los Navegantes', 'Lire les avis aux navigateurs', 'Читать Извещения мореплавателям', 'לקרוא הודעות לימאים', 'اقرأ الإشعارات للملاحين'],
  sea: ['Nothing overboard', 'Nada por la borda', 'Rien par-dessus bord', 'Ничего за борт', 'לא לזרוק דבר לים', 'لا شيء يُرمى في البحر'],
  report: ['Report accidents', 'Comunicar los accidentes', 'Déclarer les accidents', 'Сообщать о происшествиях', 'לדווח על תאונות', 'أبلغ عن الحوادث'],
  lawCaption: ['Keep the boat’s licence, seaworthiness certificate, insurance and your licence valid and aboard. Help people in distress, read the notices, keep the sea clean and report accidents.', 'Ten a bordo y en vigor la licencia del barco, el certificado de navegabilidad, el seguro y tu título. Ayuda a quien está en peligro, lee los avisos, mantén el mar limpio y comunica los accidentes.', 'Gardez à bord, et valides, la licence du bateau, le certificat de navigabilité, l’assurance et votre permis. Portez assistance aux personnes en détresse, lisez les avis, gardez la mer propre et déclarez les accidents.', 'Держите судовой билет, свидетельство о годности к плаванию, страховку и свои права действительными и на борту. Помогайте терпящим бедствие, читайте извещения, берегите чистоту моря и сообщайте о происшествиях.', 'שמרו בסירה את רישיון כלי השיט, תעודת הכשירות לשיט, הביטוח ורישיון המשיט שלכם, כולם בתוקף. עזרו לאנשים במצוקה, קראו את ההודעות לימאים, שמרו על ים נקי ודווחו על תאונות.', 'حافظ على رخصة القارب وشهادة صلاحية الإبحار والتأمين ورخصتك سارية وعلى متن القارب. ساعد المعرضين للخطر، واقرأ الإشعارات، وحافظ على نظافة البحر، وأبلغ عن الحوادث.'],
};
const VARIANTS = ['balance', 'stability', 'heavy', 'watch', 'law'];
const localeIndex = lang => Math.max(0, languages.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const INK = '#173a4d', RED = '#b53743', TEAL = '#087d7b', BLUE = '#176aa1', AMBER = '#925800', SEA = '#e1edf2';
let serial = 0;

export const skipperVariants = VARIANTS;
export const isSkipperFigure = figure => /^skipper:/.test(String(figure ?? ''));
const variantOf = figure => (VARIANTS.includes(String(figure).split(':')[1]) ? String(figure).split(':')[1] : 'balance');
export const skipperCaption = (figure, lang = 'en') => words[`${variantOf(figure)}Caption`][localeIndex(lang)];

const arrow = (id, d, color, width = 3) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#${id}-${color.slice(1)})"/>`;
const marker = (id, color) => `<marker id="${id}-${color.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`;
const hull = 'M150 250Q200 196 400 196Q560 200 640 250Q560 300 400 304Q200 304 150 250Z';

function balance(t, text, id) {
  // Seen from above: bow to the right, wind from the top.
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><path d="${hull}" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
  art += `<path d="M440 250L300 214" stroke="${INK}" stroke-width="4"/><path d="M440 250L600 228" stroke="${INK}" stroke-width="2"/>`;
  art += arrow(id, 'M380 80V150', BLUE) + text(420, 96, t('wind'), {size: 13, fill: BLUE});
  art += `<circle cx="360" cy="250" r="9" fill="${RED}"/><circle cx="430" cy="250" r="9" fill="${TEAL}"/>`;
  art += text(250, 318, t('ce'), {size: 13, fill: RED, max: 18}) + text(530, 318, t('clr'), {size: 13, fill: TEAL, max: 18});
  art += arrow(id, 'M620 250Q650 200 620 160', AMBER) + text(380, 394, t('weatherHelm'), {size: 13, fill: AMBER, max: 60});
  return art;
}

function stability(t, text, id) {
  // Cross-section heeled to starboard (viewer's right).
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/><rect x="20" y="250" width="720" height="160" fill="#9cc3d3"/>`;
  art += `<g transform="rotate(20 380 250)"><path d="M250 190H510V250Q510 330 380 336Q250 330 250 250Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M372 336H388V400H372Z" fill="${INK}"/><path d="M380 190V80" stroke="${INK}" stroke-width="4"/><path d="M392 330Q440 328 486 304" fill="none" stroke="${BLUE}" stroke-width="7" opacity=".7"/></g>`;
  art += `<circle cx="372" cy="262" r="8" fill="${RED}"/><circle cx="430" cy="290" r="8" fill="${TEAL}"/>`;
  art += arrow(id, 'M372 262V330', RED) + arrow(id, 'M430 290V222', TEAL) + `<path d="M372 300H430" stroke="${AMBER}" stroke-width="3"/>`;
  art += text(190, 200, t('g'), {size: 13, fill: RED, max: 18}) + text(590, 200, t('b'), {size: 13, fill: TEAL, max: 18}) + text(200, 300, t('gz'), {size: 13, fill: AMBER, max: 18});
  art += text(600, 380, t('freeWater'), {size: 13, fill: BLUE, max: 18});
  return art;
}

function heavy(t, text, id) {
  // From above: wind from the top, bow 50° off the wind to the right.
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/>`;
  art += arrow(id, 'M380 70V130', BLUE) + text(430, 90, t('wind'), {size: 13, fill: BLUE});
  art += `<g transform="rotate(50 380 260)"><path d="M380 160Q420 220 412 300H348Q340 220 380 160Z" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M380 230L360 290" stroke="${INK}" stroke-width="4"/><path d="M380 172Q350 200 372 226" fill="none" stroke="${RED}" stroke-width="4"/><path d="M380 300V320" stroke="${TEAL}" stroke-width="4"/></g>`;
  art += text(190, 170, t('jib'), {size: 13, fill: RED, max: 18}) + text(600, 200, t('main'), {size: 13, max: 18}) + text(200, 330, t('helm'), {size: 13, fill: TEAL, max: 22});
  art += text(560, 370, t('drift'), {size: 13, fill: AMBER, max: 26});
  return art;
}

function watch(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/>`;
  const hours = ['20', '23', '02', '05', '08'];
  hours.forEach((h, i) => {
    if (i < 4) art += `<rect x="${80 + i * 150}" y="120" width="146" height="60" rx="6" fill="${i % 2 ? TEAL : BLUE}" opacity=".85"/>` + text(153 + i * 150, 156, t(i % 2 ? 'watchB' : 'watchA'), {size: 14, fill: '#fff'});
    art += text(80 + i * 150, 206, `${h}:00`, {size: 12});
  });
  art += `<rect x="120" y="250" width="520" height="70" rx="10" fill="#fff" stroke="${INK}"/>` + text(380, 280, t('handover'), {size: 14, max: 50});
  art += text(380, 370, t('callSkipper'), {size: 15, fill: RED, max: 40});
  return art;
}

function law(t, text) {
  let art = `<rect x="20" y="56" width="720" height="354" rx="12" fill="${SEA}"/>`;
  const column = (x, head, keys, color) => {
    let out = `<rect x="${x}" y="80" width="320" height="310" rx="10" fill="#fff" stroke="${color}" stroke-width="2"/>` + text(x + 160, 112, t(head), {size: 16, fill: color, weight: 700});
    keys.forEach((key, i) => {out += `<path d="M${x + 24} ${158 + i * 56}l8 8l14 -16" fill="none" stroke="${color}" stroke-width="3"/>` + text(x + 180, 168 + i * 56, t(key), {size: 14, max: 28});});
    return out;
  };
  art += column(40, 'papers', ['licence', 'seaworthy', 'insurance', 'skipperLicence'], TEAL) + column(400, 'duties', ['rescue', 'notices', 'sea', 'report'], BLUE);
  return art;
}

/** `figure` is "skipper:<variant>"; unknown variants fall back to sail balance. */
export function renderSkipperFigure(figure, lang = 'en') {
  const index = localeIndex(lang), locale = languages[index], rtl = index >= 4, variant = variantOf(figure);
  const t = key => words[key][index] ?? words[key][0], id = `skipper-${locale}-${++serial}`;
  const text = (x, y, value, {size = 13, fill = INK, weight = 600, max = 30} = {}) => {
    const lines = [];
    for (const word of String(value).split(/\s+/)) {
      if (!lines.length || (lines.at(-1) + ' ' + word).length > max) lines.push(word);
      else lines[lines.length - 1] += ' ' + word;
    }
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-weight="${weight}" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const title = t(`${variant}Title`);
  const body = {balance, stability, heavy, watch, law}[variant](t, text, id);
  const markers = [RED, TEAL, BLUE, AMBER].map(color => marker(id, color)).join('');
  return `<svg class="teaching-figure" data-figure="skipper" data-variant="${variant}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,sans-serif"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(t(`${variant}Caption`))}</desc><defs>${markers}</defs>${text(380, 38, title, {size: 18, weight: 700, max: 60})}${body}</svg>`;
}
