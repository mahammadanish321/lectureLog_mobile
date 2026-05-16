import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Platform, Modal, ActivityIndicator } from 'react-native';
import { Clock, MapPin, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, User, Plus } from 'lucide-react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import api from '../../src/api/client';
import { useAuth } from '../../src/context/AuthContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = { 'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday' };
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const STREAMS = ['CSE', 'CSBS', 'ECE', 'ME'];

const getWeekStart = (offset = 0) => {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + (offset * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatISODate = (date: any) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getCurrentDayName = () => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[new Date().getDay()];
};

const normalizeTime = (t: string) => {
  if (!t) return '';
  const match = t.match(/(\d{1,2}:\d{2})/);
  if (!match) return t;
  let [h, m] = match[1].split(':');
  return `${h.padStart(2, '0')}:${m}`;
};

export default function ScheduleScreen() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const canManage = isTeacher || user?.role === 'admin';

  const [selectedDay, setSelectedDay] = useState(getCurrentDayName());
  const [selectedYear, setSelectedYear] = useState(user?.year ? `${user.year}${user.year === 1 ? 'st' : user.year === 2 ? 'nd' : user.year === 3 ? 'rd' : 'th'} Year` : '3rd Year');
  const [selectedStream, setSelectedStream] = useState(user?.stream || 'CSE');
  const [showYearModal, setShowYearModal] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const yearVal = selectedYear.split('')[0]; // "3" from "3rd Year"
      const weekStartParam = formatISODate(getWeekStart(weekOffset));
      
      const [slotRes, schedRes] = await Promise.all([
        api.get('/time_slots'),
        api.get(`/schedules?year=${yearVal}&stream=${selectedStream}&week_start=${weekStartParam}`)
      ]);
      
      const sortedSlots = (slotRes.data || []).sort((a: any, b: any) => (a.raw_start || '').localeCompare(b.raw_start || ''));
      const combinedSchedules = (schedRes.data || []).sort((a: any, b: any) => {
        // Prioritize snapshots/history so they are picked up by .find() first
        if (a.is_snapshot_history && !b.is_snapshot_history) return -1;
        if (!a.is_snapshot_history && b.is_snapshot_history) return 1;
        return 0;
      });
      
      setTimeSlots(sortedSlots);
      setSchedules(combinedSchedules);
    } catch (err) {
      console.warn('Failed to fetch timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedStream, weekOffset]);

  const weekStart = getWeekStart(weekOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekText = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const isCurrentTimeSlot = (slot: any) => {
    if (weekOffset !== 0 || selectedDay !== getCurrentDayName()) return false;
    if (!slot.raw_start || !slot.raw_end) return false;
    
    const [h1, m1] = slot.raw_start.split(':');
    const [h2, m2] = slot.raw_end.split(':');
    
    const start = new Date(now);
    start.setHours(parseInt(h1, 10), parseInt(m1, 10), 0, 0);
    
    const end = new Date(now);
    end.setHours(parseInt(h2, 10), parseInt(m2, 10), 0, 0);
    
    return now >= start && now <= end;
  };

  const SelectionModal = ({ visible, options, onSelect, onClose, title }: any) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((opt: any) => (
            <TouchableOpacity 
              key={opt} 
              style={styles.modalOption} 
              onPress={() => { onSelect(opt); onClose(); }}
            >
              <Text style={styles.modalOptionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Routine</Text>
            {canManage && (
              <View style={styles.dropdowns}>
                <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowYearModal(true)}>
                  <Text style={styles.dropdownText}>{selectedYear.split(' ')[0]}</Text>
                  <ChevronDown size={12} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowStreamModal(true)}>
                  <Text style={styles.dropdownText}>{selectedStream}</Text>
                  <ChevronDown size={12} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
            <View style={[styles.weekSelector, { flex: 1, marginTop: 0 }]}>
              <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset(prev => prev - 1)}>
                <ChevronLeft size={20} color="#105934" />
              </TouchableOpacity>
              <View style={styles.dateInfo}>
                <CalendarIcon size={14} color="#105934" style={{ marginRight: 6 }} />
                <Text style={styles.weekText}>{weekText}</Text>
              </View>
              <TouchableOpacity style={styles.navBtn} onPress={() => setWeekOffset(prev => prev + 1)}>
                <ChevronRight size={20} color="#105934" />
              </TouchableOpacity>
            </View>

            {weekOffset !== 0 && (
              <TouchableOpacity 
                style={styles.todayBtn}
                onPress={() => {
                  setWeekOffset(0);
                  setSelectedDay(getCurrentDayName());
                }}
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.daysRowWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
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
          </ScrollView>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#105934" />
          </View>
        ) : (
          <FlatList
            data={timeSlots}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: slot }) => {
              const fullDayName = FULL_DAYS[selectedDay as keyof typeof FULL_DAYS];
              const matches = schedules.filter(d => {
                const isSameDay = d.day_of_week === fullDayName;
                const slotStart = normalizeTime(slot.raw_start || slot.start_time);
                const schedStart = normalizeTime(d.start_time);
                return isSameDay && slotStart === schedStart;
              });
              
              const isCurrent = isCurrentTimeSlot(slot);
              const [startFull, startAmpm] = (slot.start_time || '').split(' ');
              
              return (
                <View style={[styles.scheduleItem, isCurrent && styles.currentScheduleItem]}>
                  {isCurrent && <View style={styles.currentIndicator} />}
                  <View style={styles.timeColumn}>
                    <Text style={[styles.timeStart, isCurrent && { color: '#105934' }]}>{startFull}</Text>
                    <Text style={styles.timeAmPm}>{startAmpm}</Text>
                    <View style={[styles.timeSeparator, isCurrent && { backgroundColor: '#10593450' }]} />
                    <Text style={styles.timeEnd}>{slot.end_time}</Text>
                  </View>
                  
                  <View style={styles.cardContainer}>
                    {matches.length > 0 ? matches.map((item, mIdx) => {
                      let statusColor = '#cbd5e1';
                      let statusLabel = 'FREE';
                      
                      if (item.is_cancelled) {
                        statusColor = '#ef4444';
                        statusLabel = 'CANCELLED';
                      } else if (item.session_type === 'custom' || item.is_custom) {
                        statusColor = '#eab308';
                        statusLabel = 'CUSTOM';
                      } else {
                        statusColor = '#105934';
                        statusLabel = 'REGULAR';
                      }

                      return (
                        <TouchableOpacity 
                          key={item.id + '_' + mIdx}
                          style={[styles.card, { borderColor: statusColor + '20', marginBottom: mIdx < matches.length - 1 ? 8 : 0 }]}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.typeBar, { backgroundColor: statusColor }]} />
                          <View style={styles.cardHeader}>
                            <View style={styles.subjectRow}>
                              <Text style={[styles.subjectText, item.is_cancelled && styles.cancelledText]}>
                                {item.subject_name}
                              </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                              <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                            </View>
                            <View style={styles.cardFooter}>
                              <View style={styles.footerItem}>
                                <MapPin size={12} color="#64748b" />
                                <Text style={styles.footerText}>{item.classroom_name}</Text>
                              </View>
                              <View style={styles.footerItem}>
                                <User size={12} color="#64748b" />
                                <Text style={styles.footerText}>{item.teacher_name}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }) : (
                      <View style={[styles.card, styles.cardEmpty]}>
                        <View style={[styles.typeBar, { backgroundColor: '#cbd5e1' }]} />
                        <View style={styles.emptyContent}>
                          <Text style={styles.emptyLabel}>FREE</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            ListFooterComponent={<View style={{ height: 140 }} />}
          />
        )}

        <SelectionModal 
          visible={showYearModal} 
          options={YEARS} 
          onSelect={setSelectedYear} 
          onClose={() => setShowYearModal(false)}
          title="Select Academic Year"
        />
        <SelectionModal 
          visible={showStreamModal} 
          options={STREAMS} 
          onSelect={setSelectedStream} 
          onClose={() => setShowStreamModal(false)}
          title="Select Department"
        />
      </View>
    </SwipeWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  dropdowns: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  dropdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  todayBtn: {
    marginLeft: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 89, 52, 0.2)',
  },
  todayBtnText: {
    color: '#105934',
    fontWeight: '800',
    fontSize: 14,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
  daysRowWrapper: {
    marginBottom: 20,
  },
  daysRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dayButtonActive: {
    backgroundColor: '#105934',
    borderColor: '#105934',
  },
  dayText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#fff',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 4,
    position: 'absolute',
    bottom: 6,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  currentScheduleItem: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: -10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 89, 52, 0.1)',
  },
  currentIndicator: {
    position: 'absolute',
    left: -2,
    top: '30%',
    bottom: '30%',
    width: 4,
    backgroundColor: '#105934',
    borderRadius: 4,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeStart: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
  },
  timeAmPm: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 2,
  },
  timeSeparator: {
    width: 1,
    height: 10,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  timeEnd: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  cardContainer: {
    flex: 1,
    marginLeft: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  cardEmpty: {
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    opacity: 0.8,
  },
  typeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardHeader: {
    flex: 1,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
  },
  emptyLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#cbd5e1',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
});
