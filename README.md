# SoulWriter

AI-powered novel writing assistant with modular architecture.

## Architecture

```
SoulWriter
├── core/              # 🔒 Core (stable, never changes)
│   ├── index.js       # Entry point
│   ├── db.js         # Database layer
│   ├── api.js        # API utilities
│   ├── events.js     # Event system (feedback control)
│   └── static.js     # Static file server
│
├── plugins/           # 🔌 Plugins (load on demand)
│   ├── ai-models/    # AI model plugins
│   ├── features/    # Feature plugins
│   └── export/       # Export plugins
│
├── web/               # 🌐 Web UI
│   ├── index.html
│   ├── css/
│   └── js/
│
└── cli/               # 💻 CLI tool
```

## Features

- **Books & Chapters**: Full CRUD operations
- **Modular Design**: Core + Plugin architecture
- **Multiple Interfaces**: Web UI, CLI support
- **SQLite Database**: Single file, portable
- **Event System**: Feedback control mechanism

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Access Web UI
open http://localhost:3000
```

## API

### Books

```
GET    /api/books              # List all books
POST   /api/books             # Create book
GET    /api/books/:id         # Get book
PUT    /api/books/:id         # Update book
DELETE /api/books/:id         # Delete book
```

### Chapters

```
GET    /api/books/:id/chapters    # List chapters
POST   /api/books/:id/chapters    # Create chapter
PUT    /api/chapters/:id           # Update chapter
DELETE /api/chapters/:id           # Delete chapter
```

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
  apiVersion: '1.0',
  
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
