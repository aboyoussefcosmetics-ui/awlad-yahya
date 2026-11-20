/**
 * =============================================================================
 * Awlad Yahya Factory - Supabase Client & Dynamic Data Synchronization
 * Handles both Supabase Cloud REST API and Offline LocalStorage Fallback
 * =============================================================================
 */

(function (window) {
  'use strict';

  // Default Supabase Project Credentials
  const DEFAULT_SUPABASE_URL = 'https://jwpfuuebitmtnlruejkv.supabase.co';
  const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_C2xiY1qcwqqX7v3n_PTdXg_CaQZT83Q';

  const STORAGE_KEY_URL = 'ay_supabase_url';
  const STORAGE_KEY_APIKEY = 'ay_supabase_key';
  const STORAGE_KEY_LOCAL_PRODUCTS = 'ay_local_products';
  const STORAGE_KEY_LOCAL_CATEGORIES = 'ay_local_categories';
  const STORAGE_KEY_LOCAL_CONTENT = 'ay_local_content';

  class SupabaseClient {
    constructor() {
      this.url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
      this.key = localStorage.getItem(STORAGE_KEY_APIKEY) || DEFAULT_PUBLISHABLE_KEY;
      this.isOnline = navigator.onLine;
      this.isConnected = false;
      this.lastError = null;

      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }

    // Set & Persist Credentials
    setCredentials(url, key) {
      if (url) {
        // Strip trailing slash and /rest/v1 if present
        let cleanUrl = url.trim().replace(/\/+$/, '');
        cleanUrl = cleanUrl.replace(/\/rest\/v1\/?$/, '');
        this.url = cleanUrl;
        localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
      }
      if (key) {
        this.key = key.trim();
        localStorage.setItem(STORAGE_KEY_APIKEY, key.trim());
      }
    }

    getRestEndpoint(table, query = '') {
      const base = this.url.replace(/\/+$/, '');
      const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
      return `${base}/rest/v1/${table}${q}`;
    }

    getHeaders(extra = {}) {
      return {
        'apikey': this.key,
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...extra
      };
    }

    // Ping / Test connection
    async testConnection() {
      try {
        if (!this.url || !this.key) {
          throw new Error('يرجى تحديد رابط Supabase ومفتاح الـ API أولاً.');
        }

        const endpoint = this.getRestEndpoint('categories', 'select=id&limit=1');
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (response.ok) {
          this.isConnected = true;
          this.lastError = null;
          return { success: true, status: response.status, message: 'الاتصال بـ Supabase متصل ونشط بنجاح!' };
        }

        if (response.status === 404) {
          this.isConnected = true; // Auth worked, but table not yet created
          return {
            success: true,
            needsSchema: true,
            status: 404,
            message: 'تم التحقق من صحة المفتاح، ولكن جداول قاعدة البيانات لم تُنشأ بعد. يرجى تشغيل كود الـ SQL المرفق داخل Supabase SQL Editor.'
          };
        }

        const errText = await response.text();
        this.isConnected = false;
        this.lastError = errText;
        return { success: false, status: response.status, message: `خطأ في الاتصال (${response.status}): ${errText}` };
      } catch (err) {
        this.isConnected = false;
        this.lastError = err.message;
        return { success: false, message: `تعذر الاتصال بالخادم: ${err.message}` };
      }
    }

    // ==========================================
    // 1. PRODUCTS API
    // ==========================================
    async getProducts() {
      try {
        const endpoint = this.getRestEndpoint('products', 'select=*&order=display_order.asc');
        const res = await fetch(endpoint, { headers: this.getHeaders() });
        if (res.ok) {
          const cloudData = await res.json();
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            // Normalize field names to match frontend (camelCase mapping if needed)
            const normalized = cloudData.map(this.normalizeProductFromDb);
            localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(normalized));
            return normalized;
          }
        }
      } catch (err) {
        console.warn('Supabase getProducts failed, falling back to cache:', err.message);
      }

      // Fallback 1: LocalStorage cache
      const cached = localStorage.getItem(STORAGE_KEY_LOCAL_PRODUCTS);
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }

      // Fallback 2: static window.productsData
      return (typeof window !== 'undefined' && Array.isArray(window.productsData)) ? window.productsData : [];
    }

    async saveProduct(product) {
      // 1. Update local cache immediately (Optimistic UI)
      const currentList = await this.getProducts();
      const existingIdx = currentList.findIndex(p => p.id === product.id);
      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...product };
      } else {
        currentList.push(product);
      }
      localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(currentList));

      // 2. Sync to Supabase
      try {
        const payload = this.normalizeProductToDb(product);
        const endpoint = this.getRestEndpoint('products', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.warn('Supabase saveProduct returned non-ok:', res.status, errBody);
          return { success: true, localOnly: true, error: errBody };
        }
        return { success: true, cloudSynced: true };
      } catch (err) {
        console.warn('Supabase saveProduct error:', err.message);
        return { success: true, localOnly: true, error: err.message };
      }
    }

    async deleteProduct(productId) {
      // 1. Remove from local cache
      const currentList = await this.getProducts();
      const filtered = currentList.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEY_LOCAL_PRODUCTS, JSON.stringify(filtered));

      // 2. Delete from Supabase
      try {
        const endpoint = this.getRestEndpoint('products', `id=eq.${encodeURIComponent(productId)}`);
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
        return { success: res.ok };
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err.message);
        return { success: true, localOnly: true };
      }
    }

    // ==========================================
    // 2. CATEGORIES API
    // ==========================================
    async getCategories() {
      try {
        const endpoint = this.getRestEndpoint('categories', 'select=*&order=display_order.asc');
        const res = await fetch(endpoint, { headers: this.getHeaders() });
        if (res.ok) {
          const cloudCats = await res.json();
          if (Array.isArray(cloudCats) && cloudCats.length > 0) {
            const normalized = cloudCats.map(this.normalizeCategoryFromDb);
            localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(normalized));
            return normalized;
          }
        }
      } catch (err) {
        console.warn('Supabase getCategories failed, falling back:', err.message);
      }

      const cached = localStorage.getItem(STORAGE_KEY_LOCAL_CATEGORIES);
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }

      return (typeof window !== 'undefined' && Array.isArray(window.categoriesData)) ? window.categoriesData : [];
    }

    async saveCategory(category) {
      const currentList = await this.getCategories();
      const idx = currentList.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], ...category };
      } else {
        currentList.push(category);
      }
      localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(currentList));

      try {
        const payload = this.normalizeCategoryToDb(category);
        const endpoint = this.getRestEndpoint('categories', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    async deleteCategory(categoryId) {
      const currentList = await this.getCategories();
      const filtered = currentList.filter(c => c.id !== categoryId);
      localStorage.setItem(STORAGE_KEY_LOCAL_CATEGORIES, JSON.stringify(filtered));

      try {
        const endpoint = this.getRestEndpoint('categories', `id=eq.${encodeURIComponent(categoryId)}`);
        const res = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    // ==========================================
    // 3. SITE CONTENT CMS (Hero, About, etc.)
    // ==========================================
    async getSiteContent(sectionId) {
      try {
        const query = sectionId ? `id=eq.${sectionId}&select=*` : 'select=*';
        const endpoint = this.getRestEndpoint('site_content', query);
        const res = await fetch(endpoint, { headers: this.getHeaders() });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            const map = {};
            list.forEach(row => { map[row.id] = row.data; });
            localStorage.setItem(STORAGE_KEY_LOCAL_CONTENT, JSON.stringify(map));
            return sectionId ? map[sectionId] : map;
          }
        }
      } catch (err) {}

      const cached = localStorage.getItem(STORAGE_KEY_LOCAL_CONTENT);
      if (cached) {
        try {
          const map = JSON.parse(cached);
          return sectionId ? map[sectionId] : map;
        } catch (e) {}
      }
      return null;
    }

    async saveSiteContent(sectionId, data) {
      // Local update
      let map = {};
      try {
        map = JSON.parse(localStorage.getItem(STORAGE_KEY_LOCAL_CONTENT) || '{}');
      } catch (e) {}
      map[sectionId] = data;
      localStorage.setItem(STORAGE_KEY_LOCAL_CONTENT, JSON.stringify(map));

      // Cloud update
      try {
        const payload = { id: sectionId, section: sectionId, data: data, updated_at: new Date().toISOString() };
        const endpoint = this.getRestEndpoint('site_content', 'on_conflict=id');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: this.getHeaders({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
          body: JSON.stringify(payload)
        });
        return { success: res.ok };
      } catch (err) {
        return { success: true, localOnly: true };
      }
    }

    // Helpers to map between DB and Frontend
    normalizeProductFromDb(db) {
      return {
        id: db.id,
        code: db.code || db.id,
        name: db.name || '',
        category: db.category || 'BC',
        categoryName: db.category_name || '',
        shortDesc: db.short_desc || '',
        fullDescription: db.full_description || '',
        status: db.status || 'Available',
        featured: db.featured || 'No',
        displayOrder: db.display_order || 0,
        price: db.price || '',
        showPrice: db.show_price || 'Yes',
        image: db.image || '',
        images: Array.isArray(db.images) ? db.images : (db.image ? [db.image] : []),
        specifications: db.specifications || '',
        materials: db.materials || '',
        availableColors: db.available_colors || '',
        customizationAvailable: db.customization_available || 'Yes',
        whatsAppMessage: db.whatsapp_message || '',
        seoTitle: db.seo_title || '',
        seoDescription: db.seo_description || '',
        keywords: db.keywords || ''
      };
    }

    normalizeProductToDb(p) {
      return {
        id: p.id,
        code: p.code || p.id,
        name: p.name || '',
        category: p.category || 'BC',
        category_name: p.categoryName || '',
        short_desc: p.shortDesc || '',
        full_description: p.fullDescription || '',
        status: p.status || 'Available',
        featured: p.featured || 'No',
        display_order: parseInt(p.displayOrder, 10) || 0,
        price: p.price ? String(p.price) : '',
        show_price: p.showPrice || 'Yes',
        image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
        images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
        specifications: p.specifications || '',
        materials: p.materials || '',
        available_colors: p.availableColors || '',
        customization_available: p.customizationAvailable || 'Yes',
        whatsapp_message: p.whatsAppMessage || '',
        seo_title: p.seoTitle || '',
        seo_description: p.seoDescription || '',
        keywords: p.keywords || '',
        updated_at: new Date().toISOString()
      };
    }

    normalizeCategoryFromDb(c) {
      return {
        id: c.id,
        name: c.name,
        description: c.description || '',
        image: c.image || '',
        displayOrder: c.display_order || 0,
        active: c.active !== false,
        featured: c.featured === true,
        seoTitle: c.seo_title || '',
        seoDescription: c.seo_description || ''
      };
    }

    normalizeCategoryToDb(c) {
      return {
        id: c.id,
        name: c.name,
        description: c.description || '',
        image: c.image || '',
        display_order: parseInt(c.displayOrder, 10) || 0,
        active: c.active !== false,
        featured: c.featured === true,
        seo_title: c.seoTitle || '',
        seo_description: c.seoDescription || '',
        updated_at: new Date().toISOString()
      };
    }
  }

  // Export globally
  window.AySupabase = new SupabaseClient();

})(typeof window !== 'undefined' ? window : this);
