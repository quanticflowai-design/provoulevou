# New Icon Serif Condensed com minúsculas

A fonte original (`New Icon Serif Condensed`) só tem desenho de maiúsculas: as teclas minúsculas usam o mesmo
glifo das maiúsculas. `gera.py` cria minúsculas no estilo versalete (small caps) a partir das próprias maiúsculas,
reduzidas para 73% da altura e 80% da largura (o traço fica proporcional), com um pouco mais de espaçamento,
incluindo as acentuadas (ç, ã, é, ô...). Saída: `assets/fonts/new-icon-serif-pl.ttf`.

```bash
pip install fonttools
python3 gera.py New-Icon-Serif-condensed.otf ../../assets/fonts/new-icon-serif-pl.ttf
```
