import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { Clock, Plus, CalendarDays, Star, BookOpen, User, MapPin, ChevronDown, XCircle } from 'lucide-react-native';
import api from '../../src/api/client';
import { useAuth } from '../../src/context/AuthContext';

export default function SessionsScreen() {
  const [expandedDate, setExpandedDate] = useState('Today');

  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isTeacher = user?.role === 'teacher';

  const formatTime = (time: any) => {
    if (!time) return '--:--';
    const timeStr = String(time);
    if (timeStr.includes('Z')) return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let t = timeStr;
    if (timeStr.includes('T')) t = timeStr.split('T')[1].split('.')[0];
    if (t.includes(':')) {
      const parts = t.split(':');
      if (parts.length >= 2) {
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
      }
    }
    return timeStr;
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      let data = response.data || [];
      if (isTeacher) {
        data = data.filter((s: any) => String(s.teacher_name).trim().toLowerCase() === String(user?.name || '').trim().toLowerCase());
      }
      setSessions(data);
    } catch (err) {
      console.warn('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, isTeacher]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessions();
  };

  const todayDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const liveCount = sessions.filter((s: any) => s.status === 'active').length;
  const upcomingCount = sessions.filter((s: any) => s.status === 'scheduled').length;
  const customCount = sessions.filter((s: any) => s.type === 'custom' || s.type === 'extra').length;
  const cancelledCount = sessions.filter((s: any) => s.status === 'cancelled').length;

  const stats = [
    { label: 'Live', val: liveCount, color: '#105934', icon: Clock },
    { label: 'Upcoming', val: upcomingCount, color: '#2563eb', icon: CalendarDays },
    { label: 'Custom', val: customCount, color: '#d97706', icon: Star },
    { label: 'Cancelled', val: cancelledCount, color: '#ef4444', icon: XCircle },
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

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#105934" />}
        >
          <TouchableOpacity 
            style={styles.dateHeader} 
            onPress={() => setExpandedDate(expandedDate === 'Today' ? '' : 'Today')}
          >
            <View style={styles.dateHeaderLeft}>
              <View style={styles.todayChip}><Text style={styles.todayChipText}>TODAY</Text></View>
              <Text style={styles.dateText}>{todayDate}</Text>
            </View>
            <ChevronDown size={18} color="#64748b" />
          </TouchableOpacity>

          {expandedDate === 'Today' && (
            loading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#105934" />
              </View>
            ) : sessions.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 16 }}>No sessions today.</Text>
              </View>
            ) : sessions.map((item) => (
              <View key={item.id} style={[styles.sessionCard, item.status === 'active' ? styles.activeCard : null]}>
                <View style={[styles.typeBar, { backgroundColor: item.type === 'custom' ? '#f59e0b' : item.status === 'cancelled' ? '#ef4444' : '#105934' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardMain}>
                    <Text style={[styles.subjectText, item.status === 'cancelled' && { textDecorationLine: 'line-through', color: '#94a3b8' }]}>{item.subject_name}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: item.status === 'active' ? '#f0fdf4' : item.status === 'cancelled' ? '#fef2f2' : '#eff6ff' 
                    }]}>
                      <Text style={[styles.statusText, { 
                        color: item.status === 'active' ? '#105934' : item.status === 'cancelled' ? '#ef4444' : '#2563eb' 
                      }]}>
                        {item.status === 'active' ? 'Live' : item.status === 'cancelled' ? 'Cancelled' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}><User size={12} color="#94a3b8" /><Text style={styles.metaText}>Year {item.year} · {item.stream}</Text></View>
                    <View style={styles.metaItem}><MapPin size={12} color="#94a3b8" /><Text style={styles.metaText}>{item.classroom_name}</Text></View>
                  </View>
                  <View style={styles.metaItem}><Clock size={12} color="#94a3b8" /><Text style={styles.metaText}>{formatTime(item.start_time)} - {formatTime(item.end_time)}</Text></View>
                </View>
              </View>
            ))
          )}
          
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
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
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
