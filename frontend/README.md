# Learning Platform — Angular Frontend

Angular 17 frontend for the Learning Platform Spring Boot backend.

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm start
```

Starts on `http://localhost:4200`. API calls to `/api/**` are proxied to `http://localhost:8080`.

The backend must be running first.

## Build

```bash
npm run build
```

Outputs to `dist/learning-platform-ui/`.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | JWT login |
| `/dashboard` | Overview stats + recent tip logs |
| `/topics` | Topic list with preview, CRUD |
| `/topics/new` | Create topic (supports custom AI prompt) |
| `/topics/:id/edit` | Edit topic |
| `/channels` | Teams channel list, CRUD |
| `/channels/new` | Register webhook channel |
| `/channels/:id/edit` | Edit channel |
| `/schedules` | Schedule list with toggle/trigger/delete |
| `/schedules/new` | Create schedule with multi-time support |
| `/schedules/:id/edit` | Edit schedule |
| `/tip-logs` | Paginated log list with topic/schedule/status filters |
| `/tip-logs/:id` | Full tip log detail with prompt and token usage |
