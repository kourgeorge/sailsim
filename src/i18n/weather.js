// Columns: Spanish, French, Russian, Hebrew, Arabic.
const rows = {
  Weather: ['Tiempo', 'Météo', 'Погода', 'מזג אוויר', 'الطقس'],
  'Changing weather': [
    'Tiempo variable',
    'Météo changeante',
    'Переменная погода',
    'מזג אוויר משתנה',
    'طقس متغير',
  ],
  'Fixed weather': [
    'Tiempo constante',
    'Météo constante',
    'Постоянная погода',
    'מזג אוויר קבוע',
    'طقس ثابت',
  ],
  'Wind shifts gradually around the starting conditions. Current changes more slowly.': [
    'El viento varía gradualmente alrededor de las condiciones iniciales. La corriente cambia más despacio.',
    'Le vent évolue progressivement autour des conditions initiales. Le courant varie plus lentement.',
    'Ветер плавно меняется относительно начальных условий. Течение изменяется медленнее.',
    'הרוח משתנה בהדרגה סביב תנאי ההתחלה. הזרם משתנה לאט יותר.',
    'تتغير الرياح تدريجياً حول ظروف البداية. ويتغير التيار ببطء أكبر.',
  ],
  'Sail through the numbered rings in order. Engines are disabled. Every boat shares the same weather.':
    [
      'Pasa por los anillos numerados en orden. Los motores están desactivados. Todos los barcos comparten el mismo tiempo.',
      'Traversez les anneaux numérotés dans l’ordre. Les moteurs sont désactivés. Tous les bateaux partagent la même météo.',
      'Проходите нумерованные кольца по порядку. Двигатели отключены. Погода одинакова для всех лодок.',
      'הפליגו דרך הטבעות הממוספרות לפי הסדר. המנועים מושבתים. כל הסירות מפליגות באותם תנאי מזג אוויר.',
      'أبحر عبر الحلقات المرقمة بالترتيب. المحركات معطلة. تخضع جميع القوارب للطقس نفسه.',
    ],
};
export const weatherUI = Object.fromEntries(
  ['en', 'es', 'fr', 'ru', 'he', 'ar'].map((language, i) => [
    language,
    Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, i ? values[i - 1] : key])),
  ]),
);
