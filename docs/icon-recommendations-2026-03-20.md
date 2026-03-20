# Icon Recommendations for Monitoring Dashboard

**Date:** 2026-03-20
**Library:** Lucide Icons (https://lucide.dev)
**Purpose:** Provide consistent, recognizable icons for agent monitoring dashboard

## Why Lucide Icons?

1. **Modern & Clean Design** - Consistent 24x24 grid, 2px stroke width
2. **React Native Support** - Works seamlessly with our React frontend
3. **Tree-shakeable** - Only imports icons you use
4. **MIT License** - Free for commercial use
5. **Active Maintenance** - Regular updates and community support
6. **Accessibility** - Designed with a11y in mind

---

## Recommended Icons by Category

### 1. Agent Icons

| Use Case | Icon Name | Reasoning |
|----------|-----------|-----------|
| **AI Agent (Primary)** | `bot` | Universal robot/AI symbol, instantly recognizable |
| **Agent with Message** | `bot-message-square` | Shows agent is communicating |
| **Agent Disabled** | `bot-off` | Clear indication of inactive/disabled state |
| **Human User** | `user` | Simple, universal user representation |
| **Team/Multi-agent** | `users` | Multiple entities working together |
| **Agent Settings** | `user-cog` | Configuration/preferences for agent |

**Alternative Considerations:**
- `cpu` - For emphasizing computational aspect
- `brain` - For AI/intelligence emphasis (if available)
- `terminal` - For CLI-based agents

---

### 2. Status Indicators

| Status | Icon Name | Color | Reasoning |
|--------|-----------|-------|-----------|
| **Active/Running** | `circle-dot` | `#22c55e` (green) | Pulsing dot = alive/active |
| **Idle/Waiting** | `circle-pause` | `#f59e0b` (amber) | Paused state, ready to resume |
| **Completed/Success** | `circle-check` | `#22c55e` (green) | Universal success symbol |
| **Error/Failed** | `circle-x` | `#ef4444` (red) | Universal failure symbol |
| **Warning** | `triangle-alert` | `#f59e0b` (amber) | Standard warning triangle |
| **Info** | `info` | `#3b82f6` (blue) | Information indicator |
| **Pending** | `clock` | `#6b7280` (gray) | Waiting/scheduled |
| **In Progress** | `loader-circle` | `#3b82f6` (blue) | Animated spinner |
| **Blocked** | `ban` | `#ef4444` (red) | Cannot proceed |

**Status Badge Variants:**
- `badge-check` - Verified/approved badge
- `badge-alert` - Warning badge
- `badge-info` - Info badge

---

### 3. Task Icons

| Use Case | Icon Name | Reasoning |
|----------|-----------|-----------|
| **Task List** | `list-checks` | Multiple items with completion status |
| **Single Task** | `square-check` | Checkbox metaphor |
| **Task Pending** | `square` | Empty checkbox = not done |
| **Task In Progress** | `square-dot` | Dot indicates activity |
| **Task Completed** | `square-check` | Filled checkbox = done |
| **Task Failed** | `square-x` | X = failed/cancelled |
| **Task Priority High** | `chevrons-up` | Double arrow = high priority |
| **Task Priority Low** | `chevrons-down` | Double arrow down = low priority |
| **Task Dependencies** | `git-branch` | Branching/dependencies |
| **Task Timeline** | `calendar-clock` | Time-based view |

---

### 4. Communication Icons

| Use Case | Icon Name | Reasoning |
|----------|-----------|-----------|
| **Message (General)** | `message-square` | Standard chat bubble |
| **Direct Message** | `message-circle` | Personal/direct communication |
| **Broadcast** | `megaphone` | One-to-many communication |
| **Message Sent** | `send` | Outgoing message indicator |
| **Message Received** | `inbox` | Incoming message |
| **Unread Messages** | `mail` | New/unread indicator |
| **Read Messages** | `mail-open` | Opened/read |
| **Bot Message** | `bot-message-square` | Agent-originated message |
| **Notification** | `bell` | Alert/notification |
| **New Notification** | `bell-dot` | Unread notification |
| **Muted** | `bell-off` | Notifications disabled |

---

### 5. Dashboard/Monitoring Icons

| Use Case | Icon Name | Reasoning |
|----------|-----------|-----------|
| **Dashboard Home** | `layout-dashboard` | Grid layout = dashboard |
| **Monitoring/Watch** | `eye` | Observation/monitoring |
| **Activity** | `activity` | Heartbeat/activity graph |
| **Metrics/Gauge** | `gauge` | Performance indicator |
| **Network** | `network` | Connection topology |
| **Refresh/Sync** | `refresh-cw` | Update/refresh data |
| **Settings** | `settings` | Configuration |
| **Filter** | `filter` | Data filtering |
| **Search** | `search` | Search functionality |
| **Expand** | `maximize-2` | Expand panel |
| **Collapse** | `minimize-2` | Collapse panel |
| **Full Screen** | `fullscreen` | Full screen mode |

---

### 6. Action Icons

| Action | Icon Name | Reasoning |
|--------|-----------|-----------|
| **Start/Play** | `play` | Start process |
| **Pause** | `pause` | Pause process |
| **Stop** | `square` | Stop/terminate |
| **Restart** | `rotate-ccw` | Restart/retry |
| **Add/Create** | `plus` | Add new item |
| **Delete/Remove** | `trash-2` | Delete item |
| **Edit** | `pencil` | Edit/modify |
| **Save** | `save` | Save changes |
| **Copy** | `copy` | Copy to clipboard |
| **Download** | `download` | Download/export |
| **Upload** | `upload` | Upload/import |

---

### 7. Connection Status Icons

| Status | Icon Name | Reasoning |
|--------|-----------|-----------|
| **Connected** | `wifi` | Active connection |
| **Disconnected** | `wifi-off` | No connection |
| **Reconnecting** | `loader` | Attempting to reconnect |
| **WebSocket Active** | `radio` | Real-time connection |
| **Link** | `link` | Connected/linked |
| **Unlink** | `unlink` | Disconnected/broken |

---

## Icon Sizing Guidelines

| Context | Size | Usage |
|---------|------|-------|
| **Inline with text** | 16px | Status badges, labels |
| **Button icons** | 18px | Action buttons |
| **Panel headers** | 20px | Section headers |
| **Feature icons** | 24px | Main navigation, cards |
| **Hero/Empty state** | 48-64px | Empty states, onboarding |

---

## Color Coding Best Practices

### Semantic Colors
```css
/* Status Colors */
--color-success: #22c55e;    /* Green - success, active, healthy */
--color-warning: #f59e0b;    /* Amber - warning, idle, pending */
--color-error: #ef4444;      /* Red - error, failed, stopped */
--color-info: #3b82f6;       /* Blue - info, in-progress */
--color-neutral: #6b7280;    /* Gray - disabled, inactive */

/* Agent Status */
--agent-active: #22c55e;
--agent-idle: #f59e0b;
--agent-error: #ef4444;
--agent-offline: #6b7280;
```

### Accessibility Notes
- Always pair icons with text labels for screen readers
- Use `aria-label` for icon-only buttons
- Ensure sufficient color contrast (WCAG AA minimum)
- Don't rely solely on color to convey status

---

## Implementation Example

```tsx
import {
  Bot,
  CircleCheck,
  CircleX,
  MessageSquare,
  Bell,
  Activity,
  Loader2
} from 'lucide-react';

// Agent Status Component
const AgentStatusIcon = ({ status }: { status: string }) => {
  const iconMap = {
    active: <CircleCheck className="text-green-500" />,
    idle: <Loader2 className="text-amber-500 animate-spin" />,
    error: <CircleX className="text-red-500" />,
    offline: <Bot className="text-gray-400" />
  };
  return iconMap[status] || iconMap.offline;
};
```

---

## Quick Reference Card

```
AGENTS:       bot | bot-message-square | bot-off | users
STATUS:       circle-check | circle-x | triangle-alert | loader-circle
TASKS:        list-checks | square-check | square | git-branch
MESSAGES:     message-square | send | inbox | bell
DASHBOARD:    layout-dashboard | activity | gauge | eye
ACTIONS:      play | pause | square | rotate-ccw | plus | trash-2
CONNECTION:   wifi | wifi-off | link | unlink
```

---

## Related Resources

- [Lucide Icons Documentation](https://lucide.dev/guide)
- [Lucide React Package](https://lucide.dev/guide/packages/lucide-react)
- [Icon Search](https://lucide.dev/icons)

---

*Document created as part of monitoring dashboard UI redesign project*
