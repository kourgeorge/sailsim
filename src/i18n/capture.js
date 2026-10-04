// Columns: Spanish, French, Russian, Hebrew, Arabic.
const rows = {
  'Capture scene': [
    'Capturar escena',
    'Capturer la scène',
    'Снимок сцены',
    'צילום הסצנה',
    'التقاط المشهد',
  ],
  'Capturing scene…': [
    'Capturando escena…',
    'Capture en cours…',
    'Создание снимка…',
    'מצלם את הסצנה…',
    'جارٍ التقاط المشهد…',
  ],
  'Scene captured': [
    'Escena capturada',
    'Scène capturée',
    'Снимок готов',
    'הסצנה צולמה',
    'تم التقاط المشهد',
  ],
  'Captured sailing scene': [
    'Imagen de la escena de navegación',
    'Image de la scène de navigation',
    'Снимок парусной сцены',
    'תמונה של סצנת השיט',
    'صورة مشهد الإبحار',
  ],
  'Save image': [
    'Guardar imagen',
    'Enregistrer l’image',
    'Сохранить изображение',
    'שמירת תמונה',
    'حفظ الصورة',
  ],
  'Share image': [
    'Compartir imagen',
    'Partager l’image',
    'Поделиться изображением',
    'שיתוף תמונה',
    'مشاركة الصورة',
  ],
  'Sharing is unavailable. Save the image instead.': [
    'No se puede compartir. Guarda la imagen.',
    'Le partage est indisponible. Enregistrez l’image.',
    'Общий доступ недоступен. Сохраните изображение.',
    'השיתוף אינו זמין. אפשר לשמור את התמונה.',
    'المشاركة غير متاحة. احفظ الصورة بدلاً من ذلك.',
  ],
  'Could not capture the scene. Please try again.': [
    'No se pudo capturar la escena. Inténtalo de nuevo.',
    'Impossible de capturer la scène. Réessayez.',
    'Не удалось сделать снимок. Попробуйте ещё раз.',
    'לא ניתן לצלם את הסצנה. נסו שוב.',
    'تعذر التقاط المشهد. حاول مرة أخرى.',
  ],
  'Scene capture is unavailable in this browser.': [
    'La captura de escenas no está disponible en este navegador.',
    'La capture de scène est indisponible dans ce navigateur.',
    'Снимки сцены недоступны в этом браузере.',
    'צילום הסצנה אינו זמין בדפדפן זה.',
    'التقاط المشهد غير متاح في هذا المتصفح.',
  ],
};
export const captureUI = Object.fromEntries(
  ['en', 'es', 'fr', 'ru', 'he', 'ar'].map((language, i) => [
    language,
    Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, i ? values[i - 1] : key])),
  ]),
);
