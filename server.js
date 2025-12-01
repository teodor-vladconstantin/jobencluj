import fs from 'node:fs/promises';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined;

// Create http server
const app = express();

// Add Vite or respective production middlewares
let vite;
if (!isProduction) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// Dynamic Sitemap endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    let generateSitemap;
    
    if (!isProduction) {
      const sitemapModule = await vite.ssrLoadModule('/src/lib/sitemap.ts');
      generateSitemap = sitemapModule.generateSitemap;
    } else {
      const sitemapModule = await import('./dist/server/sitemap.js');
      generateSitemap = sitemapModule.generateSitemap;
    }
    
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Serve HTML
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    let template;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
    } else {
      template = templateHtml;
    }

    // Simple HTML shell - no SSR for now to avoid hydration issues
    // SEO meta tags are injected via react-helmet-async on client
    const html = template;

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
