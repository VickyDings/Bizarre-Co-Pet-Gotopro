// A backtick inside these CSS template literals silently truncates the stylesheet.
import fs from 'fs';
let bad = 0;
for (const [file, names] of [['src/admin.js',['ADMIN_CSS','SECTION_DIALOG_HTML','LINK_DIALOG_HTML','UNDO_JS','SECTION_JS','MOVE_JS']],
                             ['src/theme.js',['IMAGE_CSS','SECTION_CSS','PUBLIC_CSS']]]) {
  const src = fs.readFileSync(file,'utf8');
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
