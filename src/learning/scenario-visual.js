import {renderColregsFigure} from './colregs-figures.js';
// Visual decision workbench. The caller owns assessment, persistence and task forms.
// Fixtures and submitted values are rendered as evidence/plans, never graded here.
const LANGS=['en','es','fr','ru','he','ar'];
const COPY={
 scene:['Scenario work area','Área del escenario','Zone du scénario','Рабочая область ситуации','מרחב התרחיש','مساحة السيناريو'],
 preview:['Your draft plan','Tu plan provisional','Votre projet de plan','Ваш проект плана','טיוטת התכנית שלך','مسودة خطتك'],
 inspect:['Inspect the evidence','Inspecciona los datos','Examiner les éléments','Изучите данные','בדקו את המידע','افحص الأدلة'],
 selectFact:['Select an evidence card to inspect its report.','Selecciona una tarjeta para consultar su informe.','Sélectionner une fiche pour lire son rapport.','Выберите карточку, чтобы прочитать сведения.','בחרו כרטיס מידע לקריאת הדיווח.','اختر بطاقة لقراءة تقريرها.'],
 inspected:['Inspected','Revisado','Examiné','Изучено','נבדק','تم الفحص'],
 report:['Evidence report','Informe','Rapport','Сведения','דיווח','تقرير الأدلة'],
 north:['N','N','N','С','צ׳','ش'],east:['E','E','E','В','מז׳','ق'],south:['S','S','S','Ю','ד׳','ج'],west:['W','O','O','З','מע׳','غ'],
 top:['Top marker','Marcador superior','Repère haut','Верхняя метка','סמן עליון','العلامة العليا'],bottom:['Bottom marker','Marcador inferior','Repère bas','Нижняя метка','סמן תחתון','العلامة السفلى'],left:['Left marker','Marcador izquierdo','Repère gauche','Левая метка','סמן שמאלי','العلامة اليسرى'],right:['Right marker','Marcador derecho','Repère droit','Правая метка','סמן ימני','العلامة اليمنى'],
 bow:['Bow','Proa','Étrave','Нос','חרטום','المقدمة'],stern:['Stern','Popa','Poupe','Корма','ירכתיים','المؤخرة'],port:['Port','Babor','Bâbord','Левый борт','שמאל היאכטה','الميسرة'],starboard:['Starboard','Estribor','Tribord','Правый борт','ימין היאכטה','الميمنة'],
 helm:['Helm','Timón','Barre','Рулевой','הגה','الدفة'],lookout:['Lookout','Vigilancia','Veille','Наблюдатель','תצפית','المراقبة'],lines:['Lines','Cabos','Aussières','Концы','חבלים','الحبال'],helper:['Helper','Ayudante','Équipier','Помощник','מסייע','مساعد'],
 jackets:['Fitted lifejackets','Chalecos ajustados','Gilets ajustés','Подогнанные жилеты','אפודים מותאמים','سترات مضبوطة'],boom:['Boom sweep','Barrido de botavara','Passage de la bôme','Размах гика','מסלול המנור','مسار ذراع الشراع'],
 route:['Route','Ruta','Route','Маршрут','נתיב','المسار'],waypoint:['Waypoint','Punto de ruta','Point de route','Путевая точка','נקודת דרך','نقطة مسار'],
 wind:['Wind from','Viento desde','Vent venant de','Ветер от','רוח מ־','الرياح من'],current:['Current toward','Corriente hacia','Courant vers','Течение к','זרם אל','التيار نحو'],heading:['Heading','Rumbo de proa','Cap','Курс носа','כיוון חרטום','اتجاه المقدمة'],ground:['Ground track','Trayectoria real','Route fond','Путь над грунтом','נתיב מעל הקרקע','المسار الفعلي'],
 waterSpeed:['Water speed','Velocidad en el agua','Vitesse surface','Скорость по воде','מהירות ביחס למים','السرعة عبر الماء'],trueWind:['True airflow','Flujo real','Écoulement réel','Истинный поток','זרימת רוח אמיתית','تدفق حقيقي'],apparent:['Apparent airflow','Flujo aparente','Écoulement apparent','Вымпельный поток','זרימת רוח מדומה','تدفق ظاهري'],
 chartDepth:['Charted depth','Sonda de carta','Sonde carte','Глубина по карте','עומק במפה','العمق المخطط'],tide:['Tidal height','Altura de marea','Hauteur de marée','Высота прилива','גובה גאות','ارتفاع المد'],draft:['Draft','Calado','Tirant d’eau','Осадка','שוקע','الغاطس'],datum:['Chart datum','Datum de carta','Zéro hydrographique','Нуль глубин','אפס המפה','مرجع الخريطة'],bed:['Seabed','Fondo','Fond marin','Дно','קרקעית','القاع'],
 prediction:['Your prediction','Tu predicción','Votre prévision','Ваш прогноз','התחזית שלך','توقعك'],clearance:['Under-keel clearance','Margen bajo quilla','Pied de pilote','Запас под килем','מרווח מתחת לשדרן','الخلوص تحت العارضة'],
 observation:['Observation','Observación','Observation','Наблюдение','תצפית','المشاهدة'],bearing:['Bearing','Demora','Relèvement','Пеленг','תכווין','الاتجاه'],range:['Range','Distancia','Distance','Дистанция','טווח','المسافة'],visibility:['Visibility','Visibilidad','Visibilité','Видимость','ראות','الرؤية'],contact:['Contact','Contacto','Contact','Цель','מגע','هدف'],
 prepared:['Prepared','Preparado','Préparé','Подготовлено','מוכן','جاهز'],open:['Open','Abierto','Ouvert','Открыто','פתוח','مفتوح'],weather:['Weather report','Parte meteorológico','Bulletin météo','Прогноз','דיווח מזג אוויר','تقرير الطقس'],
 routeHint:['Select a mark to add it to your route.','Selecciona una marca para añadirla a la ruta.','Choisir une marque pour l’ajouter à la route.','Выберите знак для добавления в маршрут.','בחרו סימן כדי להוסיפו לנתיב.','اختر علامة لإضافتها إلى المسار.'],
 fictional:['Fictional training scene · schematic','Escenario ficticio · esquema','Scène fictive · schéma','Учебная вымышленная схема','תרחיש לימודי בדיוני · תרשים','مشهد تدريبي خيالي · تخطيطي'],
 noContact:['No visual identification','Sin identificación visual','Pas d’identification visuelle','Нет визуального опознания','ללא זיהוי חזותי','لا يوجد تعريف بصري'],
 zoom:['Diagram zoom','Ampliación del diagrama','Zoom du schéma','Масштаб схемы','הגדלת תרשים','تكبير الرسم'],
 restore:['Fit diagram','Ajustar diagrama','Ajuster le schéma','Вписать схему','התאמת התרשים','ملاءمة الرسم'],
 decision:['Decision','Decisión','Décision','Решение','החלטה','القرار'],
 tack:['Tack','Amura','Amure','Галс','מפנה','جانب الإبحار'],own:['Your yacht','Tu velero','Votre voilier','Ваша яхта','היאכטה שלך','يختك'],other:['Other yacht','Otro velero','Autre voilier','Другая яхта','היאכטה האחרת','اليخت الآخر'],
 gust:['Gust','Racha','Rafale','Порыв','משב','هبة'],distance:['Distance','Distancia','Distance','Расстояние','מרחק','المسافة'],time:['Time','Tiempo','Temps','Время','זמן','الزمن'],
 halyard:['Halyard','Driza','Drisse','Фал','מעלן','حبل الرفع'],sheet:['Sheet','Escota','Écoute','Шкот','מיתר','حبل الشد'],rode:['Anchor rode','Cabo de fondeo','Ligne de mouillage','Якорный канат','חבל העוגן','حبل المرساة'],reef:['Reef','Rizo','Ris','Риф','צמצום','تصغير الشراع'],snag:['Reported snag','Enganche señalado','Blocage signalé','Обнаруженное зацепление','תקלה שדווחה','تعلق مُبلّغ عنه'],
 berth:['Berth','Atraque','Poste à quai','Место у причала','מקום עגינה','مكان الرسو'],escape:['Escape route','Ruta de salida','Voie de dégagement','Путь отхода','נתיב יציאה','مسار الانسحاب'],obstructed:['Obstruction reported','Obstáculo indicado','Obstacle signalé','Обнаружено препятствие','דווח מכשול','عائق مُبلّغ عنه'],
 anchor:['Anchor','Ancla','Ancre','Якорь','עוגן','مرساة'],radius:['Swing radius','Radio de borneo','Rayon d’évitage','Радиус разворота','רדיוס סיבוב','نصف قطر الدوران'],available:['Available room','Espacio disponible','Espace disponible','Доступное пространство','מרחב זמין','المساحة المتاحة'],
 exposed:['Exposed','Expuesto','Exposé','Открытый маршрут','חשוף','مكشوف'],sheltered:['Sheltered','Abrigado','Abrité','Укрытый маршрут','מוגן','محمي'],
 sound:['Short blasts','Pitadas cortas','Sons brefs','Короткие гудки','צפירות קצרות','صفارات قصيرة'],ahead:['Ahead','Avante','Avant','Вперёд','קדימה','إلى الأمام'],astern:['Astern','Atrás','Arrière','Назад','לאחור','إلى الخلف'],
 lights:['Observed sidelights','Luces de costado observadas','Feux de côté observés','Наблюдаемые бортовые огни','אורות צד שנצפו','الأضواء الجانبية المرصودة'],limited:['Restricted visibility','Visibilidad restringida','Visibilité réduite','Ограниченная видимость','ראות מוגבלת','رؤية مقيدة'],
 casualty:['Person in the water','Persona en el agua','Personne à l’eau','Человек в воде','אדם במים','شخص في الماء'],point:['Keep visual contact','Mantén contacto visual','Garder le contact visuel','Не терять из виду','שמרו קשר עין','حافظ على الاتصال البصري'],flotation:['Flotation','Flotación','Aide flottante','Спасательный круг','אמצעי ציפה','وسيلة طفو'],propeller:['Propeller hazard','Peligro de hélice','Danger de l’hélice','Опасность винта','סכנת מדחף','خطر المروحة'],
 rehearsal:['Message rehearsal · no transmission','Ensayo del mensaje · sin transmisión','Message répété · sans émission','Репетиция сообщения · без передачи','תרגול הודעה · ללא שידור','تدريب على الرسالة · دون إرسال'],identity:['Identity','Identidad','Identité','Позывной','זהות','الهوية'],position:['Position','Posición','Position','Местоположение','מיקום','الموقع'],details:['Details','Detalles','Détails','Подробности','פרטים','التفاصيل'],evidence:['Course evidence','Registro del curso','Preuves du cours','Учебные результаты','ראיות מהקורס','أدلة التعلم'],waterDepth:['Water depth','Profundidad del agua','Profondeur d’eau','Глубина воды','עומק המים','عمق الماء'],
 visual:['Visual reference','Referencia visual','Repère visuel','Визуальный ориентир','סימן חזותי','مرجع بصري'],depthTrend:['Depth trend','Tendencia de profundidad','Évolution de la profondeur','Изменение глубины','מגמת עומק','اتجاه تغير العمق'],period:['Flash period','Período del destello','Période du feu','Период огня','מחזור הבהוב','دورة الوميض'],plotter:['Plotter','Plotter','Traceur','Картплоттер','תוויין','راسم الخرائط'],
 departure:['Departure','Salida','Départ','Отход','יציאה','المغادرة'],
 neutral:['Plan only · commit using the task controls','Solo un plan · confirma con los controles de la tarea','Projet seulement · valider avec les commandes de la tâche','Это план · подтвердите его в задании','תכנית בלבד · אשרו באמצעות בקרי המשימה','خطة فقط · أكدها بأدوات المهمة'],
};
const C={ink:'#193e48',muted:'#496a70',paper:'#e1e9dd',water:'#d8edf0',white:'#fffef6',blue:'#176aa1',teal:'#08746f',amber:'#8b590c',red:'#b23746',line:'#abc4c3',land:'#bbceaa'};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const finite=(value,fallback=0)=>value!==''&&value!==null&&Number.isFinite(Number(value))?Number(value):fallback;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const radians=a=>a*Math.PI/180;
const direction=(heading,length)=>({x:Math.sin(radians(heading))*length,y:-Math.cos(radians(heading))*length});
const list=value=>Array.isArray(value)?value:value instanceof Set?[...value]:[];
let serial=0;
function localeOf(code){const base=String(code??'en').toLowerCase().split(/[-_]/)[0];return LANGS.includes(base)?base:'en';}
function translated(key,lang){return COPY[key]?.[LANGS.indexOf(lang)]??String(key??'');}
function lines(value,max=27){return String(value).split(/\s+/).reduce((out,word)=>{if(!out.length||(out.at(-1)+' '+word).length>max)out.push(word);else out[out.length-1]+=' '+word;return out;},[]);}
function valueOf(vm,key,fallback){return vm.values?.[vm.scene?.fieldMap?.[key]??key]??fallback;}
function normalizedScene(vm){return {scene:vm.scene??{},values:vm.values??{},lang:localeOf(vm.lang)};}

/** Pure SVG renderer also used by static visual QA. Scene fixtures contain no keys. */
export function renderScenarioScene(vm={}) {
 if(vm.family==='colregs')return {svg:renderColregsFigure({id:vm.scenarioId?.replace('decision-','')},vm.lang,vm.scene),waypoints:[]};
 const {scene:s,values:v,lang}=normalizedScene(vm),rtl=['he','ar'].includes(lang),id=`scenario-scene-${++serial}`,markers=new Map();
 const t=key=>translated(key,lang);
 const text=(x,y,value,{size=18,color=C.ink,weight=600,max=28,maxLines=Infinity,anchor='middle'}={})=>{const wrapped=lines(value,max),shown=wrapped.slice(0,maxLines);if(wrapped.length>maxLines)shown[shown.length-1]+='…';return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-weight="${weight}" direction="${rtl?'rtl':'ltr'}" unicode-bidi="plaintext">${shown.map((l,i)=>`<tspan x="${x}" dy="${i?size*1.2:0}">${escape(l)}</tspan>`).join('')}</text>`;};
 const line=(x1,y1,x2,y2,color=C.line,width=2,dash='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
 const arrow=(d,color=C.blue,width=4,dash='')=>{const key=color+width;if(!markers.has(key))markers.set(key,{id:`${id}-a${markers.size}`,color,size:Math.max(12,width*3.2)});return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" marker-end="url(#${markers.get(key).id})"${dash?` stroke-dasharray="${dash}"`:''}/>`;};
 const boat=(x,y,heading=0,scale=1,color=C.blue)=>`<g transform="translate(${finite(x)} ${finite(y)}) rotate(${finite(heading)}) scale(${scale})"><path d="M0 -53C23 -31 30 22 20 48Q0 56 -20 48C-30 22 -23 -31 0 -53Z" fill="${C.white}" stroke="${color}" stroke-width="3"/><path d="M0 -34V38M-13 18H13V39H-13Z" fill="${C.paper}" stroke="${color}" stroke-width="2"/><circle cy="-11" r="5" fill="${color}"/></g>`;
 const tag=(x,y,value,color=C.ink)=>`<rect x="${x-86}" y="${y-23}" width="172" height="48" rx="12" fill="${C.white}" stroke="${C.line}"/>${text(x,y+5,value,{color,size:17,max:22})}`;
 const card=(x,y,w,h,title,value)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${C.white}" stroke="${C.line}"/>${text(x+w/2,y+29,title,{size:16,color:C.muted,max:25})}${text(x+w/2,y+61,value,{size:24,max:18})}`;
 const degrees=n=>`${Math.round(((finite(n)%360)+360)%360).toString().padStart(3,'0')}°`;
 const number=(n,digits=1)=>new Intl.NumberFormat(lang,{maximumFractionDigits:digits,...(Math.abs(finite(n))>99999?{notation:'scientific'}:{})}).format(finite(n));
 const compass=(x,y,r=100)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.line}" stroke-width="2"/>`+[[0,'north'],[90,'east'],[180,'south'],[270,'west']].map(([h,k])=>{const d=direction(h,r+23);return text(x+d.x,y+d.y+6,t(k),{size:17});}).join('');
 let art='',description=t('scene'),waypointButtons=[];
 const variant=String(s.variant??'');

 if(vm.family==='preparation'||variant==='checklist') {
  if(variant==='boat-plan') {
   const rotation=finite(s.rotation);art+=boat(400,218,rotation,2.7);
   for(const [key,x,y] of [['top',400,45],['bottom',400,387],['left',140,217],['right',660,217]]) art+=tag(x,y,v[key]?t(v[key]):t(key),v[key]?C.teal:C.muted);
   for(const [field,color] of [['lookout',C.teal],['helper',C.amber]]) {
    const destination=v[field];if(!destination)continue;
    const stations={bow:{x:0,y:-84},stern:{x:0,y:90},port:{x:-43,y:48},starboard:{x:43,y:48}},p=stations[destination];
    if(p){const a=radians(rotation),x=400+p.x*Math.cos(a)-p.y*Math.sin(a),y=218+p.x*Math.sin(a)+p.y*Math.cos(a);art+=`<circle cx="${x}" cy="${y}" r="17" fill="${color}" stroke="white" stroke-width="3"/>`+text(x,y+6,field==='lookout'?'1':'2',{color:'white',size:16});}
   }
   description=`${t('scene')}. ${t('heading')}: ${degrees(rotation)}. ${t('preview')}.`;
  } else if(variant==='mob') {
   art+=`<rect x="46" y="66" width="708" height="316" rx="18" fill="${C.water}"/>`+boat(258,226,20,1.6);
   art+=`<circle cx="570" cy="186" r="13" fill="#d7ad88" stroke="${C.ink}" stroke-width="2"/><path d="M538 211Q552 187 566 213Q580 191 599 210" fill="none" stroke="${C.amber}" stroke-width="7"/>`+text(582,151,t('casualty'),{size:19,max:30});
   if(v.sam==='spot'||v.sam==='point'||list(v.actions).includes('point'))art+=line(279,206,550,188,C.teal,3,'6 5');
   if(v.jo==='alarmFloat'||v.jo==='flotation'||list(v.actions).includes('flotation'))art+=`<circle cx="525" cy="242" r="22" fill="none" stroke="#e08f38" stroke-width="10"/>`;
   if(s.propellerHazard)art+=`<circle cx="240" cy="327" r="26" fill="#eed8d0" stroke="${C.red}" stroke-width="3"/>`+text(240,335,'!',{size:29,color:C.red})+text(453,339,t('propeller'),{size:19,color:C.red,max:29});
   for(const [field,x] of [['sam',157],['jo',578]])if(v[field])art+=text(x,408,`${field==='sam'?'Sam':'Jo'}: ${vm.valueLabels?.[field]??t(v[field])}`,{size:16,max:30,maxLines:1});
  } else if(variant==='distress') {
   art+=`<rect x="83" y="114" width="234" height="225" rx="25" fill="#38565d" stroke="${C.ink}" stroke-width="3"/><path d="M126 114V54" stroke="${C.ink}" stroke-width="10"/><rect x="106" y="142" width="189" height="75" rx="8" fill="#cde3d4"/>`+text(202,190,'VHF',{size:31});
   for(let i=0;i<4;i++)art+=line(114,247+i*17,222,247+i*17,'#aec4be',5);
   art+=`<circle cx="266" cy="285" r="24" fill="#718f85" stroke="#a5b9ad" stroke-width="3"/>`;
   for(const [i,key] of ['identity','position','details'].entries())art+=`<rect x="365" y="${75+i*100}" width="367" height="85" rx="12" fill="${C.white}" stroke="${C.line}"/>`+text(548,103+i*100,t(key),{size:16,color:C.muted,max:29})+text(548,132+i*100,vm.valueLabels?.[key]??(v[key]?'●':'—'),{size:17,max:37,maxLines:2});
   art+=text(405,405,t('rehearsal'),{size:17,max:65});
  } else if(variant==='evidence') {
   const fields=['traffic','tack','docking'];
   fields.forEach((field,i)=>{const x=72+i*242;art+=`<rect x="${x}" y="89" width="218" height="250" rx="16" fill="${C.white}" stroke="${C.line}" stroke-width="2"/><path d="M${x+31} 113H${x+186}M${x+31} 132H${x+154}" stroke="${C.line}" stroke-width="4"/>`+boat(x+109,203,i===2?90:20,.62)+text(x+109,292,vm.valueLabels?.[field]??(v[field]?'●':'—'),{size:17,max:21});});art+=text(400,393,t('evidence'),{size:21,max:43});
  } else if(variant==='berth') {
   art+=`<rect x="522" y="66" width="113" height="288" rx="8" fill="#c9b493" stroke="#7f755e" stroke-width="3"/>`+text(581,389,t('berth'),{size:18,max:23})+boat(389,227,0,2.05);
   const side=v.fenders,offset=side==='port'?-53:53;if(side)for(const y of [169,222,281])art+=`<rect x="${389+offset-9}" y="${y}" width="18" height="32" rx="8" fill="${C.blue}" stroke="white" stroke-width="2"/>`;
   if(list(v.lines).length)art+=line(433,159,524,122,C.amber,3)+line(433,303,524,330,C.amber,3);
   if(v.escape){const d=direction(v.escape==='port'?270:v.escape==='starboard'?90:180,113);art+=arrow(`M369 254Q${369+d.x*.35} ${254+d.y*.35} ${369+d.x} ${254+d.y}`,C.teal,4)+text(171,322,t('escape'),{size:17,max:25});}
   if(s.obstructed)art+=`<path d="M505 211H651V269H505Z" fill="#ecc99e" stroke="${C.amber}" stroke-width="3"/>`+text(578,250,'!',{size:35,color:C.amber})+text(584,50,t('obstructed'),{size:17,max:32});
  } else if(variant==='rigging') {
   const hoist=list(v.sequence).indexOf('hoist'),sailTop=s.fouled?177:105;
   art+=`<path d="M159 307H587L550 341H192Z" fill="${C.white}" stroke="${C.blue}" stroke-width="3"/><path d="M333 82V307M337 ${sailTop}L489 274H337Z" fill="${C.white}" stroke="${C.blue}" stroke-width="3"/>`;
   art+=arrow('M312 270L312 108',v.raise==='halyard'?C.teal:C.blue,4)+text(210,146,t('halyard'),{color:C.blue,max:19});
   art+=`<path d="M480 275L432 308L480 287" fill="none" stroke="${v.angle==='sheet'?C.teal:C.amber}" stroke-width="4"/>`+text(610,286,t('sheet'),{color:C.amber,max:20});
   art+=line(164,312,123,363,C.muted,3)+text(156,395,t('rode'),{size:17,max:22});
   if(s.fouled)art+=`<circle cx="334" cy="176" r="21" fill="#f3d8bd" stroke="${C.amber}" stroke-width="3"/>`+text(334,184,'!',{size:27,color:C.amber})+text(528,118,t('snag'),{size:18,color:C.amber,max:28});
   if(hoist>=0)art+=text(465,389,`${t('preview')}: ${hoist+1}`,{size:17,max:28});
  } else if(variant==='checklist') {
   art+=boat(203,224,38,1.8);
   const facts=list(vm.facts).slice(0,4);
   facts.forEach((fact,i)=>{const y=82+i*78;art+=`<rect x="351" y="${y}" width="351" height="62" rx="12" fill="${C.white}" stroke="${C.line}"/>`+text(529,y+37,`${list(vm.inspected).includes(fact.id)?'✓':'○'} ${fact.label}`,{max:36,size:18});});
   if(v.decision)art+=tag(208,365,t(v.decision==='depart'?'departure':'decision'),C.teal);
  } else {
   art+=boat(402,216,0,2.7);
   art+=`<path d="M403 159L313 242A122 122 0 0 0 493 242Z" fill="#e5be8255" stroke="${C.amber}" stroke-dasharray="6 5"/><path d="M403 159L461 252" stroke="${C.amber}" stroke-width="6"/>`;
   const prepared=list(v.prepare),jacketCount=clamp(finite(s.readyJackets,0)+(prepared.includes('replace')&&prepared.includes('fit')?1:0),0,finite(s.people,3));
   const people=list(s.crew).length?s.crew:[{id:'alex',name:'Alex',x:402,y:294},{id:'sam',name:'Sam',x:379,y:142},{id:'jo',name:'Jo',x:447,y:260}];
   people.slice(0,6).forEach((person,i)=>{const x=finite(person.x,365+i*26),y=finite(person.y,200),ready=i<jacketCount;art+=`<circle cx="${x}" cy="${y-15}" r="11" fill="#d7ad88" stroke="${C.ink}" stroke-width="2"/><path d="M${x-14} ${y+7}Q${x} ${y-12} ${x+14} ${y+7}L${x+12} ${y+31}H${x-12}Z" fill="${ready?'#f7b74f':C.white}" stroke="${C.ink}" stroke-width="2"/>`;const labelX=i%2?205:605,labelY=112+i*105;art+=line(x+(i%2?-17:17),y+9,labelX+(i%2?70:-70),labelY,C.line)+text(labelX,labelY,person.name??person.id,{max:19})+text(labelX,labelY+26,t(v[person.id]??person.role??'open'),{size:16,color:C.teal,max:20});});
   art+=text(194,368,`${t('jackets')}: ${jacketCount} / ${finite(s.people,3)}`,{size:17,max:29})+text(620,407,t('boom'),{size:17,color:C.amber,max:25});
  }
 } else if(vm.family==='passage'&&variant==='weather'&&!list(s.routes).length) {
  const forecast=list(s.forecast),gustLimit=valueOf(vm,'gustLimit',s.gustLimit),visibilityLimit=valueOf(vm,'visibilityLimit',s.visibilityLimit);
  if(forecast.length){
   const first=finite(forecast[0].hour,8),last=Math.max(first+1,finite(forecast.at(-1).hour,12));
   const peak=Math.max(25,...forecast.map(p=>finite(p.gust)));const x=hour=>125+(finite(hour)-first)/(last-first)*540,y=gust=>319-finite(gust)/peak*176;
   art+=line(125,329,665,329,C.muted)+line(125,111,125,329,C.muted);
   art+=text(112,79,t('gust'),{size:18,max:23})+text(403,400,t('time'),{size:17,max:25});
   art+=`<path d="${forecast.map((p,i)=>`${i?'L':'M'}${x(p.hour)} ${y(p.gust)}`).join('')}" fill="none" stroke="${C.amber}" stroke-width="4"/>`;
   forecast.forEach(p=>{const px=x(p.hour),py=y(p.gust);art+=`<circle cx="${px}" cy="${py}" r="8" fill="${C.amber}"/>`+text(px,py-22,`${number(p.gust)} kn`,{size:21,color:C.amber})+text(px,357,`${String(Math.floor(finite(p.hour))).padStart(2,'0')}:00`,{size:19})+text(px,379,`${t('visibility')}: ${number(p.visibility)} nm`,{size:16,max:27});});
   if(v.departure){const hour=Number(String(v.departure).slice(0,2)),px=clamp(x(hour),80,720);art+=line(px,100,px,329,C.teal,3,'7 5')+text(px,86,t('departure'),{size:17,color:C.teal,max:22});}
  } else {
   art+=`<path d="M104 257Q137 206 177 243Q194 193 235 215Q278 225 270 262Z" fill="${C.white}" stroke="${C.muted}" stroke-width="3"/>`+arrow('M139 290L248 290',C.teal,4);
   art+=card(330,86,367,96,t('gust'),gustLimit===undefined?'—':`${number(gustLimit)} kn`)+card(330,216,367,96,t('visibility'),visibilityLimit===undefined?'—':`${number(visibilityLimit)} nm`);
  }
  if(s.windFrom!==undefined){const d=direction(finite(s.windFrom),36),flow=direction(finite(s.currentToward),36);art+=arrow(`M${589+d.x} ${159+d.y}L${589-d.x} ${159-d.y}`,C.teal,4)+text(589,117,`${t('wind')} ${degrees(s.windFrom)}`,{size:16,max:25});art+=arrow(`M${589-flow.x} ${240-flow.y}L${589+flow.x} ${240+flow.y}`,C.blue,4)+text(589,281,`${t('current')} ${degrees(s.currentToward)}`,{size:16,max:25});}
  description=t('weather')+'. '+forecast.map(p=>`${p.hour}:00, ${p.gust} kn, ${p.visibility} nm`).join('; ');
 } else if(vm.family==='passage'&&variant!=='time') {
  art+=`<rect x="42" y="47" width="716" height="330" rx="17" fill="${C.water}"/>`;
  const islands=list(s.land);
  islands.forEach(island=>{const x=finite(island.x,400),y=finite(island.y,200),rx=clamp(finite(island.rx,60),10,300),ry=clamp(finite(island.ry,75),10,180);art+=`<ellipse cx="${x}" cy="${y}" rx="${rx+11}" ry="${ry+11}" fill="none" stroke="#cfbd85" stroke-width="17"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.land}" stroke="#829e77" stroke-width="2"/>`;if(island.label)art+=text(x,y,island.label,{size:16,max:18});});
  const start=s.boat??s.start??s.routes?.[0]?.points?.[0]??{x:147,y:311,heading:35};art+=boat(finite(start.x,147),finite(start.y,311),finite(start.heading,35),.68);
  const waypoints=list(s.waypoints),routeSelection=valueOf(vm,'route',v.destination??s.selectedRoute??[]),chosen=list(routeSelection);
  for(const route of list(s.routes)) {
   const points=list(route.points);if(points.length<2)continue;
   const selected=route.id===routeSelection;
   const d=points.map((p,i)=>`${i?'L':'M'}${finite(p.x)} ${finite(p.y)}`).join('');
   art+=selected?arrow(d,C.teal,5):`<path d="${d}" fill="none" stroke="${C.muted}" stroke-width="2" stroke-dasharray="5 6" opacity=".6"/>`;
   if(route.label){const p=points[Math.floor(points.length/2)],key=String(route.label).toLowerCase(),label=key.startsWith('shelter')?`${t('sheltered')}${/\s[HF]$/.test(route.label)?' '+route.label.at(-1):''}`:key.startsWith('exposed')?`${t('exposed')}${/\s[HF]$/.test(route.label)?' '+route.label.at(-1):''}`:COPY[key]?t(key):route.label;art+=text(finite(p.x),finite(p.y)-16,label,{color:selected?C.teal:C.muted,size:16,max:20});}
  }
  if(chosen.length){const points=[start,...chosen.map(key=>waypoints.find(p=>p.id===key)).filter(Boolean)].filter((p,i,all)=>!i||p.x!==all[i-1].x||p.y!==all[i-1].y);if(points.length>1)art+=arrow(points.map((p,i)=>`${i?'L':'M'}${finite(p.x)} ${finite(p.y)}`).join(''),C.teal,5);}
  for(const waypoint of waypoints){const x=clamp(finite(waypoint.x),55,745),y=clamp(finite(waypoint.y),58,387);art+=`<circle cx="${x}" cy="${y}" r="9" fill="#e7b441" stroke="${C.ink}" stroke-width="2"/>`+text(x,y+31,waypoint.label??waypoint.id,{size:15,max:19});if(s.routeFieldId)waypointButtons.push({id:String(waypoint.id),fieldId:String(s.routeFieldId),label:String(waypoint.label??waypoint.id),x,y});}
  art+=arrow('M714 104L714 65',C.blue,3)+text(714,42,t('north'),{size:15});
  if(s.windFrom!==undefined){const d=direction(finite(s.windFrom),30);art+=arrow(`M${93+d.x} ${96+d.y}L${93-d.x} ${96-d.y}`,C.teal,3)+text(160,82,`${t('wind')} ${degrees(s.windFrom)}`,{size:15,max:27});}
  if(s.currentKnots!==undefined){const d=direction(finite(s.currentToward),29);art+=arrow(`M${662-d.x} ${321-d.y}L${662+d.x} ${321+d.y}`,C.blue,3)+text(569,359,`${t('current')} ${degrees(s.currentToward)} · ${number(s.currentKnots)} kn`,{size:15,max:39});}
  if(s.timeLabel)art+=text(206,365,s.timeLabel,{size:16,max:34});
  description=`${t('route')}. ${waypoints.map(p=>p.label??p.id).join(', ')}. ${t('preview')}.`;
 } else if(vm.family==='navigation'&&variant==='anchor') {
  const depth=finite(s.waterDepth,5),roller=finite(s.rollerHeight,1),surface=139,bed=surface+depth*21,available=clamp(finite(s.availableRadius,60),5,100),radius=finite(v.radius,0),rode=finite(v.rode,0);
  art+=`<path d="M46 ${surface}H402V${bed}H46Z" fill="${C.water}"/><path d="M46 ${bed}H402V363H46Z" fill="#d8d4bb"/><path d="M272 ${surface-roller*21}H364L349 ${surface+9}H289Z" fill="${C.white}" stroke="${C.blue}" stroke-width="3"/><path d="M280 ${surface-roller*21}Q183 ${bed-10} 87 ${bed}" fill="none" stroke="${C.amber}" stroke-width="4"/><path d="M72 ${bed-12}Q86 ${bed+9} 102 ${bed-12}M87 ${bed}V${bed-25}" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
  art+=text(224,78,s.waterDepth===undefined?t('anchor'):`${t('waterDepth')}: ${number(depth)} m`,{size:17,max:31})+text(209,385,`${t('rode')}: ${rode?number(rode)+' m':'—'}`,{size:17,max:29});
  art+=`<circle cx="602" cy="235" r="${available*1.8}" fill="${C.water}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="5 6"/>`+text(602,71,`${t('available')}: ${number(available)} m`,{size:17,max:29});
  if(radius>0)art+=`<circle cx="602" cy="235" r="${Math.min(143,radius*1.8)}" fill="none" stroke="${C.teal}" stroke-width="4"/>`;
  art+=`<circle cx="602" cy="235" r="7" fill="${C.ink}"/>`+boat(602+Math.min(143,(radius||available*.6)*1.8),235,0,.47)+text(602,385,`${t('radius')}: ${radius?number(radius)+' m':'—'}`,{size:17,max:28});
 } else if(vm.family==='navigation'&&(variant==='tide'||variant==='clearance'||s.chartDepth!==undefined)) {
  const chartDepth=Math.max(0,finite(s.chartDepth,2.4)),tideKnown=s.tideHeight!==undefined||valueOf(vm,'tideHeight',undefined)!==undefined,tideHeight=finite(valueOf(vm,'tideHeight',s.tideHeight??0)),draft=Math.max(.1,finite(s.draft,1.8)),depth=chartDepth+tideHeight;
  const scale=clamp(210/Math.max(2,depth,draft),20,70),surface=109,bed=clamp(surface+depth*scale,190,353),datum=surface+tideHeight*scale,keel=clamp(surface+draft*scale,130,377);
  art+=`<path d="M51 ${surface}H749V${bed}H51Z" fill="${C.water}"/><path d="M51 ${bed}H749V379H51Z" fill="#d8d4bb"/>`+line(51,datum,749,datum,C.muted,2,'6 5');
  art+=`<path d="M290 ${surface-14}H477L451 ${surface+21}H313Z" fill="${C.white}" stroke="${C.blue}" stroke-width="3"/><path d="M361 ${surface+21}V${keel}H403L420 ${surface+21}" fill="${C.line}" stroke="${C.blue}" stroke-width="3"/>`;
  art+=text(152,73,`${t('tide')}: ${tideKnown?number(tideHeight)+' m':'—'}`,{size:17,max:26})+text(159,238,`${t('chartDepth')}: ${number(chartDepth)} m`,{size:17,max:24})+text(633,123,`${t('draft')}: ${number(draft)} m`,{size:18,max:24})+text(142,datum-12,t('datum'),{size:15,max:24})+text(400,374,t('bed'),{size:16,max:24});
  art+=line(258,surface,258,datum,C.blue,3)+line(246,surface,270,surface,C.blue)+line(246,datum,270,datum,C.blue)+line(258,datum+8,258,bed,C.blue,3)+line(246,bed,270,bed,C.blue);
  art+=line(510,surface,510,keel,C.blue,3)+line(499,surface,521,surface,C.blue)+line(499,keel,521,keel,C.blue);
  const predicted=valueOf(vm,'clearance',v.ukc??v.staticClearance);if(predicted!==undefined&&predicted!=='')art+=card(556,251,188,90,t('prediction'),`${number(predicted)} m`);
  description=`${t('chartDepth')}: ${number(chartDepth)} m. ${t('tide')}: ${tideKnown?number(tideHeight)+' m':'—'}. ${t('draft')}: ${number(draft)} m.`;
 } else if(variant==='time') {
  art+=card(66,63,302,95,t('distance'),`${number(s.distanceNm)} nm`)+card(431,63,302,95,t('waterSpeed'),`${number(s.waterSpeed)} kn`);
  art+=arrow('M114 236L682 236',C.teal,4)+boat(146,236,90,.72);
  const predicted=v.arrivalMinutes??v.total??v.legA;
  art+=text(400,323,t('prediction'),{size:18,max:27})+text(400,362,predicted===undefined||predicted===''?'—':`${number(predicted)} min`,{size:27,color:C.teal,max:25});
 } else if(vm.family==='navigation'&&variant==='wind-vectors') {
  const heading=finite(s.heading),speed=Math.max(0,finite(s.waterSpeed)),trueSpeed=Math.max(0,finite(s.windSpeed)),air=direction(finite(s.windFrom)+180,trueSpeed),velocity=direction(heading,speed),relative={x:air.x-velocity.x,y:air.y-velocity.y};
  const scale=120/Math.max(1,trueSpeed,speed,Math.hypot(relative.x,relative.y)),x=274,y=209;
  art+=compass(x,y,135)+boat(x,y,heading,.58);
  if(trueSpeed>0)art+=arrow(`M${x-22} ${y}L${x-22+air.x*scale} ${y+air.y*scale}`,C.teal,4);
  if(speed>0)art+=arrow(`M${x+8} ${y}L${x+8+velocity.x*scale} ${y+velocity.y*scale}`,C.blue,4);
  if(Math.hypot(relative.x,relative.y)>0)art+=arrow(`M${x+33} ${y}L${x+33+relative.x*scale} ${y+relative.y*scale}`,C.amber,4,'6 4');
  art+=card(514,64,232,87,t('trueWind'),`${number(trueSpeed)} kn`)+card(514,171,232,87,t('waterSpeed'),`${number(speed)} kn`)+card(514,278,232,87,t('prediction'),v.apparentSpeed===undefined||v.apparentSpeed===''||!Number.isFinite(Number(v.apparentSpeed))||Number(v.apparentSpeed)<0?'—':`${number(v.apparentSpeed)} kn`);
  art+=text(165,403,t('trueWind'),{size:16,color:C.teal,max:25})+text(364,403,t('apparent'),{size:16,color:C.amber,max:25});
 } else if(vm.family==='navigation') {
  const isWind=/wind/.test(variant)||s.windFrom!==undefined,heading=finite(valueOf(vm,'heading',v.revisedHeading??s.heading??0)),speed=Math.max(0,finite(valueOf(vm,'waterSpeed',s.waterSpeed??s.boatSpeed??5)));
  const origin={x:284,y:249};art+=compass(origin.x,origin.y,130);
  if(isWind&&s.noGoHalfAngle!==undefined){const a=direction(finite(s.windFrom)-finite(s.noGoHalfAngle),118),b=direction(finite(s.windFrom)+finite(s.noGoHalfAngle),118);art+=`<path d="M${origin.x} ${origin.y}L${origin.x+a.x} ${origin.y+a.y}A118 118 0 0 1 ${origin.x+b.x} ${origin.y+b.y}Z" fill="#ead0ce" stroke="${C.red}" stroke-width="2"/>`;}
  art+=boat(origin.x,origin.y,heading,.68);
  if(isWind){const from=finite(s.windFrom,315),d=direction(from,105);art+=arrow(`M${origin.x+d.x} ${origin.y+d.y}L${origin.x+d.x*.28} ${origin.y+d.y*.28}`,C.teal,5);art+=card(516,74,229,88,t('wind'),degrees(from))+card(516,181,229,88,t('heading'),degrees(heading));if(s.windSpeed!==undefined)art+=card(516,288,229,88,t('trueWind'),`${number(s.windSpeed)} kn`);}
  else {const set=finite(s.currentToward,90),current=Math.max(0,finite(s.currentKnots,0)),scale=95/Math.max(1,speed+current),water=direction(heading,speed*scale),flow=direction(set,current*scale),x=origin.x,y=origin.y;if(speed>0)art+=arrow(`M${x} ${y}L${x+water.x} ${y+water.y}`,C.blue,4);if(current>0)art+=arrow(`M${x+water.x} ${y+water.y}L${x+water.x+flow.x} ${y+water.y+flow.y}`,C.amber,4);if(Math.hypot(water.x+flow.x,water.y+flow.y)>.01)art+=arrow(`M${x} ${y}L${x+water.x+flow.x} ${y+water.y+flow.y}`,C.teal,3,'6 4');art+=card(514,61,233,87,t('waterSpeed'),`${number(speed)} kn`)+card(514,170,233,87,t('current'),`${number(current)} kn · ${degrees(set)}`)+card(514,279,233,87,t('heading'),degrees(heading));art+=text(291,411,t('ground'),{size:16,color:C.teal,max:30});}
  description=`${t('heading')}: ${degrees(heading)}. ${t('preview')}.`;
 } else if(vm.family==='lookout'&&variant==='lights'&&s.periodSeconds!==undefined) {
  art+=`<rect x="61" y="63" width="678" height="296" rx="18" fill="#213744"/><path d="M349 242L366 123H394L411 242Z" fill="#687c7e"/><path d="M362 123L380 100L400 123Z" fill="#a0ada6"/><circle cx="380" cy="139" r="9" fill="white"/><path d="M379 137L173 82V213Z" fill="#fffbd21c"/><path d="M379 137L606 77V211Z" fill="#fffbd21c"/>`;
  art+=line(153,301,647,301,'#b5c6c1',3)+`<rect x="153" y="279" width="17" height="44" rx="4" fill="white"/><rect x="630" y="279" width="17" height="44" rx="4" fill="white"/>`+text(400,340,`${t('period')}: ${number(s.periodSeconds)} s`,{size:20,color:'#f4f4e7',max:38});
 } else if(vm.family==='lookout'&&(variant==='sensors'||variant==='night-approach')) {
  if(variant==='sensors'){
   art+=tag(400,86,'GPS G',C.blue)+arrow('M376 111L235 188',C.blue,3)+arrow('M424 111L565 188',C.blue,3);
   for(const x of [136,466])art+=`<rect x="${x}" y="188" width="198" height="120" rx="12" fill="${C.white}" stroke="${C.line}" stroke-width="2"/><rect x="${x+15}" y="203" width="168" height="66" rx="5" fill="${C.water}"/>`+text(x+99,245,'GPS G',{color:C.blue,size:20})+text(x+99,291,t('plotter'),{size:17,max:24});
   art+=tag(226,379,t('visual'),list(v.sources).includes('line')?C.teal:C.muted)+tag(574,379,t('depthTrend'),list(v.sources).includes('depth')?C.teal:C.muted);
  }else{
   art+=`<rect x="54" y="65" width="692" height="295" rx="18" fill="#263e48"/><path d="M530 65L565 160L635 187L745 179V65Z" fill="#718477"/>`+boat(277,292,40,.83);
   art+=`<circle cx="586" cy="113" r="6" fill="#fff6b2"/><circle cx="636" cy="84" r="6" fill="#fff6b2"/>`+line(586,113,222,323,'#efcf77',3,'6 5')+arrow('M310 310L676 174',C.blue,3,'7 5');
   art+=text(176,112,t('visual'),{color:'#fff6b2',size:18,max:24})+text(574,325,t('plotter'),{color:'#bddef0',size:18,max:24});
   if(v.decision==='hold')art+=`<circle cx="277" cy="292" r="57" fill="none" stroke="#d0e5c9" stroke-width="3" stroke-dasharray="6 5"/>`;
   art+=text(400,405,t('depthTrend'),{size:18,max:36});
  }
 } else if(vm.family==='lookout'&&variant==='lights') {
  art+=`<rect x="61" y="65" width="678" height="295" rx="18" fill="#213744"/><path d="M266 265Q397 178 534 265L500 293H300Z" fill="#405960" stroke="#698185" stroke-width="3"/>`;
  // Viewed from ahead: the other vessel's starboard green is on our left.
  if(list(s.sidelights).includes('green'))art+=`<circle cx="303" cy="244" r="28" fill="#28b876" opacity=".25"/><circle cx="303" cy="244" r="10" fill="#4af8a2"/>`;
  if(list(s.sidelights).includes('red'))art+=`<circle cx="495" cy="244" r="28" fill="#f66165" opacity=".25"/><circle cx="495" cy="244" r="10" fill="#ff787b"/>`;
  art+=text(400,107,t('lights'),{size:20,color:'#f3f4e9',max:39});
 } else if(vm.family==='lookout'&&variant==='signals') {
  if(s.restrictedVisibility){art+=`<rect x="67" y="70" width="666" height="296" rx="18" fill="#c4d3d4"/>`+boat(400,240,0,1.3,C.muted)+text(400,117,t('limited'),{size:23,max:39})+text(400,342,t('noContact'),{size:18,max:41});}
  else {for(const [i,count] of list(s.blasts).entries()){const y=106+i*110;art+=text(144,y+18,`${count}`,{size:29,color:C.teal});for(let n=0;n<count;n++)art+=`<rect x="${235+n*113}" y="${y-7}" width="77" height="28" rx="14" fill="${C.teal}"/>`;const chosen=v[['one','two','three'][i]];if(chosen)art+=text(625,y+14,t(chosen),{size:18,max:23});}art+=text(400,411,t('sound'),{size:18,max:39});}
 } else if(vm.family==='lookout') {
  const own=s.boat??list(s.contacts).find(c=>c.id==='own')??{x:236,y:296,heading:0};art+=`<rect x="40" y="51" width="720" height="326" rx="18" fill="${C.water}"/>`+boat(finite(own.x,236),finite(own.y,296),finite(own.heading),.8);
  if(own.id==='own')art+=text(finite(own.x),finite(own.y)+57,t('own'),{size:17,max:24});
  if(own.tack)art+=text(finite(own.x),finite(own.y)-53,`${t('tack')}: ${t(own.tack)}`,{size:16,max:24});
  const contacts=list(s.contacts).filter(c=>c.id!=='own');
  contacts.forEach((contact,i)=>{
   const hasBearing=contact.bearing!==undefined&&contact.range!==undefined,offset=direction(finite(contact.bearing),finite(contact.range)*280);
   const x=clamp(hasBearing?finite(own.x,236)+offset.x:finite(contact.x,501+i*40),61,735),y=clamp(hasBearing?finite(own.y,296)+offset.y:finite(contact.y,142+i*67),82,333),hidden=contact.visible===false;
   if(list(contact.history).length)art+=`<path d="${list(contact.history).map((p,j)=>`${j?'L':'M'}${finite(p.x)} ${finite(p.y)}`).join('')}L${x} ${y}" fill="none" stroke="${C.muted}" stroke-dasharray="5 6"/>`;
   art+=line(finite(own.x,236),finite(own.y,296),x,y,C.amber,2,'6 6');
   art+=hidden?`<circle cx="${x}" cy="${y}" r="25" fill="#f0f1e8" stroke="${C.muted}" stroke-width="2" stroke-dasharray="5 5"/>${text(x,y+7,'?',{size:25})}`:boat(x,y,finite(contact.heading,220),.59,C.teal);
   const label=contact.label??(contact.id==='other'?t('other'):contact.id)??`${t('contact')} ${i+1}`;art+=text(x,y-43,label,{size:16,max:20});
   if(contact.tack)art+=text(x,y+55,`${t('tack')}: ${t(contact.tack)}`,{size:16,max:25});
   const reading=[contact.bearing!==undefined?`${degrees(contact.bearing)}`:'',contact.range!==undefined?`${number(contact.range)} ${contact.rangeUnit??'nm'}`:''].filter(Boolean).join(' · ');if(reading)art+=text(x,y+55,reading,{size:17,max:25});
  });
  if(!contacts.length){const count=Math.max(1,Math.min(3,finite(s.people,1)));for(let i=0;i<count;i++)art+=`<circle cx="${464+i*56}" cy="190" r="15" fill="#edb477" stroke="${C.ink}" stroke-width="2"/><path d="M${444+i*56} 212Q${464+i*56} 195 ${484+i*56} 212" fill="none" stroke="${C.amber}" stroke-width="9"/>`;}
  art+=text(160,407,`${t('observation')} ${finite(s.observationIndex,0)+1}`,{size:17,max:26});
  if(s.visibility!==undefined)art+=text(603,407,`${t('visibility')}: ${s.visibility}`,{size:17,max:29});
  if(s.timeLabel)art+=text(158,83,s.timeLabel,{size:18,max:26});
  if(s.windFrom!==undefined){const d=direction(finite(s.windFrom),34);art+=arrow(`M${677+d.x} ${99+d.y}L${677-d.x} ${99-d.y}`,C.teal,4)+text(667,159,`${t('wind')} ${degrees(s.windFrom)}`,{size:16,max:23});}
  description=`${t('observation')} ${finite(s.observationIndex,0)+1}. ${contacts.map(c=>`${c.label??c.id}: ${c.bearing!==undefined?degrees(c.bearing):''}, ${c.range??''} ${c.rangeUnit??'nm'}`).join('. ')}`;
 } else {art+=boat(400,223,finite(s.heading),2);description=t('scene');}
 const defs=[...markers.values()].map(m=>`<marker id="${m.id}" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="${m.size}" markerHeight="${m.size}" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 -4.5L10 0L0 4.5Z" fill="${m.color}"/></marker>`).join('');
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" width="800" height="440" role="img" aria-labelledby="${id}-title ${id}-desc" lang="${lang}" class="scenario-visual__svg"><title id="${id}-title">${escape(t('scene'))}</title><desc id="${id}-desc">${escape(description)}</desc><defs>${defs}</defs><rect width="800" height="440" rx="19" fill="${C.paper}"/><g aria-hidden="true" font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif">${art}</g></svg>`,waypoints:waypointButtons};
}

/** Mount once, update whenever the task form or canonical attempt state changes.
 * The root application should import scenario-visual.css alongside its workspace CSS.
 */
export function createScenarioVisual(container,{onInspect=()=>{},onAction=()=>{},lang='en'}={}) {
 let vm={},disposed=false,activeFact=null,stageKey='',zoom=1;
 container.classList.add('scenario-visual');
 function render(){
  if(disposed)return;
  const locale=localeOf(vm.lang??lang),t=key=>translated(key,locale),facts=list(vm.facts),inspected=new Set(list(vm.inspected));
  const focused=document.activeElement?.closest?.('[data-scenario-inspect],[data-scenario-waypoint]');
  const focusId=focused&&container.contains(focused)?focused.getAttribute('data-scenario-inspect')??focused.getAttribute('data-scenario-waypoint'):null;
  const figure=renderScenarioScene({...vm,lang:locale});
  const current=facts.find(f=>f.id===activeFact);
  container.dir=['ar','he'].includes(locale)?'rtl':'ltr';
  container.innerHTML=`<div class="scenario-visual__toolbar"><span>${escape(t('preview'))}</span><div class="scenario-visual__zoom"><button type="button" data-scenario-zoom="out" aria-label="${escape(t('zoom'))} −" ${zoom<=1?'disabled':''}>−</button><button type="button" data-scenario-zoom="reset">${escape(t('restore'))}</button><button type="button" data-scenario-zoom="in" aria-label="${escape(t('zoom'))} +" ${zoom>=2?'disabled':''}>+</button></div></div><div class="scenario-visual__viewport" tabindex="0" role="region" aria-label="${escape(t('scene'))}"><div class="scenario-visual__drawing" style="--scenario-zoom:${zoom}">${figure.svg}${figure.waypoints.map(p=>`<button type="button" class="scenario-visual__waypoint" style="left:${p.x/8}%;top:${p.y/4.4}%" data-scenario-waypoint="${escape(p.id)}" data-scenario-field="${escape(p.fieldId)}" aria-label="${escape(t('waypoint'))}: ${escape(p.label)}"><span aria-hidden="true">+</span></button>`).join('')}</div></div><p class="scenario-visual__note">${escape(t(figure.waypoints.length?'routeHint':'fictional'))}</p><div class="scenario-visual__facts" role="group" aria-label="${escape(t('inspect'))}">${facts.map((fact,i)=>`<button type="button" data-scenario-inspect="${escape(fact.id)}" aria-pressed="${fact.id===activeFact}"><span class="scenario-visual__fact-number" aria-hidden="true">${i+1}</span><span>${escape(fact.label)}</span><span class="scenario-visual__fact-status" aria-label="${escape(inspected.has(fact.id)?t('inspected'):t('open'))}">${inspected.has(fact.id)?'✓':'○'}</span></button>`).join('')}</div><div class="scenario-visual__report" role="status" aria-live="polite">${current?`<strong>${escape(current.label)}</strong><p>${escape(current.text)}</p>`:`<p>${escape(t('selectFact'))}</p>`}</div>`;
  if(focusId){const target=[...container.querySelectorAll('[data-scenario-inspect],[data-scenario-waypoint]')].find(el=>el.getAttribute('data-scenario-inspect')===focusId||el.getAttribute('data-scenario-waypoint')===focusId);target?.focus({preventScroll:true});}
 }
 function click(event){
  const button=event.target.closest('button');if(!button||!container.contains(button)||disposed)return;
  if(button.dataset.scenarioInspect!==undefined){activeFact=button.dataset.scenarioInspect;onInspect(activeFact);render();}
  if(button.dataset.scenarioWaypoint!==undefined)onAction({fieldId:button.dataset.scenarioField,value:button.dataset.scenarioWaypoint,type:'append'});
  if(button.dataset.scenarioZoom){zoom=button.dataset.scenarioZoom==='reset'?1:clamp(zoom+(button.dataset.scenarioZoom==='in'?.25:-.25),1,2);render();container.querySelector(`[data-scenario-zoom="${button.dataset.scenarioZoom}"]`)?.focus({preventScroll:true});}
 }
 container.addEventListener('click',click);
 return {update(next){if(disposed)return;vm=next??{};const key=`${vm.scenarioId}:${vm.stageId}`;if(key!==stageKey){activeFact=null;zoom=1;stageKey=key;}render();},dispose(){if(disposed)return;disposed=true;container.removeEventListener('click',click);container.replaceChildren();container.classList.remove('scenario-visual');}};
}
