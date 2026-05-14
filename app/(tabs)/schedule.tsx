import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Clock, MapPin, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState('Mon');

  const scheduleData = [
    { id: '1', time: '09:00 AM', subject: 'Database Management', room: 'Room 101', teacher: 'Dr. Alice', duration: '1h' },
    { id: '2', time: '10:00 AM', subject: 'Software Engineering', room: 'Lab 1', teacher: 'Prof. Bob', duration: '2h' },
    { id: '3', time: '01:00 PM', subject: 'Cloud Computing', room: 'Room 202', teacher: 'Dr. Charlie', duration: '1h' },
    { id: '4', time: '02:00 PM', subject: 'Digital Marketing', room: 'Online', teacher: 'Ms. Diana', duration: '1h' },
  ];

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Timetable</Text>
          <View style={styles.weekSelector}>
            <TouchableOpacity style={styles.navBtn}>
              <ChevronLeft size={20} color="#105934" />
            </TouchableOpacity>
            <View style={styles.dateInfo}>
              <CalendarIcon size={14} color="#105934" style={{ marginRight: 6 }} />
              <Text style={styles.weekText}>May 12 - May 17</Text>
            </View>
            <TouchableOpacity style={styles.navBtn}>
              <ChevronRight size={20} color="#105934" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.daysRow}>
          {DAYS.map((day) => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>{day}</Text>
              {selectedDay === day && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={scheduleData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeStart}>{item.time.split(' ')[0]}</Text>
                <Text style={styles.timeAmPm}>{item.time.split(' ')[1]}</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{item.duration}</Text>
                </View>
              </View>
              
              <View style={styles.cardContainer}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={styles.footerText}>{item.room}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <Clock size={14} color="#64748b" />
                      <Text style={styles.footerText}>{item.teacher}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No classes scheduled for today.</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      </View>
    </SwipeWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  navBtn: {
    padding: 4,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#105934',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
  },
  dayButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#105934',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  dayText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#105934',
  },
  activeDot: {
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#105934',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeStart: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  timeAmPm: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  durationBadge: {
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  cardContainer: {
    flex: 1,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 15,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#105934',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
