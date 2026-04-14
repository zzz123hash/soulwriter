#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:3000';

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function formatBook(book) {
  const date = new Date(book.created_at).toLocaleDateString('zh-CN');
  return `  📖 ${book.title}
    作者: ${book.author || '未知'} | 字数: ${book.word_count} | 创建: ${date}
    ID: ${book.book_id}`;
}

const cmd = process.argv[2] || 'help';
const subCmd = process.argv[3];
const args = process.argv.slice(4);

async function main() {
  try {
    switch (cmd) {
      // 书籍列表
      case 'list':
      case 'ls': {
        const res = await request('GET', '/api/books');
        if (!res.success || res.data.length === 0) {
          console.log('暂无书籍，输入 "sw new <书名>" 创建第一本');
        } else {
          console.log('📚 书架:\n');
          res.data.forEach(formatBook);
          console.log(`\n共 ${res.data.length} 本书`);
        }
        break;
      }

      // 创建书籍
      case 'new': {
        const title = process.argv.slice(3).join(' ');
        if (!title) {
          console.log('用法: sw new <书名>');
          process.exit(1);
        }
        const res = await request('POST', '/api/books', { title, author: '', description: '' });
        if (res.success) {
          console.log(`✅ 创建成功: ${res.data.title}`);
          console.log(`   ID: ${res.data.book_id}`);
        } else {
          console.log(`❌ 创建失败: ${res.error}`);
        }
        break;
      }

      // 打开书籍
      case 'open': {
        const bookId = args[0];
        if (!bookId) {
          console.log('用法: sw open <bookId>');
          process.exit(1);
        }
        const res = await request('GET', `/api/books/${bookId}`);
        if (res.success) {
          console.log(`📖 ${res.data.title}`);
          console.log(`   作者: ${res.data.author}`);
          console.log(`   字数: ${res.data.word_count}`);
        } else {
          console.log(`❌ 书籍不存在`);
        }
        break;
      }

      // 删除书籍
      case 'delete':
      case 'rm': {
        const bookId = args[0];
        if (!bookId) {
          console.log('用法: sw delete <bookId>');
          process.exit(1);
        }
        const res = await request('DELETE', `/api/books/${bookId}`);
        if (res.success) {
          console.log('✅ 已删除');
        } else {
          console.log(`❌ 删除失败: ${res.error}`);
        }
        break;
      }

      // 章节列表
      case 'chapters': {
        const bookId = args[0];
        if (!bookId) {
          console.log('用法: sw chapters <bookId>');
          process.exit(1);
        }
        const res = await request('GET', `/api/books/${bookId}/chapters`);
        if (res.success) {
          if (res.data.length === 0) {
            console.log('暂无章节，输入 "sw chapter new <bookId> <标题>" 创建');
          } else {
            console.log(`📑 章节 (${res.data.length}):\n`);
            res.data.forEach((ch, i) => {
              console.log(`  ${i + 1}. ${ch.title}`);
            });
          }
        }
        break;
      }

      // 创建章节
      case 'chapter': {
        if (subCmd === 'new') {
          const bookId = args[0];
          const title = args.slice(1).join(' ');
          if (!bookId || !title) {
            console.log('用法: sw chapter new <bookId> <标题>');
            process.exit(1);
          }
          const res = await request('POST', `/api/books/${bookId}/chapters`, { title });
          if (res.success) {
            console.log(`✅ 章节创建成功: ${res.data.title}`);
          } else {
            console.log(`❌ 创建失败: ${res.error}`);
          }
        } else {
          console.log('用法: sw chapter new <bookId> <标题>');
        }
        break;
      }

      // 帮助
      case 'help':
      case '--help':
      case '-h':
      default: {
        console.log(`
SoulWriter CLI - AI 小说写作助手

用法:
  sw <命令> [参数]

书籍:
  sw list                  列出所有书籍
  sw new <书名>            创建新书籍
  sw open <bookId>         查看书籍信息
  sw delete <bookId>       删除书籍

章节:
  sw chapters <bookId>     列出章节
  sw chapter new <bookId> <标题>  创建章节

示例:
  sw new "我的小说"        创建新书
  sw list                  查看书架
  sw chapters book_123      查看书的章节

API 地址: ${API_BASE}
`);
      }
    }
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
}

main();
