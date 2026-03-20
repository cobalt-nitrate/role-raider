import { api } from './client'

export const startApply = (body: {
  limit: number; workers: number; min_score: number;
  model: string; headless: boolean; dry_run: boolean;
  continuous: boolean; target_url?: string
}) => api.post<{ task_id: string }>('/apply/start', body).then(r => r.data)

export const applyStatus = () => api.get('/apply/status').then(r => r.data)
export const stopApply = () => api.post('/apply/stop').then(r => r.data)
export const markApplied = (url: string) => api.post('/apply/mark-applied', { url })
export const markFailed = (url: string, reason?: string) =>
  api.post('/apply/mark-failed', { url, reason })
