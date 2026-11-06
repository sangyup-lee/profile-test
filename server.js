'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const host = 'localhost';
const port = 3000;
// 공개할 파일을 명시하여 서버 코드와 설정 파일의 노출을 막습니다.
const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/assets/profile.svg', ['assets/profile.svg', 'image/svg+xml']],
  ['/assets/profile.jpg', ['assets/profile.jpg', 'image/jpeg']],
]);

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const file = publicFiles.get(pathname);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : 'Not Found');
    return;
  }

  try {
    const content = await fs.readFile(path.join(__dirname, file[0]));
    res.writeHead(200, { 'Content-Type': file[1], 'Content-Length': content.length });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    const status = error.code === 'ENOENT' ? 404 : 500;
    if (status === 500) console.error('파일을 읽지 못했습니다:', error);
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : status === 404 ? 'Not Found' : 'Internal Server Error');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? '3000번 포트가 이미 사용 중입니다. 해당 서버를 종료한 뒤 다시 실행하세요.'
    : `서버 실행 오류: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`프로필 웹사이트: http://${host}:${port}`);
  console.log('종료하려면 Ctrl+C를 누르세요.');
});
