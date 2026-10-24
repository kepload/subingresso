"""Creatività tipografiche originali: testo in tracciati, identico in SVG e PNG.
Usa gli stessi font SIL OFL già presenti sul sito. Nessuna immagine generata.
"""
from pathlib import Path
import json, subprocess, html
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./lib/personal-ads.cjs')))"],cwd=ROOT,text=True,encoding='utf8'))
fonts={weight:TTFont(ROOT/f'css/fonts/jakarta-{weight}.woff') for weight in (400,600,700,800)}
def width(text,size,weight=800):
    font=fonts[weight]; cmap=font.getBestCmap(); metrics=font['hmtx'].metrics
    return sum(metrics[cmap.get(ord(c),'.notdef')][0] for c in text)*size/font['head'].unitsPerEm
def wrap(text,size,limit,weight=800):
    lines=['']
    for word in text.split():
        trial=(lines[-1]+' '+word).strip()
        if lines[-1] and width(trial,size,weight)>limit: lines.append(word)
        else: lines[-1]=trial
    return lines
def text_paths(text,x,y,size,color,weight=800):
    font=fonts[weight]; glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); scale=size/font['head'].unitsPerEm; result=[]
    for char in text:
        name=cmap.get(ord(char),'.notdef'); pen=SVGPathPen(glyphs); glyphs[name].draw(pen)
        if pen.getCommands():result.append(f'<path d="{pen.getCommands()}" transform="translate({x:.3f} {y:.3f}) scale({scale:.6f} {-scale:.6f})"/>')
        x+=font['hmtx'].metrics[name][0]*scale
    return f'<g fill="{color}">'+''.join(result)+'</g>'
def render(ad,fmt):
    w,h=fmt['width'],fmt['height']; wide=w/h>2.5; tiny=h<=100
    # Vendita: blu; acquisto: inchiostro; fiere: blu/oro del blog.
    bg='#123b7a' if ad['goal'] in ('vendi','fiere') else '#102238'; ink='#ffffff'; muted='#dbeafe'
    accent='#fbbf24' if ad['goal']=='fiere' else '#ffffff'; buttonink='#102238'
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{html.escape(ad["title"])}</title><desc id="desc">{html.escape(ad["description"]+" "+ad["cta"]+". Subingresso.it")}</desc><rect width="{w}" height="{h}" fill="{bg}"/>']
    p=18 if w<400 else (30 if wide else w*.075)
    brand=12 if tiny else max(12,min(28,w*.04)); mark='Subingresso.it'
    if tiny:
        title=ad['shortTitle']; limit=w-(150 if w>500 else 20)-2*p; size=23 if w>500 else 19
        lines=wrap(title,size,limit)
        while len(lines)>2: size-=1; lines=wrap(title,size,limit)
        out.append(text_paths(mark,p,20,10,muted,700))
        for i,line in enumerate(lines):out.append(text_paths(line,p,45+i*size*1.12,size,ink))
        if w>500:
            bx=w-169; by=24; bw=150; bh=42; bsize=12
        else:
            out.append(text_paths(ad['cta']+' →',p,h-9,11,accent,700)); bx=None
    else:
        out.append(text_paths(mark,p,p+brand,brand,muted,700))
        if wide:
            limit=w*.64-2*p; size=38; maxlines=2; top=94; bodytop=0
        else:
            limit=w-2*p; size=26 if w<400 else w*.074; maxlines=3 if h/w<1.1 else 5
            top=(p+brand+26) if h<320 else h*.30; bodytop=0
        lines=wrap(ad['title'],size,limit)
        while len(lines)>maxlines: size-=.5; lines=wrap(ad['title'],size,limit)
        for i,line in enumerate(lines):out.append(text_paths(line,p,top+i*size*1.12,size,ink))
        body_size=12 if w<400 else (16 if wide else w*.027)
        body=wrap(ad['description'],body_size,limit,400)
        bodytop=top+(len(lines)-1)*size*1.12+body_size+13
        if h>=500 and w<400:bodytop+=18;body_size=15;body=wrap(ad['description'],body_size,limit,400)
        bx=w*.71 if wide else p; bw=w*.25 if wide else w-2*p; bh=48 if w<400 or wide else w*.105; by=(h-bh)/2 if wide else h-p-bh
        # Footer leaves a clear gap after the last body line, including the smallest rectangle.
        max_body_bottom=by-15 if not wide else h-p
        while bodytop+(len(body)-1)*body_size*1.45>max_body_bottom and body_size>10:
            body_size-=.5;body=wrap(ad['description'],body_size,limit,400)
        for i,line in enumerate(body):out.append(text_paths(line,p,bodytop+i*body_size*1.45,body_size,muted,400))
        bsize=12 if w<400 else (15 if wide else w*.031)
    if bx is not None:
        while width(ad['cta'],bsize,700)>bw-22:bsize-=.5
        out.append(f'<rect x="{bx:.2f}" y="{by:.2f}" width="{bw:.2f}" height="{bh:.2f}" rx="6" fill="{accent}"/>')
        out.append(text_paths(ad['cta'],bx+(bw-width(ad['cta'],bsize,700))/2,by+bh/2+bsize*.35,bsize,buttonink,700))
    out.append('</svg>');return ''.join(out)
folder=ROOT/'images/personal-ads';folder.mkdir(parents=True,exist_ok=True)
for ad in catalog['ads']:
    for fmt in catalog['formats']:(folder/f'{ad["id"]}-{fmt["id"]}.svg').write_text(render(ad,fmt),encoding='utf8')
print(f'{len(catalog["ads"])*len(catalog["formats"])} SVG, font Jakarta convertiti in tracciati.')
