import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Waterline is local y=0. Keep the keel joined to the hull's underside and
// put its lowest point at the same draft used for depth/grounding checks.
export function createKeelGeometry(draft) {
 const top=-.55,height=draft+top;
 if(!(height>0))throw new RangeError('Draft must extend below the hull underside');
 const geometry=new RoundedBoxGeometry(.2,height,1.7,2,Math.min(.066,height/3));
 geometry.translate(0,(top-draft)/2,-.2);
 return geometry;
}
