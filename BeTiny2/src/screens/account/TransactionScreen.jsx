import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getTransactions } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';

function formatDate(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? str : d.toLocaleDateString('vi-VN');
  } catch {
    return str;
  }
}

export default function TransactionScreen({ navigation }) {
  const { isLoggedIn } = useAuth();
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
        const res = await getTransactions();
        if (res?.success && Array.isArray(res?.data)) setList(res.data);
        else setList([]);
      } catch (e) {
        setList([]);
      }
      setLoading(false);
    })();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.hint}>Vui lòng đăng nhập để xem lịch sử giao dịch</Text>
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
      <FlatList
        data={list}
        keyExtractor={(item) => item.transaction_id || item.id || String(Math.random())}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có giao dịch</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Số tiền: {item.amount ?? 0} · Điểm nhận: {item.point_received ?? 0}</Text>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  hint: { color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  cardDate: { fontSize: 12, color: '#999', marginTop: 4 },
  empty: { color: '#666', textAlign: 'center', padding: 24 },
});
