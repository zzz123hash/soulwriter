/**
 * SoulWriter Web - State Management
 * 简单的状态管理
 */

class Store {
  constructor() {
    this.state = {
      books: [],
      currentBook: null,
      chapters: [],
      currentChapter: null,
      loading: false
    };
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // 书籍
  async loadBooks() {
    this.setState({ loading: true });
    const res = await window.api.getBooks();
    this.setState({ books: res.data || [], loading: false });
  }

  async createBook(title, author = '') {
    const res = await window.api.createBook({ title, author });
    if (res.success) {
      await this.loadBooks();
    }
    return res;
  }

  async openBook(bookId) {
    const res = await window.api.getBook(bookId);
    if (res.success) {
      this.setState({ currentBook: res.data });
      const chaptersRes = await window.api.getChapters(bookId);
      this.setState({ chapters: chaptersRes.data || [] });
    }
    return res;
  }

  // 章节
  async createChapter(title) {
    if (!this.state.currentBook) return { success: false };
    const res = await window.api.createChapter(this.state.currentBook.book_id, { title });
    if (res.success) {
      await this.openBook(this.state.currentBook.book_id);
    }
    return res;
  }

  async saveChapter(chapterId, content) {
    const res = await window.api.updateChapter(chapterId, { content });
    return res;
  }

  // 关闭书籍
  closeBook() {
    this.setState({
      currentBook: null,
      chapters: [],
      currentChapter: null
    });
  }
}

// 全局 Store 实例
window.store = new Store();
