"""Download reading notes and reference photographs for visual research only.
Photographs remain in /tmp; they are not redistributed as application assets.
"""
from pathlib import Path
import json
import urllib.request
import concurrent.futures
import sys

DESTINATIONS={
 'virgin-islands':['Jost_Van_Dyke','Sandy_Spit'],
 'grenadines':['Tobago_Cays','Mayreau'],
 'exumas':['Exuma','Staniel_Cay'],
 'dalmatian':['Hvar_(city)','Paklinski_Islands'],
 'santorini':['Santorini','Oia,_Greece'],
 'geiranger':['Geirangerfjord','Geiranger'],
 'seychelles':['La_Digue','Praslin'],
 'whitsundays':['Whitsunday_Islands','Whitehaven_Beach'],
 'bora-bora':['Bora_Bora','Vaitape'],
 'bay-of-islands':['Bay_of_Islands','Russell,_New_Zealand'],
 'details':['Sandy_Spit','Swimming_pigs','Anse_Source_d%27Argent','Overwater_bungalow','Seven_Sisters_Waterfall_(Norway)'],
}
OUT=Path('/tmp/sail-destination-research');OUT.mkdir(exist_ok=True)
def get(url):
 req=urllib.request.Request(url,headers={'User-Agent':'SailSimulatorReferenceResearch/1.0'})
 with urllib.request.urlopen(req,timeout=40) as response:return response.read()
def read(item):
 id,titles=item;notes=[]
 for index,title in enumerate(titles):
  try:
   data=json.loads(get('https://en.wikipedia.org/api/rest_v1/page/summary/'+title))
   photo=data.get('thumbnail',{}).get('source') or data.get('originalimage',{}).get('source')
   if photo:
    # Wikimedia's lead thumbnail provides a reliable actual-location reference.
    (OUT/f'{id}-{index}.jpg').write_bytes(get(photo))
   notes.append(dict(title=data.get('title'),url=data.get('content_urls',{}).get('desktop',{}).get('page'),extract=data.get('extract'),coordinates=data.get('coordinates'),image=photo))
  except Exception as e:notes.append(dict(title=title,error=str(e)))
 (OUT/f'{id}.json').write_text(json.dumps(notes,indent=2))
 print(id, json.dumps(notes),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(read,[(key,value) for key,value in DESTINATIONS.items() if not sys.argv[1:] or key in sys.argv[1:]]))
