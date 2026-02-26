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
import { register as registerService } from '../../api/authApi';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

function isValidVietnamPhone(phone) {
  const cleaned = (phone || '').replace(/\s/g, '');
  return /^0(2|3|5|7|8|9)[0-9]{8}$/.test(cleaned);
}

function isValidFullName(name) {
  const trimmed = (name || '').trim();
  return trimmed.length >= 2 && trimmed.length <= 70;
}

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, phone: false, password: false, confirmPassword: false });
  const [focused, setFocused] = useState({ fullName: false, phone: false, password: false, confirmPassword: false });
  const { login } = useAuth();

  const isFormValid = Boolean(
    isValidFullName(form.fullName) &&
    form.phone?.trim() &&
    isValidVietnamPhone(form.phone) &&
    form.password &&
    form.confirmPassword &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword
  );
  const showErrorFullName = touched.fullName && !isValidFullName(form.fullName);
  const showErrorPhone = touched.phone && (!form.phone?.trim() || !isValidVietnamPhone(form.phone));
  const showErrorPassword = touched.password && (!form.password || form.password.length < 6);
  const showErrorConfirm = touched.confirmPassword && (
    !form.confirmPassword || form.password !== form.confirmPassword
  );

  const handleSubmit = async () => {
    if (!isValidFullName(form.fullName)) {
      const t = (form.fullName || '').trim();
      if (!t) Alert.alert('Lỗi', 'Vui lòng nhập Họ và tên');
      else if (t.length < 2) Alert.alert('Lỗi', 'Họ và tên ít nhất 2 ký tự');
      else Alert.alert('Lỗi', 'Họ và tên tối đa 70 ký tự');
      return;
    }
    if (!form.phone?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!isValidVietnamPhone(form.phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu 03/05/07/08/09)');
      return;
    }
    if (!form.password || form.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Lỗi', 'Xác nhận mật khẩu không khớp');
      return;
    }
    setLoading(true);
    try {
      const res = await registerService({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if (res?.success) {
        login(res.data?.user);
        Alert.alert('Thành công', res.message || 'Đăng ký thành công');
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        Alert.alert('Lỗi', res?.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', error?.message || error?.response?.data?.message || 'Đăng ký thất bại');
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
          <Text style={styles.formTitle}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Cùng chăm sóc sức khỏe bé yêu mỗi ngày</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Họ và tên</Text>
          <View style={[styles.inputBox, focused.fullName && styles.inputBoxFocused, showErrorFullName && styles.inputBoxError]}>
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#c5c5c5"
              value={form.fullName}
              onChangeText={(v) => setForm((f) => ({ ...f, fullName: v }))}
              onFocus={() => setFocused((f) => ({ ...f, fullName: true }))}
              onBlur={() => { setFocused((f) => ({ ...f, fullName: false })); setTouched((t) => ({ ...t, fullName: true })); }}
              maxLength={70}
            />
          </View>
          {showErrorFullName && (
            <Text style={styles.errorText}>
              {(form.fullName || '').trim().length === 0
                ? 'Vui lòng nhập Họ và tên'
                : (form.fullName || '').trim().length < 2
                  ? 'Họ và tên ít nhất 2 ký tự'
                  : 'Họ và tên tối đa 70 ký tự'}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Số điện thoại</Text>
          <View style={[styles.inputBox, focused.phone && styles.inputBoxFocused, showErrorPhone && styles.inputBoxError]}>
            <TextInput
              style={styles.inputInnerSmall}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#c5c5c5"
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              onFocus={() => setFocused((f) => ({ ...f, phone: true }))}
              onBlur={() => { setFocused((f) => ({ ...f, phone: false })); setTouched((t) => ({ ...t, phone: true })); }}
              keyboardType="phone-pad"
            />
          </View>
          {showErrorPhone && (
            <Text style={styles.errorText}>
              {!form.phone?.trim() ? 'Vui lòng nhập số điện thoại' : 'Số điện thoại không đúng định dạng Việt Nam (10 số, bắt đầu 03/05/07/08/09)'}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Mật khẩu</Text>
          <View style={[styles.inputBoxSmall, focused.password && styles.inputBoxFocused, showErrorPassword && styles.inputBoxError]}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputInnerSmall}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#c5c5c5"
                value={form.password}
                onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                onFocus={() => setFocused((f) => ({ ...f, password: true }))}
                onBlur={() => { setFocused((f) => ({ ...f, password: false })); setTouched((t) => ({ ...t, password: true })); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((s) => !s)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          {showErrorPassword && (
            <Text style={styles.errorText}>
              {!form.password ? 'Vui lòng nhập mật khẩu' : 'Mật khẩu ít nhất 6 ký tự'}
            </Text>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.labelOnBorder}>Xác nhận mật khẩu</Text>
          <View style={[styles.inputBoxSmall, focused.confirmPassword && styles.inputBoxFocused, showErrorConfirm && styles.inputBoxError]}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputInnerSmall}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#c5c5c5"
                value={form.confirmPassword}
                onChangeText={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                onFocus={() => setFocused((f) => ({ ...f, confirmPassword: true }))}
                onBlur={() => { setFocused((f) => ({ ...f, confirmPassword: false })); setTouched((t) => ({ ...t, confirmPassword: true })); }}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm((s) => !s)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          {showErrorConfirm && (
            <Text style={styles.errorText}>
              {!form.confirmPassword ? 'Vui lòng xác nhận mật khẩu' : 'Xác nhận mật khẩu không khớp'}
            </Text>
          )}
        </View>

        <TouchableOpacity style={[styles.btn, !isFormValid && styles.btnDisabled]} onPress={handleSubmit} disabled={loading || !isFormValid} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Đăng Ký</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.or}>hoặc</Text>

        <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Đăng nhập bằng Google</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const inputShadow = {
  backgroundColor: colors.white,
  borderRadius: 15,
  paddingHorizontal: 18,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: colors.pinkLight,
  shadowColor: '#F4ABB4',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentWrap: { flexGrow: 1, paddingBottom: 32 },
  topSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
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
  formTitle: { ...typography.H1, fontFamily, color: colors.pinkAccent, textAlign: 'center', marginTop: 0, marginBottom: 6, fontWeight: '800' },
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
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  inputBoxSmall: {
    ...inputShadow,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInner: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    ...typography.P,
    fontFamily,
    color: colors.text,
  },
  inputInnerSmall: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
    fontSize: 15,
    fontWeight: '700',
    fontFamily,
    color: colors.text,
  },
  inputBoxFocused: {
    borderWidth: 2.3,
    borderColor: colors.pinkAccent,
    shadowColor: 'PSmall',
    shadowOpacity: 0.15,
  },
  inputBoxError: {
    borderWidth: 1.3,
    borderColor: '#dd4949',
    shadowColor: '#E57373',
    shadowOpacity: 0.2,
  },
  errorText: { ...typography.PSmall, fontFamily, color: '#E57373', marginTop: 6, marginLeft: 4 },
  eyeBtn: { padding: 10 },
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
  terms: { ...typography.PSmall, fontFamily, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { ...typography.PSmall, fontFamily, color: colors.textMuted },
  footerLink: { ...typography.PSmall, fontFamily, color: colors.pinkAccent, fontWeight: '600', textDecorationLine: 'underline' },
});
