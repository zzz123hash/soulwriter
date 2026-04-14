# SoulWriter

[English](README_en.md) | [中文](README.md)

---

## 🌐 多语言

| 语言 | 文件 |
|-----|------|
| English | [README_en.md](README_en.md) |
| 简体中文 | [README.md](README.md) |

---

# SoulWriter 中文文档

AI 驱动的智能小说写作助手。

## 系统架构

```
SoulWriter
├── core/           # 🔒 核心层（稳定不变）
│   ├── index.js    # 入口
│   ├── db.js      # 数据库
│   ├── api.js     # API 工具
│   ├── events.js  # 事件系统（反馈控制）
│   └── static.js  # 静态文件
│
├── plugins/        # 🔌 插件层（按需加载）
│   ├── ai-models/ # AI 模型
│   ├── features/  # 功能插件
│   └── export/    # 导出插件
│
├── web/            # 🌐 网页前端
│   ├── index.html
│   ├── css/
│   └── js/
│
└── cli/           # 💻 命令行
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问网页
open http://localhost:3000
```

## API 接口

### 书籍

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/books | 列出书籍 |
| POST | /api/books | 创建书籍 |
| GET | /api/books/:id | 获取书籍 |
| PUT | /api/books/:id | 更新书籍 |
| DELETE | /api/books/:id | 删除书籍 |

### 章节

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | /api/books/:id/chapters | 列出章节 |
| POST | /api/books/:id/chapters | 创建章节 |
| PUT | /api/chapters/:id | 更新章节 |
| DELETE | /api/chapters/:id | 删除章节 |

## CLI 命令行

```bash
sw list                    # 书架
sw new "书名"            # 创建书籍
sw chapters <bookId>     # 章节列表
sw chapter new <bookId> <标题>  # 创建章节
```

## 开发

### 添加插件

```javascript
// plugins/my-plugin/index.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onInit(core) {
    // 注册路由、钩子等
  },
  
  routes: [
    { method: 'GET', path: '/api/my-plugin', handler: ... }
  ]
};
```

## License

MIT
