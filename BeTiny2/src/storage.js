import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.warn('Storage setItem error:', e);
  }
};

export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('Storage removeItem error:', e);
  }
};

export default { getItem, setItem, removeItem };
