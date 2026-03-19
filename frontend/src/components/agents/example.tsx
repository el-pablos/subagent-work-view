import React, { useState } from "react";
import { AgentTopologyPanel, type Agent, type AgentConnection } from "./index";

/**
 * Example usage of AgentTopologyPanel component
 * This demonstrates how to integrate the agent visualization components
 */
const AgentTopologyExample: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

  // Example agent data
  const agents: Agent[] = [
    {
      id: "1",
      uuid: "uuid-1",
      name: "Team Lead",
      role: "leader",
      status: "busy",
      currentTask: {
        id: "task-1",
        title: "Coordinate team activities",
        progress: 75,
      },
    },
    {
      id: "2",
      uuid: "uuid-2",
      name: "Developer",
      role: "worker",
      status: "communicating",
      currentTask: {
        id: "task-2",
        title: "Implement user authentication",
        progress: 45,
      },
    },
    {
      id: "3",
      uuid: "uuid-3",
      name: "Code Reviewer",
      role: "reviewer",
      status: "idle",
    },
    {
      id: "4",
      uuid: "uuid-4",
      name: "Task Planner",
      role: "planner",
      status: "busy",
      currentTask: {
        id: "task-4",
        title: "Plan sprint activities",
        progress: 20,
      },
    },
  ];

  // Example connections between agents
  const connections: AgentConnection[] = [
    { fromId: "1", toId: "2", active: true },
    { fromId: "2", toId: "3", active: false },
    { fromId: "1", toId: "4", active: true },
  ];

  const handleAgentSelect = (agent: Agent) => {
    console.log("Selected agent:", agent);
    setSelectedAgentId(agent.id);
  };

  return (
    <div className="w-full h-screen p-4 bg-gray-950">
      <AgentTopologyPanel
        agents={agents}
        connections={connections}
        selectedAgentId={selectedAgentId}
        onAgentSelect={handleAgentSelect}
        className="h-full"
      />
    </div>
  );
};

export default AgentTopologyExample;
