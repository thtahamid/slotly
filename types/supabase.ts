export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      parking_lots: {
        Row: {
          id: string
          name: string
          location: string
          total_spaces: number
          hourly_rate: number | null
          daily_rate: number | null
          is_covered: boolean | null
          has_ev_charging: boolean | null
          has_handicap_spaces: boolean | null
          operating_hours: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          total_spaces: number
          hourly_rate?: number | null
          daily_rate?: number | null
          is_covered?: boolean | null
          has_ev_charging?: boolean | null
          has_handicap_spaces?: boolean | null
          operating_hours?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          total_spaces?: number
          hourly_rate?: number | null
          daily_rate?: number | null
          is_covered?: boolean | null
          has_ev_charging?: boolean | null
          has_handicap_spaces?: boolean | null
          operating_hours?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parking_spaces: {
        Row: {
          id: string
          lot_id: string
          space_number: string
          space_type: string
          status: string
          sensor_id: string | null
          last_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lot_id: string
          space_number: string
          space_type?: string
          status?: string
          sensor_id?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lot_id?: string
          space_number?: string
          space_type?: string
          status?: string
          sensor_id?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parking_sessions: {
        Row: {
          id: string
          user_id: string | null
          parking_space_id: string
          start_time: string
          end_time: string | null
          total_cost: number | null
          payment_status: string
          vehicle_license_plate: string | null
          vehicle_type: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          parking_space_id: string
          start_time?: string
          end_time?: string | null
          total_cost?: number | null
          payment_status?: string
          vehicle_license_plate?: string | null
          vehicle_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          parking_space_id?: string
          start_time?: string
          end_time?: string | null
          total_cost?: number | null
          payment_status?: string
          vehicle_license_plate?: string | null
          vehicle_type?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sensors: {
        Row: {
          id: string
          type: string | null
          status: string | null
          battery_level: number | null
          last_maintenance_date: string | null
          installation_date: string | null
          firmware_version: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          type?: string | null
          status?: string | null
          battery_level?: number | null
          last_maintenance_date?: string | null
          installation_date?: string | null
          firmware_version?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string | null
          status?: string | null
          battery_level?: number | null
          last_maintenance_date?: string | null
          installation_date?: string | null
          firmware_version?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          phone: string | null
          membership_type: string | null
          registration_date: string | null
          license_plate: string | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          phone?: string | null
          membership_type?: string | null
          registration_date?: string | null
          license_plate?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          membership_type?: string | null
          registration_date?: string | null
          license_plate?: string | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      revenue_reports: {
        Row: {
          id: string
          lot_id: string
          report_date: string
          daily_revenue: number | null
          occupied_spaces_percentage: number | null
          peak_hour: string | null
          total_sessions: number | null
          avg_session_duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lot_id: string
          report_date: string
          daily_revenue?: number | null
          occupied_spaces_percentage?: number | null
          peak_hour?: string | null
          total_sessions?: number | null
          avg_session_duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lot_id?: string
          report_date?: string
          daily_revenue?: number | null
          occupied_spaces_percentage?: number | null
          peak_hour?: string | null
          total_sessions?: number | null
          avg_session_duration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          lot_id: string
          maintenance_type: string
          description: string | null
          performed_by: string | null
          maintenance_date: string
          cost: number | null
          next_scheduled_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lot_id: string
          maintenance_type: string
          description?: string | null
          performed_by?: string | null
          maintenance_date: string
          cost?: number | null
          next_scheduled_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lot_id?: string
          maintenance_type?: string
          description?: string | null
          performed_by?: string | null
          maintenance_date?: string
          cost?: number | null
          next_scheduled_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type ParkingLot = Database["public"]["Tables"]["parking_lots"]["Row"]
export type ParkingSpace = Database["public"]["Tables"]["parking_spaces"]["Row"]
export type ParkingSession = Database["public"]["Tables"]["parking_sessions"]["Row"]
export type User = Database["public"]["Tables"]["users"]["Row"]
export type RevenueReport = Database["public"]["Tables"]["revenue_reports"]["Row"]
export type MaintenanceLog = Database["public"]["Tables"]["maintenance_logs"]["Row"]
export type Sensor = Database["public"]["Tables"]["sensors"]["Row"]
