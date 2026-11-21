-- =============================================================================
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
-- 10. Database Optimization & Performance Indexes (RULES.md Standard)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_faq_display_order ON faq_items(display_order);

-- =============================================================================
-- SEED DATA: Categories
-- =============================================================================
INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)
VALUES ('BC', 'كراسي حلاقة وكوافير', 'كراسي حلاقة رجالي و كراسى كوافير حريمى وصالونات تجميل بمواصفات احترافية', 'assets/categories/barber-chairs.webp', 1, true, true, 'كراسي حلاقة وكوافير | مصنع أولاد يحيى', 'أفضل تشكيلة كراسي حلاقة هيدروليك وكوافير في مصر من مصنع أولاد يحيى بتصنيع عالي الجودة, كراسى حلاقه لوكس و ثابت و كراسى باكم.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)
VALUES ('KC', 'كراسي أطفال', 'كراسي حلاقة مخصصة للأطفال بتصميمات جذابة وآمنة', 'assets/categories/kids-chairs.webp', 2, true, false, 'كراسي حلاقة أطفال | مصنع أولاد يحيى', 'تشكيلة كراسي حلاقة أطفال بأمان تام وتصميمات تناسب صالونات الحلاقة.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)
VALUES ('SH', 'أحواض غسيل الشعر', 'أحواض غسيل شعر وسيراميك متين لصالونات التجميل والحلاقة', 'assets/categories/shampoo-units.webp', 3, true, true, 'أحواض غسيل شعر وصالونات | أولاد يحيى', 'وحدات غسيل شعر متكاملة مع احواض بورسلين وخامات مقاومة للمياه.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)
VALUES ('CH', 'شيزلونجات', 'شيزلونجات مساج وتنظيف بشرة متعددة الاستخدامات', 'assets/categories/chaise-lounges.webp', 4, true, false, 'شيزلونجات صالونات ومراكز تجميل | أولاد يحيى', 'شيزلونجات احترافية لصالونات التجميل ومراكز العناية.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO categories (id, name, description, image, display_order, active, featured, seo_title, seo_description)
VALUES ('EQ', 'مستلزمات وتجهيزات الصالونات', 'تجهيزات ومعدات متكاملة لافتتاح وتجديد صالونات الحلاقة', 'assets/categories/equipment.webp', 5, true, false, 'تجهيزات ومعدات صالونات حلاقة | أولاد يحيى', 'كافة مستلزمات وتجهيزات صالونات الحلاقة ومراكز التجميل من المصنع مباشرة.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;


-- =============================================================================
-- SEED DATA: Products
-- =============================================================================
INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-031', 'AY-28', 'ملكى حديث فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 1, '8700', 'Yes', 'assets/products/BC-031/main.webp', '["assets/products/BC-031/main.webp","assets/products/BC-031/angle-1.jpg","assets/products/BC-031/angle-2.jpg"]'::jsonb, 'مضخة هيدروليك دائرية قوية، دوران 360 درجة، نظام إمالة ظهر هيدروليكي متعدد المستويات، مسند رأس قابل للتعديل والفك، مسند أرجل متين مدعم بكاوتش مانع للانزلاق', 'شاسيه حديد ثقيل معالج عالي الصلابة، إكسسوارات وقاعدة صينية نيكل كروم ثقيلة ، فوم وإسفنج كابوتنيه عالي الكثافة، جلد فاخر مستورد معالج ضد التقشير والتشقق', '', 'Yes', 'مرحباً، أود الاستفسار عن كود المنتج: AY-05 (الكرسي الملكي المصري الكلاسيك هيدروليك) المعروض على موقعكم.', 'كرسي حلاقة رجالي كلاسيك الملكي المصري هيدروليك | مصنع أولاد يحيى', 'اكتشف الكرسي الملكي المصري الكلاسيك من مصنع أولاد يحيى، تصميم بريميوم يجمع بين فخامة الكلاسيك وقوة التحمل، هيدروليك عالي الجودة ينافس المستورد وبأفضل سعر مصنع في مصر.', 'كرسي حلاقة كلاسيك، الكرسي الملكي المصري، كراسي حلاقة رجالي، كرسي حلاقة هيدروليك، مصنع أولاد يحيى، تجهيز صالونات حلاقة، كراسي باربر شوب، كراسي حلاقة مستوردة ومحلية')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-030', 'AY-27', 'ملكى مصرى كبير استانليس بالكامل ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 2, '12000', 'Yes', 'assets/products/BC-030/main.webp', '["assets/products/BC-030/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-032', 'AY-29', 'ملكى حديث ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 3, '10000', 'Yes', 'assets/products/BC-032/main.webp', '["assets/products/BC-032/main.webp","assets/products/BC-032/angle-1.jpg","assets/products/BC-032/angle-2.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-029', 'AY-26', 'ملكى مصرى كبير استانليس بالكامل فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 4, '11000', 'Yes', 'assets/products/BC-029/main.webp', '["assets/products/BC-029/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-003', 'AY-025', 'شبك ذهبى', 'BC', 'كراسي حلاقة وكوافير', 'كرسي حريمي موديل "الشبك" – لمسة شياكة وفخامة لصالونك من مصنع أولاد يحيى!
كرسي كوافير بتصميم عصري راقي مع طلاء PVD دهبي فخم وعالي الجودة، مزود بهيدروليك قوي وسلس، وتنجيد إسفنج عالي الكثافة مع جلد متين سهل التنظيف وضد التقشير ليتحمل ضغط الشغل اليومي ويدوم معاك سنين.', 'كرسي كوافير حريمي موديل "الشبك" الدهبي | مصنع أولاد يحيى لتصنيع كراسي الحلاقة

لو بتدوري/بتدور على قطعة تجمع بين الشياكة المطلقة والعملية والتحمل، كرسي "الشبك" هو الاختيار المثالي اللي هيضيف لمسة ديكور فاخرة لأي بيوتي سنتر أو صالون حريمي.

أهم مميزات ومواصفات الكرسي:

تصميم عصري مميز: ظهر بتصميم شبكي أنيق ومودرن مع خياطة كابوتنيه راقية على المقعد والمسند بتدي شكل شيك جداً ومريح في نفس الوقت.

طلاء دهبي PVD عالي الجودة: معالج بالكامل ضد الصدأ والخدوش ومقاوم للرطوبة والمواد الكيماوية عشان يفضل محتفظ بلمعته ورونقه على المدى الطويل.

هيدروليك قوي وسلس: بيتحمل الأوزان الثقيلة وبيديك تحكم مرن في الرفع والنزول بكل سهولة أثناء الشغل.

تنجيد وإسفنج عالي الكثافة: مريح جداً للزبونة في الجلسات الطويلة، ومبيبطش ولا يغير شكله مع كثرة الاستخدام.

جلد ممتاز وفاخر: خامة متينة جداً، ضد التقشير وسهل التنظيف والتعقيم بعد كل عميلة بدون ما يتأثر.

قاعدة متزنة وثابتة: صينية دائرية دهبية واسعة تضمن ثبات الكرسي 100% مع مسند مريح للقدمين.', 'Available', 'Yes', 5, '6000', 'Yes', 'assets/products/BC-03/main.webp', '["assets/products/BC-03/main.webp","assets/products/BC-03/angle-1.jpg"]'::jsonb, 'مضخة هيدروليك دائرية، دوران 360 درجة، إمالة حتى 135 درجة', '', 'أسود، بني، جملي, اوف وايت, كشمير', 'Yes', '', 'كرسي كوافير حريمي هيدروليك موديل الشبك دهبي PVD | مصنع أولاد يحيى', 'احصل على كرسي كوافير حريمي موديل الشبك هيدروليك من مصنع أولاد يحيى، طلاء PVD دهبي فاخر عالي الجودة ضد الصدأ، إسفنج عالي الكثافة وجلد متين سهل التنظيف وضد التقشير بأفضل سعر.', 'كرسي كوافير، كرسي كوافير حريمي، كرسي الشبك، كراسي صالونات تجميل، كراسي بيوتي سنتر، كرسي هيدروليك دهبي، طلاء PVD، مصنع أولاد يحيى، لوازم كوافير، تجهيز صالونات حريمي')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-009', 'AY-08', 'كرسى تفاحه دواسه كاوتش', 'BC', 'كراسي حلاقة وكوافير', 'كرسي حلاقة رجالي موديل "التفاحة" – الراحة والقوة اللي صالونك محتاجها من مصنع أولاد يحيى!

كرسي مصمم خصيصاً ليتحمل أقصى درجات ضغط الشغل اليومي، مزود بهيدروليك قوي وسلس، وإمكانية إمالة الظهر ومسند رأس متحرك لجلسات حلاقة وتنظيف بشرة مريحة جداً لزبونك، مع تنجيد إسفنج عالي الكثافة وجلد مستورد متين ومقاوم للتقشير.', 'كرسي حلاقة رجالي هيدروليك موديل "التفاحة" | تصنيع مصنع أولاد يحيى لكراسي الحلاقة

لو بتجهز صالون حلاقة رجالي وبتبحث عن المتانة والعملية والراحة الفائقة، موديل "التفاحة" هو خيارك الأنسب والأكثر اعتمادية؛ تصميم مريح ومدروس يدعم ظهر الزبون ويديك حرية وسهولة كاملة أثناء الشغل.

أهم مواصفات ومميزات الموديل:

هيدروليك فائق التحمل: بستم هيدروليك قوي ناعم في الحركة وسهل الرفع والنزول بدون أي مجهود، مع دوران 360 درجة وثبات تام.

إمالة الظهر وتعدد الأوضاع: إمكانية نزول الظهر بزاوية مريحة جداً لخدمات الدقن، الفتلة، وماسكات تنظيف البشرة.

مسند رأس متحرك (مخدة): قابلة للتعديل والرفع والنزول لتناسب كل أطوال الزبائن وتوفير أقصى درجات الراحة للرقبة.

تنجيد وإسفنج صب عالي الكثافة: إسفنج مريح وعملي يحتفظ بمرونته وارتفاعه ومبيبطش مع كثرة الاستخدام والسنوات.

جلد صناعي عالي الجودة: خامة ممتازة مقاومة للتشقق والتقشير، سهلة المسح والتعقيم المستمر ومقاومة للمياه والمواد المستخدمة في الصالون.

قاعدة حديد مدعمة بالكروم: صينية دائرية ثقيلة تضمن اتزان الكرسي التام وعدم اهتزازه مع مسند قدم قوي ومريح.

📞 للحجز والاستفسار وطلب الأوردر مباشرة:

تواصل معنا عبر الهاتف أو واتساب: 201008355616+

🌐 لمشاهدة أحدث موديلاتنا وتحميل الكتالوج بالكامل:

https://wa.me/c/201064116703

📲 صفحتنا الرسمية على فيسبوك:

https://www.facebook.com/YahiaSonsCosmetics

📢 تابع عروضنا وخامات المصنع على التليجرام:

https://t.me/YahiaSons', 'Available', 'Yes', 6, '5500', 'Yes', 'assets/products/BC-09/main.webp', '["assets/products/BC-09/main.webp"]'::jsonb, 'هيدروليك رفع وخفض سلس، دوران 360 درجة، إمكانية إمالة الظهر لمستويات متعددة، مسند رأس متحرك وقابل للتعديل، مسند قدم متين ومريح', 'شاسيه حديد متين عالي التحمل، قاعدة دائرية كروم ثقيلة مضادة للانزلاق، جلد مستورد فاخر ضد التقشير وسهل التنظيف، إسفنج سوفت عالي الكثافة', 'أسود، بني، جملي, اوف وايت, كشمير', 'Yes', 'مرحباً، أود الاستفسار عن رسى التفاحه (كرسي حلاقة رجالي موديل التفاحة هيدروليك) المعروض على موقعكم.', 'كرسي حلاقة رجالي هيدروليك موديل التفاحة | مصنع أولاد يحيى', 'اشتري كرسي حلاقة رجالي موديل التفاحة هيدروليك من مصنع أولاد يحيى، شاسيه حديد قوي، إمالة ظهر ومسند رأس متحرك، إسفنج عالي الكثافة وجلد فاخر يتحمل ضغط الشغل بأفضل سعر مصنع.', 'كرسي حلاقة، كرسي حلاقة رجالي، كرسي التفاحة، كراسي صالونات حلاقة، كرسي هيدروليك، مصنع أولاد يحيى، تجهيز صالونات رجالي، كراسي حلاقة هيدروليك، لوازم كوافير وحلاقة')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-010', 'AY-09', 'تمساح دواسه معدن', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 7, '5400', 'Yes', 'assets/products/BC-010/main.webp', '["assets/products/BC-010/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-012', 'AY-12', 'كريستال دواسه كوتش', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 8, '5900', 'Yes', 'assets/products/BC-012/main.webp', '["assets/products/BC-012/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-013', 'AY-13', 'كرسي رويال هيدروليك مدور (Royal Round) ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 9, '7200', 'Yes', 'assets/products/BC-013/main.webp', '["assets/products/BC-013/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-014', 'AY-13B', 'كرسي رويال هيدروليك مدور (Royal Round) فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 10, '6900', 'Yes', 'assets/products/BC-014/main.webp', '["assets/products/BC-014/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-001', 'AY-01', 'كرسى ثابت عادى', 'BC', 'كراسي حلاقة وكوافير', 'الكرسى الدبابه الثابت , خامات قويه و يعيش سنين, مناسب لصالونات الحلاقة الرجالي.', 'كرسي حلاقة رجالي , الكرسى الدبابه صُمم خصيصًا ليتحمل ضغط الشغل الشاق والمستمر داخل الصالونات المزدحمة. يعتمد الكرسي على شاسيه حديد متين وقاعدة ثابتة تمنحه أقصى درجات الاتزان والأمان أثناء العمل اليومي، مع خامات عالية الجودة  تضمن بقاءه لسنوات طويلة دون تأثر. مزود بتنجيد مريح وفوم كثيف لتوفير راحة مثالية للزبون أثناء جلسات الحلاقة الطويلة، ليكون الاستثمار الأضمن والعملي لكل صاحب صالون يبحث عن القوة والاعتمادية دون قلق من الأعطال.', 'Available', 'No', 11, '2650', 'Yes', 'assets/products/BC-01/main.webp', '["assets/products/BC-01/main.webp"]'::jsonb, '', 'شاسيه حديد معالج، جلد صناعي عالي التحمل، فوم كثافة عالية', 'أسود، بني، جملي', 'Yes', 'مرحبًا، أود الاستفسار عن كود المنتج: AY-01 (كرسى ثابت عادى) المعروض على موقعكم.', 'كرسي حلاقة كلاسيك هيدروليك | مصنع أولاد يحيى', 'احصل على كرسي حلاقة كلاسيك هيدروليك من مصنع أولاد يحيى. متانة عالية وتصميم مريح.', 'كرسي حلاقة, كراسي صالونات, كراسي هيدروليك, أولاد يحيى')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-002', 'AY-02', 'كرسى لوكس دواسه عريضه', 'BC', 'كراسي حلاقة وكوافير', 'كرسى لوكس دواسه عريضه - كرسى عملى و اقتصادى', 'كرسي حلاقة رجالي , الكرسى اللوكس , صُمم خصيصًا ليتحمل ضغط الشغل الشاق والمستمر داخل الصالونات المزدحمة. يعتمد الكرسي على شاسيه حديد متين وقاعدة ثابتة تمنحه أقصى درجات الاتزان والأمان أثناء العمل اليومي، مع خامات عالية الجودة  تضمن بقاءه لسنوات طويلة دون تأثر. مزود بتنجيد مريح وفوم كثيف لتوفير راحة مثالية للزبون أثناء جلسات الحلاقة الطويلة، ليكون الاستثمار الأضمن والعملي لكل صاحب صالون يبحث عن القوة والاعتمادية دون قلق من الأعطال.', 'Available', 'No', 12, '2900', 'Yes', 'assets/products/BC-02/main.webp', '["assets/products/BC-02/main.webp"]'::jsonb, '', 'جلد فاخر، قاعدة نيكل كروم', 'أسود، رمادي، بيج', 'Yes', 'مرحبًا، أود الاستفسار عن كود المنتج: AY-02 (كرسى لوكس دواسه عريضه) المعروض على موقعكم.', 'كرسي كوافير عصري | مصنع أولاد يحيى', 'كرسي كوافير وصالونات تجميل بتصميم حديث وجودة تصنيع مصرية فائقة.', 'كرسي كوافير, كراسي تجميل, صالونات حريمي')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-016', 'AY-14', 'موزه باكم كبير ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 13, '6500', 'Yes', 'assets/products/BC-016/main.webp', '["assets/products/BC-016/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-019', 'AY-16', 'موزه باكم كبير فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 14, '6000', 'Yes', 'assets/products/BC-019/main.webp', '["assets/products/BC-019/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-020', 'AY-17', 'موزه حريمى فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 15, '5500', 'Yes', 'assets/products/BC-020/main.webp', '["assets/products/BC-020/main.webp","assets/products/BC-012/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-018', 'AY-15', 'موزه حريمى ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 16, '5900', 'Yes', 'assets/products/BC-018/main.webp', '["assets/products/BC-018/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-021', 'AY-19', 'مربع يد استانليس باكم حريمى فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 17, '5500', 'Yes', 'assets/products/BC-021/main.webp', '["assets/products/BC-021/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-022', 'AY-20', 'مربع يد استانليس باكم كبير فضى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 18, '6000', 'Yes', 'assets/products/BC-022/main.webp', '["assets/products/BC-022/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-025', 'AY-23', 'مربع اقتصادى فضى اسود', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 19, '3900', 'Yes', 'assets/products/BC-025/main.webp', '["assets/products/BC-025/main.webp","assets/products/BC-025/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-026', 'AY-23B', 'مربع اقتصادى فضى جلد مختلف', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 20, '4000', 'Yes', 'assets/products/BC-026/main.webp', '["assets/products/BC-026/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-023', 'AY-21', 'مربع يد استانليس باكم حريمى ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 21, '5900', 'Yes', 'assets/products/BC-023/main.webp', '["assets/products/BC-023/main.webp","assets/products/BC-023/detail.jpg","assets/products/BC-023/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-024', 'AY-22', 'مربع يد استالنليس باكم كبير ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 22, '6400', 'Yes', 'assets/products/BC-024/main.webp', '["assets/products/BC-024/main.webp","assets/products/BC-024/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-028', 'AY-23GOLD', 'مربع اقتصادى ذهبى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 23, '4100', 'Yes', 'assets/products/BC-028/main.webp', '["assets/products/BC-028/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-033', 'AY-34', 'كرسى الورده', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 24, '4400', 'Yes', 'assets/products/BC-033/main.webp', '["assets/products/BC-033/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-034', 'AY-35', 'كرسى الفنجان', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'Yes', 25, '4500', 'Yes', 'assets/products/BC-034/main.webp', '["assets/products/BC-034/main.webp","assets/products/BC-034/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('CH-01', 'AY-B1', 'شازلونج', 'CH', 'شيزلونجات', '', '', 'Available', 'No', 26, '3300', 'Yes', 'assets/products/CH-01/main.webp', '["assets/products/CH-01/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('CH-02', 'AY-C01', 'كرسى قاعده نجمه للشازلونج', 'CH', 'شيزلونجات', '', '', 'Available', 'No', 27, '1500', 'Yes', 'assets/products/CH-02/main.webp', '["assets/products/CH-02/main.webp","assets/products/CH-02/angle-1.jpg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-036', 'AY-LUX31', 'طياره بنتلى', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Available', 'No', 28, '11000', 'Yes', 'assets/products/BC-036/main.webp', '["assets/products/BC-036/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('CH-03', 'AY-P01', 'كرسى بدكير بالبف', 'CH', 'شيزلونجات', '', '', 'Available', 'No', 29, '5500', 'Yes', 'assets/products/CH-03/main.webp', '["assets/products/CH-03/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('SH-02', 'AY-W02', 'حوض غسيل بورسلين ذهبى', 'SH', 'أحواض غسيل الشعر', '', '', 'Available', 'No', 30, '7000', 'Yes', 'assets/products/SH-02/main.webp', '["assets/products/SH-02/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('SH-03', 'AY-W03', 'حوض غسيل بورسلين فضى', 'SH', 'أحواض غسيل الشعر', '', '', 'Available', 'No', 31, '6900', 'Yes', 'assets/products/SH-03/main.webp', '["assets/products/SH-03/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('SH-04', 'AY-W04', 'حوض غسيل بورسلين بدون اكسسوار', 'SH', 'أحواض غسيل الشعر', '', '', 'Available', 'No', 32, '6600', 'Yes', 'assets/products/SH-04/main.webp', '["assets/products/SH-04/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('SH-01', 'AY-W01', 'حوض غسيل شعبى', 'SH', 'أحواض غسيل الشعر', '', '', 'Available', 'No', 33, '2300', 'Yes', 'assets/products/SH-01/main.webp', '["assets/products/SH-01/main.webp"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('KC-001', 'AY-K01', 'كرسي حلاقة أطفال شكل سيارة ', 'KC', 'كراسي أطفال', 'كرسي حلاقة مخصص للأطفال على شكل سيارة ألعاب.', 'موديل اختباري لتوضيح منتجات الأطفال المزودة بأحزمة أمان وتأثيرات ضوئية وموسيقية لجذب الأطفال أثناء الحلاقة.', 'Available', 'Yes', 34, '6200', 'Yes', 'assets/products/KC-001/main.webp', '["assets/products/KC-001/main.webp","assets/products/KC-001/angle-1.jpg","assets/products/KC-001/angle-2.jpg"]'::jsonb, 'حزام أمان، مضخة رفع هيدروليك، أضواء وأصوات ترفيهية', 'فايبر جلاس مقوى، قاعدة حديد متينة', 'أحمر، أزرق، أصفر', 'No', 'مرحبًا، أود الاستفسار عن كود المنتج: AY-K01 (كرسي حلاقة أطفال شكل سيارة ) المعروض على موقعكم.', 'كرسي حلاقة أطفال سيارة | مصنع أولاد يحيى', 'كرسي حلاقة أطفال بتصميم جذاب وأمان تام لتسهيل عمل الحلاق وتسلية الأطفال.', 'كرسي حلاقة أطفال, كراسي أطفال صالونات, أولاد يحيى')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-017', 'AY-14C', 'كرسى موزه', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '6000', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-007', 'AY-06', 'دبابه فك وتركيب بالكامل دواسه كاوتش', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '3700', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-008', 'AY-07', 'تفاحه دواسه معدن', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '5400', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-011', 'AY-11', 'كريستال دواسه معدن', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '5800', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-006', 'AY-05', 'كرسى لوكس دواسه كوتش ثابت', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '3500', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-035', 'AY-LUX30', 'ملكى حديث', 'BC', 'كراسي حلاقة وكوافير', 'الكرسي الملكي المصري الكلاسيك – الفخامة البريميوم اللي حققت المعادلة الصعبة من مصنع أولاد يحيى!

تحفة فنية بتصميم كلاسيكي ملكي يضيف هيبة وأناقة لأي باربر شوب؛ جودة تصنيع ومتانة تفوق المستورد، مزود ببستم هيدروليك سلس، إمالة ظهر كاملة لخدمات الدقن والتنظيف، وتنجيد كابوتنيه بإسفنج عالي الكثافة وجلد متين ضد التقشير بأعلى قيمة مقابل أفضل سعر.', 'الكرسي الملكي المصري الكلاسيك | مصنع أولاد يحيى لتصنيع كراسي الحلاقة

الموديل اللي أثبت كفاءته وحقق المعادلة الصعبة: فخامة المظهر + قوة التحمل + سعر المصنع المباشر. صُمم الكرسي الملكي ليوفر تجربة حلاقة استثنائية من الدرجة الأولى لزبونك مع سهولة وتحكم كامل للحلاق أثناء ساعات العمل الطويلة.

أهم مواصفات ومميزات الموديل الملكي:

تصميم كلاسيكي ملكي (Premium Look): ظهر دائري أنيق وتطريز كابوتنيه ملوكي غائر يمنح الصالون طابع الفخامة والرقي، متوفر بألوان كلاسيكية متعددة (أسود مط، هافان، نبيتي معتق، بيج).

هيدروليك فائق الاعتمادية: بستم رفع وخفض ناعم وقوي جداً يتحمل الأوزان الثقيلة مع دوران كامل 360 درجة وثبات تام.

إمالة مرنة للظهر: ذراع تحكم جانبي يتيح نزول الظهر بزاوية استلقاء مريحة ومثالية لجلسات الدقن، الفتلة، والماسك وتنظيف البشرة.

مسند رأس مريح: مخدة رأس قابلة للرفع، التنزيل، أو الفك تماماً حسب طول العميل وراحة الرقبة.

تنجيد وإسفنج عالي الكثافة: إسفنج صب متين لا يهبط بمرور الوقت ويوفر راحة تدوم طوال فترة الجلسة.

جلد مستورد ضد التقشير: خامة جلد ممتازة شديدة التحمل ومقاومة للاحتكاك وسهلة التنظيف والتعقيم اليومي.

قاعدة صينية متزنة: قاعدة دائرية ثقيلة تمنع أي اهتزاز أثناء الشغل مع دعامات كاوتش سفلية لحماية الأرضيات ومنع الانزلاق.

📞 للحجز والاستفسار وطلب الأوردر:

تواصل معنا مباشرة عبر الهاتف أو واتساب: 201008355616+

🌐 لمشاهدة باقي موديلات المصنع والكتالوج بالكامل:

https://wa.me/c/201064116703

📲 تابعونا على صفحة الفيسبوك:

https://www.facebook.com/YahiaSonsCosmetics

📢 قناتنا الرسمية على التليجرام:

https://t.me/YahiaSons', 'Available', 'No', 999, '8700', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-004', 'AY-03', 'كرسى دبابه ثابت دواسه كوتش', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '3400', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;

INSERT INTO products (id, code, name, category, category_name, short_desc, full_description, status, featured, display_order, price, show_price, image, images, specifications, materials, available_colors, customization_available, whatsapp_message, seo_title, seo_description, keywords)
VALUES ('BC-005', 'AY-04', 'كرسى دبابه بيلف دواسه كوتش', 'BC', 'كراسي حلاقة وكوافير', '', '', 'Hidden', 'No', 999, '3650', 'Yes', 'assets/images/chair-mens-classic.svg', '["assets/images/chair-mens-classic.svg"]'::jsonb, '', '', '', 'Yes', '', '', '', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, show_price = EXCLUDED.show_price;


-- =============================================================================
-- SEED DATA: Site Content
-- =============================================================================
INSERT INTO site_content (id, section, data)
VALUES ('hero', 'hero', '{"badge":"مصنع أولاد يحيى لتجهيز صالونات الحلاقة والتجميل","title":"كراسي حلاقة ومعدات صالونات","titleGold":"بجودة تصنيع متقنة وضمان حقيقي","desc":"نصنع تجهيزات الصالونات بأعلى معايير المتانة والفخامة. كراسي هيدروليك، أحواض غسيل، وشيزلونجات بأسعار المصنع مباشرة وبدون وسيط.","ctaWhatsapp":"تواصل واطلب عبر واتساب","ctaCatalog":"استكشف معرض الموديلات","stat1Val":"15+","stat1Label":"عاماً من الخبرة الصناعية","stat2Val":"2000+","stat2Label":"صالون تم تجهيزه بنجاح","stat3Val":"100%","stat3Label":"خامات ومضخات معتمدة"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

INSERT INTO site_content (id, section, data)
VALUES ('about', 'about', '{"title":"ريادة وخبرة في تصنيع معدات الصالونات","desc":"مصنع أولاد يحيى هو أحد أبرز المصانع المصرية المتخصصة في تصنيع وتوريد كراسي الحلاقة ومعدات الكوافير وصالونات التجميل. نجمع بين دقة الحدادة والشاسيهات الفولاذية ونعومة التنجيد الفاخر لنقدم منتجاً يجمع بين المظهر الأنيق والتحمل الشاق طوال سنوات العمل.","mission":"تقديم منتج مصري ينافس المستورد في الجودة والسعر مع توافر فوري لقطع الغيار والصيانة.","features":[{"title":"شاسيهات فولاذية متينة","desc":"لحام ليزر وتشكيل دقيق لتحمل أقصى الأوزان والعمل الشاق."},{"title":"هيدروليك أصلي ناعم","desc":"مضخات هيدروليكية معتمدة تدوم لسنوات دون تسريب أو هبوط."},{"title":"تنجيد يدوي متقن","desc":"جلود مستوردة معالجة ضد الكيماويات والماء مع إسفنج محقون عالي الكثافة."}]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

INSERT INTO site_content (id, section, data)
VALUES ('contact', 'contact', '{"phone":"01008355616","whatsapp":"201064116703","whatsappCatalog":"https://wa.me/c/201064116703","telegram":"https://t.me/YahiaSons","facebook":"https://www.facebook.com/YahiaSonsCosmetics","address":"جمهورية مصر العربية — مصنع أولاد يحيى لتجهيز الصالونات","workingHours":"يومياً من 9:00 صباحاً حتى 10:00 مساءً ما عدا الجمعة"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

INSERT INTO site_content (id, section, data)
VALUES ('seo', 'seo', '{"title":"مصنع أولاد يحيى | تصنيع كراسي الحلاقة ومعدات الصالونات","desc":"المصنع الرائد لتصنيع وتوريد كراسي الحلاقة الهيدروليك، أحواض غسيل الشعر، الشيزلونجات، وتجهيزات الصالونات بأعلى جودة وضمان حقيقي.","keywords":"كراسي حلاقة, مصنع أولاد يحيى, كراسي كوافير, أحواض غسيل شعر, تجهيز صالونات, كراسي هيدروليك"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

