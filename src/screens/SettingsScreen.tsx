import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../theme/ThemeContext';
import { useNotes } from '../context/NotesContext';
import { CloseIcon, ZeroLogo } from '../components/Icons';
import { safeHaptics } from '../utils/haptics';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { theme, fontFamily, typeScale } = useTheme();
  const {
    preferences,
    updatePreferences,
    exportData,
    importData,
    clearCurrentNote,
    reloadOnboardingNote,
  } = useNotes();

  const triggerHaptic = () => {
    if (preferences.hapticsEnabled) {
      safeHaptics.impact();
    }
  };

  const handleExport = async () => {
    triggerHaptic();
    const json = await exportData();
    await Clipboard.setStringAsync(json);
    Alert.alert('Exported', 'Backup copied to clipboard.');
  };

  const handleImport = async () => {
    triggerHaptic();
    const text = await Clipboard.getStringAsync();
    if (!text || !text.trim().startsWith('{')) {
      Alert.alert('Invalid', 'No valid backup JSON found in clipboard.');
      return;
    }

    if (Platform.OS === 'web') {
      const ok = window.confirm('Restore notes from backup?');
      if (ok) {
        const success = await importData(text);
        if (success) {
          window.alert('Backup restored successfully.');
        } else {
          window.alert('Could not parse backup.');
        }
      }
      return;
    }

    Alert.alert('Import Backup', 'Restore notes from backup?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Import',
        onPress: async () => {
          const success = await importData(text);
          if (success) {
            Alert.alert('Restored', 'Backup restored successfully.');
          } else {
            Alert.alert('Error', 'Could not parse backup.');
          }
        },
      },
    ]);
  };

  const handleReloadGuide = async () => {
    triggerHaptic();
    if (Platform.OS === 'web') {
      const ok = window.confirm('Restore the initial guide note?');
      if (ok) {
        await reloadOnboardingNote();
        onClose();
      }
      return;
    }

    Alert.alert('Reload Guide', 'Restore the initial guide note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reload',
        onPress: async () => {
          await reloadOnboardingNote();
          onClose();
        },
      },
    ]);
  };

  const handleClearCurrent = async () => {
    triggerHaptic();
    if (Platform.OS === 'web') {
      const ok = window.confirm('Archive current note and start fresh?');
      if (ok) {
        await clearCurrentNote();
        onClose();
      }
      return;
    }

    Alert.alert('Clear Canvas', 'Archive current note and start fresh?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearCurrentNote();
          onClose();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]}>
      {/* Clean Minimal Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <ZeroLogo size={18} color={theme.text} strokeWidth={2} />
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily, fontSize: typeScale.body }]}>
            Zero Note
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="btn-close-settings" activeOpacity={0.6}>
          <CloseIcon size={16} color={theme.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggles */}
        <View style={styles.section}>
          <View style={[styles.row, { borderColor: theme.borderSubtle, backgroundColor: theme.card }]}>
            <Text style={[styles.rowLabel, { color: theme.text, fontFamily, fontSize: typeScale.body }]}>
              Haptic Feedback
            </Text>
            <Switch
              value={preferences.hapticsEnabled}
              onValueChange={(val) => updatePreferences({ hapticsEnabled: val })}
              thumbColor={theme.canvas}
              trackColor={{ false: theme.border, true: theme.accent }}
            />
          </View>

          <View style={[styles.row, { borderColor: theme.borderSubtle, backgroundColor: theme.card, marginTop: 8 }]}>
            <Text style={[styles.rowLabel, { color: theme.text, fontFamily, fontSize: typeScale.body }]}>
              Word Counter
            </Text>
            <Switch
              value={preferences.showWordCount}
              onValueChange={(val) => updatePreferences({ showWordCount: val })}
              thumbColor={theme.canvas}
              trackColor={{ false: theme.border, true: theme.accent }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleExport}
              style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border }]}
              testID="btn-export"
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
                Export Backup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImport}
              style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border }]}
              testID="btn-import"
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
                Import Backup
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleReloadGuide}
            style={[styles.fullBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            testID="btn-reload-guide"
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
              Reload Guide Note
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCurrent}
            style={[styles.fullBtn, { borderColor: theme.borderSubtle }]}
            testID="btn-clear-active"
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, { color: '#E06C75', fontFamily, fontSize: typeScale.caption }]}>
              Clear Active Note
            </Text>
          </TouchableOpacity>
        </View>

        {/* Whisper Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
            Ø · Pure Digital Minimalism
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  rowLabel: {
    letterSpacing: -0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  btnText: {
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  footerText: {
    letterSpacing: 0.3,
  },
});
