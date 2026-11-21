/**
 * Awlad Yahya Factory - Dynamic Robots Directives for Next.js / Modern Headless Stacks
 * Adheres to RULES.md Standard 5 (Technical SEO & GEO)
 */

export interface RobotsPolicy {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

export interface MetadataRouteRobots {
  rules: RobotsPolicy | RobotsPolicy[];
  sitemap?: string | string[];
  host?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awladyahya.com';

export default function robots(): MetadataRouteRobots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin.html', '/data/'],
      },
      // GEO / AI Crawlers Optimization
      {
        userAgent: ['GPTBot', 'Google-Extended', 'ClaudeBot', 'PerplexityBot', 'CCBot'],
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
