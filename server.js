const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const safeReadReports = () => {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeReports = (reports) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), 'utf8');
};

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(body));
};

const serveStaticFile = (reqPath, res) => {
  const normalizedPath = reqPath === '/' ? '/index.html' : reqPath;
  const filePath = path.join(PUBLIC_DIR, path.normalize(normalizedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, file) => {
    if (err) {
      sendJson(res, 404, { error: 'File not found' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream'
    });
    res.end(file);
  });
};

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'POST' && requestUrl.pathname === '/api/reports') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
      }
    });

    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON payload.' });
        return;
      }

      const reporter_name = (payload.reporter_name || '').trim();
      const scam_type = (payload.scam_type || '').trim();
      const description = (payload.description || '').trim();

      if (!reporter_name || !scam_type || !description) {
        sendJson(res, 400, {
          error: 'reporter_name, scam_type, and description are required.'
        });
        return;
      }

      const amountInput = payload.amount_lost;
      const amount_lost =
        amountInput === '' || amountInput === null || amountInput === undefined
          ? null
          : Number(amountInput);

      if (amount_lost !== null && Number.isNaN(amount_lost)) {
        sendJson(res, 400, {
          error: 'amount_lost must be a valid number when provided.'
        });
        return;
      }

      const reports = safeReadReports();
      const report = {
        id: reports.length ? reports[reports.length - 1].id + 1 : 1,
        reporter_name,
        contact_info: (payload.contact_info || '').trim(),
        scam_type,
        incident_date: (payload.incident_date || '').trim(),
        location: (payload.location || '').trim(),
        amount_lost,
        description,
        created_at: new Date().toISOString()
      };

      reports.push(report);
      writeReports(reports);
      sendJson(res, 201, { report });
    });
    return;
  }

  if (req.method === 'GET' && requestUrl.pathname === '/api/reports') {
    const query = (requestUrl.searchParams.get('query') || '').trim().toLowerCase();
    const reports = safeReadReports();

    const filtered = query
      ? reports.filter((report) => {
          return [
            report.reporter_name,
            report.contact_info,
            report.scam_type,
            report.incident_date,
            report.location,
            report.description
          ]
            .join(' ')
            .toLowerCase()
            .includes(query);
        })
      : reports;

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    sendJson(res, 200, { reports: filtered, query });
    return;
  }

  if (req.method === 'GET') {
    serveStaticFile(requestUrl.pathname, res);
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
});

server.listen(PORT, () => {
  console.log(`Scam reporting portal running at http://localhost:${PORT}`);
});
