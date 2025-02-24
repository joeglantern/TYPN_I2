-- First create or modify tables
CREATE TABLE IF NOT EXISTS users (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    phone text,
    location text,
    occupation text,
    interests text[],
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    full_name text,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create membership_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS membership_applications (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL,
    motivation text NOT NULL,
    experience text NOT NULL,
    commitment_hours text NOT NULL,
    interests text[] NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
    reviewer_notes text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id bigserial PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id bigint NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS membership_applications_user_id_fkey ON membership_applications(user_id);
CREATE INDEX IF NOT EXISTS membership_applications_status_idx ON membership_applications(status);
CREATE INDEX IF NOT EXISTS membership_applications_created_at_idx ON membership_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "enable_users_read" ON users;
    DROP POLICY IF EXISTS "enable_users_update_own" ON users;
    DROP POLICY IF EXISTS "enable_users_insert_own" ON users;
    DROP POLICY IF EXISTS "enable_users_upsert_own" ON users;
    DROP POLICY IF EXISTS "enable_admin_all" ON users;
    DROP POLICY IF EXISTS "enable_applications_insert" ON membership_applications;
    DROP POLICY IF EXISTS "enable_applications_select" ON membership_applications;
    DROP POLICY IF EXISTS "enable_applications_update_admin" ON membership_applications;
    DROP POLICY IF EXISTS "enable_logs_select" ON activity_logs;
    DROP POLICY IF EXISTS "enable_logs_insert" ON activity_logs;
    DROP POLICY IF EXISTS "enable_admin_all_access" ON users;
    DROP POLICY IF EXISTS "enable_insert_application" ON membership_applications;
    DROP POLICY IF EXISTS "enable_view_own_application" ON membership_applications;
    DROP POLICY IF EXISTS "enable_admin_manage_applications" ON membership_applications;
    DROP POLICY IF EXISTS "membership_applications_insert_policy" ON membership_applications;
    DROP POLICY IF EXISTS "membership_applications_select_policy" ON membership_applications;
    DROP POLICY IF EXISTS "membership_applications_update_policy" ON membership_applications;
    DROP POLICY IF EXISTS "enable_users_select_all" ON users;
EXCEPTION
    WHEN undefined_table OR undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

-- Simple policy for users table
CREATE POLICY "users_policy"
    ON users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Simple policies for membership applications
CREATE POLICY "applications_policy"
    ON membership_applications
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_membership_applications_updated_at ON membership_applications;
CREATE TRIGGER update_membership_applications_updated_at
    BEFORE UPDATE ON membership_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cursor rules for preventing role changes
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS NOT NULL AND NEW.role != OLD.role AND auth.uid() != OLD.id THEN
        -- Only allow role changes by admins
        IF NOT EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        ) THEN
            RAISE EXCEPTION 'Not authorized to change user role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for role change prevention
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON users;
CREATE TRIGGER prevent_role_change_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_change(); 