import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

interface Props {
  currentDate: Date;
  onChangeDate: (newDate: Date) => void;
}

// Helper local pour éviter les décalages UTC
const formatLocalDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function WeeklyCalendar({ currentDate, onChangeDate }: Props) {
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef<FlatList>(null);

  // Tableau de dates : de J-15 à J+30
  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -15; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const activeDateString = formatLocalDate(currentDate);
  const todayString = formatLocalDate(new Date());

  // Scroll automatique sécurisé vers le jour sélectionné
  useEffect(() => {
    const index = dates.findIndex((d) => formatLocalDate(d) === activeDateString);
    if (index !== -1 && flatListRef.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [activeDateString, dates]);

  const renderItem = ({ item }: { item: Date }) => {
    const isSelected = formatLocalDate(item) === activeDateString;
    const isToday = formatLocalDate(item) === todayString;

    const nomJour = item.toLocaleDateString('fr-FR', { weekday: 'short' });
    const numeroJour = item.getDate();

    return (
      <TouchableOpacity
        onPress={() => onChangeDate(item)}
        style={[
          styles.dayCard,
          { backgroundColor: isSelected ? theme.primary : theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.dayName, { color: isSelected ? '#FFFFFF' : theme.textSecondary }]}>
          {nomJour.toUpperCase()}
        </Text>
        <Text style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : theme.text }]}>
          {numeroJour}
        </Text>
        {isToday && (
          <View style={[styles.todayIndicator, { backgroundColor: isSelected ? '#FFFFFF' : theme.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => formatLocalDate(item)}
        renderItem={renderItem}
        initialScrollIndex={15}
        getItemLayout={(_, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 75,
    marginBottom: 10,
  },
  dayCard: {
    width: 52,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  dayName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});