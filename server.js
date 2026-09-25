const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse URL & determine file path
  let safeUrl = req.url.split('?')[0].split('#')[0];
  if (safeUrl === '/' || safeUrl === '') {
    safeUrl = '/index.html';
  }

  const decodedUrl = decodeURIComponent(safeUrl);
  const normalizedPath = path.normalize(decodedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, normalizedPath);

  // Security check: ensure path is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Acesso Negado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file not found, fallback to index.html for SPA routes
      const fallbackIndex = path.join(ROOT_DIR, 'index.html');
      fs.readFile(fallbackIndex, (fbErr, data) => {
        if (fbErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 - Arquivo não encontrado');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        }
      });
      return;
    }

    if (stats.isDirectory()) {
      const dirIndex = path.join(filePath, 'index.html');
      fs.readFile(dirIndex, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 - Arquivo não encontrado');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data2);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 - Erro interno do servidor');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  const actualPort = server.address().port;
  const url = `http://localhost:${actualPort}`;
  console.log('\n============================================================');
  console.log('🚀 KOGNUS 2.0 — SERVIDOR LOCAL INICIADO COM SUCESSO');
  console.log('============================================================');
  console.log(`🌐 Aplicação:  ${url}`);
  console.log(`📁 Diretório:   ${ROOT_DIR}`);
  console.log('💡 Pressione Ctrl + C para encerrar');
  console.log('============================================================\n');

  // Abre automaticamente no navegador padrão do Windows se não estiver em ambiente CI
  if (!process.env.CI) {
    const startCmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(startCmd, (err) => {
      if (err) {
        console.log(`ℹ️  Acesse manualmente no navegador: ${url}`);
      }
    });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Porta ${PORT} já está em uso!`);
    console.error(`Tentando iniciar na porta ${Number(PORT) + 1}...\n`);
    server.listen(Number(PORT) + 1);
  } else {
    console.error('Erro no servidor:', err);
  }
});
