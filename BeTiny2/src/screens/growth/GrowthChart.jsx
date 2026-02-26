import React from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Mock data for weight chart
const weightData = [
  { age: "CN", actual: 7.5, p3: 3.5, p15: 4.5, p50: 5.5, p85: 6.5, p97: 7.5 },
  { age: "2", actual: 9, p3: 5, p15: 6, p50: 7.5, p85: 9, p97: 10 },
  { age: "3", actual: 11, p3: 7, p15: 8.5, p50: 10, p85: 11.5, p97: 13 },
  { age: "4", actual: 13.5, p3: 9, p15: 11, p50: 13, p85: 15, p97: 17 },
  { age: "5", actual: 15, p3: 11, p15: 13, p50: 15.5, p85: 18, p97: 20 },
  { age: "6", actual: 14.5, p3: 12, p15: 14, p50: 16.5, p85: 19, p97: 21 },
  { age: "7", actual: 14.5, p3: 13, p15: 15, p50: 17.5, p85: 20, p97: 22 },
];

// Mock data for height chart
const heightData = [
  { age: "CN", actual: 50, p3: 46, p15: 48, p50: 50, p85: 52, p97: 54 },
  { age: "2", actual: 58, p3: 54, p15: 56, p50: 58, p85: 60, p97: 62 },
  { age: "3", actual: 62, p3: 58, p15: 60, p50: 62, p85: 64, p97: 66 },
  { age: "4", actual: 65, p3: 62, p15: 64, p50: 66, p85: 68, p97: 70 },
  { age: "5", actual: 67, p3: 64, p15: 66, p50: 68, p85: 70, p97: 72 },
  { age: "6", actual: 65.9, p3: 66, p15: 68, p50: 70, p85: 72, p97: 74 },
  { age: "7", actual: 65.9, p3: 67, p15: 69, p50: 71, p85: 73, p97: 75 },
];

// Mock data for head circumference chart
const headData = [
  { age: "CN", actual: 35, p3: 33, p15: 34, p50: 35, p85: 36, p97: 37 },
  { age: "2", actual: 39, p3: 37, p15: 38, p50: 39, p85: 40, p97: 41 },
  { age: "3", actual: 41, p3: 39, p15: 40, p50: 41, p85: 42, p97: 43 },
  {
    age: "4",
    actual: 42.5,
    p3: 40.5,
    p15: 41.5,
    p50: 42.5,
    p85: 43.5,
    p97: 44.5,
  },
  {
    age: "5",
    actual: 43.5,
    p3: 41.5,
    p15: 42.5,
    p50: 43.5,
    p85: 44.5,
    p97: 45.5,
  },
  { age: "6", actual: 44, p3: 42, p15: 43, p50: 44, p85: 45, p97: 46 },
  {
    age: "7",
    actual: 44,
    p3: 42.5,
    p15: 43.5,
    p50: 44.5,
    p85: 45.5,
    p97: 46.5,
  },
];

const metricLabels = {
  weight: "Cân nặng",
  height: "Chiều cao",
  head: "Vòng đầu",
};

const metricUnits = {
  weight: "kg",
  height: "cm",
  head: "cm",
};

export function GrowthChart({
  metric,
  timeRange,
  showWHOStandard,
  showGenderAverage,
}) {
  // Select data based on metric
  const data =
    metric === "weight"
      ? weightData
      : metric === "height"
        ? heightData
        : headData;

  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === "3m") return data.slice(0, 4);
    if (timeRange === "6m") return data.slice(0, 7);
    return data; // "1y" or "all"
  };

  const filteredData = getFilteredData();
  const latestData = filteredData[filteredData.length - 1];

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-[0px_10px_35px_0px_rgba(0,0,0,0.03)] w-full">
      <h3 className="font-['Roboto:Bold',sans-serif] font-bold text-[18px] text-[#243465] mb-4">
        {metricLabels[metric]}
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={filteredData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#04BFDA" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#04BFDA" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E1E3E8"
            vertical={false}
          />
          <XAxis
            dataKey="age"
            stroke="#848A9C"
            style={{ fontSize: "12px", fontFamily: "Nunito Sans" }}
            tickLine={false}
          />
          <YAxis
            stroke="#848A9C"
            style={{ fontSize: "12px", fontFamily: "Nunito Sans" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #E1E3E8",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} ${metricUnits[metric]}`, ""]}
          />

          {/* WHO Standard percentile curves */}
          {showWHOStandard && (
            <>
              <Line
                type="monotone"
                dataKey="p3"
                stroke="#E8E8E8"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p15"
                stroke="#D4D4D4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#C0C0C0"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p85"
                stroke="#D4D4D4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p97"
                stroke="#E8E8E8"
                strokeWidth={1.5}
                dot={false}
              />
            </>
          )}

          {/* Gender average line */}
          {showGenderAverage && (
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#E1E3E8"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          )}

          {/* Actual data with area fill */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="none"
            fill="url(#actualGradient)"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#04BFDA"
            strokeWidth={2.5}
            dot={{ fill: "#FFA84A", stroke: "#FFA84A", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Latest measurement indicator */}
      <div className="mt-2 ml-4">
        <div className="inline-flex items-center bg-white rounded-lg px-3 py-1.5 shadow-md">
          <span className="font-['Roboto:Medium',sans-serif] font-medium text-[11px] text-[#243465]">
            {latestData.actual} {metricUnits[metric]}
          </span>
        </div>
      </div>
    </div>
  );
}

// KHAI BÁO PROPTYPES THAY THẾ CHO INTERFACE
GrowthChart.propTypes = {
  metric: PropTypes.oneOf(["weight", "height", "head"]).isRequired,
  timeRange: PropTypes.oneOf(["3m", "6m", "1y", "all"]).isRequired,
  showWHOStandard: PropTypes.bool.isRequired,
  showGenderAverage: PropTypes.bool.isRequired,
};
