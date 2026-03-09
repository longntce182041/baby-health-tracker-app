export const NAV_ITEMS = [
    {
        key: "dashboard",
        label: "Dashboard",
        icon: "https://www.figma.com/api/mcp/asset/990ebf20-8567-4b53-ae7f-b8415d6e7c4d",
        active: true,
    },
    {
        key: "appointments",
        label: "Appointments",
        icon: "https://www.figma.com/api/mcp/asset/cac1491d-9fad-48b0-8534-ce097a4dfd7d",
    },
    {
        key: "consultations",
        label: "Consultations",
        icon: "https://www.figma.com/api/mcp/asset/901f487d-fbb2-4795-af82-a4a6295e4bfc",
    },
    {
        key: "patients",
        label: "Patients",
        icon: "https://www.figma.com/api/mcp/asset/06b6f8d3-0e59-460b-acb7-a887710c9d18",
    },
    {
        key: "reports",
        label: "Reports",
        icon: "https://www.figma.com/api/mcp/asset/2576a663-52ed-48d6-a5de-e0001a5a9b21",
    },
    {
        key: "settings",
        label: "Settings",
        icon: "https://www.figma.com/api/mcp/asset/7d9bf7e3-2362-4bbd-9b56-0620cf39b513",
    },
];

export const STATS = [
    {
        icon: "📅",
        title: "Today's Consultations",
        value: "8",
        subtitle: "6 completed",
        trend: "+2 from yesterday",
        tone: "blue",
    },
    {
        icon: "🗓",
        title: "This Week's Consultations",
        value: "42",
        subtitle: "38 completed",
        trend: "+8 from last week",
        tone: "mint",
    },
    {
        icon: "🧾",
        title: "This Month's Consultations",
        value: "156",
        subtitle: "148 completed",
        trend: "+24 from last month",
        tone: "cyan",
    },
    {
        icon: "⏳",
        title: "Pending Consultations",
        value: "4",
        subtitle: "Awaiting response",
        trend: "Action required",
        tone: "orange",
    },
    {
        icon: "💵",
        title: "Current Income",
        value: "51,300 pts",
        subtitle: "This month",
        trend: "+18% from last month",
        tone: "green",
    },
    {
        icon: "⭐",
        title: "Average Rating",
        value: "4.8 / 5.0",
        subtitle: "Based on 142 reviews",
        trend: "Excellent performance",
        tone: "yellow",
    },
];

export const QUICK_ACTIONS = [
    { icon: "📅", title: "Manage Schedule", subtitle: "Set availability" },
    { icon: "💬", title: "View Messages", subtitle: "4 unread" },
    { icon: "📊", title: "View Analytics", subtitle: "Performance" },
    { icon: "💰", title: "Income Report", subtitle: "Monthly summary" },
];

export const APPOINTMENTS = [
    {
        patient: "Emma Johnson",
        age: "9 months",
        parent: "Sarah Johnson",
        concern: "Feeding concerns",
        time: "Dec 29 at 02:30 PM",
        mode: "Video",
    },
    {
        patient: "Lucas Garcia",
        age: "8 months",
        parent: "Maria Garcia",
        concern: "Sleep pattern questions",
        time: "Dec 29 at 03:00 PM",
        mode: "Chat",
    },
    {
        patient: "Noah Smith",
        age: "15 months",
        parent: "John Smith",
        concern: "Developmental milestones",
        time: "Dec 29 at 03:30 PM",
        mode: "Video",
    },
    {
        patient: "Sophia Anderson",
        age: "12 months",
        parent: "Lisa Anderson",
        concern: "Vaccination follow-up",
        time: "Dec 29 at 04:00 PM",
        mode: "Video",
    },
];

export const NOTIFICATIONS = [
    {
        title: "New Consultation Request",
        detail:
            "Sarah Johnson requested a video consultation for Emma (9 months) - Feeding concerns",
        time: "6 minutes ago",
        type: "alert",
        action: "Action Required",
    },
    {
        title: "New Consultation Request",
        detail:
            "David Lee requested a chat consultation for Olivia (6 months) - Sleep questions",
        time: "18 minutes ago",
        type: "alert",
        action: "Action Required",
    },
    {
        title: "Schedule Change",
        detail: "Maria Garcia rescheduled consultation from 2:00 PM to 3:00 PM today",
        time: "1 hour ago",
        type: "warning",
    },
    {
        title: "System Update",
        detail:
            "New telemedicine features available: Screen sharing and digital prescription tools",
        time: "2 hours ago",
        type: "info",
    },
    {
        title: "Admin Message",
        detail:
            "Reminder: Please update your availability for next week in the schedule settings",
        time: "3 hours ago",
        type: "success",
    },
];

export const LOGOUT_ICON =
    "https://www.figma.com/api/mcp/asset/64dadf1e-62ce-4e48-99d3-64bd358a98de";

export const SEARCH_ICON =
    "https://www.figma.com/api/mcp/asset/9fb6d67a-bbea-4230-a3af-6193b05c05d6";

export const BELL_ICON =
    "https://www.figma.com/api/mcp/asset/160e0f26-21ad-4418-a67e-930041907fff";

export const CHART_POINTS = [34, 38, 41, 36];
