// Original, schematic teaching artwork. Geometry is fixed to maritime conventions;
// language changes labels, never port/starboard or compass directions.
import {marinaLessons} from './marina-course.js';
import {isColregsLesson,renderColregsFigure,colregsFigureCaption} from './colregs-figures.js';
import {getWorldBodyDefinitions} from '../world/bodies.js';
const LANGS = ['en', 'es', 'fr', 'ru', 'he', 'ar'];
const WORDS = {
  schematic: ['Learning diagram · not to scale', 'Esquema didáctico · sin escala', 'Schéma pédagogique · non à l’échelle', 'Учебная схема · не в масштабе', 'תרשים לימודי · לא בקנה מידה', 'رسم تعليمي · ليس بمقياس رسم'],
  yacht: ['Know your yacht', 'Conoce tu velero', 'Connaître son voilier', 'Устройство яхты', 'הכרת היאכטה', 'تعرّف على يختك'],
  bow: ['Bow', 'Proa', 'Étrave', 'Нос', 'חרטום', 'المقدمة'],
  stern: ['Stern', 'Popa', 'Poupe', 'Корма', 'ירכתיים', 'المؤخرة'],
  port: ['Port', 'Babor', 'Bâbord', 'Левый борт', 'שמאל היאכטה', 'الميسرة'],
  starboard: ['Starboard', 'Estribor', 'Tribord', 'Правый борт', 'ימין היאכטה', 'الميمنة'],
  mast: ['Mast', 'Mástil', 'Mât', 'Мачта', 'תורן', 'الصاري'],
  main: ['Mainsail', 'Mayor', 'Grand-voile', 'Грот', 'מפרש ראשי', 'الشراع الرئيسي'],
  jib: ['Headsail', 'Vela de proa', 'Voile d’avant', 'Передний парус', 'מפרש קדמי', 'الشراع الأمامي'],
  keel: ['Keel', 'Quilla', 'Quille', 'Киль', 'שדרן', 'العارضة'],
  rudder: ['Rudder', 'Timón', 'Safran', 'Перо руля', 'לוח ההגה', 'الدفة'],
  boom: ['Boom', 'Botavara', 'Bôme', 'Гик', 'מנור', 'ذراع الشراع'],
  controls: ['Sail controls', 'Controles de las velas', 'Réglages des voiles', 'Управление парусами', 'בקרי המפרשים', 'أدوات ضبط الأشرعة'],
  halyard: ['Halyard: hoist', 'Driza: izar', 'Drisse : hisser', 'Фал: подъём', 'מעלן: הרמה', 'حبل الرفع: ارفع'],
  sheet: ['Sheet: sail angle', 'Escota: ángulo', 'Écoute : angle', 'Шкот: угол паруса', 'מיתר: זווית מפרש', 'حبل الشد: زاوية الشراع'],
  reef: ['Reef: less area', 'Rizo: menos superficie', 'Ris : moins de surface', 'Риф: меньше площадь', 'צמצום: פחות שטח', 'التصغير: مساحة أقل'],
  wind: ['Wind comes from here', 'El viento viene de aquí', 'Le vent vient d’ici', 'Ветер приходит отсюда', 'הרוח מגיעה מכאן', 'الرياح تأتي من هنا'],
  points: ['Points of sail', 'Rumbos respecto al viento', 'Allures du voilier', 'Курсы к ветру', 'כיווני הפלגה ביחס לרוח', 'اتجاهات الإبحار مع الرياح'],
  nogo: ['No-go zone', 'Zona no navegable', 'Zone non navigable', 'Непроходимый сектор', 'תחום ללא הנעה', 'منطقة غير قابلة للإبحار'],
  close: ['Close hauled', 'Ceñida', 'Près serré', 'Крутой бейдевинд', 'קדמית חדה', 'إبحار قريب من الريح'],
  beam: ['Beam reach', 'Través', 'Vent de travers', 'Галфвинд', 'רוח צד', 'إبحار بعرض الريح'],
  broad: ['Broad reach', 'Largo', 'Grand largue', 'Бакштаг', 'רוח גבית צדית', 'إبحار بريح خلفية جانبية'],
  run: ['Dead downwind', 'Popa redonda', 'Vent arrière', 'Фордевинд', 'רוח מלאה מאחור', 'إبحار مع الريح مباشرة'],
  tack: ['Tack: bow through wind', 'Virada: proa por el viento', 'Virement : étrave au vent', 'Оверштаг: нос через ветер', 'סיבוב: חרטום דרך הרוח', 'دوران بالمقدمة عبر الريح'],
  gybe: ['Gybe: stern through wind', 'Trasluchada: popa por el viento', 'Empannage : poupe au vent', 'Фордевинд: корма через ветер', 'מהפך: ירכתיים דרך הרוח', 'دوران بالمؤخرة عبر الريح'],
  before: ['Before', 'Antes', 'Avant', 'До', 'לפני', 'قبل'],
  after: ['After', 'Después', 'Après', 'После', 'אחרי', 'بعد'],
  boomClear: ['Keep clear of the boom', 'Aléjate de la botavara', 'Rester hors du passage de la bôme', 'Берегитесь гика', 'התרחקו ממסלול המנור', 'ابتعد عن مسار ذراع الشراع'],
  apparent: ['True and apparent wind', 'Viento real y aparente', 'Vent réel et apparent', 'Истинный и вымпельный ветер', 'רוח אמיתית ומדומה', 'الرياح الحقيقية والظاهرية'],
  trueFlow: ['True airflow', 'Flujo de aire real', 'Écoulement réel de l’air', 'Истинный поток воздуха', 'זרימת אוויר אמיתית', 'تدفق الهواء الحقيقي'],
  boatMotion: ['Boat motion', 'Movimiento del barco', 'Mouvement du bateau', 'Движение яхты', 'תנועת היאכטה', 'حركة القارب'],
  feltFlow: ['Apparent airflow', 'Flujo de aire aparente', 'Écoulement apparent', 'Вымпельный поток воздуха', 'זרימת אוויר מדומה', 'تدفق الهواء الظاهري'],
  heading: ['Heading', 'Rumbo de proa', 'Cap', 'Курс носа', 'כיוון החרטום', 'اتجاه المقدمة'],
  course: ['Course over ground', 'Rumbo sobre el fondo', 'Route fond', 'Путевой угол', 'קורס מעל הקרקע', 'المسار فوق الأرض'],
  current: ['Current', 'Corriente', 'Courant', 'Течение', 'זרם', 'التيار'],
  north: ['North', 'Norte', 'Nord', 'Север', 'צפון', 'الشمال'],
  track: ['Heading and ground track', 'Proa y trayectoria real', 'Cap et trajectoire sur le fond', 'Курс и путь над грунтом', 'כיוון החרטום ונתיב בפועל', 'الاتجاه والمسار الفعلي'],
  helm: ['Small helm corrections', 'Pequeñas correcciones', 'Petites corrections de barre', 'Малые перекладки руля', 'תיקוני הגה קטנים', 'تصحيحات صغيرة للدفة'],
  look: ['Look out', 'Vigila', 'Observer', 'Осмотр', 'תצפית', 'راقب المحيط'],
  compare: ['Check heading', 'Comprueba el rumbo', 'Vérifier le cap', 'Проверка курса', 'בדיקת כיוון', 'تحقق من الاتجاه'],
  center: ['Center helm', 'Centra el timón', 'Centrer la barre', 'Руль прямо', 'מרכוז ההגה', 'أعد الدفة للوسط'],
  correct: ['Small correction', 'Pequeña corrección', 'Petite correction', 'Малая поправка', 'תיקון קטן', 'تصحيح صغير'],
  motor: ['Same helm, different motion', 'Mismo timón, distinto movimiento', 'Même barre, mouvement différent', 'Тот же руль, другой ход', 'אותו הגה, תנועה שונה', 'الدفة نفسها وحركة مختلفة'],
  ahead: ['Ahead motion', 'Avante', 'Marche avant', 'Передний ход', 'תנועה קדימה', 'حركة إلى الأمام'],
  astern: ['Astern motion', 'Atrás', 'Marche arrière', 'Задний ход', 'תנועה לאחור', 'حركة إلى الخلف'],
  bowRight: ['Bow turns starboard', 'Proa gira a estribor', 'Étrave vers tribord', 'Нос вправо', 'החרטום פונה ימינה', 'المقدمة تدور للميمنة'],
  bowLeft: ['Bow turns port', 'Proa gira a babor', 'Étrave vers bâbord', 'Нос влево', 'החרטום פונה שמאלה', 'المقدمة تدور للميسرة'],
  sameHelm: ['Starboard helm held in both examples', 'Timón a estribor en ambos ejemplos', 'Barre à tribord dans les deux exemples', 'В обоих примерах руль удерживается вправо', 'בשתי הדוגמאות ההגה מוחזק ימינה', 'الدفة ثابتة للميمنة في المثالين'],
  stopping: ['Plan room to slow down', 'Deja espacio para frenar', 'Prévoir l’espace pour ralentir', 'Оставьте место для остановки', 'השאירו מרחב להאטה', 'اترك مساحة للإبطاء'],
  powerOff: ['Reduce power', 'Reduce la potencia', 'Réduire la puissance', 'Уменьшить тягу', 'הפחתת כוח', 'قلّل الدفع'],
  coast: ['Momentum remains', 'Queda inercia', 'L’inertie demeure', 'Инерция сохраняется', 'התנע נשמר', 'يبقى القصور الذاتي'],
  slow: ['Speed falls gradually', 'La velocidad baja poco a poco', 'La vitesse diminue peu à peu', 'Скорость падает постепенно', 'המהירות יורדת בהדרגה', 'تنخفض السرعة تدريجيًا'],
  anchor: ['Anchoring geometry', 'Geometría del fondeo', 'Géométrie du mouillage', 'Геометрия якорной стоянки', 'גאומטריית עגינה', 'هندسة الرسو بالمرساة'],
  rode: ['Rode length', 'Longitud del cabo/cadena', 'Longueur de la ligne', 'Длина якорного каната', 'אורך חבל או שרשרת', 'طول حبل أو سلسلة المرساة'],
  vertical: ['Depth + roller height', 'Profundidad + altura del rodillo', 'Profondeur + hauteur du davier', 'Глубина + высота роульса', 'עומק + גובה גלגלת', 'العمق + ارتفاع البكرة'],
  seabed: ['Seabed', 'Fondo', 'Fond marin', 'Морское дно', 'קרקעית', 'قاع البحر'],
  scope: ['Scope = rode ÷ vertical distance', 'Relación = línea ÷ distancia vertical', 'Rapport = ligne ÷ distance verticale', 'Кратность = канат ÷ высота', 'יחס = אורך חבל ÷ מרחק אנכי', 'النسبة = طول الحبل ÷ المسافة الرأسية'],
  route: ['Plan each leg', 'Planifica cada tramo', 'Préparer chaque étape', 'Планируйте каждый участок', 'תכנון כל קטע', 'خطط لكل مرحلة'],
  hazard: ['Shallows', 'Bajos', 'Hauts-fonds', 'Мелководье', 'מים רדודים', 'مياه ضحلة'],
  waypoint: ['Waypoint', 'Punto de ruta', 'Point de route', 'Путевая точка', 'נקודת דרך', 'نقطة مسار'],
  safeRoute: ['Check the entire route', 'Comprueba toda la ruta', 'Vérifier toute la route', 'Проверьте весь маршрут', 'בדקו את כל הנתיב', 'تحقق من المسار كله'],
  time: ['Distance, speed and time', 'Distancia, velocidad y tiempo', 'Distance, vitesse et temps', 'Расстояние, скорость и время', 'מרחק, מהירות וזמן', 'المسافة والسرعة والزمن'],
  formula: ['Time = distance ÷ speed', 'Tiempo = distancia ÷ velocidad', 'Temps = distance ÷ vitesse', 'Время = расстояние ÷ скорость', 'זמן = מרחק ÷ מהירות', 'الزمن = المسافة ÷ السرعة'],
  distanceExample: ['3 nautical miles', '3 millas náuticas', '3 milles marins', '3 морские мили', '3 מיילים ימיים', '3 أميال بحرية'],
  speedExample: ['4 knots', '4 nudos', '4 nœuds', '4 кн', '4 קשר', '4 عقد'],
  timeExample: ['45 minutes', '45 minutos', '45 minutes', '45 минут', '45 דקות', '45 دقيقة'],
  lookout: ['Scan all around', 'Vigila todo alrededor', 'Observer tout autour', 'Осматривайтесь вокруг', 'תצפית לכל הכיוונים', 'راقب جميع الاتجاهات'],
  bearing: ['Constant bearing, closing range', 'Demora constante, menor distancia', 'Relèvement constant, distance réduite', 'Пеленг постоянен, дистанция меньше', 'תכווין קבוע, טווח מצטמצם', 'اتجاه ثابت ومسافة تتناقص'],
  risk: ['Reassess collision risk early', 'Evalúa pronto el riesgo de abordaje', 'Évaluer tôt le risque de collision', 'Оцените риск столкновения заранее', 'העריכו מוקדם סכנת התנגשות', 'قيّم خطر التصادم مبكرًا'],
  lights: ['Sidelights: viewed from above', 'Luces de costado: vista superior', 'Feux de côté : vue de dessus', 'Бортовые огни: вид сверху', 'אורות צד: מבט מלמעלה', 'الأضواء الجانبية: منظر علوي'],
  safety: ['Prepare crew and boat', 'Prepara tripulación y barco', 'Préparer l’équipage et le bateau', 'Подготовьте экипаж и яхту', 'הכנת צוות ויאכטה', 'جهّز الطاقم والقارب'],
  lifejacket: ['Fit lifejackets', 'Ajusta los chalecos', 'Ajuster les gilets', 'Подгоните жилеты', 'התאמת אפודי הצלה', 'اضبط سترات النجاة'],
  hazards: ['Brief the hazards', 'Explica los peligros', 'Présenter les dangers', 'Обсудите опасности', 'תדריך סיכונים', 'اشرح المخاطر'],
  forecast: ['Check conditions', 'Consulta las condiciones', 'Vérifier les conditions', 'Проверьте условия', 'בדיקת תנאים', 'تحقق من الظروف'],
  plan: ['Agree an escape plan', 'Acuerda una alternativa', 'Convenir d’un repli', 'План отхода', 'תכנית חלופית', 'اتفقوا على خطة بديلة'],
  weather: ['Keep a safe alternative', 'Mantén una alternativa segura', 'Garder une solution de repli', 'Сохраните безопасную альтернативу', 'שמרו חלופה בטוחה', 'احتفظ بخيار آمن بديل'],
  exposed: ['Exposed coast', 'Costa expuesta', 'Côte exposée', 'Открытый берег', 'חוף חשוף', 'ساحل مكشوف'],
  shelter: ['Sheltered alternative', 'Alternativa abrigada', 'Abri de repli', 'Защищённая альтернатива', 'חלופה מוגנת', 'بديل محمي'],
  person: ['Person overboard: first priorities', 'Persona al agua: prioridades', 'Homme à la mer : priorités', 'Человек за бортом: приоритеты', 'אדם בים: סדרי עדיפויות', 'شخص في الماء: الأولويات'],
  alarm: ['Raise the alarm', 'Da la alarma', 'Donner l’alerte', 'Поднять тревогу', 'התרעה', 'أطلق الإنذار'],
  point: ['Keep pointing', 'No dejes de señalar', 'Garder le pointage', 'Не терять из виду', 'הצבעה רציפה', 'واصل الإشارة'],
  flotation: ['Deploy flotation', 'Lanza flotación', 'Lancer une aide flottante', 'Подать спасательный круг', 'השלכת אמצעי ציפה', 'ألقِ وسيلة طفو'],
  help: ['Call for help as needed', 'Pide ayuda si hace falta', 'Appeler les secours si nécessaire', 'Вызвать помощь по ситуации', 'הזעקת עזרה לפי הצורך', 'اطلب المساعدة عند الحاجة'],
  distress: ['Essential distress information', 'Información esencial de socorro', 'Informations de détresse essentielles', 'Главные сведения о бедствии', 'מידע חיוני בהודעת מצוקה', 'معلومات الاستغاثة الأساسية'],
  identity: ['Identity', 'Identidad', 'Identité', 'Кто вы', 'זהות', 'الهوية'],
  position: ['Position', 'Posición', 'Position', 'Местоположение', 'מיקום', 'الموقع'],
  danger: ['Nature of danger', 'Naturaleza del peligro', 'Nature du danger', 'Характер опасности', 'סוג הסכנה', 'طبيعة الخطر'],
  assistance: ['Assistance needed', 'Ayuda necesaria', 'Assistance nécessaire', 'Какая помощь нужна', 'עזרה נדרשת', 'المساعدة المطلوبة'],
  transfer: ['Build skills in three stages', 'Desarrolla habilidades en tres fases', 'Développer ses compétences en trois étapes', 'Три этапа освоения навыков', 'פיתוח מיומנויות בשלושה שלבים', 'طوّر مهاراتك في ثلاث مراحل'],
  understand: ['Understand', 'Comprender', 'Comprendre', 'Понять', 'הבנה', 'افهم'],
  rehearse: ['Rehearse here', 'Practicar aquí', 'Répéter ici', 'Отработать здесь', 'תרגול כאן', 'تدرّب هنا'],
  instructor: ['Train on the water', 'Aprender en el agua', 'Apprendre sur l’eau', 'Учиться на воде', 'הדרכה במים', 'تدرّب على الماء'],
  tide: ['Depth and under-keel clearance', 'Profundidad y margen bajo quilla', 'Profondeur et pied de pilote', 'Глубина и запас под килем', 'עומק ומרווח מתחת לשדרן', 'العمق والخلوص تحت العارضة'],
  datum: ['Chart datum', 'Datum de la carta', 'Zéro hydrographique', 'Нуль глубин карты', 'אפס המפה', 'مرجع أعماق الخريطة'],
  tideHeight: ['Tide: 1.1 m', 'Marea: 1,1 m', 'Marée : 1,1 m', 'Прилив: 1,1 м', 'גובה גאות: 1.1 מ׳', 'ارتفاع المد: 1.1 م'],
  chartDepth: ['Charted depth: 2.4 m', 'Sonda en carta: 2,4 m', 'Sonde carte : 2,4 m', 'Глубина по карте: 2,4 м', 'עומק במפה: 2.4 מ׳', 'العمق المخطط: 2.4 م'],
  draft: ['Draft: 1.8 m', 'Calado: 1,8 m', 'Tirant d’eau : 1,8 m', 'Осадка: 1,8 м', 'שוקע: 1.8 מ׳', 'الغاطس: 1.8 م'],
  clearance: ['Static clearance: 1.7 m', 'Margen estático: 1,7 m', 'Marge statique : 1,7 m', 'Статический запас: 1,7 м', 'מרווח סטטי: 1.7 מ׳', 'الخلوص الساكن: 1.7 م'],
  crosscheck: ['Cross-check independent evidence', 'Contrasta pruebas independientes', 'Recouper des observations indépendantes', 'Сверяйте независимые данные', 'הצליבו מידע ממקורות עצמאיים', 'قارن أدلة مستقلة'],
  visualFix: ['Identified visual references', 'Referencias visuales identificadas', 'Repères visuels identifiés', 'Опознанные береговые ориентиры', 'סימני ניווט מזוהים', 'معالم بصرية محددة'],
  depthTrend: ['Depth trend + tide', 'Tendencia de sonda + marea', 'Évolution des sondes + marée', 'Изменение глубины + прилив', 'מגמת עומק + גאות', 'اتجاه تغير العمق + المد'],
  plottedPosition: ['Plotter position', 'Posición del plotter', 'Position sur le traceur', 'Позиция на картплоттере', 'מיקום בתוויין', 'الموقع على الراسم'],
  resolve: ['Disagree? Stay in verified safe water.', '¿No coinciden? Mantén aguas seguras verificadas.', 'Désaccord ? Rester en eau sûre vérifiée.', 'Данные расходятся? Останьтесь в проверенных водах.', 'סתירה? הישארו במים שבטיחותם אומתה.', 'تعارض؟ ابق في مياه ثبت أمانها.'],
};

const NOTES = {
  yacht: ['Names stay with the boat, even when you turn around.', 'Los nombres permanecen con el barco aunque te gires.', 'Ces noms restent liés au bateau, même si vous vous retournez.', 'Названия сторон не меняются, когда вы поворачиваетесь.', 'שמות הצדדים שייכים ליאכטה גם כשמסתובבים.', 'تبقى أسماء الجوانب ثابتة للقارب حتى عندما تستدير.'],
  controls: ['Hoist sets height; sheets set angle; reefing reduces area.', 'La driza controla la altura; la escota el ángulo; el rizo reduce superficie.', 'La drisse règle la hauteur, l’écoute l’angle, le ris réduit la surface.', 'Фал задаёт высоту, шкот — угол, риф уменьшает площадь.', 'המעלן קובע גובה, המיתר זווית, והצמצום מקטין שטח.', 'حبل الرفع يحدد الارتفاع وحبل الشد الزاوية والتصغير يقلل المساحة.'],
  points: ['Angles are relative to the wind source, not north. The model’s no-go limit is ±38°.', 'Los ángulos se miden desde el origen del viento, no el norte. Límite del modelo: ±38°.', 'Les angles se mesurent depuis l’origine du vent, pas le nord. Limite du modèle : ±38°.', 'Углы отсчитываются от источника ветра, не от севера. Граница модели: ±38°.', 'הזוויות ביחס למקור הרוח, לא לצפון. גבול התחום במודל הוא ±38°.', 'الزوايا بالنسبة لمصدر الرياح لا للشمال. حد المنطقة في النموذج ±38°.'],
  tack: ['The bow crosses the wind. Prepare the crew, keep momentum, then settle on the new tack.', 'La proa cruza el viento. Prepara a la tripulación, conserva inercia y estabiliza la nueva amura.', 'L’étrave passe dans le vent. Préparer l’équipage, garder de l’erre puis stabiliser la nouvelle amure.', 'Нос проходит через ветер. Подготовьте экипаж, сохраните ход и выйдите на новый галс.', 'החרטום חוצה את הרוח. הכינו את הצוות, שמרו תנופה והתייצבו במפנה החדש.', 'تعبر المقدمة اتجاه الرياح. جهّز الطاقم وحافظ على الحركة ثم استقر على الجانب الجديد.'],
  gybe: ['The wind crosses the stern. The boom changes sides: crew preparation and boom control matter.', 'El viento cruza la popa. La botavara cambia de lado: prepara a la tripulación y controla su movimiento.', 'Le vent passe par la poupe. La bôme change de côté : préparer l’équipage et maîtriser son passage.', 'Ветер пересекает корму. Гик меняет сторону: подготовьте экипаж и контролируйте гик.', 'הרוח חוצה את הירכתיים. המנור עובר צד: הכנת הצוות ושליטה במנור חיוניות.', 'تعبر الرياح المؤخرة ويتغير جانب الذراع؛ إعداد الطاقم والتحكم في الذراع مهمان.'],
  apparent: ['Airflow vectors point where air moves. Apparent airflow = true airflow − boat velocity.', 'Los vectores indican hacia dónde se mueve el aire. Flujo aparente = flujo real − velocidad del barco.', 'Les vecteurs indiquent le mouvement de l’air. Écoulement apparent = réel − vitesse du bateau.', 'Векторы показывают движение воздуха. Вымпельный поток = истинный поток − скорость яхты.', 'החצים מציינים לאן האוויר נע. זרימה מדומה = זרימה אמיתית פחות מהירות היאכטה.', 'تشير المتجهات إلى حركة الهواء. التدفق الظاهري = التدفق الحقيقي − سرعة القارب.'],
  track: ['The bow points north; an east-going current changes the ground track. Leeway can also change it.', 'La proa apunta al norte; la corriente hacia el este cambia la trayectoria. El abatimiento también influye.', 'L’étrave pointe au nord ; un courant vers l’est dévie la route fond. La dérive due au vent agit aussi.', 'Нос направлен на север; течение на восток меняет путь над грунтом. Влияет и ветровой дрейф.', 'החרטום צפונה; זרם מזרחה משנה את הנתיב מעל הקרקע. גם סטייה מהרוח משפיעה.', 'المقدمة نحو الشمال؛ تيار نحو الشرق يغيّر المسار الفعلي. والانجراف الجانبي يؤثر أيضًا.'],
  helm: ['Repeat the cycle. Centering the helm reduces a turn; it does not restore a previous heading.', 'Repite el ciclo. Centrar reduce el giro; no recupera automáticamente el rumbo anterior.', 'Répéter le cycle. Centrer réduit le virage ; cela ne rétablit pas le cap précédent.', 'Повторяйте цикл. Руль прямо уменьшает поворот, но не возвращает прежний курс.', 'חזרו על המחזור. מרכוז מקטין את הפנייה ואינו משחזר כיוון קודם.', 'كرر الدورة. توسيط الدفة يقلل الدوران ولا يعيد الاتجاه السابق تلقائيًا.'],
  motor: ['With starboard helm held, bow rotation reverses once water flow reverses. Prop walk is not modeled.', 'Con timón a estribor, el giro de proa se invierte al invertirse el flujo. No se modela el efecto transversal de hélice.', 'Barre à tribord maintenue : la rotation s’inverse avec l’écoulement. Le pas d’hélice transversal n’est pas simulé.', 'При руле вправо поворот носа меняет знак с обратным потоком. Поперечная сила винта не моделируется.', 'בהגה ימינה, סיבוב החרטום מתהפך כשהזרימה מתהפכת. השפעת צד של המדחף אינה מדומה.', 'مع تثبيت الدفة للميمنة ينعكس دوران المقدمة عند انعكاس تدفق الماء. أثر المروحة الجانبي غير ممثل.'],
  stopping: ['Removing drive does not remove momentum. Leave room and expect weaker steering as speed falls.', 'Quitar empuje no quita inercia. Deja espacio y prevé menor gobierno al bajar la velocidad.', 'Supprimer la poussée ne supprime pas l’inertie. Prévoir de l’espace et une barre moins efficace en ralentissant.', 'Убрать тягу — не значит убрать инерцию. Оставьте место; на малом ходу руль слабее.', 'הסרת כוח הנעה אינה מבטלת תנע. השאירו מרחב וצפו ליעילות הגה נמוכה כשהמהירות יורדת.', 'إزالة الدفع لا تزيل القصور الذاتي. اترك مساحة وتوقع ضعف التوجيه مع انخفاض السرعة.'],
  anchor: ['Scope uses roller-to-seabed distance. Rode length alone does not guarantee holding or safe swing room.', 'La relación usa la distancia rodillo-fondo. La longitud no garantiza agarre ni espacio de borneo.', 'Le rapport utilise la hauteur davier-fond. La longueur seule ne garantit ni tenue ni évitage sûr.', 'Кратность учитывает высоту от роульса до дна. Одна длина не гарантирует держание и место для разворота.', 'היחס משתמש במרחק מהגלגלת לקרקעית. אורך לבדו אינו מבטיח אחיזה או מרחב סיבוב.', 'تستخدم النسبة المسافة من البكرة للقاع. الطول وحده لا يضمن الثبات أو مساحة دوران آمنة.'],
  route: ['A direct bearing may cross danger. Check every leg, depth, wind angle, and an escape option.', 'La demora directa puede cruzar peligros. Revisa cada tramo, profundidad, viento y alternativa.', 'Le relèvement direct peut couper un danger. Vérifier chaque étape, profondeur, vent et repli.', 'Прямой пеленг может вести через опасность. Проверьте каждый участок, глубину, ветер и отход.', 'תכווין ישיר עלול לחצות סכנה. בדקו כל קטע, עומק, זווית רוח וחלופה.', 'قد يمر الاتجاه المباشر عبر خطر. تحقق من كل مرحلة والعمق وزاوية الرياح والخيار البديل.'],
  time: ['3 ÷ 4 = 0.75 hours = 45 minutes. This assumes steady speed and no current; update estimates as conditions change.', '3 ÷ 4 = 0,75 horas = 45 minutos. Se supone velocidad constante sin corriente; actualiza con las condiciones.', '3 ÷ 4 = 0,75 heure = 45 minutes. Vitesse constante sans courant ; actualiser selon les conditions.', '3 ÷ 4 = 0,75 часа = 45 минут. Без течения и с постоянной скоростью; уточняйте расчёт при изменении условий.', '\u20663 ÷ 4 = 0.75\u2069 שעות, כלומר 45 דקות. בהנחת מהירות קבועה ללא זרם; עדכנו הערכות עם שינוי התנאים.', '\u20663 ÷ 4 = 0.75\u2069 ساعة، أي 45 دقيقة. بافتراض سرعة ثابتة دون تيار؛ حدّث التقديرات مع تغير الظروف.'],
  lookout: ['Look ahead, astern, and to both sides. Sails can hide traffic; use sight, hearing, and appropriate aids.', 'Mira a proa, popa y ambos lados. Las velas ocultan tráfico; usa vista, oído y ayudas adecuadas.', 'Observer devant, derrière et sur les côtés. Les voiles peuvent masquer le trafic ; utiliser vue, ouïe et aides adaptées.', 'Смотрите вперёд, назад и по бортам. Паруса скрывают суда; используйте зрение, слух и приборы.', 'הביטו קדימה, אחורה ולצדדים. המפרשים עלולים להסתיר כלי שיט; השתמשו בראייה, שמיעה ואמצעי עזר.', 'راقب أمامك وخلفك وعلى الجانبين. قد تحجب الأشرعة حركة المرور؛ استخدم النظر والسمع والوسائل المناسبة.'],
  bearing: ['Successive parallel sightlines with shrinking range warn of risk; check the full encounter and act early.', 'Líneas de visión paralelas con menor distancia advierten riesgo; evalúa el encuentro y actúa pronto.', 'Des visées parallèles avec une distance décroissante signalent un risque ; évaluer la rencontre et agir tôt.', 'Параллельные линии визирования при сближении предупреждают о риске. Оцените ситуацию и действуйте заранее.', 'קווי ראייה מקבילים עם טווח מצטמצם מתריעים על סיכון; העריכו את המפגש ופעלו מוקדם.', 'خطوط رؤية متوازية مع تناقص المسافة تنذر بالخطر؛ قيّم الموقف كاملًا وتصرف مبكرًا.'],
  lights: ['Port is red; starboard is green. Each sidelight covers 112.5°. This is only part of the recognition syllabus.', 'Babor rojo, estribor verde. Cada luz cubre 112,5°. Es solo parte del temario de reconocimiento.', 'Bâbord rouge, tribord vert. Chaque feu couvre 112,5°. Ce n’est qu’une partie de la reconnaissance.', 'Левый огонь красный, правый зелёный. Сектор каждого 112,5°. Это лишь часть правил опознавания.', 'שמאל אדום, ימין ירוק. כל אור צד מכסה 112.5°. זהו רק חלק מלימוד זיהוי האורות.', 'الميسرة حمراء والميمنة خضراء. قطاع كل ضوء 112.5°. هذا جزء فقط من منهج التعرف.'],
  safety: ['Prepare before departure: people, hazards, conditions, and a workable alternative.', 'Prepara antes de salir: personas, peligros, condiciones y una alternativa viable.', 'Préparer avant le départ : personnes, dangers, conditions et solution de repli viable.', 'До отхода подготовьте людей, обсудите опасности, условия и запасной план.', 'התכוננו לפני יציאה: אנשים, סיכונים, תנאים וחלופה מעשית.', 'استعد قبل المغادرة: الأشخاص والمخاطر والظروف وخيار بديل قابل للتنفيذ.'],
  weather: ['Exposure and lee shores reduce recovery room. Reassess the whole forecast and choose conservative alternatives.', 'La exposición y una costa a sotavento reducen el margen. Revisa toda la previsión y elige alternativas prudentes.', 'L’exposition et une côte sous le vent réduisent la marge. Réévaluer toutes les prévisions et choisir prudemment.', 'Открытый и подветренный берег уменьшают запас места. Оцените весь прогноз и выберите осторожный вариант.', 'חשיפה וחוף במורד הרוח מקטינים מרחב התאוששות. בחנו את התחזית כולה ובחרו חלופות שמרניות.', 'السواحل المكشوفة وتحت الريح تقلل مساحة التعافي. راجع التوقعات كاملة واختر بدائل متحفظة.'],
  person: ['These priorities can happen together. Returning, stopping safely, lifting aboard, and aftercare also require training.', 'Estas prioridades pueden ser simultáneas. Volver, parar, izar a bordo y atender también requieren formación.', 'Ces priorités peuvent être simultanées. Retour, arrêt sûr, remontée à bord et soins demandent aussi une formation.', 'Эти действия могут идти одновременно. Возврат, остановка, подъём и помощь тоже требуют обучения.', 'אפשר לבצע סדרי עדיפויות אלה במקביל. חזרה, עצירה בטוחה, העלאה וטיפול דורשים גם הם הכשרה.', 'قد تنفذ هذه الأولويات معًا. العودة والتوقف الآمن والرفع على المتن والرعاية تحتاج تدريبًا أيضًا.'],
  distress: ['Rehearse without transmitting. In a real emergency, use the appropriate local distress procedures.', 'Practica sin transmitir. En una emergencia real, utiliza los procedimientos locales de socorro.', 'Répéter sans émettre. En urgence réelle, utiliser les procédures de détresse locales appropriées.', 'Репетируйте без передачи в эфир. При бедствии используйте применимые местные процедуры.', 'תרגלו ללא שידור. במצוקה אמיתית השתמשו בנוהלי המצוקה המקומיים המתאימים.', 'تدرّب دون إرسال. في الطوارئ الحقيقية استخدم إجراءات الاستغاثة المحلية المناسبة.'],
  transfer: ['Simulator practice prepares you for supervised training; it does not certify real-world competence.', 'La simulación prepara para formación supervisada; no certifica competencia real.', 'La simulation prépare à une formation encadrée ; elle ne certifie pas une compétence réelle.', 'Симулятор готовит к обучению с инструктором, но не подтверждает реальные навыки.', 'התרגול מכין להדרכה בפיקוח ואינו מאשר כשירות בעולם האמיתי.', 'تدريب المحاكي يهيئ للتدريب بإشراف ولا يثبت الكفاءة الواقعية.'],
  tide: ['2.4 + 1.1 − 1.8 = 1.7 m static clearance. Compatible datum and time are essential; dynamic allowances remain.', '2,4 + 1,1 − 1,8 = 1,7 m de margen estático. Datum y hora deben ser compatibles; faltan márgenes dinámicos.', '2,4 + 1,1 − 1,8 = 1,7 m de marge statique. Références et heures compatibles ; prévoir les marges dynamiques.', '2,4 + 1,1 − 1,8 = 1,7 м статического запаса. Нужны совместимые нуль и время; учтите динамические поправки.', '2.4 + 1.1 − 1.8 = 1.7 מ׳ מרווח סטטי. נדרשים אפס וזמן תואמים; עדיין נחוצות קצבאות דינמיות.', '2.4 + 1.1 − 1.8 = 1.7 م خلوص ساكن. يلزم توافق المرجع والوقت مع احتساب الهوامش الديناميكية.'],
  crosscheck: ['Two screens using one GPS are not independent. Resolve conflicting observations before entering constrained water.', 'Dos pantallas con un GPS no son independientes. Resuelve las discrepancias antes de entrar en aguas restringidas.', 'Deux écrans partageant un GPS ne sont pas indépendants. Résoudre les écarts avant d’entrer en eau resserrée.', 'Два экрана с одним GPS не независимы. Устраните расхождения до входа в стеснённые воды.', 'שני מסכים המשתמשים באותו GPS אינם עצמאיים. פתרו סתירות לפני כניסה למים מוגבלים.', 'شاشتان تستخدمان GPS واحدًا ليستا مستقلتين. عالج تعارض المشاهدات قبل دخول مياه مقيدة.'],
};

WORDS.marina=['Marina practice route','Ruta de práctica en la marina','Parcours pratique au port','Учебный маршрут в марине','מסלול תרגול במרינה','مسار التدريب في المرسى'];
NOTES.marina=['Follow the numbered targets in order. Keep clear of the dock fingers and other boats. A stopping target requires the correct position, heading, low ground speed, and neutral.','Sigue los objetivos numerados en orden. Evita los pantalanes y otros barcos. Para detenerte debes cumplir posición, rumbo, velocidad sobre el fondo baja y punto muerto.','Suivez les cibles numérotées dans l’ordre. Évitez les pontons et les autres bateaux. Un arrêt exige position, cap, faible vitesse fond et point mort.','Проходите пронумерованные цели по порядку. Не касайтесь причалов и других судов. Для остановки нужны заданные положение, курс, малая скорость относительно грунта и нейтраль.','עברו בין היעדים הממוספרים לפי הסדר. שמרו מרחק מהרציפים ומכלי שיט אחרים. עצירה דורשת מיקום וכיוון מתאימים, מהירות נמוכה ביחס לקרקע והילוך סרק.','اتبع الأهداف المرقمة بالترتيب. ابتعد عن الأرصفة والقوارب الأخرى. يتطلب التوقف موضعًا واتجاهًا صحيحين وسرعة منخفضة فوق القاع ووضع الحياد.'];
const TOPICS = ['safety','yacht','controls','track','points','controls','points','helm','points','points','points','controls','points','tack','gybe','points','apparent','controls','stopping','weather','route','route','time','route','lookout','bearing','lights','weather','motor','anchor','anchor','anchor','person','distress','route','transfer','route','tide','track','weather','bearing','crosscheck','marina','marina','marina'];
const C = {ink:'#173a4d',muted:'#416477',sea:'#e1e9dd',line:'#adc2be',blue:'#176aa1',teal:'#087d7b',amber:'#925800',red:'#b53743',green:'#14704c',white:'#fff',land:'#c6d4b5'};
let figureSerial = 0;
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function splitLabel(value, max=28) {
  const lines=[];
  for(const word of value.split(/\s+/)) {
    if(!lines.length || (lines.at(-1)+' '+word).length>max) lines.push(word);
    else lines[lines.length-1]+=' '+word;
  }
  return lines;
}

/** Returns a self-contained, accessible SVG string. Pass the current locale code.
 * Unknown lessons intentionally return an empty string rather than unrelated art.
 * All supplied lesson text is escaped; no external images, scripts, or foreignObject.
 */
export function renderTeachingFigure(lesson, lang='en') {
  if(isColregsLesson(lesson)) return renderColregsFigure(lesson,lang);
  const code=String(lang).toLowerCase().split(/[-_]/)[0];
  const locale=LANGS.includes(code)?code:'en', index=LANGS.indexOf(locale);
  const number=/^sail-(\d{2})$/.exec(String(lesson?.id ?? ''))?.[1];
  const topic=TOPICS[Number(number)-1];
  if(!topic) return '';
  const id=`teaching-${number}-${locale}-${++figureSerial}`;
  const t=key=>WORDS[key]?.[index] ?? key;
  const note=getTeachingFigureCaption(lesson,locale);
  const rtl=locale==='he'||locale==='ar';
  const text=(x,y,value,{size=19,color=C.ink,anchor='middle',weight=600,max=28}={})=>{
    const lines=splitLabel(value,max);
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-weight="${weight}" direction="${rtl?'rtl':'ltr'}" unicode-bidi="plaintext">${lines.map((line,i)=>`<tspan x="${x}" dy="${i?size*1.22:0}">${escape(line)}</tspan>`).join('')}</text>`;
  };
  const label=(x,y,key,options)=>text(x,y,t(key),options);
  const line=(x1,y1,x2,y2,color=C.line,width=2,dash='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const markers=new Map();
  const arrowPath=(d,color=C.blue,width=4,dash='',kind='')=>{
    const key=`${color}-${width}`;
    if(!markers.has(key)) markers.set(key,{id:`${id}-arrow-${markers.size+1}`,color,size:Math.max(11,width*3.2)});
    // Let the SVG marker follow the exact final tangent, including curved paths.
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" marker-end="url(#${markers.get(key).id})"${dash?` stroke-dasharray="${dash}"`:''}${kind?` data-arrow-kind="${kind}"`:''}/>`;
  };
  const arrow=(x1,y1,x2,y2,color=C.blue,width=4,dash='',kind='')=>arrowPath(`M${x1} ${y1}L${x2} ${y2}`,color,width,dash,kind);
  const boat=(x,y,angle=0,scale=1,color=C.blue,opacity=1)=>`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" opacity="${opacity}"><path d="M0 -39C18 -20 23 17 16 35Q0 43 -16 35C-23 17 -18 -20 0 -39Z" fill="${C.white}" stroke="${color}" stroke-width="3"/><path d="M0 -25V28M-10 14H10V28H-10Z" fill="${C.sea}" stroke="${color}" stroke-width="2"/><circle cy="-6" r="4" fill="${color}"/></g>`;
  const bubble=(x,y,n)=>`<circle cx="${x}" cy="${y}" r="17" fill="${C.blue}"/>${text(x,y+6,String(n),{color:C.white,size:18})}`;
  const wind=()=>label(380,44,'wind',{size:18,max:48})+[280,380,480].map(x=>arrow(x,62,x,105,C.teal,3)).join('');
  let art='';

  if(topic==='yacht') {
    art=`<path d="M146 249H593L551 285H195Z" fill="white" stroke="${C.blue}" stroke-width="3"/><path d="M350 98V248M350 110L497 222H350ZM337 126L180 224H337Z" fill="#fffdf4" stroke="${C.blue}" stroke-width="3"/><path d="M349 222H505M335 285L349 333H388L407 285M537 284L529 318" fill="${C.line}" stroke="${C.blue}" stroke-width="4"/>`;
    art+=line(190,248,120,202)+label(103,189,'bow');
    art+=line(563,262,639,216)+label(651,204,'stern');
    art+=line(350,116,422,84)+label(468,81,'mast');
    art+=label(255,214,'jib',{size:17,max:20})+label(413,198,'main',{size:17,max:22});
    art+=label(383,363,'keel')+label(568,348,'rudder')+line(540,314,566,328);
    art+=label(492,247,'boom',{size:17});
  } else if(topic==='controls') {
    const reefed=Number(number)===18;
    art=`<path d="M199 299H568L534 324H224Z" fill="white" stroke="${C.blue}" stroke-width="3"/><path d="M321 82V300M325 ${reefed?143:96}L487 264H325Z" fill="#fffdf4" stroke="${C.blue}" stroke-width="3"/><path d="M325 265H493" stroke="${C.blue}" stroke-width="6"/>`;
    art+=arrow(299,243,299,112,C.teal)+line(289,171,234,171,C.teal)+label(156,164,'halyard',{max:16,color:C.teal});
    art+=`<path d="M477 266L433 302L477 283" fill="none" stroke="${C.amber}" stroke-width="4"/>`+line(478,284,585,278,C.amber)+label(625,270,'sheet',{max:18,color:C.amber});
    art+=`<path d="M329 232H455" stroke="${C.red}" stroke-width="3" stroke-dasharray="6 5"/>`+label(440,365,'reef',{color:C.red,max:35});
    if(reefed) art+=`<path d="M325 96L487 264" fill="none" stroke="${C.line}" stroke-width="2" stroke-dasharray="5 6"/>`;
  } else if(topic==='points') {
    const cx=380,cy=224,r=113;
    art=wind()+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.line}" stroke-width="2"/><path d="M380 224L310.4 135A113 113 0 0 1 449.6 135Z" fill="#f4cbd0" stroke="${C.red}" stroke-width="2"/>`;
    art+=label(380,158,'nogo',{size:16,max:19})+text(380,183,'±38°',{size:17,color:C.red});
    const focus={9:90,10:48,11:135}[Number(number)] ?? null;
    for(const angle of [48,90,135,180,225,270,312]) {
      const rad=angle*Math.PI/180;
      art+=boat(cx+Math.sin(rad)*r,cy-Math.cos(rad)*r,angle,.48,angle===focus?C.teal:C.blue,focus&&angle!==focus?.55:1);
    }
    art+=label(572,128,'close',{max:20})+text(572,153,'45°–58°',{size:16,weight:500});
    art+=label(571,229,'beam',{max:21})+text(571,254,'≈90°',{size:16,weight:500});
    art+=label(177,303,'broad',{max:19})+text(177,332,'120°–150°',{size:16,weight:500});
    art+=label(380,382,'run',{max:29,size:17});
  } else if(topic==='tack'||topic==='gybe') {
    const tack=topic==='tack';
    art=wind();
    const startY=tack?323:143,endY=tack?143:323;
    art+=arrowPath(`M305 ${startY}C405 ${tack?223:243} 405 ${tack?243:223} 305 ${endY}L269 ${endY+(tack?-36:36)}`,C.blue,4,'9 7',tack?'tack-route':'gybe-route');
    art+=boat(305,startY,tack?45:135,.86)+boat(380,233,tack?0:180,.7,C.teal,.75)+boat(305,endY,tack?315:225,.86);
    art+=label(165,startY+6,'before')+label(165,endY+6,'after');
    art+=label(553,222,tack?'bow':'stern',{color:C.teal,max:23})+line(425,233,480,233,C.teal,2);
    if(!tack) art+=label(558,292,'boomClear',{color:C.red,max:23,size:17});
  } else if(topic==='apparent') {
    // True wind flows east; yacht velocity north; subtract yacht velocity to get southeast flow.
    art+=boat(281,235,0,1.08);
    art+=arrow(308,226,308,99,C.blue)+label(222,95,'boatMotion',{color:C.blue,max:16});
    art+=arrow(308,226,488,226,C.teal)+label(596,214,'trueFlow',{color:C.teal,max:20,size:18});
    art+=arrow(308,226,488,353,C.amber)+label(592,354,'feltFlow',{color:C.amber,max:19,size:18});
    art+=arrow(488,226,488,346,C.line,3,'6 6');
  } else if(topic==='track') {
    art+=boat(278,307,0,1.03)+arrow(278,253,278,89,C.blue)+arrow(302,275,444,102,C.teal);
    art+=arrow(296,311,510,311,C.amber)+label(548,318,'current',{color:C.amber,max:15});
    art+=label(180,147,'heading',{color:C.blue,max:17})+text(192,177,'000°',{size:21,color:C.blue});
    art+=label(562,145,'course',{color:C.teal,max:22})+label(279,58,'north',{size:18});
    art+=line(444,102,278,102,C.line,2,'5 5');
  } else if(topic==='helm') {
    const nodes=[[218,133,'look'],[538,133,'compare'],[538,305,'correct'],[218,305,'center']];
    art+=arrow(309,127,450,127,C.teal)+arrow(551,177,551,252,C.teal)+arrow(448,303,311,303,C.teal)+arrow(206,252,206,177,C.teal);
    for(const [x,y,key] of nodes) art+=`<rect x="${x-87}" y="${y-34}" width="174" height="77" rx="15" fill="white" stroke="${C.line}" stroke-width="2"/>`+label(x,y,key,{max:18});
    art+=boat(380,218,0,.8);
  } else if(topic==='marina') {
    const course=marinaLessons.find(item=>item.id===lesson.id),map=p=>({x:120+(p.x-200)*2.6,y:55+(p.z+75)*1.6});
    for(const body of getWorldBodyDefinitions('haven').filter(b=>b.visual?.type==='pier')){
      const p=map(body);art+=`<rect x="${p.x-body.shape.length*2.6/2}" y="${p.y-body.shape.beam*1.6/2}" width="${body.shape.length*2.6}" height="${body.shape.beam*1.6}" fill="#c5b793" stroke="${C.line}"/>`;
    }
    const route=[course.practice.setup,...course.practice.steps.map(s=>s.value)];
    for(let i=1;i<route.length;i++){const a=map(route[i-1]),b=map(route[i]);art+=arrow(a.x,a.y,b.x,b.y,C.teal,3,'5 4');}
    const start=map(route[0]);art+=boat(start.x,start.y,course.practice.setup.heading,.45);
    course.practice.steps.forEach((step,i)=>{const p=map(step.value);art+=`<circle cx="${p.x}" cy="${p.y}" r="12" fill="white" stroke="${step.kind==='engineStop'?C.amber:C.teal}" stroke-width="3"/>`+text(p.x,p.y+5,String(i+1),{size:15});});
    art+=label(690,53,'north',{size:18})+text(380,379,'≤ 2.5 kn',{size:20});
  } else if(topic==='motor') {
    art+=line(380,86,380,337)+boat(215,236,0,1)+boat(545,236,0,1);
    // Both rudders are physically to starboard. Rotation changes only after sternway.
    art+=line(215,273,235,295,C.red,5)+line(545,273,565,295,C.red,5);
    art+=arrow(132,278,132,148,C.blue,4,'','ahead-motion')+arrow(628,148,628,278,C.amber,4,'','astern-motion');
    art+=arrowPath('M180 155A86 86 0 0 1 285 202',C.teal,4,'','ahead-bow-turn');
    art+=arrowPath('M580 155A86 86 0 0 0 475 202',C.teal,4,'','astern-bow-turn');
    art+=label(215,65,'ahead',{max:23})+label(545,65,'astern',{max:23});
    art+=label(215,333,'bowRight',{max:23})+label(545,333,'bowLeft',{max:23});
    art+=label(380,382,'sameHelm',{size:17,color:C.red,max:66});
  } else if(topic==='stopping') {
    art+=boat(143,210,90,.85)+boat(367,210,90,.85,C.blue,.7)+boat(608,210,90,.85,C.blue,.45);
    art+=arrow(193,210,308,210,C.blue,7)+arrow(417,210,526,210,C.blue,4)+arrow(660,210,688,210,C.blue,2);
    art+=bubble(143,130,1)+bubble(367,130,2)+bubble(608,130,3);
    art+=label(143,292,'powerOff',{max:19})+label(367,292,'coast',{max:20})+label(608,292,'slow',{max:20});
  } else if(topic==='anchor') {
    art+=`<path d="M62 182H690V329H62Z" fill="#d5ebf1"/><path d="M62 328H690V376H62Z" fill="#dedbc5"/><path d="M469 170H612L584 196H490Z" fill="white" stroke="${C.blue}" stroke-width="3"/><path d="M477 171Q322 307 145 328" fill="none" stroke="${C.amber}" stroke-width="4"/><path d="M139 318L145 330L164 321M145 331L143 309" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
    art+=line(617,170,662,170,C.blue)+line(617,328,662,328,C.blue)+line(646,170,646,328,C.blue,3);
    art+=label(342,258,'rode',{color:C.amber,max:24})+label(550,110,'vertical',{max:28});
    art+=line(571,137,642,216,C.blue,2)+label(236,360,'seabed',{max:18});
    art+=label(380,60,'scope',{max:54,size:20});
  } else if(topic==='route'||topic==='weather') {
    art+=`<path d="M307 139Q351 111 395 150Q442 207 403 278Q360 304 305 266Q278 236 295 191Z" fill="none" stroke="#dfc781" stroke-width="30" stroke-linejoin="round"/><path d="M307 139Q351 111 395 150Q442 207 403 278Q360 304 305 266Q278 236 295 191Z" fill="${C.land}" stroke="#789875" stroke-width="2"/>`;
    art+=boat(154,326,35,.75)+line(174,298,533,96,C.red,2,'6 7');
    art+=arrowPath('M174 298L209 128L522 93',C.teal,4,'','planned-route');
    art+=`<circle cx="209" cy="128" r="9" fill="#e3a73b" stroke="${C.ink}" stroke-width="2"/><circle cx="537" cy="91" r="9" fill="#e3a73b" stroke="${C.ink}" stroke-width="2"/>`;
    art+=arrow(670,107,670,60,C.blue,3)+label(671,42,'north',{size:15,max:12});
    art+=label(360,212,topic==='weather'?'exposed':'hazard',{max:19});
    art+=label(542,134,topic==='weather'?'shelter':'waypoint',{max:24});
    art+=label(354,355,topic==='weather'?'plan':'safeRoute',{max:43});
  } else if(topic==='time') {
    art+=label(380,81,'formula',{size:24,max:42});
    art+=line(157,225,603,225,C.blue,4)+`<circle cx="157" cy="225" r="9" fill="${C.blue}"/><circle cx="603" cy="225" r="9" fill="${C.teal}"/>`+boat(380,225,90,.85);
    art+=label(380,153,'distanceExample',{size:24,max:31});
    art+=label(212,315,'speedExample',{size:24,max:23})+label(548,315,'timeExample',{size:24,max:23});
    art+=text(380,318,'→',{size:31,color:C.teal});
  } else if(topic==='lookout') {
    art+=`<circle cx="380" cy="221" r="120" fill="none" stroke="${C.teal}" stroke-width="3" stroke-dasharray="7 6"/>`+boat(380,221,0,1.1);
    for(const a of [0,45,90,135,180,225,270,315]) {const r=a*Math.PI/180;art+=arrow(380+Math.sin(r)*61,221-Math.cos(r)*61,380+Math.sin(r)*100,221-Math.cos(r)*100,C.teal,3);}
    art+=label(380,60,'bow')+label(380,386,'stern')+label(171,226,'port',{max:17})+label(589,226,'starboard',{max:17});
  } else if(topic==='bearing') {
    // Boats converge on one point: sightlines stay parallel as their lengths fall.
    art+=line(164,335,453,85,C.line,2,'6 6')+line(628,335,453,85,C.line,2,'6 6');
    for(const [x1,y1,x2,y2,n] of [[164,335,628,335,1],[280,235,558,235,2],[396,135,488,135,3]]) {
      art+=line(x1,y1,x2,y2,C.amber,2,'6 5')+boat(x1,y1,49,.49)+boat(x2,y2,325,.49,C.teal)+bubble(88,y1,n);
    }
    art+=label(380,56,'risk',{max:51,size:19});
  } else if(topic==='lights') {
    // Each colored sector extends from dead ahead to 22.5 degrees abaft its beam.
    art+=`<path d="M380 242L380 89A153 153 0 0 0 238.6 300.5Z" fill="#f7d3d6" stroke="${C.red}" stroke-width="2"/><path d="M380 242L380 89A153 153 0 0 1 521.4 300.5Z" fill="#ccebdc" stroke="${C.green}" stroke-width="2"/>`;
    art+=boat(380,242,0,1.1)+label(380,60,'bow');
    art+=label(182,206,'port',{color:C.red,max:19})+label(578,206,'starboard',{color:C.green,max:19});
    art+=text(187,239,'112.5°',{color:C.red})+text(575,239,'112.5°',{color:C.green});
  } else if(topic==='tide') {
    // Heights proportional to example: surface y120, datum y186, seabed y330,
    // keel y228. Each metre is 60 viewBox units.
    art+=`<path d="M67 120H693V330H67Z" fill="#d5ebf1"/><path d="M67 330H693V378H67Z" fill="#dedbc5"/><path d="M262 106H455L430 135H284Z" fill="white" stroke="${C.blue}" stroke-width="3"/><path d="M333 135V228H383L399 135" fill="${C.line}" stroke="${C.blue}" stroke-width="3"/>`;
    art+=line(67,186,693,186,C.muted,2,'6 6');
    art+=label(147,171,'datum',{size:16,max:17});
    art+=line(206,120,206,186,C.blue,3)+line(195,120,217,120,C.blue)+line(195,186,217,186,C.blue)+label(138,99,'tideHeight',{size:17,max:24});
    art+=line(206,195,206,330,C.blue,3)+line(195,330,217,330,C.blue)+label(145,255,'chartDepth',{size:17,max:17});
    art+=line(494,120,494,228,C.blue,3)+line(483,120,505,120,C.blue)+line(483,228,505,228,C.blue)+label(593,150,'draft',{size:18,max:22});
    art+=line(494,238,494,330,C.teal,3)+line(483,330,505,330,C.teal)+label(596,274,'clearance',{size:18,max:23,color:C.teal});
    art+=label(370,361,'seabed',{size:18,max:22});
  } else if(topic==='crosscheck') {
    for(const [x,key] of [[150,'visualFix'],[380,'plottedPosition'],[610,'depthTrend']]) {
      art+=`<rect x="${x-99}" y="99" width="198" height="102" rx="14" fill="white" stroke="${C.line}" stroke-width="2"/>`+label(x,135,key,{size:19,max:19});
      art+=arrow(x,213,380+(x-380)*.23,271,C.teal,3);
    }
    art+=`<rect x="127" y="285" width="506" height="89" rx="14" fill="#f2e7cf" stroke="${C.amber}" stroke-width="2"/>`+label(380,318,'resolve',{size:20,max:46,color:C.amber});
  } else {
    const keys={safety:['lifejacket','hazards','forecast','plan'],person:['alarm','point','flotation','help'],distress:['identity','position','danger','assistance'],transfer:['understand','rehearse','instructor']}[topic];
    if(topic==='transfer') {
      for(let i=0;i<3;i++) {
        const x=150+i*230;
        art+=`<circle cx="${x}" cy="196" r="57" fill="white" stroke="${C.line}" stroke-width="2"/>`+bubble(x,196,i+1)+label(x,291,keys[i],{max:22});
        if(i<2) art+=arrow(x+70,196,x+154,196,C.teal);
      }
    } else {
      keys.forEach((key,i)=>{
        const x=205+(i%2)*350,y=119+Math.floor(i/2)*161;
        art+=`<rect x="${x-146}" y="${y-46}" width="292" height="133" rx="17" fill="white" stroke="${C.line}" stroke-width="2"/>`+bubble(x,y-14,i+1)+label(x,y+31,key,{max:27});
      });
    }
  }
  const defs=[...markers.values()].map(marker=>`<marker id="${marker.id}" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="${marker.size}" markerHeight="${marker.size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 -4.5L10 0L0 4.5Z" fill="${marker.color}"/></marker>`).join('');
  return `<svg class="teaching-figure" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430" width="760" height="430" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${locale}" style="display:block;width:100%;height:auto;max-width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif"><title id="${id}-title">${escape(t(topic))}</title><desc id="${id}-desc">${escape(note)}</desc><defs>${defs}</defs><rect width="760" height="430" rx="20" fill="${C.sea}"/><g aria-hidden="true">${art}${label(380,413,'schematic',{size:14,color:C.muted,weight:500,max:90})}</g></svg>`;
}

export function getTeachingFigureCaption(lesson,lang='en') {
  if(isColregsLesson(lesson)) return colregsFigureCaption(lesson,lang);
  const number=/^sail-(\d{2})$/.exec(String(lesson?.id??''))?.[1];
  const topic=TOPICS[Number(number)-1];
  const index=LANGS.indexOf(String(lang).toLowerCase().split(/[-_]/)[0]);
  const note=topic?NOTES[topic][index<0?0:index]:'';
  // Keep the left-to-right equation intact inside Hebrew/Arabic prose.
  return topic==='tide'&&index>=4?note.replace('2.4 + 1.1 − 1.8 = 1.7','\u20662.4 + 1.1 − 1.8 = 1.7\u2069'):note;
}
