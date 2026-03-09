function AppointmentsCard({ appointments, loading, error, onOpenChat }) {
    const pendingCount = appointments.length;

    return (
        <section className="appointments-card">
            <div className="card-header">
                <div>
                    <h3>Upcoming Appointments</h3>
                    <p>Your scheduled consultations for today</p>
                </div>
                <span className="pill">{pendingCount} pending</span>
            </div>

            <div className="appointments-list">
                {loading ? <p className="list-state">Loading upcoming appointments...</p> : null}
                {!loading && error ? <p className="list-state list-error">{error}</p> : null}
                {!loading && !error && appointments.length === 0 ? (
                    <p className="list-state">No upcoming appointments.</p>
                ) : null}

                {!loading && !error && appointments.map((item) => (
                    <article key={item.id || `${item.patient}-${item.time}`} className="appointment-item">
                        <div className="appointment-top">
                            <div className="patient-avatar">👤</div>
                            <div className="patient-info">
                                <h4>
                                    {item.patient} <small>({item.age})</small>
                                </h4>
                                <p>Parent: {item.parent}</p>
                                <p>Concern: {item.concern}</p>
                                <time>{item.time}</time>
                            </div>
                        </div>

                        <div className="appointment-actions">
                            <button
                                type="button"
                                className="start-btn"
                                onClick={() => onOpenChat?.(item)}
                                disabled={item.status !== "in_progress"}
                            >
                                {item.status === "in_progress" ? "Open Chat" : "Waiting for start time"}
                            </button>
                            <button type="button" className="icon-btn">
                                👁
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            <button type="button" className="view-link">
                View All Appointments →
            </button>
        </section>
    );
}

export default AppointmentsCard;
