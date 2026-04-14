/**
 * SoulWriter Core - API Base
 * API 响应标准化
 */

const { events } = require('./events');

// 标准响应格式
function success(data, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      version: '1.0.0',
      timestamp: Date.now(),
      ...meta
    }
  };
}

function error(message, code = 'ERROR') {
  return {
    success: false,
    error: {
      code,
      message
    },
    meta: {
      version: '1.0.0',
      timestamp: Date.now()
    }
  };
}

// 解析请求体
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

// 发送 JSON 响应
function sendJSON(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// 路由匹配
function matchRoute(pattern, pathname) {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  
  if (patternParts.length !== pathParts.length) return null;
  
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

module.exports = {
  success,
  error,
  parseBody,
  sendJSON,
  matchRoute,
  events
};
