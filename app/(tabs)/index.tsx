import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, TrendingUp, Award, Sun, Moon } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { HabitCard } from '../../components/HabitCard';
import { ContributionGraph } from '../../components/ContributionGraph';
import { StatsCard } from '../../components/StatsCard';
import { CreateHabitModal } from '../../components/CreateHabitModal';

import { Habit, HabitLog, HabitStreak, DayData } from '../../types/habit';
import { getColors } from '../../constants/colors';
import { StorageService } from '../../utils/storage';
import { HabitUtils } from '../../utils/habitUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { v4 as uuidv4 } from 'uuid';

export default function TodayScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<{ [key: string]: HabitStreak }>({});
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  const loadData = async () => {
    try {
      const [habitsData, logsData] = await Promise.all([
        StorageService.getHabits(),
        StorageService.getHabitLogs(),
      ]);

      const activeHabits = habitsData.filter(h => !h.archivedAt);
      setHabits(activeHabits);
      setLogs(logsData);

      // Calculate streaks
      const streakData: { [key: string]: HabitStreak } = {};
      activeHabits.forEach(habit => {
        streakData[habit.id] = HabitUtils.calculateStreak(habit.id, logsData);
      });
      setStreaks(streakData);

      // Generate calendar data
      const calendar = HabitUtils.generateCalendarData(activeHabits, logsData);
      setCalendarData(calendar);

      // Calculate today's stats
      const today = HabitUtils.getTodayString();
      const todayLogs = logsData.filter(log => log.logDate === today);
      const completed = todayLogs.length;
      const total = activeHabits.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      setTodayStats({ completed, total, percentage });
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleHabit = async (habit: Habit) => {
    try {
      const today = HabitUtils.getTodayString();
      const isCompleted = HabitUtils.isHabitCompletedToday(habit.id, logs);

      if (isCompleted) {
        // Remove log
        const updatedLogs = logs.filter(
          log => !(log.habitId === habit.id && log.logDate === today)
        );
        setLogs(updatedLogs);
        await StorageService.saveHabitLogs(updatedLogs);
      } else {
        // Add log
        const newLog: HabitLog = {
          id: uuidv4(),
          habitId: habit.id,
          logDate: today,
          value: 1,
          createdAt: new Date(),
        };

        const updatedLogs = [...logs, newLog];
        setLogs(updatedLogs);
        await StorageService.addHabitLog(newLog);

        // Check for streak milestones
        const newStreak = HabitUtils.calculateStreak(habit.id, updatedLogs);
        if (HabitUtils.shouldShowStreakCelebration(newStreak.currentStreak)) {
          Alert.alert(
            '🎉 Streak Milestone!',
            HabitUtils.getStreakMessage(newStreak.currentStreak),
            [{ text: 'Awesome!', style: 'default' }]
          );
        }
      }

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  const handleCreateHabit = async (habit: Habit) => {
    try {
      await StorageService.addHabit(habit);
      await loadData();
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    }
  };

  const handleDayPress = (dayData: DayData) => {
    const date = new Date(dayData.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    Alert.alert(
      formattedDate,
      `${dayData.habitsCompleted} of ${dayData.totalHabits} habits completed (${dayData.completionPercentage}%)`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getTotalCurrentStreak = () => {
    return Object.values(streaks).reduce((sum, streak) => sum + streak.currentStreak, 0);
  };

  const getBestStreak = () => {
    return Math.max(...Object.values(streaks).map(s => s.longestStreak), 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! ☀️';
    if (hour < 17) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  };

  const getMotivationalMessage = () => {
    if (todayStats.percentage === 100) {
      return "Perfect day! You've completed all your habits! 🎉";
    } else if (todayStats.percentage >= 75) {
      return "You're doing great! Keep up the momentum! 💪";
    } else if (todayStats.percentage >= 50) {
      return "Good progress! You're halfway there! 🎯";
    } else if (todayStats.percentage > 0) {
      return "Nice start! Every step counts! 🌱";
    } else {
      return "Ready to build some great habits today? 🚀";
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.motivationalMessage}>
              {getMotivationalMessage()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Today's Progress"
            value={`${todayStats.completed}/${todayStats.total}`}
            subtitle={`${todayStats.percentage}% complete`}
            color={colors.primary}
            icon={<Calendar size={20} color={colors.primary} />}
          />
          
          <StatsCard
            title="Active Streaks"
            value={getTotalCurrentStreak()}
            subtitle="Total streak days"
            color={colors.accent}
            icon={<TrendingUp size={20} color={colors.accent} />}
          />
          
          <StatsCard
            title="Best Streak"
            value={getBestStreak()}
            subtitle="Personal record"
            color={colors.secondary}
            icon={<Award size={20} color={colors.secondary} />}
          />
        </View>

        <ContributionGraph
          data={calendarData}
          onDayPress={handleDayPress}
        />

        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Text style={styles.sectionSubtitle}>
              {habits.length === 0 
                ? "No habits yet - create your first one!" 
                : `${todayStats.completed} of ${todayStats.total} completed`
              }
            </Text>
          </View>
          
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
              <Text style={styles.emptyStateText}>
                Building consistent habits is the key to achieving your goals. 
                Create your first habit and start tracking your progress with our 
                beautiful visual system.
              </Text>
              <TouchableOpacity
                style={styles.createFirstHabitButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={20} color={colors.textLight} />
                <Text style={styles.createFirstHabitText}>Create Your First Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logs}
                streak={streaks[habit.id] || { habitId: habit.id, currentStreak: 0, longestStreak: 0 }}
                onToggleComplete={handleToggleHabit}
              />
            ))
          )}
        </View>
      </ScrollView>

      <CreateHabitModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateHabit}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  motivationalMessage: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '500',
    maxWidth: 250,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  habitsSection: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createFirstHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createFirstHabitText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});