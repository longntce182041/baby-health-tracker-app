import { useEffect, useState } from "react";
import "./style/DoctorDashboard.css";
import AppointmentsCard from "./components/dashboard/AppointmentsCard";
import ConsultationChart from "./components/dashboard/ConsultationChart";
import DashboardTopbar from "./components/dashboard/DashboardTopbar";
import NotificationsCard from "./components/dashboard/NotificationsCard";
import QuickActionsCard from "./components/dashboard/QuickActionsCard";
import StatsGrid from "./components/dashboard/StatsGrid";
import DoctorSidebar from "./components/layout/DoctorSidebar";
import DoctorAppointmentsPage from "./components/appointments/DoctorAppointmentsPage";
import DoctorConsultationsPage from "./components/consultations/DoctorConsultationsPage";
import DoctorChatPage from "./components/chat/DoctorChatPage";
import {
  getDoctorConsultationStats,
  getUpcomingConsultations,
} from "./api/doctorConsultationApi";
import {
  APPOINTMENTS,
  CHART_POINTS,
  NAV_ITEMS,
  NOTIFICATIONS,
  QUICK_ACTIONS,
  STATS,
} from "./components/dashboard/dashboardData";

const formatAgeInMonths = (dateOfBirth) => {
  if (!dateOfBirth) {
    return "-";
  }

  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) {
    return "-";
  }

  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = Math.max(0, years * 12 + months);
  return `${totalMonths} months`;
};

const formatConsultationTime = (value) => {
  if (!value) {
    return "TBA";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBA";
  }

  const monthDay = date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
  });
  const clock = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${monthDay} at ${clock}`;
};

const mapConsultationToCard = (consultation) => ({
  id: consultation._id,
  consultationId: consultation._id,
  patient: consultation.baby_id?.full_name || "Unknown baby",
  age: formatAgeInMonths(consultation.baby_id?.day_of_birth),
  parent: consultation.parent_id?.full_name || "Unknown parent",
  parentId: consultation.parent_id?._id,
  babyId: consultation.baby_id?._id,
  concern: consultation.notes || "General consultation",
  time: formatConsultationTime(consultation.consultation_time),
  consultationTime: consultation.consultation_time,
  status: consultation.status || "waiting",
});

const mapStatsFromApi = (baseStats, statsData) => {
  if (!statsData) {
    return baseStats;
  }

  return baseStats.map((card) => {
    if (card.title === "Today's Consultations") {
      return {
        ...card,
        value: String(statsData.today?.total ?? 0),
        subtitle: `${statsData.today?.completed ?? 0} completed`,
      };
    }

    if (card.title === "This Week's Consultations") {
      return {
        ...card,
        value: String(statsData.week?.total ?? 0),
        subtitle: `${statsData.week?.completed ?? 0} completed`,
      };
    }

    if (card.title === "This Month's Consultations") {
      return {
        ...card,
        value: String(statsData.month?.total ?? 0),
        subtitle: `${statsData.month?.completed ?? 0} completed`,
      };
    }

    if (card.title === "Pending Consultations") {
      return {
        ...card,
        value: String(statsData.pending?.total ?? 0),
        subtitle: "Awaiting response",
      };
    }

    return card;
  });
};

function DoctorDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [appointments, setAppointments] = useState(APPOINTMENTS);
  const [stats, setStats] = useState(STATS);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setAppointmentsLoading(true);
        setAppointmentsError("");

        const [upcomingData, statsData] = await Promise.all([
          getUpcomingConsultations(10),
          getDoctorConsultationStats(),
        ]);

        const mappedAppointments = upcomingData.map(mapConsultationToCard);
        setAppointments(mappedAppointments);
        setStats(mapStatsFromApi(STATS, statsData));
      } catch (error) {
        setAppointmentsError(
          error.message || "Không thể tải danh sách lịch hẹn sắp tới",
        );
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleNavigate = (item) => {
    if (!item?.key) {
      return;
    }

    if (
      item.key === "dashboard"
      || item.key === "appointments"
      || item.key === "consultations"
    ) {
      setActivePage(item.key);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleOpenChat = (consultation) => {
    const consultationId = consultation?.consultationId || consultation?.id;
    if (!consultationId) {
      return;
    }

    setActiveConsultation({
      ...consultation,
      consultationId,
    });
    setActivePage("chat");
  };

  const handleBackToConsultations = () => {
    setActivePage("consultations");
  };

  return (
    <div className="doctor-dashboard-page" data-node-id="1224:3143">
      <DoctorSidebar
        navItems={NAV_ITEMS}
        activeItem={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <DashboardTopbar />

        {activePage === "appointments" ? (
          <DoctorAppointmentsPage />
        ) : activePage === "chat" ? (
          <DoctorChatPage
            consultation={activeConsultation}
            onBack={handleBackToConsultations}
          />
        ) : activePage === "consultations" ? (
          <DoctorConsultationsPage onOpenChat={handleOpenChat} />
        ) : (
          <section className="dashboard-content">
            <StatsGrid stats={stats} />

            <div className="mid-grid">
              <ConsultationChart points={CHART_POINTS} />
              <QuickActionsCard actions={QUICK_ACTIONS} />
            </div>

            <div className="bottom-grid">
              <AppointmentsCard
                appointments={appointments}
                loading={appointmentsLoading}
                error={appointmentsError}
                onOpenChat={handleOpenChat}
              />
              <NotificationsCard notifications={NOTIFICATIONS} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DoctorDashboard;
