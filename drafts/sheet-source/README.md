# Care sheet generator

Builds the printable PNGs for the indoor cat guide, in the house layout taken
from `leopard-gecko-care-sheet.png` — dark header band, two-column card grid,
dark rules panel, green strip, footer with logo and QR.

Those older sheets are in the **pre-rebrand brown/amber palette**. These are in
the current plum/magenta, so they will not match the rest of `/free-guides`
until the others are regenerated. The template is data-driven, so re-running an
old sheet's content through it is the cheap way to do that.

```
cp ../../petgotopro-live/logo-360.png ../../petgotopro-live/qr-branded.png .
python3 -I tpl.py care.json  care.html  && node shot.mjs "$PWD/care.html"  "$PWD/indoor-cat-care-sheet.png"
python3 -I tpl.py check.json check.html && node shot.mjs "$PWD/check.html" "$PWD/indoor-cat-setup-checklist.png"
```

Needs `playwright` and Chromium. 1500px wide, height follows content.

`care.json` uses `rows` (label/value with dotted leaders) and `list` (bulleted).
`check.json` uses `checks`, which draws an empty box to tick with a pen, and
takes either a string or `[line, sub-line]`.
