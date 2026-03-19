import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { immer } from "zustand/middleware/immer";
import { Session, SessionStatus } from "../types";

interface SessionState {
  sessions: Record<number, Session>;
  activeSessionId: number | null;
}

interface SessionActions {
  setSessions: (sessions: Session[]) => void;
  updateSession: (session: Session) => void;
  updateSessionPartial: (id: number, updates: Partial<Session>) => void;
  addSession: (session: Session) => void;
  setActiveSession: (id: number | null) => void;
  getSession: (id: number) => Session | undefined;
  getActiveSession: () => Session | undefined;
  getSessionsByStatus: (status: SessionStatus) => Session[];
  clearSessions: () => void;
}

const initialState: SessionState = {
  sessions: {},
  activeSessionId: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  immer((set, get) => ({
    ...initialState,

    setSessions: (sessions) =>
      set((state) => {
        state.sessions = {};
        sessions.forEach((session) => {
          state.sessions[session.id] = session;
        });
      }),

    updateSession: (session) =>
      set((state) => {
        state.sessions[session.id] = session;
      }),

    updateSessionPartial: (id, updates) =>
      set((state) => {
        if (state.sessions[id]) {
          state.sessions[id] = { ...state.sessions[id], ...updates };
        }
      }),

    addSession: (session) =>
      set((state) => {
        state.sessions[session.id] = session;
      }),

    setActiveSession: (id) =>
      set((state) => {
        state.activeSessionId = id;
      }),

    getSession: (id) => {
      const state = get();
      return state.sessions[id];
    },

    getActiveSession: () => {
      const state = get();
      if (state.activeSessionId === null) return undefined;
      return state.sessions[state.activeSessionId];
    },

    getSessionsByStatus: (status) => {
      const state = get();
      return Object.values(state.sessions).filter(
        (session) => session.status === status,
      );
    },

    clearSessions: () =>
      set((state) => {
        state.sessions = {};
        state.activeSessionId = null;
      }),
  })),
);

// Selectors for optimized re-renders
export const useSessionsArray = () =>
  useSessionStore((state) => Object.values(state.sessions));

export const useActiveSessionId = () =>
  useSessionStore((state) => state.activeSessionId);

export const useActiveSession = () =>
  useSessionStore((state) => {
    if (state.activeSessionId === null) return undefined;
    return state.sessions[state.activeSessionId];
  });

export const useSessionById = (id: number | null) =>
  useSessionStore((state) => (id ? state.sessions[id] : undefined));

export const useSessionsByStatus = (status: SessionStatus) =>
  useSessionStore((state) =>
    Object.values(state.sessions).filter((session) => session.status === status)
  );

export const useSessionActions = () =>
  useSessionStore(
    useShallow((state) => ({
      setSessions: state.setSessions,
      updateSession: state.updateSession,
      updateSessionPartial: state.updateSessionPartial,
      addSession: state.addSession,
      setActiveSession: state.setActiveSession,
      clearSessions: state.clearSessions,
    }))
  );
