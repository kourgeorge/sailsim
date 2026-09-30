"""Archive public eSail sitemap pages, their text, and referenced images.

Uses only the Python standard library and curl. Re-running resumes downloads.
External tracking pixels, videos, and non-sitemap translated mirrors are excluded.
"""
import concurrent.futures
import hashlib
import json
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'reference' / 'esail'
BASE = 'https://www.esailyachtsimulator.com/'
EXT = re.compile(r'\.(?:png|jpe?g|webp|gif|svg|avif|ico)(?:[?#].*)?$', re.I)

def fetch(url, path):
    if path.exists() and path.stat().st_size:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + '.part')
    subprocess.run(['curl', '-fLsS', '--retry', '2', '--max-time', '45', '-A',
                    'SailResearchArchive/1.0', url, '-o', str(tmp)], check=True, capture_output=True)
    tmp.replace(path)

class Page(HTMLParser):
    def __init__(self, url):
        super().__init__(); self.url=url; self.skip=0; self.text=[]; self.images={}; self.styles=[]; self.title=''; self.in_title=False
    def add_image(self, url, alt=''):
        url=urljoin(self.url, url.strip())
        if urlparse(url).hostname == urlparse(BASE).hostname and EXT.search(url):
            self.images[url]=alt
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ('script', 'style'): self.skip += 1
        if tag=='title': self.in_title=True
        if tag in ('img', 'source'):
            for key in ('src', 'data-src', 'data-lazy-src'):
                if a.get(key): self.add_image(a[key], a.get('alt',''))
            for key in ('srcset', 'data-srcset', 'data-lazy-srcset'):
                for item in a.get(key,'').split(','):
                    if item.strip(): self.add_image(item.strip().split()[0], a.get('alt',''))
        if tag=='a' and a.get('href'): self.add_image(a['href'])
        if a.get('poster'): self.add_image(a['poster'])
        if tag=='meta' and a.get('property') in ('og:image','twitter:image'): self.add_image(a.get('content',''))
        if tag=='link' and a.get('rel')=='stylesheet': self.styles.append(urljoin(self.url,a.get('href','')))
        for url in re.findall(r'url\([\s\'\"]*([^\)\'\"]+)', a.get('style','')): self.add_image(url)
    def handle_endtag(self, tag):
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
        if tag=='title': self.in_title=False
    def handle_data(self, value):
        if self.in_title: self.title+=value
        if not self.skip and value.strip(): self.text.append(re.sub(r'\s+',' ',value.strip()))

def sitemap(url):
    path=OUT/'sitemaps'/Path(urlparse(url).path).name
    fetch(url,path)
    tree=ET.fromstring(path.read_bytes())
    urls=[el.text for el in tree.iter() if el.tag.endswith('}loc')]
    if tree.tag.endswith('sitemapindex'):
        return [page for child in urls for page in sitemap(child)]
    return urls

def page_job(url):
    slug=urlparse(url).path.strip('/').replace('/','__') or 'home'
    folder=OUT/'pages'/slug
    fetch(url,folder/'source.html')
    parser=Page(url); parser.feed((folder/'source.html').read_text(errors='replace'))
    text='\n\n'.join(parser.text)
    (folder/'text.txt').write_text(text)
    # Include image references in inline CSS and structured content.
    raw=(folder/'source.html').read_text(errors='replace').replace('\\/','/')
    for image in re.findall(r'https?://[^\s<>"\'()]+?\.(?:png|jpe?g|gif|webp|svg|avif)(?:\?[^\s<>"\'()]*)?',raw,re.I): parser.add_image(image)
    return {'url':url,'title':parser.title,'text_file':str((folder/'text.txt').relative_to(OUT)),
            'html_file':str((folder/'source.html').relative_to(OUT)), 'characters':len(text),
            'images':[{'url':u,'alt':a} for u,a in parser.images.items()], 'stylesheets':parser.styles}

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    fetch(BASE+'robots.txt',OUT/'robots.txt')
    urls=sorted(set(sitemap(BASE+'wp-sitemap.xml')+[BASE+'the-world-of-esail/learn-to-sail/']))
    pages=[]; errors=[]; assets={}; styles=set()
    print(f'Collecting {len(urls)} public sitemap pages',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(page_job,url):url for url in urls}
        for job in concurrent.futures.as_completed(jobs):
            url=jobs[job]
            try:
                page=job.result(); pages.append(page); styles.update(page['stylesheets'])
                for item in page['images']:
                    asset=assets.setdefault(item['url'],{'url':item['url'],'alt':item['alt'],'pages':[]})
                    asset['pages'].append(url)
                print(f'Pages {len(pages)}/{len(urls)}: {page["title"][:65]}',flush=True)
            except Exception as e: errors.append({'url':url,'error':str(e)})
    for url in sorted(styles):
        if urlparse(url).hostname!=urlparse(BASE).hostname: continue
        try:
            path=OUT/'styles'/f'{hashlib.sha256(url.encode()).hexdigest()[:12]}.css'; fetch(url,path)
            css=path.read_text(errors='replace')
            for match in re.findall(r'url\([\s\'\"]*([^\)\'\"]+)',css):
                image=urljoin(url,match.strip())
                if EXT.search(image) and urlparse(image).hostname==urlparse(BASE).hostname:
                    assets.setdefault(image,{'url':image,'alt':'CSS image','pages':[]})
        except Exception as e: errors.append({'url':url,'error':str(e)})
    def asset_job(item):
        url=item['url']; name=unquote(Path(urlparse(url).path).name)
        name=re.sub(r'[^a-zA-Z0-9._-]','_',name)
        path=OUT/'images'/f'{hashlib.sha256(url.encode()).hexdigest()[:10]}-{name}'
        fetch(url,path); item['file']=str(path.relative_to(OUT)); item['bytes']=path.stat().st_size
        return item
    images=[]
    print(f'Downloading {len(assets)} images',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        jobs={pool.submit(asset_job,item):item['url'] for item in assets.values()}
        for job in concurrent.futures.as_completed(jobs):
            try: images.append(job.result())
            except Exception as e: errors.append({'url':jobs[job],'error':str(e)})
            if (len(images)+len(errors))%40==0: print(f'Images saved: {len(images)}',flush=True)
    manifest={'source':BASE,'retrieved_at':datetime.now(timezone.utc).isoformat(),
      'scope':'Public URLs listed in the WordPress sitemap, supplied learn-to-sail URL, and same-host image references including responsive variants and CSS. Excludes videos, third-party embeds/tracking, and translated mirrors absent from the sitemap.',
      'discovered_pages':len(urls),'pages':sorted(pages,key=lambda p:p['url']), 'images':sorted(images,key=lambda i:i['url']),'errors':errors}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    (OUT/'all-text.md').write_text('\n\n---\n\n'.join(f'# {p["title"]}\n\nSource: {p["url"]}\n\n'+(OUT/p['text_file']).read_text() for p in manifest['pages']))
    summary={'pages':len(pages),'images':len(images),'imageBytes':sum(i['bytes'] for i in images),'errors':len(errors),'retrievedAt':manifest['retrieved_at']}
    (ROOT/'public').mkdir(exist_ok=True)
    (ROOT/'public'/'reference-summary.json').write_text(json.dumps(summary,indent=2))
    print(json.dumps(summary,indent=2),flush=True)

if __name__=='__main__': main()
