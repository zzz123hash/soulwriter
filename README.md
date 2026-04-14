# SoulWriter

[English](README_en.md) | [中文](README.md)

---

## 🌐 Languages

| Language | File |
|---------|------|
| English | [README_en.md](README_en.md) |
| 中文 | [README.md](README.md) |

---

# SoulWriter 核心设计

## 核心理念

**强 API 是核心** - 所有功能通过统一 API 访问，CLI、TUI、Web 只是不同的交互界面。

```
┌─────────────────────────────────────────────────────┐
│                     SoulWriter                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│   │   CLI   │  │   TUI   │  │   Web   │   ← 入口    │
│   └────┬────┘  └────┬────┘  └────┬────┘              │
│        │             │             │                   │
│        └─────────────┼─────────────┘                   │
│                      ▼                               │
│              ┌───────────────┐                        │
│              │     API      │  ← 核心，统一规范        │
│              └───────┬─────┘                        │
│                      │                               │
│   ┌─────────────────┼─────────────────┐            │
│   ▼                 ▼                 ▼               │
│ ┌──────┐       ┌────────┐       ┌──────┐           │
│ │SQLite│       │ Vector │       │ File │           │
│ └──────┘       └────────┘       └──────┘           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 接口类型

| 接口 | 说明 | 使用场景 |
|-----|------|---------|
| **Web UI** | 网页可视化界面 | 人类用户日常使用 |
| **TUI** | 终端图形界面 | 键盘操作，无需浏览器 |
| **CLI** | 命令行工具 | 脚本自动化，快速操作 |
| **API** | RESTful 接口 | AI agent，程序调用，二次开发 |

## 完整 API

所有功能都通过 API 访问：

- **书籍**：CRUD + 排序 + 复制 + 导入导出
- **章节**：CRUD + 拖拽排序
- **角色**：CRUD + 关系图谱
- **物品**：CRUD + 排序
- **地点**：CRUD + 层级结构
- **事件**：CRUD + 时间线
- **节点**：角色+物品+地点+事件的合成
- **单元**：多个节点的合成
- **创世树**：AI 预测分支
- **事件线**：拖拽排序

详见 [API 文档](docs/API.md)

## 快速开始

```bash
npm install
npm start
```

访问：
- Web UI: http://localhost:3000/
- API: http://localhost:3000/api/

## CLI

```bash
sw list                    # 书架
sw new "书名"            # 创建书籍
sw chapters <bookId>     # 章节列表
sw chapter new <bookId> <标题>  # 创建章节
```

## 开发

### 添加新功能

1. 在数据库添加表
2. 在核心 API 注册路由
3. 自动获得 Web/CLI/TUI 支持

### 添加插件

```javascript
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  onInit(core) {
    core.registerRoute('GET', '/api/feature', handler);
  }
};
```

## License

MIT
