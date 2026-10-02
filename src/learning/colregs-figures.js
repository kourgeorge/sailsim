// Schematic encounter geometry uses physical port/starboard in every language.
const languages = ['en', 'he', 'es', 'ar', 'ru', 'fr'];
const copy = {
  sailing: [
    'Sailing encounters',
    'מפגשי מפרשיות',
    'Encuentros a vela',
    'تقابل الشراعيات',
    'Встречи под парусом',
    'Rencontres à voile',
  ],
  crossing: [
    'Crossing under engine',
    'חצייה תחת מנוע',
    'Cruce a motor',
    'تقاطع بالمحرك',
    'Пересечение под двигателем',
    'Croisement au moteur',
  ],
  duties: [
    'Reassess as vessels approach',
    'מעריכים מחדש כשהכלים מתקרבים',
    'Reevalúa el acercamiento',
    'أعد التقييم مع الاقتراب',
    'Переоценка при сближении',
    'Réévaluez le rapprochement',
  ],
  channel: [
    'Channels and traffic lanes',
    'תעלות ונתיבי תנועה',
    'Canales y vías',
    'الممرات ومسارات المرور',
    'Узкости и полосы движения',
    'Chenaux et voies de circulation',
  ],
  lights: [
    'Read the complete pattern',
    'קוראים את המערך המלא',
    'Lee el patrón completo',
    'اقرأ النمط الكامل',
    'Читайте весь набор',
    'Lisez le signal complet',
  ],
  fog: [
    'A contact in restricted visibility',
    'כלי בראות מוגבלת',
    'Contacto en visibilidad restringida',
    'هدف في رؤية مقيدة',
    'Цель при ограниченной видимости',
    'Contact en visibilité réduite',
  ],
  wind: [
    'Wind from north',
    'רוח מצפון',
    'Viento del norte',
    'الريح من الشمال',
    'Ветер с севера',
    'Vent du nord',
  ],
  north: ['North', 'צפון', 'Norte', 'الشمال', 'Север', 'Nord'],
  port: [
    'Port tack',
    'מפנה שמאלי',
    'Amura a babor',
    'الريح من الميسرة',
    'Левый галс',
    'Bâbord amures',
  ],
  starboard: [
    'Starboard tack',
    'מפנה ימני',
    'Amura a estribor',
    'الريح من الميمنة',
    'Правый галс',
    'Tribord amures',
  ],
  windward: ['Windward', 'מעלה הרוח', 'Barlovento', 'جهة الريح', 'Наветренная', 'Au vent'],
  leeward: ['Leeward', 'מורד הרוח', 'Sotavento', 'تحت الريح', 'Подветренная', 'Sous le vent'],
  overtake: [
    'Overtaking sector',
    'גזרת עקיפה',
    'Sector de alcance',
    'قطاع التجاوز',
    'Сектор обгона',
    'Secteur de rattrapage',
  ],
  'same-tack': [
    'Both on starboard tack',
    'שניהם במפנה ימני',
    'Ambos a estribor',
    'كلاهما والريح من الميمنة',
    'Оба правого галса',
    'Tous deux tribord amures',
  ],
  'head-on': [
    'Nearly reciprocal courses',
    'קורסים כמעט נגדיים',
    'Rumbos casi opuestos',
    'مساران شبه متعاكسين',
    'Почти встречные курсы',
    'Routes presque opposées',
  ],
  status: [
    'Observe the vessel’s activity',
    'בודקים את פעילות הכלי',
    'Observa su actividad',
    'راقب نشاط السفينة',
    'Наблюдайте за работой судна',
    'Observez l’activité du navire',
  ],
  lane: [
    'A northbound traffic lane',
    'נתיב תנועה צפונה',
    'Vía hacia el norte',
    'مسار نحو الشمال',
    'Полоса на север',
    'Voie vers le nord',
  ],
  flow: [
    'Traffic flow',
    'כיוון התנועה',
    'Flujo de tráfico',
    'اتجاه المرور',
    'Поток движения',
    'Sens du trafic',
  ],
  current: ['Current', 'זרם', 'Corriente', 'التيار', 'Течение', 'Courant'],
  shape: [
    'Observed day shape',
    'צורת היום שנצפתה',
    'Marca diurna observada',
    'الشكل النهاري المرصود',
    'Дневной знак',
    'Marque de jour observée',
  ],
  signals: [
    'Short and prolonged blasts',
    'צפירות קצרות וממושכות',
    'Pitadas cortas y largas',
    'صفارات قصيرة ومطولة',
    'Короткие и продолжительные',
    'Sons brefs et prolongés',
  ],
  short: [
    'Short: about 1 s',
    'קצרה: כשנייה',
    'Corta: aprox. 1 s',
    'قصيرة: نحو ثانية',
    'Короткий: около 1 с',
    'Bref : environ 1 s',
  ],
  long: [
    'Prolonged: 4–6 s',
    'ממושכת: 4–6 שניות',
    'Prolongada: 4–6 s',
    'مطولة: 4–6 ثوان',
    'Продолжительный: 4–6 с',
    'Prolongé : 4–6 s',
  ],
  radar: [
    'Radar observations',
    'תצפיות מכ״ם',
    'Observaciones radar',
    'مشاهدات الرادار',
    'Наблюдения радара',
    'Observations radar',
  ],
  schematic: [
    'Training diagram · not to scale',
    'תרשים לימודי · לא בקנה מידה',
    'Esquema didáctico · sin escala',
    'رسم تدريبي · ليس بمقياس رسم',
    'Учебная схема · не в масштабе',
    'Schéma pédagogique · non à l’échelle',
  ],
};
const captions = {
  sailing: [
    'With wind from north, A is on port tack and B on starboard tack. Identify the mainsail side and check for overtaking before assigning duties.',
    'ברוח מצפון, A במפנה שמאלי ו־B במפנה ימני. זהו את צד המפרש הראשי ובדקו עקיפה לפני חלוקת החובות.',
    'Con viento del norte, A va a babor y B a estribor. Identifica el lado de la mayor y comprueba el alcance antes de asignar obligaciones.',
    'مع ريح من الشمال يكون A على الميسرة وB على الميمنة. حدد جانب الشراع الرئيسي وتحقق من التجاوز قبل توزيع الواجبات.',
    'При ветре с севера A идёт левым галсом, B правым. Определите сторону грота и проверьте обгон до распределения обязанностей.',
    'Avec le vent du nord, A est bâbord amures et B tribord amures. Repérez la grand-voile et vérifiez le rattrapage avant les obligations.',
  ],
  crossing: [
    'A heads north under engine; B approaches from A’s starboard. View the encounter from each boat: A is on B’s port side.',
    'A מפליג צפונה במנוע ו־B מתקרב מימינו. בחנו משני הכלים: A נמצא משמאל ל־B.',
    'A va al norte a motor y B llega por su estribor. Mira desde ambos: A está por babor de B.',
    'يتجه A شمالًا بالمحرك ويقترب B من ميمنته. انظر من الطرفين: A على ميسرة B.',
    'A идёт на север под двигателем, B подходит справа от A. Смотрите с обоих судов: A находится слева от B.',
    'A va au nord au moteur et B arrive sur son tribord. Vu depuis B, A se trouve sur bâbord.',
  ],
  duties: [
    'The three snapshots show decreasing separation. The stand-on vessel first maintains course and speed, may act when the other fails to act appropriately, and must act when the other alone cannot prevent collision.',
    'שלוש התמונות מציגות מרחק מצטמצם. השומר שומר תחילה קורס ומהירות, רשאי לפעול כשהאחר אינו פועל כראוי, וחייב לפעול כשפעולת האחר לבדה אינה מספיקה.',
    'Tres escenas muestran menor separación. Quien mantiene conserva al principio rumbo y velocidad, puede actuar si el otro no actúa bien y debe hacerlo cuando el otro solo no basta.',
    'تظهر اللقطات تناقص المسافة. تحافظ السفينة أولًا على المسار والسرعة، ويجوز التصرف عند تقاعس الأخرى ويجب حين لا يكفي فعلها وحدها.',
    'Три кадра показывают сближение. Сначала сохраняют курс и скорость, могут действовать при неправильном действии другого и обязаны — когда его одного недостаточно.',
    'Les trois vues montrent le rapprochement. Le navire maintient d’abord cap et vitesse, peut agir si l’autre n’agit pas correctement, puis doit agir si l’autre seul ne suffit plus.',
  ],
  channel: [
    'A sailing yacht approaches a channel used by B. Confirm whether B can navigate safely only within it; leave room early instead of relying on ordinary sailing priority.',
    'מפרשית מתקרבת לתעלה שבה מפליג B. בדקו אם הוא יכול לנווט בבטחה רק בתוכה; השאירו מרחב מוקדם בלי להסתמך על עדיפות מפרש רגילה.',
    'Un velero se acerca al canal de B. Comprueba si B solo puede navegar seguro dentro y deja espacio pronto sin invocar prioridad de vela.',
    'تقترب شراعية من ممر B. تحقق هل لا يستطيع الملاحة بأمان إلا فيه واترك مساحة مبكرًا دون الاعتماد على أولوية الشراع.',
    'Яхта подходит к узкости, по которой идёт B. Уточните, может ли B безопасно идти только в ней, и заранее оставьте место, не полагаясь на преимущество паруса.',
    'Un voilier approche du chenal suivi par B. Vérifiez si B ne peut naviguer en sécurité qu’à l’intérieur et laissez de l’espace tôt sans invoquer la priorité à voile.',
  ],
  lights: [
    'Read vertical status patterns as complete sets: two reds, red-white-red, and green over white. Additional navigation lights depend on vessel status, size and movement.',
    'קראו מערכי מעמד אנכיים בשלמותם: שני אדומים, אדום־לבן־אדום וירוק מעל לבן. אורות ניווט נוספים תלויים במעמד, בגודל ובתנועה.',
    'Lee conjuntos verticales completos: dos rojas, roja-blanca-roja y verde sobre blanca. Otras luces dependen de estado, tamaño y movimiento.',
    'اقرأ مجموعات الحالة الرأسية كاملة: أحمران وأحمر-أبيض-أحمر وأخضر فوق أبيض. تعتمد أضواء إضافية على الحالة والحجم والحركة.',
    'Читайте вертикальные наборы целиком: два красных, красный-белый-красный и зелёный над белым. Другие огни зависят от статуса, размера и движения.',
    'Lisez les ensembles verticaux : deux rouges, rouge-blanc-rouge et vert sur blanc. Les autres feux dépendent du statut, de la taille et du mouvement.',
  ],
  fog: [
    'Successive radar observations show the same bearing and shorter range. The unseen contact remains a risk; continue using the restricted-visibility framework and assess the effect of action.',
    'תצפיות מכ״ם עוקבות מראות תכווין קבוע וטווח קצר יותר. הכלי הבלתי נראה עדיין מסוכן; המשיכו בכללי ראות מוגבלת ובדקו את השפעת הפעולה.',
    'El radar muestra igual demora y menor distancia. El contacto no visible sigue siendo un riesgo; aplica visibilidad restringida y evalúa el efecto de tus acciones.',
    'تظهر مشاهدات الرادار اتجاهًا ثابتًا ومدى أقصر. يبقى الهدف غير المرئي خطرًا؛ طبق إطار الرؤية المقيدة وقيّم أثر الإجراء.',
    'Последовательные наблюдения радара дают тот же пеленг и меньшую дистанцию. Невидимая цель остаётся опасной; применяйте ограниченную видимость и оценивайте результат действий.',
    'Le radar montre un relèvement constant et une distance moindre. Le contact invisible reste un risque ; appliquez le cadre de visibilité réduite et évaluez l’effet des actions.',
  ],
};
const topics = {
  46: 'sailing',
  47: 'crossing',
  48: 'duties',
  49: 'channel',
  50: 'lights',
  51: 'fog',
};
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const locale = (lang) =>
  languages.includes(String(lang).split(/[-_]/)[0]) ? String(lang).split(/[-_]/)[0] : 'en';
let serial = 0;
export const isColregsLesson = (lesson) => /^sail-(46|47|48|49|50|51)$/.test(lesson?.id ?? '');
export function colregsFigureCaption(lesson, lang = 'en') {
  return (
    captions[topics[Number(lesson?.id?.split('-')[1])]]?.[languages.indexOf(locale(lang))] ?? ''
  );
}

export function renderColregsFigure(lesson, lang = 'en', scene = null) {
  if (!isColregsLesson(lesson)) return '';
  const code = locale(lang),
    index = languages.indexOf(code),
    rtl = ['ar', 'he'].includes(code);
  const topic = topics[Number(lesson.id.split('-')[1])],
    variant = scene?.variant ?? topic;
  const id = `colregs-${++serial}`,
    t = (key) => copy[key]?.[index] ?? key;
  // Scenario descriptions describe the evidence, never the correct response.
  const note = scene ? `${t(variant)}. ${t('schematic')}.` : colregsFigureCaption(lesson, code);
  const C = {
    water: '#dbecef',
    ink: '#183f49',
    muted: '#4c6b73',
    a: '#166a9a',
    b: '#8d5b11',
    white: '#fffdf5',
    line: '#9bbdc5',
  };
  const text = (x, y, value, size = 19, max = 30) => {
    const lines = String(value)
      .split(/\s+/)
      .reduce((out, word) => {
        if (!out.length || (out.at(-1) + ' ' + word).length > max) out.push(word);
        else out[out.length - 1] += ' ' + word;
        return out;
      }, []);
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="${C.ink}" font-size="${size}" font-weight="600" direction="${rtl ? 'rtl' : 'ltr'}" unicode-bidi="plaintext">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.2 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const path = (d, color = C.line, width = 2, dash = '') =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  const arrow = (d, color = C.a) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="3" marker-end="url(#${id}-arrow)"/>`;
  const boat = (name, x, y, heading, scale = 1, tack = null, engine = false) =>
    `<g data-vessel="${name}" data-heading="${heading}"${tack ? ` data-tack="${tack}"` : ''}${engine ? ' data-propulsion="engine"' : ''} transform="translate(${x} ${y}) rotate(${heading}) scale(${scale})"><path d="M0 -45Q33 -5 22 40Q0 51 -22 40Q-33 -5 0 -45Z" fill="${C.white}" stroke="${name === 'A' ? C.a : C.b}" stroke-width="3"/>${tack ? `<path data-mainsail-side="${tack === 'port' ? 'starboard' : 'port'}" d="M0 -21L${tack === 'port' ? 25 : -25} 24L0 6Z" fill="#b9d5ce" stroke="${C.ink}" stroke-width="2"/>` : '<path d="M-12 -7H12V26H-12Z" fill="#c8dce1"/>'}${engine ? path('M0 48V61M-9 56H9', C.ink, 3) : ''}</g>`;
  const wind = () => arrow('M90 90V200') + text(90, 235, t('wind'), 17, 15);
  let art = '';
  if (variant === 'sailing') {
    art +=
      wind() + path('M245 274L390 129', C.a, 2, '7 7') + path('M515 274L370 129', C.b, 2, '7 7');
    art += boat('A', 245, 274, 45, 1, 'port') + boat('B', 515, 274, 315, 1, 'starboard');
    art +=
      text(245, 351, `A · ${t('port')}`, 18, 25) + text(515, 351, `B · ${t('starboard')}`, 18, 25);
  } else if (variant === 'same-tack') {
    art += wind() + path('M365 132L190 307', C.a, 2, '7 7') + path('M535 307H190', C.b, 2, '7 7');
    art += boat('A', 365, 132, 225, 1, 'starboard') + boat('B', 535, 307, 270, 1, 'starboard');
    art +=
      text(570, 120, `A · ${t('windward')}`, 18, 21) +
      text(510, 375, `B · ${t('leeward')}`, 18, 25);
  } else if (variant === 'overtake') {
    art += `<path d="M385 154L551.3 222.9A180 180 0 0 1 218.7 222.9Z" fill="#d4d8c0" stroke="${C.line}"/><path d="M180 154H590" stroke="${C.line}" stroke-dasharray="5 6"/>`;
    art += boat('B', 385, 154, 0, 1, null, true) + boat('A', 545, 246.4, 300, 1, 'starboard');
    art +=
      text(385, 89, 'B') +
      text(615, 290, 'A') +
      text(385, 275, '135°', 23) +
      text(385, 355, t('overtake'), 20);
    art += text(635, 205, '22.5°', 18);
  } else if (variant === 'crossing') {
    art += path('M285 308V110', C.a, 2, '7 7') + path('M553 155H225', C.b, 2, '7 7');
    art += boat('A', 285, 308, 0, 1, 'port', true) + boat('B', 553, 155, 270, 1, null, true);
    art +=
      text(285, 379, 'A') +
      text(553, 225, 'B') +
      arrow('M120 185V105') +
      text(120, 225, t('north'), 17);
    if (scene?.viewpoint) art += text(570, 322, `→ ${scene.viewpoint}`, 28);
  } else if (variant === 'head-on') {
    art +=
      path('M390 111V310', C.line, 2, '7 7') +
      boat('A', 390, 310, 0, 1, null, true) +
      boat('B', 390, 111, 180, 1, null, true);
    art += text(480, 320, 'A') + text(480, 116, 'B');
  } else if (variant === 'duties') {
    for (let phase = 0; phase < 3; phase++) {
      const x = 28 + phase * 249,
        active = scene?.phase === phase;
      art += `<rect x="${x}" y="88" width="232" height="285" rx="16" fill="${active ? '#fff5d8' : '#eef5f4'}" stroke="${active ? C.b : C.line}" stroke-width="${active ? 3 : 1}"/>`;
      const separation = [113, 67, 30][phase];
      art +=
        boat('A', x + 116, 290, 0, 0.55, null, true) +
        boat('B', x + 116 + separation * 0.48, 290 - separation, 270, 0.55, null, true);
      art += text(x + 116, 124, String(phase + 1), 25) + text(x + 116, 350, 'A · B', 17);
    }
  } else if (variant === 'channel' || variant === 'lane') {
    art +=
      `<rect x="305" y="77" width="225" height="296" rx="8" fill="#b7d8df"/>` +
      path('M305 77V373M530 77V373', C.a, 2, '8 6');
    art += boat('B', 422, 245, 0, 1.3, null, true) + boat('A', 167, 276, 90, 0.8, 'starboard');
    art +=
      text(166, 344, 'A') +
      text(493, 246, 'B') +
      arrow('M420 156V93') +
      text(640, 123, t('flow'), 17, 18);
    if (variant === 'lane') art += arrow('M65 132H204') + text(135, 102, t('current'), 17);
  } else if (variant === 'status') {
    art +=
      boat('B', 355, 224, 0, 1.65, null, true) +
      path('M359 302Q480 285 540 345', C.b, 3) +
      text(355, 126, 'B', 24);
  } else if (variant === 'lights') {
    const patterns = scene?.lights
      ? [scene.lights]
      : [
          ['red', 'red'],
          ['red', 'white', 'red'],
          ['green', 'white'],
        ];
    patterns.forEach((colors, i) => {
      const x = patterns.length === 1 ? 390 : 175 + i * 205;
      art += `<rect x="${x - 60}" y="92" width="120" height="260" rx="16" fill="#17333f"/>`;
      colors.forEach((color, j) => {
        const y = 143 + j * 70;
        art += `<circle data-light="${color}" cx="${x}" cy="${y}" r="19" fill="${{ red: '#ef4b51', white: '#fffbe6', green: '#40d58b' }[color] ?? '#fffbe6'}" stroke="#ffffff77" stroke-width="2"/>`;
      });
      art += text(x, 379, patterns.length === 1 ? 'B' : String.fromCharCode(65 + i), 21);
    });
  } else if (variant === 'shape') {
    art +=
      `<path data-day-shape="cone-down" d="M353 110H427L390 186Z" fill="#20343b"/>` +
      path('M390 91V205', C.ink, 2);
    art += boat('B', 390, 283, 0, 1.2, 'port', true) + text(480, 290, 'B', 24);
  } else if (variant === 'signals') {
    art += text(240, 126, t('short'), 20, 24) + text(545, 126, t('long'), 20, 24);
    art += `<rect x="210" y="191" width="60" height="64" rx="8" fill="${C.a}"/><rect x="425" y="191" width="240" height="64" rx="8" fill="${C.b}"/>`;
    art += path('M95 280H690', C.line, 2) + text(390, 342, '1 s         4–6 s', 24);
  } else if (variant === 'fog') {
    for (const radius of [90, 180, 270])
      art += `<circle cx="260" cy="334" r="${radius}" fill="none" stroke="${C.line}" stroke-dasharray="4 5"/>`;
    art += path('M260 334L490 104', C.a, 2, '7 7') + boat('A', 260, 334, 0, 0.52, null, true);
    [
      [468, 126, '0.8 NM'],
      [405, 189, '0.5 NM'],
      [341, 253, '0.3 NM'],
    ].forEach(([x, y, label], i) => {
      art +=
        `<circle cx="${x}" cy="${y}" r="${scene?.stage === i ? 10 : 7}" fill="${C.b}"/>` +
        text(x + 99, y + 5, label, 18);
    });
    art += text(132, 102, t('radar'), 17, 19) + text(188, 366, 'A', 20);
  }
  return `<svg class="teaching-figure" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 430" width="800" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${code}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,sans-serif"><title id="${id}-title">${escape(t(variant))}</title><desc id="${id}-desc">${escape(note)}</desc><defs><marker id="${id}-arrow" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 -4L10 0L0 4Z" fill="${C.a}"/></marker><clipPath id="${id}-clip"><rect x="20" y="65" width="760" height="322" rx="12"/></clipPath></defs><rect width="800" height="430" rx="20" fill="${C.water}"/><g aria-hidden="true">${text(400, 35, t(variant), 22, 54)}<g clip-path="url(#${id}-clip)">${art}</g>${text(400, 410, t('schematic'), 14, 90)}</g></svg>`;
}
