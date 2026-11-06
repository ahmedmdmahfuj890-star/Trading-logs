import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  if (jsFile && cssFile) {
    const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
    const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

    let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
    html = html.replace(/<link rel="stylesheet"[^>]*>/g, '');
    html = html.replace(/<script type="module"[^>]*><\/script>/g, '');

    const inlined = html
      .replace('</head>', `<style>${cssContent}</style></head>`)
      .replace('</body>', `<script type="module">${jsContent}</script></body>`);

    const outPath = path.resolve('public/trading-log.html');
    fs.writeFileSync(outPath, inlined, 'utf8');
    console.log('✅ Generated standalone offline HTML:', outPath, `(${(inlined.length / 1024).toFixed(1)} KB)`);
  }
}
