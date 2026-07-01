const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const results = [];

function walk(d) {
  try {
    const files = fs.readdirSync(d);
    for (const f of files) {
      if (f === '.next' || f === 'node_modules') continue;
      const fp = path.join(d, f);
      try {
        if (fs.statSync(fp).isDirectory()) walk(fp);
        else if (/\.(tsx?|jsx?)$/.test(f)) {
          const c = fs.readFileSync(fp, 'utf8');
          const regex = /supabase\.auth\.[\w.]+/g;
          const matches = [...c.matchAll(regex)];
          if (matches.length) {
            const unique = [...new Set(matches.map(m => m[0]))];
            results.push(fp.replace(dir, '') + ': ' + unique.join(', '));
          }
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { /* skip */ }
}

walk(dir);
if (results.length) {
  console.log(results.join('\n'));
} else {
  console.log('None found');
}
