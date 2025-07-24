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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, Calendar, TrendingUp, Award, Sparkles } from 'lucide-react-native';
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
            [{ text: 'Amazing!', style: 'default' }]
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
      `${dayData.habitsCompleted} of ${dayData.totalHabits} habits completed\n${dayData.completionPercentage}% completion rate`,
      [{ text: 'Got it', style: 'default' }]
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalMessage = () => {
    if (todayStats.percentage === 100) {
      return "Perfect day! You've mastered your habits today.";
    } else if (todayStats.percentage >= 75) {
      return "Excellent progress! You're building incredible momentum.";
    } else if (todayStats.percentage >= 50) {
      return "Great work! You're more than halfway to your daily goals.";
    } else if (todayStats.percentage > 0) {
      return "Nice start! Every habit completed is a step forward.";
    } else {
      return "Ready to make today amazing? Your habits are waiting.";
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
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
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.addButtonGradient}
                >
                  <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
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
                color={colors.orange}
                icon={<TrendingUp size={20} color={colors.orange} />}
              />
              
              <StatsCard
                title="Best Streak"
                value={getBestStreak()}
                subtitle="Personal record"
                color={colors.success}
                icon={<Award size={20} color={colors.success} />}
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
                    ? "Create your first habit to begin your journey" 
                    : `${todayStats.completed} of ${todayStats.total} completed today`
                  }
                </Text>
              </View>
              
              {habits.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <LinearGradient
                    colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F8F9FA']}
                    style={styles.emptyStateGradient}
                  >
                    <View style={styles.emptyState}>
                      <View style={styles.emptyStateIcon}>
                        <Sparkles size={32} color={colors.primary} />
                      </View>
                      <Text style={styles.emptyStateTitle}>Start Your Journey</Text>
                      <Text style={styles.emptyStateText}>
                        Building consistent habits is the foundation of personal growth. 
                        Create your first habit and watch as small daily actions 
                        transform into lasting positive changes.
                      </Text>
                      <TouchableOpacity
                        style={styles.createFirstHabitButton}
                        onPress={() => setShowCreateModal(true)}
                      >
                        <LinearGradient
                          colors={[colors.primary, colors.primaryDark]}
                          style={styles.createButtonGradient}
                        >
                          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.createFirstHabitText}>Create Your First Habit</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
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
        </SafeAreaView>
      </LinearGradient>

      <CreateHabitModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateHabit}
      />
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  date: {
    fontSize: 17,
    color: colors.labelSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  motivationalMessage: {
    fontSize: 15,
    color: colors.primary,
    lineHeight: 20,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  habitsSection: {
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.labelSecondary,
    fontWeight: '500',
  },
  emptyStateContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.labelSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
  },
  createFirstHabitButton: {
    borderRadius: 25,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  createFirstHabitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});