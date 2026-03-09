function NotificationsCard({ notifications }) {
    return (
        <section className="notifications-card">
            <div className="card-header">
                <div>
                    <h3>Notifications</h3>
                    <p>Stay updated with important alerts</p>
                </div>
                <span className="alert-count">3</span>
            </div>

            <div className="notifications-list">
                {notifications.map((item) => (
                    <article key={item.title + item.time} className="notification-item">
                        <div className={`bullet type-${item.type}`} />
                        <div>
                            <h4>{item.title}</h4>
                            <p>{item.detail}</p>
                            <time>{item.time}</time>
                            {item.action ? <span className="action-chip">{item.action}</span> : null}
                        </div>
                    </article>
                ))}
            </div>

            <button type="button" className="view-link">
                View All Notifications →
            </button>
        </section>
    );
}

export default NotificationsCard;
