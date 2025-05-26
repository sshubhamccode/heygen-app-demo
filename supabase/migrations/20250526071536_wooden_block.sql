/*
  # Database Schema Setup

  1. Tables
    - profiles (user profiles)
    - videos (processed videos)
    - avatar_generations (generated avatar videos)
  
  2. Functions
    - update_updated_at_column() for automatic timestamp updates
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
DROP TRIGGER IF EXISTS update_avatar_generations_updated_at ON avatar_generations;

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create videos table if not exists
CREATE TABLE IF NOT EXISTS videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    original_url text,
    processed_url text,
    target_language text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create avatar_generations table if not exists
CREATE TABLE IF NOT EXISTS avatar_generations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    avatar_id text NOT NULL,
    voice_id text NOT NULL,
    text text NOT NULL,
    video_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatar_generations_updated_at
    BEFORE UPDATE ON avatar_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_generations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create videos" ON videos;
DROP POLICY IF EXISTS "Users can read own videos" ON videos;
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
DROP POLICY IF EXISTS "Users can create avatar generations" ON avatar_generations;
DROP POLICY IF EXISTS "Users can read own avatar generations" ON avatar_generations;
DROP POLICY IF EXISTS "Users can update own avatar generations" ON avatar_generations;

-- Profiles policies
CREATE POLICY "Users can create own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Videos policies
CREATE POLICY "Users can create videos"
    ON videos FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own videos"
    ON videos FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
    ON videos FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Avatar generations policies
CREATE POLICY "Users can create avatar generations"
    ON avatar_generations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own avatar generations"
    ON avatar_generations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own avatar generations"
    ON avatar_generations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);