import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import apiClient from '../../src/api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attendance: '0%',
    classesToday: 0,
    upcoming: 'None'
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: string | number, color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.nameText}>{user?.name || 'Academic'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <AlertCircle size={24} color="#105934" />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#105934', '#166534']}
        style={styles.mainCard}
      >
        <View style={styles.mainCardContent}>
          <View>
            <Text style={styles.mainCardLabel}>Current Status</Text>
            <Text style={styles.mainCardTitle}>On Track</Text>
            <Text style={styles.mainCardDesc}>You have 2 classes left today.</Text>
          </View>
          <View style={styles.progressCircle}>
            <TrendingUp size={30} color="#ffffff" />
          </View>
        </View>
        <TouchableOpacity style={styles.mainCardButton}>
          <Text style={styles.mainCardButtonText}>View Full Schedule</Text>
          <ArrowRight size={16} color="#105934" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard icon={CheckCircle} title="Attendance" value="85%" color="#105934" />
        <StatCard icon={BookOpen} title="Classes" value="4" color="#f59e0b" />
        <StatCard icon={Users} title="Groups" value="3" color="#3b82f6" />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionTime}>
          <Clock size={16} color="#666" />
          <Text style={styles.timeText}>10:00 AM</Text>
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionSubject}>Advanced Mathematics</Text>
          <Text style={styles.sessionRoom}>Room 402 • Prof. Smith</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Live</Text>
        </View>
      </View>

      <View style={[styles.sessionCard, styles.upcomingCard]}>
        <View style={styles.sessionTime}>
          <Clock size={16} color="#666" />
          <Text style={styles.timeText}>11:30 AM</Text>
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionSubject}>Computer Science</Text>
          <Text style={styles.sessionRoom}>Lab 2 • Prof. Johnson</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1917',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCardLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mainCardTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  mainCardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mainCardButtonText: {
    color: '#105934',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginHorizontal: 4,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
  },
  seeAll: {
    color: '#105934',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  upcomingCard: {
    backgroundColor: '#f9fafb',
    borderColor: 'transparent',
  },
  sessionTime: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    width: 80,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  sessionInfo: {
    flex: 1,
    paddingLeft: 16,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1917',
  },
  sessionRoom: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
