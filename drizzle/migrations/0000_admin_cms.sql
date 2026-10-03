-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Destinations
CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 150),
  description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 5000),
  image_url text NOT NULL CHECK (char_length(image_url) BETWEEN 1 AND 2000),
  location text NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
  country text NOT NULL DEFAULT '' CHECK (char_length(country) <= 120),
  category text NOT NULL DEFAULT 'Other' CHECK (char_length(category) <= 60),
  original_price bigint NOT NULL CHECK (original_price >= 0),
  discounted_price bigint CHECK (discounted_price IS NULL OR (discounted_price >= 0 AND discounted_price <= original_price)),
  duration text NOT NULL DEFAULT '' CHECK (char_length(duration) <= 60),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  highlights text[] NOT NULL DEFAULT '{}',
  inclusions text[] NOT NULL DEFAULT '{}',
  travel_styles text[] NOT NULL DEFAULT '{}',
  best_time text NOT NULL DEFAULT '' CHECK (char_length(best_time) <= 120),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destinations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active destinations are public; admins see all" ON public.destinations
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert destinations" ON public.destinations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update destinations" ON public.destinations
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete destinations" ON public.destinations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enquiries
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 120),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 5 AND 30),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  preferred_destination text NOT NULL DEFAULT '' CHECK (char_length(preferred_destination) <= 150),
  travel_date text NOT NULL DEFAULT '' CHECK (char_length(travel_date) <= 40),
  number_of_travellers text NOT NULL DEFAULT '' CHECK (char_length(number_of_travellers) <= 10),
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Converted', 'Closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'New');
CREATE POLICY "Admins can view enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  logo_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  linkedin text NOT NULL DEFAULT '',
  youtube text NOT NULL DEFAULT '',
  twitter text NOT NULL DEFAULT '',
  copyright_text text NOT NULL DEFAULT '',
  favicon_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are public" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id, logo_url, phone, email, whatsapp, address, copyright_text, favicon_url) VALUES (
  1,
  '/__l5e/assets-v1/82818b2e-559a-4147-987f-43d1948d0830/logo.png',
  '+91 99997 18183',
  'care@silvercircletravel.com',
  '919999718183',
  'Spaze I-Tech Park, Ninth Floor, Tower B-1, 958-960, Badshahpur Sohna Rd, Sector 49, Gurugram, Haryana 122018',
  '© Silver Circle Travel. All rights reserved.',
  '/favicon.png'
);

-- Existing destinations
INSERT INTO public.destinations (title, slug, description, image_url, location, country, category, original_price, duration, is_featured, is_active, highlights, inclusions, travel_styles, best_time, sort_order) VALUES
('Switzerland','switzerland','Lakeside towns, gentle mountain railways and unhurried Alpine mornings — Switzerland at a pace that suits you.','/__l5e/assets-v1/44a60991-f376-4c4c-b9dc-e66e3729ac3a/dest-switzerland.jpg','Interlaken, Switzerland','Switzerland','Europe',350000,'8N / 9D',true,true,ARRAY['Jungfraujoch by cog railway','Lake Lucerne cruise','Interlaken & Zermatt','Only 3 hotel changes'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','Visa assistance'],ARRAY['Scenic & Nature','Relaxed Leisure'],'April – September',1),
('France & Switzerland','france-switzerland','Paris in soft golden light, then the calm of the Alps — two classics joined by comfortable rail journeys.','/__l5e/assets-v1/7a7a1c58-29e2-4430-940a-ac0cc53a1a28/dest-france.jpg','Paris & Lucerne','France, Switzerland','Europe',300000,'9N / 10D',true,true,ARRAY['Seine dinner cruise','Eiffel Tower level 2','Alpine rail to Lucerne','Wheelchair-friendly routes'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','Schengen visa assistance'],ARRAY['Culture & Heritage','Scenic & Nature'],'April – October',2),
('Italy','italy','Rome, Florence and Venice with shorter drives, longer lunches and guides who never rush a single step.','/__l5e/assets-v1/21523d4e-59a1-4462-970f-5a91b884b5df/dest-italy.jpg','Rome, Florence & Venice','Italy','Europe',280000,'8N / 9D',true,true,ARRAY['Vatican skip-the-line','Private gondola ride','Tuscan countryside lunch','Indian meals arranged'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','Schengen visa assistance'],ARRAY['Culture & Heritage','Relaxed Leisure'],'March – October',3),
('United Kingdom','united-kingdom','London, Edinburgh and the countryside in between — English-speaking ease and familiar comforts throughout.','/__l5e/assets-v1/921ed6d9-ef93-44c2-b4e1-f16ef05ec3a0/dest-uk.jpg','London & Edinburgh','United Kingdom','Europe',270000,'8N / 9D',true,true,ARRAY['Thames cruise','Windsor Castle','Scottish Highlands day','Indian restaurants included'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','UK visa assistance'],ARRAY['Culture & Heritage','City & Comfort'],'May – September',4),
('Japan','japan','Cherry blossoms, calm gardens and immaculate bullet trains — the most senior-friendly country in Asia.','/__l5e/assets-v1/e605947c-c523-49d1-86c7-38e473663e04/dest-japan.jpg','Tokyo, Hakone & Kyoto','Japan','Asia',300000,'8N / 9D',false,true,ARRAY['Shinkansen reserved seats','Mt. Fuji & Hakone','Kyoto temple gardens','Vegetarian meals arranged'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','Visa assistance'],ARRAY['Culture & Heritage','Scenic & Nature'],'March – May, October – November',5),
('Singapore','singapore','Short flights, spotless streets and everything within easy reach — a gentle first international journey.','/__l5e/assets-v1/06b583b5-1977-490e-a4cf-57ac657932c2/dest-singapore.jpg','Singapore','Singapore','Asia',140000,'5N / 6D',false,true,ARRAY['Gardens by the Bay','Sentosa cable car','Night safari (seated tram)','Indian food everywhere'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing'],ARRAY['City & Comfort','Relaxed Leisure'],'Year round',6),
('Bali','bali','Rice terraces, temple mornings and long restful afternoons at a resort you will not want to leave.','/__l5e/assets-v1/25495011-78ac-4072-8988-36ce00cee696/dest-bali.jpg','Ubud & Seminyak, Bali','Indonesia','Asia',130000,'6N / 7D',false,true,ARRAY['Ubud terraces by car','Tanah Lot sunset','Two resorts only','In-resort Ayurvedic spa'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing'],ARRAY['Relaxed Leisure','Scenic & Nature'],'April – October',7),
('Thailand','thailand','Golden temples in Bangkok and quiet sea-view mornings in Phuket, with unhurried transfers between them.','/__l5e/assets-v1/78805cb6-0394-47f4-9d8d-ebc88415c2d3/dest-thailand.jpg','Bangkok & Phuket','Thailand','Asia',110000,'6N / 7D',false,true,ARRAY['Grand Palace guided walk','Chao Phraya dinner cruise','Seaview rooms','Jain & vegetarian menus'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing'],ARRAY['Relaxed Leisure','Culture & Heritage'],'November – March',8),
('Dubai','dubai','A short, luxurious break with air-conditioned comfort from arrival to departure — ideal for winter travel.','/__l5e/assets-v1/99ba8004-6ef0-4d5a-9a04-b31a0a24a4c3/dest-dubai.jpg','Dubai & Abu Dhabi','United Arab Emirates','Middle East',120000,'5N / 6D',false,true,ARRAY['Burj Khalifa level 124','Desert evening (soft-drive)','Dhow cruise','Abu Dhabi day trip'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','Visa assistance'],ARRAY['City & Comfort','Relaxed Leisure'],'October – March',9),
('Turkey','turkey','Istanbul''s grand mosques, Cappadocia''s balloons at sunrise and thermal terraces at Pamukkale.','/__l5e/assets-v1/512cfe23-2c31-43c6-9661-95b7e3e023f2/dest-turkey.jpg','Istanbul & Cappadocia','Turkey','Europe',210000,'8N / 9D',false,true,ARRAY['Hagia Sophia & Blue Mosque','Cappadocia balloon (optional)','Bosphorus cruise','Indian meals daily'],ARRAY['4/5-star stays','Comfortable private transfers','Selected meals','Guided sightseeing','Tour manager throughout','24x7 emergency support','Senior-friendly pacing','E-visa assistance'],ARRAY['Culture & Heritage','Scenic & Nature'],'April – June, September – November',10);
