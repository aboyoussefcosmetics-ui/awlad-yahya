/**
 * Awlad Yahya Factory - Automated Sitemap & Robots Generator
 * Generates sitemap.xml and robots.txt in compliance with RULES.md
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = 'https://awladyahya.com';
const TODAY = new Date().toISOString().slice(0, 10);

// Load categories and products from js/products-data.js
const productsDataFile = path.join(ROOT_DIR, 'js', 'products-data.js');
let categories = [];
let products = [];

try {
  const code = fs.readFileSync(productsDataFile, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  categories = context.window.categoriesData || [];
  products = context.window.productsData || [];
  console.log(`Loaded ${categories.length} categories and ${products.length} products from products-data.js`);
} catch (err) {
  console.error('Failed to load products-data.js:', err);
}

// 1. Build sitemap.xml
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Royal Chair Special Landing Page -->
  <url>
    <loc>${BASE_URL}/royal-chair.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

// Categories
categories.forEach(cat => {
  if (cat.active !== false) {
    xml += `  <!-- Category: ${cat.name} -->
  <url>
    <loc>${BASE_URL}/#category/${cat.id}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }
});

// Products with Images
products.forEach(p => {
  if (p.status !== 'inactive') {
    const pTitle = (p.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    xml += `  <url>
    <loc>${BASE_URL}/#product/${p.id}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
`;
    if (p.image) {
      const imgLoc = p.image.startsWith('http') ? p.image : `${BASE_URL}/${p.image.replace(/^\/+/, '')}`;
      xml += `    <image:image>
      <image:loc>${imgLoc}</image:loc>
      <image:title>${pTitle}</image:title>
    </image:image>
`;
    }
    xml += `  </url>
`;
  }
});

xml += `</urlset>
`;

const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
fs.writeFileSync(sitemapPath, xml.trim(), 'utf8');
console.log(`Successfully generated: ${sitemapPath}`);

// 2. Build robots.txt
const robotsTxt = `# Awlad Yahya Barber Chairs Factory - Robots Directives
# Optimized for Googlebot, Bingbot, and AI Search Crawlers (GEO Optimization)

User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /data/

# AI Search Crawlers (ChatGPT / SearchGPT, Copilot, Perplexity, Claude, Gemini)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

const robotsPath = path.join(ROOT_DIR, 'robots.txt');
fs.writeFileSync(robotsPath, robotsTxt.trim() + '\n', 'utf8');
console.log(`Successfully generated: ${robotsPath}`);
