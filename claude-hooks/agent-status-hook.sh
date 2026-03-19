#!/bin/bash
# Agent Status Hook - Reports agent status changes to dashboard
# Detects: idle, busy, terminated states

WEBHOOK_URL="https://live-agents.tams.codes/api/v1/webhook/claude"

# Read input from stdin
INPUT=$(cat)

# Extract data
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null)
HOOK_TYPE=$(echo "$INPUT" | jq -r '.hook_type // "unknown"' 2>/dev/null)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
TOOL_OUTPUT=$(echo "$INPUT" | jq -r '.tool_output // empty' 2>/dev/null | head -c 500)

# Determine agent status based on hook type and tool
determine_status() {
    local status="unknown"

    case "$HOOK_TYPE" in
        "Stop")
            status="terminated"
            ;;
        "SessionStart")
            status="active"
            ;;
        "Notification")
            # Check notification type
            NOTIFICATION_TYPE=$(echo "$INPUT" | jq -r '.notification_type // empty' 2>/dev/null)
            case "$NOTIFICATION_TYPE" in
                "idle_prompt")
                    status="idle"
                    ;;
                "permission_prompt")
                    status="waiting_permission"
                    ;;
                *)
                    status="busy"
                    ;;
            esac
            ;;
        "PreToolUse"|"PostToolUse")
            status="busy"
            ;;
        *)
            status="active"
            ;;
    esac

    echo "$status"
}

STATUS=$(determine_status)

# Build payload
PAYLOAD=$(jq -n \
    --arg agent_id "$SESSION_ID" \
    --arg event_type "status_change" \
    --arg status "$STATUS" \
    --arg hook_type "$HOOK_TYPE" \
    --arg tool_name "$TOOL_NAME" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
        agent_id: $agent_id,
        event_type: $event_type,
        data: {
            status: $status,
            hook_type: $hook_type,
            tool_name: $tool_name
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

exit 0
