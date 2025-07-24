export const HabitIcons = [
  // Health & Fitness
  'heart', 'activity', 'dumbbell', 'apple', 'droplets', 'moon', 'sun',
  
  // Productivity
  'target', 'check-circle', 'clock', 'calendar', 'briefcase', 'laptop',
  
  // Learning
  'book', 'graduation-cap', 'brain', 'lightbulb', 'bookmark', 'pen-tool',
  
  // Relationships
  'users', 'message-circle', 'phone', 'mail', 'coffee', 'gift',
  
  // Finance
  'dollar-sign', 'piggy-bank', 'trending-up', 'credit-card', 'wallet',
  
  // Creativity
  'palette', 'music', 'camera', 'edit-3', 'image', 'film',
  
  // General
  'star', 'flag', 'home', 'car', 'plane', 'tree', 'flower', 'zap'
] as const;

export type HabitIconName = typeof HabitIcons[number];