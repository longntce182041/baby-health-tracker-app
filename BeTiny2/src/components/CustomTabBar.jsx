import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

const TAB_BAR_HEIGHT = 75;
const BUBBLE_SIZE = 50;
const TAB_COUNT = 5;

const TAB_ICONS = {
  ConsultationTab: { lib: MaterialCommunityIcons, name: 'stethoscope' },
  HealthTab: { lib: Ionicons, name: 'bar-chart-outline' },
  HomeTab: { lib: Ionicons, name: 'home' },
  VaccinationTab: { lib: MaterialCommunityIcons, name: 'needle' },
  HealthLogTab: { lib: Ionicons, name: 'journal-outline' },
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const bubbleLeft = useRef(new Animated.Value(0)).current;

  const index = state.index;
  const isFirstLayout = useRef(true);

  useEffect(() => {
    if (barWidth <= 0) return;
    const segmentWidth = barWidth / TAB_COUNT;
    const toValue = (index + 0.5) * segmentWidth - BUBBLE_SIZE / 2;
    if (isFirstLayout.current) {
      isFirstLayout.current = false;
      bubbleLeft.setValue(toValue);
    } else {
      Animated.spring(bubbleLeft, {
        toValue,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
    }
  }, [index, barWidth]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 16 }]}>
      <View
        style={styles.bar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              transform: [{ translateX: bubbleLeft }],
            },
          ]}
        />
        {state.routes.map((route, i) => {
          const isFocused = state.index === i;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconConfig = TAB_ICONS[route.name];
          const IconComponent = iconConfig?.lib || Ionicons;
          const iconName = iconConfig?.name || 'help-outline';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <View style={styles.iconWrap}>
                <IconComponent
                  name={iconName}
                  size={22}
                  color={isFocused ? colors.white : colors.textMuted}
                  style={isFocused && styles.iconActive}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: colors.red,
    borderRadius: 35,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.pinkLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.pinkAccent,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 35,
      },
      android: { elevation: 12 },
    }),
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: (TAB_BAR_HEIGHT - BUBBLE_SIZE) / 2,
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: colors.pinkAccent,
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: colors.pinkAccent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: { elevation: 6 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    transform: [{ translateY: -2 }],
  },
});
