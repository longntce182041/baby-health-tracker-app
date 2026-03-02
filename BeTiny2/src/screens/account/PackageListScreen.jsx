import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getPackages, subscribePackage } from '../../api/packageApi';
import { useAuth } from '../../context/AuthContext';

export default function PackageListScreen({ navigation }) {
  const { isLoggedIn } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPackages();
        if (res?.success && Array.isArray(res?.data)) setPackages(res.data);
        else setPackages([]);
      } catch (e) {
        setPackages([]);
      }
      setLoading(false);
    })();
  }, []);

  const handleSubscribe = async (pkgId) => {
    if (!isLoggedIn) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua gói');
      navigation.navigate('Login');
      return;
    }
    setSubscribingId(pkgId);
    try {
      await subscribePackage(pkgId);
      Alert.alert('Thành công', 'Đã đăng ký gói');
    } catch (e) {
      Alert.alert('Lỗi', e?.message || 'Không thể mua gói');
    }
    setSubscribingId(null);
  };

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
        data={packages}
        keyExtractor={(item) => item.package_id || item.id || String(Math.random())}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có gói dịch vụ</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name || '—'}</Text>
            <Text style={styles.cardPrice}>{item.price ?? 0} đ</Text>
            <Text style={styles.cardDesc}>Tư vấn miễn phí: {item.free_consultation ?? 0} lần</Text>
            <Text style={styles.cardDesc}>{item.description || ''}</Text>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => handleSubscribe(item.package_id || item.id)}
              disabled={subscribingId !== null}
            >
              {subscribingId === (item.package_id || item.id) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Mua gói</Text>
              )}
            </TouchableOpacity>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardPrice: { fontSize: 18, fontWeight: '700', color: '#4A90E2', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#666', marginBottom: 4 },
  btn: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', padding: 24 },
});
