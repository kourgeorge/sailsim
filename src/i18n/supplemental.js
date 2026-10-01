// Small runtime compositions and accessibility labels; course content is in locale JSON.
const entries={
 'MIN':['MIN','MIN','دقيقة','דק׳','МИН','MIN'],
 'SAILING PRACTICE · {minutes} MIN':['SAILING PRACTICE · {minutes} MIN','PRÁCTICA · {minutes} MIN','تدريب إبحار · {minutes} دقيقة','תרגול הפלגה · {minutes} דק׳','ПРАКТИКА · {minutes} МИН','PRATIQUE · {minutes} MIN'],
 'KNOWLEDGE · {minutes} MIN':['KNOWLEDGE · {minutes} MIN','TEORÍA · {minutes} MIN','معرفة · {minutes} دقيقة','ידע · {minutes} דק׳','ТЕОРИЯ · {minutes} МИН','THÉORIE · {minutes} MIN'],
 '{minutes} MIN':['{minutes} MIN','{minutes} MIN','{minutes} دقيقة','{minutes} דק׳','{minutes} МИН','{minutes} MIN'],
 'LESSON {number} / {total}':['LESSON {number} / {total}','LECCIÓN {number} / {total}','الدرس {number} / {total}','שיעור {number} / {total}','УРОК {number} / {total}','LEÇON {number} / {total}'],
 'THE SAILING SCHOOL':['THE SAILING SCHOOL','ESCUELA DE VELA','مدرسة الإبحار','בית הספר לשיט','ШКОЛА ПАРУСНОГО СПОРТА','ÉCOLE DE VOILE'],
 'Main {status}':['Main {status}','Mayor: {status}','الشراع الرئيسي: {status}','מפרש ראשי: {status}','Грот: {status}','Grand-voile : {status}'],
 'Jib {status}':['Jib {status}','Foque: {status}','الشراع الأمامي: {status}','מפרש חלוץ: {status}','Стаксель: {status}','Foc : {status}'],
 '{number} reefs':['{number} reefs','{number} rizos','عدد الريفات: {number}','דרגות צמצום: {number}','Рифов: {number}','{number} ris'],
 'scope {value}:1':['scope {value}:1','relación {value}:1','نسبة طول حبل المرساة {value}:1','יחס אורך חבל העוגן {value}:1','Соотношение {value}:1','rapport {value}:1'],
 'depth {value} m':['depth {value} m','profundidad {value} m','العمق {value} م','עומק {value} מ׳','глубина {value} м','profondeur {value} m'],
 '{angle}° port':['{angle}° port','{angle}° a babor','{angle}° إلى الميسرة','{angle}° לשמאל','{angle}° влево','{angle}° à bâbord'],
 '{angle}° starboard':['{angle}° starboard','{angle}° a estribor','{angle}° إلى الميمنة','{angle}° לימין','{angle}° вправо','{angle}° à tribord'],
 'Sail home':['Sail home','Inicio de SAIL','الرئيسية','דף הבית של SAIL','Главная SAIL','Accueil SAIL'],
 'Main navigation':['Main navigation','Navegación principal','التنقل الرئيسي','ניווט ראשי','Основная навигация','Navigation principale'],
 'Sailing simulator':['Sailing simulator','Simulador de navegación a vela','محاكي الإبحار الشراعي','סימולטור שיט מפרשים','Парусный симулятор','Simulateur de voile'],
 'Camera view':['Camera view','Vista de cámara','عرض الكاميرا','תצוגת מצלמה','Вид камеры','Vue caméra'],
 'Helm angle':['Helm angle','Ángulo del timón','زاوية الدفة','זווית הגה','Угол руля','Angle de barre'],
 'Mainsheet trim':['Mainsheet trim','Ajuste de la escota mayor','ضبط حبل الشراع الرئيسي','כיוון מיתר המפרש הראשי','Настройка гика-шкота','Réglage de l’écoute de grand-voile'],
 'Next lesson':['Next lesson','Siguiente lección','الدرس التالي','השיעור הבא','Следующий урок','Leçon suivante'],
 'Steer port / starboard':['Steer port / starboard','Gobernar a babor / estribor','توجيه نحو الميسرة / الميمنة','היגוי לשמאל / לימין','Руль влево / вправо','Barrer à bâbord / tribord'],
 'No-go zone':['No-go zone','Zona no navegable','منطقة عدم الإبحار','הגזרה שאי אפשר להפליג בה','Непроходимая зона против ветра','Secteur non navigable'],
 'Use the helm to steer and the mainsheet to adjust your sail. Select Cockpit to inspect the winches, ropes, and live instruments, or Helm to sail from behind the wheel. The wind comes from the direction shown on the instrument. Your yacht loses power when pointed within 38° of the wind.':[
 'Use the helm to steer and the mainsheet to adjust your sail. Select Cockpit to inspect the winches, ropes, and live instruments, or Helm to sail from behind the wheel. The wind comes from the direction shown on the instrument. Your yacht loses power when pointed within 38° of the wind.',
 'Usa el timón para gobernar y la escota mayor para ajustar la vela. La vista Bañera permite inspeccionar los winches, cabos e instrumentos; Puesto de gobierno sitúa la cámara detrás de la rueda. El indicador señala de dónde viene el viento. El yate pierde propulsión al apuntar a menos de 38° del viento.',
 'استخدم الدفة للتوجيه وحبل الشراع الرئيسي لضبط الشراع. اختر قمرة القيادة لفحص الروافع والحبال والأجهزة، أو عرض الدفة للإبحار من خلف عجلة القيادة. يشير الجهاز إلى اتجاه مصدر الريح. يفقد اليخت قوة الدفع عندما يتجه ضمن زاوية 38° من مصدر الريح.',
 'משתמשים בהגה כדי לנווט ובמיתר הראשי כדי לכוון את המפרש. תצוגת תא ההיגוי מאפשרת לבחון כננות, חבלים ומכשירים; תצוגת ההגה מציבה את המצלמה מאחורי הגלגל. המכשיר מראה מאיזה כיוון מגיעה הרוח. היאכטה מאבדת הנעה כשהחרטום נמצא בטווח של 38° מכיוון הרוח.',
 'Используйте руль для управления курсом, а гика-шкот — для настройки паруса. Вид «Кокпит» позволяет осмотреть лебёдки, снасти и приборы, а вид «У руля» — вести яхту из-за штурвала. Указатель показывает, откуда дует ветер. Яхта теряет тягу при курсе ближе 38° к ветру.',
 'Utilisez la barre pour gouverner et l’écoute de grand-voile pour régler la voile. La vue Cockpit permet d’examiner les winchs, les cordages et les instruments ; la vue Poste de barre vous place derrière la roue. L’instrument indique d’où vient le vent. Le voilier perd sa propulsion à moins de 38° du vent.'
 ],
 'Lessons save automatically in this browser. Explore freely or follow 36 lessons across nine progressive modules. Open Course from the lesson card to browse or resume.':[
 'Lessons save automatically in this browser. Explore freely or follow 36 lessons across nine progressive modules. Open Course from the lesson card to browse or resume.',
 'El progreso se guarda automáticamente en este navegador. Explora libremente o sigue 36 lecciones en nueve módulos progresivos. Abre Curso para consultar las lecciones o continuar.',
 'يُحفظ التقدم تلقائياً في هذا المتصفح. استكشف بحرية أو اتبع 36 درساً ضمن تسع وحدات متدرجة. افتح الدورة لاستعراض الدروس أو متابعة التعلم.',
 'ההתקדמות נשמרת אוטומטית בדפדפן. אפשר לחקור בחופשיות או ללמוד 36 שיעורים בתשע יחידות מדורגות. פתחו את הקורס כדי לעיין בשיעורים או להמשיך ללמוד.',
 'Прогресс автоматически сохраняется в браузере. Исследуйте акваторию свободно или пройдите 36 уроков в девяти последовательных модулях. Откройте «Курс», чтобы выбрать урок или продолжить.',
 'Votre progression est enregistrée automatiquement dans ce navigateur. Explorez librement ou suivez 36 leçons réparties en neuf modules progressifs. Ouvrez Parcours pour parcourir les leçons ou reprendre.'
 ]
};
// Audited fallback, reference-dialog and accessibility strings.
Object.assign(entries, {
  "A browser with WebGL is needed for the 3D view.": [
    "A browser with WebGL is needed for the 3D view.",
    "La vista 3D requiere un navegador compatible con WebGL.",
    "يتطلب العرض ثلاثي الأبعاد متصفحاً يدعم WebGL.",
    "לתצוגת התלת־ממד נדרש דפדפן שתומך ב־WebGL.",
    "Для трёхмерного вида нужен браузер с поддержкой WebGL.",
    "La vue 3D nécessite un navigateur compatible avec WebGL."
  ],
  "You can still use the chart, controls, and lessons.": [
    "You can still use the chart, controls, and lessons.",
    "Puedes seguir usando la carta, los controles y las lecciones.",
    "لا يزال بإمكانك استخدام الخريطة وأدوات التحكم والدروس.",
    "עדיין ניתן להשתמש במפה, בפקדים ובשיעורים.",
    "Карта, органы управления и уроки по-прежнему доступны.",
    "Vous pouvez toujours utiliser la carte, les commandes et les leçons."
  ],
  "SAIL could not start": [
    "SAIL could not start",
    "No se pudo iniciar SAIL",
    "تعذّر تشغيل SAIL",
    "לא ניתן היה להפעיל את SAIL",
    "Не удалось запустить SAIL",
    "Impossible de démarrer SAIL"
  ],
  "Please reload the page.": [
    "Please reload the page.",
    "Vuelve a cargar la página.",
    "يرجى إعادة تحميل الصفحة.",
    "יש לטעון מחדש את הדף.",
    "Пожалуйста, перезагрузите страницу.",
    "Veuillez recharger la page."
  ],
  "Live vessel instruments": [
    "Live vessel instruments",
    "Instrumentos del barco en directo",
    "قراءات أجهزة القارب في الوقت الفعلي",
    "מכשירי השיט בזמן אמת",
    "Показания приборов яхты в реальном времени",
    "Instruments du bateau en direct"
  ],
  "Space": [
    "Space",
    "Espacio",
    "المسافة",
    "רווח",
    "Пробел",
    "Espace"
  ],
  "This original browser prototype draws on the learning themes of": [
    "This original browser prototype draws on the learning themes of",
    "Este prototipo original para navegador se inspira en los temas de aprendizaje de",
    "يستلهم هذا النموذج الأولي الأصلي للمتصفح موضوعاته التعليمية من",
    "אב־טיפוס מקורי זה לדפדפן שואב השראה מנושאי הלימוד של",
    "Этот оригинальный браузерный прототип опирается на учебные темы курса",
    "Ce prototype original pour navigateur s’inspire des thèmes pédagogiques du programme"
  ],
  "eSail’s Learn to Sail": [
    "eSail’s Learn to Sail",
    "Aprender a navegar de eSail",
    "تعلّم الإبحار من eSail",
    "לימוד השיט של eSail",
    "«Учимся ходить под парусом» от eSail",
    "Apprendre la voile d’eSail"
  ],
  ": boat handling, sail trim, tacking, reefing, and anchoring.": [
    ": boat handling, sail trim, tacking, reefing, and anchoring.",
    ": manejo del barco, ajuste de velas, viradas por avante, toma de rizos y fondeo.",
    ": التحكم في القارب، وضبط الأشرعة، وتدوير المقدمة عبر اتجاه الريح، وتقليص مساحة الشراع، والرسو بالمرساة.",
    ": תמרון הסירה, כיוון המפרשים, סיבובים נגד הרוח, צמצום מפרשים ועגינה.",
    ": управление яхтой, настройка парусов, повороты оверштаг, взятие рифов и постановка на якорь.",
    ": conduite du bateau, réglage des voiles, virements de bord, prise de ris et mouillage."
  ],
  "The local reference archive includes original HTML, extracted text, images, and a source manifest in": [
    "The local reference archive includes original HTML, extracted text, images, and a source manifest in",
    "El archivo local de referencia contiene el HTML original, el texto extraído, las imágenes y un registro de fuentes en",
    "يتضمن أرشيف المراجع المحلي ملفات HTML الأصلية والنصوص المستخرجة والصور وسجلاً للمصادر في",
    "ארכיון המקורות המקומי כולל HTML מקורי, טקסט שחולץ, תמונות ורשימת מקורות בתיקייה",
    "Локальный справочный архив содержит исходный HTML, извлечённый текст, изображения и список источников в",
    "L’archive de référence locale contient le HTML original, les textes extraits, les images et un relevé des sources dans"
  ],
  ". The simulator uses original geometry and lesson text.": [
    ". The simulator uses original geometry and lesson text.",
    ". El simulador usa geometría y textos de lecciones originales.",
    ". يستخدم المحاكي نماذج هندسية ونصوص دروس أصلية.",
    ". הסימולטור משתמש בגאומטריה ובטקסטי שיעור מקוריים.",
    ". В симуляторе используются оригинальные геометрия и тексты уроков.",
    ". Le simulateur utilise une géométrie et des textes de leçons originaux."
  ]
});
const codes=['en','es','ar','he','ru','fr'];
export const extraUI=Object.fromEntries(codes.map((code,index)=>[code,Object.fromEntries(Object.entries(entries).map(([key,values])=>[key,values[index]]))]));
