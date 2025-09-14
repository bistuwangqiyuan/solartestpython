-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE experiment_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE experiment_type AS ENUM ('dielectric', 'leakage', 'normal_operation', 'abnormal_condition');
CREATE TYPE device_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE user_role AS ENUM ('admin', 'engineer', 'viewer');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role user_role DEFAULT 'viewer',
  department VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE public.devices (
  id VARCHAR(100) PRIMARY KEY,
  device_name VARCHAR(200) NOT NULL,
  device_type VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  rated_voltage DECIMAL(10,2),
  rated_current DECIMAL(10,2),
  rated_power DECIMAL(10,2),
  calibration_date DATE,
  next_calibration DATE,
  status device_status DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiments table
CREATE TABLE public.experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_type experiment_type NOT NULL,
  experiment_name VARCHAR(255),
  device_id VARCHAR(100) REFERENCES devices(id),
  operator_id UUID REFERENCES profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status experiment_status DEFAULT 'pending',
  test_parameters JSONB,
  test_results JSONB,
  pass_fail BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Measurements table (for time-series data)
CREATE TABLE public.measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  current_a DECIMAL(10,5),
  voltage_v DECIMAL(10,5),
  power_w DECIMAL(10,5),
  temperature_c DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  storage_path TEXT,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES profiles(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test standards table
CREATE TABLE public.test_standards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  standard_name VARCHAR(100) NOT NULL,
  standard_code VARCHAR(50) UNIQUE NOT NULL,
  experiment_type experiment_type,
  description TEXT,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts/Notifications table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
  title VARCHAR(255) NOT NULL,
  message TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_experiments_device_id ON experiments(device_id);
CREATE INDEX idx_experiments_operator_id ON experiments(operator_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_type ON experiments(experiment_type);
CREATE INDEX idx_experiments_created_at ON experiments(created_at DESC);

CREATE INDEX idx_measurements_experiment_id ON measurements(experiment_id);
CREATE INDEX idx_measurements_timestamp ON measurements(timestamp DESC);
CREATE INDEX idx_measurements_experiment_timestamp ON measurements(experiment_id, timestamp DESC);

CREATE INDEX idx_files_experiment_id ON files(experiment_id);
CREATE INDEX idx_alerts_experiment_id ON alerts(experiment_id);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Devices: Viewable by all authenticated users, editable by admins and engineers
CREATE POLICY "Devices are viewable by authenticated users" ON devices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Devices are editable by admins and engineers" ON devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'engineer')
    )
  );

-- Experiments: Viewable by all authenticated users, editable by creator and admins
CREATE POLICY "Experiments are viewable by authenticated users" ON experiments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create experiments" ON experiments
  FOR INSERT WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Users can update own experiments" ON experiments
  FOR UPDATE USING (
    auth.uid() = operator_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Measurements: Same as experiments
CREATE POLICY "Measurements are viewable by authenticated users" ON measurements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert measurements for their experiments" ON measurements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiments 
      WHERE experiments.id = experiment_id 
      AND experiments.operator_id = auth.uid()
    )
  );

-- Files: Same as experiments
CREATE POLICY "Files are viewable by authenticated users" ON files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload files" ON files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Test standards: Viewable by all, editable by admins
CREATE POLICY "Test standards are viewable by authenticated users" ON test_standards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Test standards are editable by admins" ON test_standards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Alerts: Viewable by all authenticated users
CREATE POLICY "Alerts are viewable by authenticated users" ON alerts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Audit logs: Viewable by admins only
CREATE POLICY "Audit logs are viewable by admins" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Functions and triggers
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_standards_updated_at BEFORE UPDATE ON test_standards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  
  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER audit_devices_changes
  AFTER INSERT OR UPDATE OR DELETE ON devices
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_experiments_changes
  AFTER INSERT OR UPDATE OR DELETE ON experiments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Insert default test standards
INSERT INTO test_standards (standard_name, standard_code, experiment_type, description, requirements) VALUES
('Dielectric Withstand Test', 'IEC-60947-3-8.3', 'dielectric', 'Test for dielectric strength of photovoltaic rapid shutdown devices', 
 '{"test_voltage": "1000V + 2 × rated voltage", "duration": "60 seconds", "max_leakage_current": "5mA"}'::jsonb),
('Leakage Current Test', 'UL-1741-39', 'leakage', 'Measurement of leakage current under normal operating conditions',
 '{"test_voltage": "110% of rated voltage", "measurement_range": "0-100mA", "sampling_rate": "10Hz"}'::jsonb),
('Normal Operation Test', 'IEC-60947-3-5', 'normal_operation', 'Tests under normal operating conditions',
 '{"making_capacity": true, "breaking_capacity": true, "short_circuit_withstand": true, "temperature_rise": true}'::jsonb),
('Abnormal Condition Test', 'UL-1741-40', 'abnormal_condition', 'Tests under abnormal operating conditions',
 '{"overvoltage_protection": true, "undervoltage_protection": true, "overcurrent_protection": true, "reverse_polarity": true}'::jsonb);