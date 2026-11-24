export interface Facility {
  id: string;
  name: string;
  facility_type: string;
  address: string;
  city: string;
  risk_status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface Ward {
  id: string;
  name: string;
  acuity_level: string;
  bed_capacity: number;
  department_name: string;
  requirements: {
    role_name: string;
    required_count: number;
    confirmed_count: number;
    shortage_count: number;
    shift_type: string;
  }[];
}

export interface Shift {
  id: string;
  facility_id: string;
  ward_id: string;
  role_required: string;
  specialty_required: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  hourly_rate: number;
  incentive_bonus: number;
  total_budget_allocated: number;
  acuity_level: string;
  required_skills: string[];
  required_credentials: string[];
  notes?: string;
  status: 'DRAFT' | 'POSTED' | 'OFFERED' | 'ACCEPTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  facility_name?: string;
  ward_name?: string;
}

export interface MatchCandidate {
  professional_id: string;
  professional_name: string;
  role_title: string;
  specialty: string;
  overall_score: number;
  confidence_score: number;
  distance_km: number;
  eligible: boolean;
  reasons: string[];
  warnings: string[];
  factor_breakdown: Record<string, number>;
  is_overridden?: boolean;
  override_reason?: string;
}

export interface Timesheet {
  id: string;
  shift_id: string;
  professional_id: string;
  facility_id: string;
  clock_in_time: string;
  clock_out_time: string;
  total_break_minutes: number;
  total_hours_worked: number;
  overtime_hours: number;
  hourly_rate: number;
  incentive_amount: number;
  total_gross_pay: number;
  approval_state: 'SUBMITTED' | 'APPROVED' | 'LOCKED';
  approved_at?: string;
}

export interface Invoice {
  id: string;
  facility_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
}

export interface AuditEvent {
  id: string;
  actor_user_id: string;
  actor_email: string;
  action: string;
  entity_name: string;
  entity_id: string;
  created_at: string;
  reason?: string;
  previous_value?: any;
  new_value?: any;
}
