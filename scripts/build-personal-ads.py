"""Manifesti tipografici: un aggancio, una frase breve, una sola azione.
Composizioni per banner/rettangoli/verticali; Jakarta SIL OFL in tracciati.
I limiti reali dei glifi e le sovrapposizioni sono verificati al build.
"""
from pathlib import Path
import html, json, re, subprocess, os
from functools import lru_cache
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./lib/personal-ads.cjs')))"], cwd=ROOT, text=True, encoding='utf8'))
fonts = {weight: TTFont(ROOT / f'css/fonts/jakarta-{weight}.woff') for weight in (600, 700, 800)}
audit = []


@lru_cache(maxsize=None)
def photo_data(goal):
    # Existing original AI illustrations from the site's blog, reused as scene
    # setting. They do not document earnings or a particular available pitch.
    name = 'fiere-lombardia-domande-aperte' if goal == 'fiere' else 'aprire-banco-giovani-mercato'
    # JPEG data is supported by browsers and the librsvg PNG renderer alike.
    script = "require('sharp')(process.argv[1]).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toBuffer().then(b=>process.stdout.write(b.toString('base64')))"
    return subprocess.check_output(['node', '-e', script, str(ROOT / f'images/blog/{name}.webp')], cwd=ROOT, text=True, encoding='ascii')


@lru_cache(maxsize=None)
def vertical_metrics(text, weight):
    font = fonts[weight]
    glyphs, cmap, boxes = font.getGlyphSet(), font.getBestCmap(), []
    for char in text:
        pen = BoundsPen(glyphs)
        glyphs[cmap.get(ord(char), '.notdef')].draw(pen)
        if pen.bounds:
            boxes.append(pen.bounds)
    units = font['head'].unitsPerEm
    return max(b[3] for b in boxes) / units, -min(b[1] for b in boxes) / units


def width(text, size, weight=800, tracking=-.035):
    font = fonts[weight]
    metrics, cmap = font['hmtx'].metrics, font.getBestCmap()
    return (sum(metrics[cmap.get(ord(c), '.notdef')][0] for c in text) / font['head'].unitsPerEm + max(0, len(text) - 1) * tracking) * size


def wrap(text, size, limit, weight=800, tracking=-.035):
    words = re.findall(r'[\d.]+\s*€|AL GIORNO!!!|IN 2 GIORNI!!!|[^\s]+', text)
    lines = ['']
    for word in words:
        trial = (lines[-1] + ' ' + word).strip()
        if lines[-1] and width(trial, size, weight, tracking) > limit:
            lines.append(word)
        else:
            lines[-1] = trial
    return lines


def fit(text, box, max_size, max_lines, weight=800, tracking=-.035):
    _, _, boxw, boxh = box
    lo, hi = 1., max_size
    for _ in range(30):
        size = (lo + hi) / 2
        lines = wrap(text, size, boxw, weight, tracking)
        height = size * (sum(sum(vertical_metrics(line, weight)) for line in lines) + .14 * (len(lines) - 1))
        if len(lines) <= max_lines and height <= boxh and max(width(line, size, weight, tracking) for line in lines) <= boxw:
            lo = size
        else:
            hi = size
    return lo, wrap(text, lo, boxw, weight, tracking)


def text_paths(text, x, y, size, color, weight=800, tracking=-.035, letter_start=None):
    font = fonts[weight]
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale, result, bounds = size / font['head'].unitsPerEm, [], []
    for index, char in enumerate(text):
        name = cmap.get(ord(char), '.notdef')
        if name == '.notdef':
            raise ValueError(f'Glifo mancante: {char!r}')
        pen, bp = SVGPathPen(glyphs), BoundsPen(glyphs)
        glyphs[name].draw(pen)
        glyphs[name].draw(bp)
        if pen.getCommands():
            marker = f' class="pa-letter pa-letter-{letter_start + index}"' if letter_start is not None else ''
            result.append(f'<path{marker} d="{pen.getCommands()}" transform="translate({x:.4f} {y:.4f}) scale({scale:.8f} {-scale:.8f})"/>')
        if bp.bounds:
            x0, y0, x1, y1 = bp.bounds
            bounds.append((x + x0 * scale, y - y1 * scale, x + x1 * scale, y - y0 * scale))
        x += font['hmtx'].metrics[name][0] * scale + size * tracking
    bbox = (min(b[0] for b in bounds), min(b[1] for b in bounds), max(b[2] for b in bounds), max(b[3] for b in bounds))
    return f'<g fill="{color}">' + ''.join(result) + '</g>', bbox


def render(ad, fmt):
    w, h = fmt['width'], fmt['height']
    tiny, wide, tall = h <= 100, w / h > 2.5, h / w > 1.5
    p = 14 if tiny else (18 if w < 400 else (30 if wide else 64))
    bg, ink, button, buttonink = '#123b7a', '#ffffff', '#ffffff', '#102238'
    if ad['goal'] == 'compra':
        bg, button = '#102238', '#ffcc32'
    elif ad['goal'] == 'fiere':
        button = '#ffcc32'
        if ad['id'] in ('fiere-02', 'fiere-04', 'fiere-06'):
            bg, ink, button, buttonink = '#ffcc32', '#102238', '#102238', '#ffffff'
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{html.escape(ad["title"])}</title><desc id="desc">{html.escape(ad["description"] + " " + ad["cta"] + ". Subingresso.it")}</desc><rect width="{w}" height="{h}" fill="{bg}"/>']
    regions = []
    letter_count = 0

    def line(text, x, baseline, size, color=ink, weight=800, tracking=-.035, role='headline'):
        nonlocal letter_count
        markup, bounds = text_paths(text, x, baseline, size, color, weight, tracking, letter_count if role == 'headline' else None)
        if role == 'headline':
            letter_count += len(text)
        out.append(markup)
        assert bounds[0] >= p - .5 and bounds[1] >= 0 and bounds[2] <= w - p + .5 and bounds[3] <= h, (ad['id'], fmt['id'], text, bounds)
        regions.append({'role': role, 'text': text, 'size': round(size, 2), 'bounds': bounds})

    def block(text, box, max_size, max_lines, weight=800, tracking=-.035, role='headline', color=ink):
        size, lines = fit(text, box, max_size, max_lines, weight, tracking)
        x, y, _, _ = box
        for textline in lines:
            ascent, descent = vertical_metrics(textline, weight)
            line(textline, x, y + size * ascent, size, color=color, weight=weight, tracking=tracking, role=role)
            y += size * (ascent + descent + .14)
        return y - size * .14

    brand = 11 if tiny else (13 if w < 400 else (18 if wide else 30))
    line('Subingresso.it', p, p + brand * .78, brand, weight=700, tracking=-.02, role='brand')
    if tiny:
        if w > 500:
            bx, by, bw, bh = w - p - 174, p, 174, h - 2 * p
            bottom = block(ad['shortTitle'].upper(), (p, 34, bx - p - 22, 27), 31, 1)
            block(ad['description'], (p, bottom + 6, bx - p - 22, 15), 13, 1, 600, -.01, 'support')
        else:
            bx, by, bw, bh = p, h - 27, w - 2 * p, 20
            bottom = block(ad['shortTitle'].upper(), (p, 30, w - 2 * p, 30), 23, 2)
            block(ad['description'], (p, bottom + 5, w - 2 * p, 13), 11, 1, 600, -.01, 'support')
    elif wide:
        bx, by, bw, bh = w - p - 224, 90, 224, 70
        bottom = block(ad['title'].upper(), (p, 63, bx - p - 30, 128), 66, 2)
        block(ad['description'], (p, bottom + 13, bx - p - 24, 25), 19, 1, 600, -.01, 'support')
    else:
        bw, bh = w - 2 * p, (48 if w < 400 else 116)
        bx, by = p, h - p - bh
        illustrated = tall or w >= 1000
        body_size = (17 if tall else 15) if w < 400 else 46
        bodyh = body_size * 2
        titley = p + brand + (28 if tall and w < 400 else (15 if w < 400 else 70))
        gap = 12 if w < 400 else 32
        titleh = min(h * .43, w * 1.05) if illustrated else by - titley - bodyh - gap - 12
        max_size = (76 if tall else 57) if w < 400 else 240
        if ad['title'].startswith('5.000 €'):
            numeric_h = min(titleh * .62, bw * .29)
            bottom = block('5.000 €', (p, titley, bw, numeric_h), bw * .31, 1)
            qualifier = ad['title'][len('5.000 €'):].strip().upper()
            # A qualifier is one phrase: never isolate AL or IN 2 on a line.
            bottom = block(qualifier, (p, bottom + 8 if w < 400 else bottom + 24, bw, bw * .13), bw * .13, 1)
        else:
            bottom = block(ad['title'].upper(), (p, titley, bw, titleh), max_size, 5 if tall else 3)
        bottom = block(ad['description'], (p, bottom + gap, bw, bodyh), body_size, 2, 600, -.01, 'support')
        if illustrated:
            photo_y = bottom + (24 if w < 400 else 56)
            photo_h = h - photo_y
            source = photo_data(ad['goal'])
            out.append(f'<svg x="0" y="{photo_y}" width="{w}" height="{photo_h}" overflow="hidden"><image width="{w}" height="{photo_h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,{source}"/></svg>')
    out.append('<g class="pa-action">')
    if tiny and w <= 500:
        line(ad['cta'] + ' →', bx, by + 15, 13, weight=700, tracking=-.02, role='cta')
    else:
        out.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="{4 if tiny else 6}" fill="{button}"/>')
        bsize = min(23 if wide else (17 if w < 400 else 39), bh * .36)
        while width(ad['cta'], bsize, 800, -.02) > bw - (42 if w < 400 or wide else 100):
            bsize -= .25
        line(ad['cta'], bx + 16 if w < 400 or wide else bx + 36, by + bh / 2 + bsize * .35, bsize, buttonink, tracking=-.02, role='cta')
        ax, ay, ar = bx + bw - (20 if w < 400 or wide else 44), by + bh / 2, (5 if w < 400 or wide else 12)
        out.append(f'<path d="M{ax-ar*1.6} {ay}h{ar*2}m{-ar} {-ar} {ar} {ar} {-ar} {ar}" fill="none" stroke="{buttonink}" stroke-width="{2 if w < 400 or wide else 4}" stroke-linecap="round" stroke-linejoin="round"/>')
    out.append('</g>')
    for i, a in enumerate(regions):
        for b in regions[i + 1:]:
            x0, y0, x1, y1 = a['bounds']
            u0, v0, u1, v1 = b['bounds']
            assert not (x0 < u1 and x1 > u0 and y0 < v1 and y1 > v0), (ad['id'], fmt['id'], a, b)
    headline = [r for r in regions if r['role'] == 'headline']
    support = [r for r in regions if r['role'] == 'support']
    assert support, (ad['id'], fmt['id'], 'Contesto mancante')
    gap = min(r['bounds'][1] for r in support) - max(r['bounds'][3] for r in headline)
    assert 0 <= gap <= 34, (ad['id'], fmt['id'], 'Contesto lontano dal titolo', gap)
    if ad['title'].startswith('5.000 €'):
        qualifier = ad['title'].split('€', 1)[1].strip().upper()
        assert any(qualifier in r['text'] for r in headline), (ad['id'], fmt['id'], 'Frase numerica spezzata')
    audit.append({'id': ad['id'], 'format': fmt['id'], 'width': w, 'height': h, 'letters': letter_count, 'regions': regions})
    out.append('</svg>')
    return ''.join(out)


def animate_svg(svg, letters):
    """Readable finished frame; three 6.4s cycles in the standalone export.
    The viewport player opts into repeat only while visible, with pause controls.
    """
    css = ['@media(prefers-reduced-motion:no-preference){',
           '.pa-letter{animation-duration:6.4s;animation-timing-function:step-end;animation-fill-mode:both;animation-iteration-count:3}',
           '.pa-action{transform-box:fill-box;transform-origin:center;animation:pa-action 6.4s cubic-bezier(.22,1,.36,1) 3 both}',
           '.pa-repeat .pa-letter,.pa-repeat .pa-action{animation-iteration-count:infinite}',
           '@keyframes pa-action{0%,27%,46%,100%{transform:scale(1)}32%,41%{transform:scale(1.022)}}']
    for index in range(letters):
        at = 2 + 23 * (index + 1) / max(letters, 1)
        css.append(f'.pa-letter-{index}{{animation-name:pa-type-{index}}}@keyframes pa-type-{index}{{0%,{at - .02:.3f}%{{opacity:0}}{at:.3f}%,100%{{opacity:1}}}}')
    css.append('}')
    return svg.replace('</desc>', '</desc><style>' + ''.join(css) + '</style>', 1)


if __name__ == '__main__':
    folder = ROOT / 'images/personal-ads'
    folder.mkdir(parents=True, exist_ok=True)
    for ad in catalog['ads']:
        for fmt in catalog['formats']:
            svg = render(ad, fmt)
            (folder / f'{ad["id"]}-{fmt["id"]}.svg').write_text(svg, encoding='utf8')
            (folder / f'{ad["id"]}-{fmt["id"]}.animated.svg').write_text(animate_svg(svg, audit[-1]['letters']), encoding='utf8')
    if os.environ.get('PERSONAL_ADS_BUILD_AUDIT'):
        Path(os.environ['PERSONAL_ADS_BUILD_AUDIT']).write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf8')
    print(f'{len(audit)} SVG verificati: glifi nei box, nessun testo sovrapposto.')
