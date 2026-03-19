/**
 * CommandPalette Usage Example
 * 
 * This file demonstrates how to integrate CommandPalette into your application.
 * Remember to implement Cmd/Ctrl+K shortcut in the parent component.
 */

import React, { useState, useEffect } from "react";
import { CommandPalette, type Agent } from "./CommandPalette";

export function CommandPaletteExample() {
  const [isOpen, setIsOpen] = useState(false);

  // Sample agents data - replace with real data from your store/API
  const agents: Agent[] = [
    {
      id: "agent-1",
      name: "Code Reviewer",
      type: "code-review",
      status: "running",
      description: "Reviewing pull request #123",
    },
    {
      id: "agent-2",
      name: "Explorer",
      type: "explore",
      status: "idle",
      description: "Ready to explore codebase",
    },
    {
      id: "agent-3",
      name: "Task Runner",
      type: "task",
      status: "completed",
      description: "Completed build process",
    },
  ];

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigateToAgent = (agentId: string) => {
    console.log("Navigate to agent:", agentId);
    // Implement navigation logic here
    // Example: router.push(`/agents/${agentId}`)
  };

  const handleNavigateToTask = (taskId: string) => {
    console.log("Navigate to task:", taskId);
    // Implement navigation logic here
    // Example: router.push(`/tasks/${taskId}`)
  };

  const handleExecuteCommand = (commandId: string) => {
    console.log("Execute command:", commandId);
    // Implement command execution logic here
    switch (commandId) {
      case "view-dashboard":
        // router.push("/dashboard")
        break;
      case "view-agents":
        // router.push("/agents")
        break;
      case "new-task":
        // openNewTaskModal()
        break;
      case "open-terminal":
        // toggleTerminal()
        break;
      case "settings":
        // router.push("/settings")
        break;
      default:
        console.warn("Unknown command:", commandId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Your app content */}
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-slate-100">
          CommandPalette Demo
        </h1>
        <p className="mb-8 text-slate-400">
          Press{" "}
          <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm">
            ⌘K
          </kbd>{" "}
          or{" "}
          <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm">
            Ctrl+K
          </kbd>{" "}
          to open the command palette
        </p>

        {/* Manual trigger button (optional) */}
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
        >
          Open Command Palette
        </button>
      </div>

      {/* CommandPalette Component */}
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        agents={agents}
        onNavigateToAgent={handleNavigateToAgent}
        onNavigateToTask={handleNavigateToTask}
        onExecuteCommand={handleExecuteCommand}
      />
    </div>
  );
}

/**
 * Integration with React Router (example)
 */
/*
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigateToAgent = (agentId: string) => {
    navigate(`/agents/${agentId}`);
  };

  const handleExecuteCommand = (commandId: string) => {
    if (commandId === 'view-dashboard') {
      navigate('/');
    } else if (commandId === 'view-agents') {
      navigate('/agents');
    }
    // ... other commands
  };

  return (
    <>
      <YourAppContent />
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        agents={agents}
        onNavigateToAgent={handleNavigateToAgent}
        onExecuteCommand={handleExecuteCommand}
      />
    </>
  );
}
*/

/**
 * Integration with Zustand Store (example)
 */
/*
import { useAgentStore } from '@/stores/agentStore';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const agents = useAgentStore((state) => state.agents);

  return (
    <>
      <YourAppContent />
      <CommandPalette
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        agents={agents}
        // ... callbacks
      />
    </>
  );
}
*/
