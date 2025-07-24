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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Check, Sparkles } from 'lucide-react-native';
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

const habitTypes: { type: HabitType; label: string; description: string; emoji: string }[] = [
  { type: 'daily', label: 'Daily', description: 'Complete every day', emoji: '📅' },
  { type: 'weekly', label: 'Weekly', description: 'Complete X times per week', emoji: '📊' },
  { type: 'quantity', label: 'Quantity', description: 'Track a specific amount', emoji: '🔢' },
];

const habitSuggestions = {
  Health: [
    { name: 'Drink 8 glasses of water', type: 'quantity' as HabitType, target: 8, description: 'Stay hydrated throughout the day' },
    { name: 'Exercise for 30 minutes', type: 'daily' as HabitType, description: 'Keep your body active and strong' },
    { name: 'Take daily vitamins', type: 'daily' as HabitType, description: 'Support your nutritional needs' },
    { name: 'Go for a morning walk', type: 'daily' as HabitType, description: 'Start your day with fresh air' },
  ],
  Productivity: [
    { name: 'Review daily goals', type: 'daily' as HabitType, description: 'Plan and prioritize your day' },
    { name: 'Clean workspace', type: 'daily' as HabitType, description: 'Maintain an organized environment' },
    { name: 'Plan tomorrow', type: 'daily' as HabitType, description: 'End each day prepared for the next' },
    { name: 'Deep work session', type: 'weekly' as HabitType, frequency: 5, description: 'Focus on important projects' },
  ],
  Learning: [
    { name: 'Read for 30 minutes', type: 'daily' as HabitType, description: 'Expand your knowledge daily' },
    { name: 'Practice a new language', type: 'daily' as HabitType, description: 'Build language skills consistently' },
    { name: 'Watch educational videos', type: 'weekly' as HabitType, frequency: 3, description: 'Learn something new' },
    { name: 'Write in journal', type: 'daily' as HabitType, description: 'Reflect on your experiences' },
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
    setDescription(suggestion.description || '');
    setHabitType(suggestion.type);
    if (suggestion.target) setTargetValue(suggestion.target.toString());
    if (suggestion.frequency) setTargetFrequency(suggestion.frequency.toString());
  };

  const styles = createStyles(colors, isDark);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
          style={styles.backgroundGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <View style={styles.closeButtonBackground}>
                <X size={20} color={colors.labelSecondary} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.saveButtonGradient}
              >
                <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!editingHabit && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderWithIcon}>
                  <Sparkles size={20} color={colors.primary} strokeWidth={2.5} />
                  <Text style={styles.sectionTitle}>Quick Start</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                  Choose from expertly crafted habit suggestions or create your own
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.suggestionsContainer}>
                    {habitSuggestions[category]?.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionButton}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        <LinearGradient
                          colors={[colors.primary + '15', colors.primary + '25']}
                          style={styles.suggestionGradient}
                        >
                          <Text style={styles.suggestionText}>{suggestion.name}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habit Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter a meaningful habit name"
                  placeholderTextColor={colors.labelTertiary}
                  maxLength={50}
                />
              </View>
              <Text style={styles.helperText}>{name.length}/50 characters</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionSubtitle}>Add context to help you stay motivated</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Why is this habit important to you?"
                  placeholderTextColor={colors.labelTertiary}
                  multiline
                  maxLength={200}
                />
              </View>
              <Text style={styles.helperText}>{description.length}/200 characters</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.sectionSubtitle}>Organize your habits by life area</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        category === cat && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <LinearGradient
                        colors={category === cat 
                          ? [colors.categories[cat], colors.categories[cat] + 'DD'] 
                          : [colors.systemGray6, colors.systemGray5]
                        }
                        style={styles.categoryGradient}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            category === cat && styles.categoryTextSelected,
                          ]}
                        >
                          {cat}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tracking Type</Text>
              <Text style={styles.sectionSubtitle}>Choose how you want to measure progress</Text>
              {habitTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeButton,
                    habitType === type.type && styles.typeButtonSelected,
                  ]}
                  onPress={() => setHabitType(type.type)}
                >
                  <LinearGradient
                    colors={habitType === type.type 
                      ? [colors.primary + '15', colors.primary + '25'] 
                      : [colors.surface, colors.systemGray6]
                    }
                    style={styles.typeGradient}
                  >
                    <View style={styles.typeContent}>
                      <View style={styles.typeHeader}>
                        <Text style={styles.typeEmoji}>{type.emoji}</Text>
                        <Text style={[
                          styles.typeLabel,
                          habitType === type.type && styles.typeLabelSelected,
                        ]}>
                          {type.label}
                        </Text>
                      </View>
                      <Text style={[
                        styles.typeDescription,
                        habitType === type.type && styles.typeDescriptionSelected,
                      ]}>
                        {type.description}
                      </Text>
                    </View>
                    {habitType === type.type && (
                      <Check size={20} color={colors.primary} strokeWidth={2.5} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {habitType === 'quantity' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Target Amount</Text>
                <Text style={styles.sectionSubtitle}>How many do you want to complete daily?</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    placeholder="e.g., 10 (push-ups, pages, glasses)"
                    placeholderTextColor={colors.labelTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            {habitType === 'weekly' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Frequency</Text>
                <Text style={styles.sectionSubtitle}>How many times per week?</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={targetFrequency}
                    onChangeText={setTargetFrequency}
                    placeholder="e.g., 3 (times per week)"
                    placeholderTextColor={colors.labelTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color Theme</Text>
              <Text style={styles.sectionSubtitle}>Choose a color that inspires you</Text>
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
                        <Check size={18} color="white" strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.systemGray5,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.label,
  },
  saveButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.labelSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 12,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 17,
    color: colors.label,
    fontWeight: '500',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 13,
    color: colors.labelTertiary,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  suggestionButton: {
    borderRadius: 12,
  },
  suggestionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  suggestionText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryButton: {
    borderRadius: 20,
  },
  categoryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  categoryButtonSelected: {},
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.label,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
  },
  typeButton: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: isDark ? '#000000' : '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  typeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
  },
  typeButtonSelected: {},
  typeContent: {
    flex: 1,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  typeEmoji: {
    fontSize: 18,
  },
  typeLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.label,
  },
  typeLabelSelected: {
    color: colors.primary,
  },
  typeDescription: {
    fontSize: 15,
    color: colors.labelSecondary,
    lineHeight: 20,
  },
  typeDescriptionSelected: {
    color: colors.primary,
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 4,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: colors.label,
  },
});