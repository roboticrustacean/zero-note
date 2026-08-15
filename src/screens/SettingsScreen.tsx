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
    Alert.alert('Backup Exported', 'Complete backup JSON has been copied to your clipboard.');
  };

  const handleImport = async () => {
    triggerHaptic();
    const text = await Clipboard.getStringAsync();
    if (!text || !text.trim().startsWith('{')) {
      Alert.alert(
        'Clipboard Empty or Invalid',
        'Please copy a valid Zero Note backup JSON to your clipboard before tapping Import.'
      );
      return;
    }

    Alert.alert(
      'Import Backup?',
      'This will merge or restore notes from your backup. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            const success = await importData(text);
            if (success) {
              Alert.alert('Import Complete', 'Note and settings restored successfully.');
            } else {
              Alert.alert('Import Failed', 'The clipboard content could not be parsed as a valid backup.');
            }
          },
        },
      ]
    );
  };

  const handleReloadGuide = () => {
    triggerHaptic();
    Alert.alert('Reload Guide Note', 'Restore the initial guide note into your active canvas?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reload Guide',
        onPress: async () => {
          await reloadOnboardingNote();
          onClose();
        },
      },
    ]);
  };

  const handleClearCurrent = () => {
    triggerHaptic();
    Alert.alert('Clear Active Note', 'Are you sure you want to clear the active note? It will be safely archived.', [
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
      {/* Header with Ø branding */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <ZeroLogo size={20} color={theme.text} strokeWidth={2} />
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily, fontSize: typeScale.headerTitle }]}>
            Zero Note
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="btn-close-settings" activeOpacity={0.6}>
          <CloseIcon size={18} color={theme.textMuted} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Behavior Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
            PREFERENCES
          </Text>

          <View style={[styles.toggleRow, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Text style={[styles.toggleLabel, { color: theme.text, fontFamily, fontSize: typeScale.body }]}>
              Haptic Feedback
            </Text>
            <Switch
              value={preferences.hapticsEnabled}
              onValueChange={(val) => updatePreferences({ hapticsEnabled: val })}
              thumbColor={theme.canvas}
              trackColor={{ false: theme.border, true: theme.accent }}
            />
          </View>

          <View style={[styles.toggleRow, { borderColor: theme.border, backgroundColor: theme.card, marginTop: 8 }]}>
            <Text style={[styles.toggleLabel, { color: theme.text, fontFamily, fontSize: typeScale.body }]}>
              Word & Character Counter
            </Text>
            <Switch
              value={preferences.showWordCount}
              onValueChange={(val) => updatePreferences({ showWordCount: val })}
              thumbColor={theme.canvas}
              trackColor={{ false: theme.border, true: theme.accent }}
            />
          </View>
        </View>

        {/* Lock Screen & Widget Guide */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
            LOCK SCREEN PINNING
          </Text>
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily, fontSize: typeScale.caption }]}>
              Tap the pin icon in the top header to keep your single active note pinned on your Android Lock Screen.
            </Text>
          </View>
        </View>

        {/* Data & Backup */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
            DATA & GUIDE
          </Text>

          <View style={styles.dataButtonsRow}>
            <TouchableOpacity
              onPress={handleExport}
              style={[styles.dataBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              testID="btn-export"
              activeOpacity={0.7}
            >
              <Text style={[styles.dataBtnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
                Export Backup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleImport}
              style={[styles.dataBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              testID="btn-import"
              activeOpacity={0.7}
            >
              <Text style={[styles.dataBtnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
                Import Backup
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleReloadGuide}
            style={[styles.guideBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            testID="btn-reload-guide"
            activeOpacity={0.7}
          >
            <Text style={[styles.guideBtnText, { color: theme.text, fontFamily, fontSize: typeScale.caption }]}>
              Reload Guide Note
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCurrent}
            style={[styles.clearBtn, { borderColor: theme.borderSubtle }]}
            testID="btn-clear-active"
            activeOpacity={0.7}
          >
            <Text style={[styles.clearBtnText, { color: '#E06C75', fontFamily, fontSize: typeScale.caption }]}>
              Clear Active Note
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption }]}>
            Ø · Pure Digital Minimalism
          </Text>
          <Text style={[styles.footerText, { color: theme.textMuted, fontFamily, fontSize: typeScale.caption, marginTop: 4 }]}>
            100% Offline & Encrypted Locally
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  section: {
    marginTop: 22,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleLabel: {
    letterSpacing: -0.2,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  dataButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dataBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataBtnText: {
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  guideBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  guideBtnText: {
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  clearBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  clearBtnText: {
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  footerInfo: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    letterSpacing: 0.2,
    opacity: 0.5,
  },
});
