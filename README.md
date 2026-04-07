# Scam Alert Hub

A full-stack scam reporting website that lets users:

- Submit scam reports with details.
- Search all community reports using keywords.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

- `POST /api/reports` - create a report
- `GET /api/reports?query=keyword` - search reports by keyword
- `GET /api/health` - health check
