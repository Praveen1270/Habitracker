export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  habitType: HabitType;
  targetValue?: number; // for quantity-based habits
  targetFrequency?: number; // for weekly habits
  color: string;
  icon: string;
  createdAt: Date;
  archivedAt?: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  logDate: string; // YYYY-MM-DD format
  value: number;
  notes?: string;
  createdAt: Date;
}

export type HabitCategory = 
  | 'Health' 
  | 'Productivity' 
  | 'Learning' 
  | 'Relationships' 
  | 'Finance' 
  | 'Creativity';

export type HabitType = 'daily' | 'weekly' | 'quantity';

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastLogDate?: string;
}

export interface DayData {
  date: string;
  completionPercentage: number;
  habitsCompleted: number;
  totalHabits: number;
}

export interface Achievement {
  id: string;
  habitId?: string;
  type: string;
  title: string;
  description: string;
  unlockedAt: Date;
  icon: string;
}