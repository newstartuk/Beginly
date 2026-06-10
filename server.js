const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Load .env.production for production deployments (secrets stay on server)
if (process.env.NODE_ENV === 'production') {
  try {
    require('dotenv').config({ path: require('path').join(__dirname, '.env.production') });
  } catch (_) { /* dotenv optional */ }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`> Beginly ready on http://${hostname}:${port}`);
  });
});
