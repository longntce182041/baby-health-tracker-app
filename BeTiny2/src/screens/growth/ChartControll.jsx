import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  button: {
    borderWidth: 1,
    borderColor: "#c4c8d3",
    borderRadius: 12.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    fontFamily: "Roboto",
    fontWeight: "500",
    fontSize: 12,
    color: "#848a9c",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontFamily: "Roboto",
    fontWeight: "500",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabActiveBackground: {
    backgroundColor: "#f4abb4",
  },
  tabActiveText: {
    color: "#FFFFFF",
  },
  tabInactiveBackground: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabInactiveText: {
    color: "#4B5563",
  },
  toggleButton: {
    height: 15,
    width: 30,
  },
  toggleBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 7.5,
  },
  toggleActiveBackground: {
    backgroundColor: "#A5F3FC",
  },
  toggleInactiveBackground: {
    backgroundColor: "#D1D5DB",
  },
  toggleThumb: {
    position: "absolute",
    top: "50%",
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginTop: -7.5,
  },
  toggleActiveThumb: {
    right: 0,
    backgroundColor: "#06B6D4",
  },
  toggleInactiveThumb: {
    left: 0,
    backgroundColor: "#9CA3AF",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 36,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  controlItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  controlLabel: {
    fontFamily: "Roboto",
    fontWeight: "400",
    fontSize: 11,
    color: "#000000",
  },
});

// Time Range Selector Component
export function TimeRangeSelector({ selected, onSelect }) {
  const options = [
    { value: "3m", label: "3 tháng" },
    { value: "6m", label: "6 tháng" },
    { value: "1y", label: "1 năm" },
    { value: "all", label: "Tất cả" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <View>
      <Pressable style={styles.button} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.buttonText}>
          {selectedOption?.label || "Tuần này"}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color="#848a9c"
        />
      </Pressable>

      {isOpen && (
        <View
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            backgroundColor: "#FFFFFF",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            zIndex: 10,
          }}
        >
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth:
                  opt.value !== options[options.length - 1].value ? 1 : 0,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <Text style={styles.buttonText}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// Metric Tabs Component
export function MetricTabs({ selected, onSelect }) {
  const tabs = [
    { id: "weight", label: "Cân nặng" },
    { id: "height", label: "Chiều cao" },
    { id: "head", label: "Vòng đầu" },
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onSelect(tab.id)}
          style={[
            styles.tab,
            selected === tab.id
              ? styles.tabActiveBackground
              : styles.tabInactiveBackground,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              selected === tab.id
                ? styles.tabActiveText
                : styles.tabInactiveText,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Toggle Switch Component
export function ToggleSwitch({ enabled, onChange }) {
  return (
    <Pressable onPress={() => onChange(!enabled)} style={styles.toggleButton}>
      <View
        style={[
          styles.toggleBackground,
          enabled
            ? styles.toggleActiveBackground
            : styles.toggleInactiveBackground,
        ]}
      />
      <View
        style={[
          styles.toggleThumb,
          enabled ? styles.toggleActiveThumb : styles.toggleInactiveThumb,
        ]}
      />
    </Pressable>
  );
}

// Chart Controls Component
export function ChartControls({
  showWHOStandard,
  onToggleWHO,
  showGenderAverage,
  onToggleGender,
  timeRange,
  onTimeRangeChange,
}) {
  return (
    <View style={styles.container}>
      {/* Time range selector */}
      <View style={styles.timeRangeContainer}>
        <TimeRangeSelector selected={timeRange} onSelect={onTimeRangeChange} />
      </View>

      {/* Toggle controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Tiêu chuẩn WHO</Text>
          <ToggleSwitch enabled={showWHOStandard} onChange={onToggleWHO} />
        </View>

        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Trung bình cùng giới tính</Text>
          <ToggleSwitch enabled={showGenderAverage} onChange={onToggleGender} />
        </View>
      </View>
    </View>
  );
}
