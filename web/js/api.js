/**
 * SoulWriter Web - API Layer
 * 标准 API 调用
 */

const API_BASE = 'http://localhost:3000';

class API {
  async request(method, path, body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(API_BASE + path, options);
    return res.json();
  }

  // 书籍
  async getBooks() {
    return this.request('GET', '/api/books');
  }

  async getBook(bookId) {
    return this.request('GET', `/api/books/${bookId}`);
  }

  async createBook(data) {
    return this.request('POST', '/api/books', data);
  }

  async updateBook(bookId, data) {
    return this.request('PUT', `/api/books/${bookId}`, data);
  }

  async deleteBook(bookId) {
    return this.request('DELETE', `/api/books/${bookId}`);
  }

  // 章节
  async getChapters(bookId) {
    return this.request('GET', `/api/books/${bookId}/chapters`);
  }

  async createChapter(bookId, data) {
    return this.request('POST', `/api/books/${bookId}/chapters`, data);
  }

  async updateChapter(chapterId, data) {
    return this.request('PUT', `/api/chapters/${chapterId}`, data);
  }

  async deleteChapter(chapterId) {
    return this.request('DELETE', `/api/chapters/${chapterId}`);
  }

  // 健康检查
  async health() {
    return this.request('GET', '/api/health');
  }
}

// 全局 API 实例
window.api = new API();
