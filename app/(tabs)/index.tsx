import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, Dimensions, Image, StatusBar } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
  Users, Calendar, CheckCircle, TrendingUp, Clock,
  MapPin, User, Activity, AlertCircle, ChevronRight,
  BookOpen, Plus, Camera, MonitorPlay, XCircle, Bell
} from 'lucide-react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const LOGO_URL = "https://res.cloudinary.com/dmi7vzu8w/image/upload/v1778328482/Picsart_26-05-07_07-29-20-114_v3en0e.jpg";
const AVATAR_COLORS = ['#105934', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const isTeacher = user?.role === 'teacher';

  // Mock data
  const studentStats = { present: 12, total: 15, rate: '80%' };
  const teacherStats = { active: 3, total: 142, present: 87, avg: '92%' };

  const studentActivity = [
    { subject: 'Data Structures', teacher: 'Dr. Aris Thorne', time: '09:00 AM - 11:00 AM', status: 'present' },
    { subject: 'Database Systems', teacher: 'Prof. Sarah Jenkins', time: '11:00 AM - 01:00 PM', status: 'missed' },
  ];

  const recentArrivals = [
    { id: '1', name: 'Mahammad Anish', roll: '30', email: 'anish@college.edu', batch: 'Year 3 • CSE', time: '09:05 AM', status: 'On Time', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Rahul Sharma', roll: '31', email: 'rahul@college.edu', batch: 'Year 3 • CSE', time: '09:12 AM', status: 'On Time', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Priya Singh', roll: '32', email: 'priya@college.edu', batch: 'Year 2 • ECE', time: '09:28 AM', status: 'Late', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Vikram AD', roll: '33', email: 'vikram@college.edu', batch: 'Year 3 • CSE', time: '09:30 AM', status: 'Late', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: '5', name: 'Sneha Kapur', roll: '34', email: 'sneha@college.edu', batch: 'Year 1 • IT', time: '09:35 AM', status: 'Late', avatar: 'https://i.pravatar.cc/150?u=5' },
  ];

  const teacherActiveSession = {
    subject: 'Data Structures',
    room: 'Lab-01',
    cam: 'Front Cam',
    time: '09:00 AM – 11:00 AM',
    year: 'Year 3',
    stream: 'CSE'
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        <StatusBar barStyle={isTeacher ? "light-content" : "dark-content"} />
        
        {/* Master Header - Infinite Arc Design */}
        {isTeacher && (
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#105934', '#064e3b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.masterHeader}
            >
              <View style={styles.headerContentWrapper}>
                <View style={styles.integratedNavbar}>
                  <View style={styles.navbarLeft}>
                    <Image source={{ uri: LOGO_URL }} style={styles.logo} />
                    <Text style={styles.appNameLight} numberOfLines={1}>Merge</Text>
                  </View>
                  <View style={styles.navbarRight}>
                    <TouchableOpacity style={styles.notifBtnLight}>
                      <Bell size={22} color="#fff" strokeWidth={2.2} />
                      <View style={styles.notifDot} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.heroContent}>
                  <Text style={styles.heroSubject}>{teacherActiveSession.subject}</Text>
                  
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroMeta}>
                      {teacherActiveSession.room} • {teacherActiveSession.cam}
                    </Text>
                    <View style={styles.liveIndicator}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>

                  <View style={styles.heroFooter}>
                    <View style={styles.heroTag}><Text style={styles.heroTagText}>{teacherActiveSession.year}</Text></View>
                    <View style={styles.heroTag}><Text style={styles.heroTagText}>{teacherActiveSession.stream}</Text></View>
                    <View style={styles.heroTime}><Clock size={16} color="#fff" /><Text style={styles.heroTimeText}>{teacherActiveSession.time}</Text></View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {!isTeacher && (
          <View style={styles.navbarStandalone}>
            <View style={styles.navbarLeft}>
              <Image source={{ uri: LOGO_URL }} style={styles.logo} />
              <Text style={styles.appName} numberOfLines={1}>Merge</Text>
            </View>
            <View style={styles.navbarRight}>
              <TouchableOpacity style={styles.notifBtn}>
                <Bell size={22} color="#0f172a" strokeWidth={2.2} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[styles.scrollContent, { paddingTop: isTeacher ? 0 : 0 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isTeacher ? "#105934" : "#105934"} />}
        >
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {isTeacher ? (
                <>
                  <View style={[styles.statCard, { flex: 1.5 }]}>
                    <Text style={styles.statLabel}>STUDENTS IN CLASS</Text>
                    <Text style={styles.statValue}>{teacherStats.total}</Text>
                    <View style={styles.statFooter}>
                      <Users size={12} color="#64748b" />
                      <Text style={styles.statFooterText}>{teacherActiveSession.year} • {teacherActiveSession.stream}</Text>
                    </View>
                  </View>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>PRESENT</Text>
                    <Text style={styles.statValue}>{teacherStats.present}</Text>
                    <Text style={styles.statFooterText}>Identified</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>PRESENT DAYS</Text>
                    <Text style={styles.statValue}>{studentStats.present}</Text>
                    <View style={styles.statFooter}>
                      <CheckCircle size={12} color="#105934" />
                      <Text style={styles.statFooterText}>Total: {studentStats.total}</Text>
                    </View>
                  </View>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>ATTENDANCE RATE</Text>
                    <Text style={styles.statValue}>{studentStats.rate}</Text>
                    <View style={styles.statFooter}>
                      <TrendingUp size={12} color="#105934" />
                      <Text style={styles.statFooterText}>Academic Avg</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Sections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isTeacher ? "Recent Arrivals" : "My Activity"}</Text>
            </View>

            {(isTeacher ? recentArrivals : studentActivity).map((item: any, idx: number) => {
              const isArrival = 'name' in item;
              const ringColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              
              return (
                <View key={idx} style={styles.activityCard}>
                  {isArrival && (
                    <View style={[styles.avatarRing, { borderColor: ringColor }]}>
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    </View>
                  )}
                  <View style={styles.activityInfo}>
                    <Text style={styles.activitySubject} numberOfLines={1}>
                      {isArrival ? item.name : item.subject}
                    </Text>
                    <Text style={styles.activityMeta} numberOfLines={1}>
                      {isArrival ? `Roll: ${item.roll} • ${item.batch}` : item.teacher}
                    </Text>
                    {isArrival ? (
                      <Text style={styles.activityEmail} numberOfLines={1}>{item.email}</Text>
                    ) : (
                      <Text style={styles.activityTime}>{item.time}</Text>
                    )}
                  </View>
                  
                  {isArrival && (
                    <View style={styles.arrivalRight}>
                      <View style={styles.timeBadge}>
                        <Clock size={12} color="#105934" />
                        <Text style={styles.timeBadgeText}>{item.time}</Text>
                      </View>
                    </View>
                  )}
                  {!isArrival && (
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'present' ? '#f0fdf4' : '#fef2f2' }]}>
                      {item.status === 'present' ? <CheckCircle size={14} color="#105934" /> : <XCircle size={14} color="#ef4444" />}
                      <Text style={[styles.statusText, { color: item.status === 'present' ? '#105934' : '#ef4444' }]}>
                        {item.status === 'present' ? 'Present' : 'Absent'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

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
  headerContainer: {
    width: width * 1.6, // Wider than screen for shallow curve
    height: 380,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderBottomLeftRadius: width * 0.8,
    borderBottomRightRadius: width * 0.8,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#105934',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
  },
  masterHeader: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
  },
  headerContentWrapper: {
    width: width, // Constraint content back to screen width
    alignSelf: 'center',
  },
  integratedNavbar: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarStandalone: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#105934',
    letterSpacing: -0.5,
  },
  appNameLight: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  navbarRight: {
    alignItems: 'flex-end',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  notifBtnLight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  heroSubject: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  heroMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 25,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  heroTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  heroTimeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 4,
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statFooterText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  viewAll: {
    color: '#105934',
    fontSize: 14,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarRing: {
    padding: 2,
    borderRadius: 30,
    borderWidth: 2,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activitySubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  activityMeta: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  activityEmail: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 1,
  },
  activityTime: {
    fontSize: 11,
    color: '#105934',
    fontWeight: '700',
    marginTop: 4,
  },
  arrivalRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  timeBadgeText: {
    fontSize: 13,
    color: '#105934',
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 10,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  }
});
