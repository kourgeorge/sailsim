"""Rebuild the ten bundled destinations from public AWS/Mapzen Terrarium DEMs.

Run: uv run --with pillow --with numpy --with scipy --with scikit-image --with shapely python scripts/build-world-destinations.py
No runtime terrain service or API key is required. Cache is outside the repository.
"""
import base64
import concurrent.futures
import hashlib
import io
import json
import math
from pathlib import Path
import time
import urllib.request
import importlib.util
from shapely.geometry import Polygon, Point

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, map_coordinates
from skimage.measure import find_contours, approximate_polygon

spec=importlib.util.spec_from_file_location('coastlines',Path(__file__).with_name('terrain-coastlines.py'))
coastlines=importlib.util.module_from_spec(spec)
spec.loader.exec_module(coastlines)

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/sail-world-terrain-tiles')
CACHE.mkdir(exist_ok=True)
ZOOM = 12
def encode_grid(packed):
    output=bytearray()
    def put(v):
        while v>=128:
            output.append((v&127)|128);v>>=7
        output.append(v)
    values=packed.ravel();i=0;last=0
    while i<len(values):
        value=int(values[i])
        if value==last:
            end=i+1
            while end<len(values) and int(values[end])==last: end+=1
            put(0);put(end-i);i=end
        else:
            delta=value-last;put(((delta<<1)^(delta>>31))+1);last=value;i+=1
    return base64.b64encode(output).decode()
CATALOG = [
    dict(id='virgin-islands', title='British Virgin Islands', region='Caribbean', lat=18.425, lon=-64.66, width=26000, length=18000, start=[18.4487,-64.7102], heading=45, biome='tropical', description='Circle the white sand and low foliage of Sandy Spit, then explore Jost Van Dyke, its quiet anchorages, and the green ridges of Tortola.', landmarks=[['Tortola',18.426,-64.62],['Sandy Spit',18.449722,-64.708889],['Peter Island',18.355,-64.575]]),
    dict(id='grenadines', title='Tobago Cays', region='Saint Vincent & the Grenadines', lat=12.635, lon=-61.37, width=15000, length=15000, start=[12.637,-61.364], heading=40, biome='tropical', description='Explore the tiny Tobago Cays, the low reef-fringed lagoon, and the volcanic hills of Mayreau and Union Island.', landmarks=[['Tobago Cays',12.635,-61.354],['Mayreau',12.638,-61.391],['Union Island',12.601,-61.439]]),
    dict(id='exumas', title='The Exumas', region='The Bahamas', lat=24.17, lon=-76.46, width=18000, length=22000, start=[24.184,-76.461], heading=130, biome='tropical', description='Follow the long limestone cays around Staniel Cay, where narrow cuts separate the turquoise Great Bahama Bank from Exuma Sound.', landmarks=[['Staniel Cay',24.171,-76.444],['Big Major Cay',24.185,-76.457],['Great Bahama Bank',24.165,-76.49]]),
    dict(id='dalmatian', title='Dalmatian Coast', region='Hvar · Croatia', lat=43.163, lon=16.385, width=22000, length=16000, start=[43.168,16.439], heading=0, biome='mediterranean', description='Sail the deeply indented Pakleni Islands beneath Hvar’s long limestone ridge, with pine-covered headlands and quiet Adriatic channels.', landmarks=[['Hvar',43.175,16.442],['Sveti Klement',43.158,16.363],['Šćedro',43.091,16.699]]),
    dict(id='santorini', title='Santorini', region='Cyclades · Greece', lat=36.411, lon=25.407, width=20000, length=20000, start=[36.459,25.366], heading=65, biome='volcanic', description='Sail inside a flooded volcanic caldera, enclosed by the crescent cliffs of Thira, Thirasia, and the dark lava islands of Kameni.', landmarks=[['Thira',36.421,25.431],['Thirasia',36.436,25.343],['Nea Kameni',36.401,25.396]]),
    dict(id='geiranger', title='Geirangerfjord', region='Norway', lat=62.12, lon=7.08, width=15000, length=19000, start=[62.106,7.193], heading=120, biome='fjord', description='Trace the winding glacial fjord beneath steep Norwegian mountain walls, from the Geiranger basin toward the Seven Sisters cliffs.', landmarks=[['Geiranger',62.101,7.206],['Seven Sisters',62.1071,7.0942],['Eagle Bend',62.127,7.163]]),
    dict(id='seychelles', title='Praslin & La Digue', region='Seychelles', lat=-4.335, lon=55.79, width=24000, length=17000, start=[-4.371,55.822], heading=75, biome='tropical', description='Cross the channel between mountainous Praslin and La Digue, with granite headlands, sheltered bays, and the island of Curieuse to the north.', landmarks=[['Praslin',-4.325,55.735],['La Digue',-4.36,55.839],['Curieuse',-4.283,55.728]]),
    dict(id='whitsundays', title='The Whitsundays', region='Queensland · Australia', lat=-20.24, lon=148.99, width=30000, length=32000, start=[-20.274,149.045], heading=275, biome='tropical', description='Explore drowned coastal ranges, the inlets of Whitsunday Island, and the sweeping low sands of Whitehaven beside the Solway Passage.', landmarks=[['Whitsunday Island',-20.255,149.005],['Whitehaven Beach',-20.28,149.039],['Hook Island',-20.13,148.925]]),
    dict(id='bora-bora', title='Bora Bora', region='French Polynesia', lat=-16.505, lon=-151.741, width=18000, length=18000, start=[-16.491,-151.722], heading=240, biome='tropical', description='Circle Mount Otemanu inside Bora Bora’s lagoon, between a rugged volcanic core and the low outer chain of coral motus.', landmarks=[['Mount Otemanu',-16.508,-151.733],['Teavanui Pass',-16.49,-151.786],['Motu Mute',-16.444,-151.753]]),
    dict(id='bay-of-islands', title='Bay of Islands', region='Northland · New Zealand', lat=-35.218, lon=174.167, width=22000, length=22000, start=[-35.259,174.115], heading=110, biome='temperate', description='Wander through a drowned river valley of branching bays, wooded peninsulas, and the sheltered island passages around Urupukapuka.', landmarks=[['Urupukapuka',-35.218,174.232],['Russell',-35.261,174.122],['Moturua',-35.228,174.19]]),
]

def pixels(lat, lon):
    n = 256 * 2**ZOOM
    return (lon+180)/360*n, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n

def fetch_tile(key):
    x, y = key
    path = CACHE / f'{ZOOM}-{x}-{y}.png'
    url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{ZOOM}/{x}/{y}.png'
    if not path.exists():
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=45) as response:
                    data = response.read()
                Image.open(io.BytesIO(data)).verify()
                path.write_bytes(data)
                break
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(attempt+1)
    rgb = np.asarray(Image.open(path).convert('RGB'), dtype=float)
    return key, rgb[:,:,0]*256 + rgb[:,:,1] + rgb[:,:,2]/256 - 32768

def build(place):
    width, length = place['width'], place['length']
    cell = max(width, length)/384
    cols, rows = round(width/cell)+1, round(length/cell)+1
    dx, dz = width/(cols-1), length/(rows-1)
    north = place['lat'] + length/2/111320
    south = place['lat'] - length/2/111320
    west = place['lon'] - width/2/(111320*math.cos(math.radians(place['lat'])))
    east = place['lon'] + width/2/(111320*math.cos(math.radians(place['lat'])))
    px = np.array([pixels(place['lat'], lon)[0] for lon in np.linspace(west,east,cols)])
    py = np.array([pixels(lat,place['lon'])[1] for lat in np.linspace(north,south,rows)])
    tx0, tx1 = int(px.min()//256), int(px.max()//256)
    ty0, ty1 = int(py.min()//256), int(py.max()//256)
    keys = [(x,y) for y in range(ty0,ty1+1) for x in range(tx0,tx1+1)]
    mosaic = np.zeros(((ty1-ty0+1)*256,(tx1-tx0+1)*256))
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for (x,y), tile in pool.map(fetch_tile,keys):
            mosaic[(y-ty0)*256:(y-ty0+1)*256,(x-tx0)*256:(x-tx0+1)*256] = tile
    gx,gy = np.meshgrid(px-tx0*256-.5,py-ty0*256-.5)
    dem = map_coordinates(mosaic,[gy,gx],order=1,mode='nearest')
    land,coast_ways = coastlines.coast_land_mask(place,[west,south,east,north],cols,rows,CACHE)
    distance = distance_transform_edt(~land, sampling=(dz,dx))
    # ETOPO1 is coarse offshore. Blend its depths with a coastal distance ramp;
    # zero/no-bathymetry pixels get a modeled 20 m shelf. This is not a chart.
    nominal_depth = {'fjord':250,'volcanic':180,'mediterranean':70,'temperate':45,'tropical':28}[place['biome']]
    if place['id']=='exumas': nominal_depth=9
    water_depth = np.minimum(distance*(.65 if place['biome']=='fjord' else .16), np.maximum(nominal_depth, -dem))
    heights = np.where(land,np.maximum(.8,dem),-water_depth)
    packed = np.round(np.clip(heights,-2000,3200)*10).astype('<i2')
    heights = packed.astype(float)/10
    contours=[]
    for line in find_contours(np.pad(heights,1,constant_values=-100), 0):
        line=approximate_polygon(line,tolerance=.35)-1
        if len(line)<4:
            continue
        contours.append([[round(-width/2+p[1]*dx,1),round(-length/2+p[0]*dz,1)] for p in line])
    shallows=[]
    for line in find_contours(heights,-3):
        line=approximate_polygon(line,tolerance=.4)
        if len(line)>=4: shallows.append([[round(-width/2+p[1]*dx,1),round(-length/2+p[0]*dz,1)] for p in line])
    # Snap the requested anchorage to the nearest cell with a full 100 m water
    # clearance, and verify a short unobstructed practice route near that start.
    sx=(place['start'][1]-place['lon'])*111320*math.cos(math.radians(place['lat']))
    sz=(place['lat']-place['start'][0])*111320
    xs,zs=np.meshgrid(np.linspace(-width/2,width/2,cols),np.linspace(-length/2,length/2,rows))
    safe=(heights < -8)&(distance>220)
    nearest=np.argmin(np.where(safe,(xs-sx)**2+(zs-sz)**2,np.inf))
    row,col=np.unravel_index(nearest,heights.shape)
    sx,sz=round(xs[row,col],1),round(zs[row,col],1)
    marks=[dict(x=round(sx+v,1),z=round(sz+w,1)) for v,w in [(65,0),(65,-65),(0,-65)]]
    landmarks=[dict(name=name,x=round((lon-place['lon'])*111320*math.cos(math.radians(place['lat'])),1),z=round((place['lat']-lat)*111320,1)) for name,lat,lon in place['landmarks']]
    result={k:v for k,v in place.items() if k not in ['width','length','start','heading','landmarks','lat','lon']}
    result.update(coordinates=dict(lat=place['lat'],lon=place['lon']), start=dict(x=sx,z=sz,heading=place['heading']), buoys=marks,
        conditions=dict(windDirection=(place['heading']+70)%360,windSpeed=10 if place['biome']=='fjord' else 12,currentDirection=90,currentSpeed=.2),
        maxDepth=2000,shoreDepthScale=30,chart=dict(centerX=0,centerZ=0,span=max(width,length)*1.08),marina=None,lighthouse=None,settlement=None,
        treeDensity=1400 if place['biome'] not in ['volcanic'] else 0,landmarks=landmarks,
        islands=[dict(x=0,z=0,rx=width/2,rz=length/2,height=round(float(heights.max()),1),name=place['title'],profile=place['biome'],raster=dict(cols=cols,rows=rows,width=width,length=length,encoding='delta-rle-v1',encoded=encode_grid(packed),coasts=contours,shallows=shallows))],
        terrainSource=dict(provider='Mapzen / AWS Terrain Tiles',zoom=ZOOM,cellMetres=round(max(dx,dz),1),bounds=[west,south,east,north],tiles=[f'{ZOOM}/{x}/{y}' for x,y in keys],sha256=hashlib.sha256(packed.tobytes()).hexdigest()))
    # Preserve Sandy Spit's very small coast as a separate vector island; the
    # regional 68 m grid cannot resolve a roughly half-acre cay.
    if place['id']=='virgin-islands':
        target=Point(-64.70888889,18.44972222)
        choices=[way for way in coast_ways if len(way)>3 and way[0]==way[-1] and Polygon(way).distance(target)<.0005 and Polygon(way).area<.000002]
        if not choices: raise RuntimeError('Sandy Spit coastline missing')
        way=min(choices,key=lambda way:Polygon(way).distance(target))
        coords=[[round((lon-place['lon'])*111320*math.cos(math.radians(place['lat'])),2),round((place['lat']-lat)*111320,2)] for lon,lat in way[:-1]]
        center=Polygon(coords).centroid;xs0=[p[0] for p in coords];zs0=[p[1] for p in coords]
        cay=dict(x=center.x,z=center.y,rx=(max(xs0)-min(xs0))/2,rz=(max(zs0)-min(zs0))/2,height=2.2,name='Sandy Spit',profile='cay',polygon=coords)
        result['islands'][0]['cutouts']=[dict(x=center.x,z=center.y,rx=cay['rx']+70,rz=cay['rz']+70)]
        result['islands'].append(cay)
    # Static shaded relief thumbnail generated from exactly the simulation DEM.
    gy,gx=np.gradient(np.maximum(heights,0),dz,dx)
    shade=np.clip((1-gx*.8-gy*.65)/np.sqrt(1+gx*gx+gy*gy),.3,1.3)
    palettes={'tropical':([79,117,74],[169,161,132]),'fjord':([82,112,92],[165,176,178]),'mediterranean':([119,135,85],[188,176,143]),'volcanic':([123,113,85],[168,148,119]),'temperate':([76,114,82],[159,162,133])}
    a,b=map(np.array,palettes[place['biome']])
    mix=np.clip(np.maximum(heights,0)/max(100,dem.max()),0,1)[...,None]
    rgb=(a*(1-mix)+b*mix)*shade[...,None]
    sea_mix=np.clip(water_depth/70,0,1)[...,None]
    sea=np.array([56,179,175])*(1-sea_mix)+np.array([16,64,85])*sea_mix
    rgb=np.where(land[...,None],rgb,sea)
    image=Image.fromarray(np.clip(rgb,0,255).astype('uint8')).resize((900,round(900*length/width)),Image.Resampling.LANCZOS)
    image.save(ROOT/'public/destination-previews'/f"{place['id']}.webp",quality=88)
    (ROOT/'src/world/data'/f"{place['id']}-coastline.json").write_text(json.dumps(dict(source='© OpenStreetMap contributors, ODbL 1.0',ways=coast_ways),separators=(',',':'))+'\n')
    print(f"{place['id']}: {cols}×{rows}, {len(keys)} tiles, {land.mean():.0%} land, peak {heights.max():.0f} m, start depth {-heights[row,col]:.1f} m",flush=True)
    return result

if __name__=='__main__':
    (ROOT/'src/world/data').mkdir(parents=True,exist_ok=True)
    destinations=[build(place) for place in CATALOG]
    (ROOT/'src/world/data/destinations.json').write_text(json.dumps(destinations,separators=(',',':'))+'\n')
    (ROOT/'src/world/data/terrain-manifest.json').write_text(json.dumps({p['id']:p['terrainSource'] for p in destinations},indent=2)+'\n')
