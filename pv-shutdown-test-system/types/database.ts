export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'engineer' | 'viewer'
          department: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'engineer' | 'viewer'
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'engineer' | 'viewer'
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          device_name: string
          device_type: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          rated_voltage: number | null
          rated_current: number | null
          rated_power: number | null
          calibration_date: string | null
          next_calibration: string | null
          status: 'active' | 'inactive' | 'maintenance'
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          device_name: string
          device_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          rated_voltage?: number | null
          rated_current?: number | null
          rated_power?: number | null
          calibration_date?: string | null
          next_calibration?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_name?: string
          device_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          rated_voltage?: number | null
          rated_current?: number | null
          rated_power?: number | null
          calibration_date?: string | null
          next_calibration?: string | null
          status?: 'active' | 'inactive' | 'maintenance'
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      experiments: {
        Row: {
          id: string
          experiment_type: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition'
          experiment_name: string | null
          device_id: string | null
          operator_id: string | null
          start_time: string
          end_time: string | null
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          test_parameters: Json | null
          test_results: Json | null
          pass_fail: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          experiment_type: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition'
          experiment_name?: string | null
          device_id?: string | null
          operator_id?: string | null
          start_time?: string
          end_time?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          test_parameters?: Json | null
          test_results?: Json | null
          pass_fail?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          experiment_type?: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition'
          experiment_name?: string | null
          device_id?: string | null
          operator_id?: string | null
          start_time?: string
          end_time?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          test_parameters?: Json | null
          test_results?: Json | null
          pass_fail?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          experiment_id: string
          sequence_number: number
          timestamp: string
          current_a: number | null
          voltage_v: number | null
          power_w: number | null
          temperature_c: number | null
          humidity_percent: number | null
          additional_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          sequence_number: number
          timestamp: string
          current_a?: number | null
          voltage_v?: number | null
          power_w?: number | null
          temperature_c?: number | null
          humidity_percent?: number | null
          additional_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          sequence_number?: number
          timestamp?: string
          current_a?: number | null
          voltage_v?: number | null
          power_w?: number | null
          temperature_c?: number | null
          humidity_percent?: number | null
          additional_data?: Json | null
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          experiment_id: string
          file_name: string
          file_type: string | null
          file_size: number | null
          storage_path: string | null
          mime_type: string | null
          uploaded_by: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          mime_type?: string | null
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string | null
          mime_type?: string | null
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
      }
      test_standards: {
        Row: {
          id: string
          standard_name: string
          standard_code: string
          experiment_type: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition' | null
          description: string | null
          requirements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          standard_name: string
          standard_code: string
          experiment_type?: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition' | null
          description?: string | null
          requirements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          standard_name?: string
          standard_code?: string
          experiment_type?: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition' | null
          description?: string | null
          requirements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          experiment_id: string
          alert_type: string
          severity: string
          title: string
          message: string | null
          acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          experiment_id: string
          alert_type: string
          severity?: string
          title: string
          message?: string | null
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          experiment_id?: string
          alert_type?: string
          severity?: string
          title?: string
          message?: string | null
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      experiment_status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
      experiment_type: 'dielectric' | 'leakage' | 'normal_operation' | 'abnormal_condition'
      device_status: 'active' | 'inactive' | 'maintenance'
      user_role: 'admin' | 'engineer' | 'viewer'
    }
  }
}