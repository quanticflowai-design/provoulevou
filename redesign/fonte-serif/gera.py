"""Gera minusculas (versalete) para a New Icon Serif Condensed, que so tem maiusculas.
Uso: python3 gera.py entrada.otf saida.ttf"""
import sys
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.fontBuilder import FontBuilder

src, dst = sys.argv[1], sys.argv[2]
SX, SY, TRACK = 0.80, 0.73, 18     # largura, altura e respiro extra das minusculas

f = TTFont(src)
order = f.getGlyphOrder()
gs = f.getGlyphSet()
cmap = dict(f.getBestCmap())
hmtx = f['hmtx'].metrics

def desenha(nome, sx=1.0, sy=1.0, dx=0):
    pen = TTGlyphPen(None)
    alvo = Cu2QuPen(pen, max_err=1.0, reverse_direction=True)
    gs[nome].draw(TransformPen(alvo, (sx, 0, 0, sy, dx, 0)) if (sx, sy, dx) != (1, 1, 0) else alvo)
    return pen.glyph()

glyphs, metrics = {}, {}
for n in order:
    glyphs[n] = desenha(n)
    metrics[n] = hmtx[n]

novos = {}
for cp, nome_atual in list(cmap.items()):
    ch = chr(cp)
    if not ch.islower() or len(ch.upper()) != 1:
        continue
    up = cmap.get(ord(ch.upper()))
    if not up:
        continue
    novo = up + '.sc'
    if novo not in glyphs:
        adv, lsb = hmtx[up]
        glyphs[novo] = desenha(up, SX, SY, TRACK / 2)
        metrics[novo] = (round(adv * SX) + TRACK, round(lsb * SX + TRACK / 2))
        order.append(novo)
    novos[cp] = novo
cmap.update(novos)

# ajusta lsb real a partir do contorno
gset = None
fb = FontBuilder(1000, isTTF=True)
fb.setupGlyphOrder(order)
fb.setupCharacterMap(cmap)
fb.setupGlyf(glyphs)
glyf = fb.font['glyf']
for n in order:
    g = glyf[n]
    g.recalcBounds(glyf)
    metrics[n] = (metrics[n][0], getattr(g, 'xMin', 0) or 0)
fb.setupHorizontalMetrics(metrics)
hh = f['hhea']
fb.setupHorizontalHeader(ascent=hh.ascent, descent=hh.descent)
fb.setupNameTable({'familyName': 'New Icon Serif Cond PL', 'styleName': 'Regular',
                   'uniqueFontIdentifier': 'NewIconSerifCondPL-Regular', 'fullName': 'New Icon Serif Cond PL',
                   'psName': 'NewIconSerifCondPL-Regular', 'version': 'Version 1.000; minusculas versalete geradas'})
o = f['OS/2']
fb.setupOS2(sTypoAscender=o.sTypoAscender, sTypoDescender=o.sTypoDescender, sTypoLineGap=o.sTypoLineGap,
            usWinAscent=o.usWinAscent, usWinDescent=o.usWinDescent, sxHeight=round(800 * SY), sCapHeight=o.sCapHeight,
            fsType=o.fsType, usWeightClass=o.usWeightClass)
fb.setupPost()
for t in ('GDEF', 'GPOS'):
    if t in f:
        fb.font[t] = f[t]
fb.save(dst)
print('minusculas novas:', len(novos), 'glifos:', len(order))
