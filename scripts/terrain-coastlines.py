"""OSM directed coastlines to a land mask, including lagoons and clipped mainland.
The local OSM extracts cache both reproducibility and courteous API usage.
"""
from pathlib import Path
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import numpy as np
from shapely import contains_xy
from shapely.geometry import LineString, box
from shapely.ops import unary_union, polygonize

def coast_land_mask(place, bounds, cols, rows, cache):
    west,south,east,north=bounds
    path=cache/f"{place['id']}.osm"
    if place['id']=='virgin-islands':path=cache/'virgin-islands-sandy-spit.osm'
    if not path.exists():
        # A small halo ensures coastline endpoints outside the survey are joined.
        print(f"Fetching coastlines for {place['id']}",flush=True)
        def extract(w,s,e,n,level=0):
            url=f'https://api.openstreetmap.org/api/0.6/map?bbox={w:.7f},{s:.7f},{e:.7f},{n:.7f}'
            req=urllib.request.Request(url,headers={'User-Agent':'SailSimulatorTerrainBuilder/1.0'})
            try:
                with urllib.request.urlopen(req,timeout=55) as response: return [ET.fromstring(response.read())]
            except urllib.error.HTTPError as error:
                if error.code!=400 or level>=4: raise
                # The read API limits each extract to 50,000 nodes. Split only
                # when necessary, and retain only coastline ways and their nodes.
                if e-w>n-s:
                    middle=(w+e)/2
                    return extract(w,s,middle,n,level+1)+extract(middle,s,e,n,level+1)
                middle=(s+n)/2
                return extract(w,s,e,middle,level+1)+extract(w,middle,e,n,level+1)
        extracts=extract(west-.006,south-.006,east+.006,north+.006)
        nodes={n.attrib['id']:n for root in extracts for n in root.findall('node')}
        ways={w.attrib['id']:w for root in extracts for w in root.findall('way') if any(t.attrib.get('k')=='natural' and t.attrib.get('v')=='coastline' for t in w.findall('tag'))}
        refs={n.attrib['ref'] for w in ways.values() for n in w.findall('nd')}
        root=ET.Element('osm')
        root.extend(nodes[k] for k in refs);root.extend(ways.values())
        path.write_bytes(ET.tostring(root))
    root=ET.fromstring(path.read_bytes())
    nodes={n.attrib['id']:(float(n.attrib['lon']),float(n.attrib['lat'])) for n in root.findall('node')}
    ways=[]
    for w in root.findall('way'):
        if any(t.attrib.get('k')=='natural' and t.attrib.get('v')=='coastline' for t in w.findall('tag')):
            ways.append([nodes[n.attrib['ref']] for n in w.findall('nd')])
    if not ways: raise RuntimeError(f"No coastlines for {place['id']}")
    boundary=box(west,south,east,north)
    lines=[LineString(w).intersection(boundary) for w in ways]
    faces=list(polygonize(unary_union([boundary.boundary,*lines])))
    segments=np.array([[a,b] for way in ways for a,b in zip(way,way[1:])])
    a=segments[:,0];delta=segments[:,1]-a;lengths=np.sum(delta*delta,axis=1)
    land=[]
    for face in faces:
        point=face.representative_point(); p=np.array([point.x,point.y])
        t=np.clip(np.sum((p-a)*delta,axis=1)/np.maximum(lengths,1e-20),0,1)
        closest=np.argmin(np.sum((p-a-t[:,None]*delta)**2,axis=1))
        d=delta[closest];v=p-a[closest]
        if d[0]*v[1]-d[1]*v[0]>0: land.append(face)
    shape=unary_union(land)
    gx,gy=np.meshgrid(np.linspace(west,east,cols),np.linspace(north,south,rows))
    mask=contains_xy(shape,gx,gy)
    if not .01<mask.mean()<.97: raise RuntimeError(f"Unexpected land coverage: {place['id']} {mask.mean()}")
    return mask,ways
