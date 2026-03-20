import { api } from './client'

export const runPipeline = (body: {
  stages: string[]; min_score: number; workers: number;
  stream: boolean; dry_run: boolean; validation: string
}) => api.post<{ task_id: string }>('/pipeline/run', body).then(r => r.data)

export const pipelineStatus = () => api.get('/pipeline/status').then(r => r.data)
export const stopPipeline = () => api.post('/pipeline/stop').then(r => r.data)
