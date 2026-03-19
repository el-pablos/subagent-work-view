import { create } from "zustand";
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
