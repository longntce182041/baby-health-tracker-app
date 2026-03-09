import { useEffect, useMemo, useState } from "react";
import {
    endDoctorConsultation,
    getDoctorConsultations,
} from "../../api/doctorConsultationApi";

const STATUS_OPTIONS = [
    { value: "all", label: "All" },
    { value: "waiting", label: "Waiting" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "canceled", label: "Canceled" },
];

const formatTime = (value) => {
    if (!value) return "TBA";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "TBA";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatAgeInMonths = (dateOfBirth) => {
    if (!dateOfBirth) return "-";

    const birth = new Date(dateOfBirth);
    if (Number.isNaN(birth.getTime())) return "-";

    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const totalMonths = Math.max(0, years * 12 + months);
    return `${totalMonths} months`;
};

const mapConsultation = (item) => ({
    id: item._id,
    consultationId: item._id,
    displayId: `CON-${String(item._id || "").slice(-6).toUpperCase()}`,
    patient: item.baby_id?.full_name || "Unknown baby",
    babyDateOfBirth: item.baby_id?.day_of_birth,
    babyGender: item.baby_id?.gender || "-",
    babyAllergy: Array.isArray(item.baby_id?.alergy) ? item.baby_id.alergy : [],
    age: formatAgeInMonths(item.baby_id?.day_of_birth),
    parent: item.parent_id?.full_name || "Unknown parent",
    parentAvatar: item.parent_id?.avatar_url || "",
    concern: item.notes || "General consultation",
    consultationTime: item.consultation_time,
    time: formatTime(item.consultation_time),
    status: item.status || "waiting",
});

function DoctorConsultationsPage({ onOpenChat }) {
    const [status, setStatus] = useState("all");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [consultations, setConsultations] = useState([]);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [endingId, setEndingId] = useState("");

    useEffect(() => {
        const loadConsultations = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getDoctorConsultations({
                    status,
                    search: keyword || undefined,
                    limit: 200,
                });

                setConsultations(data.map(mapConsultation));
            } catch (apiError) {
                setError(apiError.message || "Cannot load consultations");
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(loadConsultations, 250);
        return () => clearTimeout(timeoutId);
    }, [status, keyword]);

    const summary = useMemo(() => {
        return consultations.reduce(
            (acc, item) => {
                acc.total += 1;
                if (item.status === "waiting") acc.waiting += 1;
                if (item.status === "in_progress") acc.inProgress += 1;
                if (item.status === "completed") acc.completed += 1;
                if (item.status === "canceled") acc.canceled += 1;
                return acc;
            },
            { total: 0, waiting: 0, inProgress: 0, completed: 0, canceled: 0 },
        );
    }, [consultations]);

    const selectedBabyDob = selectedConsultation?.babyDateOfBirth
        ? new Date(selectedConsultation.babyDateOfBirth).toLocaleDateString("en-GB")
        : "-";

    const handleEndConsultation = async (consultationId) => {
        try {
            setEndingId(consultationId);
            await endDoctorConsultation(consultationId);

            setConsultations((prev) =>
                prev.map((item) =>
                    item.id === consultationId
                        ? { ...item, status: "completed" }
                        : item,
                ),
            );

            setSelectedConsultation((prev) => {
                if (!prev || prev.id !== consultationId) return prev;
                return { ...prev, status: "completed" };
            });
        } catch (apiError) {
            setError(apiError.message || "Cannot end consultation");
        } finally {
            setEndingId("");
        }
    };

    return (
        <section className="dashboard-content consultations-page">
            <div className="consultations-hero">
                <h1>Consultations</h1>
                <p>Track your consultation sessions and parent requests</p>
            </div>

            <section className="consultation-summary-grid">
                <article className="consultation-summary-card">
                    <h4>Total</h4>
                    <strong>{summary.total}</strong>
                </article>
                <article className="consultation-summary-card">
                    <h4>Waiting</h4>
                    <strong>{summary.waiting}</strong>
                </article>
                <article className="consultation-summary-card">
                    <h4>In Progress</h4>
                    <strong>{summary.inProgress}</strong>
                </article>
                <article className="consultation-summary-card">
                    <h4>Completed</h4>
                    <strong>{summary.completed}</strong>
                </article>
                <article className="consultation-summary-card">
                    <h4>Canceled</h4>
                    <strong>{summary.canceled}</strong>
                </article>
            </section>

            <section className="consultations-list-card">
                <div className="consultations-toolbar">
                    <div className="consultations-tabs">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={status === option.value ? "active" : ""}
                                onClick={() => setStatus(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <label className="consultations-search">
                        <input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="Search patient, parent, concern..."
                        />
                    </label>
                </div>

                {loading ? <p className="list-state">Loading consultations...</p> : null}
                {!loading && error ? <p className="list-state list-error">{error}</p> : null}
                {!loading && !error && consultations.length === 0 ? (
                    <p className="list-state">No consultations found.</p>
                ) : null}

                <div className="consultation-list">
                    {!loading && !error && consultations.map((item) => (
                        <article key={item.id} className="consultation-item-card">
                            <div className="consultation-item-main">
                                <h3>{item.patient}</h3>
                                <p className="consultation-age">Age: {item.age}</p>
                                <p className="consultation-parent">Parent: {item.parent}</p>
                                <p className="consultation-concern">Concern: {item.concern}</p>
                            </div>

                            <div className="consultation-item-meta">
                                <p>{item.time}</p>
                                <span className={`consultation-status ${item.status}`.trim()}>
                                    {item.status}
                                </span>
                                <p className="consultation-id-text">ID: {item.displayId}</p>
                            </div>

                            <div className="consultation-item-actions">
                                {item.status === "in_progress" ? (
                                    <>
                                        <button
                                            type="button"
                                            className="consultation-chat-btn"
                                            onClick={() => onOpenChat?.(item)}
                                        >
                                            Open Chat
                                        </button>
                                        <button
                                            type="button"
                                            className="consultation-end-btn"
                                            onClick={() => handleEndConsultation(item.id)}
                                            disabled={endingId === item.id}
                                        >
                                            {endingId === item.id ? "Ending..." : "End Consultation"}
                                        </button>
                                    </>
                                ) : null}
                                <button
                                    type="button"
                                    className="consultation-detail-btn"
                                    onClick={() => setSelectedConsultation(item)}
                                >
                                    View details
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {selectedConsultation ? (
                <div className="consultation-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="consultation-modal">
                        <div className="consultation-modal-header">
                            <h3>Consultation Details</h3>
                            <button
                                type="button"
                                className="consultation-modal-close"
                                onClick={() => setSelectedConsultation(null)}
                                aria-label="Close consultation details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="consultation-modal-grid">
                            <section className="consultation-modal-section">
                                <h4>Baby Information</h4>
                                <p><strong>Name:</strong> {selectedConsultation.patient}</p>
                                <p><strong>Age:</strong> {selectedConsultation.age}</p>
                                <p><strong>Date of Birth:</strong> {selectedBabyDob}</p>
                                <p><strong>Gender:</strong> {selectedConsultation.babyGender}</p>
                                <p>
                                    <strong>Allergy:</strong>{" "}
                                    {selectedConsultation.babyAllergy.length > 0
                                        ? selectedConsultation.babyAllergy.join(", ")
                                        : "None"}
                                </p>
                            </section>

                            <section className="consultation-modal-section">
                                <h4>Parent Information</h4>
                                <p><strong>Name:</strong> {selectedConsultation.parent}</p>
                                <p>
                                    <strong>Avatar:</strong>{" "}
                                    {selectedConsultation.parentAvatar ? "Available" : "Not set"}
                                </p>
                                <p><strong>Time:</strong> {selectedConsultation.time}</p>
                                <p><strong>Status:</strong> {selectedConsultation.status}</p>
                                <p><strong>Concern:</strong> {selectedConsultation.concern}</p>
                            </section>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

export default DoctorConsultationsPage;
