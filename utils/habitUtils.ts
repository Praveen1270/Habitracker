import { format, startOfDay, differenceInDays, subDays, addDays } from 'date-fns';
import { Habit, HabitLog, HabitStreak, DayData } from '../types/habit';

export class HabitUtils {
  static formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  static parseDate(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
  }

  static getTodayString(): string {
    return this.formatDate(new Date());
  }

  static calculateStreak(habitId: string, logs: HabitLog[]): HabitStreak {
    const habitLogs = logs
      .filter(log => log.habitId === habitId)
      .sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());

    if (habitLogs.length === 0) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    const today = startOfDay(new Date());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastLogDate: string | undefined;

    // Calculate current streak
    for (let i = 0; i < habitLogs.length; i++) {
      const logDate = startOfDay(this.parseDate(habitLogs[i].logDate));
      const expectedDate = subDays(today, i);

      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        if (!lastLogDate) lastLogDate = habitLogs[i].logDate;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let streakStart = 0;
    for (let i = 0; i < habitLogs.length; i++) {
      const currentLogDate = startOfDay(this.parseDate(habitLogs[i].logDate));
      
      if (i === 0) {
        tempStreak = 1;
        streakStart = 0;
      } else {
        const prevLogDate = startOfDay(this.parseDate(habitLogs[i - 1].logDate));
        const daysDiff = differenceInDays(prevLogDate, currentLogDate);
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      habitId,
      currentStreak,
      longestStreak,
      lastLogDate,
    };
  }

  static generateCalendarData(habits: Habit[], logs: HabitLog[], days: number = 365): DayData[] {
    const today = new Date();
    const data: DayData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = this.formatDate(date);
      
      const activeHabits = habits.filter(h => 
        !h.archivedAt && 
        new Date(h.createdAt) <= date
      );
      
      const dayLogs = logs.filter(log => log.logDate === dateString);
      const completedHabits = dayLogs.length;
      const totalHabits = activeHabits.length;
      
      const completionPercentage = totalHabits > 0 
        ? Math.round((completedHabits / totalHabits) * 100) 
        : 0;

      data.push({
        date: dateString,
        completionPercentage,
        habitsCompleted: completedHabits,
        totalHabits,
      });
    }

    return data;
  }

  static getCompletionRate(habitId: string, logs: HabitLog[], days: number = 30): number {
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    const habitLogs = logs.filter(log => 
      log.habitId === habitId && 
      new Date(log.logDate) >= startDate
    );

    return days > 0 ? Math.round((habitLogs.length / days) * 100) : 0;
  }

  static isHabitCompletedToday(habitId: string, logs: HabitLog[]): boolean {
    const today = this.getTodayString();
    return logs.some(log => log.habitId === habitId && log.logDate === today);
  }

  static getWeeklyProgress(habits: Habit[], logs: HabitLog[]): { [key: string]: number } {
    const today = new Date();
    const weekStart = subDays(today, 6); // Last 7 days
    
    const progress: { [key: string]: number } = {};
    
    habits.forEach(habit => {
      const weekLogs = logs.filter(log => 
        log.habitId === habit.id && 
        new Date(log.logDate) >= weekStart
      );
      
      progress[habit.id] = Math.round((weekLogs.length / 7) * 100);
    });

    return progress;
  }

  static shouldShowStreakCelebration(streak: number): boolean {
    // Show celebration for milestone streaks
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    return milestones.includes(streak);
  }

  static getStreakMessage(streak: number): string {
    if (streak >= 365) return `🎉 Amazing! ${streak} days strong!`;
    if (streak >= 100) return `🔥 Incredible! ${streak} day streak!`;
    if (streak >= 30) return `⭐ Fantastic! ${streak} days in a row!`;
    if (streak >= 14) return `💪 Great job! ${streak} day streak!`;
    if (streak >= 7) return `🎯 One week streak! Keep going!`;
    return `Day ${streak} - You're building momentum!`;
  }
}