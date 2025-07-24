import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
      />
    );
  };

  const renderWeek = (week: DayData[], weekIndex: number) => (
    <View key={weekIndex} style={styles.week}>
      {week.map((day, dayIndex) => renderDay(day, dayIndex))}
    </View>
  );

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#FFFFFF', '#F8F9FA']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Consistency Journey</Text>
            <Text style={styles.subtitle}>
              Every green square represents a day of progress toward your goals
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.graphContainer}
            style={styles.scrollView}
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
      </LinearGradient>
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 16,
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
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.label,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.labelSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  scrollView: {
    marginBottom: 20,
  },
  graphContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  graph: {
    flexDirection: 'row',
    gap: 4,
  },
  week: {
    flexDirection: 'column',
    gap: 4,
  },
  day: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  legendText: {
    fontSize: 13,
    color: colors.labelSecondary,
    fontWeight: '500',
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendDay: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});