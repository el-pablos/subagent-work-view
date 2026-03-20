import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Message, MessageChannel, MessageType } from "../types";

// Rolling window limit to prevent memory bloat
const MAX_MESSAGES_PER_SESSION = 100;

interface MessageState {
  messages: Message[];
}

interface MessageActions {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  clearSessionMessages: (sessionId: number) => void;
  trimSessionMessages: (sessionId: number) => void;
  getMessagesBySession: (sessionId: number) => Message[];
  getMessagesByChannel: (channel: MessageChannel) => Message[];
  getMessagesByType: (type: MessageType) => Message[];
  getMessagesByAgent: (agentId: number) => Message[];
}

const initialState: MessageState = {
  messages: [],
};

export const useMessageStore = create<MessageState & MessageActions>()(
  immer((set, get) => ({
    ...initialState,

    setMessages: (messages) =>
      set((state) => {
        // Group by session and apply rolling window limit
        const sessionGroups = new Map<number, Message[]>();
        for (const msg of messages) {
          const sessionId = msg.session_id;
          if (!sessionGroups.has(sessionId)) {
            sessionGroups.set(sessionId, []);
          }
          sessionGroups.get(sessionId)!.push(msg);
        }

        // Trim each session to max limit (keep newest)
        const trimmedMessages: Message[] = [];
        for (const [, sessionMessages] of sessionGroups) {
          // Sort by timestamp/id to ensure we keep the newest
          sessionMessages.sort((a, b) => a.id - b.id);
          const trimmed = sessionMessages.slice(-MAX_MESSAGES_PER_SESSION);
          trimmedMessages.push(...trimmed);
        }

        state.messages = trimmedMessages;
      }),

    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);

        // Auto-trim: enforce rolling window for the affected session
        const sessionId = message.session_id;
        const sessionMessages = state.messages.filter(
          (msg) => msg.session_id === sessionId,
        );

        if (sessionMessages.length > MAX_MESSAGES_PER_SESSION) {
          // Find oldest messages from this session to remove
          sessionMessages.sort((a, b) => a.id - b.id);
          const toRemove = sessionMessages.length - MAX_MESSAGES_PER_SESSION;
          const idsToRemove = new Set(
            sessionMessages.slice(0, toRemove).map((m) => m.id),
          );
          state.messages = state.messages.filter(
            (msg) => !idsToRemove.has(msg.id),
          );
        }
      }),

    addMessages: (messages) =>
      set((state) => {
        state.messages.push(...messages);

        // Auto-trim all affected sessions
        const affectedSessions = new Set(messages.map((m) => m.session_id));

        for (const sessionId of affectedSessions) {
          const sessionMessages = state.messages.filter(
            (msg) => msg.session_id === sessionId,
          );

          if (sessionMessages.length > MAX_MESSAGES_PER_SESSION) {
            sessionMessages.sort((a, b) => a.id - b.id);
            const toRemove = sessionMessages.length - MAX_MESSAGES_PER_SESSION;
            const idsToRemove = new Set(
              sessionMessages.slice(0, toRemove).map((m) => m.id),
            );
            state.messages = state.messages.filter(
              (msg) => !idsToRemove.has(msg.id),
            );
          }
        }
      }),

    clearMessages: () =>
      set((state) => {
        state.messages = [];
      }),

    clearSessionMessages: (sessionId) =>
      set((state) => {
        state.messages = state.messages.filter(
          (msg) => msg.session_id !== sessionId,
        );
      }),

    trimSessionMessages: (sessionId) =>
      set((state) => {
        const sessionMessages = state.messages.filter(
          (msg) => msg.session_id === sessionId,
        );

        if (sessionMessages.length > MAX_MESSAGES_PER_SESSION) {
          sessionMessages.sort((a, b) => a.id - b.id);
          const toRemove = sessionMessages.length - MAX_MESSAGES_PER_SESSION;
          const idsToRemove = new Set(
            sessionMessages.slice(0, toRemove).map((m) => m.id),
          );
          state.messages = state.messages.filter(
            (msg) => !idsToRemove.has(msg.id),
          );
        }
      }),

    getMessagesBySession: (sessionId) => {
      const state = get();
      return state.messages.filter((msg) => msg.session_id === sessionId);
    },

    getMessagesByChannel: (channel) => {
      const state = get();
      return state.messages.filter((msg) => msg.channel === channel);
    },

    getMessagesByType: (type) => {
      const state = get();
      return state.messages.filter((msg) => msg.message_type === type);
    },

    getMessagesByAgent: (agentId) => {
      const state = get();
      return state.messages.filter(
        (msg) => msg.from_agent_id === agentId || msg.to_agent_id === agentId,
      );
    },
  })),
);
