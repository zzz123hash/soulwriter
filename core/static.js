/**
 * SoulWriter Core - Static File Server
 * 提供静态文件服务
 */

const fs = require('fs');
const path = require('path');

const STATIC_DIR = path.join(__dirname, '..', 'web');

// MIME 类型
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  
  // 安全检查：防止路径遍历
  if (urlPath.includes('..')) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // 默认 index.html
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  const filePath = path.join(STATIC_DIR, urlPath);
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    // 读取并发送文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

module.exports = { serveStatic };
