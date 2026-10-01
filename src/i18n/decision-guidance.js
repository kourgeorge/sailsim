// Explicit instructions and free draft validation for answer-entry exercises.
// Columns: Spanish, French, Russian, Hebrew, Arabic.
const rows={
 'Required observations opened. Check your answer when ready.':['Observaciones obligatorias abiertas. Comprueba tu respuesta cuando estés listo.','Observations requises ouvertes. Vérifiez votre réponse quand vous êtes prêt.','Обязательные наблюдения открыты. Проверьте ответ, когда будете готовы.','התצפיות הנדרשות נפתחו. בדקו את התשובה כשתהיו מוכנים.','تم فتح الملاحظات المطلوبة. تحقق من إجابتك عندما تكون مستعداً.'],
 'What to do':['Qué hacer','Que faire','Что нужно сделать','מה צריך לעשות','ما المطلوب'],
 'Required observations':['Observaciones obligatorias','Observations requises','Обязательные наблюдения','תצפיות נדרשות','الملاحظات المطلوبة'],
 'First, open the required observations below.':['Primero, abre las observaciones obligatorias de abajo.','Ouvrez d’abord les observations requises ci-dessous.','Сначала откройте обязательные наблюдения ниже.','תחילה פתחו את התצפיות הנדרשות למטה.','افتح أولاً الملاحظات المطلوبة أدناه.'],
 '{read} of {total} opened':['{read} de {total} abiertas','{read} sur {total} ouvertes','Открыто {read} из {total}','נפתחו {read} מתוך {total}','تم فتح {read} من {total}'],
 'Open each required observation before checking your answer.':['Abre cada observación obligatoria antes de comprobar tu respuesta.','Ouvrez chaque observation requise avant de vérifier votre réponse.','Откройте каждое обязательное наблюдение перед проверкой ответа.','פתחו כל תצפית נדרשת לפני בדיקת התשובה.','افتح كل ملاحظة مطلوبة قبل التحقق من إجابتك.'],
 'Open {observation}':['Abrir {observation}','Ouvrir {observation}','Открыть: {observation}','פתיחת {observation}','فتح {observation}'],
 'Read again: {observation}':['Leer de nuevo: {observation}','Relire : {observation}','Прочитать ещё раз: {observation}','קריאה חוזרת: {observation}','اقرأ مجدداً: {observation}'],
 'Open {observations} before checking your answer.':['Abre {observations} antes de comprobar tu respuesta.','Ouvrez {observations} avant de vérifier votre réponse.','Откройте {observations} перед проверкой ответа.','פתחו את {observations} לפני בדיקת התשובה.','افتح {observations} قبل التحقق من إجابتك.'],
 'Complete these fields: {fields}.':['Completa estos campos: {fields}.','Complétez ces champs : {fields}.','Заполните поля: {fields}.','מלאו את השדות האלה: {fields}.','أكمل هذه الحقول: {fields}.'],
 'Check answer':['Comprobar respuesta','Vérifier la réponse','Проверить ответ','בדיקת התשובה','التحقق من الإجابة'],
 'Inspect the required reports first.':['Consulta primero los informes obligatorios.','Consultez d’abord les rapports requis.','Сначала изучите обязательные сообщения.','קראו תחילה את הדיווחים הנדרשים.','اطّلع أولاً على التقارير المطلوبة.'],
 'Enter apparent wind speed as zero or a positive number. Choose where the wind comes from, then press Check answer.':[
  'Introduce la velocidad del viento aparente como cero o un número positivo. Elige de dónde viene el viento y pulsa Comprobar respuesta.',
  'Saisissez une vitesse de vent apparent nulle ou positive. Choisissez d’où vient le vent, puis appuyez sur Vérifier la réponse.',
  'Введите скорость вымпельного ветра: ноль или положительное число. Выберите, откуда дует ветер, затем нажмите «Проверить ответ».',
  'הזינו את מהירות הרוח המדומה כאפס או כמספר חיובי. בחרו מאיזה כיוון הרוח מגיעה, ואז לחצו על ״בדיקת התשובה״.',
  'أدخل سرعة الرياح الظاهرية صفراً أو رقماً موجباً. اختر الجهة التي تأتي منها الرياح، ثم اضغط على «التحقق من الإجابة».'
 ],
 'Enter apparent wind speed as zero or a positive number. Choose its direction relative to the bow, then press Check answer.':[
  'Introduce la velocidad del viento aparente como cero o un número positivo. Elige su dirección respecto a la proa y pulsa Comprobar respuesta.',
  'Saisissez une vitesse de vent apparent nulle ou positive. Choisissez sa direction par rapport à l’étrave, puis appuyez sur Vérifier la réponse.',
  'Введите скорость вымпельного ветра: ноль или положительное число. Выберите его направление относительно носа и нажмите «Проверить ответ».',
  'הזינו את מהירות הרוח המדומה כאפס או כמספר חיובי. בחרו את כיוונה ביחס לחרטום, ואז לחצו על ״בדיקת התשובה״.',
  'أدخل سرعة الرياح الظاهرية صفراً أو رقماً موجباً. اختر اتجاهها بالنسبة إلى المقدمة، ثم اضغط على «التحقق من الإجابة».'
 ],
 'Enter apparent wind speed as zero or a positive number. Choose the wind reference used for sail trim, then press Check answer.':[
  'Introduce la velocidad del viento aparente como cero o un número positivo. Elige qué referencia de viento se usa para ajustar las velas y pulsa Comprobar respuesta.',
  'Saisissez une vitesse de vent apparent nulle ou positive. Choisissez le vent de référence utilisé pour régler les voiles, puis appuyez sur Vérifier la réponse.',
  'Введите скорость вымпельного ветра: ноль или положительное число. Выберите, какой ветер используется для настройки парусов, затем нажмите «Проверить ответ».',
  'הזינו את מהירות הרוח המדומה כאפס או כמספר חיובי. בחרו באיזו רוח משתמשים לכיוון המפרשים, ואז לחצו על ״בדיקת התשובה״.',
  'أدخل سرعة الرياح الظاهرية صفراً أو رقماً موجباً. اختر مرجع الرياح المستخدم لضبط الأشرعة، ثم اضغط على «التحقق من الإجابة».'
 ],
 'Enter the requested numbers and choices below, then press Check answer.':[
  'Introduce los números y selecciona las opciones solicitadas abajo; después pulsa Comprobar respuesta.',
  'Saisissez les nombres et sélectionnez les options demandées ci-dessous, puis appuyez sur Vérifier la réponse.',
  'Введите запрошенные числа и выберите варианты ниже, затем нажмите «Проверить ответ».',
  'הזינו את המספרים ובחרו את האפשרויות המבוקשות למטה, ואז לחצו על ״בדיקת התשובה״.',
  'أدخل الأرقام وحدد الخيارات المطلوبة أدناه، ثم اضغط على «التحقق من الإجابة».'
 ],
 'Add the route waypoints in order, then press Commit actions.':[
  'Añade los puntos de la ruta en orden y pulsa Confirmar acciones.',
  'Ajoutez les points de route dans l’ordre, puis appuyez sur Valider les actions.',
  'Добавьте точки маршрута по порядку, затем нажмите «Подтвердить действия».',
  'הוסיפו את נקודות המסלול לפי הסדר, ואז לחצו על ״אישור פעולות״.',
  'أضف نقاط المسار بالترتيب، ثم اضغط على «تأكيد الإجراءات».'
 ],
 'Add actions in order. Use the arrows to rearrange them, then press Commit actions.':[
  'Añade las acciones en orden. Usa las flechas para reorganizarlas y pulsa Confirmar acciones.',
  'Ajoutez les actions dans l’ordre. Utilisez les flèches pour les réorganiser, puis appuyez sur Valider les actions.',
  'Добавьте действия по порядку. Изменяйте порядок стрелками, затем нажмите «Подтвердить действия».',
  'הוסיפו את הפעולות לפי הסדר. שנו את הסדר באמצעות החצים, ואז לחצו על ״אישור פעולות״.',
  'أضف الإجراءات بالترتيب. استخدم الأسهم لإعادة ترتيبها، ثم اضغط على «تأكيد الإجراءات».'
 ],
 'Select your actions below, then press Commit actions.':[
  'Selecciona tus acciones abajo y pulsa Confirmar acciones.',
  'Sélectionnez vos actions ci-dessous, puis appuyez sur Valider les actions.',
  'Выберите действия ниже, затем нажмите «Подтвердить действия».',
  'בחרו את הפעולות למטה, ואז לחצו על ״אישור פעולות״.',
  'حدد إجراءاتك أدناه، ثم اضغط على «تأكيد الإجراءات».'
 ],
 'Wind speed must be zero or a positive number. Choose the direction separately.':[
  'La velocidad del viento debe ser cero o un número positivo. Selecciona la dirección por separado.',
  'La vitesse du vent doit être nulle ou positive. Choisissez la direction séparément.',
  'Скорость ветра должна быть нулём или положительным числом. Направление выбирается отдельно.',
  'מהירות הרוח חייבת להיות אפס או מספר חיובי. את הכיוון בוחרים בנפרד.',
  'يجب أن تكون سرعة الرياح صفراً أو رقماً موجباً. اختر الاتجاه بشكل منفصل.'
 ],
 'Revise the marked answers. −5 points.':['Revisa las respuestas marcadas. −5 puntos.','Corrigez les réponses signalées. −5 points.','Исправьте отмеченные ответы. −5 баллов.','תקנו את התשובות המסומנות. הופחתו 5 נקודות.','راجع الإجابات المحددة. خُصمت 5 نقاط.'],
 'Enter a valid number.':['Introduce un número válido.','Saisissez un nombre valide.','Введите корректное число.','הזינו מספר תקין.','أدخل رقماً صالحاً.'],
 'Enter a number of at least {min}.':['Introduce un número mayor o igual a {min}.','Saisissez un nombre supérieur ou égal à {min}.','Введите число не меньше {min}.','הזינו מספר שאינו קטן מ־{min}.','أدخل رقماً لا يقل عن {min}.'],
 'Enter a number no greater than {max}.':['Introduce un número menor o igual a {max}.','Saisissez un nombre inférieur ou égal à {max}.','Введите число не больше {max}.','הזינו מספר שאינו גדול מ־{max}.','أدخل رقماً لا يزيد على {max}.'],
 'Correct the marked entries. No points have been deducted.':[
  'Corrige las entradas marcadas. No se han descontado puntos.',
  'Corrigez les valeurs signalées. Aucun point n’a été retiré.',
  'Исправьте отмеченные поля. Баллы не списаны.',
  'תקנו את השדות המסומנים. לא הופחתו נקודות.',
  'صحّح الحقول المحددة. لم تُخصم أي نقاط.'
 ],
 'Each incorrect checked answer costs 5 points. Invalid entries, inspecting, editing and hints are free.':[
  'Cada respuesta incorrecta comprobada resta 5 puntos. Las entradas no válidas, consultar informes, editar y pedir pistas no tienen penalización.',
  'Chaque réponse vérifiée incorrecte coûte 5 points. Les saisies non valides, la consultation, les modifications et les indices sont sans pénalité.',
  'За каждый неверный проверенный ответ снимается 5 баллов. Некорректный формат, просмотр сообщений, правки и подсказки не штрафуются.',
  'כל תשובה שגויה שנשלחת לבדיקה עולה 5 נקודות. הזנה לא תקינה, קריאת דיווחים, עריכה ורמזים אינם מורידים נקודות.',
  'تُخصم 5 نقاط عن كل إجابة خاطئة تُرسل للتحقق. لا تُخصم نقاط بسبب إدخال غير صالح أو الاطلاع على التقارير أو التعديل أو طلب التلميحات.'
 ]
};
const languages=['en','es','fr','ru','he','ar'];
export const DECISION_GUIDANCE_KEYS=Object.freeze(Object.keys(rows));
export const decisionGuidanceUI=Object.freeze(Object.fromEntries(languages.map((language,i)=>[language,Object.freeze(Object.fromEntries(DECISION_GUIDANCE_KEYS.map(key=>[key,i===0?key:rows[key][i-1]])))])));
