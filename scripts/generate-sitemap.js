/**
 * Script para generar sitemap.xml dinámicamente
 * Ejecutar con: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://finantel.vercel.app';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Define todas las rutas de tu aplicación
const routes = [
  {
    loc: '/',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    loc: '/pricing',
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    loc: '/login',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/register',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/about',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    loc: '/contact',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    loc: '/terms',
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    loc: '/privacy',
    changefreq: 'yearly',
    priority: 0.3,
  },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${routes
    .map(
      (route) => `
  <url>
    <loc>${SITE_URL}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml.trim());
  console.log('✅ Sitemap generado exitosamente en:', OUTPUT_PATH);
  console.log(`📊 Total de URLs: ${routes.length}`);
  console.log(`📅 Última modificación: ${today}`);
}

// Ejecutar
generateSitemap();
