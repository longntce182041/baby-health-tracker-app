import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { login as loginService } from '../../api/authApi';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

function isValidVietnamPhone(phone) {
  const cleaned = (phone || '').replace(/\s/g, '');
  return /^0(2|3|5|7|8|9)[0-9]{8}$/.test(cleaned);
}

const TEST_PHONE = '0901234567';
const TEST_PASSWORD = '123456';

const inputShadow = {
  backgroundColor: colors.white,
  borderRadius: 15,
  paddingHorizontal: 20,
  paddingVertical: 18,
  borderWidth: 1,
  borderColor: colors.pinkLight,
  shadowColor: '#F4ABB4',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ phone: false, password: false });
  const [focused, setFocused] = useState({ phone: false, password: false });
  const { login } = useAuth();

  const isFormValid = Boolean(phone.trim() && isValidVietnamPhone(phone) && password);
  const showErrorPhone = touched.phone && (!phone.trim() || !isValidVietnamPhone(phone));
  const showErrorPassword = touched.password && !password;

  const handleSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!isValidVietnamPhone(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu 03/05/07/08/09)');
      return;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }
    setLoading(true);
    try {
      const res = await loginService({ phone: phone.trim(), password });
      if (res?.success) {
        login(res.data?.user);
        Alert.alert('Thành công', res.message || 'Đăng nhập thành công');
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        Alert.alert('Lỗi', res?.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', error?.message || error?.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../../assets/images/logoBeTiny.bmp')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.formTitle}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng trở lại</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Số điện thoại</Text>
          <View style={[styles.inputBox, focused.phone && styles.inputFocused, showErrorPhone && styles.inputError]}>
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#c5c5c5"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocused((f) => ({ ...f, phone: true }))}
              onBlur={() => { setFocused((f) => ({ ...f, phone: false })); setTouched((t) => ({ ...t, phone: true })); }}
              keyboardType="phone-pad"
            />
          </View>
          {showErrorPhone && (
            <Text style={styles.errorText}>
              {!phone.trim() ? 'Vui lòng nhập số điện thoại' : 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu 03/05/07/08/09)'}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Mật khẩu</Text>
          <View style={[styles.inputBox, focused.password && styles.inputFocused, showErrorPassword && styles.inputError]}>
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#c5c5c5"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused((f) => ({ ...f, password: true }))}
              onBlur={() => { setFocused((f) => ({ ...f, password: false })); setTouched((t) => ({ ...t, password: true })); }}
              secureTextEntry
            />
          </View>
          {showErrorPassword && <Text style={styles.errorText}>Vui lòng nhập mật khẩu</Text>}
        </View>

        <TouchableOpacity style={[styles.btn, !isFormValid && styles.btnDisabled]} onPress={handleSubmit} disabled={loading || !isFormValid} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>hoặc</Text>

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testHintBtn}
          onPress={() => { setPhone(TEST_PHONE); setPassword(TEST_PASSWORD); setTouched({ phone: false, password: false }); }}
          activeOpacity={0.8}
        >
          <Text style={styles.testHintText}>Điền nhanh tài khoản test: {TEST_PHONE} / {TEST_PASSWORD}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentWrap: { flexGrow: 1, paddingBottom: 32 },
  topSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    marginTop: 40,
  },
  backBtn: { marginBottom: 12 },
  logoSection: { alignItems: 'center' },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  logo: { width: '100%', height: '100%' },
  formTitle: { ...typography.H1, fontFamily, color: colors.pinkAccent, textAlign: 'center', marginTop: 4, marginBottom: 6, fontWeight: '800' },
  subtitle: { ...typography.PSmall, fontFamily, color: colors.textMuted, textAlign: 'center' },
  formCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
    minHeight: 400,
    overflow: 'visible',
    marginTop: 8,
  },
  fieldWrap: { marginBottom: 14, overflow: 'visible' },
  labelOnBorder: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    marginLeft: 10,
    marginBottom: -4,
    zIndex: 1,
    letterSpacing: 0.5,
  },
  inputBox: {
    ...inputShadow,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  inputBoxSmall: {
    ...inputShadow,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 20,
  },
  inputInner: {
    ...typography.P,
    fontFamily,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  inputInnerSmall: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  inputFocused: {
    borderWidth: 2.3,
    borderColor: colors.pinkAccent,
    shadowColor: colors.pinkAccent,
    shadowOpacity: 0.15,
  },
  inputError: {
    borderWidth: 1.3,
    borderColor: '#dd4949',
    shadowColor: '#E57373',
    shadowOpacity: 0.2,
  },
  errorText: { ...typography.PSmall, fontFamily, color: '#E57373', marginTop: 6, marginLeft: 4 },
  testHintBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.pinkLight,
    borderStyle: 'dashed',
  },
  testHintText: { ...typography.PSmall, fontFamily, color: colors.textMuted, textAlign: 'center' },
  btn: {
    width: '100%',
    backgroundColor: colors.pinkAccent,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F4ABB4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  btnDisabled: {
    backgroundColor: colors.pinkLight,
    shadowOpacity: 0.1,
    opacity: 0.8,
  },
  btnText: { ...typography.P, fontFamily, color: colors.white, fontWeight: '700', fontSize: 17 },
  or: { ...typography.PSmall, fontFamily, color: colors.textMuted, textAlign: 'center', marginTop: 20, marginBottom: 12 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleIcon: { fontSize: 20, fontWeight: '700', color: '#4285F4', marginRight: 10 },
  googleText: { ...typography.P, fontFamily, color: colors.text },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { ...typography.PSmall, fontFamily, color: colors.textMuted },
  footerLink: { ...typography.PSmall, fontFamily, color: colors.pinkAccent, fontWeight: '600', textDecorationLine: 'underline' },
});
