import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../../theme';

const { fontFamily } = typography;

const WELCOME_BG = require('../../../assets/images/welcome.png');

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' && <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />}
      <ImageBackground
        source={WELCOME_BG}
        style={[styles.bgImage, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Chào mừng đến với</Text>

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../../assets/images/logoBeTiny.bmp')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.tagline}>
            Cùng đồng hành trong hành trình phát triển của bé!
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.btnLogin}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnLoginText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnRegister}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnRegisterText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bgImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontFamily,
    fontSize: 30,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 95,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.pinkAccent,
    marginTop: 12,
  },
  tagline: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginTop: 160,
    marginBottom: 0,
  },
  buttons: {
    gap: 14,
  },
  btnLogin: {
    backgroundColor: '#ff61b0',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: colors.pinkAccent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  btnLoginText: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  btnRegister: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  btnRegisterText: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2D2D',
  },
});
