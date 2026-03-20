import { create } from 'zustand'

interface TaskStore {
  pipelineTaskId: string | null
  applyTaskId: string | null
  setPipelineTask: (id: string | null) => void
  setApplyTask: (id: string | null) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  pipelineTaskId: null,
  applyTaskId: null,
  setPipelineTask: (id) => set({ pipelineTaskId: id }),
  setApplyTask: (id) => set({ applyTaskId: id }),
}))
