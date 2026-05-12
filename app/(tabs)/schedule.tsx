import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <View style={styles.weekSelector}>
          <TouchableOpacity style={styles.navBtn}>
            <ChevronLeft size={20} color="#105934" />
          </TouchableOpacity>
          <Text style={styles.weekText}>May 12 - May 17</Text>
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
                    <MapPin size={14} color="#666" />
                    <Text style={styles.footerText}>{item.room}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Clock size={14} color="#666" />
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1917',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  navBtn: {
    padding: 4,
  },
  weekText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#105934',
    marginHorizontal: 20,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dayButtonActive: {
    backgroundColor: '#f0f9f4',
  },
  dayText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#105934',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#105934',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },
  timeAmPm: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  durationBadge: {
    marginTop: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '700',
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
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
