import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { immer } from "zustand/middleware/immer";
import { Message, MessageChannel, MessageType } from "../types";

interface MessageState {
  messages: Message[];
}

interface MessageActions {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
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
        state.messages = messages;
      }),

    addMessage: (message) =>
      set((state) => {
        state.messages.push(message);
      }),

    clearMessages: () =>
      set((state) => {
        state.messages = [];
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

// Selectors for optimized re-renders
export const useMessages = () =>
  useMessageStore((state) => state.messages);

export const useMessagesBySession = (sessionId: number) =>
  useMessageStore((state) =>
    state.messages.filter((msg) => msg.session_id === sessionId)
  );

export const useMessagesByChannel = (channel: MessageChannel) =>
  useMessageStore((state) =>
    state.messages.filter((msg) => msg.channel === channel)
  );

export const useMessagesByType = (type: MessageType) =>
  useMessageStore((state) =>
    state.messages.filter((msg) => msg.message_type === type)
  );

export const useMessagesByAgent = (agentId: number) =>
  useMessageStore((state) =>
    state.messages.filter(
      (msg) => msg.from_agent_id === agentId || msg.to_agent_id === agentId
    )
  );

export const useMessageActions = () =>
  useMessageStore(
    useShallow((state) => ({
      setMessages: state.setMessages,
      addMessage: state.addMessage,
      clearMessages: state.clearMessages,
    }))
  );
