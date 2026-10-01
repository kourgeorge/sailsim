// Separate reading, exercise preparation, and the scored simulation lifecycle.
// Columns: Spanish, French, Russian, Hebrew, Arabic. English uses the exact key.
const rows={
 'Practice briefing':['Instrucciones de la práctica','Consignes de l’exercice','Инструктаж перед практикой','תדריך לתרגול','إرشادات التدريب'],
 'Simulation ready':['Simulación lista','Simulation prête','Симуляция готова','הסימולציה מוכנה','المحاكاة جاهزة'],
 'Exercise loaded. The boat is paused; scoring starts when you press Start simulation.':[
  'Ejercicio cargado. El barco está en pausa; la puntuación comienza al pulsar Iniciar simulación.',
  'Exercice chargé. Le bateau est en pause ; l’évaluation commence lorsque vous appuyez sur Démarrer la simulation.',
  'Упражнение загружено. Движение лодки приостановлено; оценивание начнётся после нажатия «Запустить симуляцию».',
  'התרגיל נטען. הסירה בהשהיה; הניקוד מתחיל בלחיצה על ״התחלת הסימולציה״.',
  'تم تحميل التمرين. القارب متوقف مؤقتاً؛ يبدأ احتساب النقاط عند الضغط على «بدء المحاكاة».'
 ],
 'Your task':['Tu tarea','Votre tâche','Ваша задача','המשימה שלכם','مهمتك'],
 'How you pass':['Cómo superar la práctica','Critères de réussite','Условия успешного выполнения','תנאי ההצלחה','شروط النجاح'],
 'Start simulation':['Iniciar simulación','Démarrer la simulation','Запустить симуляцию','התחלת הסימולציה','بدء المحاكاة'],
 'End simulation':['Finalizar simulación','Terminer la simulation','Завершить симуляцию','סיום הסימולציה','إنهاء المحاكاة'],
 'Simulation ended. Your completed goals and score have been saved.':[
  'Simulación finalizada. Se han guardado los objetivos completados y tu puntuación.',
  'Simulation terminée. Les objectifs atteints et votre score ont été enregistrés.',
  'Симуляция завершена. Выполненные цели и набранные баллы сохранены.',
  'הסימולציה הסתיימה. היעדים שהשלמתם והניקוד שלכם נשמרו.',
  'انتهت المحاكاة. تم حفظ الأهداف التي أنجزتها ونقاطك.'
 ],
 'Simulation started. Follow the current goal; your actions are now being scored.':[
  'Simulación iniciada. Sigue el objetivo actual; tus acciones ya se están evaluando.',
  'Simulation démarrée. Suivez l’objectif en cours ; vos actions sont maintenant évaluées.',
  'Симуляция запущена. Следуйте текущей цели; ваши действия теперь оцениваются.',
  'הסימולציה התחילה. פעלו לפי היעד הנוכחי; הפעולות שלכם נבדקות כעת לצורך ניקוד.',
  'بدأت المحاكاة. اتبع الهدف الحالي؛ تُقيَّم أفعالك الآن لاحتساب النقاط.'
 ],
 'Back to simulator':['Volver al simulador','Retour au simulateur','Вернуться в симулятор','חזרה לסימולטור','العودة إلى المحاكي'],
 'Show briefing':['Ver instrucciones','Afficher les consignes','Показать инструктаж','הצגת התדריך','عرض الإرشادات'],
 'Continue simulation':['Continuar simulación','Reprendre la simulation','Продолжить симуляцию','המשך הסימולציה','متابعة المحاكاة'],
 'Review the task. Your simulation is paused.':[
  'Revisa la tarea. Tu simulación está en pausa.',
  'Relisez la tâche. Votre simulation est en pause.',
  'Просмотрите задание. Симуляция приостановлена.',
  'עיינו במשימה. הסימולציה שלכם מושהית.',
  'راجع المهمة. المحاكاة متوقفة مؤقتاً.'
 ],
 'Simulation practice':['Práctica en el simulador','Exercice en simulation','Практика в симуляторе','תרגול בסימולציה','تدريب بالمحاكاة'],
 'Text lesson':['Lección de lectura','Leçon à lire','Текстовый урок','שיעור לקריאה','درس للقراءة'],
 'Read and explore. Simulation is paused.':[
  'Lee y explora. La simulación está en pausa.',
  'Lisez et explorez. La simulation est en pause.',
  'Читайте и изучайте. Симуляция приостановлена.',
  'קראו ועיינו בחומר. הסימולציה מושהית.',
  'اقرأ واستكشف. المحاكاة متوقفة مؤقتاً.'
 ],
 'Prepare simulation':['Preparar simulación','Préparer la simulation','Подготовить симуляцию','הכנת הסימולציה','إعداد المحاكاة'],
 'Goals completed':['Objetivos completados','Objectifs atteints','Выполненные цели','יעדים שהושלמו','الأهداف المُنجزة'],
 'Paused · review your task':['En pausa · revisa tu tarea','En pause · relisez votre tâche','Пауза · просмотрите задание','בהשהיה · עיינו במשימה','متوقفة مؤقتاً · راجع مهمتك'],
 'Complete the goals in order. Keep clear of boats and shallow water.':[
  'Completa los objetivos en orden. Mantente alejado de otras embarcaciones y de aguas poco profundas.',
  'Atteignez les objectifs dans l’ordre. Restez à distance des autres bateaux et des hauts-fonds.',
  'Выполняйте цели по порядку. Держитесь подальше от других лодок и мелководья.',
  'השלימו את היעדים לפי הסדר. שמרו מרחק מסירות וממים רדודים.',
  'أكمل الأهداف بالترتيب. ابتعد عن القوارب والمياه الضحلة.'
 ],
 'Interactive scenario. Inspect the scene and commit your decisions to complete each goal.':[
  'Escenario interactivo. Examina la escena y confirma tus decisiones para completar cada objetivo.',
  'Scénario interactif. Examinez la scène et validez vos décisions pour atteindre chaque objectif.',
  'Интерактивный сценарий. Изучайте обстановку и подтверждайте свои решения, чтобы выполнить каждую цель.',
  'תרחיש אינטראקטיבי. בדקו את המצב ואשרו את ההחלטות שלכם כדי להשלים כל יעד.',
  'سيناريو تفاعلي. تفحّص المشهد وأكّد قراراتك لإكمال كل هدف.'
 ],
 'Simulation running':['Simulación en marcha','Simulation en cours','Симуляция идёт','הסימולציה פועלת','المحاكاة قيد التشغيل'],
 'Simulation paused':['Simulación en pausa','Simulation en pause','Симуляция приостановлена','הסימולציה מושהית','المحاكاة متوقفة مؤقتاً'],
 'Current goal':['Objetivo actual','Objectif en cours','Текущая цель','היעד הנוכחי','الهدف الحالي'],
 'Hold progress':['Progreso manteniendo la condición','Progression du maintien de la condition','Прогресс удержания условия','התקדמות בעמידה רציפה בתנאי','تقدّم الثبات على الشرط']
};
const languages=['en','es','fr','ru','he','ar'];
export const practiceFlowUI=Object.freeze(Object.fromEntries(languages.map((language,i)=>[
 language,Object.freeze(Object.fromEntries(Object.keys(rows).map(key=>[key,i===0?key:rows[key][i-1]])))
])));
