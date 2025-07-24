import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { DayData } from '../types/habit';
import { getColors, getCompletionColor } from '../constants/colors';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

interface ContributionGraphProps {
  data: DayData[];
  onDayPress?: (dayData: DayData) => void;
}

export const ContributionGraph: React.FC<ContributionGraphProps> = ({
  data,
  onDayPress,
}) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const weeks = [];
  const daysPerWeek = 7;
  
  // Group data into weeks
  for (let i = 0; i < data.length; i += daysPerWeek) {
    weeks.push(data.slice(i, i + daysPerWeek));
  }

  const renderDay = (dayData: DayData, index: number) => {
    const color = getCompletionColor(dayData.completionPercentage, isDark);
    
    return (
      <TouchableOpacity
        key={`${dayData.date}-${index}`}
        style={[styles.day, { backgroundColor: color }]}
        onPress={() => onDayPress?.(dayData)}
        hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      />
    );
  };

  const renderWeek = (week: DayData[], weekIndex: number) => (
    <View key={weekIndex} style={styles.week}>
      {week.map((day, dayIndex) => renderDay(day, dayIndex))}
    </View>
  );

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Consistency Journey</Text>
      <Text style={styles.subtitle}>
        Track your daily progress and build lasting habits through visual consistency
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.graphContainer}
      >
        <View style={styles.graph}>
          {weeks.map((week, index) => renderWeek(week, index))}
        </View>
      </ScrollView>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={styles.legendColors}>
          <View style={[styles.legendDay, { backgroundColor: getCompletionColor(0, isDark) }]} />
          <View style={[styles.legendDay, { backgroundColor: getCompletionColor(20, isDark) }]} />
          <View style={[styles.legendDay, { backgroundColor: getCompletionColor(40, isDark) }]} />
          <View style={[styles.legendDay, { backgroundColor: getCompletionColor(60, isDark) }]} />
          <View style={[styles.legendDay, { backgroundColor: getCompletionColor(80, isDark) }]} />
        </View>
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  graphContainer: {
    paddingHorizontal: 8,
  },
  graph: {
    flexDirection: 'row',
    gap: 3,
  },
  week: {
    flexDirection: 'column',
    gap: 3,
  },
  day: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  legendColors: {
    flexDirection: 'row',
    gap: 3,
  },
  legendDay: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});