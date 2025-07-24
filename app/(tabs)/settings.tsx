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
  Shield
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
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const styles = createStyles(colors);
  
  return (
    <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card, borderBottomColor: colors.surface }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && !rightElement && (
          <ChevronRight size={20} color={colors.textSecondary} />
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

      const exportData = {
        habits,
        logs,
        achievements,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      Alert.alert(
        'Export Data',
        `Ready to export your data:\n\n• ${habits.length} habits\n• ${logs.length} habit logs\n• ${achievements.length} achievements\n\nIn the full version, this would save to your device or cloud storage.`,
        [{ text: 'Got it!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This feature allows you to import habit data from:\n\n• Backup files\n• Other devices\n• Popular habit tracking apps\n\nYour existing data will be safely merged with imported data.',
      [{ text: 'Understood', style: 'default' }]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete:\n\n• All your habits\n• All habit logs and streaks\n• All achievements\n• App preferences\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Customize your habit reminders:\n\n• Set specific times for each habit\n• Choose notification frequency\n• Enable streak celebration alerts\n• Configure weekly progress summaries\n\nStay motivated with smart reminders!',
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleThemeSettings = () => {
    Alert.alert(
      'Theme Settings',
      'Choose your preferred appearance:\n\n• Light Mode: Clean and bright\n• Dark Mode: Easy on the eyes\n• System: Follows your device settings\n\nYour choice will be saved automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use System Theme', 
          onPress: () => setSystemTheme(true),
          style: isSystemTheme ? 'default' : 'default'
        },
        { 
          text: isDark ? 'Switch to Light' : 'Switch to Dark', 
          onPress: toggleTheme,
          style: 'default'
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About ConsistTracker',
      'Version 1.0.0\n\nConsistTracker helps you build lasting habits through:\n\n• Visual consistency tracking\n• Intelligent streak monitoring\n• Beautiful green dot visualization\n• Comprehensive analytics\n• Motivational celebrations\n\nBuilt with React Native and designed for habit success.\n\n© 2025 ConsistTracker',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Getting Started Guide:\n\n1. Create Your First Habit\n   • Tap the + button on any screen\n   • Choose from suggestions or create custom\n   • Set your preferred tracking type\n\n2. Track Daily Progress\n   • Tap the circle to mark habits complete\n   • Watch your green dots grow\n   • Celebrate streak milestones\n\n3. Analyze Your Progress\n   • View your consistency graph\n   • Check detailed analytics\n   • Identify patterns and trends\n\n4. Stay Motivated\n   • Enable smart notifications\n   • Share achievements\n   • Set new challenges\n\nNeed more help? Contact support through the app store.',
      [{ text: 'Thanks!', style: 'default' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy & Security',
      'Your privacy is our priority:\n\n• All data stored locally on your device\n• No personal information collected\n• No tracking or analytics\n• No ads or third-party sharing\n• Optional cloud backup (coming soon)\n\nYou have complete control over your habit data.',
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your habit tracking experience</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon={isDark ? <Moon size={20} color={colors.primary} /> : <Sun size={20} color={colors.primary} />}
            title="Theme"
            subtitle={isSystemTheme ? 'System default' : (isDark ? 'Dark mode' : 'Light mode')}
            onPress={handleThemeSettings}
          />
          <SettingItem
            icon={<Palette size={20} color={colors.categories.Creativity} />}
            title="Color Customization"
            subtitle="Coming soon - custom themes and colors"
            onPress={() => Alert.alert('Coming Soon', 'Custom color themes will be available in a future update!')}
          />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon={<Bell size={20} color={colors.primary} />}
            title="Push Notifications"
            subtitle="Get reminded to complete your habits"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.surface, true: colors.primary + '40' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            }
            showChevron={false}
          />
          <SettingItem
            icon={<Smartphone size={20} color={colors.categories.Productivity} />}
            title="Notification Settings"
            subtitle="Customize timing, frequency, and style"
            onPress={handleNotificationSettings}
          />
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <SettingItem
            icon={<Download size={20} color={colors.categories.Finance} />}
            title="Export Data"
            subtitle="Backup your habits and progress"
            onPress={handleExportData}
          />
          <SettingItem
            icon={<Upload size={20} color={colors.categories.Learning} />}
            title="Import Data"
            subtitle="Restore from backup or other apps"
            onPress={handleImportData}
          />
          <SettingItem
            icon={<Trash2 size={20} color={colors.error} />}
            title="Clear All Data"
            subtitle="Delete all habits, logs, and settings"
            onPress={handleClearAllData}
          />
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <SettingItem
            icon={<Shield size={20} color={colors.categories.Health} />}
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacy}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon={<HelpCircle size={20} color={colors.categories.Relationships} />}
            title="Help & FAQ"
            subtitle="Get help using ConsistTracker"
            onPress={handleHelp}
          />
          <SettingItem
            icon={<Info size={20} color={colors.categories.Learning} />}
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>ConsistTracker v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for habit builders</Text>
          <Text style={styles.appInfoText}>Build consistency, achieve greatness</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});