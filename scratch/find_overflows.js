const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Search for fixed widths >= 400px, min-w >= 300px, or specific classes
const fixedWidths = [];
const lines = html.split('\n');
lines.forEach((line, idx) => {
  // Check for w-[...px] or min-w-[...px]
  const match = line.match(/(?:w|min-w)-\[(\d+)px\]/g);
  if (match) {
    match.forEach(m => {
      const num = parseInt(m.match(/\d+/)[0]);
      if (num > 320) {
        fixedWidths.push({ line: idx + 1, match: m, content: line.trim().slice(0, 100) });
      }
    });
  }
  // Check for inline style width
  const styleMatch = line.match(/width:\s*(\d+)px/g);
  if (styleMatch) {
    styleMatch.forEach(m => {
      const num = parseInt(m.match(/\d+/)[0]);
      if (num > 320) {
        fixedWidths.push({ line: idx + 1, match: m, content: line.trim().slice(0, 100) });
      }
    });
  }
});

console.log('Fixed widths > 320px found:', fixedWidths.length);
fixedWidths.slice(0, 25).forEach(f => console.log(`${f.line}: ${f.match} -> ${f.content}`));
