// Original contextual explanations, directly translated into six languages.
// External links support general seamanship context; they do not validate the model.
// Model-specific behavior is documented in docs/PHYSICS.md. Native instructor review is pending.
export const guideLanguages = [
  "en",
  "es",
  "fr",
  "ru",
  "ar",
  "he"
];
export const guideSources = {
  "lewmar-windlass": {
    "id": "lewmar-windlass",
    "publisher": "Lewmar",
    "title": "V1–V6 Windlass Owners Installation, Operation & Servicing Manual (65001201, issue 11)",
    "url": "https://www.lewmar.com/mst_attachment/attachment/click/attachment_id/276/",
    "notePath": "reference/sailing/seamanship/lewmar-windlass.md"
  },
  "imo-colregs": {
    "id": "imo-colregs",
    "publisher": "International Maritime Organization",
    "title": "COLREG — Preventing collisions at sea",
    "url": "https://www.imo.org/en/ourwork/safety/pages/preventing-collisions.aspx",
    "notePath": "reference/sailing/seamanship/imo-colregs.md"
  },
  "uscg-rules": {
    "id": "uscg-rules",
    "publisher": "U.S. Coast Guard Navigation Center",
    "title": "Amalgamated Navigation Rules: International and U.S. Inland",
    "url": "https://www.navcen.uscg.gov/navigation-rules-amalgamated",
    "notePath": "reference/sailing/seamanship/uscg-rules.md"
  },
  "noaa-tides": {
    "id": "noaa-tides",
    "publisher": "NOAA National Ocean Service",
    "title": "What are tides?",
    "url": "https://oceanservice.noaa.gov/facts/tides.html",
    "notePath": "reference/sailing/seamanship/noaa-tides.md"
  },
  "noaa-nautical": {
    "id": "noaa-nautical",
    "publisher": "NOAA National Ocean Service",
    "title": "What is the difference between a nautical mile and a knot?",
    "url": "https://oceanservice.noaa.gov/facts/nautical-mile-knot.html",
    "notePath": "reference/sailing/seamanship/noaa-nautical.md"
  },
  "nws-marine": {
    "id": "nws-marine",
    "publisher": "NOAA National Weather Service",
    "title": "Boating Safety Tips and Resources",
    "url": "https://www.weather.gov/safety/safeboating",
    "notePath": "reference/sailing/seamanship/nws-marine.md"
  },
  "nws-before": {
    "id": "nws-before",
    "publisher": "NOAA National Weather Service",
    "title": "Be Safe! Prepare for Hazards",
    "url": "https://www.weather.gov/safety/safeboating-before",
    "notePath": "reference/sailing/seamanship/nws-before.md"
  },
  "nws-during": {
    "id": "nws-during",
    "publisher": "NOAA National Weather Service",
    "title": "Know What To Do When the Weather Changes",
    "url": "https://www.weather.gov/safety/safeboating-during",
    "notePath": "reference/sailing/seamanship/nws-during.md"
  },
  "nws-warnings": {
    "id": "nws-warnings",
    "publisher": "NOAA National Weather Service",
    "title": "Coastal and Offshore Warnings, Watches and Advisories",
    "url": "https://www.weather.gov/safety/safeboating-ww",
    "notePath": "reference/sailing/seamanship/nws-warnings.md"
  },
  "uscg-dsc": {
    "id": "uscg-dsc",
    "publisher": "U.S. Coast Guard Navigation Center",
    "title": "Digital Selective Calling",
    "url": "https://www.navcen.uscg.gov/digital-selective-calling",
    "notePath": "reference/sailing/seamanship/uscg-dsc.md"
  },
  "met-beaufort": {
    "id": "met-beaufort",
    "publisher": "Met Office",
    "title": "Beaufort wind force scale",
    "url": "https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale",
    "notePath": "reference/sailing/seamanship/met-beaufort.md"
  },
  "noaa-tidal-current": {
    "id": "noaa-tidal-current",
    "publisher": "NOAA National Ocean Service",
    "title": "Tidal Currents",
    "url": "https://oceanservice.noaa.gov/education/tutorial_currents/02tidal1.html",
    "notePath": "reference/sailing/seamanship/noaa-tidal-current.md"
  },
  "uscg-distress": {
    "id": "uscg-distress",
    "publisher": "U.S. Coast Guard Navigation Center",
    "title": "DSC Distress",
    "url": "https://www.navcen.uscg.gov/dsc-distress",
    "notePath": "reference/sailing/seamanship/uscg-distress.md"
  }
};
const metadata = [
  {
    "id": "speed",
    "sourceIds": [
      "noaa-nautical"
    ],
    "lessonIds": [
      "sail-04",
      "sail-23"
    ]
  },
  {
    "id": "heading",
    "sourceIds": [
      "noaa-tidal-current"
    ],
    "lessonIds": [
      "sail-04",
      "sail-08",
      "sail-22"
    ]
  },
  {
    "id": "wind",
    "sourceIds": [
      "met-beaufort"
    ],
    "lessonIds": [
      "sail-05",
      "sail-17"
    ]
  },
  {
    "id": "helm",
    "sourceIds": [],
    "lessonIds": [
      "sail-07",
      "sail-08",
      "sail-16",
      "sail-29"
    ]
  },
  {
    "id": "sheets",
    "sourceIds": [],
    "lessonIds": [
      "sail-03",
      "sail-12"
    ]
  },
  {
    "id": "reef",
    "sourceIds": [
      "met-beaufort",
      "nws-during"
    ],
    "lessonIds": [
      "sail-03",
      "sail-18"
    ]
  },
  {
    "id": "engine",
    "sourceIds": [],
    "lessonIds": [
      "sail-19",
      "sail-29"
    ]
  },
  {
    "id": "anchor",
    "sourceIds": [
      "noaa-tides",
      "lewmar-windlass"
    ],
    "lessonIds": [
      "sail-30",
      "sail-31",
      "sail-32"
    ]
  },
  {
    "id": "depth",
    "sourceIds": [
      "noaa-tides"
    ],
    "lessonIds": [
      "sail-04",
      "sail-21",
      "sail-24"
    ]
  },
  {
    "id": "current",
    "sourceIds": [
      "noaa-tidal-current"
    ],
    "lessonIds": [
      "sail-20",
      "sail-23"
    ]
  },
  {
    "id": "lookout",
    "sourceIds": [
      "imo-colregs",
      "uscg-rules"
    ],
    "lessonIds": [
      "sail-25",
      "sail-26",
      "sail-27",
      "sail-46",
      "sail-47",
      "sail-48",
      "sail-49",
      "sail-50",
      "sail-51"
    ]
  },
  {
    "id": "weather",
    "sourceIds": [
      "nws-marine",
      "nws-before",
      "nws-during",
      "nws-warnings",
      "met-beaufort"
    ],
    "lessonIds": [
      "sail-01",
      "sail-20",
      "sail-28"
    ]
  },
  {
    "id": "emergency",
    "sourceIds": [
      "nws-before",
      "uscg-dsc",
      "uscg-distress"
    ],
    "lessonIds": [
      "sail-01",
      "sail-33",
      "sail-34"
    ]
  }
];
const copy = {
  "speed": {
    "en": {
      "title": "Speed through water and over ground",
      "body": "Boat speed is signed forward speed through water. Speed over ground includes current and sideways motion. A negative boat-speed reading means sternway.",
      "tryIt": "With sails lowered, add a steady current and compare the two speeds.",
      "pitfall": "A knot is a unit of speed, not distance."
    },
    "es": {
      "title": "Velocidad en el agua y sobre el fondo",
      "body": "La velocidad del barco es su avance respecto al agua, con signo. La velocidad sobre el fondo incluye corriente y deriva lateral. Un valor negativo indica marcha atrás.",
      "tryIt": "Con las velas arriadas, añade una corriente constante y compara ambas velocidades.",
      "pitfall": "El nudo mide velocidad, no distancia."
    },
    "fr": {
      "title": "Vitesse sur l’eau et sur le fond",
      "body": "La vitesse du bateau est son avance signée par rapport à l’eau. La vitesse fond inclut courant et dérive latérale. Une valeur négative indique une marche arrière.",
      "tryIt": "Voiles affalées, ajoutez un courant constant et comparez les deux vitesses.",
      "pitfall": "Le nœud mesure une vitesse, pas une distance."
    },
    "ru": {
      "title": "Скорость относительно воды и грунта",
      "body": "Скорость лодки — продольная скорость относительно воды со знаком. Скорость относительно грунта включает течение и боковое движение. Отрицательная скорость лодки означает движение кормой вперёд.",
      "tryIt": "Уберите паруса, задайте постоянное течение и сравните обе скорости.",
      "pitfall": "Узел — единица скорости, а не расстояния."
    },
    "ar": {
      "title": "السرعة عبر الماء وفوق القاع",
      "body": "سرعة القارب هي سرعته الطولية عبر الماء مع إشارة الاتجاه. تشمل السرعة فوق القاع التيار والحركة الجانبية. تعني القراءة السالبة أن القارب يتحرك بالمؤخرة أولاً.",
      "tryIt": "أنزل الشراعين، وأضف تياراً ثابتاً، وقارن السرعتين.",
      "pitfall": "العقدة وحدة سرعة وليست وحدة مسافة."
    },
    "he": {
      "title": "מהירות ביחס למים וביחס לקרקע",
      "body": "מהירות הסירה היא המהירות האורכית ביחס למים, עם סימן לכיוון. המהירות ביחס לקרקע כוללת זרם ותנועה צדית. קריאה שלילית פירושה תנועה בירכתיים תחילה.",
      "tryIt": "הורידו מפרשים, הוסיפו זרם קבוע והשוו בין שתי המהירויות.",
      "pitfall": "קשר הוא יחידת מהירות, ולא מרחק."
    }
  },
  "heading": {
    "en": {
      "title": "Heading and ground track",
      "body": "Heading is where the bow points. Course over ground describes actual travel. Current and leeway can separate them; near rest, the model retains the last useful ground bearing.",
      "tryIt": "Hold the helm centred and compare heading with course while adding current.",
      "pitfall": "A correct heading does not guarantee a safe track."
    },
    "es": {
      "title": "Rumbo y trayectoria sobre el fondo",
      "body": "El rumbo indica hacia dónde apunta la proa. El curso sobre el fondo describe el desplazamiento real. Corriente y abatimiento pueden separarlos; casi parado, el modelo conserva la última dirección útil.",
      "tryIt": "Centra el timón y compara rumbo y curso al añadir corriente.",
      "pitfall": "Un rumbo correcto no garantiza una trayectoria segura."
    },
    "fr": {
      "title": "Cap et route fond",
      "body": "Le cap indique où pointe l’étrave. La route fond décrit le déplacement réel. Courant et dérive peuvent les séparer ; presque à l’arrêt, le modèle conserve la dernière direction utile.",
      "tryIt": "Centrez la barre et comparez cap et route en ajoutant du courant.",
      "pitfall": "Un cap correct ne garantit pas une trajectoire sûre."
    },
    "ru": {
      "title": "Курс и путь над грунтом",
      "body": "Курс показывает направление носа. Путевой угол описывает фактическое перемещение. Течение и дрейф могут их разделять; почти при остановке модель сохраняет последнее достоверное направление пути.",
      "tryIt": "Держите руль прямо и сравнивайте курс с путевым углом, добавляя течение.",
      "pitfall": "Правильный курс не гарантирует безопасного пути."
    },
    "ar": {
      "title": "اتجاه المقدمة والمسار فوق القاع",
      "body": "اتجاه المقدمة هو الجهة التي يشير إليها القوس. أما المسار فوق القاع فيصف الحركة الفعلية. قد يفصل بينهما التيار والانزلاق الجانبي؛ وقرب التوقف يحتفظ النموذج بآخر اتجاه مسار موثوق.",
      "tryIt": "ثبّت الدفة في المنتصف وقارن اتجاه المقدمة بالمسار أثناء إضافة تيار.",
      "pitfall": "صحة اتجاه المقدمة لا تضمن سلامة المسار."
    },
    "he": {
      "title": "כיוון החרטום והנתיב מעל הקרקע",
      "body": "כיוון החרטום מציין לאן החרטום פונה. הקורס מעל הקרקע מתאר את התנועה בפועל. זרם וסחיפה יכולים להפריד ביניהם; בקרבת עצירה המודל שומר את כיוון התנועה האחרון שהיה שימושי.",
      "tryIt": "שמרו את ההגה במרכז והשוו בין כיוון החרטום לקורס בזמן הוספת זרם.",
      "pitfall": "כיוון חרטום נכון אינו מבטיח נתיב בטוח."
    }
  },
  "wind": {
    "en": {
      "title": "Wind over ground, over water, and apparent wind",
      "body": "Weather settings describe wind relative to fixed ground. Subtracting the current vector gives wind relative to moving water; use this for points of sail. Apparent wind is airflow relative to the yacht and guides sail trim. The model uses water-relative wind for its no-go sector and outhaul response, and apparent wind for sail pressure and coefficients.",
      "tryIt": "In Free sailing, pause and change the current in Conditions. The weather wind stays fixed while Wind over water on the onboard multifunction display changes. Then sail a steady reach and watch apparent wind move forward as speed increases.",
      "pitfall": "“True wind” needs a stated reference frame. In calm relative to water, water-wind direction and angle are undefined; wind-angle goals cannot be assessed. Apparent airflow may still exist if the yacht moves through that water."
    },
    "es": {
      "title": "Viento respecto al suelo, al agua y viento aparente",
      "body": "Las condiciones meteorológicas describen el viento respecto al suelo fijo. Al restar el vector de corriente se obtiene el viento respecto al agua en movimiento; úsalo para los rumbos relativos al viento. El viento aparente es el aire respecto al yate y guía el ajuste de las velas. El modelo usa el viento respecto al agua para la zona no navegable y la respuesta del pujamen, y el aparente para la presión y los coeficientes de las velas.",
      "tryIt": "En navegación libre, pausa y cambia la corriente en Condiciones. El viento meteorológico permanece fijo mientras cambia Viento respecto al agua en la pantalla multifunción de a bordo. Después navega en un través estable y observa cómo el viento aparente se adelanta al aumentar la velocidad.",
      "pitfall": "El «viento real» necesita un marco de referencia explícito. En calma respecto al agua, su dirección y ángulo no están definidos y no se pueden evaluar objetivos de ángulo del viento. Puede seguir habiendo viento aparente si el yate se mueve por esa agua."
    },
    "fr": {
      "title": "Vent par rapport au sol, à l’eau et vent apparent",
      "body": "Les réglages météo décrivent le vent par rapport au sol fixe. Soustraire le vecteur courant donne le vent relatif à l’eau en mouvement ; utilisez-le pour les allures. Le vent apparent est l’air relatif au voilier et guide le réglage des voiles. Le modèle utilise le vent relatif à l’eau pour son secteur non navigable et la réponse de la bordure, et le vent apparent pour la pression et les coefficients véliques.",
      "tryIt": "En navigation libre, mettez en pause et modifiez le courant dans Conditions. Le vent météo reste fixe tandis que Vent relatif à l’eau change sur l’écran multifonction de bord. Naviguez ensuite au travers sur un cap stable et observez le vent apparent venir de l’avant quand la vitesse augmente.",
      "pitfall": "Le « vent réel » nécessite un référentiel explicite. Par calme relatif à l’eau, sa direction et son angle sont indéfinis ; les objectifs d’angle au vent ne peuvent pas être évalués. Un vent apparent peut subsister si le voilier se déplace dans cette eau."
    },
    "ru": {
      "title": "Ветер относительно грунта, воды и вымпельный ветер",
      "body": "Погодные настройки задают ветер относительно неподвижного грунта. Вычитание вектора течения даёт ветер относительно движущейся воды; используйте его для определения курса относительно ветра. Вымпельный ветер — поток воздуха относительно яхты, по которому настраивают паруса. Модель использует ветер относительно воды для запретного сектора и реакции оттяжки шкотового угла, а вымпельный ветер — для давления и коэффициентов парусов.",
      "tryIt": "В свободном плавании включите паузу и измените течение в разделе условий. Погодный ветер останется прежним, а показания ветра относительно воды на бортовом многофункциональном дисплее изменятся. Затем идите устойчивым галфвиндом и наблюдайте, как при разгоне вымпельный ветер заходит к носу.",
      "pitfall": "Для «истинного ветра» нужно указывать систему отсчёта. При штиле относительно воды его направление и угол не определены, поэтому цели по углу к ветру нельзя оценить. Вымпельный ветер может сохраняться, если яхта движется в этой воде."
    },
    "he": {
      "title": "רוח ביחס לקרקע, ביחס למים ורוח מדומה",
      "body": "הגדרות מזג האוויר מתארות רוח ביחס לקרקע קבועה. חיסור וקטור הזרם נותן את הרוח ביחס למים הנעים; השתמשו בה לקביעת זווית ההפלגה לרוח. הרוח המדומה היא זרימת האוויר ביחס ליאכטה, ולפיה מכוונים את המפרשים. המודל משתמש ברוח ביחס למים לתחום שאין בו הנעה ולתגובת מותח השפה התחתונה, וברוח המדומה ללחץ ולמקדמי המפרשים.",
      "tryIt": "בשיט חופשי, השהו את הסימולציה ושנו את הזרם בהגדרות התנאים. רוח מזג האוויר תישאר קבועה, ואילו הרוח ביחס למים תשתנה בצג הרב־תכליתי בסירה. לאחר מכן הפליגו ברוח צד יציבה וצפו ברוח המדומה נעה קדימה ככל שהמהירות עולה.",
      "pitfall": "למונח ״רוח אמיתית״ צריך לציין מערכת ייחוס. כשאין רוח ביחס למים, כיוונה וזוויתה אינם מוגדרים ולא ניתן להעריך יעדים של זווית לרוח. עדיין תיתכן רוח מדומה אם היאכטה נעה דרך אותם מים."
    },
    "ar": {
      "title": "الرياح بالنسبة إلى الأرض والماء والرياح الظاهرية",
      "body": "تصف إعدادات الطقس الرياح بالنسبة إلى الأرض الثابتة. يعطي طرح متجه التيار الرياح بالنسبة إلى الماء المتحرك؛ استخدمها لتحديد اتجاه الإبحار بالنسبة إلى الرياح. الرياح الظاهرية هي تدفق الهواء بالنسبة إلى اليخت وتوجّه ضبط الأشرعة. يستخدم النموذج الرياح بالنسبة إلى الماء لمنطقة عدم الإبحار واستجابة شدّ أسفل الشراع، والرياح الظاهرية لضغط الأشرعة ومعاملاتها.",
      "tryIt": "في الإبحار الحر، أوقف المحاكاة مؤقتًا وغيّر التيار في إعدادات الظروف. تبقى رياح الطقس ثابتة بينما تتغير الرياح بالنسبة إلى الماء على الشاشة متعددة الوظائف في القارب. ثم أبحر بثبات والريح من الجانب وراقب تقدم الرياح الظاهرية نحو المقدمة مع زيادة السرعة.",
      "pitfall": "يحتاج مصطلح «الرياح الحقيقية» إلى مرجع محدد. عند سكون الرياح بالنسبة إلى الماء، لا يكون اتجاهها أو زاويتها محددًا ولا يمكن تقييم أهداف زاوية الرياح. قد يبقى تدفق هواء ظاهري إذا تحرك اليخت عبر ذلك الماء."
    }
  },
  "helm": {
    "en": {
      "title": "Helm and sternway",
      "body": "The rudder needs water flow. The same helm command turns the bow the opposite way under sternway. The model includes limited forward propwash and rotational inertia.",
      "tryIt": "In the maneuvering lab, build sternway before making a small helm correction.",
      "pitfall": "Wheel movement does not select a compass heading automatically."
    },
    "es": {
      "title": "Timón y marcha atrás",
      "body": "El timón necesita flujo de agua. La misma orden de timón gira la proa al lado contrario al ir atrás. El modelo incluye algo de flujo de hélice avante e inercia de giro.",
      "tryIt": "En el laboratorio, establece arrancada atrás antes de corregir suavemente el timón.",
      "pitfall": "Mover la rueda no selecciona automáticamente un rumbo de compás."
    },
    "fr": {
      "title": "Barre et marche arrière",
      "body": "Le gouvernail exige un écoulement d’eau. Le même ordre de barre fait tourner l’étrave en sens inverse en marche arrière. Le modèle inclut un souffle d’hélice avant limité et l’inertie de rotation.",
      "tryIt": "Dans le laboratoire, prenez de l’erre arrière avant une petite correction de barre.",
      "pitfall": "Tourner la roue ne sélectionne pas automatiquement un cap au compas."
    },
    "ru": {
      "title": "Руль и задний ход",
      "body": "Для работы руля нужен поток воды. При движении кормой вперёд та же перекладка руля поворачивает нос в противоположную сторону. Модель учитывает ограниченное действие струи винта на переднем ходу и инерцию вращения.",
      "tryIt": "В лаборатории маневрирования наберите задний ход, затем немного переложите руль.",
      "pitfall": "Поворот штурвала не задаёт компасный курс автоматически."
    },
    "ar": {
      "title": "الدفة والحركة بالمؤخرة",
      "body": "تحتاج الدفة إلى جريان الماء. عند الحركة بالمؤخرة، يدير أمر الدفة نفسه المقدمة في الاتجاه المعاكس. يتضمن النموذج تأثيراً محدوداً لدفع المروحة إلى الأمام وقصوراً دورانياً.",
      "tryIt": "في مختبر المناورات، اكتسب حركة بالمؤخرة قبل إجراء تعديل صغير بالدفة.",
      "pitfall": "إدارة عجلة القيادة لا تختار اتجاهاً بوصلياً تلقائياً."
    },
    "he": {
      "title": "הגה ותנועה לאחור",
      "body": "ההגה זקוק לזרימת מים. בתנועה לאחור, אותה פקודת הגה מסובבת את החרטום לכיוון ההפוך. המודל כולל השפעה מוגבלת של זרם המדחף בהנעה קדימה והתמד סיבובי.",
      "tryIt": "במעבדת התמרון, צברו תנועה לאחור לפני תיקון הגה קטן.",
      "pitfall": "סיבוב גלגל ההגה אינו בוחר כיוון מצפן באופן אוטומטי."
    }
  },
  "sheets": {
    "en": {
      "title": "Sheets and sail flow",
      "body": "The main and headsail have independent sheets. Luffing and stalled labels describe the model's inferred airflow. The suggested angle optimizes this model, not every real sail.",
      "tryIt": "Hold a steady course, change one sheet, and wait for the speed response.",
      "pitfall": "Do not confuse a sheet, which trims, with a halyard, which hoists."
    },
    "es": {
      "title": "Escotas y flujo en las velas",
      "body": "Mayor y vela de proa tienen escotas independientes. Las etiquetas de flameo y pérdida describen el flujo inferido por el modelo. El ángulo sugerido optimiza este modelo, no cualquier vela real.",
      "tryIt": "Mantén el rumbo, cambia una escota y espera la respuesta de velocidad.",
      "pitfall": "No confundas la escota, que ajusta, con la driza, que iza."
    },
    "fr": {
      "title": "Écoutes et écoulement des voiles",
      "body": "Grand-voile et voile d’avant ont des écoutes indépendantes. Faseyement et décrochage décrivent l’écoulement estimé par le modèle. L’angle suggéré optimise ce modèle, pas toute voile réelle.",
      "tryIt": "Gardez un cap stable, modifiez une écoute et attendez la réponse en vitesse.",
      "pitfall": "Ne confondez pas l’écoute, qui règle, avec la drisse, qui hisse."
    },
    "ru": {
      "title": "Шкоты и обтекание парусов",
      "body": "Грот и передний парус имеют независимые шкоты. Метки заполаскивания и срыва потока описывают расчётное обтекание. Рекомендуемый угол оптимален для этой модели, а не для любого настоящего паруса.",
      "tryIt": "Держите постоянный курс, измените один шкот и дождитесь изменения скорости.",
      "pitfall": "Не путайте шкот для настройки паруса с фалом для его подъёма."
    },
    "ar": {
      "title": "حبال ضبط الأشرعة وتدفق الهواء",
      "body": "للشراع الرئيسي والأمامي حبال ضبط مستقلة. تصف علامتا الرفرفة وانفصال الجريان تدفق الهواء الذي يستنتجه النموذج. الزاوية المقترحة تحسن أداء هذا النموذج، وليس كل شراع حقيقي.",
      "tryIt": "حافظ على اتجاه ثابت، وعدّل حبل ضبط واحداً، وانتظر استجابة السرعة.",
      "pitfall": "لا تخلط بين حبل ضبط زاوية الشراع وحبل رفعه."
    },
    "he": {
      "title": "מיתרים וזרימת אוויר במפרשים",
      "body": "למפרש הראשי ולמפרש הקדמי יש מיתרים נפרדים. סימוני נפנוף והזדקרות מתארים את זרימת האוויר שהמודל מסיק. הזווית המוצעת מיטבית למודל הזה, ולא לכל מפרש אמיתי.",
      "tryIt": "שמרו כיוון קבוע, שנו מיתר אחד והמתינו לתגובת המהירות.",
      "pitfall": "אל תבלבלו בין מיתר לכיוון המפרש לבין מעלן להרמתו."
    }
  },
  "reef": {
    "en": {
      "title": "Reefing and sail shape",
      "body": "Reefs reduce the main's working area. Traveler, vang, and outhaul change angle or modeled efficiency. These controls simplify tasks involving real loads and crew coordination.",
      "tryIt": "Compare heel at the same course and wind before and after a reef.",
      "pitfall": "There is no universal wind speed at which every yacht must reef."
    },
    "es": {
      "title": "Rizos y forma de las velas",
      "body": "Los rizos reducen la superficie útil de la mayor. Carro, contra y pujamen cambian el ángulo o la eficiencia modelada. Estos mandos simplifican tareas con cargas reales y coordinación del equipo.",
      "tryIt": "Compara la escora con igual rumbo y viento antes y después de tomar un rizo.",
      "pitfall": "No existe una velocidad de viento universal para rizar en todos los yates."
    },
    "fr": {
      "title": "Ris et forme des voiles",
      "body": "Les ris réduisent la surface utile de grand-voile. Chariot, hale-bas et bordure modifient l’angle ou l’efficacité modélisée. Ces commandes simplifient des tâches soumises à de vraies charges et à la coordination d’équipage.",
      "tryIt": "Comparez la gîte à cap et vent identiques avant et après un ris.",
      "pitfall": "Aucune vitesse de vent universelle n’impose un ris à tous les voiliers."
    },
    "ru": {
      "title": "Рифление и форма паруса",
      "body": "Рифы уменьшают рабочую площадь грота. Погон, оттяжка гика и оттяжка шкотового угла меняют угол или расчётную эффективность. Эти органы управления упрощают действия с реальными нагрузками и совместную работу экипажа.",
      "tryIt": "Сравните крен на одинаковом курсе при том же ветре до и после взятия рифа.",
      "pitfall": "Нет единой скорости ветра, при которой любая яхта обязана брать рифы."
    },
    "ar": {
      "title": "تقليل مساحة الشراع وشكله",
      "body": "تقلل طيات التصغير مساحة الشراع الرئيسي العاملة. يغيّر منزلق الشراع الرئيسي وشداد ذراع الشراع وشداد الزاوية الخلفية الزاوية أو الكفاءة المحسوبة. تبسّط هذه الأدوات مهام تتضمن أحمالاً حقيقية وتنسيقاً بين الطاقم.",
      "tryIt": "قارن الميل في الاتجاه والرياح نفسيهما قبل تقليل مساحة الشراع وبعده.",
      "pitfall": "لا توجد سرعة رياح واحدة تستلزم تقليل مساحة الأشرعة في كل اليخوت."
    },
    "he": {
      "title": "צמצום וצורת המפרש",
      "body": "צמצומים מקטינים את השטח הפעיל של המפרש הראשי. עגלת הראשי, הבום־ואנג ומותחן השפה התחתונה משנים זווית או יעילות מחושבת. הפקדים מפשטים פעולות הכוללות עומסים אמיתיים ותיאום צוות.",
      "tryIt": "השוו את ההטיה באותו כיוון ובאותה רוח לפני צמצום ואחריו.",
      "pitfall": "אין מהירות רוח אחידה שבה כל יאכטה חייבת לצמצם מפרשים."
    }
  },
  "engine": {
    "en": {
      "title": "Thrust, momentum, and stopping",
      "body": "Ahead and astern describe thrust, not necessarily motion. Neutral removes engine thrust while momentum remains. The maneuvering lab measures the resulting speed and track.",
      "tryIt": "Build moderate ahead speed, select neutral, then use controlled astern thrust to stop.",
      "pitfall": "The lab's 0.4-second neutral dwell is a drill convention, not a gearbox specification."
    },
    "es": {
      "title": "Empuje, inercia y parada",
      "body": "Avante y atrás describen el empuje, no necesariamente el movimiento. El punto muerto elimina el empuje del motor, pero queda inercia. El laboratorio mide la velocidad y trayectoria resultantes.",
      "tryIt": "Alcanza velocidad moderada avante, pasa a punto muerto y usa empuje atrás controlado para parar.",
      "pitfall": "Los 0.4 segundos en punto muerto son una regla del ejercicio, no una especificación de la transmisión."
    },
    "fr": {
      "title": "Poussée, inertie et arrêt",
      "body": "Avant et arrière désignent la poussée, pas forcément le mouvement. Le point mort supprime la poussée moteur, mais l’inertie demeure. Le laboratoire mesure vitesse et trajectoire.",
      "tryIt": "Prenez une vitesse avant modérée, passez au point mort, puis utilisez une poussée arrière contrôlée pour arrêter.",
      "pitfall": "Les 0.4 secondes au point mort sont une convention d’exercice, pas une spécification d’inverseur."
    },
    "ru": {
      "title": "Тяга, инерция и остановка",
      "body": "Передний и задний ход двигателя описывают тягу, но не обязательно движение. Нейтраль убирает тягу, а инерция сохраняется. Лаборатория маневрирования измеряет итоговые скорость и путь.",
      "tryIt": "Наберите умеренную скорость вперёд, включите нейтраль, затем остановитесь с контролируемой тягой назад.",
      "pitfall": "Выдержка 0,4 секунды в нейтрали — условие упражнения, а не требование к редуктору."
    },
    "ar": {
      "title": "الدفع والقصور والتوقف",
      "body": "يشير الأمام والخلف إلى اتجاه الدفع، وليس بالضرورة إلى اتجاه الحركة. يزيل الوضع المحايد دفع المحرك بينما يستمر القصور. يقيس مختبر المناورات السرعة والمسار الناتجين.",
      "tryIt": "اكتسب سرعة أمامية معتدلة، واختر الوضع المحايد، ثم استخدم دفعاً خلفياً مضبوطاً للتوقف.",
      "pitfall": "الانتظار 0.4 ثانية في الوضع المحايد قاعدة تدريبية، وليس مواصفة لصندوق التروس."
    },
    "he": {
      "title": "דחף, תנע ועצירה",
      "body": "קדימה ואחורה מתארים דחף, ולא בהכרח תנועה. סרק מסיר את דחף המנוע, בעוד התנע נמשך. מעבדת התמרון מודדת את המהירות והנתיב המתקבלים.",
      "tryIt": "צברו מהירות מתונה קדימה, העבירו לסרק ואז השתמשו בדחף אחורה מבוקר לעצירה.",
      "pitfall": "השהייה של 0.4 שניות בסרק היא כלל תרגול, ולא הוראת יצרן לתיבת הילוכים."
    }
  },
  "anchor": {
    "en": {
      "title": "Rode, scope, and swing room",
      "body": "The model compares rode length with depth plus bow height. Sufficient rode permits a swing circle; too little may not reach bottom. Actual seabed setting and catenary are not assessed.",
      "tryIt": "Stop under control, lower the anchor, then compare status while adjusting rode.",
      "pitfall": "A modeled holding label does not prove a real anchor is secure."
    },
    "es": {
      "title": "Línea de fondeo, relación y borneo",
      "body": "El modelo compara la línea largada con profundidad más altura de proa. Longitud suficiente permite un círculo de borneo; demasiado poca puede no llegar al fondo. No se evalúan agarre real ni catenaria.",
      "tryIt": "Para con control, baja el ancla y compara su estado al ajustar la línea.",
      "pitfall": "La indicación de agarre del modelo no demuestra que un ancla real esté segura."
    },
    "fr": {
      "title": "Ligne de mouillage et évitage",
      "body": "Le modèle compare la longueur filée à la profondeur augmentée de la hauteur d’étrave. Une longueur suffisante permet un cercle d’évitage ; trop peu peut ne pas atteindre le fond. Tenue réelle et chaînette ne sont pas évaluées.",
      "tryIt": "Arrêtez-vous sous contrôle, mouillez l’ancre et comparez son état en ajustant la ligne.",
      "pitfall": "Une indication de tenue simulée ne prouve pas la sécurité d’une ancre réelle."
    },
    "ru": {
      "title": "Якорный канат, вытравленная длина и место для разворота",
      "body": "Модель сравнивает длину якорного каната с глубиной плюс высота носа. Достаточная длина допускает круг разворота; слишком короткий канат может не достичь дна. Реальное заглубление якоря и провисание цепи не оцениваются.",
      "tryIt": "Контролируемо остановитесь, отдайте якорь и сравните состояние при изменении длины каната.",
      "pitfall": "Метка удержания в модели не доказывает надёжность настоящего якоря."
    },
    "ar": {
      "title": "حبل المرساة وطوله ومجال الدوران",
      "body": "يقارن النموذج طول حبل المرساة بالعمق مضافاً إليه ارتفاع المقدمة. يسمح الطول الكافي بدائرة دوران؛ وقد لا يصل الحبل القصير إلى القاع. لا يجري تقييم تثبيت المرساة الحقيقي أو انحناء السلسلة.",
      "tryIt": "توقف بتحكم، وأنزل المرساة، ثم قارن حالتها أثناء تعديل طول الحبل.",
      "pitfall": "علامة الثبات في النموذج لا تثبت أمان مرساة حقيقية."
    },
    "he": {
      "title": "חבל העוגן, יחס הפריסה ומרחב סיבוב",
      "body": "המודל משווה את אורך חבל העוגן לעומק בתוספת גובה החרטום. אורך מספיק מאפשר מעגל סיבוב; חבל קצר מדי עלול לא להגיע לקרקעית. נעיצת העוגן בפועל וקשת השרשרת אינן נבדקות.",
      "tryIt": "עצרו בשליטה, הורידו עוגן והשוו את מצבו בזמן שינוי אורך החבל.",
      "pitfall": "סימון אחיזה במודל אינו מוכיח שעוגן אמיתי מאובטח."
    }
  },
  "depth": {
    "en": {
      "title": "Chart depth and clearance",
      "body": "The depth display estimates water depth, not clearance below the keel. The fictional chart shares the model's shoreline; its amber buoys are exercise targets, not a complete buoyage system.",
      "tryIt": "Inspect the 3-metre contour and plan a route with room to spare.",
      "pitfall": "Real clearance requires draft, tide, chart datum, waves, and uncertainty."
    },
    "es": {
      "title": "Profundidad y resguardo bajo la quilla",
      "body": "La sonda estima profundidad de agua, no resguardo bajo la quilla. La carta ficticia comparte la costa del modelo; sus boyas ámbar son objetivos, no un sistema completo de balizamiento.",
      "tryIt": "Examina la isóbata de 3 metros y planifica una ruta con margen.",
      "pitfall": "El resguardo real exige considerar calado, marea, referencia de carta, olas e incertidumbre."
    },
    "fr": {
      "title": "Profondeur et pied de pilote",
      "body": "Le sondeur estime la profondeur d’eau, pas la hauteur libre sous la quille. La carte fictive suit le rivage du modèle ; ses bouées ambre sont des cibles, pas un balisage complet.",
      "tryIt": "Examinez l’isobathe de 3 mètres et prévoyez une route avec de la marge.",
      "pitfall": "La marge réelle exige tirant d’eau, marée, référence de carte, vagues et incertitude."
    },
    "ru": {
      "title": "Глубина на карте и запас под килем",
      "body": "Прибор оценивает глубину воды, а не запас под килем. Береговая линия учебной карты совпадает с моделью; янтарные буи — цели упражнений, а не полная система навигационного ограждения.",
      "tryIt": "Изучите трёхметровую изобату и проложите путь с запасом.",
      "pitfall": "Для реального запаса нужны осадка, прилив, нуль глубин карты, волны и погрешности."
    },
    "ar": {
      "title": "عمق الخريطة والخلوص تحت العارضة",
      "body": "تقدّر شاشة العمق عمق الماء، وليس الخلوص تحت العارضة. تشترك الخريطة الخيالية مع النموذج في خط الساحل؛ وعواماتها الكهرمانية أهداف تدريبية وليست نظام علامات ملاحي كاملاً.",
      "tryIt": "افحص خط عمق 3 أمتار وخطط لمسار بهامش كافٍ.",
      "pitfall": "يتطلب الخلوص الحقيقي معرفة الغاطس والمد والجزر ومرجع أعماق الخريطة والأمواج وعدم اليقين."
    },
    "he": {
      "title": "עומק במפה ומרווח מתחת לשדרית",
      "body": "תצוגת העומק מעריכה את עומק המים, ולא את המרווח מתחת לשדרית. המפה הבדיונית חולקת את קו החוף עם המודל; המצופים הענבריים הם יעדי תרגול, ולא מערכת סימון ימי מלאה.",
      "tryIt": "בדקו את קו העומק של 3 מטרים ותכננו נתיב עם מרווח בטיחות.",
      "pitfall": "חישוב מרווח אמיתי דורש שוקע, גאות ושפל, אפס העומק במפה, גלים ואי־ודאות."
    }
  },
  "current": {
    "en": {
      "title": "Current and tidal streams",
      "body": "Current direction names where water flows toward. The app uses a uniform steady current; real tidal streams change. Current alters ground track even with zero speed through water.",
      "tryIt": "Lower both sails and compare drift at zero current and at 2 knots.",
      "pitfall": "A steady current slider is not a tidal prediction."
    },
    "es": {
      "title": "Corriente y corrientes de marea",
      "body": "El rumbo de corriente indica hacia dónde fluye el agua. La aplicación usa corriente uniforme y constante; las corrientes de marea reales cambian. Hay deriva sobre el fondo incluso sin velocidad en el agua.",
      "tryIt": "Arría ambas velas y compara la deriva sin corriente y con 2 nudos.",
      "pitfall": "Un deslizador de corriente constante no predice las mareas."
    },
    "fr": {
      "title": "Courant et courants de marée",
      "body": "La direction du courant indique où va l’eau. L’application utilise un courant uniforme et constant ; les courants de marée réels varient. Le courant déplace le bateau même sans vitesse sur l’eau.",
      "tryIt": "Affalez les deux voiles et comparez la dérive sans courant puis avec 2 nœuds.",
      "pitfall": "Un réglage de courant constant ne prédit pas les marées."
    },
    "ru": {
      "title": "Течение и приливные потоки",
      "body": "Направление течения указывает, куда движется вода. В приложении течение равномерное и постоянное; реальные приливные потоки меняются. Течение меняет путь над грунтом даже при нулевой скорости относительно воды.",
      "tryIt": "Уберите оба паруса и сравните дрейф без течения и при течении 2 узла.",
      "pitfall": "Регулятор постоянного течения не является прогнозом приливных потоков."
    },
    "ar": {
      "title": "التيار وتيارات المد والجزر",
      "body": "يسمّي اتجاه التيار الجهة التي يتحرك الماء نحوها. يستخدم التطبيق تياراً منتظماً ثابتاً؛ وتتغير تيارات المد والجزر الحقيقية. يغيّر التيار المسار فوق القاع حتى عند انعدام السرعة عبر الماء.",
      "tryIt": "أنزل الشراعين وقارن الانجراف دون تيار وبتيار سرعته عقدتان.",
      "pitfall": "منزلق التيار الثابت ليس تنبؤاً بتيارات المد والجزر."
    },
    "he": {
      "title": "זרם וזרמי גאות ושפל",
      "body": "כיוון הזרם מציין לאן המים זורמים. היישום משתמש בזרם אחיד וקבוע; זרמי גאות ושפל אמיתיים משתנים. הזרם משנה את הנתיב מעל הקרקע גם כשהמהירות ביחס למים היא אפס.",
      "tryIt": "הורידו את שני המפרשים והשוו סחיפה ללא זרם ובזרם של 2 קשרים.",
      "pitfall": "מחוון זרם קבוע אינו תחזית גאות ושפל."
    }
  },
  "lookout": {
    "en": {
      "title": "Lookout and collision rules",
      "body": "Lookout combines sight, hearing, and appropriate available means. Stand-on vessels still have responsibilities. The static boats here cannot assess realistic collision avoidance or the complete rules.",
      "tryIt": "Scan both sides, including the view hidden by the headsail.",
      "pitfall": "Sailing vessels do not have unconditional priority over every other vessel."
    },
    "es": {
      "title": "Vigilancia y reglas de abordaje",
      "body": "La vigilancia combina vista, oído y medios adecuados disponibles. Los buques que mantienen rumbo aún tienen obligaciones. Los barcos estáticos no evalúan prevención realista de abordajes ni todas las reglas.",
      "tryIt": "Observa ambos lados, incluida la vista tapada por la vela de proa.",
      "pitfall": "Los veleros no tienen prioridad incondicional sobre todos los demás buques."
    },
    "fr": {
      "title": "Veille et règles de route",
      "body": "La veille combine vue, ouïe et moyens appropriés disponibles. Le navire qui conserve sa route garde des responsabilités. Les bateaux statiques ne permettent pas d’évaluer l’anticollision réelle ni toutes les règles.",
      "tryIt": "Examinez les deux côtés, y compris celui masqué par la voile d’avant.",
      "pitfall": "Un voilier n’a pas une priorité inconditionnelle sur tout autre navire."
    },
    "ru": {
      "title": "Наблюдение и правила расхождения",
      "body": "Наблюдение сочетает зрение, слух и подходящие доступные средства. Судно, сохраняющее курс и скорость, тоже несёт обязанности. Неподвижные лодки здесь не позволяют оценить реалистичное предотвращение столкновений или знание всех правил.",
      "tryIt": "Осмотрите оба борта, включая сектор, закрытый передним парусом.",
      "pitfall": "Парусные суда не имеют безусловного преимущества перед всеми другими судами."
    },
    "ar": {
      "title": "المراقبة وقواعد منع التصادم",
      "body": "تجمع المراقبة بين البصر والسمع والوسائل المتاحة المناسبة. تظل على السفن التي تحافظ على اتجاهها وسرعتها مسؤوليات. لا تتيح القوارب الثابتة هنا تقييم تفادي تصادم واقعي أو تطبيق القواعد كاملة.",
      "tryIt": "تفحّص الجانبين، بما في ذلك المجال الذي يحجبه الشراع الأمامي.",
      "pitfall": "لا تتمتع السفن الشراعية بأولوية مطلقة على جميع السفن الأخرى."
    },
    "he": {
      "title": "תצפית ותקנות למניעת התנגשויות",
      "body": "תצפית משלבת ראייה, שמיעה ואמצעים מתאימים זמינים. גם לכלי שיט השומר כיוון ומהירות יש אחריות. הסירות הנייחות כאן אינן מאפשרות להעריך מניעת התנגשות מציאותית או את מלוא התקנות.",
      "tryIt": "סרקו את שני הצדדים, כולל האזור המוסתר מאחורי המפרש הקדמי.",
      "pitfall": "לכלי שיט מפרשיים אין זכות קדימה מוחלטת על כל כלי שיט אחר."
    }
  },
  "weather": {
    "en": {
      "title": "Weather decisions",
      "body": "Check the whole marine forecast, including gusts, visibility, waves, and warnings. The app's steady wind and decorative waves do not reproduce deteriorating weather.",
      "tryIt": "Choose a conservative wind setting, then explain what real change would make you return.",
      "pitfall": "A pleasant-looking sky or low mean wind is not a departure clearance."
    },
    "es": {
      "title": "Decisiones meteorológicas",
      "body": "Consulta toda la previsión marina: rachas, visibilidad, olas y avisos. El viento constante y las olas decorativas de la aplicación no reproducen el empeoramiento del tiempo.",
      "tryIt": "Elige viento prudente y explica qué cambio real te haría regresar.",
      "pitfall": "Un cielo agradable o viento medio flojo no autorizan por sí solos la salida."
    },
    "fr": {
      "title": "Décisions météo",
      "body": "Consultez toute la prévision marine : rafales, visibilité, vagues et alertes. Le vent constant et les vagues décoratives ne reproduisent pas une dégradation météo.",
      "tryIt": "Choisissez un vent prudent et expliquez quel changement réel vous ferait rentrer.",
      "pitfall": "Un ciel agréable ou un vent moyen faible ne suffisent pas pour décider de partir."
    },
    "ru": {
      "title": "Решения по погоде",
      "body": "Проверяйте весь морской прогноз: порывы, видимость, волны и предупреждения. Постоянный ветер и декоративные волны приложения не воспроизводят ухудшение погоды.",
      "tryIt": "Выберите умеренный ветер и объясните, какое реальное изменение заставит вас вернуться.",
      "pitfall": "Приятное небо или слабый средний ветер сами по себе не разрешают выход."
    },
    "ar": {
      "title": "قرارات الطقس",
      "body": "راجع التنبؤ البحري كاملاً، بما فيه الهبّات والرؤية والأمواج والتحذيرات. لا تمثّل الرياح الثابتة والأمواج الزخرفية في التطبيق تدهور الطقس.",
      "tryIt": "اختر رياحاً معتدلة واشرح التغير الحقيقي الذي سيدفعك إلى العودة.",
      "pitfall": "السماء الجميلة أو انخفاض متوسط الرياح لا يكفيان لاتخاذ قرار الإبحار."
    },
    "he": {
      "title": "החלטות מזג אוויר",
      "body": "בדקו את מלוא התחזית הימית, כולל משבים, ראות, גלים ואזהרות. הרוח הקבועה והגלים הדקורטיביים ביישום אינם משחזרים החמרה במזג האוויר.",
      "tryIt": "בחרו עוצמת רוח מתונה והסבירו איזה שינוי אמיתי יגרום לכם לחזור.",
      "pitfall": "שמיים נעימים או רוח ממוצעת חלשה אינם אישור יציאה להפלגה."
    }
  },
  "emergency": {
    "en": {
      "title": "Emergency priorities",
      "body": "Protect people, raise the alarm, maintain visual contact with a person overboard, and prepare clear identity, position, and assistance information. The app has no working distress transmitter or rescue model.",
      "tryIt": "Rehearse the information you would provide without transmitting a real alert.",
      "pitfall": "Simulator completion is not evidence of rescue or skipper competence."
    },
    "es": {
      "title": "Prioridades de emergencia",
      "body": "Protege a las personas, da la alarma, mantén contacto visual con quien caiga al agua y prepara identidad, posición y ayuda requerida. No hay transmisor de socorro ni modelo de rescate funcional.",
      "tryIt": "Ensaya la información que darías sin transmitir una alerta real.",
      "pitfall": "Completar la simulación no demuestra competencia de rescate ni de patrón."
    },
    "fr": {
      "title": "Priorités d’urgence",
      "body": "Protégez les personnes, donnez l’alarme, gardez en vue une personne à la mer et préparez identité, position et aide demandée. L’application n’a ni émetteur de détresse ni modèle de sauvetage fonctionnel.",
      "tryIt": "Répétez les informations à fournir sans émettre de véritable alerte.",
      "pitfall": "Réussir la simulation ne démontre pas une compétence de sauvetage ou de chef de bord."
    },
    "ru": {
      "title": "Приоритеты в чрезвычайной ситуации",
      "body": "Защитьте людей, поднимите тревогу, сохраняйте зрительный контакт с человеком за бортом и подготовьте чёткие сведения о судне, позиции и необходимой помощи. В приложении нет работающего передатчика бедствия или модели спасения.",
      "tryIt": "Отрепетируйте передачу нужных сведений без отправки настоящего сигнала тревоги.",
      "pitfall": "Завершение симулятора не подтверждает компетентность спасателя или шкипера."
    },
    "ar": {
      "title": "أولويات الطوارئ",
      "body": "احمِ الأشخاص، وأطلق الإنذار، وحافظ على التواصل البصري مع الشخص الساقط في الماء، وجهّز معلومات واضحة عن الهوية والموقع والمساعدة المطلوبة. لا يحتوي التطبيق على مرسل استغاثة عامل أو نموذج إنقاذ.",
      "tryIt": "تدرّب على المعلومات التي ستقدمها دون إرسال إنذار حقيقي.",
      "pitfall": "إكمال المحاكي لا يثبت الكفاءة في الإنقاذ أو قيادة اليخت."
    },
    "he": {
      "title": "סדר עדיפויות בחירום",
      "body": "הגנו על אנשים, הזעיקו עזרה, שמרו על קשר עין עם אדם שנפל למים והכינו מידע ברור על זהות, מיקום וסיוע נדרש. ביישום אין משדר מצוקה פעיל או מודל חילוץ.",
      "tryIt": "תרגלו את המידע שתמסרו בלי לשדר התרעה אמיתית.",
      "pitfall": "השלמת הסימולטור אינה הוכחה לכשירות חילוץ או פיקוד על יאכטה."
    }
  }
};

export const guides = metadata.map(topic => ({ ...topic, ...copy[topic.id].en }));

/** Unknown topics return null; unsupported locales use English. */
export function guideFor(id, lang = 'en') {
  const topic = metadata.find(item => item.id === id);
  if (!topic) return null;
  return {
    ...topic,
    ...(copy[id][lang] ?? copy[id].en),
    sources: topic.sourceIds.map(sourceId => guideSources[sourceId]).filter(Boolean),
  };
}
