#!/bin/bash
# Agent Reporter Hook - Reports agent spawn events to dashboard
# Hook: PostToolUse (Task tool detection)

WEBHOOK_URL="https://live-agents.tams.codes/api/v1/webhook/claude"

# Read input from stdin (Claude hook provides JSON)
INPUT=$(cat)

# Extract tool name from input
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)

# Only process Task-related tools (agent spawn)
if [[ "$TOOL_NAME" == "Task" ]] || [[ "$TOOL_NAME" == *"Agent"* ]] || [[ "$TOOL_NAME" == "SendMessage" ]]; then
    # Extract relevant data
    SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null)
    AGENT_NAME=$(echo "$INPUT" | jq -r '.tool_input.prompt // .tool_input.recipient // "unknown"' 2>/dev/null | head -c 100)
    TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}' 2>/dev/null)

    # Determine event type
    if [[ "$TOOL_NAME" == "Task" ]]; then
        EVENT_TYPE="agent_spawn"
        AGENT_TYPE="subagent"
    elif [[ "$TOOL_NAME" == "SendMessage" ]]; then
        EVENT_TYPE="agent_message"
        AGENT_TYPE="teammate"
    else
        EVENT_TYPE="agent_action"
        AGENT_TYPE="agent"
    fi

    # Build payload
    PAYLOAD=$(jq -n \
        --arg agent_id "$SESSION_ID" \
        --arg event_type "$EVENT_TYPE" \
        --arg agent_name "$AGENT_NAME" \
        --arg agent_type "$AGENT_TYPE" \
        --arg status "active" \
        --arg tool_name "$TOOL_NAME" \
        --argjson tool_input "$TOOL_INPUT" \
        --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        '{
            agent_id: $agent_id,
            event_type: $event_type,
            data: {
                agent_name: $agent_name,
                agent_type: $agent_type,
                status: $status,
                tool_name: $tool_name,
                tool_input: $tool_input
            },
            timestamp: $timestamp
        }')

    # Send to webhook (async, don't block)
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        --connect-timeout 3 \
        --max-time 5 \
        > /dev/null 2>&1 &
fi

exit 0
