import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: Role
  content: string
  timestamp: number
  error?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  inputDraft: string
  _hasHydrated: boolean
  addMessage: (msg: ChatMessage) => void
  updateMessage: (id: string, update: Partial<ChatMessage>) => void
  appendToMessage: (id: string, chunk: string) => void
  removeMessage: (id: string) => void
  setInputDraft: (draft: string) => void
  clearChat: () => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      inputDraft: '',
      _hasHydrated: false,

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      updateMessage: (id, update) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...update } : m
          ),
        })),

      appendToMessage: (id, chunk) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content: (m.content || '') + chunk } : m
          ),
        })),

      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),

      setInputDraft: (draft) => set({ inputDraft: draft }),

      clearChat: () =>
        set({
          messages: [],
          inputDraft: '',
        }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'milkguard_ai_chat_history_v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
