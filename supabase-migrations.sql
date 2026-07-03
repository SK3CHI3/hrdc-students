-- ============================================
-- HR Student Organisation - Complete Database Migration
-- ============================================
-- This migration drops all existing tables and recreates everything
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: DROP EXISTING TABLES AND FUNCTIONS
-- ============================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_student_insert ON students;

-- Drop functions
DROP FUNCTION IF EXISTS generate_student_code() CASCADE;
DROP FUNCTION IF EXISTS set_student_code() CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES
-- ============================================

-- Institutions table (universities and colleges)
CREATE TABLE institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('university', 'college')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students profile table (extends auth.users)
CREATE TABLE students (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  referral_code TEXT,
  registration_number TEXT,
  linkedin_url TEXT,
  unique_student_code TEXT UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate unique student code
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := 'HRS-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    SELECT EXISTS(SELECT 1 FROM students WHERE unique_student_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-generate code on student creation
CREATE OR REPLACE FUNCTION set_student_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_student_code IS NULL THEN
    NEW.unique_student_code := generate_student_code();
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_student_insert
  BEFORE INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION set_student_code();

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- Institutions: anyone (including anonymous) can read for registration
CREATE POLICY "Anyone can view institutions"
  ON institutions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Institutions: only super admins can insert/update/delete
CREATE POLICY "Super admins can manage institutions"
  ON institutions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_super_admin = true)
  );

-- Students: can read own profile
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Students: can insert own profile (allow any authenticated user to create a profile)
CREATE POLICY "Students can create own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Students: can update own profile
CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Students: super admins can do everything
CREATE POLICY "Super admins can manage all students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_super_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND is_super_admin = true)
  );

-- Admins: can read own record
CREATE POLICY "Admins can view own record"
  ON admins FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins: super admins can manage all
CREATE POLICY "Super admins can manage admins"
  ON admins FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admins a WHERE a.id = auth.uid() AND a.is_super_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins a WHERE a.id = auth.uid() AND a.is_super_admin = true)
  );

-- ============================================
-- STEP 6: INSERT SAMPLE INSTITUTIONS
-- ============================================

INSERT INTO institutions (name, category) VALUES
-- Universities
('University of Nairobi', 'university'),
('Kenyatta University', 'university'),
('Strathmore University', 'university'),
('Jomo Kenyatta University of Agriculture and Technology', 'university'),
('Moi University', 'university'),
('Egerton University', 'university'),
('Maseno University', 'university'),
('KCA University', 'university'),
('United States International University Africa', 'university'),
('Daystar University', 'university'),
('Technical University of Kenya', 'university'),
('Dedan Kimathi University of Technology', 'university'),
('Multimedia University of Kenya', 'university'),
('Africa Nazarene University', 'university'),
('Catholic University of Eastern Africa', 'university'),
('Mount Kenya University', 'university'),
('Masinde Muliro University of Science and Technology', 'university'),
('Pwani University', 'university'),
('Kisii University', 'university'),
('Laikipia University', 'university'),
('South Eastern Kenya University', 'university'),
('Chuka University', 'university'),
('Maasai Mara University', 'university'),
('Karatina University', 'university'),
('Meru University of Science and Technology', 'university'),
('Kirinyaga University', 'university'),
('University of Eldoret', 'university'),
('Kibabii University', 'university'),
('Rongo University', 'university'),
('Jaramogi Oginga Odinga University of Science and Technology', 'university'),
-- Colleges
('Kenya Institute of Management', 'college'),
('Kenya Polytechnic University College', 'college'),
('Kenyaplex Institute of Technology', 'college'),
('Nairobi Institute of Business Studies', 'college'),
('Kenya Institute of Business Studies', 'college'),
('Institute of Human Resource Management', 'college'),
('Chartered Institute of Human Resource Management Kenya', 'college'),
('East African School of Management', 'college'),
('Management University of Africa', 'college'),
('Africa International University', 'college')
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_institution ON students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_unique_code ON students(unique_student_code);
CREATE INDEX IF NOT EXISTS idx_institutions_category ON institutions(category);

-- ============================================
-- DONE!
-- ============================================
-- The database is now ready for the HR Student Organisation portal.
-- 
-- To create a super admin, run this after creating a user in Supabase Auth:
-- 
-- INSERT INTO admins (id, email, full_name, is_super_admin)
-- VALUES ('YOUR_USER_UUID', 'admin@example.com', 'Admin Name', true);
--
-- Replace YOUR_USER_UUID with the actual user ID from auth.users
-- ============================================