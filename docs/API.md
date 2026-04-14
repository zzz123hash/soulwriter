# SoulWriter API

## Entities

| Entity | Description |
|--------|-------------|
| book | Book |
| chapter | Chapter |
| role | Character/Role |
| item | Item |
| location | Location |
| event | Event |
| node | Node (combination) |
| unit | Unit (collection of nodes) |
| genesis | Genesis tree |
| timeline | Timeline |

## Standard Response

```json
{
  "success": true|false,
  "data": {...},
  "error": { "code": "ERROR", "message": "..." }
}
```

## Books

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/books | List |
| POST | /api/books | Create |
| GET | /api/books/:id | Get |
| PUT | /api/books/:id | Update |
| DELETE | /api/books/:id | Delete |
| PATCH | /api/books/:id/move | Move/reorder |
| POST | /api/books/:id/copy | Copy |
| POST | /api/books/import | Import |
| GET | /api/books/:id/export | Export |

## Chapters

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/books/:id/chapters | List |
| POST | /api/books/:id/chapters | Create |
| PUT | /api/chapters/:id | Update |
| DELETE | /api/chapters/:id | Delete |
| PATCH | /api/chapters/:id/move | Move |

## Roles (Characters)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/books/:id/roles | List |
| POST | /api/books/:id/roles | Create |
| PUT | /api/roles/:id | Update |
| DELETE | /api/roles/:id | Delete |
| GET | /api/books/:id/roles/relationships | Map |
| POST | /api/roles/:id/relationships | Set relation |

## Items

| Method | Path |
|--------|------|
| GET | /api/books/:id/items |
| POST | /api/books/:id/items |
| PUT | /api/items/:id |
| DELETE | /api/items/:id |
| PATCH | /api/items/:id/move |

## Locations

| Method | Path |
|--------|------|
| GET | /api/books/:id/locations |
| POST | /api/books/:id/locations |
| PUT | /api/locations/:id |
| DELETE | /api/locations/:id |
| PATCH | /api/locations/:id/move |

## Events

| Method | Path |
|--------|------|
| GET | /api/books/:id/events |
| POST | /api/books/:id/events |
| PUT | /api/events/:id |
| DELETE | /api/events/:id |
| PATCH | /api/events/:id/move |

## Nodes (role+item+location+event)

| Method | Path |
|--------|------|
| GET | /api/books/:id/nodes |
| POST | /api/books/:id/nodes |
| PUT | /api/nodes/:id |
| DELETE | /api/nodes/:id |
| PATCH | /api/nodes/:id/move |
| PATCH | /api/nodes/:id/assign |

## Units (collection of nodes)

| Method | Path |
|--------|------|
| GET | /api/books/:id/units |
| POST | /api/books/:id/units |
| PUT | /api/units/:id |
| DELETE | /api/units/:id |
| PATCH | /api/units/:id/move |
| PATCH | /api/units/:id/compose |

## Genesis Tree

| Method | Path |
|--------|------|
| GET | /api/books/:id/genesis |
| POST | /api/books/:id/genesis/seeds |
| POST | /api/books/:id/genesis/predict |
| PATCH | /api/books/:id/genesis/nodes/:id/activate |

## Timeline

| Method | Path |
|--------|------|
| GET | /api/books/:id/timeline |
| POST | /api/books/:id/timeline |
| PATCH | /api/books/:id/timeline/reorder |

## Search

```
GET /api/books/:id/search?q=keyword
```

## Stats

```
GET /api/books/:id/stats
```

## Drag/Drop

All sortable entities support:

```
PATCH /api/:entity/:id/move
Body: { "after_id": "xxx" }
```

## Error Codes

| Code | Description |
|------|-------------|
| NOT_FOUND | Not found |
| VALIDATION_ERROR | Invalid input |
| SERVER_ERROR | Server error |
