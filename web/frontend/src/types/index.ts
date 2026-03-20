export interface Stats {
  total: number
  with_description: number
  pending_detail: number
  detail_errors: number
  scored: number
  unscored: number
  tailored: number
  untailored_eligible: number
  with_cover_letter: number
  ready_to_apply: number
  applied: number
  apply_errors: number
  by_site: [string, number][]
  score_distribution: [number, number][]
}

export interface Job {
  url: string
  title: string | null
  salary: string | null
  description: string | null
  full_description: string | null
  location: string | null
  site: string | null
  strategy: string | null
  discovered_at: string | null
  application_url: string | null
  fit_score: number | null
  score_reasoning: string | null
  tailored_resume_path: string | null
  cover_letter_path: string | null
  apply_status: string | null
  apply_error: string | null
  applied_at: string | null
  apply_attempts: number
}

export interface TaskStatus {
  running: boolean
  task_id: string | null
  started_at?: number
  line_count?: number
  status?: string
}

export interface DoctorCheck {
  check: string
  status: string
  note: string
}
