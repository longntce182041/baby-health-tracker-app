import { useEffect, useMemo, useState } from "react";
import {
    getDoctorOwnSchedules,
    registerDoctorScheduleDay,
} from "../../api/doctorScheduleApi";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
};

const formatMonthYear = (date) =>
    date.toLocaleString("en-US", { month: "long", year: "numeric" });

const formatDateLabel = (dateKey) => {
    if (!dateKey) return "";
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTimeLabel = (time) => time || "--:--";

function DoctorAppointmentsPage() {
    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));
    const [viewMode, setViewMode] = useState("week");
    const [scheduleMap, setScheduleMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [registerError, setRegisterError] = useState("");
    const [registerDate, setRegisterDate] = useState(() => toDateKey(today));
    const [registerNote, setRegisterNote] = useState("");
    const [registerSlots, setRegisterSlots] = useState([
        { start_time: "08:00", end_time: "09:00" },
    ]);

    const weekStart = useMemo(() => getWeekStart(new Date(selectedDate)), [selectedDate]);
    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + index);
            return d;
        });
    }, [weekStart]);

    const monthDates = useMemo(() => {
        const base = new Date(selectedDate);
        const year = base.getFullYear();
        const month = base.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: totalDays }, (_, index) => {
            const d = new Date(year, month, index + 1);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    }, [selectedDate]);

    const displayedDates = useMemo(
        () => (viewMode === "month" ? monthDates : weekDates),
        [viewMode, monthDates, weekDates],
    );

    const loadSchedule = async (dates) => {
        try {
            setLoading(true);
            setError("");

            const fromDate = toDateKey(dates[0]);
            const toDate = toDateKey(dates[dates.length - 1]);
            const data = await getDoctorOwnSchedules({ fromDate, toDate });

            const map = data.reduce((acc, day) => {
                acc[day.date] = day;
                return acc;
            }, {});

            setScheduleMap(map);
        } catch (apiError) {
            setError(apiError.message || "Không thể tải lịch làm việc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedule(displayedDates);
    }, [displayedDates]);

    const selectedSchedule = scheduleMap[selectedDate];
    const slots = selectedSchedule?.slots || [];
    const availableCount = slots.filter((slot) => slot.booked_count === 0).length;
    const bookedCount = slots.filter((slot) => slot.booked_count > 0).length;

    const handleSelectDate = (dateKey, hasSchedule) => {
        setSelectedDate(dateKey);
        if (hasSchedule) {
            requestAnimationFrame(() => {
                const slotSection = document.getElementById("daily-slot-section");
                if (slotSection) {
                    slotSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }
    };

    const handleOpenRegisterModal = () => {
        setRegisterError("");
        setRegisterDate(selectedDate);
        setRegisterNote("");
        setRegisterSlots([{ start_time: "08:00", end_time: "09:00" }]);
        setIsRegisterModalOpen(true);
    };

    const handleSlotChange = (index, field, value) => {
        setRegisterSlots((prev) =>
            prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
        );
    };

    const handleAddSlot = () => {
        setRegisterSlots((prev) => [...prev, { start_time: "", end_time: "" }]);
    };

    const handleRemoveSlot = (index) => {
        setRegisterSlots((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitRegister = async () => {
        try {
            setRegistering(true);
            setRegisterError("");

            const cleanSlots = registerSlots
                .map((slot) => ({
                    start_time: slot.start_time?.trim(),
                    end_time: slot.end_time?.trim(),
                }))
                .filter((slot) => slot.start_time && slot.end_time);

            if (cleanSlots.length === 0) {
                setRegisterError("Vui lòng nhập ít nhất một khung giờ hợp lệ");
                return;
            }

            if (!registerDate) {
                setRegisterError("Vui lòng chọn ngày làm việc");
                return;
            }

            await registerDoctorScheduleDay({
                date: registerDate,
                slots: cleanSlots,
                note: registerNote,
            });

            setSelectedDate(registerDate);
            await loadSchedule(displayedDates);
            setIsRegisterModalOpen(false);
        } catch (apiError) {
            setRegisterError(apiError.message || "Đăng kí lịch làm việc thất bại");
        } finally {
            setRegistering(false);
        }
    };

    return (
        <section className="dashboard-content appointments-page">
            <div className="appointments-hero">
                <h1>My Schedule</h1>
                <p>Manage your availability and working hours</p>
            </div>

            <div className="appointments-top-grid">
                <section className="schedule-calendar-card">
                    <div className="schedule-calendar-header">
                        <div>
                            <h3>{formatMonthYear(new Date(selectedDate))}</h3>
                            <p>Select a date to manage time slots</p>
                        </div>
                        <div className="schedule-tabs">
                            <button
                                type="button"
                                className={viewMode === "week" ? "active" : ""}
                                onClick={() => setViewMode("week")}
                            >
                                Week
                            </button>
                            <button
                                type="button"
                                className={viewMode === "month" ? "active" : ""}
                                onClick={() => setViewMode("month")}
                            >
                                Month
                            </button>
                        </div>
                    </div>

                    <div className={`schedule-date-grid ${viewMode === "month" ? "is-month" : ""}`.trim()}>
                        {displayedDates.map((date) => {
                            const key = toDateKey(date);
                            const isSelected = key === selectedDate;
                            const hasSchedule = (scheduleMap[key]?.slots || []).length > 0;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`day-cell ${hasSchedule ? "has-schedule" : ""} ${isSelected ? "is-selected" : ""}`.trim()}
                                    onClick={() => handleSelectDate(key, hasSchedule)}
                                >
                                    <small>{WEEK_DAYS[date.getDay()]}</small>
                                    <strong>{date.getDate()}</strong>
                                </button>
                            );
                        })}
                    </div>

                </section>

                <aside className="schedule-legend-card">
                    <h3>Schedule Legend</h3>
                    <div className="legend-item"><span className="dot-available" />Available</div>
                    <div className="legend-item"><span className="dot-booked" />Booked</div>
                    <div className="legend-item"><span className="dot-unavailable" />Unavailable</div>
                    <p className="legend-note">
                        Booked slots are automatically locked and cannot be edited or deleted.
                    </p>
                </aside>
            </div>

            <section id="daily-slot-section" className="time-slot-grid-card">
                <div className="card-header">
                    <div>
                        <h3>Schedule on {formatDateLabel(selectedDate)}</h3>
                        <p>{availableCount} available • {bookedCount} booked</p>
                    </div>
                </div>

                {loading ? <p className="list-state">Loading schedule...</p> : null}
                {!loading && error ? <p className="list-state list-error">{error}</p> : null}
                {!loading && !error && slots.length === 0 ? (
                    <p className="list-state">No schedule slots for this date.</p>
                ) : null}

                <div className="slot-grid">
                    {!loading && !error && slots.map((slot) => {
                        const isBooked = slot.booked_count > 0;
                        return (
                            <article
                                key={`${slot.start_time}-${slot.end_time}`}
                                className={`slot-card ${isBooked ? "is-booked" : "is-available"}`.trim()}
                            >
                                <h4>{formatTimeLabel(slot.start_time)}</h4>
                                <span className={`slot-pill ${isBooked ? "booked" : "available"}`.trim()}>
                                    {isBooked ? "Booked" : "Available"}
                                </span>
                                <p>{isBooked ? "Video" : "Video"}</p>
                                {isBooked && slot.patient_names?.[0] ? <strong>{slot.patient_names[0]}</strong> : null}
                            </article>
                        );
                    })}
                </div>
            </section>

            {isRegisterModalOpen ? (
                <div className="schedule-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="schedule-modal">
                        <h3>Đăng kí lịch làm việc</h3>

                        <label>
                            Ngày làm việc
                            <input
                                type="date"
                                value={registerDate}
                                onChange={(event) => setRegisterDate(event.target.value)}
                            />
                        </label>

                        <label>
                            Ghi chú
                            <input
                                value={registerNote}
                                onChange={(event) => setRegisterNote(event.target.value)}
                                placeholder="Available for consultation"
                            />
                        </label>

                        <div className="slot-form-list">
                            {registerSlots.map((slot, index) => (
                                <div key={`${slot.start_time}-${slot.end_time}-${index}`} className="slot-form-row">
                                    <input
                                        type="time"
                                        value={slot.start_time}
                                        onChange={(event) =>
                                            handleSlotChange(index, "start_time", event.target.value)
                                        }
                                    />
                                    <input
                                        type="time"
                                        value={slot.end_time}
                                        onChange={(event) =>
                                            handleSlotChange(index, "end_time", event.target.value)
                                        }
                                    />
                                    {registerSlots.length > 1 ? (
                                        <button
                                            type="button"
                                            className="remove-slot-btn"
                                            onClick={() => handleRemoveSlot(index)}
                                        >
                                            Remove
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        <button type="button" className="add-slot-btn" onClick={handleAddSlot}>
                            + Add slot
                        </button>

                        {registerError ? <p className="list-state list-error">{registerError}</p> : null}

                        <div className="schedule-modal-actions">
                            <button
                                type="button"
                                onClick={() => setIsRegisterModalOpen(false)}
                                disabled={registering}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="primary"
                                onClick={handleSubmitRegister}
                                disabled={registering}
                            >
                                {registering ? "Saving..." : "Register"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <button
                type="button"
                className="floating-register-btn"
                onClick={handleOpenRegisterModal}
                aria-label="Đăng kí lịch làm việc"
                title="Đăng kí lịch làm việc"
            >
                <span className="floating-register-btn-plus" aria-hidden="true" />
            </button>
        </section>
    );
}

export default DoctorAppointmentsPage;
