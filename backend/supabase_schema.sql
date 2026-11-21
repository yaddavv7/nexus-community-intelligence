-- ====================================================================
-- NEXUS: AI-Powered Community Intelligence & Predictive Problem Management
-- Production Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ====================================================================

-- 1. Create Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'volunteer')),
    locality TEXT DEFAULT 'Kochi Central',
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
    id BIGSERIAL PRIMARY KEY,
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity INTEGER DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'verified', 'assigned', 'in_progress', 
        'resolved', 'closed', 'rejected', 'duplicate', 'reopened'
    )),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    locality_name VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    address VARCHAR(500),
    photo_url TEXT,
    completion_photo_url TEXT,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name VARCHAR(255) DEFAULT 'Anonymous Resident',
    is_anonymous BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    voice_transcript TEXT,
    assigned_department VARCHAR(100),
    assigned_to VARCHAR(255),
    confirmations_count INTEGER DEFAULT 0,
    evidence_count INTEGER DEFAULT 0,
    ai_confidence DOUBLE PRECISION DEFAULT 0.88,
    ai_reasoning TEXT,
    ai_recommendations JSONB,
    priority_score DOUBLE PRECISION DEFAULT 50.0,
    priority_breakdown JSONB,
    duplicate_of_id BIGINT REFERENCES public.incidents(id) ON DELETE SET NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes for lightning-fast geo and status filtering
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_locality ON public.incidents(locality_name);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_geo ON public.incidents(latitude, longitude);

-- 3. Incident History Updates
CREATE TABLE IF NOT EXISTS public.incident_updates (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) DEFAULT 'System',
    user_role VARCHAR(50) DEFAULT 'system',
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Incident Community Confirmations
CREATE TABLE IF NOT EXISTS public.incident_confirmations (
    id BIGSERIAL PRIMARY KEY,
    incident_id BIGINT REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    photo_url TEXT,
    still_present BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Duplicate Suggestions
CREATE TABLE IF NOT EXISTS public.duplicate_suggestions (
    id BIGSERIAL PRIMARY KEY,
    primary_incident_id BIGINT REFERENCES public.incidents(id) ON DELETE CASCADE,
    duplicate_incident_id BIGINT REFERENCES public.incidents(id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL,
    distance_meters DOUBLE PRECISION NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'suggested' CHECK (status IN ('suggested', 'merged', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Risk Assessments
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    locality_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    risk_type VARCHAR(100) NOT NULL,
    risk_level VARCHAR(50) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'severe')),
    risk_score DOUBLE PRECISION DEFAULT 65.0,
    rainfall_mm DOUBLE PRECISION DEFAULT 0.0,
    related_incidents_count INTEGER DEFAULT 1,
    evidence_summary TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    is_simulated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    incident_id BIGINT REFERENCES public.incidents(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) DEFAULT 'System',
    user_role VARCHAR(50) DEFAULT 'system',
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Incidents: Anyone authenticated or anonymous can view verified public incidents
CREATE POLICY "Public can view verified incidents" ON public.incidents
    FOR SELECT USING (status != 'rejected' OR auth.jwt() ->> 'role' = 'admin');

-- Citizens can insert new reports
CREATE POLICY "Users can create reports" ON public.incidents
    FOR INSERT WITH CHECK (true);

-- Admins and assigned volunteers can update incidents
CREATE POLICY "Admins and field teams can update incidents" ON public.incidents
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('admin', 'volunteer')
        OR auth.uid() = reporter_id
    );

-- Audit logs: Read-only for admins
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
