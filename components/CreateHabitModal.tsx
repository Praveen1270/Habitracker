import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { Habit, HabitCategory, HabitType } from '../types/habit';
import { getColors } from '../constants/colors';
import { HabitIcons, HabitIconName } from '../constants/icons';
import { useTheme } from '../contexts/ThemeContext';
import { v4 as uuidv4 } from 'uuid';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => void;
  editingHabit?: Habit;
}

const categories: HabitCategory[] = [
  'Health', 'Productivity', 'Learning', 'Relationships', 'Finance', 'Creativity'
];

const habitTypes: { type: HabitType; label: string; description: string }[] = [
  { type: 'daily', label: 'Daily', description: 'Complete every day' },
  { type: 'weekly', label: 'Weekly', description: 'Complete X times per week' },
  { type: 'quantity', label: 'Quantity', description: 'Track a specific amount' },
];

const habitSuggestions = {
  Health: [
    { name: 'Drink 8 glasses of water', type: 'quantity' as HabitType, target: 8 },
    { name: 'Exercise for 30 minutes', type: 'daily' as HabitType },
    { name: 'Take vitamins', type: 'daily' as HabitType },
    { name: 'Go for a walk', type: 'daily' as HabitType },
  ],
  Productivity: [
    { name: 'Review daily goals', type: 'daily' as HabitType },
    { name: 'Clean workspace', type: 'daily' as HabitType },
    { name: 'Plan tomorrow', type: 'daily' as HabitType },
    { name: 'Deep work session', type: 'weekly' as HabitType, frequency: 5 },
  ],
  Learning: [
    { name: 'Read for 30 minutes', type: 'daily' as HabitType },
    { name: 'Practice a new language', type: 'daily' as HabitType },
    { name: 'Watch educational videos', type: 'weekly' as HabitType, frequency: 3 },
    { name: 'Write in journal', type: 'daily' as HabitType },
  ],
};

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  visible,
  onClose,
  onSave,
  editingHabit,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [name, setName] = useState(editingHabit?.name || '');
  const [description, setDescription] = useState(editingHabit?.description || '');
  const [category, setCategory] = useState<HabitCategory>(editingHabit?.category || 'Health');
  const [habitType, setHabitType] = useState<HabitType>(editingHabit?.habitType || 'daily');
  const [targetValue, setTargetValue] = useState(editingHabit?.targetValue?.toString() || '');
  const [targetFrequency, setTargetFrequency] = useState(editingHabit?.targetFrequency?.toString() || '3');
  const [selectedColor, setSelectedColor] = useState(editingHabit?.color || colors.habitColors[0]);
  const [selectedIcon, setSelectedIcon] = useState<HabitIconName>(editingHabit?.icon as HabitIconName || 'target');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a habit name to continue.');
      return;
    }

    if (habitType === 'quantity' && (!targetValue || parseInt(targetValue) <= 0)) {
      Alert.alert('Invalid Target', 'Please enter a valid target value greater than 0.');
      return;
    }

    if (habitType === 'weekly' && (!targetFrequency || parseInt(targetFrequency) <= 0 || parseInt(targetFrequency) > 7)) {
      Alert.alert('Invalid Frequency', 'Please enter a valid frequency between 1-7 times per week.');
      return;
    }

    const habit: Habit = {
      id: editingHabit?.id || uuidv4(),
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      habitType,
      targetValue: habitType === 'quantity' ? parseInt(targetValue) : undefined,
      targetFrequency: habitType === 'weekly' ? parseInt(targetFrequency) : undefined,
      color: selectedColor,
      icon: selectedIcon,
      createdAt: editingHabit?.createdAt || new Date(),
      archivedAt: editingHabit?.archivedAt,
    };

    onSave(habit);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('Health');
    setHabitType('daily');
    setTargetValue('');
    setTargetFrequency('3');
    setSelectedColor(colors.habitColors[0]);
    setSelectedIcon('target');
    onClose();
  };

  const handleSuggestionPress = (suggestion: any) => {
    setName(suggestion.name);
    setHabitType(suggestion.type);
    if (suggestion.target) setTargetValue(suggestion.target.toString());
    if (suggestion.frequency) setTargetFrequency(suggestion.frequency.toString());
  };

  const styles = createStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Check size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!editingHabit && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Start</Text>
              <Text style={styles.sectionSubtitle}>Choose from popular habits or create your own</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestionsContainer}>
                  {habitSuggestions[category]?.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter habit name (e.g., 'Drink water', 'Exercise')"
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
            <Text style={styles.helperText}>{name.length}/50 characters</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details about your habit (e.g., 'First thing in the morning')"
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={200}
            />
            <Text style={styles.helperText}>{description.length}/200 characters</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <Text style={styles.sectionSubtitle}>Choose a category to organize your habits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonSelected,
                      { borderColor: colors.categories[cat] }
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat && styles.categoryTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Type</Text>
            <Text style={styles.sectionSubtitle}>How do you want to track this habit?</Text>
            {habitTypes.map((type) => (
              <TouchableOpacity
                key={type.type}
                style={[
                  styles.typeButton,
                  habitType === type.type && styles.typeButtonSelected,
                ]}
                onPress={() => setHabitType(type.type)}
              >
                <View style={styles.typeContent}>
                  <Text style={[
                    styles.typeLabel,
                    habitType === type.type && styles.typeLabelSelected,
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    habitType === type.type && styles.typeDescriptionSelected,
                  ]}>
                    {type.description}
                  </Text>
                </View>
                {habitType === type.type && (
                  <Check size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {habitType === 'quantity' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Target Amount</Text>
              <Text style={styles.sectionSubtitle}>How many do you want to complete daily?</Text>
              <TextInput
                style={styles.textInput}
                value={targetValue}
                onChangeText={setTargetValue}
                placeholder="e.g., 10 (push-ups, pages, glasses of water)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}

          {habitType === 'weekly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Frequency</Text>
              <Text style={styles.sectionSubtitle}>How many times per week?</Text>
              <TextInput
                style={styles.textInput}
                value={targetFrequency}
                onChangeText={setTargetFrequency}
                placeholder="e.g., 3 (times per week)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Theme</Text>
            <Text style={styles.sectionSubtitle}>Choose a color to represent your habit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorContainer}>
                {colors.habitColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Check size={16} color="white" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  categoryTextSelected: {
    color: colors.textLight,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  typeButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: colors.primary,
  },
  typeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeDescriptionSelected: {
    color: colors.primary,
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
});