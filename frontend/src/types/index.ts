export type UserRole = 'citizen' | 'admin' | 'volunteer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  locality?: string;
  phone?: string;
}

export type IncidentCategory =
  | 'Road damage and potholes'
  | 'Drainage and waterlogging'
  | 'Garbage and waste management'
  | 'Water supply problems'
  | 'Public infrastructure damage'
  | 'Electricity and street lighting'
  | 'Environmental pollution'
  | 'Public safety concerns'
  | 'Other community issues';

export type IncidentStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'duplicate'
  | 'reopened';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PriorityBreakdown {
  priority_score: number;
  tier: string;
  color: string;
  contributing_factors: {
    severity_weight: number;
    severity_value: number;
    urgency_weight: number;
    urgency_value: number;
    community_support_weight: number;
    community_support_value: number;
    time_elapsed_weight: number;
    time_elapsed_value: number;
    environmental_hazard_weight: number;
    environmental_hazard_value: number;
  };
  explanation: string;
}

export interface Incident {
  id: number;
  reference_no: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: number;
  urgency: UrgencyLevel;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  locality_name: string;
  landmark?: string;
  address?: string;
  photo_url?: string;
  completion_photo_url?: string;
  reporter_id?: number;
  reporter_name?: string;
  is_anonymous: boolean;
  language: string;
  voice_transcript?: string;
  assigned_department?: string;
  assigned_to?: string;
  confirmations_count: number;
  evidence_count: number;
  ai_confidence?: number;
  ai_reasoning?: string;
  ai_recommendations?: any;
  priority_score: number;
  priority_breakdown?: PriorityBreakdown;
  duplicate_of_id?: number;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface IncidentUpdate {
  id: number;
  incident_id: number;
  user_name: string;
  user_role: string;
  previous_status?: string;
  new_status: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface IncidentConfirmation {
  id: number;
  incident_id: number;
  notes?: string;
  photo_url?: string;
  still_present: boolean;
  created_at: string;
}

export interface DuplicateSuggestion {
  id: number;
  primary_incident: Incident;
  duplicate_incident: Incident;
  similarity_score: number;
  distance_meters: number;
  reason: string;
  status: 'suggested' | 'merged' | 'rejected';
  created_at: string;
}

export interface RiskAssessment {
  locality_name: string;
  latitude: number;
  longitude: number;
  risk_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'severe';
  risk_score: number;
  color: string;
  rainfall_mm: number;
  related_incidents_count: number;
  drainage_count: number;
  road_count: number;
  evidence_summary: string;
  evidence_items: string[];
  recommended_action: string;
  is_simulated: boolean;
  timestamp: string;
}

export interface WeatherData {
  is_simulated: boolean;
  scenario_name: string;
  rainfall_mm: number;
  temperature_c: number;
  condition: string;
  wind_speed_kmh: number;
  humidity: number;
  timestamp: string;
  hazard_level: number;
  locality?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  incident_id?: number;
  type: 'info' | 'warning' | 'success' | 'priority';
  is_read: boolean;
  created_at: string;
}
