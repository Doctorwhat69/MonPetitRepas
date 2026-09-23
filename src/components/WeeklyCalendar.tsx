import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeeklyCalendar({ selectedDate, onSelectDate }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const getWeekDays = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = getWeekDays(selectedDate);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <View style={styles.container}>
      {days.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCardFlex,
              {
                backgroundColor: isSelected ? theme.primary : theme.card,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onSelectDate(date)}
          >
            <Text
              style={[
                globalStyles.dayName,
                { color: isSelected ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              {dayNames[index]}
            </Text>

            <Text
              style={[
                globalStyles.dayNumber,
                { color: isSelected ? '#FFFFFF' : theme.text },
              ]}
            >
              {date.getDate()}
            </Text>

            {isToday && (
              <View
                style={[
                  globalStyles.todayIndicator,
                  { backgroundColor: isSelected ? '#FFFFFF' : theme.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
  },
  dayCardFlex: {
    flex: 1, // Chaque carte prend 1/7 de la largeur disponible
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
});