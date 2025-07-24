import React, { useState, useCallback } from 'react';
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
import { Plus, CreditCard as Edit3, Trash2, Archive, Filter } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { HabitCard } from '../../components/HabitCard';
import { CreateHabitModal } from '../../components/CreateHabitModal';

import { Habit, HabitLog, HabitStreak, HabitCategory } from '../../types/habit';
import { getColors } from '../../constants/colors';
import { StorageService } from '../../utils/storage';
import { HabitUtils } from '../../utils/habitUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { v4 as uuidv4 } from 'uuid';

export default function HabitsScreen() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<{ [key: string]: HabitStreak }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<HabitCategory | 'All'>('All');

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
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load habits. Please try again.');
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
      if (editingHabit) {
        await StorageService.updateHabit(habit);
      } else {
        await StorageService.addHabit(habit);
      }
      await loadData();
      setEditingHabit(undefined);
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowCreateModal(true);
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?\n\nThis will permanently remove:\n• The habit itself\n• All ${logs.filter(l => l.habitId === habit.id).length} logged entries\n• All streak data\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteHabit(habit.id);
              await loadData();
              Alert.alert('Deleted', `"${habit.name}" has been deleted successfully.`);
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleArchiveHabit = async (habit: Habit) => {
    try {
      const updatedHabit = { ...habit, archivedAt: new Date() };
      await StorageService.updateHabit(updatedHabit);
      await loadData();
      Alert.alert('Archived', `"${habit.name}" has been archived. You can restore it from the archived habits section.`);
    } catch (error) {
      console.error('Error archiving habit:', error);
      Alert.alert('Error', 'Failed to archive habit. Please try again.');
    }
  };

  const handleHabitPress = (habit: Habit) => {
    const completionRate = HabitUtils.getCompletionRate(habit.id, logs, 30);
    const streak = streaks[habit.id];
    
    Alert.alert(
      habit.name,
      `${habit.description || 'No description'}\n\nStats:\n• Current streak: ${streak?.currentStreak || 0} days\n• Best streak: ${streak?.longestStreak || 0} days\n• 30-day completion: ${completionRate}%\n\nWhat would you like to do?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Edit',
          onPress: () => handleEditHabit(habit),
          style: 'default',
        },
        {
          text: 'Archive',
          onPress: () => handleArchiveHabit(habit),
          style: 'default',
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteHabit(habit),
          style: 'destructive',
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingHabit(undefined);
  };

  const handleFilterPress = () => {
    const categories: (HabitCategory | 'All')[] = ['All', 'Health', 'Productivity', 'Learning', 'Relationships', 'Finance', 'Creativity'];
    
    Alert.alert(
      'Filter Habits',
      'Choose a category to filter your habits:',
      [
        { text: 'Cancel', style: 'cancel' },
        ...categories.map(category => ({
          text: category,
          onPress: () => setFilterCategory(category),
          style: filterCategory === category ? 'destructive' : 'default' as any,
        })),
      ]
    );
  };

  const getFilteredHabits = () => {
    if (filterCategory === 'All') return habits;
    return habits.filter(habit => habit.category === filterCategory);
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    habits.forEach(habit => {
      stats[habit.category] = (stats[habit.category] || 0) + 1;
    });
    return stats;
  };

  const filteredHabits = getFilteredHabits();
  const categoryStats = getCategoryStats();

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Habits</Text>
          <Text style={styles.subtitle}>
            {filteredHabits.length} {filterCategory !== 'All' ? filterCategory.toLowerCase() : ''} habit{filteredHabits.length !== 1 ? 's' : ''}
            {habits.length !== filteredHabits.length && ` of ${habits.length} total`}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Filter size={20} color={filterCategory !== 'All' ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {filterCategory !== 'All' && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>
            Showing {filterCategory} habits • {filteredHabits.length} of {habits.length}
          </Text>
          <TouchableOpacity onPress={() => setFilterCategory('All')}>
            <Text style={styles.clearFilterText}>Show All</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No Habits Yet</Text>
            <Text style={styles.emptyStateText}>
              Start building consistency by creating your first habit. 
              Choose from our suggestions or create a completely custom habit 
              that fits your lifestyle and goals.
            </Text>
            <TouchableOpacity
              style={styles.createFirstHabitButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color={colors.textLight} />
              <Text style={styles.createFirstHabitText}>Create Your First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No {filterCategory} Habits</Text>
            <Text style={styles.emptyStateText}>
              You don't have any {filterCategory.toLowerCase()} habits yet. 
              Create one or try a different category filter.
            </Text>
            <TouchableOpacity
              style={styles.createFirstHabitButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color={colors.textLight} />
              <Text style={styles.createFirstHabitText}>Create {filterCategory} Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {filteredHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logs}
                streak={streaks[habit.id] || { habitId: habit.id, currentStreak: 0, longestStreak: 0 }}
                onToggleComplete={handleToggleHabit}
                onPress={handleHabitPress}
              />
            ))}
          </View>
        )}

        {habits.length > 0 && (
          <View style={styles.categoryBreakdown}>
            <Text style={styles.categoryTitle}>Category Breakdown</Text>
            {Object.entries(categoryStats).map(([category, count]) => (
              <View key={category} style={styles.categoryRow}>
                <View style={[styles.categoryDot, { backgroundColor: colors.categories[category as HabitCategory] }]} />
                <Text style={styles.categoryName}>{category}</Text>
                <Text style={styles.categoryCount}>{count} habit{count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CreateHabitModal
        visible={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateHabit}
        editingHabit={editingHabit}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clearFilterText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  habitsList: {
    paddingVertical: 8,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
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
  categoryBreakdown: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});