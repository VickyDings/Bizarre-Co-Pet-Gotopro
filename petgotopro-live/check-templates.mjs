// A backtick inside these CSS template literals silently truncates the stylesheet.
// The symptom is media queries going missing, so columns stop collapsing on
// phones. It has happened three times.
//
// RUN THIS ON THE OWNER'S MACHINE, from petgotopro-website. The src/ files are
// no longer in this repo -- they went stale and were deleted in Oct 2026.
import fs from 'fs';
let bad = 0;
for (const [file, names] of [['src/admin.js',['ADMIN_CSS','SECTION_DIALOG_HTML','LINK_DIALOG_HTML','UNDO_JS','SECTION_JS','MOVE_JS']],
                             ['src/theme.js',['IMAGE_CSS','SECTION_CSS','PUBLIC_CSS']]]) {
  let src;
  try {
    src = fs.readFileSync(file,'utf8');
  } catch {
    console.error(`cannot read ${file} -- run this from the project root on the`
      + ` owner's machine (petgotopro-website), not from this repo.`);
    process.exit(2);
  }
  for (const n of names) {
    const i = src.indexOf(n + ' =');
    if (i < 0) { console.log('  MISSING', n, 'in', file); bad++; continue; }
    const b = src.indexOf('`', i);
    let j = b + 1, len = 0;
    while (j < src.length) { if (src[j] === '\\') { j += 2; len += 2; continue; } if (src[j] === '`') break; j++; len++; }
    // the literal must end at a `; or `+ — anything else means it closed early
    const tail = src.slice(j, j + 3).replace(/\s/g,'');
    const ok = tail.startsWith('`;') || tail.startsWith('`+');
    console.log(`  ${ok ? 'OK  ' : 'BAD '} ${file} ${n.padEnd(20)} ${String(len).padStart(6)} chars`);
    if (!ok) bad++;
  }
}
console.log(bad ? `\n${bad} PROBLEM(S)` : '\nall template literals close cleanly');
process.exit(bad ? 1 : 0);
