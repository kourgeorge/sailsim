const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sequence=0;

/** Side-view teaching geometry, projected from the actual anchor snapshot.
 * The endpoints and depth ratio follow the model; the slack curve is illustrative.
 */
export function anchorDiagramGeometry(snapshot){
 const verticalScale=114/Math.max(4,snapshot.vertical),waterY=42+snapshot.fairlead.y*verticalScale,bottomY=waterY+snapshot.anchorDepth*verticalScale;
 const xScale=220/Math.max(snapshot.swingRadius,snapshot.distance,snapshot.vertical,1);
 const bow={x:70+snapshot.distance*xScale,y:waterY-snapshot.fairlead.y*verticalScale};
 const anchor=snapshot.anchorPoint?{x:snapshot.seabedContact?70:bow.x,y:waterY-snapshot.anchorPoint.y*verticalScale}:null;
 const slack=snapshot.status==='slack';
 const path=!anchor?'':slack?`M${bow.x},${bow.y} Q${Math.max(25,bow.x-28)},${Math.min(bottomY,bow.y+(bottomY-bow.y)*.9)} ${anchor.x},${anchor.y}`:`M${bow.x},${bow.y} L${anchor.x},${anchor.y}`;
 return {waterY,bottomY,bow,anchor,path,slack};
}

export function renderAnchorDiagram(snapshot,t=value=>value){
 const geometry=anchorDiagramGeometry(snapshot),{waterY,bottomY,bow,anchor,path}=geometry,id=`anchor-figure-${++sequence}`;
 const hanging=anchor??{x:bow.x,y:bow.y+4};
 const status=snapshot.status==='dragging'?'Anchor dragging':snapshot.status==='taut'?'Rode taut':snapshot.status==='slack'?'Rode slack':snapshot.status==='suspended'?'Anchor suspended':snapshot.status==='pending'?'Awaiting deployment':'Stowed';
 return `<svg class="anchor-diagram" data-anchor-status="${snapshot.status}" viewBox="0 0 360 180" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">${esc(t('Side view · schematic'))}</title><desc id="${id}-desc">${esc(t(status))}. ${esc(t('Rode shape is illustrative. Check depth, swing room and holding with real observations.'))}</desc>
 <rect x="0" y="${waterY}" width="360" height="${bottomY-waterY}" fill="#244e5a"/><path d="M0 ${waterY}H360" stroke="#89c4d2" stroke-width="2"/><path d="M0 ${bottomY}H360" stroke="#c4b586" stroke-width="3"/><path d="M0 163H360 M0 172H360" stroke="#c4b586" stroke-opacity=".13"/>
 <g transform="translate(${bow.x},${bow.y})"><path d="M-5 0H47L42 13H7Z" fill="#dce9dd"/><path d="M20 0V-17H32L36 0" fill="#8da9b0"/><circle r="2.6" fill="#ecc78e"/></g>
 ${path?`<path data-rode d="${path}" fill="none" stroke="${snapshot.status==='dragging'?'#f3a480':'#edc890'}" stroke-width="2.4" stroke-linecap="round"/>`:''}
 <g data-anchor-icon transform="translate(${hanging.x},${hanging.y})" fill="none" stroke="${anchor?'#edc890':'#92a6aa'}" stroke-width="2" stroke-linecap="round"><circle cy="-10" r="2.2"/><path d="M0-8V0M-5-6H5M-8-4Q-7 1 0 0Q7 1 8-4M-8-4L-8-1M8-4L8-1"/></g>
 </svg>`;
}

/** North-up chart overlay: this circle constrains the bow, not the whole hull. */
export function drawAnchorChart(ctx,map,scale,snapshot){
 if(!snapshot.seabedContact)return;
 const [ax,ay]=map(snapshot.seabedPoint.x,snapshot.seabedPoint.z),[bx,by]=map(snapshot.fairlead.x,snapshot.fairlead.z);
 ctx.save();ctx.strokeStyle=snapshot.status==='dragging'?'#f3a480':'#dac291';ctx.lineWidth=1.3;
 ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(ax,ay,snapshot.swingRadius*scale,0,Math.PI*2);ctx.stroke();
 ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
 ctx.beginPath();ctx.moveTo(ax,ay-5);ctx.lineTo(ax,ay+4);ctx.moveTo(ax-3,ay-2);ctx.lineTo(ax+3,ay-2);ctx.moveTo(ax-5,ay);ctx.quadraticCurveTo(ax-5,ay+6,ax,ay+4);ctx.quadraticCurveTo(ax+5,ay+6,ax+5,ay);ctx.stroke();ctx.restore();
}
