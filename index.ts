import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Analysis } from '../types';

interface SavedFolder {
  id: string;
  name: string;
}

interface AppState {
  currentAnalysis: Analysis | null;
  analyses: Analysis[];
  isAnalyzing: boolean;
  analysisProgress: number;
  error: string | null;
  success: string | null;
  darkMode: boolean;
  geminiApiKey: string;
  googleClientId: string;
  savedGoogleFolder: SavedFolder | null;
  googleConnected: boolean;
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, updates: Partial<Analysis>) => void;
  deleteAnalysis: (id: string) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisProgress: (value: number) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  toggleDarkMode: () => void;
  setGeminiApiKey: (key: string) => void;
  setGoogleClientId: (clientId: string) => void;
  setSavedGoogleFolder: (folder: SavedFolder | null) => void;
  setGoogleConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentAnalysis: null,
      analyses: [],
      isAnalyzing: false,
      analysisProgress: 0,
      error: null,
      success: null,
      darkMode: false,
      geminiApiKey: '',
      googleClientId: '',
      savedGoogleFolder: null,
      googleConnected: false,
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      addAnalysis: (analysis) => {
        const existing = get().analyses.find(a => a.id === analysis.id);
        if (!existing) {
          set((state) => ({ analyses: [analysis, ...state.analyses] }));
        }
      },
      updateAnalysis: (id, updates) => set((state) => ({
        analyses: state.analyses.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        currentAnalysis: state.currentAnalysis?.id === id
          ? { ...state.currentAnalysis, ...updates }
          : state.currentAnalysis,
      })),
      deleteAnalysis: (id) => set((state) => ({
        analyses: state.analyses.filter((a) => a.id !== id),
        currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis,
      })),
      setIsAnalyzing: (value) => set({ isAnalyzing: value }),
      setAnalysisProgress: (value) => set({ analysisProgress: value }),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setGoogleClientId: (clientId) => set({ googleClientId: clientId }),
      setSavedGoogleFolder: (folder) => set({ savedGoogleFolder: folder }),
      setGoogleConnected: (connected) => set({ googleConnected: connected }),
    }),
    {
      name: 'ai-media-analyzer-storage',
      partialize: (state) => ({
        analyses: state.analyses,
        darkMode: state.darkMode,
        geminiApiKey: state.geminiApiKey,
        googleClientId: state.googleClientId,
        savedGoogleFolder: state.savedGoogleFolder,
      }),
    }
  )
);
