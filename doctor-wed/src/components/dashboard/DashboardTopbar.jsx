import { BELL_ICON, SEARCH_ICON } from "./dashboardData";

function DashboardTopbar() {
    return (
        <header className="dashboard-topbar" data-node-id="1224:3209">
            <div>
                <h2>Doctor Dashboard</h2>
                <p>Welcome back, Dr. Michael Chen</p>
            </div>

            <div className="topbar-right">
                <label className="search-box">
                    <img src={SEARCH_ICON} alt="" aria-hidden="true" />
                    <input placeholder="Search patients, appointments..." />
                </label>

                <button type="button" className="bell-button" aria-label="Notifications">
                    <img src={BELL_ICON} alt="" aria-hidden="true" />
                    <span />
                </button>

                <div className="doctor-profile">
                    <div>
                        <h4>Dr. Michael Chen</h4>
                        <p>Pediatrician</p>
                    </div>
                    <div className="avatar">MC</div>
                </div>
            </div>
        </header>
    );
}

export default DashboardTopbar;
