import { notificationService } from '../../src/services/notificationService';

describe('NotificationService', () => {
  it('formats notification title and body cleanly for markdown checklists', () => {
    const content = '# Daily Goals\n- [ ] Ship Zero Note Android\n- [x] Test on emulator';
    const payload = notificationService.formatNotificationPayload(content);

    expect(payload.title).toBe('Daily Goals');
    expect(payload.body).toContain('• [ ] Ship Zero Note Android');
    expect(payload.body).toContain('• [✓] Test on emulator');
  });

  it('formats single line note cleanly', () => {
    const payload = notificationService.formatNotificationPayload('Remember to take a break');
    expect(payload.title).toBe('Remember to take a break');
    expect(payload.body).toBe('Remember to take a break');
  });

  it('provides default fallback for empty text', () => {
    const payload = notificationService.formatNotificationPayload('');
    expect(payload.title).toBe('Zero Note');
    expect(payload.body).toBe('Tap to write your focus note...');
  });
});
