/**
 * Awlad Yahya Factory - Dynamic Sitemap for Next.js / Modern Headless Stacks
 * Adheres to RULES.md Standard 5 (Technical SEO & GEO)
 */

export interface MetadataRouteSitemapItem {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://awladyahya.com';

export default async function sitemap(): Promise<MetadataRouteSitemapItem[]> {
  const currentDate = new Date().toISOString();

  // Static core routes
  const staticRoutes: MetadataRouteSitemapItem[] = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/royal-chair.html`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic products & categories routes fetched from Supabase / REST API
  let dynamicRoutes: MetadataRouteSitemapItem[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awladyahya-db.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      // Fetch products
      const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,updated_at&status=eq.active`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (prodRes.ok) {
        const products = await prodRes.json();
        const productUrls: MetadataRouteSitemapItem[] = products.map((p: { id: string; updated_at?: string }) => ({
          url: `${BASE_URL}/#product/${p.id}`,
          lastModified: p.updated_at || currentDate,
          changeFrequency: 'weekly',
          priority: 0.85,
        }));
        dynamicRoutes = dynamicRoutes.concat(productUrls);
      }

      // Fetch categories
      const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,updated_at&active=eq.true`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (catRes.ok) {
        const categories = await catRes.json();
        const categoryUrls: MetadataRouteSitemapItem[] = categories.map((c: { id: string; updated_at?: string }) => ({
          url: `${BASE_URL}/#category/${c.id}`,
          lastModified: c.updated_at || currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
        dynamicRoutes = dynamicRoutes.concat(categoryUrls);
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap from Supabase:', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
