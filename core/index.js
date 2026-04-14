/**
 * SoulWriter Core - Main Entry
 * 微内核核心，稳定不变
 */

const http = require('http');
const { events, EventTypes } = require('./events');
const { success, error, parseBody, sendJSON, matchRoute } = require('./api');
const { books, chapters } = require('./db');
const { serveStatic } = require('./static');

// 已加载的插件
const plugins = new Map();

// 插件管理器
const pluginManager = {
  async load(plugin) {
    try {
      if (typeof plugin.onInit === 'function') {
        await plugin.onInit({ events, books, chapters });
      }
      if (typeof plugin.onLoad === 'function') {
        await plugin.onLoad();
      }
      plugins.set(plugin.name, plugin);
      events.emit(EventTypes.PLUGIN_LOADED, { name: plugin.name });
      console.log(`[Plugin] Loaded: ${plugin.name}`);
      return true;
    } catch (err) {
      console.error(`[Plugin] Failed to load ${plugin.name}:`, err.message);
      return false;
    }
  },
  
  async unload(name) {
    const plugin = plugins.get(name);
    if (plugin && typeof plugin.onUnload === 'function') {
      await plugin.onUnload();
    }
    plugins.delete(name);
    events.emit(EventTypes.PLUGIN_UNLOADED, { name });
  },
  
  get(name) {
    return plugins.get(name);
  },
  
  list() {
    return Array.from(plugins.keys());
  }
};

// 内置路由
const routes = [];

// 注册 API 路由
function registerRoute(method, path, handler) {
  routes.push({ method, path, handler, isStatic: false });
}

// 加载内置 API 路由
function loadBuiltinRoutes() {
  // 书籍路由
  registerRoute('GET', '/api/books', async () => {
    return success(books.findAll());
  });

  registerRoute('POST', '/api/books', async (req) => {
    const body = await parseBody(req);
    if (!body.title) return error('标题不能为空', 'VALIDATION_ERROR');
    const result = books.create(body);
    events.emit(EventTypes.BOOK_CREATED, result);
    return success(result);
  });

  registerRoute('GET', '/api/books/:bookId', async (req, params) => {
    const book = books.findById(params.bookId);
    if (!book) return error('书籍不存在', 'NOT_FOUND');
    return success(book);
  });

  registerRoute('PUT', '/api/books/:bookId', async (req, params) => {
    const body = await parseBody(req);
    const book = books.update(params.bookId, body);
    events.emit(EventTypes.BOOK_UPDATED, book);
    return success(book);
  });

  registerRoute('DELETE', '/api/books/:bookId', async (req, params) => {
    books.delete(params.bookId);
    events.emit(EventTypes.BOOK_DELETED, { bookId: params.bookId });
    return success({ deleted: true });
  });

  // 章节路由
  registerRoute('GET', '/api/books/:bookId/chapters', async (req, params) => {
    return success(chapters.findByBook(params.bookId));
  });

  registerRoute('POST', '/api/books/:bookId/chapters', async (req, params) => {
    const body = await parseBody(req);
    if (!body.title) return error('标题不能为空', 'VALIDATION_ERROR');
    const result = chapters.create({ ...body, book_id: params.bookId });
    events.emit(EventTypes.CHAPTER_CREATED, result);
    return success(result);
  });

  registerRoute('PUT', '/api/chapters/:chapterId', async (req, params) => {
    const body = await parseBody(req);
    chapters.update(params.chapterId, body);
    events.emit(EventTypes.CHAPTER_UPDATED, { chapterId: params.chapterId });
    return success({ updated: true });
  });

  registerRoute('DELETE', '/api/chapters/:chapterId', async (req, params) => {
    chapters.delete(params.chapterId);
    events.emit(EventTypes.CHAPTER_DELETED, { chapterId: params.chapterId });
    return success({ deleted: true });
  });

  // 插件路由（动态）
  registerRoute('GET', '/api/plugins', async () => {
    return success(pluginManager.list());
  });
}

// HTTP 服务器
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API 路由
  for (const route of routes) {
    const params = matchRoute(route.path, url);
    if (params && route.method === method) {
      try {
        const result = await route.handler(req, params);
        sendJSON(res, result, result.success !== false ? 200 : 400);
      } catch (err) {
        sendJSON(res, error(err.message), 500);
      }
      return;
    }
  }

  // 插件路由
  for (const [name, plugin] of plugins) {
    if (plugin.routes) {
      for (const route of plugin.routes) {
        const params = matchRoute(route.path, url);
        if (params && route.method === method) {
          try {
            const result = await route.handler(req, params, plugin);
            sendJSON(res, result, result.success !== false ? 200 : 400);
          } catch (err) {
            sendJSON(res, error(err.message), 500);
          }
          return;
        }
      }
    }
  }

  // 健康检查
  if (url === '/api/health' && method === 'GET') {
    sendJSON(res, success({ status: 'ok', plugins: pluginManager.list() }));
    return;
  }

  // 静态文件（最后处理）
  if (method === 'GET' && !url.startsWith('/api/')) {
    serveStatic(req, res);
    return;
  }

  // 404
  sendJSON(res, error('Not found', 'NOT_FOUND'), 404);
});

// 启动
async function start(port = 3000) {
  loadBuiltinRoutes();
  
  server.listen(port, () => {
    console.log(`SoulWriter Core running at http://localhost:${port}`);
    console.log(`Web UI: http://localhost:${port}/`);
    events.emit(EventTypes.READY, { port });
  });
}

module.exports = {
  start,
  pluginManager,
  registerRoute,
  events,
  EventTypes
};
