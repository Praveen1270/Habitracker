import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Calendar, Target, Award, ChartBar as BarChart3, Zap } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StatsCard } from '../../components/StatsCard';
import { ContributionGraph } from '../../components/ContributionGraph';

import { Habit, HabitLog, HabitStreak, DayData } from '../../types/habit';
import { getColors } from '../../constants/colors';
import { StorageService } from '../../utils/storage';
import { HabitUtils } from '../../utils/habitUtils';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<{ [key: string]: HabitStreak }>({});
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalHabits: 0,
    totalLogs: 0,
    averageCompletion: 0,
    bestStreak: 0,
    currentStreaks: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    consistencyScore: 0,
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

      // Calculate analytics
      calculateAnalytics(activeHabits, logsData, streakData, calendar);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const calculateAnalytics = (
    habits: Habit[],
    logs: HabitLog[],
    streaks: { [key: string]: HabitStreak },
    calendar: DayData[]
  ) => {
    const totalHabits = habits.length;
    const totalLogs = logs.length;
    
    // Calculate average completion rate
    const completionRates = habits.map(habit => 
      HabitUtils.getCompletionRate(habit.id, logs, 30)
    );
    const averageCompletion = completionRates.length > 0 
      ? Math.round(completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length)
      : 0;

    // Best streak across all habits
    const bestStreak = Math.max(...Object.values(streaks).map(s => s.longestStreak), 0);
    
    // Total current streaks
    const currentStreaks = Object.values(streaks).reduce((sum, streak) => sum + streak.currentStreak, 0);

    // Weekly progress (last 7 days)
    const last7Days = calendar.slice(-7);
    const weeklyProgress = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum, day) => sum + day.completionPercentage, 0) / last7Days.length)
      : 0;

    // Monthly progress (last 30 days)
    const last30Days = calendar.slice(-30);
    const monthlyProgress = last30Days.length > 0
      ? Math.round(last30Days.reduce((sum, day) => sum + day.completionPercentage, 0) / last30Days.length)
      : 0;

    // Consistency score (based on how many days have >0% completion in last 30 days)
    const daysWithActivity = last30Days.filter(day => day.completionPercentage > 0).length;
    const consistencyScore = Math.round((daysWithActivity / Math.min(30, last30Days.length)) * 100);

    setAnalytics({
      totalHabits,
      totalLogs,
      averageCompletion,
      bestStreak,
      currentStreaks,
      weeklyProgress,
      monthlyProgress,
      consistencyScore,
    });
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

  const getTopHabits = () => {
    return habits
      .map(habit => ({
        habit,
        streak: streaks[habit.id]?.currentStreak || 0,
        completionRate: HabitUtils.getCompletionRate(habit.id, logs, 30),
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);
  };

  const getConsistencyMessage = (score: number) => {
    if (score >= 90) return 'Exceptional consistency! 🏆';
    if (score >= 75) return 'Great consistency! 🌟';
    if (score >= 60) return 'Good progress! 👍';
    if (score >= 40) return 'Keep building! 💪';
    return 'Just getting started! 🌱';
  };

  const getInsights = () => {
    const insights = [];
    
    if (analytics.bestStreak >= 30) {
      insights.push("🔥 You've built some amazing long-term habits!");
    }
    
    if (analytics.weeklyProgress > analytics.monthlyProgress) {
      insights.push("📈 You're on an upward trend this week!");
    }
    
    if (analytics.consistencyScore >= 80) {
      insights.push("⭐ Your consistency is inspiring!");
    }
    
    if (habits.length >= 5) {
      insights.push("🎯 You're tracking multiple habits - great commitment!");
    }
    
    if (insights.length === 0) {
      insights.push("🌱 Keep building your habits - every day counts!");
    }
    
    return insights;
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your habit-building journey</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Habits"
              value={analytics.totalHabits}
              subtitle="Active habits"
              color={colors.primary}
              icon={<Target size={20} color={colors.primary} />}
            />
            <StatsCard
              title="Total Logs"
              value={analytics.totalLogs}
              subtitle="Completions tracked"
              color={colors.secondary}
              icon={<BarChart3 size={20} color={colors.secondary} />}
            />
          </View>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Best Streak"
              value={analytics.bestStreak}
              subtitle="days in a row"
              color={colors.accent}
              icon={<Award size={20} color={colors.accent} />}
            />
            <StatsCard
              title="Active Streaks"
              value={analytics.currentStreaks}
              subtitle="total streak days"
              color={colors.categories.Health}
              icon={<TrendingUp size={20} color={colors.categories.Health} />}
            />
          </View>
        </View>

        {/* Consistency Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consistency Score</Text>
          <View style={styles.consistencyCard}>
            <View style={styles.consistencyHeader}>
              <Text style={styles.consistencyScore}>{analytics.consistencyScore}%</Text>
              <Text style={styles.consistencyMessage}>
                {getConsistencyMessage(analytics.consistencyScore)}
              </Text>
            </View>
            <View style={styles.consistencyBar}>
              <View 
                style={[
                  styles.consistencyFill, 
                  { 
                    width: `${analytics.consistencyScore}%`,
                    backgroundColor: analytics.consistencyScore >= 75 
                      ? colors.primary 
                      : analytics.consistencyScore >= 50 
                        ? colors.secondary 
                        : colors.categories.Finance
                  }
                ]} 
              />
            </View>
            <Text style={styles.consistencyDescription}>
              Based on daily activity in the last 30 days
            </Text>
          </View>
        </View>

        {/* Progress Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Trends</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Weekly Average"
              value={`${analytics.weeklyProgress}%`}
              subtitle="Last 7 days"
              color={colors.categories.Productivity}
              icon={<Calendar size={20} color={colors.categories.Productivity} />}
            />
            <StatsCard
              title="Monthly Average"
              value={`${analytics.monthlyProgress}%`}
              subtitle="Last 30 days"
              color={colors.categories.Learning}
              icon={<TrendingUp size={20} color={colors.categories.Learning} />}
            />
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Insights</Text>
          <View style={styles.insightsCard}>
            {getInsights().map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contribution Graph */}
        <ContributionGraph data={calendarData} />

        {/* Top Performing Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Habits</Text>
          <Text style={styles.sectionSubtitle}>Your most consistent habits this month</Text>
          {getTopHabits().length > 0 ? (
            getTopHabits().map((item, index) => (
              <View key={item.habit.id} style={styles.topHabitCard}>
                <View style={styles.topHabitRank}>
                  <Text style={styles.topHabitRankText}>#{index + 1}</Text>
                </View>
                <View style={[styles.topHabitColor, { backgroundColor: item.habit.color }]} />
                <View style={styles.topHabitInfo}>
                  <Text style={styles.topHabitName}>{item.habit.name}</Text>
                  <Text style={styles.topHabitStats}>
                    {item.completionRate}% completion rate • {item.streak} day current streak
                  </Text>
                  <Text style={styles.topHabitCategory}>{item.habit.category}</Text>
                </View>
                <View style={styles.topHabitBadge}>
                  <Zap size={16} color={colors.accent} />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Create some habits and start tracking to see your top performers here!
              </Text>
            </View>
          )}
        </View>

        {/* Habit Categories Breakdown */}
        {habits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Distribution</Text>
            <Text style={styles.sectionSubtitle}>How your habits are organized</Text>
            <View style={styles.categoryGrid}>
              {Object.entries(
                habits.reduce((acc, habit) => {
                  acc[habit.category] = (acc[habit.category] || 0) + 1;
                  return acc;
                }, {} as { [key: string]: number })
              ).map(([category, count]) => (
                <View key={category} style={styles.categoryCard}>
                  <View style={[styles.categoryDot, { backgroundColor: colors.categories[category as any] }]} />
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  consistencyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consistencyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  consistencyScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  consistencyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  consistencyBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  consistencyFill: {
    height: '100%',
    borderRadius: 4,
  },
  consistencyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightItem: {
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  topHabitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topHabitRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topHabitRankText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
  },
  topHabitColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  topHabitInfo: {
    flex: 1,
  },
  topHabitName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  topHabitStats: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  topHabitCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topHabitBadge: {
    padding: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});