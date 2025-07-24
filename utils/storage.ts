import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, Achievement } from '../types/habit';

const STORAGE_KEYS = {
  HABITS: '@ConsistTracker:habits',
  HABIT_LOGS: '@ConsistTracker:habitLogs',
  ACHIEVEMENTS: '@ConsistTracker:achievements',
  USER_SETTINGS: '@ConsistTracker:userSettings',
  ONBOARDING_COMPLETED: '@ConsistTracker:onboardingCompleted',
};

export class StorageService {
  // Habits
  static async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }

  static async addHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    habits.push(habit);
    await this.saveHabits(habits);
  }

  static async updateHabit(updatedHabit: Habit): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index !== -1) {
      habits[index] = updatedHabit;
      await this.saveHabits(habits);
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    await this.saveHabits(filteredHabits);
    
    // Also delete related logs
    const logs = await this.getHabitLogs();
    const filteredLogs = logs.filter(log => log.habitId !== habitId);
    await this.saveHabitLogs(filteredLogs);
  }

  // Habit Logs
  static async getHabitLogs(): Promise<HabitLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading habit logs:', error);
      return [];
    }
  }

  static async saveHabitLogs(logs: HabitLog[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving habit logs:', error);
    }
  }

  static async addHabitLog(log: HabitLog): Promise<void> {
    const logs = await this.getHabitLogs();
    
    // Remove existing log for same habit and date
    const filteredLogs = logs.filter(
      l => !(l.habitId === log.habitId && l.logDate === log.logDate)
    );
    
    filteredLogs.push(log);
    await this.saveHabitLogs(filteredLogs);
  }

  static async getHabitLogsForDate(date: string): Promise<HabitLog[]> {
    const logs = await this.getHabitLogs();
    return logs.filter(log => log.logDate === date);
  }

  static async getHabitLogsForHabit(habitId: string): Promise<HabitLog[]> {
    const logs = await this.getHabitLogs();
    return logs.filter(log => log.habitId === habitId);
  }

  // Achievements
  static async getAchievements(): Promise<Achievement[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  static async addAchievement(achievement: Achievement): Promise<void> {
    const achievements = await this.getAchievements();
    achievements.push(achievement);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  }

  // Settings
  static async getOnboardingCompleted(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return data === 'true';
    } catch (error) {
      return false;
    }
  }

  static async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }

  // Clear all data (for testing/reset)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}