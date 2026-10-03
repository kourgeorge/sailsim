// Columns: Spanish, French, Russian, Hebrew, Arabic.
const rows = {
  'Live boat simulation': [
    'Simulación de navegación en vivo',
    'Simulation de navigation en direct',
    'Симуляция управления яхтой',
    'סימולציית שיט חיה',
    'محاكاة إبحار مباشرة',
  ],
  'Control the boat in a live, scored simulation.': [
    'Controla el barco en una simulación en vivo con evaluación.',
    'Pilotez le bateau dans une simulation en direct avec évaluation.',
    'Управляйте яхтой в симуляции с оценкой ваших действий.',
    'שלוטו בסירה בסימולציה חיה שבה הפעולות שלכם נבדקות.',
    'تحكّم بالقارب في محاكاة مباشرة تُقيَّم فيها إجراءاتك.',
  ],
  'Make decisions and complete tasks in a guided scenario.': [
    'Toma decisiones y completa tareas en un escenario guiado.',
    'Prenez des décisions et accomplissez des tâches dans un scénario guidé.',
    'Принимайте решения и выполняйте задания в учебном сценарии.',
    'קבלו החלטות והשלימו משימות בתרחיש מודרך.',
    'اتخذ القرارات وأكمل المهام في سيناريو موجّه.',
  ],
  Exit: ['Salir', 'Quitter', 'Выйти', 'יציאה', 'خروج'],
  Restart: ['Reiniciar', 'Recommencer', 'Заново', 'התחלה מחדש', 'إعادة البدء'],
  'Exit simulation': [
    'Salir de la simulación',
    'Quitter la simulation',
    'Выйти из симуляции',
    'יציאה מהסימולציה',
    'الخروج من المحاكاة',
  ],
  'Restart simulation': [
    'Reiniciar la simulación',
    'Recommencer la simulation',
    'Начать симуляцию заново',
    'התחלת הסימולציה מחדש',
    'إعادة بدء المحاكاة',
  ],
  'Simulation controls': [
    'Controles de la simulación',
    'Commandes de simulation',
    'Управление симуляцией',
    'בקרת סימולציה',
    'أدوات التحكم بالمحاكاة',
  ],
};
export const sessionUI = Object.fromEntries(
  ['en', 'es', 'fr', 'ru', 'he', 'ar'].map((language, i) => [
    language,
    Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, i ? values[i - 1] : key])),
  ]),
);
