/**
 * SoulWriter Web - Simple Router
 * 简单的哈希路由
 */

class Router {
  constructor() {
    this.routes = {};
    this.current = null;
    
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, ...params] = hash.split('/');
    
    const route = this.routes[path] || this.routes['/'];
    if (route) {
      this.current = path;
      route(params);
    }
  }
}

window.router = new Router();
