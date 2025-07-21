import { cruise } from 'dependency-cruiser';
import fs from 'fs';

(async () => {
  const sitemap = fs.readFileSync('src/app/sitemap.xml', 'utf8');
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(m => new URL(m[1]).pathname);

  const map = {};
  for (const route of routes) {
    const pageFile = route === '/' ? 'app/page.tsx' : `app${route}/page.tsx`;
    if (!fs.existsSync(pageFile)) continue;
    const result = cruise([pageFile], {
      includeOnly: '^app',
      exclude: 'node_modules'
    });
    map[route] = JSON.parse(result).modules.map(m => m.source);
  }

  fs.writeFileSync('components-map.json', JSON.stringify(map, null, 2));
  console.log('✅ components-map.json gerado');
})();
