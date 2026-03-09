function StatsGrid({ stats }) {
    return (
        <div className="stats-grid">
            {stats.map((card) => (
                <article key={card.title} className="stat-card">
                    <div className={`stat-icon tone-${card.tone}`}>{card.icon}</div>
                    <h3>{card.title}</h3>
                    <strong>{card.value}</strong>
                    <p>{card.subtitle}</p>
                    <small>{card.trend}</small>
                </article>
            ))}
        </div>
    );
}

export default StatsGrid;
