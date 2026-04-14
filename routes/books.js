const db = require('../db/init');

// 获取所有书籍
function getBooks() {
  const books = db.prepare(`
    SELECT * FROM books 
    WHERE deleted_at IS NULL 
    ORDER BY updated_at DESC
  `).all();
  return { success: true, data: books };
}

// 获取单个书籍
function getBook(bookId) {
  const book = db.prepare('SELECT * FROM books WHERE book_id = ? AND deleted_at IS NULL').get(bookId);
  if (!book) {
    return { success: false, error: 'Book not found' };
  }
  return { success: true, data: book };
}

// 创建书籍
function createBook(data) {
  const { title, author = '', description = '' } = data;
  const bookId = 'book_' + Date.now();
  
  try {
    db.prepare(`
      INSERT INTO books (book_id, title, author, description)
      VALUES (?, ?, ?, ?)
    `).run(bookId, title, author, description);
    
    return { success: true, data: { book_id: bookId, title, author, description } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 更新书籍
function updateBook(bookId, data) {
  const { title, author, description } = data;
  const fields = [];
  const values = [];
  
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (author !== undefined) { fields.push('author = ?'); values.push(author); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(bookId);
  
  try {
    db.prepare(`UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`).run(...values);
    return { success: true, data: getBook(bookId).data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 删除书籍（软删除）
function deleteBook(bookId) {
  try {
    db.prepare('UPDATE books SET deleted_at = CURRENT_TIMESTAMP WHERE book_id = ?').run(bookId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 获取书籍的章节
function getChapters(bookId) {
  const chapters = db.prepare(`
    SELECT * FROM chapters 
    WHERE book_id = ? 
    ORDER BY order_index ASC
  `).all(bookId);
  return { success: true, data: chapters };
}

// 创建章节
function createChapter(data) {
  const { book_id, title, content = '' } = data;
  
  // 检查书籍是否存在
  const book = db.prepare('SELECT * FROM books WHERE book_id = ? AND deleted_at IS NULL').get(book_id);
  if (!book) {
    return { success: false, error: 'Book not found' };
  }
  
  // 获取最大 order_index
  const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM chapters WHERE book_id = ?').get(book_id);
  const orderIndex = (maxOrder.max || 0) + 1;
  
  const chapterId = 'chapter_' + Date.now();
  
  try {
    db.prepare(`
      INSERT INTO chapters (chapter_id, book_id, title, content, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(chapterId, book_id, title, content, orderIndex);
    
    // 更新书籍字数
    updateWordCount(book_id);
    
    return { success: true, data: { chapter_id: chapterId, book_id, title, order_index: orderIndex } };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 更新章节
function updateChapter(chapterId, data) {
  const { title, content, order_index } = data;
  const fields = [];
  const values = [];
  
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (content !== undefined) { fields.push('content = ?'); values.push(content); }
  if (order_index !== undefined) { fields.push('order_index = ?'); values.push(order_index); }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(chapterId);
  
  try {
    db.prepare(`UPDATE chapters SET ${fields.join(', ')} WHERE chapter_id = ?`).run(...values);
    
    // 更新书籍字数
    const chapter = db.prepare('SELECT book_id FROM chapters WHERE chapter_id = ?').get(chapterId);
    if (chapter) {
      updateWordCount(chapter.book_id);
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 删除章节
function deleteChapter(chapterId) {
  try {
    const chapter = db.prepare('SELECT book_id FROM chapters WHERE chapter_id = ?').get(chapterId);
    db.prepare('DELETE FROM chapters WHERE chapter_id = ?').run(chapterId);
    
    if (chapter) {
      updateWordCount(chapter.book_id);
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 更新书籍字数
function updateWordCount(bookId) {
  const result = db.prepare('SELECT SUM(LENGTH(content)) as wc FROM chapters WHERE book_id = ?').get(bookId);
  const wordCount = result.wc || 0;
  db.prepare('UPDATE books SET word_count = ? WHERE book_id = ?').run(wordCount, bookId);
}

module.exports = {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter
};
