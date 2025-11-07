import { Alert, Platform, ToastAndroid } from 'react-native';

type ToastHandler = (message: string, title?: string) => void;
let handler: ToastHandler | null = null;

export function setToastHandler(h: ToastHandler | null) {
  handler = h;
}

export function showToast(message: string, title?: string) {
  if (handler) {
    handler(message, title);
    return;
  }
  if (Platform.OS === 'android' && ToastAndroid && typeof ToastAndroid.show === 'function') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }
  try {
    Alert.alert(title ?? '', message);
  } catch (e) {
    console.log(message);
  }
}

export default showToast;
