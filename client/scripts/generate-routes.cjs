const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found, cannot generate SPA fallback routes.');
  process.exit(1);
}

const html = fs.readFileSync(indexHtmlPath, 'utf8');

// Fallback HTML files for static cloud hosting platforms (Vercel, Netlify, Cloudflare)
fs.writeFileSync(path.join(distDir, '404.html'), html);
fs.writeFileSync(path.join(distDir, '200.html'), html);

// Static route pre-rendering for physical path resolution
const routes = ['mobile-upload', 'admin'];

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
  console.log(`Generated static fallback entry: dist/${route}/index.html`);
}

console.log('SPA route generation complete.');
