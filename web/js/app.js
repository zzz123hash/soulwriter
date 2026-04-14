/**
 * SoulWriter Web - Main App
 * 主应用逻辑
 */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// 渲染书架页面
function renderHome() {
  const app = $('#app');
  const tpl = $('#tpl-home').innerHTML;
  app.innerHTML = tpl;
  
  loadBooks();
  
  $('#btn-new-book').onclick = showNewBookModal;
}

// 加载书籍列表
async function loadBooks() {
  const shelf = $('#bookshelf');
  const books = window.store.getState().books;
  
  if (books.length === 0) {
    shelf.innerHTML = '<p class="loading">暂无书籍，创建第一本吧</p>';
    return;
  }
  
  shelf.innerHTML = books.map(book => `
    <div class="book-card" data-id="${book.book_id}">
      <h3>📖 ${book.title}</h3>
      <p class="meta">作者: ${book.author || '未知'}</p>
      <p class="word-count">${book.word_count || 0} 字</p>
    </div>
  `).join('');
  
  // 绑定点击事件
  $$('.book-card').forEach(card => {
    card.onclick = () => {
      const bookId = card.dataset.id;
      window.router.navigate(`book/${bookId}`);
    };
  });
}

// 渲染书籍页面
function renderBook(params) {
  const bookId = params[0];
  
  window.store.openBook(bookId).then(() => {
    const app = $('#app');
    const book = window.store.getState().currentBook;
    
    if (!book) {
      app.innerHTML = '<p>书籍不存在</p>';
      return;
    }
    
    const tpl = $('#tpl-book').innerHTML;
    app.innerHTML = tpl;
    
    $('#book-title').textContent = book.title;
    $('#btn-back').onclick = () => window.router.navigate('/');
    $('#btn-new-chapter').onclick = showNewChapterModal;
    
    renderChapters();
  });
}

// 渲染章节列表
function renderChapters() {
  const list = $('#chapter-list');
  const chapters = window.store.getState().chapters;
  
  if (chapters.length === 0) {
    list.innerHTML = '<p class="loading">暂无章节，创建第一章节吧</p>';
    return;
  }
  
  list.innerHTML = chapters.map(ch => `
    <div class="chapter-item" data-id="${ch.chapter_id}">
      <span class="title">📑 ${ch.title}</span>
    </div>
  `).join('');
  
  $$('.chapter-item').forEach(item => {
    item.onclick = () => {
      const chapterId = item.dataset.id;
      window.router.navigate(`write/${chapterId}`);
    };
  });
}

// 渲染写作页面
function renderWriter(params) {
  const chapterId = params[0];
  
  const app = $('#app');
  const tpl = $('#tpl-writer').innerHTML;
  app.innerHTML = tpl;
  
  const chapters = window.store.getState().chapters;
  const chapter = chapters.find(c => c.chapter_id === chapterId);
  
  if (chapter) {
    $('#chapter-title').textContent = chapter.title;
    $('#editor').value = chapter.content || '';
  }
  
  $('#btn-back').onclick = () => {
    const book = window.store.getState().currentBook;
    if (book) {
      window.router.navigate(`book/${book.book_id}`);
    } else {
      window.router.navigate('/');
    }
  };
  
  $('#btn-save').onclick = async () => {
    const content = $('#editor').value;
    await window.store.saveChapter(chapterId, content);
    alert('保存成功');
  };
}

// 显示新建书籍弹窗
function showNewBookModal() {
  const tpl = $('#tpl-modal-new-book').innerHTML;
  const modal = document.createElement('div');
  modal.innerHTML = tpl;
  document.body.appendChild(modal);
  
  modal.querySelector('.modal').classList.add('show');
  modal.querySelector('#btn-cancel').onclick = () => modal.remove();
  modal.querySelector('.modal').onclick = (e) => {
    if (e.target === modal.querySelector('.modal')) modal.remove();
  };
  
  modal.querySelector('#btn-create').onclick = async () => {
    const title = modal.querySelector('#input-title').value.trim();
    const author = modal.querySelector('#input-author').value.trim();
    if (!title) return alert('请输入书名');
    
    await window.store.createBook(title, author);
    modal.remove();
    renderHome();
  };
}

// 显示新建章节弹窗
function showNewChapterModal() {
  const title = prompt('章节标题:');
  if (title) {
    window.store.createChapter(title).then(() => {
      renderChapters();
    });
  }
}

// 初始化路由
function initRouter() {
  window.router.register('/', renderHome);
  window.router.register('book', renderBook);
  window.router.register('write', renderWriter);
}

// 初始化
async function init() {
  initRouter();
  await window.store.loadBooks();
}

// 启动
document.addEventListener('DOMContentLoaded', init);
