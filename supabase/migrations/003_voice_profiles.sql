-- Voice Profiles Table
CREATE TABLE IF NOT EXISTS public.voice_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    mood_purpose TEXT,
    voice_id TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_profiles_user_id ON public.voice_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_is_active ON public.voice_profiles(user_id, is_active);

-- Trigger to update updated_at
CREATE TRIGGER update_voice_profiles_updated_at
    BEFORE UPDATE ON public.voice_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice profiles"
    ON public.voice_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice profiles"
    ON public.voice_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice profiles"
    ON public.voice_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice profiles"
    ON public.voice_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Function to ensure only one active profile per user
CREATE OR REPLACE FUNCTION set_active_voice_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        -- Deactivate all other profiles for this user
        UPDATE public.voice_profiles
        SET is_active = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one active profile
CREATE TRIGGER ensure_single_active_profile
    BEFORE INSERT OR UPDATE ON public.voice_profiles
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION set_active_voice_profile();
