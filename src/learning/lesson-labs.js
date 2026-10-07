// Which lesson pages show an interactive mini-lab instead of the still diagram.
// Keys are concept page indexes; each value is a lab id or {id, initial, tasks}.
// The starting state matches what the page text describes, so the lab teaches
// even before it is touched.
export const lessonLabs={
 'sail-02':{1:{id:'rudder',initial:{speed:0,helm:20},tasks:['compare']}},
 'sail-04':{2:{id:'current-track',tasks:['cross','rightAngle']},4:{id:'compass-wind',tasks:['beamPort','beamStarboard']}},
 'sail-05':{0:{id:'compass-wind',tasks:['shift','irons']},1:{id:'sail-force',initial:{windAngle:30,sheet:10},tasks:['nogo','best45']}},
 'sail-07':{2:{id:'rudder',initial:{speed:1,helm:15},tasks:['compare']}},
 'sail-08':{1:{id:'rudder',initial:{speed:4,helm:15},tasks:['coast']},2:{id:'heel-reef',initial:{windSpeed:20,reef:0},tasks:['reefPoint','compare']}},
 'sail-09':{0:{id:'compass-wind',tasks:['beamPort','beamStarboard','edge']},1:{id:'sail-force',initial:{windAngle:90,sheet:72},tasks:['best45','best90','run']},2:{id:'apparent-wind',initial:{boatSpeed:0,trueAngle:90,trueSpeed:12},tasks:['speedUp','bearAway']}},
 'sail-10':{0:{id:'sail-force',initial:{windAngle:45,sheet:30},tasks:['best45','nogo']},2:{id:'sail-force',initial:{windAngle:45,sheet:30},tasks:['luff','stall']}},
 'sail-11':{1:{id:'sail-force',initial:{windAngle:150,sheet:80},tasks:['run','stall']},2:{id:'tack-gybe',initial:{maneuver:'gybe',rate:'normal',sheetIn:false},tasks:['gybe','gybeSheet']}},
 'sail-12':{0:{id:'sail-force',initial:{windAngle:90,sheet:90},tasks:['luff','stall','best90']}},
 'sail-13':{0:{id:'compass-wind',initial:{heading:45,windFrom:0},tasks:['edge','irons']},1:{id:'sail-force',initial:{windAngle:110,sheet:80},tasks:['best45','best90']}},
 'sail-14':{1:{id:'tack-gybe',initial:{maneuver:'tack',rate:'normal'},tasks:['tack','irons']}},
 'sail-15':{1:{id:'tack-gybe',initial:{maneuver:'gybe',rate:'normal',sheetIn:true},tasks:['gybe','gybeSheet']}},
 'sail-16':{0:{id:'tack-gybe',initial:{maneuver:'tack',rate:'slow'},tasks:['irons','tack']},2:{id:'rudder',initial:{speed:-1,helm:20},tasks:['astern']}},
 'sail-17':{1:{id:'apparent-wind',initial:{boatSpeed:6,trueAngle:90,trueSpeed:12},tasks:['speedUp','bearAway']}},
 'sail-18':{0:{id:'heel-reef',initial:{windSpeed:10,reef:0},tasks:['double','reefPoint']},1:{id:'heel-reef',initial:{windSpeed:20,reef:0},tasks:['reefPoint','compare']}},
 'sail-22':{2:{id:'current-track',tasks:['cross']}},
 'sail-25':{1:{id:'collision-bearing',tasks:['spot','bigTurn','clear']}},
 'sail-26':{0:{id:'compass-wind',initial:{heading:90,windFrom:0},tasks:['beamPort','beamStarboard']}},
 'sail-27':{0:{id:'lights-aspect',tasks:['headOn','redOnly','sternOnly']}},
 'sail-29':{2:{id:'docking',initial:{engine:'astern',helm:0,wind:'none'},tasks:['walk','blowOff','swing']}},
 'sail-30':{1:{id:'anchor-scope',initial:{depth:5,rode:12},tasks:['shortest5','deeper','swing']},2:{id:'anchor-scope',initial:{depth:5,rode:31},tasks:['swing','shortest5']}},
 'sail-31':{0:{id:'anchor-scope',initial:{depth:5,rode:6},tasks:['shortest5','swing']}},
 'sail-32':{1:{id:'anchor-scope',initial:{depth:5,rode:20},tasks:['breakout']}},
 'sail-39':{1:{id:'current-track',initial:{heading:90,currentDirection:270,currentSpeed:1,markDistance:12},tasks:['against','behind']},2:{id:'current-track',tasks:['cross']}},
 'sail-41':{0:{id:'collision-bearing',tasks:['spot','bigTurn']}},
 'sail-42':{0:{id:'lights-flash',tasks:['twoCycles','group']},1:{id:'lights-leading',tasks:['onLine','left','closer']}},
 'sail-43':{1:{id:'rudder',initial:{speed:0.5,helm:25},tasks:['compare','coast']}},
 'sail-44':{1:{id:'docking',initial:{engine:'neutral',helm:0,speed:1.5,wind:'offDock'},tasks:['blowOff','stop','walk']}},
 'sail-45':{0:{id:'rudder',initial:{speed:-1,helm:20},tasks:['astern']}},
 'sail-46':{1:{id:'compass-wind',initial:{heading:90,windFrom:0},tasks:['beamPort','beamStarboard']}},
 'sail-48':{1:{id:'collision-bearing',tasks:['bigTurn','clear']}},
 'sail-49':{3:{id:'current-track',initial:{heading:90,currentDirection:0,currentSpeed:1.5},tasks:['rightAngle']}},
 'sail-50':{0:{id:'lights-aspect',initial:{vessel:'power'},tasks:['sternOnly','power']}},
 'sail-53':{0:{id:'lights-flash',tasks:['twoCycles','isoOc']},1:{id:'lights-leading',tasks:['onLine','left']}},
};
/** Quiz questions that show a lab: {lessonId: {questionIndex: spec}}. */
export const quizLabs={};
