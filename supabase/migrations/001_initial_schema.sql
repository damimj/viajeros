-- ============================================================================
-- Viajeros — Initial Database Schema
-- Translated from TravelMap (MySQL) to Supabase Postgres
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
-- pgcrypto is already enabled in Supabase by default (for gen_random_uuid)

-- ============================================================================
-- TABLE: admins
-- Maps auth.users to admin role. Single-user: only one row expected.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.admins IS 'Maps Supabase Auth users to admin role. Single-user setup.';

-- ============================================================================
-- TABLE: trips
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE,
  end_date    DATE,
  color_hex   TEXT DEFAULT '#3388ff',
  status      TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'planned')),
  show_routes_in_timeline BOOLEAN DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON public.trips(start_date, end_date);

COMMENT ON TABLE public.trips IS 'Travel entries with title, dates, color, and publish state.';

-- ============================================================================
-- TABLE: routes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  transport_type  TEXT NOT NULL CHECK (transport_type IN (
                    'plane', 'car', 'bike', 'walk', 'ship', 'train', 'bus', 'aerial'
                  )),
  geojson_data    JSONB NOT NULL,
  is_round_trip   BOOLEAN DEFAULT TRUE,
  distance_meters INTEGER DEFAULT 0,
  color           TEXT DEFAULT '#3388ff',
  name            TEXT,
  description     TEXT,
  image_path      TEXT,
  start_datetime  TIMESTAMPTZ,
  end_datetime    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routes_trip_id ON public.routes(trip_id);

COMMENT ON TABLE public.routes IS 'GeoJSON routes per trip with transport type.';

-- ============================================================================
-- TABLE: points_of_interest
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.points_of_interest (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL CHECK (type IN ('stay', 'visit', 'food', 'waypoint')),
  icon        TEXT DEFAULT 'default',
  image_path  TEXT,
  latitude    NUMERIC(10, 8) NOT NULL,
  longitude   NUMERIC(11, 8) NOT NULL,
  visit_date  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poi_trip_id ON public.points_of_interest(trip_id);
CREATE INDEX IF NOT EXISTS idx_poi_type ON public.points_of_interest(type);
CREATE INDEX IF NOT EXISTS idx_poi_coordinates ON public.points_of_interest(latitude, longitude);

COMMENT ON TABLE public.points_of_interest IS 'Points of interest / stays with coordinates and images.';

-- ============================================================================
-- TABLE: trip_tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trip_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  tag_name    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_trip_tags_trip_id ON public.trip_tags(trip_id);

COMMENT ON TABLE public.trip_tags IS 'Tags for organizing trips.';

-- ============================================================================
-- TABLE: settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type  TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(setting_key);

COMMENT ON TABLE public.settings IS 'Key-value global configuration.';

-- ============================================================================
-- TABLE: geocode_cache
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.geocode_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude      NUMERIC(10, 6) NOT NULL,
  longitude     NUMERIC(11, 6) NOT NULL,
  city          TEXT NOT NULL,
  display_name  TEXT,
  country       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  expires_at    TIMESTAMPTZ,
  UNIQUE(latitude, longitude)
);

CREATE INDEX IF NOT EXISTS idx_geocode_expires ON public.geocode_cache(expires_at);

COMMENT ON TABLE public.geocode_cache IS 'Cache for reverse geocoding results (Nominatim).';

-- ============================================================================
-- TABLE: links
-- Polymorphic links for entities (poi, route, trip)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('poi', 'route', 'trip')),
  entity_id     UUID NOT NULL,
  link_type     TEXT NOT NULL DEFAULT 'website' CHECK (link_type IN (
                  'website', 'google_maps', 'instagram', 'facebook',
                  'twitter', 'tripadvisor', 'booking', 'airbnb',
                  'youtube', 'wikipedia', 'google_photos', 'other'
                )),
  url           TEXT NOT NULL,
  label         TEXT,
  sort_order    SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_entity ON public.links(entity_type, entity_id);

COMMENT ON TABLE public.links IS 'External links for POIs, routes, and trips.';

-- ============================================================================
-- FUNCTION: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at_trips
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_routes
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_poi
  BEFORE UPDATE ON public.points_of_interest
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_settings
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- HELPER FUNCTION: check if current user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- --- admins ---
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins readable by the admin themselves"
  ON public.admins FOR SELECT
  USING (auth_user_id = auth.uid());

-- No INSERT/UPDATE/DELETE via client — managed via service_role or SQL editor

-- --- trips ---
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published trips are publicly readable"
  ON public.trips FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admin can insert trips"
  ON public.trips FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update trips"
  ON public.trips FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete trips"
  ON public.trips FOR DELETE
  USING (public.is_admin());

-- --- routes ---
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routes readable when trip is published"
  ON public.routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = routes.trip_id
      AND (trips.status = 'published' OR public.is_admin())
    )
  );

CREATE POLICY "Admin can insert routes"
  ON public.routes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update routes"
  ON public.routes FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete routes"
  ON public.routes FOR DELETE
  USING (public.is_admin());

-- --- points_of_interest ---
ALTER TABLE public.points_of_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "POIs readable when trip is published"
  ON public.points_of_interest FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = points_of_interest.trip_id
      AND (trips.status = 'published' OR public.is_admin())
    )
  );

CREATE POLICY "Admin can insert POIs"
  ON public.points_of_interest FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update POIs"
  ON public.points_of_interest FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete POIs"
  ON public.points_of_interest FOR DELETE
  USING (public.is_admin());

-- --- trip_tags ---
ALTER TABLE public.trip_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags readable when trip is published"
  ON public.trip_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_tags.trip_id
      AND (trips.status = 'published' OR public.is_admin())
    )
  );

CREATE POLICY "Admin can insert tags"
  ON public.trip_tags FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update tags"
  ON public.trip_tags FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete tags"
  ON public.trip_tags FOR DELETE
  USING (public.is_admin());

-- --- settings ---
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
  ON public.settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update settings"
  ON public.settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete settings"
  ON public.settings FOR DELETE
  USING (public.is_admin());

-- --- geocode_cache ---
ALTER TABLE public.geocode_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geocode cache is publicly readable"
  ON public.geocode_cache FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can manage geocode cache"
  ON public.geocode_cache FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- --- links ---
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Links are publicly readable"
  ON public.links FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can insert links"
  ON public.links FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update links"
  ON public.links FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete links"
  ON public.links FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- SEED DATA: default settings (matches original TravelMap)
-- ============================================================================
INSERT INTO public.settings (setting_key, setting_value, setting_type, description) VALUES
  ('max_upload_size', '8388608', 'number', 'Max upload size in bytes (8MB default)'),
  ('session_lifetime', '86400', 'number', 'Session lifetime in seconds (24 hours default)'),
  ('timezone', 'UTC', 'string', 'System timezone'),
  ('map_cluster_enabled', 'true', 'boolean', 'Enable point clustering on public map'),
  ('map_cluster_max_radius', '30', 'number', 'Max cluster radius in pixels'),
  ('map_cluster_disable_at_zoom', '15', 'number', 'Zoom level to disable clustering'),
  ('transport_color_plane', '#FF4444', 'string', 'Route color: plane'),
  ('transport_color_ship', '#00AAAA', 'string', 'Route color: ship'),
  ('transport_color_car', '#4444FF', 'string', 'Route color: car'),
  ('transport_color_bike', '#b88907', 'string', 'Route color: bike'),
  ('transport_color_train', '#FF8800', 'string', 'Route color: train'),
  ('transport_color_walk', '#44FF44', 'string', 'Route color: walk'),
  ('transport_color_bus', '#9C27B0', 'string', 'Route color: bus'),
  ('transport_color_aerial', '#E91E63', 'string', 'Route color: aerial'),
  ('image_max_width', '1920', 'number', 'Max image width in pixels'),
  ('image_max_height', '1080', 'number', 'Max image height in pixels'),
  ('image_quality', '85', 'number', 'JPEG compression quality (0-100)'),
  ('site_title', 'Viajeros', 'string', 'Public site title'),
  ('site_description', 'Interactive travel diary with maps, routes, and points of interest.', 'string', 'Site description for SEO'),
  ('site_favicon', '', 'string', 'Favicon URL'),
  ('site_analytics_code', '', 'string', 'Google Analytics or other analytics script'),
  ('trip_tags_enabled', 'true', 'boolean', 'Enable tag system for trips'),
  ('distance_unit', 'km', 'string', 'Distance unit (km or mi)'),
  ('default_language', 'en', 'string', 'Default site language (en, es)'),
  ('map_style', 'voyager', 'string', 'Map base style (positron, voyager, dark-matter, osm-liberty)'),
  ('thumbnail_max_width', '400', 'number', 'Max thumbnail width in pixels'),
  ('thumbnail_max_height', '300', 'number', 'Max thumbnail height in pixels'),
  ('thumbnail_quality', '80', 'number', 'Thumbnail JPEG quality (0-100)'),
  ('trip_timeline_show_routes', 'false', 'boolean', 'Show routes in trip timeline by default')
ON CONFLICT (setting_key) DO NOTHING;
