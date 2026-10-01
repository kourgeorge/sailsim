// Original anchor-monitor copy. These are display strings only; the shared
// anchor snapshot owns geometry, states and the model's scope coefficient.
const languages = ['es', 'fr', 'ru', 'he', 'ar'];
const rows = {
  'Anchor close-up': ['Primer plano del ancla', 'Gros plan de l’ancre', 'Якорь крупным планом', 'מבט מקרוב על העוגן', 'عرض مقرّب للمرساة'],
  'Anchor monitor': ['Monitor de fondeo', 'Suivi du mouillage', 'Контроль якорной стоянки', 'ניטור העגינה', 'مراقبة المرساة'],
  'Awaiting deployment': ['Pendiente de largar', 'En attente de mouillage', 'Ожидание отдачи якоря', 'ממתין להורדת העוגן', 'بانتظار إنزال المرساة'],
  'Deployment pending': ['Largado pendiente', 'Mouillage en attente', 'Отдача якоря ожидается', 'הורדת העוגן ממתינה', 'إنزال المرساة معلق'],
  'Cancel deployment': ['Cancelar el largado', 'Annuler le mouillage', 'Отменить отдачу якоря', 'ביטול הורדת העוגן', 'إلغاء إنزال المرساة'],
  'Rode geometry': ['Geometría de la línea de fondeo', 'Géométrie de la ligne de mouillage', 'Геометрия якорного каната', 'גאומטריית חבל העוגן', 'هندسة حبل المرساة'],
  'Anchor suspended': ['Ancla suspendida', 'Ancre suspendue', 'Якорь подвешен', 'העוגן תלוי במים', 'المرساة معلقة'],
  'Rode slack': ['Línea de fondeo floja', 'Ligne de mouillage détendue', 'Якорный канат ослаблен', 'חבל העוגן רפוי', 'حبل المرساة مرتخٍ'],
  'Rode taut': ['Línea de fondeo tensa', 'Ligne de mouillage tendue', 'Якорный канат натянут', 'חבל העוגן מתוח', 'حبل المرساة مشدود'],
  'Anchor dragging': ['El ancla garrea', 'L’ancre chasse', 'Якорь ползёт', 'העוגן נגרר', 'المرساة تنجر على القاع'],
  'Rode length': ['Longitud de la línea de fondeo', 'Longueur de la ligne', 'Длина якорного каната', 'אורך חבל העוגן', 'طول حبل المرساة'],
  'Depth at anchor': ['Profundidad en el ancla', 'Profondeur à l’ancre', 'Глубина у якоря', 'העומק במיקום העוגן', 'العمق عند المرساة'],
  'Bow height': ['Altura de proa', 'Hauteur d’étrave', 'Высота носа', 'גובה החרטום', 'ارتفاع المقدمة'],
  'Scope': ['Relación de fondeo', 'Rapport de mouillage', 'Кратность вытравленного каната', 'יחס הפריסה', 'نسبة طول حبل المرساة'],
  'Distance from anchor': ['Distancia al ancla', 'Distance à l’ancre', 'Расстояние от якоря', 'המרחק מהעוגן', 'المسافة من المرساة'],
  'Maximum bow radius': ['Radio máximo de proa', 'Rayon maximal de l’étrave', 'Максимальный радиус носа', 'רדיוס החרטום המרבי', 'أقصى نصف قطر لحركة المقدمة'],
  'Allow additional room for the rest of the yacht beyond the bow radius.': ['Deja espacio adicional para el resto del barco más allá del radio de proa.', 'Prévoyez de l’espace supplémentaire pour le reste du bateau au-delà du rayon de l’étrave.', 'За пределами радиуса носа оставьте дополнительное место для остальной яхты.', 'השאירו מרחב נוסף לשאר היאכטה מעבר לרדיוס החרטום.', 'اترك مساحة إضافية لبقية اليخت خارج نصف قطر حركة المقدمة.'],
  'Ground speed': ['Velocidad sobre el fondo', 'Vitesse fond', 'Скорость относительно грунта', 'מהירות ביחס לקרקע', 'السرعة فوق القاع'],
  'Resume simulation to deploy the anchor.': ['Reanuda la simulación para largar el ancla.', 'Reprenez la simulation pour mouiller l’ancre.', 'Продолжите симуляцию, чтобы отдать якорь.', 'המשיכו את הסימולציה כדי להוריד את העוגן.', 'تابع المحاكاة لإنزال المرساة.'],
  'The rode is too short to reach the seabed.': ['La línea de fondeo es demasiado corta para alcanzar el fondo.', 'La ligne de mouillage est trop courte pour atteindre le fond.', 'Якорный канат слишком короток, чтобы якорь достиг дна.', 'החבל או השרשרת קצרים מכדי להגיע לקרקעית.', 'الحبل أو السلسلة أقصر من أن يصل إلى القاع.'],
  'The rode is slack. Low speed alone does not show that the anchor is holding.': ['La línea está floja. Una velocidad baja por sí sola no demuestra que el ancla aguante.', 'La ligne est détendue. Une faible vitesse ne suffit pas à montrer que l’ancre tient.', 'Канат ослаблен. Малая скорость сама по себе не означает, что якорь держит.', 'חבל העוגן רפוי. מהירות נמוכה לבדה אינה מעידה שהעוגן אוחז.', 'حبل المرساة مرتخٍ. السرعة المنخفضة وحدها لا تدل على أن المرساة ثابتة.'],
  'The rode is at the modeled swing limit. This does not prove a real anchor is set.': ['La línea de fondeo está en el límite de borneo del modelo. Esto no demuestra que un ancla real haya quedado bien afirmada.', 'La ligne est à la limite d’évitage du modèle. Cela ne prouve pas qu’une ancre réelle a croché.', 'Канат находится на пределе перемещения в модели. Это не доказывает, что настоящий якорь закрепился в грунте.', 'חבל העוגן נמצא בגבול הסיבוב במודל. הדבר אינו מוכיח שעוגן אמיתי ננעץ בקרקעית.', 'حبل المرساة عند حد الدوران في النموذج. هذا لا يثبت أن مرساة حقيقية قد ثبتت في القاع.'],
  'The anchor is moving along the seabed. Reassess rode and holding.': ['El ancla se desplaza por el fondo. Reevalúa la línea de fondeo y el agarre.', 'L’ancre se déplace sur le fond. Réévaluez la ligne de mouillage et la tenue.', 'Якорь движется по дну. Пересмотрите длину каната и оценку держания.', 'העוגן נע על הקרקעית. בדקו מחדש את החבל או השרשרת ואת האחיזה.', 'المرساة تتحرك على القاع. أعد تقييم الحبل أو السلسلة وثبات المرساة.'],
  'The model gives reduced restraint at short scope. This is not a recommended scope.': ['El modelo reduce la retención con una relación de fondeo corta. No es una relación recomendada.', 'Le modèle réduit la retenue quand le rapport de mouillage est faible. Ce rapport n’est pas une recommandation.', 'При малой кратности каната модель ослабляет удержание. Это не рекомендация по выбору кратности.', 'המודל מפחית את הריסון ביחס פריסה נמוך. זהו אינו יחס פריסה מומלץ.', 'يقل التقييد في النموذج عندما تكون نسبة طول الحبل صغيرة. هذه ليست نسبة موصى بها.'],
  'The anchor is stowed. Plan depth, rode and swing room before deployment.': ['El ancla está recogida. Planifica profundidad, línea de fondeo y espacio de borneo antes de largarla.', 'L’ancre est rangée. Prévoyez profondeur, longueur de ligne et espace d’évitage avant de mouiller.', 'Якорь убран. Перед отдачей оцените глубину, длину каната и место для разворота.', 'העוגן מאוחסן. תכננו עומק, אורך חבל או שרשרת ומרחב סיבוב לפני הורדתו.', 'المرساة مرفوعة ومحفوظة. خطط للعمق وطول الحبل أو السلسلة ومجال الدوران قبل إنزالها.'],
  'Side view · schematic': ['Vista lateral · esquema', 'Vue de côté · schéma', 'Вид сбоку · схема', 'מבט צד · תרשים', 'منظر جانبي · تخطيطي'],
  'Plan view · bow swing limit': ['Vista superior · límite de borneo de proa', 'Vue de dessus · limite d’évitage de l’étrave', 'Вид сверху · предел движения носа', 'מבט על · גבול סיבוב החרטום', 'منظر علوي · حد دوران المقدمة'],
  'Rode shape is illustrative. Check depth, swing room and holding with real observations.': ['La forma de la línea es ilustrativa. Comprueba profundidad, espacio de borneo y agarre con observaciones reales.', 'La forme de la ligne est illustrative. Vérifiez profondeur, espace d’évitage et tenue par des observations réelles.', 'Форма каната показана условно. Проверяйте глубину, место для разворота и держание по реальным наблюдениям.', 'צורת החבל היא להמחשה. בדקו עומק, מרחב סיבוב ואחיזה באמצעות תצפיות אמיתיות.', 'شكل الحبل توضيحي. تحقق من العمق ومجال الدوران وثبات المرساة بملاحظات فعلية.'],
  'Anchor position': ['Posición del ancla', 'Position de l’ancre', 'Положение якоря', 'מיקום העוגן', 'موضع المرساة'],
  'Bow': ['Proa', 'Étrave', 'Нос', 'חרטום', 'المقدمة'],
  'Seabed': ['Fondo marino', 'Fond marin', 'Морское дно', 'קרקעית', 'قاع البحر'],
  'Waterline': ['Línea de flotación', 'Ligne de flottaison', 'Ватерлиния', 'קו המים', 'خط الماء'],
  'Anchor & swing room': ['Ancla y espacio de borneo', 'Ancre et espace d’évitage', 'Якорь и место для разворота', 'עוגן ומרחב סיבוב', 'المرساة ومجال الدوران'],
};

export const ANCHOR_UI_KEYS = Object.freeze(Object.keys(rows));
export const anchoringUI = Object.freeze(Object.fromEntries(['en', ...languages].map(language => [
  language,
  Object.freeze(Object.fromEntries(ANCHOR_UI_KEYS.map(key => [key, language === 'en' ? key : rows[key][languages.indexOf(language)]]))),
])));
