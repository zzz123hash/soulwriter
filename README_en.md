# SoulWriter

[English](README_en.md) | [中文](README.md)

---

## 🌐 Languages

| Language | File |
|---------|------|
| English | [README_en.md](README_en.md) |
| Chinese | [README.md](README.md) |

---

# SoulWriter

AI-powered intelligent novel writing assistant.

## Architecture

```
SoulWriter
├── core/           # 🔒 Core (stable, never changes)
│   ├── index.js    # Entry point
│   ├── db.js      # Database
│   ├── api.js     # API utilities
│   ├── events.js  # Event system (feedback control)
│   └── static.js  # Static file server
│
├── plugins/        # 🔌 Plugins (load on demand)
│   ├── ai-models/ # AI models
│   ├── features/  # Feature plugins
│   └── export/    # Export plugins
│
├── web/            # 🌐 Web frontend
│   ├── index.html
│   ├── css/
│   └── js/
│
└── cli/           # 💻 Command line
```

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Open Web UI
open http://localhost:3000
```

## API

### Books

| Method | Path | Description |
|-------|------|-------------|
| GET | /api/books | List all books |
| POST | /api/books | Create book |
| GET | /api/books/:id | Get book |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |

### Chapters

| Method | Path | Description |
|-------|------|-------------|
| GET | /api/books/:id/chapters | List chapters |
| POST | /api/books/:id/chapters | Create chapter |
| PUT | /api/chapters/:id | Update chapter |
| DELETE | /api/chapters/:id | Delete chapter |

## CLI

```bash
sw list                    # List books
sw new "Book Title"       # Create book
sw chapters <bookId>      # List chapters
sw chapter new <bookId> <title>  # Create chapter
```

## Development

### Adding a Plugin

```javascript
// plugins/my-plugin/index.js
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onInit(core) {
    // Register routes, hooks, etc.
  },
  
  routes: [
    { method: 'GET', path: '/api/my-plugin', handler: ... }
  ]
};
```

## License

MIT
