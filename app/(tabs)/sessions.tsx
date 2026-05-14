import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, FlatList } from 'react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { Clock, Plus, CalendarDays, Star, BookOpen, User, MapPin, ChevronDown } from 'lucide-react-native';

export default function SessionsScreen() {
  const [expandedDate, setExpandedDate] = useState('Today');

  const sessions = [
    { id: '1', subject: 'Data Structures', type: 'Regular', year: '3', stream: 'CSE', room: 'Lab-01', time: '09:00 AM - 11:00 AM', status: 'active' },
    { id: '2', subject: 'Database Systems', type: 'Regular', year: '3', stream: 'CSE', room: 'Hall-B', time: '11:00 AM - 01:00 PM', status: 'scheduled' },
    { id: '3', subject: 'Custom Workshop', type: 'Custom', year: '3', stream: 'CSE', room: 'Studio-1', time: '02:00 PM - 04:00 PM', status: 'scheduled' },
  ];

  const stats = [
    { label: 'Live', val: 1, color: '#105934', icon: Clock },
    { label: 'Upcoming', val: 2, color: '#2563eb', icon: CalendarDays },
    { label: 'Custom', val: 1, color: '#d97706', icon: Star },
  ];

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Sessions</Text>
            <Text style={styles.subtitle}>Monitor and manage all class sessions</Text>
          </View>
          <TouchableOpacity style={styles.newBtn}>
            <Plus size={18} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row (Matching Desktop PIILLS) */}
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statPill}>
              <stat.icon size={12} color={stat.color} />
              <Text style={[styles.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.dateHeader} 
            onPress={() => setExpandedDate(expandedDate === 'Today' ? null : 'Today')}
          >
            <View style={styles.dateHeaderLeft}>
              <View style={styles.todayChip}><Text style={styles.todayChipText}>TODAY</Text></View>
              <Text style={styles.dateText}>12 May, 2024</Text>
            </View>
            <ChevronDown size={18} color="#64748b" />
          </TouchableOpacity>

          {expandedDate === 'Today' && sessions.map((item) => (
            <View key={item.id} style={[styles.sessionCard, item.status === 'active' ? styles.activeCard : null]}>
              <View style={[styles.typeBar, { backgroundColor: item.type === 'Custom' ? '#f59e0b' : '#105934' }]} />
              <View style={styles.cardContent}>
                <View style={styles.cardMain}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#f0fdf4' : '#eff6ff' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'active' ? '#105934' : '#2563eb' }]}>
                      {item.status === 'active' ? 'Live' : 'Upcoming'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}><User size={12} color="#94a3b8" /><Text style={styles.metaText}>Year {item.year} · {item.stream}</Text></View>
                  <View style={styles.metaItem}><MapPin size={12} color="#94a3b8" /><Text style={styles.metaText}>{item.room}</Text></View>
                </View>
                <View style={styles.metaItem}><Clock size={12} color="#94a3b8" /><Text style={styles.metaText}>{item.time}</Text></View>
              </View>
            </View>
          ))}
          
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </SwipeWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  newBtn: {
    backgroundColor: '#105934',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 15,
  },
  dateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todayChip: {
    backgroundColor: '#105934',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: '#105934',
    backgroundColor: '#f0fdf4',
  },
  typeBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
