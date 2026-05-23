export type PolicyType = 'third_party' | 'comprehensive' | 'full';
export type RouteType = 'highway' | 'urban' | 'rural' | 'mixed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type DevicePlatform = 'ios' | 'android';
export type RiskTier = 'low' | 'medium' | 'high';
export type EventType =
  | 'harsh_brake'
  | 'harsh_acceleration'
  | 'sharp_corner'
  | 'phone_pickup'
  | 'phone_in_use'
  | 'speeding_start'
  | 'speeding_end'
  | 'night_driving_start'
  | 'night_driving_end';
export type Severity = 'low' | 'medium' | 'high';
export type ClaimType = 'property_damage' | 'bodily_injury' | 'total_loss' | 'theft' | 'weather' | 'other';
export type ClaimStatus = 'open' | 'under_review' | 'approved' | 'denied' | 'settled' | 'litigated';
export type AlertType =
  | 'score_critical'
  | 'score_trending_down'
  | 'phone_high'
  | 'second_claim'
  | 'data_gap'
  | 'fraud_flag'
  | 'reward_eligible'
  | 'session_skipped'
  | 'night_spike';
export type AlertSeverity = 'critical' | 'warning' | 'info' | 'positive';
export type UserRole = 'insurer' | 'driver';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  driverId?: string;
  iat?: number;
  exp?: number;
}

export interface Driver {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  license_class: string | null;
  license_since: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate: string | null;
  policy_id: string;
  policy_type: PolicyType;
  premium_monthly: number | null;
  coverage_start: string | null;
  coverage_end: string | null;
  enrolled_at: string;
  app_user_id: string | null;
  insurer_notes: string | null;
}

export interface Session {
  id: string;
  driver_id: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  distance_km: number | null;
  route_type: RouteType | null;
  time_of_day: TimeOfDay | null;
  weather: string | null;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  gps_trace: GpsPoint[] | null;
  trip_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  app_version: string | null;
  device_platform: DevicePlatform | null;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  speed_kmh: number;
  ts: string;
}

export interface ScoreBreakdown {
  phone: number;
  braking: number;
  speeding: number;
  cornering: number;
  night: number;
}

export interface Event {
  id: string;
  session_id: string;
  driver_id: string;
  occurred_at: string;
  event_type: EventType;
  severity: Severity | null;
  value: number | null;
  lat: number | null;
  lng: number | null;
  metadata: Record<string, unknown> | null;
}

export interface Score {
  id: string;
  driver_id: string;
  period_start: string;
  period_end: string;
  composite_score: number | null;
  phone_score: number | null;
  braking_score: number | null;
  speeding_score: number | null;
  cornering_score: number | null;
  night_score: number | null;
  trips_counted: number | null;
  km_counted: number | null;
  phone_avg_sec: number | null;
  harsh_brakes_per_100km: number | null;
  speeding_pct: number | null;
  night_pct: number | null;
  risk_tier: RiskTier | null;
  discount_pct: number | null;
  created_at: string;
}

export interface Claim {
  id: string;
  driver_id: string;
  session_id: string | null;
  filed_at: string;
  incident_at: string | null;
  claim_type: ClaimType | null;
  status: ClaimStatus;
  estimated_cost: number | null;
  settled_cost: number | null;
  incident_lat: number | null;
  incident_lng: number | null;
  description: string | null;
  telematics_match: boolean | null;
  phone_at_impact: boolean | null;
  fraud_flag: boolean;
  fraud_reason: string | null;
  adjuster_notes: string | null;
  evidence_urls: string[] | null;
}

export interface Alert {
  id: string;
  driver_id: string;
  created_at: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  body: string | null;
  resolved: boolean;
  resolved_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PortfolioAnalytics {
  total_drivers: number;
  avg_score: number;
  loss_ratio: number;
  high_risk_count: number;
  active_claims: number;
  sessions_30d: number;
  app_adoption_pct: number;
  estimated_savings_ytd: number;
  score_distribution: { low: number; medium: number; high: number };
  top_risk_drivers: TopRiskDriver[];
}

export interface TopRiskDriver {
  id: string;
  full_name: string;
  composite_score: number | null;
  risk_tier: RiskTier | null;
  phone_avg_sec: number | null;
  open_claims: number;
}

export interface DriverAnalytics {
  score_history: Score[];
  event_breakdown: Record<string, number>;
  monthly_km: MonthlyKm[];
  phone_avg_trend: PhoneAvgTrend[];
  best_trip: Session | null;
  worst_trip: Session | null;
}

export interface MonthlyKm {
  month: string;
  km: number;
}

export interface PhoneAvgTrend {
  period: string;
  avg_sec: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
