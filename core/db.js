/**
 * SoulWriter Core - Database Layer
 * 核心数据库操作，稳定不变
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 确保 data 目录存在
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'soulwriter.db'));

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT DEFAULT '',
    description TEXT DEFAULT '',
    word_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id TEXT UNIQUE NOT NULL,
    book_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id)
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// 书籍操作
const books = {
  findAll() {
    return db.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY updated_at DESC').all();
  },

  findById(bookId) {
    return db.prepare('SELECT * FROM books WHERE book_id = ? AND deleted_at IS NULL').get(bookId);
  },

  create(data) {
    const bookId = data.book_id || 'book_' + Date.now();
    db.prepare(`
      INSERT INTO books (book_id, title, author, description)
      VALUES (?, ?, ?, ?)
    `).run(bookId, data.title, data.author || '', data.description || '');
    return { book_id: bookId, title: data.title, author: data.author || '' };
  },

  update(bookId, data) {
    const fields = [];
    const values = [];
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.author !== undefined) { fields.push('author = ?'); values.push(data.author); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(bookId);
    db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`).run(...values);
    return books.findById(bookId);
  },

  delete(bookId) {
    db.prepare('UPDATE books SET deleted_at = CURRENT_TIMESTAMP WHERE book_id = ?').run(bookId);
  },

  updateWordCount(bookId) {
    const result = db.prepare('SELECT SUM(LENGTH(content)) as wc FROM chapters WHERE book_id = ?').get(bookId);
    const wordCount = result.wc || 0;
    db.prepare('UPDATE books SET word_count = ?, updated_at = CURRENT_TIMESTAMP WHERE book_id = ?').run(wordCount, bookId);
  }
};

// 章节操作
const chapters = {
  findByBook(bookId) {
    return db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC').all(bookId);
  },

  findById(chapterId) {
    return db.prepare('SELECT * FROM chapters WHERE chapter_id = ?').get(chapterId);
  },

  create(data) {
    const chapterId = data.chapter_id || 'chapter_' + Date.now();
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM chapters WHERE book_id = ?').get(data.book_id);
    const orderIndex = (maxOrder.max || 0) + 1;
    
    db.prepare(`
      INSERT INTO chapters (chapter_id, book_id, title, content, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(chapterId, data.book_id, data.title, data.content || '', orderIndex);
    
    books.updateWordCount(data.book_id);
    return { chapter_id: chapterId, book_id: data.book_id, title: data.title, order_index: orderIndex };
  },

  update(chapterId, data) {
    const fields = [];
    const values = [];
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.content !== undefined) { fields.push('content = ?'); values.push(data.content); }
    if (data.order_index !== undefined) { fields.push('order_index = ?'); values.push(data.order_index); }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(chapterId);
    db.prepare(`UPDATE chapters SET ${fields.join(', ')} WHERE chapter_id = ?`).run(...values);
    
    const chapter = chapters.findById(chapterId);
    if (chapter) books.updateWordCount(chapter.book_id);
  },

  delete(chapterId) {
    const chapter = chapters.findById(chapterId);
    db.prepare('DELETE FROM chapters WHERE chapter_id = ?').run(chapterId);
    if (chapter) books.updateWordCount(chapter.book_id);
  }
};

// 元数据操作
const meta = {
  get(key) {
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
    return row ? row.value : null;
  },
  set(key, value) {
    db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, value);
  }
};

module.exports = { db, books, chapters, meta };
