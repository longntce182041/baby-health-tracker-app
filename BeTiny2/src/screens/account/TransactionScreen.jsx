import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getTransactions } from "../../api/userApi";
import { getItem } from "../../storage";

import { useAuth } from "../../context/AuthContext";

function formatDate(str) {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return isNaN(d.getTime())
      ? str
      : d.toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return str;
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("vi-VN") + " đ";
}

function getStatusMeta(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "completed") {
    return { label: "Thành công", bg: "#E8F5E9", text: "#2E7D32" };
  }
  if (normalized === "pending") {
    return { label: "Đang xử lý", bg: "#FFF8E1", text: "#B26A00" };
  }
  if (normalized === "failed") {
    return { label: "Thất bại", bg: "#FDECEA", text: "#C62828" };
  }
  if (normalized === "cancelled") {
    return { label: "Đã hủy", bg: "#F1F3F4", text: "#5F6368" };
  }
  return { label: status || "Không rõ", bg: "#F1F3F4", text: "#5F6368" };
}

export default function TransactionScreen({ navigation }) {
  const { isLoggedIn, user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const parentIdFromContext = user?.parent_id || user?.parentId || null;
        console.log(
          "[TransactionScreen] parent_id from context:",
          parentIdFromContext,
        );

        let parentIdFromStorage = null;
        if (!parentIdFromContext) {
          const rawUser = await getItem("user");
          console.log("[TransactionScreen] raw user from storage:", rawUser);
          if (rawUser) {
            try {
              const parsed = JSON.parse(rawUser);
              parentIdFromStorage =
                parsed?.parent_id || parsed?.parentId || null;
            } catch (parseErr) {
              console.log(
                "[TransactionScreen] parse storage user failed:",
                parseErr?.message || parseErr,
              );
            }
          }
        }

        const resolvedParentId =
          parentIdFromContext || parentIdFromStorage || null;
        console.log(
          "[TransactionScreen] resolved parent_id:",
          resolvedParentId,
        );

        const res = await getTransactions(
          resolvedParentId ? { parent_id: resolvedParentId } : {},
        );
        console.log("[TransactionScreen] getTransactions response:", res);

        if (res?.success && Array.isArray(res?.data)) setList(res.data);
        else setList([]);
      } catch (e) {
        console.log(
          "[TransactionScreen] getTransactions error:",
          e?.response?.data || e?.message || e,
        );
        setList([]);
      }
      setLoading(false);
    })();
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>
          Vui lòng đăng nhập để xem lịch sử giao dịch
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử giao dịch</Text>
      <FlatList
        data={list}
        keyExtractor={(item) =>
          item._id || item.transaction_id || item.id || String(Math.random())
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có giao dịch</Text>}
        renderItem={({ item }) => {
          const statusMeta = getStatusMeta(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Giao dịch nạp điểm</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusMeta.bg },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusMeta.text }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Số tiền</Text>
                <Text style={styles.valueStrong}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Điểm nhận</Text>
                <Text style={styles.value}>
                  +{item.points ?? item.point_received ?? 0}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Ngày giao dịch</Text>
                <Text style={styles.value}>
                  {formatDate(item.transaction_date || item.created_at)}
                </Text>
              </View>

              <View style={styles.rowTop}>
                <Text style={styles.label}>Mô tả</Text>
                <Text style={styles.valueDesc}>
                  {item.description || "Không có mô tả"}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D2D2D",
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  list: { padding: 16, paddingTop: 12 },
  hint: { color: "#666", fontSize: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EDEEF2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: "#6C7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#23262F",
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  valueStrong: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "800",
  },
  valueDesc: {
    fontSize: 13,
    color: "#3A3F4A",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  empty: { color: "#666", textAlign: "center", padding: 24, fontSize: 14 },
});
