const http = require('http');
const books = require('./routes/books');

const PORT = 3000;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];
  const method = req.method;

  // 健康检查
  if (url === '/api/health' && method === 'GET') {
    sendJSON(res, { success: true, message: 'SoulWriter API is running' });
    return;
  }

  // ========== 书籍 API ==========
  
  // GET /api/books - 获取所有书籍
  if (url === '/api/books' && method === 'GET') {
    sendJSON(res, books.getBooks());
    return;
  }

  // POST /api/books - 创建书籍
  if (url === '/api/books' && method === 'POST') {
    try {
      const body = await parseBody(req);
      sendJSON(res, books.createBook(body), 201);
    } catch (e) {
      sendJSON(res, { success: false, error: 'Invalid JSON' }, 400);
    }
    return;
  }

  // GET /api/books/:bookId - 获取单个书籍
  const bookMatch = url.match(/^\/api\/books\/([^/]+)$/);
  if (bookMatch && method === 'GET') {
    const result = books.getBook(bookMatch[1]);
    sendJSON(res, result, result.success ? 200 : 404);
    return;
  }

  // PUT /api/books/:bookId - 更新书籍
  if (bookMatch && method === 'PUT') {
    try {
      const body = await parseBody(req);
      sendJSON(res, books.updateBook(bookMatch[1], body));
    } catch (e) {
      sendJSON(res, { success: false, error: 'Invalid JSON' }, 400);
    }
    return;
  }

  // DELETE /api/books/:bookId - 删除书籍
  if (bookMatch && method === 'DELETE') {
    sendJSON(res, books.deleteBook(bookMatch[1]));
    return;
  }

  // ========== 章节 API ==========
  
  // GET /api/books/:bookId/chapters - 获取书籍的章节
  const chaptersMatch = url.match(/^\/api\/books\/([^/]+)\/chapters$/);
  if (chaptersMatch && method === 'GET') {
    sendJSON(res, books.getChapters(chaptersMatch[1]));
    return;
  }

  // POST /api/books/:bookId/chapters - 创建章节
  if (chaptersMatch && method === 'POST') {
    try {
      const body = await parseBody(req);
      const result = books.createChapter({ ...body, book_id: chaptersMatch[1] });
      sendJSON(res, result, result.success ? 201 : 400);
    } catch (e) {
      sendJSON(res, { success: false, error: 'Invalid JSON' }, 400);
    }
    return;
  }

  // ========== 首页 ==========
  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>SoulWriter API</h1><p>Running. <a href="/api/health">Health Check</a></p>');
    return;
  }

  sendJSON(res, { success: false, error: 'Not found' }, 404);
});

server.listen(PORT, () => {
  console.log(`SoulWriter API running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  GET    /api/books');
  console.log('  POST   /api/books');
  console.log('  GET    /api/books/:bookId');
  console.log('  PUT    /api/books/:bookId');
  console.log('  DELETE /api/books/:bookId');
  console.log('  GET    /api/books/:bookId/chapters');
  console.log('  POST   /api/books/:bookId/chapters');
});
