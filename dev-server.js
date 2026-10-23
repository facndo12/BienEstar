import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function publicFile(pathname) {
  if (pathname === '/' || pathname === '/index.html') return resolve(root, 'index.html');
  if (pathname === '/styles.css' || pathname === '/script.js') return resolve(root, pathname.slice(1));
  if (pathname.startsWith('/public/images/')) {
    const filename = pathname.slice('/public/images/'.length);
    if (filename && !/[\\/]/.test(filename) && types[extname(filename)]) {
      return resolve(root, 'public', 'images', filename);
    }
  }
  return null;
}

createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = publicFile(pathname);
    if (!file) {
      response.writeHead(404).end('Not found');
      return;
    }
    const fileStat = await stat(file);
    if (!fileStat.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': types[extname(file)],
      'Cache-Control': pathname.startsWith('/public/images/') ? 'public, max-age=3600' : 'no-cache',
    });
    response.end(request.method === 'HEAD' ? undefined : await readFile(file));
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, host, () => {
  console.log(`BienEstar: http://${host}:${port}/`);
});
