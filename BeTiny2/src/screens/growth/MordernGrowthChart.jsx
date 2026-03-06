import React from "react";
import PropTypes from "prop-types";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

// Metric config with WHO standards
const metricConfig = {
  weight: {
    label: "Weight Tracking",
    unit: "kg",
    color: "#F4ABB4",
    data: [], // sẽ được override từ props
  },
  height: {
    label: "Height Tracking",
    unit: "cm",
    color: "#6B9BE8",
    data: [],
  },
  head: {
    label: "Head Circumference Tracking",
    unit: "cm",
    color: "#6BD4B8",
    data: [],
  },
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#243465",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#7B8794",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendDashedLine: {
    width: 20,
    borderBottomWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C7CBD4",
  },
  legendArea: {
    width: 20,
    height: 10,
    borderRadius: 4,
    opacity: 0.25,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginVertical: 40,
  },
});

export function ModernGrowthChart({
  metric = "weight",
  timeRange = "6m",
  recordsData = [],
}) {
  const config = metricConfig[metric];
  const screenWidth = Dimensions.get("window").width;

  // Lọc dữ liệu theo timeRange
  const getFilteredData = () => {
    if (recordsData.length === 0) return [];

    const now = new Date();
    let cutoffDate = new Date(now);

    if (timeRange === "3m") cutoffDate.setMonth(now.getMonth() - 3);
    else if (timeRange === "6m") cutoffDate.setMonth(now.getMonth() - 6);
    else if (timeRange === "1y") cutoffDate.setFullYear(now.getFullYear() - 1);
    // "all" không filter

    return recordsData.filter((record) => {
      const recordDate = new Date(record.recorded_at);
      return recordDate >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();

  if (filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
      </View>
    );
  }

  // Tính min/max để scale trục Y
  const values = filteredData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const padding = range * 0.2;
  const yMin = Math.max(0, Math.floor((minVal - padding) * 10) / 10);
  const yMax = Math.ceil((maxVal + padding) * 10) / 10;

  // Prepare chart data
  const chartData = {
    labels: filteredData.map((d, i) => (i % 2 === 0 ? d.label : "")), // Giảm label để không quá dày
    datasets: [
      {
        data: filteredData.map((d) => d.value),
        color: () => config.color,
        strokeWidth: 3,
        withDots: true,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(107,114,128,${opacity})`,
    labelColor: (opacity = 1) => `rgba(107,114,128,${opacity})`,
    propsForBackgroundLines: {
      stroke: "#E5E7EB",
      strokeDasharray: "4 4",
      strokeWidth: 1,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: config.color,
      fill: "#FFFFFF",
    },
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 56}
        height={280}
        chartConfig={chartConfig}
        bezier
        style={{ marginLeft: -10, borderRadius: 16 }}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
        segments={4}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendLine, { backgroundColor: config.color }]}
          />
          <Text style={styles.legendText}>Chỉ số của bé</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendArea, { backgroundColor: config.color }]}
          />
          <Text style={styles.legendText}>Chuẩn WHO</Text>
        </View>
      </View>
    </View>
  );
}

ModernGrowthChart.propTypes = {
  metric: PropTypes.oneOf(["weight", "height", "head"]),
  timeRange: PropTypes.oneOf(["3m", "6m", "1y", "all"]),
  recordsData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      recorded_at: PropTypes.string.isRequired,
    }),
  ),
};
