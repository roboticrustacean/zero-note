import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const safeHaptics = {
  impact: async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(style);
    } catch {
      // ignore
    }
  },
  notification: async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(type);
    } catch {
      // ignore
    }
  },
  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
  },
};
