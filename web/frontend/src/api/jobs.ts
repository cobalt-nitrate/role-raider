import { api } from './client'
import type { Job } from '../types'

export function encodeUrl(url: string) {
  return btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export const fetchJobs = (params: {
  stage?: string; min_score?: number; limit?: number; search?: string
}) => api.get<Job[]>('/jobs', { params }).then(r => r.data)

export const fetchJob = (url: string) =>
  api.get<Job>(`/jobs/${encodeUrl(url)}`).then(r => r.data)

export const patchJob = (url: string, apply_status: string, apply_error?: string) =>
  api.patch(`/jobs/${encodeUrl(url)}`, { apply_status, apply_error })

export const resetFailed = () => api.post('/jobs/reset-failed').then(r => r.data)
