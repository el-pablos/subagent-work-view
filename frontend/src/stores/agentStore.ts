import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { immer } from "zustand/middleware/immer";
import { Agent, AgentStatus } from "../types";

interface AgentState {
  agents: Record<number, Agent>;
  selectedAgentId: number | null;
}

interface AgentActions {
  setAgents: (agents: Agent[]) => void;
  updateAgent: (agent: Agent) => void;
  updateAgentPartial: (id: number, updates: Partial<Agent>) => void;
  selectAgent: (id: number | null) => void;
  getAgentsByStatus: (status: AgentStatus) => Agent[];
  getAgent: (id: number) => Agent | undefined;
  clearAgents: () => void;
}

const initialState: AgentState = {
  agents: {},
  selectedAgentId: null,
};

export const useAgentStore = create<AgentState & AgentActions>()(
  immer((set, get) => ({
    ...initialState,

    setAgents: (agents) =>
      set((state) => {
        state.agents = {};
        agents.forEach((agent) => {
          state.agents[agent.id] = agent;
        });
      }),

    updateAgent: (agent) =>
      set((state) => {
        state.agents[agent.id] = agent;
      }),

    updateAgentPartial: (id, updates) =>
      set((state) => {
        if (state.agents[id]) {
          state.agents[id] = { ...state.agents[id], ...updates };
        }
      }),

    selectAgent: (id) =>
      set((state) => {
        state.selectedAgentId = id;
      }),

    getAgentsByStatus: (status) => {
      const state = get();
      return Object.values(state.agents).filter(
        (agent) => agent.status === status,
      );
    },

    getAgent: (id) => {
      const state = get();
      return state.agents[id];
    },

    clearAgents: () =>
      set((state) => {
        state.agents = {};
        state.selectedAgentId = null;
      }),
  })),
);

// Selectors for optimized re-renders
export const useAgentsArray = () =>
  useAgentStore((state) => Object.values(state.agents));

export const useSelectedAgentId = () =>
  useAgentStore((state) => state.selectedAgentId);

export const useSelectedAgent = () =>
  useAgentStore((state) => {
    if (state.selectedAgentId === null) return undefined;
    return state.agents[state.selectedAgentId];
  });

export const useAgentById = (id: number | null) =>
  useAgentStore((state) => (id ? state.agents[id] : undefined));

export const useAgentsByStatus = (status: AgentStatus) =>
  useAgentStore((state) =>
    Object.values(state.agents).filter((agent) => agent.status === status),
  );

export const useAgentActions = () =>
  useAgentStore(
    useShallow((state) => ({
      setAgents: state.setAgents,
      updateAgent: state.updateAgent,
      updateAgentPartial: state.updateAgentPartial,
      selectAgent: state.selectAgent,
      clearAgents: state.clearAgents,
    })),
  );
