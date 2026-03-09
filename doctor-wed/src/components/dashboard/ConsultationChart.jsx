function buildChartPath(data, width, height, pad) {
    const max = 60;
    const stepX = (width - pad * 2) / (data.length - 1);
    return data
        .map((value, index) => {
            const x = pad + index * stepX;
            const y = height - pad - (value / max) * (height - pad * 2);
            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ");
}

function ConsultationChart({ points }) {
    const chartPath = buildChartPath(points, 920, 280, 30);

    return (
        <section className="chart-card">
            <div className="card-title-row">
                <div>
                    <h3>Consultation Activity</h3>
                    <p>Track your consultation trends over time</p>
                </div>
                <div className="segment-control">
                    <button type="button">Daily</button>
                    <button type="button" className="active">
                        Weekly
                    </button>
                    <button type="button">Monthly</button>
                </div>
            </div>

            <div className="chart-area">
                <svg viewBox="0 0 920 280" role="img" aria-label="Consultation activity chart">
                    <path d="M 30 250 L 890 250" className="axis" />
                    <path d="M 30 30 L 30 250" className="axis" />
                    <path d={chartPath} className="line" />
                    {points.map((value, index) => {
                        const x = 30 + (index * (920 - 60)) / (points.length - 1);
                        const y = 250 - (value / 60) * (250 - 30);
                        return <circle key={value + index} cx={x} cy={y} r="4" className="dot" />;
                    })}
                </svg>
                <div className="chart-labels">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                </div>
            </div>
        </section>
    );
}

export default ConsultationChart;
