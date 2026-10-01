// Display copy for the powered, time-based anchor controls.
const rows={
 'Earlier criteria · timed windlass operation was not assessed':['Criterios anteriores · no se evaluó el funcionamiento gradual del molinete','Anciens critères · le fonctionnement progressif du guindeau n’était pas évalué','Прежние критерии · работа брашпиля с учётом времени не оценивалась','קריטריונים קודמים · פעולת הכננת לאורך זמן לא נבדקה','معايير سابقة · لم يُقيَّم تشغيل ونش المرساة مع مرور الوقت'],
 'Rode target':['Objetivo de línea de fondeo','Longueur cible','Заданная длина каната','אורך חבל רצוי','الطول المطلوب للحبل'],
 'Rode paid out':['Línea de fondeo largada','Longueur filée','Вытравлено каната','אורך החבל שנפרס','طول الحبل المدفوع'],
 'Run to target':['Mover hasta el objetivo','Atteindre la longueur cible','Довести до заданной длины','הפעל עד לאורך הרצוי','شغّل حتى الطول المطلوب'],
 'Stop windlass':['Detener el molinete','Arrêter le guindeau','Остановить брашпиль','עצור את כננת העוגן','أوقف ونش المرساة'],
 'Resume windlass':['Reanudar el molinete','Reprendre le guindeau','Продолжить работу брашпиля','המשך את פעולת הכננת','استأنف ونش المرساة'],
 'Lowering anchor':['Bajando el ancla','Descente de l’ancre','Опускание якоря','מוריד את העוגן','إنزال المرساة'],
 'Retrieving anchor':['Recuperando el ancla','Remontée de l’ancre','Подъём якоря','מעלה את העוגן','رفع المرساة'],
 'Retrieval blocked · unload rode':['Recuperación bloqueada · descarga la línea','Remontée bloquée · soulagez la ligne','Подъём заблокирован · ослабьте канат','ההרמה נעצרה · שחררו את העומס מהחבל','الرفع متوقف · خفف الحمل عن الحبل'],
 'Windlass stopped':['Molinete detenido','Guindeau arrêté','Брашпиль остановлен','כננת העוגן עצורה','ونش المرساة متوقف'],
 'Windlass paused':['Molinete en pausa','Guindeau en pause','Брашпиль на паузе','פעולת הכננת מושהית','عمل ونش المرساة معلق'],
 'Choose a positive rode target.':['Elige una longitud objetivo mayor que cero.','Choisissez une longueur cible supérieure à zéro.','Задайте длину каната больше нуля.','בחרו אורך חבל גדול מאפס.','اختر طولًا مطلوبًا للحبل أكبر من الصفر.'],
 'Resume simulation to operate the windlass.':['Reanuda la simulación para accionar el molinete.','Reprenez la simulation pour actionner le guindeau.','Продолжите симуляцию, чтобы запустить брашпиль.','המשיכו את הסימולציה כדי להפעיל את כננת העוגן.','تابع المحاكاة لتشغيل ونش المرساة.'],
 'Set the target length, then run the windlass. Paid-out rode changes over time.':['Fija la longitud objetivo y acciona el molinete. La línea largada cambia gradualmente.','Réglez la longueur cible, puis actionnez le guindeau. La longueur filée évolue progressivement.','Задайте длину и включите брашпиль. Вытравленная длина меняется постепенно.','בחרו אורך רצוי והפעילו את כננת העוגן. אורך החבל שנפרס משתנה בהדרגה.','حدد الطول المطلوب ثم شغّل ونش المرساة. يتغير طول الحبل المدفوع تدريجيًا.'],
 'The anchor remains deployed until retrieval is complete.':['El ancla sigue desplegada hasta completar la recuperación.','L’ancre reste déployée jusqu’à la fin de la remontée.','Якорь остаётся за бортом до завершения подъёма.','העוגן נשאר במים עד להשלמת ההרמה.','تبقى المرساة في الماء حتى يكتمل رفعها.'],
 'Move slowly toward the anchor to slacken the rode before retrieving more.':['Avanza despacio hacia el ancla para aflojar la línea antes de seguir recogiéndola.','Avancez lentement vers l’ancre pour détendre la ligne avant de poursuivre la remontée.','Медленно подойдите к якорю, чтобы ослабить канат перед дальнейшим подъёмом.','התקדמו לאט לעבר העוגן כדי להרפות את החבל לפני המשך ההרמה.','تقدم ببطء نحو المرساة لإرخاء الحبل قبل متابعة رفعه.'],
 'The anchor is suspended above the seabed.':['El ancla está suspendida sobre el fondo.','L’ancre est suspendue au-dessus du fond.','Якорь подвешен над морским дном.','העוגן תלוי מעל הקרקעית.','المرساة معلقة فوق قاع البحر.'],
 'At least {rode} m paid out':['Al menos {rode} m largados','Au moins {rode} m filés','Вытравлено не менее {rode} м','לפחות {rode} מטר של חבל פרוס','دفع ما لا يقل عن {rode} م من الحبل'],
 'Anchor fully stowed':['Ancla completamente recogida','Ancre entièrement rangée','Якорь полностью убран','העוגן מאוחסן במלואו','المرساة مرفوعة ومحفوظة بالكامل'],
 'Rode is paying out toward the selected target.':['La línea se larga hasta la longitud seleccionada.','La ligne est filée jusqu’à la longueur choisie.','Канат вытравливается до заданной длины.','החבל נפרס עד לאורך שנבחר.','يُدفع الحبل حتى الطول المحدد.'],
};
const languages=['en','es','fr','ru','he','ar'];
export const WINDLASS_UI_KEYS=Object.freeze(Object.keys(rows));
export const windlassUI=Object.freeze(Object.fromEntries(languages.map((language,i)=>[language,Object.freeze(Object.fromEntries(WINDLASS_UI_KEYS.map(key=>[key,i===0?key:rows[key][i-1]])))])));
