const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../js/products-data.js'), 'utf8');

// evaluate productsData and categoriesData in isolated sandbox
const sandbox = { window: {} };
eval(content.replace(/window\./g, 'sandbox.'));

const categories = sandbox.categoriesData || [];
const products = sandbox.productsData || [];

console.log(`Found ${categories.length} categories and ${products.length} products.`);

let sql = `-- =============================================================================
-- Awlad Yahya Factory - Supabase Database Schema & Initial Data
-- Project URL: https://jwpfuuebitmtnlruejkv.supabase.co
-- Generated automatically for Awlad Yahya Admin Dashboard
-- =============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS site_content CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS faq_items CASCADE;

-- 3. Categories Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    code TEXT,
    name TEXT NOT NULL,
    category TEXT REFERENCES categories(id) ON DELETE SET NULL,
    category_name TEXT,
    short_desc TEXT,
    full_description TEXT,
    status TEXT DEFAULT 'Available',
    featured TEXT DEFAULT 'No',
    display_order INTEGER DEFAULT 0,
    price TEXT,
    show_price TEXT DEFAULT 'Yes',
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    specifications TEXT,
    materials TEXT,
    available_colors TEXT,
    customization_available TEXT DEFAULT 'Yes',
    whatsapp_message TEXT,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Site Content CMS Table (Hero, About, Quality, WhyUs, Contact, SEO)
CREATE TABLE site_content (
    id TEXT PRIMARY KEY,
    section TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Media Library Table
CREATE TABLE media_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FAQ Items Table
CREATE TABLE faq_items (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- 9. Create Public Access Policies (Allow read and write with anon key)
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public write site_content" ON site_content FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read media_library" ON media_library FOR SELECT USING (true);
CREATE POLICY "Allow public write media_library" ON media_library FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read faq_items" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Allow public write faq_items" ON faq_items FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED DATA: Categories
-- =============================================================================
`;

for (const c of categories) {
    const esc = (s) => (s ? "'" + String(s).replace(/'/g, "''") + "'" : "NULL");
    sql += `INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)\n` +
           `VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.description)}, ${esc(c.image)}, ${c.displayOrder || 0}, ${c.active !== false}, ${c.featured === true}, ${esc(c.seoTitle)}, ${esc(c.seoDescription)})\n` +
           `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;\n\n`;
}

sql += `\n-- =============================================================================\n-- SEED DATA: Products\n-- =============================================================================\n`;

for (const p of products) {
    const esc = (s) => (s !== undefined && s !== null ? "'" + String(s).replace(/'/g, "''") + "'" : "NULL");
    const jsonImages = JSON.stringify(p.images || [p.image]).replace(/'/g, "''");
    sql += `INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)\n` +
           `VALUES (${esc(p.id)}, ${esc(p.code)}, ${esc(p.name)}, ${esc(p.category)}, ${esc(p.categoryName)}, ${esc(p.shortDesc)}, ${esc(p.fullDescription)}, ${esc(p.status || 'Available')}, ${esc(p.featured || 'No')}, ${p.displayOrder || 0}, ${esc(p.price)}, ${esc(p.showPrice || 'Yes')}, ${esc(p.image)}, '${jsonImages}'::jsonb, ${esc(p.specifications)}, ${esc(p.materials)}, ${esc(p.availableColors)}, ${esc(p.customizationAvailable || 'Yes')}, ${esc(p.whatsAppMessage)}, ${esc(p.seoTitle)}, ${esc(p.seoDescription)}, ${esc(p.keywords)})\n` +
           `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;\n\n`;
}

// Initial site content seed
sql += `\n-- =============================================================================\n-- SEED DATA: Site Content\n-- =============================================================================\n`;

const defaultSiteContent = [
    {
        id: 'hero',
        section: 'hero',
        data: {
            badge: 'مصنع أولاد يحيى لتجهيز صالونات الحلاقة والتجميل',
            title: 'كراسي حلاقة ومعدات صالونات',
            titleGold: 'بجودة تصنيع متقنة وضمان حقيقي',
            desc: 'نصنع تجهيزات الصالونات بأعلى معايير المتانة والفخامة. كراسي هيدروليك، أحواض غسيل، وشيزلونجات بأسعار المصنع مباشرة وبدون وسيط.',
            ctaWhatsapp: 'تواصل واطلب عبر واتساب',
            ctaCatalog: 'استكشف معرض الموديلات',
            stat1Val: '15+', stat1Label: 'عاماً من الخبرة الصناعية',
            stat2Val: '2000+', stat2Label: 'صالون تم تجهيزه بنجاح',
            stat3Val: '100%', stat3Label: 'خامات ومضخات معتمدة'
        }
    },
    {
        id: 'about',
        section: 'about',
        data: {
            title: 'ريادة وخبرة في تصنيع معدات الصالونات',
            desc: 'مصنع أولاد يحيى هو أحد أبرز المصانع المصرية المتخصصة في تصنيع وتوريد كراسي الحلاقة ومعدات الكوافير وصالونات التجميل. نجمع بين دقة الحدادة والشاسيهات الفولاذية ونعومة التنجيد الفاخر لنقدم منتجاً يجمع بين المظهر الأنيق والتحمل الشاق طوال سنوات العمل.',
            mission: 'تقديم منتج مصري ينافس المستورد في الجودة والسعر مع توافر فوري لقطع الغيار والصيانة.',
            features: [
                { title: 'شاسيهات فولاذية متينة', desc: 'لحام ليزر وتشكيل دقيق لتحمل أقصى الأوزان والعمل الشاق.' },
                { title: 'هيدروليك أصلي ناعم', desc: 'مضخات هيدروليكية معتمدة تدوم لسنوات دون تسريب أو هبوط.' },
                { title: 'تنجيد يدوي متقن', desc: 'جلود مستوردة معالجة ضد الكيماويات والماء مع إسفنج محقون عالي الكثافة.' }
            ]
        }
    },
    {
        id: 'contact',
        section: 'contact',
        data: {
            phone: '01008355616',
            whatsapp: '201064116703',
            whatsappCatalog: 'https://wa.me/c/201064116703',
            telegram: 'https://t.me/YahiaSons',
            facebook: 'https://www.facebook.com/YahiaSonsCosmetics',
            address: 'جمهورية مصر العربية — مصنع أولاد يحيى لتجهيز الصالونات',
            workingHours: 'يومياً من 9:00 صباحاً حتى 10:00 مساءً ما عدا الجمعة'
        }
    },
    {
        id: 'seo',
        section: 'seo',
        data: {
            title: 'مصنع أولاد يحيى | تصنيع كراسي الحلاقة ومعدات الصالونات',
            desc: 'المصنع الرائد لتصنيع وتوريد كراسي الحلاقة الهيدروليك، أحواض غسيل الشعر، الشيزلونجات، وتجهيزات الصالونات بأعلى جودة وضمان حقيقي.',
            keywords: 'كراسي حلاقة, مصنع أولاد يحيى, كراسي كوافير, أحواض غسيل شعر, تجهيز صالونات, كراسي هيدروليك'
        }
    }
];

for (const sc of defaultSiteContent) {
    const escData = JSON.stringify(sc.data).replace(/'/g, "''");
    sql += `INSERT INTO site_content (id, section, data)\n` +
           `VALUES ('${sc.id}', '${sc.section}', '${escData}'::jsonb)\n` +
           `ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();\n\n`;
}

fs.writeFileSync(path.join(__dirname, '../data/supabase_schema.sql'), sql, 'utf8');
console.log('Successfully generated data/supabase_schema.sql');
