// Explicit reference frames for weather, sailing angles, and sail airflow.
const rows={
 'Dashboard':['Panel de instrumentos','Tableau de bord','Приборная панель','לוח מחוונים','لوحة العدادات'],
 'Speed through water':['Velocidad respecto al agua','Vitesse surface','Скорость относительно воды','מהירות ביחס למים','السرعة بالنسبة إلى الماء'],
 'Course over ground':['Rumbo sobre el fondo','Route fond','Путевой угол','כיוון התנועה ביחס לקרקע','المسار فوق الأرض'],
 'Enlarge display':['Ampliar pantalla','Agrandir l’affichage','Увеличить дисплей','הגדלת התצוגה','تكبير الشاشة'],
 'Close enlarged display':['Cerrar pantalla ampliada','Fermer l’affichage agrandi','Закрыть увеличенный дисплей','סגירת התצוגה המוגדלת','إغلاق الشاشة المكبّرة'],
 'No wind direction':['Sin dirección del viento','Pas de direction du vent','Направление ветра не определено','אין כיוון רוח','لا يوجد اتجاه للرياح'],
 'Helm angle':['Ángulo del timón','Angle de barre','Угол руля','זווית ההגה','زاوية الدفة'],
 'Wind over water':['Viento respecto al agua','Vent relatif à l’eau','Ветер относительно воды','רוח ביחס למים','الرياح بالنسبة إلى الماء'],
 'Wind over ground':['Viento respecto al suelo','Vent par rapport au sol','Ветер относительно грунта','רוח ביחס לקרקע','الرياح بالنسبة إلى الأرض'],
 'Wind speed over ground':['Velocidad del viento respecto al suelo','Vitesse du vent par rapport au sol','Скорость ветра относительно грунта','מהירות הרוח ביחס לקרקע','سرعة الرياح بالنسبة إلى الأرض'],
 'Wind over ground from':['Viento respecto al suelo desde','Vent par rapport au sol venant de','Ветер относительно грунта дует от','רוח ביחס לקרקע מכיוון','الرياح بالنسبة إلى الأرض قادمة من'],
 'Wind angle over water':['Ángulo del viento respecto al agua','Angle du vent relatif à l’eau','Угол ветра относительно воды','זווית הרוח ביחס למים','زاوية الرياح بالنسبة إلى الماء'],
 'Calm over water':['Calma respecto al agua','Calme par rapport à l’eau','Штиль относительно воды','אין רוח ביחס למים','سكون الرياح بالنسبة إلى الماء'],
 'Calm over water. Wind-angle goals cannot be assessed.':['Calma respecto al agua. No se pueden evaluar los objetivos de ángulo del viento.','Calme par rapport à l’eau. Les objectifs d’angle au vent ne peuvent pas être évalués.','Штиль относительно воды. Цели по углу к ветру невозможно оценить.','אין רוח ביחס למים. לא ניתן להעריך יעדים של זווית לרוח.','الرياح ساكنة بالنسبة إلى الماء. لا يمكن تقييم أهداف زاوية الرياح.'],
 'Weather wind is relative to the ground. The onboard display shows wind relative to moving water. Apparent wind is the air felt aboard. Wind names its source; current names where it flows. Conditions are fixed during assessed practice.':[
  'El viento meteorológico se refiere al suelo. La pantalla de a bordo muestra el viento respecto al agua en movimiento. El viento aparente es el aire que se siente a bordo. El viento indica de dónde viene; la corriente, hacia dónde fluye. Las condiciones son fijas durante la práctica evaluada.',
  'Le vent météo est référencé au sol. L’écran de bord montre le vent relatif à l’eau en mouvement. Le vent apparent est l’air ressenti à bord. Le vent indique sa provenance ; le courant, sa destination. Les conditions restent fixes pendant les exercices évalués.',
  'Погодный ветер задан относительно грунта. Бортовой дисплей показывает ветер относительно движущейся воды. Вымпельный ветер — воздух, ощущаемый на борту. Направление ветра указывает, откуда он дует, а течения — куда оно направлено. Во время оцениваемой практики условия фиксированы.',
  'הרוח בהגדרות מזג האוויר היא ביחס לקרקע. הצג בסירה מציג רוח ביחס למים הנעים. הרוח המדומה היא זרימת האוויר שמרגישים בסירה. כיוון הרוח מציין מאין היא באה; כיוון הזרם מציין לאן הוא זורם. התנאים קבועים בזמן תרגול מוערך.',
  'رياح الطقس مقاسة بالنسبة إلى الأرض. تعرض الشاشة على متن القارب الرياح بالنسبة إلى الماء المتحرك. الرياح الظاهرية هي الهواء المحسوس على متن القارب. يحدد اتجاه الرياح مصدرها، واتجاه التيار وجهته. تبقى الظروف ثابتة أثناء التدريب المُقيَّم.'
 ]
};
const languages=['en','es','fr','ru','he','ar'];
export const WIND_REFERENCE_UI_KEYS=Object.freeze(Object.keys(rows));
export const windReferenceUI=Object.freeze(Object.fromEntries(languages.map((language,i)=>[language,Object.freeze(Object.fromEntries(WIND_REFERENCE_UI_KEYS.map(key=>[key,i===0?key:rows[key][i-1]])))])));
