const DEFAULT_LOGOUT_ICON =
    "https://www.figma.com/api/mcp/asset/64dadf1e-62ce-4e48-99d3-64bd358a98de";

function DoctorSidebar({
    navItems,
    activeItem,
    onNavigate,
    onLogout,
    brandTitle = "BabyCare",
    brandSubtitle = "Doctor Portal",
    logoutLabel = "Logout",
    logoutIcon = DEFAULT_LOGOUT_ICON,
}) {
    return (
        <aside className="doctor-sidebar" data-node-id="1224:3144">
            <header className="sidebar-header" data-node-id="1224:3145">
                <div className="brand-mark" aria-hidden="true">
                    <span>🏥</span>
                </div>

                <div className="brand-text">
                    <h1>{brandTitle}</h1>
                    <p>{brandSubtitle}</p>
                </div>
            </header>

            <nav className="sidebar-nav" aria-label="Doctor navigation">
                {navItems.map((item) => {
                    const isActive = activeItem
                        ? item.key === activeItem
                        : Boolean(item.active);

                    return (
                        <button
                            key={item.key || item.label}
                            type="button"
                            className={`nav-item ${isActive ? "is-active" : ""}`.trim()}
                            onClick={() => onNavigate?.(item)}
                        >
                            <img src={item.icon} alt="" aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <footer className="sidebar-footer">
                <button type="button" className="nav-item logout-item" onClick={onLogout}>
                    <img src={logoutIcon} alt="" aria-hidden="true" />
                    <span>{logoutLabel}</span>
                </button>
            </footer>
        </aside>
    );
}

export default DoctorSidebar;