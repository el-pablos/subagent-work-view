/**
 * Example usage of Communication components
 *
 * This demonstrates how to integrate the CommunicationLogPanel
 * with WebSocket for real-time message updates.
 */

import { useState, useEffect } from "react";
import { CommunicationLogPanel } from "./index";
import type { Message, Agent } from "./index";

// Example: WebSocket connection for real-time updates
function useCommunicationWebSocket(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Replace with your actual WebSocket endpoint
    const ws = new WebSocket(`ws://localhost:6001/session/${sessionId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle different event types
      switch (data.event) {
        case "message.created":
          setMessages((prev) => [...prev, data.data as Message]);
          break;

        case "agent.joined":
          setAgents((prev) => [...prev, data.data as Agent]);
          break;

        case "agent.left":
          setAgents((prev) => prev.filter((a) => a.id !== data.data.agentId));
          break;

        default:
          console.log("Unknown event:", data.event);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  return { messages, agents, isConnected };
}

// Example: Component usage
export function CommunicationExample() {
  const sessionId = "session-123"; // Get from your router/context
  const { messages, agents, isConnected } =
    useCommunicationWebSocket(sessionId);

  const handleSendCommand = (command: string) => {
    // Send command to backend API
    fetch(`/api/sessions/${sessionId}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Command sent:", data))
      .catch((err) => console.error("Error sending command:", err));
  };

  return (
    <div style={{ height: "600px" }}>
      <CommunicationLogPanel
        sessionId={sessionId}
        messages={messages}
        agents={agents}
        onSendCommand={handleSendCommand}
        isConnected={isConnected}
        showFilter={true}
      />
    </div>
  );
}

// Example: Mock data for testing
export const mockMessages: Message[] = [
  {
    id: "1",
    sessionId: "session-123",
    channel: "general",
    type: "system",
    content: "Session started - All agents are online",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    sessionId: "session-123",
    channel: "general",
    type: "agent",
    content: "Starting task analysis for the new feature implementation...",
    timestamp: new Date().toISOString(),
    sender: {
      id: "agent-1",
      uuid: "uuid-1",
      name: "Task Planner",
      type: "planner",
    },
    recipient: {
      id: "agent-lead",
      uuid: "uuid-lead",
      name: "Team Lead",
      type: "leader",
    },
  },
  {
    id: "3",
    sessionId: "session-123",
    channel: "handoff",
    type: "broadcast",
    content: "New task assigned to all workers - Priority: HIGH",
    timestamp: new Date().toISOString(),
    sender: {
      id: "agent-lead",
      uuid: "uuid-lead",
      name: "Team Lead",
      type: "leader",
    },
  },
  {
    id: "4",
    sessionId: "session-123",
    channel: "general",
    type: "user",
    content: "Please prioritize the authentication module first.",
    timestamp: new Date().toISOString(),
    sender: {
      id: "user-1",
      uuid: "uuid-user",
      name: "John Doe",
      type: "user",
    },
  },
  {
    id: "5",
    sessionId: "session-123",
    channel: "alert",
    type: "system",
    content: "Agent executor-1 has gone offline",
    timestamp: new Date().toISOString(),
  },
];

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    uuid: "uuid-1",
    name: "Task Planner",
    type: "planner",
  },
  {
    id: "agent-2",
    uuid: "uuid-2",
    name: "Code Executor",
    type: "executor",
  },
  {
    id: "agent-lead",
    uuid: "uuid-lead",
    name: "Team Lead",
    type: "leader",
  },
];
