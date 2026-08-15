import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_IDENTIFIER = 'zeronote-lockscreen-pinned';
const ANDROID_CHANNEL_ID = 'zeronote_lockscreen';

export interface NotificationPayload {
  title: string;
  body: string;
}

export class NotificationService {
  private channelInitialized = false;

  async initNotificationChannel(): Promise<void> {
    if (Platform.OS === 'web') return;

    if (Platform.OS === 'android' && !this.channelInitialized) {
      try {
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: 'Zero Note Active Lock Screen',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 50],
          lightColor: '#FFFFFF',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: false,
          showBadge: false,
        });
        this.channelInitialized = true;
      } catch (e) {
        console.warn('Failed to set notification channel:', e);
      }
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // ignore on platforms without handler support
    }
  }

  formatNotificationPayload(content: string): NotificationPayload {
    if (!content || content.trim().length === 0) {
      return {
        title: 'Zero Note',
        body: 'Tap to write your focus note...',
      };
    }

    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      return {
        title: 'Zero Note',
        body: 'Tap to write your focus note...',
      };
    }

    const firstLine = lines[0].replace(/^[#\-*•\[\]\s]+/, '').trim();
    const title = firstLine.length > 0 ? firstLine : 'Zero Note';

    const restLines = lines.slice(1).map((l) => {
      const clean = l.trim();
      if (clean.startsWith('- [ ]') || clean.startsWith('[ ]')) {
        return `• [ ] ${clean.replace(/^[-*]?\s*\[\s*\]\s*/, '')}`;
      }
      if (clean.startsWith('- [x]') || clean.startsWith('[x]')) {
        return `• [✓] ${clean.replace(/^[-*]?\s*\[[xX]\]\s*/, '')}`;
      }
      if (clean.startsWith('- ') || clean.startsWith('* ') || clean.startsWith('• ')) {
        return `• ${clean.replace(/^[-*•]\s*/, '')}`;
      }
      return clean;
    });

    const body = restLines.length > 0 ? restLines.join('\n') : (lines.length === 1 ? content : '');

    return {
      title,
      body: body.length > 0 ? body : title,
    };
  }

  async updateLockScreenNotification(content: string, isPinned: boolean): Promise<void> {
    if (Platform.OS === 'web') return;

    await this.initNotificationChannel();

    if (!isPinned || content.trim().length === 0) {
      await this.dismissLockScreenNotification();
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== 'granted') return;
      }

      const payload = this.formatNotificationPayload(content);

      // Dismiss existing and schedule updated notification
      await Notifications.dismissNotificationAsync(NOTIFICATION_IDENTIFIER);

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDENTIFIER,
        content: {
          title: payload.title,
          body: payload.body,
          data: { url: 'zeronote://edit' },
          sticky: true, // Android persistent notification
          autoDismiss: false,
          color: '#000000',
        },
        trigger: null, // show immediately
      });
    } catch (e) {
      console.warn('Error updating lockscreen notification:', e);
    }
  }

  async dismissLockScreenNotification(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.dismissNotificationAsync(NOTIFICATION_IDENTIFIER);
    } catch (e) {
      console.warn('Error dismissing notification:', e);
    }
  }
}

export const notificationService = new NotificationService();
