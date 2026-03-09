function QuickActionsCard({ actions }) {
    return (
        <aside className="quick-actions-card">
            <h3>Quick Actions</h3>
            {actions.map((action) => (
                <button type="button" key={action.title} className="quick-item">
                    <span>{action.icon}</span>
                    <div>
                        <strong>{action.title}</strong>
                        <p>{action.subtitle}</p>
                    </div>
                </button>
            ))}
        </aside>
    );
}

export default QuickActionsCard;
