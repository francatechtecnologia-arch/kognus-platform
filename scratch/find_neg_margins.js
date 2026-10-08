const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check for absolute positioned elements with negative right or left
const negPositions = [];
html.split('\n').forEach((line, idx) => {
  if (line.match(/-(?:right|left|top|bottom)-\d+/) || line.match(/-m[xytrbl]-\d+/)) {
    negPositions.push(`${idx + 1}: ${line.trim()}`);
  }
});

console.log('Negative positioning/margins found:', negPositions.length);
negPositions.slice(0, 20).forEach(p => console.log(p));
