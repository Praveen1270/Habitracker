import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Info, 
  ChevronRight, 
  Moon, 
  Sun,
  Smartphone, 
  CircleHelp as HelpCircle,
  Palette,
  Shield,
  Monitor
} from 'lucide-react-native';

import { getColors } from '../../constants/colors';
import { StorageService } from '../../utils/storage';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
  isFirst = false,
  isLast = false,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: colors.surface,
          borderTopLeftRadius: isFirst ? 12 : 0,
          borderTopRightRadius: isFirst ? 12 : 0,
          borderBottomLeftRadius: isLast ? 12 : 0,
          borderBottomRightRadius: isLast ? 12 : 0,
          borderBottomWidth: isLast ? 0 : 0.5,
          borderBottomColor: colors.systemGray5,
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.systemGray6 }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.label }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.labelSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={18} color={colors.systemGray2} strokeWidth={2.5} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { isDark, toggleTheme, isSystemTheme, setSystemTheme } = useTheme();
  const colors = getColors(isDark);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleExportData = async () => {
    try {
      const [habits, logs, achievements] = await Promise.all([
        StorageService.getHabits(),
        StorageService.getHabitLogs(),
        StorageService.getAchievements(),
      ]);

      Alert.alert(
        'Export Complete',
        `Your data is ready for export:\n\n• ${habits.length} habits tracked\n• ${logs.length} completion logs\n• ${achievements.length} achievements earned\n\nIn the full version, this would save securely to your preferred cloud service or device storage.`,
        [{ text: 'Perfect!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Your Data',
      'Seamlessly import habit data from:\n\n• Previous app backups\n• Other devices\n• Popular habit tracking apps\n• CSV or JSON files\n\nYour existing data will be safely preserved and merged with imported habits.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently remove:\n\n• All habit definitions\n• Complete tracking history\n• Streak records and achievements\n• Personal preferences\n\nThis action cannot be undone. Consider exporting your data first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Data Cleared', 'All your data has been successfully removed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleThemeSelection = () => {
    Alert.alert(
      'Choose Your Theme',
      'Select your preferred appearance:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'System Default', 
          onPress: () => setSystemTheme(true),
          style: isSystemTheme ? 'default' : 'default'
        },
        { 
          text: 'Light Mode', 
          onPress: () => {
            setSystemTheme(false);
            if (isDark) toggleTheme();
          },
          style: 'default'
        },
        { 
          text: 'Dark Mode', 
          onPress: () => {
            setSystemTheme(false);
            if (!isDark) toggleTheme();
          },
          style: 'default'
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Smart Notifications',
      'Customize your habit reminders:\n\n• Personalized reminder times for each habit\n• Gentle nudges without being intrusive\n• Celebration alerts for streak milestones\n• Weekly progress summaries\n• Smart scheduling based on your patterns\n\nStay motivated with intelligent, contextual reminders.',
      [{ text: 'Sounds Great!', style: 'default' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About ConsistTracker',
      'Version 1.0.0\n\nConsistTracker transforms habit building through:\n\n• Beautiful visual progress tracking\n• Intelligent streak monitoring\n• Motivational milestone celebrations\n• Comprehensive analytics and insights\n• Apple-quality design and experience\n\nDesigned for iOS with love and attention to detail.\n\n© 2025 ConsistTracker Team',
      [{ text: 'Wonderful!', style: 'default' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Getting Started Guide',
      '🎯 Creating Your First Habit:\n• Tap the + button anywhere in the app\n• Choose from curated suggestions or create custom\n• Select tracking type (daily, weekly, or quantity)\n• Pick a meaningful color and category\n\n📊 Tracking Progress:\n• Tap the circle to mark habits complete\n• Watch your consistency graph fill with green\n• Celebrate streak milestones as you achieve them\n\n📈 Understanding Analytics:\n• View detailed insights in the Analytics tab\n• Monitor consistency scores and trends\n• Identify your top performing habits\n\n💡 Pro Tips:\n• Start with 2-3 habits for best results\n• Be consistent rather than perfect\n• Use the visual feedback to stay motivated\n\nNeed more help? We\'re here to support your journey.',
      [{ text: 'Got It!', style: 'default' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy & Security',
      'Your privacy is our highest priority:\n\n🔒 Data Protection:\n• All habit data stored securely on your device\n• No personal information collected or transmitted\n• Zero tracking, analytics, or advertising\n• No third-party data sharing ever\n\n☁️ Optional Cloud Features:\n• Encrypted backup to your iCloud account\n• Secure sync across your Apple devices\n• You maintain complete control\n\n🛡️ Security:\n• Industry-standard encryption\n• Regular security audits\n• Transparent privacy practices\n\nYour habit journey remains completely private.',
      [{ text: 'Excellent!', style: 'default' }]
    );
  };

  const getThemeDescription = () => {
    if (isSystemTheme) return 'Follows your device settings';
    return isDark ? 'Dark mode active' : 'Light mode active';
  };

  const getThemeIcon = () => {
    if (isSystemTheme) return <Monitor size={20} color={colors.primary} strokeWidth={2.5} />;
    return isDark ? <Moon size={20} color={colors.primary} strokeWidth={2.5} /> : <Sun size={20} color={colors.primary} strokeWidth={2.5} />;
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your habit tracking experience</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Appearance Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <View style={styles.settingsGroup}>
                <SettingItem
                  icon={getThemeIcon()}
                  title="Theme"
                  subtitle={getThemeDescription()}
                  onPress={handleThemeSelection}
                  isFirst={true}
                  isLast={true}
                />
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <View style={styles.settingsGroup}>
                <SettingItem
                  icon={<Bell size={20} color={colors.primary} strokeWidth={2.5} />}
                  title="Push Notifications"
                  subtitle="Smart reminders for your habits"
                  rightElement={
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: colors.systemGray4, true: colors.primary + '40' }}
                      thumbColor={notificationsEnabled ? colors.primary : colors.systemGray}
                      ios_backgroundColor={colors.systemGray4}
                    />
                  }
                  showChevron={false}
                  isFirst={true}
                />
                <SettingItem
                  icon={<Smartphone size={20} color={colors.blue} strokeWidth={2.5} />}
                  title="Notification Settings"
                  subtitle="Customize timing and frequency"
                  onPress={handleNotificationSettings}
                  isLast={true}
                />
              </View>
            </View>

            {/* Data Management Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              <View style={styles.settingsGroup}>
                <SettingItem
                  icon={<Download size={20} color={colors.green} strokeWidth={2.5} />}
                  title="Export Data"
                  subtitle="Backup your habits and progress"
                  onPress={handleExportData}
                  isFirst={true}
                />
                <SettingItem
                  icon={<Upload size={20} color={colors.blue} strokeWidth={2.5} />}
                  title="Import Data"
                  subtitle="Restore from backup or other apps"
                  onPress={handleImportData}
                />
                <SettingItem
                  icon={<Trash2 size={20} color={colors.red} strokeWidth={2.5} />}
                  title="Clear All Data"
                  subtitle="Reset app to initial state"
                  onPress={handleClearAllData}
                  isLast={true}
                />
              </View>
            </View>

            {/* Privacy & Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
              <View style={styles.settingsGroup}>
                <SettingItem
                  icon={<Shield size={20} color={colors.indigo} strokeWidth={2.5} />}
                  title="Privacy Policy"
                  subtitle="How we protect your personal data"
                  onPress={handlePrivacy}
                  isFirst={true}
                  isLast={true}
                />
              </View>
            </View>

            {/* Support Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.settingsGroup}>
                <SettingItem
                  icon={<HelpCircle size={20} color={colors.orange} strokeWidth={2.5} />}
                  title="Help & Getting Started"
                  subtitle="Learn how to build lasting habits"
                  onPress={handleHelp}
                  isFirst={true}
                />
                <SettingItem
                  icon={<Info size={20} color={colors.purple} strokeWidth={2.5} />}
                  title="About ConsistTracker"
                  subtitle="App version and team information"
                  onPress={handleAbout}
                  isLast={true}
                />
              </View>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appInfoTitle}>ConsistTracker</Text>
              <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
              <Text style={styles.appInfoTagline}>
                Designed in California with love for habit builders worldwide
              </Text>
              <Text style={styles.appInfoMotto}>
                Build consistency • Achieve greatness • Transform your life
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: colors.labelSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
    color: colors.labelSecondary,
  },
  settingsGroup: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 15,
    color: colors.labelSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  appInfoTagline: {
    fontSize: 15,
    color: colors.labelTertiary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  appInfoMotto: {
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});