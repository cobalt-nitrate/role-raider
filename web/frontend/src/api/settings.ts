import { api } from './client'

export const getProfile = () => api.get('/settings/profile').then(r => r.data)
export const putProfile = (data: object) => api.put('/settings/profile', data)

export const getSearches = () => api.get<{ content: string }>('/settings/searches').then(r => r.data)
export const putSearches = (content: string) => api.put('/settings/searches', { content })

export const getEnv = () => api.get<Record<string, string>>('/settings/env').then(r => r.data)
export const putEnv = (key: string, value: string) => api.put('/settings/env', { key, value })

export const getResume = () => api.get('/settings/resume').then(r => r.data)

export const getDoctor = () =>
  api.get<{ checks: { check: string; status: string; note: string }[]; tier: number; tier_label: string }>(
    '/settings/doctor'
  ).then(r => r.data)
