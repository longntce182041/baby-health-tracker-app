import { useState } from "react";
import "./DoctorDashboard.css";

// Icon/Image URLs from Figma
const icons = {
  dashboard:
    "https://www.figma.com/api/mcp/asset/9a934bf5-d805-4cd8-9124-f30baca0b4e3",
  appointments:
    "https://www.figma.com/api/mcp/asset/b1e8c72f-143c-44dc-9e0c-a05dc510e00a",
  consultations:
    "https://www.figma.com/api/mcp/asset/97fba16b-c6ac-4105-af0b-7a6cdd7e90d6",
  patients:
    "https://www.figma.com/api/mcp/asset/7759b26d-d9b8-4491-946d-2dafc66d3dd7",
  reports:
    "https://www.figma.com/api/mcp/asset/40907f3f-463f-4771-a50f-80149d9b317c",
  settings:
    "https://www.figma.com/api/mcp/asset/685ddd03-82ba-4f65-b68f-33de048e4fef",
  logout:
    "https://www.figma.com/api/mcp/asset/dd60baaa-a58a-4bd0-9142-db04fb2bd185",
  search:
    "https://www.figma.com/api/mcp/asset/423e9a77-1e16-4bf2-8fb4-862249837277",
  notification:
    "https://www.figma.com/api/mcp/asset/12fb752c-65fc-4188-a049-702c4de1a3c6",
  calendar:
    "https://www.figma.com/api/mcp/asset/59aece2a-8a7d-41a4-b01f-fc80477b068c",
  checkCircle:
    "https://www.figma.com/api/mcp/asset/68de78f4-b415-4e4d-8852-a0f198a7349a",
  clock:
    "https://www.figma.com/api/mcp/asset/6208bfb5-0554-480b-bbe0-ef623353ea71",
  dollar:
    "https://www.figma.com/api/mcp/asset/bbf9e9ba-8daa-4808-ba8b-31ea82a48894",
  star: "https://www.figma.com/api/mcp/asset/72ea4792-aa7e-4a3e-bdcf-1fb61f881672",
  trendUp:
    "https://www.figma.com/api/mcp/asset/44544eb0-1c9b-49ea-9f4e-8c00337b2b18",
};

function DoctorDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { id: "appointments", label: "Appointments", icon: icons.appointments },
    { id: "consultations", label: "Consultations", icon: icons.consultations },
    { id: "patients", label: "Patients", icon: icons.patients },
    { id: "reports", label: "Reports", icon: icons.reports },
    { id: "settings", label: "Settings", icon: icons.settings },
  ];

  const statsCards = [
    {
      title: "Today's Consultations",
      value: "8",
      subtitle: "6 completed",
      trend: "+2 from yesterday",
      bgColor: "#eff6ff",
      icon: icons.calendar,
    },
    {
      title: "This Week's Consultations",
      value: "42",
      subtitle: "38 completed",
      trend: "+8 from last week",
      bgColor: "#f0fdfa",
      icon: icons.checkCircle,
    },
    {
      title: "This Month's Consultations",
      value: "156",
      subtitle: "148 completed",
      trend: "+24 from last month",
      bgColor: "#ecfeff",
      icon: icons.calendar,
    },
    {
      title: "Pending Consultations",
      value: "4",
      subtitle: "Awaiting response",
      trend: "Action required",
      bgColor: "#fff7ed",
      icon: icons.clock,
    },
    {
      title: "Current Income",
      value: "51,300 pts",
      subtitle: "This month",
      trend: "+7,200 from last month",
      bgColor: "#f0fdf4",
      icon: icons.dollar,
    },
    {
      title: "Average Rating",
      value: "4.8 / 5.0",
      subtitle: "Based on 142 reviews",
      trend: "+0.3 from last month",
      bgColor: "#fef9c3",
      icon: icons.star,
    },
  ];

  const appointments = [
    {
      id: 1,
      patientName: "Emma Johnson",
      age: "2 months",
      status: "Video",
      parentInfo: "Parent: Sarah Johnson",
      concern: "Concern: Feeding concerns",
      time: "Dec 19 at 2:30 PM",
    },
    {
      id: 2,
      patientName: "Lucas Garcia",
      age: "5 months",
      status: "Chat",
      parentInfo: "Parent: Maria Garcia",
      concern: "Concern: Sleep pattern questions",
      time: "Dec 19 at 3:30 PM",
    },
    {
      id: 3,
      patientName: "Noah Smith",
      age: "15 months",
      status: "Video",
      parentInfo: "Parent: John Smith",
      concern: "Concern: Developmental milestone",
      time: "Dec 19 at 5:30 PM",
    },
    {
      id: 4,
      patientName: "Sophia Anderson",
      age: "24 months",
      status: "Video",
      parentInfo: "Parent: Lisa Anderson",
      concern: "Concern: Vaccination follow-up",
      time: "Dec 19 at 6:30 PM",
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "new",
      title: "New Consultation Request",
      message:
        "Sarah Johnson requested a video consultation for Emma (2 months) - Feeding concerns",
      time: "2 minutes ago",
      urgent: true,
    },
    {
      id: 2,
      type: "action",
      title: "Action Required",
      message:
        "New Consultation Request\nSarah Johnson requested a video consultation for Emma (2 months) - Feeding concerns",
      time: "2 minutes ago",
    },
    {
      id: 3,
      type: "action",
      title: "Action Required",
      message:
        "David Lee requested a chat consultation for Olivia (5 months) - Sleep questions",
      time: "15 minutes ago",
    },
    {
      id: 4,
      type: "schedule",
      title: "Schedule Change",
      message:
        "Maria Garcia rescheduled consultation from 2:00 PM to 3:30 PM today",
      time: "1 hour ago",
    },
    {
      id: 5,
      type: "update",
      title: "System Update",
      message:
        "New telemedicine features available: Screen sharing and digital prescription tools",
      time: "3 hours ago",
    },
    {
      id: 6,
      type: "admin",
      title: "Admin Message",
      message:
        "Reminder: Please update your availability for next week in the schedule settings",
      time: "5 hours ago",
    },
  ];

  const quickActions = [
    {
      label: "Manage Schedule",
      sublabel: "(not available)",
      icon: icons.calendar,
    },
    { label: "View Messages", sublabel: "3 unread", icon: icons.consultations },
    {
      label: "View Analytics",
      sublabel: "(not available)",
      icon: icons.reports,
    },
    { label: "Income Report", sublabel: "Monthly summary", icon: icons.dollar },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              <h1>BabyCare</h1>
              <p>Doctor Portal</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <img src={item.icon} alt="" className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout">
            <img src={icons.logout} alt="" className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h2>Doctor Dashboard</h2>
            <p>Welcome back, Dr. Michael Chen</p>
          </div>

          <div className="header-right">
            <div className="search-container">
              <img src={icons.search} alt="Search" className="search-icon" />
              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="search-input"
              />
            </div>

            <button className="notification-btn">
              <img src={icons.notification} alt="Notifications" />
              <span className="notification-badge"></span>
            </button>

            <div className="user-profile">
              <div className="user-info">
                <p className="user-name">Dr. Michael Chen</p>
                <p className="user-role">Pediatrician</p>
              </div>
              <div className="user-avatar">MC</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            {statsCards.map((card, index) => (
              <div key={index} className="stat-card">
                <div
                  className="stat-icon"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <img src={card.icon} alt="" />
                </div>
                <div className="stat-content">
                  <p className="stat-title">{card.title}</p>
                  <p className="stat-value">{card.value}</p>
                  <p className="stat-subtitle">{card.subtitle}</p>
                  <div className="stat-trend">
                    <img src={icons.trendUp} alt="" />
                    <span>{card.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid: Chart + Quick Actions + Notifications */}
          <div className="content-grid">
            {/* Consultation Activity Chart */}
            <div className="chart-section">
              <div className="section-header">
                <h3>Consultation Activity</h3>
                <p className="section-subtitle">
                  Track your consultation trends over time
                </p>
                <div className="chart-tabs">
                  <button className="chart-tab">Daily</button>
                  <button className="chart-tab active">Weekly</button>
                  <button className="chart-tab">Monthly</button>
                </div>
              </div>
              <div className="chart-placeholder">
                <svg viewBox="0 0 600 300" className="line-chart">
                  <polyline
                    points="50,250 150,200 250,160 350,140 450,120 550,100"
                    fill="none"
                    stroke="#2b7fff"
                    strokeWidth="3"
                  />
                  <circle cx="50" cy="250" r="5" fill="#2b7fff" />
                  <circle cx="150" cy="200" r="5" fill="#2b7fff" />
                  <circle cx="250" cy="160" r="5" fill="#2b7fff" />
                  <circle cx="350" cy="140" r="5" fill="#2b7fff" />
                  <circle cx="450" cy="120" r="5" fill="#2b7fff" />
                  <circle cx="550" cy="100" r="5" fill="#2b7fff" />

                  {/* Grid lines */}
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="270"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <line
                    x1="50"
                    y1="270"
                    x2="600"
                    y2="270"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />

                  {/* Labels */}
                  <text x="30" y="55" fontSize="12" fill="#6a7282">
                    60
                  </text>
                  <text x="30" y="110" fontSize="12" fill="#6a7282">
                    50
                  </text>
                  <text x="30" y="165" fontSize="12" fill="#6a7282">
                    40
                  </text>
                  <text x="30" y="220" fontSize="12" fill="#6a7282">
                    20
                  </text>
                  <text x="30" y="275" fontSize="12" fill="#6a7282">
                    0
                  </text>

                  <text x="40" y="290" fontSize="12" fill="#6a7282">
                    Week 1
                  </text>
                  <text x="240" y="290" fontSize="12" fill="#6a7282">
                    Week 3
                  </text>
                  <text x="440" y="290" fontSize="12" fill="#6a7282">
                    Week 5
                  </text>
                </svg>
              </div>
            </div>

            {/* Quick Actions + Notifications */}
            <div className="right-panel">
              {/* Quick Actions */}
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                {quickActions.map((action, index) => (
                  <button key={index} className="quick-action-btn">
                    <img src={action.icon} alt="" />
                    <div className="action-text">
                      <span>{action.label}</span>
                      <small>{action.sublabel}</small>
                    </div>
                  </button>
                ))}
              </div>

              {/* Notifications */}
              <div className="notifications-panel">
                <div className="section-header">
                  <h3>Notifications</h3>
                  <span className="notification-count">3</span>
                </div>
                <p className="section-subtitle">Important and recent alerts</p>
                <div className="notifications-list">
                  {notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${notif.urgent ? "urgent" : ""}`}
                    >
                      <div className="notification-header">
                        <span className="notification-title">
                          {notif.title}
                        </span>
                        {notif.urgent && (
                          <span className="urgent-badge">Action Required</span>
                        )}
                      </div>
                      <p className="notification-message">{notif.message}</p>
                      <span className="notification-time">{notif.time} •</span>
                    </div>
                  ))}
                </div>
                <button className="view-all-btn">
                  View All Notifications →
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="appointments-section">
            <div className="section-header">
              <h3>Upcoming Appointments</h3>
              <p className="section-subtitle">
                Your scheduled consultations for today
              </p>
              <button className="view-all-btn-small">
                View All Appointments →
              </button>
            </div>

            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className="appointment-card">
                  <div className="appointment-header">
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div>
                        <h4>{apt.patientName}</h4>
                        <p className="patient-age">{apt.age}</p>
                        <span
                          className={`status-badge ${apt.status.toLowerCase()}`}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                    <button className="add-btn">+</button>
                  </div>
                  <div className="appointment-details">
                    <p>{apt.parentInfo}</p>
                    <p>{apt.concern}</p>
                    <p className="appointment-time">⏰ {apt.time}</p>
                  </div>
                  <button className="start-consultation-btn">
                    ▶ Start Consultation
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
