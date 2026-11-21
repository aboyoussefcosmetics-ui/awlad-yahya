# Awlad Yahya — Performance, SEO & GEO Engineering Rules

Whenever you build, modify, or refactor any database schema, API route, Admin Dashboard feature, or Frontend page in this project, you MUST strictly enforce these rules:

## 1. Database & Query Optimization (Supabase)
- **Indexes:** Always add database `INDEX` on frequently queried, filtered, or sorted columns (e.g., `slug`, `category_id`, `is_visible`, `sort_order`, `created_at`).
- **No N+1 Queries:** Never fetch related records inside loops. Always use relational joins (e.g., Supabase `.select('*, categories(*)')`) to fetch data in a single request.
- **Strict Pagination:** Never use unbounded `SELECT *` queries for lists. Always implement pagination using `.range(from, to)` (limit 12–20 items per page) with clean UI pagination controls.

## 2. Media & Asset Performance
- **Image Optimization:** On the Admin Dashboard upload flow, automatically compress images client-side and convert them to `.webp` format before uploading to Supabase Storage.
- **Lazy Loading & Next.js Image:** Always use optimized image rendering with explicit `width`/`height` or `aspect-ratio`, `loading="lazy"` for below-the-fold images, and `priority` only for the main hero banner.

## 3. Caching & State Management
- **Smart Caching:** Cache static/semi-static data (`site_settings`, `categories`, `site_sections`, `faqs`) using Next.js caching (`revalidate`) or client-side caching (SWR/React Query) so the database is not hit on every page view. Revalidate cache immediately when updated from the Admin Dashboard.

## 4. UX & Perceived Speed (Skeleton Loading)
- **Zero Blank Screens:** Never leave a white screen or plain "Loading..." text while fetching data. Always create and display realistic **Skeleton Loading** placeholders matching the exact layout of product cards, tables, and page sections.

## 5. Technical SEO & GEO (Generative Engine Optimization)
- **Dynamic Metadata:** Every page and product must dynamically generate `title`, `meta description`, `canonical` URL, OpenGraph tags, and clean Arabic/English slugs from the database (`site_settings` and `products` SEO fields).
- **Automated Sitemap & Robots:** Maintain dynamic `sitemap.xml` and `robots.txt` that automatically include all visible categories and products.
- **Structured Data (JSON-LD) for AI & Google:** Inject valid `Schema.org` JSON-LD on every page:
  - `Organization` & `LocalBusiness` schema on the homepage (highlighting Awlad Yahya as a specialized barber & salon chairs manufacturer in Egypt).
  - `Product` schema on every product page (including `name`, `image`, `description`, `brand`, `offers` with `price`, `priceCurrency: "EGP"`, and `availability`).
  - `FAQPage` schema on the FAQ section so AI engines (ChatGPT, Gemini, AI Overviews) directly cite our answers.
- **GEO-Friendly Content Structure:** Format product specifications, manufacturing quality steps, and "Why Us" sections using clear semantic HTML (`<article>`, `<section>`, `<h1>`-`<h3>`, `<table>`, `<dl>`) and direct, factual entity-rich statements so AI search crawlers easily extract and recommend Awlad Yahya over competitors.
