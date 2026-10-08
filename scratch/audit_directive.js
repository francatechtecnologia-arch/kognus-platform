const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('--- AUDITING index.html FOR DIRECTIVE COMPLIANCE ---');

// Check 1: No hardcoded dQw4w9WgXcQ in inputs
const inputMatch = html.includes('id="nl-video-url" value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
console.log('1. Hardcoded input value in nl-video-url present:', inputMatch);

// Check 2: extractYoutubeId fallback
const extractFallbackMatch = html.includes("if (!url) return 'dQw4w9WgXcQ'");
console.log('2. extractYoutubeId fallback present:', extractFallbackMatch);

// Check 3: getMyInstructorCourses defined
const hasGetMyInst = html.includes('function getMyInstructorCourses()');
console.log('3. function getMyInstructorCourses() present:', hasGetMyInst);

// Check 4: Neutral video state in player
const hasNeutralPlayer = html.includes('Nenhum vídeo anexado a esta aula');
console.log('4. Neutral player state present:', hasNeutralPlayer);
