import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {suggestedSheet} from '../src/physics.js';

// Coefficient-only engineering experiment. None of these candidates is loaded
// by the simulator, and none is a measured flexible-sail polar.
const RAD=Math.PI/180,clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function baseline(alpha){
 const a=alpha*RAD;
 return {lift:alpha<90?1.15*Math.exp(-(((alpha-18)/25)**2))*Math.min(1,alpha/8):0,drag:.035+1.3*Math.sin(a)**2};
}
function normalPlate(alpha){
 const a=alpha*RAD;
 return {lift:1.3*Math.sin(a)*Math.cos(a),drag:.035+1.3*Math.sin(a)**2};
}
const stall=18*RAD,atStall=baseline(18);
const A=(atStall.lift-1.3*Math.sin(stall)*Math.cos(stall))*Math.sin(stall)/Math.cos(stall)**2;
const B=(atStall.drag-1.3*Math.sin(stall)**2)/Math.cos(stall);
function viternaSymmetric(alpha){
 // Viterna's 18..90 degree formula, matched to this model's empirical peak.
 // Symmetric reverse-flow continuation is an explicit experiment: AirfoilPreppy
 // instead uses a 0.7 reverse-lift adjustment and an endpoint linear segment.
 const reverse=alpha>90,aDeg=reverse?180-alpha:alpha,a=aDeg*RAD;
 const c=aDeg<=18?baseline(aDeg):{lift:.65*Math.sin(2*a)+A*Math.cos(a)**2/Math.sin(a),drag:1.3*Math.sin(a)**2+B*Math.cos(a)};
 return {...c,lift:c.lift*(reverse?-1:1)};
}
function force(fn,angle,sheet){
 const alpha=clamp(angle-sheet,0,180),{lift,drag}=fn(alpha),a=angle*RAD,s=sheet*RAD;
 const rawDrive=lift*Math.sin(a)-drag*Math.cos(a),side=lift*Math.cos(a)+drag*Math.sin(a);
 return {alpha,lift,drag,drive:Math.max(0,rawDrive),rawDrive,side,
  // Coordinates fixed to leeward sail chord. Tangential force need not be zero
  // for an attached airfoil; normalPlate's skin-drag-free part must be normal.
  sailNormal:rawDrive*Math.sin(s)+side*Math.cos(s),sailTangent:rawDrive*Math.cos(s)-side*Math.sin(s)};
}
function scan(name,fn){
 const rows=[];
 for(let angle=20;angle<=180;angle++){
  let best={drive:-1};
  for(let sheet=0;sheet<=85;sheet++){
   const f=force(fn,angle,sheet);
   if(f.drive>best.drive)best={angle,sheet,...f};
  }
  // Fail loudly if production changes and the copied baseline becomes stale.
  if(name==='current'&&best.sheet!==suggestedSheet(angle))throw new Error(`Copied baseline differs from production suggestedSheet at AWA ${angle}; update audit formula.`);
  rows.push(best);
 }
 const changes=rows.slice(1).map((row,i)=>({angle:row.angle,previousSheet:rows[i].sheet,sheet:row.sheet,step:row.sheet-rows[i].sheet}));
 return {name,largestTrimStep:changes.reduce((a,b)=>Math.abs(a.step)>Math.abs(b.step)?a:b),rows};
}
const physicsSource=await readFile(new URL('../src/physics.js',import.meta.url),'utf8');
const models=[scan('current',baseline),scan('normal-plate-only',normalPlate),scan('viterna-symmetric-experiment',viternaSymmetric)];
const incidenceRows=Array.from({length:181},(_,alpha)=>({alpha,current:baseline(alpha),normalPlate:normalPlate(alpha),viternaSymmetric:viternaSymmetric(alpha)}));
const data={schemaVersion:1,generatedAt:new Date().toISOString(),command:'node scripts/physics-aerodynamic-audit.mjs',physicsSourceSha256:createHash('sha256').update(physicsSource).digest('hex'),
 scope:'Coefficient-only experiments. No candidate applied to the simulator. No speed prediction, measured sail validation, or external polar calibration.',
 geometry:{incidence:'alpha = abs(AWA) - leeward sheet angle, clamped at 0; consistent with rig-state.js boom orientation.',rotation:'Forward = CL*sin(AWA) - CD*cos(AWA); leeward side = CL*cos(AWA) + CD*sin(AWA). Existing rotation has correct orientation.',normalPlate:'CL=1.3*sin(alpha)*cos(alpha); CD=0.035+1.3*sin(alpha)^2. Without skin drag, force lies along sail normal; CL changes sign past alpha90. Coefficient1.3 retained only for comparison.'},
 viterna:{stallMatchDeg:18,dragMax:1.3,A,B,formula:'CL=CDmax/2*sin(2alpha)+A*cos(alpha)^2/sin(alpha); CD=CDmax*sin(alpha)^2+B*cos(alpha), for 18<alpha<=90.',limitations:'Matches empirical peak, not measured flexible-sail data. Above90 uses symmetric CL sign reversal and mirrored CD; this differs from AirfoilPreppy reverse-flow adjustments. A real stall can cause a discontinuous global optimum; continuity alone is not physical validation.'},
 references:[{url:'https://raw.githubusercontent.com/NLRWindSystems/AirfoilPreppy/master/airfoilprep/airfoilprep.py',accessed:'2026-10-01',sections:'Polar.extrapolate and __Viterna',supports:'Viterna matching equations and high-incidence lift/drag continuation; wind-turbine airfoil context, not a sail calibration.'},{url:'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/foilinc/',accessed:'2026-10-01',supports:'Stall and lift coefficients need experimental evidence; high-incidence flow is unsteady.'}],
 conclusions:['Existing Gaussian lift plus independent sin-squared drag has competing trim maxima; global optimizer changes abruptly.',
  'Do not smooth suggested sheets as a substitute for correcting and validating the force polar.',
  'Normal-plate-only coefficients give an instructive separated-flow limit but discard attached-flow sail performance.',
  'Viterna preserves attached-flow values through18 degrees and supplies separated-flow lift; its optimum still jumps, so it is not a validated drop-in repair.',
  'Do not reject all broad-reach windward sideforce: attached-flow lift can point windward after AWA90. Assess against measured total-sail forces and actual rig geometry.'],models,incidenceRows};
const output=new URL('../artifacts/physics-aerodynamic-audit.json',import.meta.url);
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(output,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({output:output.pathname,models:models.map(({name,largestTrimStep})=>({name,largestTrimStep}))},null,2));
