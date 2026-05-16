import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, RefreshControl, Dimensions, Image, StatusBar, Modal } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
  Users, Calendar, CheckCircle, TrendingUp, Clock,
  MapPin, User, Activity, AlertCircle, ChevronRight,
  BookOpen, Plus, Camera, MonitorPlay, XCircle, Bell,
  WifiOff, RefreshCw
} from 'lucide-react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { LinearGradient } from 'expo-linear-gradient';

import api from '../../src/api/client';
import { io } from 'socket.io-client';

const { width } = Dimensions.get('window');
const LOGO_ASSET = require('../../assets/images/icon.png');
const AVATAR_COLORS = ['#4ade80', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#22d3ee'];

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [aiStatus, setAiStatus] = useState('connecting'); // 'active', 'lagging', 'offline', 'connecting'
  const isTeacher = user?.role === 'teacher';

  const [activeSession, setActiveSession] = useState<any>(null);
  const [presentStudents, setPresentStudents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [recentArrivals, setRecentArrivals] = useState<any[]>([]);
  const [studentClasses, setStudentClasses] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'New Attendance Alert', message: '10 students marked present in Data Structures.', time: '2m ago', type: 'success' },
    { id: '2', title: 'System Update', message: 'Merge AI processing speed improved by 20%.', time: '1h ago', type: 'info' },
    { id: '3', title: 'Session Reminder', message: 'Database Systems starts in 15 minutes.', time: '3h ago', type: 'warning' },
    { id: '4', title: 'Welcome to Merge', message: 'Explore your new premium digital identity.', time: '1d ago', type: 'success' },
  ];

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

  const fetchDashboardData = async () => {
    try {
      if (isTeacher) {
        const sessionRes = await api.get('/sessions');
        let sessions = sessionRes.data.filter((s: any) => s.status === 'active' || s.status === 'scheduled');
        sessions = sessions.filter((s: any) => String(s.teacher_name).trim().toLowerCase() === String(user?.name || '').trim().toLowerCase());
        
        const currentActive = sessions.find((s: any) => s.status === 'active') || null;
        setActiveSession(currentActive);

        const statsRes = await api.get('/students');
        setAllStudents(statsRes.data);

        if (currentActive) {
          const attendanceRes = await api.get(`/attendance/session/${currentActive.id}`);
          const students = (attendanceRes.data || []).filter((item: any) => {
            const status = String(item.status || 'present').toLowerCase();
            return ['present', 'detected', 'processing'].includes(status);
          });
          setPresentStudents(students);

          // Get top 10 most recent arrivals
          const sortedArrivals = [...students].sort((a: any, b: any) => 
            new Date(b.timestamp || b.marked_at).getTime() - new Date(a.timestamp || a.marked_at).getTime()
          ).slice(0, 10);
          
          setRecentArrivals(sortedArrivals.map((s: any, idx: number) => ({
            id: s.id || String(idx),
            name: s.student_name || s.name || 'Student',
            roll: s.roll_number || 'N/A',
            email: s.email || 'student@college.edu',
            batch: `Year ${currentActive.year} • ${currentActive.stream}`,
            time: formatTime(s.timestamp || s.marked_at),
            status: s.status === 'late' ? 'Late' : 'On Time',
            avatar: s.image_url || `https://i.pravatar.cc/150?u=${s.student_id || s.id || s.roll_number || s.name}`
          })));
        } else {
          setPresentStudents([]);
          setRecentArrivals([]);
        }
      } else {
        // Student Logic - Fixing 403 by using student-specific endpoints
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames[new Date().getDay()];
        
        // 1. Fetch Today's Schedule
        const scheduleRes = await api.get(`/schedules?year=${user?.year || 3}&stream=${user?.stream || 'CSE'}`);
        const todayClasses = (scheduleRes.data || []).filter((s: any) => s.day_of_week === currentDay);
        setStudentClasses(todayClasses.sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || '')));

        // 2. Fetch My Attendance History (Authorized for students)
        const attendanceRes = await api.get('/students/my-attendance');
        setStudentAttendance(attendanceRes.data || []);

        // 3. Fetch My Overall Stats (For future use or additional cards)
        const statsRes = await api.get('/students/my-stats');
        // We could use statsRes.data.present / total if we wanted overall rate

        // 4. Check for any currently active session for their batch
        const sessionRes = await api.get('/sessions');
        const activeBatchSession = (sessionRes.data || []).find((s: any) => 
          s.status === 'active' && 
          String(s.year) === String(user?.year || 3) && 
          String(s.stream).toLowerCase() === String(user?.stream || 'cse').toLowerCase()
        );
        setActiveSession(activeBatchSession);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper to determine status and priority for sorting
  const getStatusInfo = (item: any) => {
    const isCustom = item.is_custom || String(item.id).startsWith('sess_'); // Handle custom session flag
    
    // 1. Cancelled Status
    if (item.is_cancelled) {
      return { 
        status: 'cancelled', 
        batchLabel: 'Ended', 
        statusLabel: 'Cancelled', 
        color: '#ef4444', 
        priority: 6,
        theme: 'red'
      };
    }
    
    const isLive = activeSession && activeSession.schedule_id === item.id;
    const att = studentAttendance.find(a => {
      // 1. Strict match by schedule_id
      if (a.schedule_id && Number(a.schedule_id) === Number(item.id)) return true;
      
      // 2. Fallback match for custom sessions or same-subject slots
      const isSameSubject = Number(a.subject_id) === Number(item.subject_id);
      const isToday = new Date(a.start_time).toDateString() === new Date().toDateString();
      
      if (isSameSubject && isToday) {
        // Match by time proximity (45 minute window)
        const [h, m] = (item.start_time || '00:00').split(':');
        const classStart = new Date();
        classStart.setHours(parseInt(h), parseInt(m), 0);
        const attStart = new Date(a.start_time);
        const diff = Math.abs(attStart.getTime() - classStart.getTime()) / (1000 * 60);
        return diff < 45;
      }
      return false;
    });

    // 2. LIVE Status Logic
    if (isLive) {
      let subStatus = 'Not Detected Yet';
      let subColor = '#94a3b8';
      
      if (att) {
        if (att.status === 'detected') { subStatus = 'Found You'; subColor = '#22c55e'; }
        else if (att.status === 'processing') { subStatus = 'Processing You'; subColor = '#0284c7'; }
        else if (att.status === 'present') { subStatus = 'Present'; subColor = '#105934'; }
      }

      return { 
        status: 'live', 
        batchLabel: 'LIVE', 
        statusLabel: subStatus, 
        color: subColor, 
        priority: 1, 
        isLive: true,
        theme: isCustom ? 'yellow' : 'emerald'
      };
    }

    // Check if past
    const [h2, m2] = (item.raw_end || '23:59').split(':');
    const endTime = new Date();
    endTime.setHours(parseInt(h2), parseInt(m2), 0);
    const isPast = new Date() > endTime;

    // 3. Ended Status Logic
    if (isPast || (att && (att.status === 'present' || att.status === 'absent'))) {
      const isPresent = att && ['present', 'detected'].includes(att.status);
      return { 
        status: 'ended', 
        batchLabel: 'Ended', 
        statusLabel: isPresent ? 'Present' : 'Absent', 
        color: isPresent ? '#105934' : '#ef4444', 
        priority: 5,
        theme: 'ash'
      };
    }

    // 4. Upcoming Status Logic
    return { 
      status: 'upcoming', 
      batchLabel: 'Upcoming', 
      statusLabel: 'Upcoming', 
      color: isCustom ? '#b45309' : '#1d4ed8', 
      priority: 2,
      theme: isCustom ? 'yellow' : 'blue'
    };
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user, isTeacher]);

  // Student Side Stats Calculation
  const presentCount = studentClasses.filter(cls => 
    studentAttendance.some(att => {
      const isMatch = (att.schedule_id && Number(att.schedule_id) === Number(cls.id)) ||
                      (Number(att.subject_id) === Number(cls.subject_id) && 
                       new Date(att.start_time).toDateString() === new Date().toDateString() &&
                       Math.abs(new Date(att.start_time).getTime() - (new Date().setHours(parseInt(cls.start_time?.split(':')[0]), parseInt(cls.start_time?.split(':')[1]), 0))) / 60000 < 45);
      return isMatch && ['present', 'detected', 'processing'].includes(att.status);
    })
  ).length;
  const totalClassesToday = studentClasses.length;
  const attendanceRate = totalClassesToday > 0 ? Math.round((presentCount / totalClassesToday) * 100) : 0;

  let groupTotal = 0;
  if (isTeacher && activeSession) {
    groupTotal = allStudents.filter(s => 
      String(s.year).trim() === String(activeSession.year).trim() &&
      String(s.stream).trim().toLowerCase() === String(activeSession.stream).toLowerCase()
    ).length;
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Unified Navbar - Always White */}
        <View style={styles.navbarStandalone}>
          <View style={styles.navbarLeft}>
            <Image source={LOGO_ASSET} style={styles.logo} />
            <Text style={styles.appName} numberOfLines={1}>Merge</Text>
          </View>
          <View style={styles.navbarRight}>
            <TouchableOpacity style={styles.notifBtn} onPress={() => setShowNotifications(true)}>
              <Bell size={22} color="#0f172a" strokeWidth={2.2} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notifModal}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeBtn}>
                  <XCircle size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((notif) => (
                  <View key={notif.id} style={styles.notifItem}>
                    <View style={[styles.notifIcon, { 
                      backgroundColor: notif.type === 'success' ? '#f0fdf4' : notif.type === 'warning' ? '#fffbeb' : '#f0f9ff' 
                    }]}>
                      <Bell size={18} color={notif.type === 'success' ? '#105934' : notif.type === 'warning' ? '#d97706' : '#0284c7'} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifRow}>
                        <Text style={styles.notifItemTitle}>{notif.title}</Text>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                      </View>
                      <Text style={styles.notifMessage}>{notif.message}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[styles.scrollContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#105934" />}
        >
          {/* Hero Section with Floating Card for Teacher */}
          {isTeacher && (
            <View style={styles.heroWrapper}>
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={['#ffffff', '#ffffff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.masterHeader}
                />
              </View>

              <View style={styles.heroCardPositioner}>
                <View style={styles.heroCard}>
                  {activeSession ? (
                    <>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.heroSubjectCard} numberOfLines={1}>{activeSession.subject_name}</Text>
                        <View style={styles.badgeRow}>
                          <View style={styles.liveIndicatorCard}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveTextCard}>LIVE</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.heroMetaRowCard}>
                        <Text style={styles.heroMetaCard}>
                          {activeSession.classroom_name} • {activeSession.camera_name || 'Camera'}
                        </Text>
                      </View>

                      <View style={styles.heroFooterCard}>
                        <View style={styles.heroTagCard}><Text style={styles.heroTagTextCard}>Year {activeSession.year}</Text></View>
                        <View style={styles.heroTagCard}><Text style={styles.heroTagTextCard}>{activeSession.stream}</Text></View>
                        <View style={styles.heroTimeCard}>
                          <Clock size={15} color="#fff" strokeWidth={2.5} />
                          <Text style={styles.heroTimeTextCard}>{formatTime(activeSession.start_time)} – {formatTime(activeSession.end_time)}</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
                      <CheckCircle size={40} color="#fff" style={{ marginBottom: 10, opacity: 0.8 }} />
                      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>No Active Session</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 5 }}>You have no classes currently running.</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {isTeacher ? (
                <>
                  <View style={[styles.statCard, { flex: 1.5 }]}>
                    <Text style={styles.statLabel}>STUDENTS IN CLASS</Text>
                    <Text style={styles.statValue}>{activeSession ? groupTotal : 0}</Text>
                    <View style={styles.statFooter}>
                      <Users size={12} color="#64748b" />
                      <Text style={styles.statFooterText}>{activeSession ? `Year ${activeSession.year} • ${activeSession.stream}` : 'No Session'}</Text>
                    </View>
                  </View>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>PRESENT</Text>
                    <Text style={styles.statValue}>{activeSession ? presentStudents.length : 0}</Text>
                    <Text style={styles.statFooterText}>Identified</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.statCard, { flex: 1 }]}>
                    <Text style={styles.statLabel}>CLASSES TODAY</Text>
                    <Text style={styles.statValue}>{totalClassesToday}</Text>
                    <View style={styles.statFooter}>
                      <Clock size={12} color="#105934" />
                      <Text style={styles.statFooterText}>Done: {presentCount}</Text>
                    </View>
                  </View>
                  <View style={[styles.statCard, { flex: 1.3, backgroundColor: '#f8fafc', overflow: 'hidden' }]}>
                    {/* Background Progress Fill */}
                    <View style={[styles.cardProgressFill, { width: `${attendanceRate}%` }]}>
                      <LinearGradient
                        colors={['rgba(16, 89, 52, 0.12)', 'rgba(34, 197, 94, 0.08)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </View>

                    <View style={styles.progressHeader}>
                      <Text style={styles.statLabel}>PACE</Text>
                      <TrendingUp size={12} color="#105934" />
                    </View>
                    
                    <View style={styles.fullProgressWrapper}>
                      <View style={styles.fullProgressLabelRow}>
                        <Text style={styles.fullProgressValue}>{attendanceRate}%</Text>
                        <Text style={styles.fullProgressSub}>Rate</Text>
                      </View>
                    </View>
                    <Text style={styles.statFooterText}>Today's Pace</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Sections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isTeacher ? "Recent Arrivals" : "Classes"}</Text>
              {!isTeacher && <Text style={styles.viewAll}>Today</Text>}
            </View>

            {(!isTeacher && studentClasses.length === 0) ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No class today</Text>
              </View>
            ) : (isTeacher ? recentArrivals : [...studentClasses].sort((a, b) => {
              const aInfo = getStatusInfo(a);
              const bInfo = getStatusInfo(b);
              if (aInfo.priority !== bInfo.priority) return aInfo.priority - bInfo.priority;
              return (a.start_time || '').localeCompare(b.start_time || '');
            })).map((item: any, idx: number) => {
              const isArrival = isTeacher;
              const ringColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              
              // Use helper for student status
              const sInfo = !isTeacher ? getStatusInfo(item) : { 
                status: '', 
                batchLabel: '', 
                statusLabel: '', 
                color: '#64748b', 
                isLive: false,
                theme: 'emerald'
              };
              const status = sInfo.status;
              const statusLabel = sInfo.statusLabel;
              const statusColor = sInfo.color;
              const batchLabel = sInfo.batchLabel;
              const isClassLive = sInfo.isLive;
              const theme = sInfo.theme;

              // Theme based colors
              const themeColors = {
                emerald: { border: '#105934', bg: '#f0fdf4', text: '#105934' },
                blue: { border: '#1d4ed8', bg: '#eff6ff', text: '#1d4ed8' },
                yellow: { border: '#b45309', bg: '#fffbeb', text: '#b45309' },
                ash: { border: '#94a3b8', bg: '#f8fafc', text: '#64748b' },
                red: { border: '#ef4444', bg: '#fef2f2', text: '#ef4444' },
              };
              const activeTheme = themeColors[theme as keyof typeof themeColors] || themeColors.ash;

              return (
                <View 
                  key={idx} 
                  style={[
                    styles.activityCard, 
                    !isTeacher && isClassLive && { borderColor: activeTheme.border, borderWidth: 1.5, backgroundColor: activeTheme.bg },
                    !isTeacher && !isClassLive && theme === 'blue' && { borderColor: activeTheme.border + '30', borderWidth: 1, backgroundColor: '#fff' },
                    !isTeacher && !isClassLive && theme === 'yellow' && { borderColor: activeTheme.border + '30', borderWidth: 1, backgroundColor: '#fff' },
                    !isTeacher && theme === 'ash' && { opacity: 0.8, backgroundColor: '#f9fafb' },
                    !isTeacher && theme === 'red' && { backgroundColor: '#fff5f5', borderColor: '#feb2b2', borderWidth: 1 }
                  ]}
                >
                  {isArrival && (
                    <View style={[styles.avatarRing, { borderColor: ringColor }]}>
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    </View>
                  )}
                  <View style={styles.activityInfo}>
                    <View style={styles.subjectRowHeader}>
                      <Text 
                        style={[
                          styles.activitySubject, 
                          !isTeacher && theme === 'red' && { textDecorationLine: 'line-through', color: '#ef4444' },
                          !isTeacher && theme === 'ash' && { color: '#64748b' }
                        ]} 
                        numberOfLines={1}
                      >
                        {isArrival ? item.name : item.subject_name}
                      </Text>
                      {!isTeacher && batchLabel !== '' && (
                        <View style={[styles.liveTagMini, { backgroundColor: activeTheme.border }]}>
                          {isClassLive && <View style={styles.liveDot} />}
                          <Text style={styles.liveTagTextMini}>{batchLabel}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.activityMeta} numberOfLines={1}>
                      {isArrival ? `Roll: ${item.roll} • ${item.batch}` : `${item.teacher_name} • ${item.classroom_name}`}
                    </Text>
                    <View style={styles.timeRow}>
                      <Clock size={12} color={!isTeacher ? activeTheme.text : '#64748b'} />
                      <Text style={[styles.activityTime, { color: !isTeacher ? activeTheme.text : '#64748b' }]}>
                        {isArrival ? item.time : `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`}
                      </Text>
                    </View>
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
                    <View style={[styles.statusBadgeFull, { backgroundColor: statusColor + '15' }]}>
                      <Text style={[styles.statusTextFull, { color: statusColor }]}>
                        {statusLabel}
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
  navbarStandalone: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heroWrapper: {
    height: 205,
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  headerContainer: {
    width: width * 1.8,
    height: 180,
    alignSelf: 'center',
    borderBottomLeftRadius: width * 0.9,
    borderBottomRightRadius: width * 0.9,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  masterHeader: {
    flex: 1,
  },
  navbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  heroCardPositioner: {
    position: 'absolute',
    top: 5,
    width: width,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  heroCard: {
    backgroundColor: '#105934',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#105934',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroSubjectCard: {
    flex: 1,
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
    marginRight: 10,
  },
  heroMetaRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heroMetaCard: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiHealthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bgActive: { backgroundColor: 'rgba(74, 222, 128, 0.3)' },
  bgLagging: { backgroundColor: 'rgba(251, 146, 60, 0.4)' },
  bgOffline: { backgroundColor: 'rgba(248, 113, 113, 0.4)' },
  bgConnecting: { backgroundColor: 'rgba(96, 165, 250, 0.4)' },
  aiHealthText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  liveTextCard: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroFooterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  heroTagCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  heroTagTextCard: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  heroTimeTextCard: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    letterSpacing: 0.5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#105934',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#105934',
    width: 40,
    textAlign: 'right',
  },
  liveClassCard: {
    borderColor: '#105934',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
  },
  subjectRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  liveTagMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#105934',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagTextMini: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  statusBadgeFull: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center',
  },
  statusTextFull: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
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
  cardProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 89, 52, 0.05)', // Fallback
  },
  fullProgressWrapper: {
    marginTop: 10,
    gap: 8,
  },
  fullProgressLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  fullProgressValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#105934',
  },
  fullProgressSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#105934',
    opacity: 0.6,
  },
  fullProgressBarOuter: {
    height: 10,
    backgroundColor: 'rgba(16, 89, 52, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fullProgressBarInner: {
    height: '100%',
    borderRadius: 5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  notifModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  notifTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifContent: {
    flex: 1,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  notifItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  notifMessage: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 18,
  }
});
