import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Clock, MapPin, BookOpen, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';
import api from '../api/client';

const { width, height } = Dimensions.get('window');

const STREAMS = ['CSE', 'CSBS', 'ECE', 'ME'];
const YEARS = ['1', '2', '3', '4'];

const getNext7Days = () => {
  const list = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const getVal = (type: string) => parts.find(p => p.type === type)!.value;
    const year = getVal('year');
    const month = getVal('month').padStart(2, '0');
    const day = getVal('day').padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    
    let label = '';
    const dayName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(d);
    const dayNum = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric' }).format(d);
    const monthName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', month: 'short' }).format(d);
    const yearNum = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(d);

    if (i === 0) {
      label = `Today (${dayNum} ${monthName})`;
    } else if (i === 1) {
      label = `Tomorrow (${dayNum} ${monthName})`;
    } else {
      label = `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
    }
    list.push({ iso, label, dateObj: d });
  }
  return list;
};

const parseISTDateTimeToUTC = (dateIsoStr: string, timeStr: string) => {
  if (!timeStr) throw new Error('Time string is missing');
  
  const trimmed = timeStr.trim();
  const parts = trimmed.split(/\s+/);
  const timePart = parts[0];
  const ampm = parts[1] ? parts[1].toUpperCase() : null;
  
  const [year, month, day] = dateIsoStr.split('-').map(Number);
  const timeNums = timePart.split(':').map(Number);
  let hour = timeNums[0];
  const minute = timeNums[1];
  const second = timeNums[2] || 0;
  
  if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  } else if (ampm === 'AM' && hour === 12) {
    hour = 0;
  }
  
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  const istOffsetMillis = 5.5 * 60 * 60 * 1000;
  return new Date(utcMillis - istOffsetMillis).toISOString();
};

interface AddCustomSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCustomSessionModal: React.FC<AddCustomSessionModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [dateList, setDateList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    subject_id: '',
    classroom_id: '',
    selectedDate: null as any,
    selectedSlot: null as any,
    year: '3',
    stream: 'CSE',
  });

  const [showSubjDropdown, setShowSubjDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchInitial();
    }
  }, [visible]);

  const fetchInitial = async () => {
    setFetching(true);
    try {
      const [subRes, clsRes, slotRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classrooms'),
        api.get('/time_slots'),
      ]);

      const subData = subRes.data || [];
      const clsData = clsRes.data || [];
      const rawSlots = slotRes.data || [];

      const sortedSlots = [...rawSlots].sort((a: any, b: any) =>
        (a.raw_start || '').localeCompare(b.raw_start || '')
      );

      const days = getNext7Days();

      setSubjects(subData);
      setClassrooms(clsData);
      setTimeSlots(sortedSlots);
      setDateList(days);

      setFormData((prev) => ({
        ...prev,
        subject_id: subData.length > 0 ? String(subData[0].id) : '',
        classroom_id: clsData.length > 0 ? String(clsData[0].id) : '',
        selectedDate: days[0],
        selectedSlot: sortedSlots.length > 0 ? sortedSlots[0] : null,
      }));
    } catch (err) {
      console.warn('Failed to fetch modal initial data:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleStartCustom = async () => {
    if (!formData.subject_id || !formData.classroom_id || !formData.selectedDate || !formData.selectedSlot) {
      Alert.alert('Missing Fields', 'Please select a subject, classroom, date, and time slot.');
      return;
    }

    if (!formData.selectedSlot.raw_start || !formData.selectedSlot.raw_end) {
      Alert.alert('Invalid Slot', 'The selected time slot is missing duration details.');
      return;
    }

    setLoading(true);
    try {
      const startIso = parseISTDateTimeToUTC(formData.selectedDate.iso, formData.selectedSlot.raw_start);
      const endIso = parseISTDateTimeToUTC(formData.selectedDate.iso, formData.selectedSlot.raw_end);

      await api.post('/sessions/start', {
        subject_id: formData.subject_id,
        classroom_id: formData.classroom_id,
        start_time: startIso,
        end_time: endIso,
        year: formData.year,
        stream: formData.stream,
      });

      Alert.alert('Success', 'Custom session scheduled successfully!');
      setFormData({
        subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
        classroom_id: classrooms[0]?.id ? String(classrooms[0].id) : '',
        selectedDate: dateList[0] || null,
        selectedSlot: timeSlots[0] || null,
        year: '3',
        stream: 'CSE',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to start custom session. Ensure room and slot are available.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find((s) => String(s.id) === formData.subject_id);
  const selectedRoom = classrooms.find((c) => String(c.id) === formData.classroom_id);

  const getCameraLabel = (cls: any) => {
    if (!cls) return 'Select Room';
    const camName = cls.camera_name || `Cam ${cls.camera_url || cls.id}`;
    return `${cls.name} (${camName})`;
  };

  const getCameraSubText = (cls: any) => {
    if (!cls) return '';
    return cls.camera_name || `Cam ${cls.camera_url || cls.id}`;
  };

  const closeAllDropdownsExcept = (active: string) => {
    setShowSubjDropdown(active === 'subj' ? !showSubjDropdown : false);
    setShowRoomDropdown(active === 'room' ? !showRoomDropdown : false);
    setShowDateDropdown(active === 'date' ? !showDateDropdown : false);
    setShowSlotDropdown(active === 'slot' ? !showSlotDropdown : false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>New Custom Class</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {fetching ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#105934" />
              <Text style={styles.loadingText}>Loading institution timetable...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* Subject Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Subject</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, showSubjDropdown && styles.dropdownBtnOpen]}
                  activeOpacity={0.7}
                  onPress={() => closeAllDropdownsExcept('subj')}
                >
                  <BookOpen size={18} color="#64748b" style={styles.inputIcon} />
                  <Text style={styles.dropdownText}>
                    {selectedSubject?.name || 'Select Subject'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="#64748b"
                    style={{ transform: [{ rotate: showSubjDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {showSubjDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 240 }}
                    >
                      {subjects.map((sub) => (
                        <TouchableOpacity
                          key={sub.id}
                          style={styles.dropdownItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setFormData((p) => ({ ...p, subject_id: String(sub.id) }));
                            setShowSubjDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{sub.name}</Text>
                          <Text style={styles.dropdownSubText}>{sub.code || ''}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Classroom Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Classroom / Hardware</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, showRoomDropdown && styles.dropdownBtnOpen]}
                  activeOpacity={0.7}
                  onPress={() => closeAllDropdownsExcept('room')}
                >
                  <MapPin size={18} color="#64748b" style={styles.inputIcon} />
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {getCameraLabel(selectedRoom)}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="#64748b"
                    style={{ transform: [{ rotate: showRoomDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {showRoomDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 240 }}
                    >
                      {classrooms.map((cls) => (
                        <TouchableOpacity
                          key={cls.id}
                          style={styles.dropdownItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setFormData((p) => ({ ...p, classroom_id: String(cls.id) }));
                            setShowRoomDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{cls.name}</Text>
                          <Text style={styles.dropdownSubText} numberOfLines={1}>
                            {getCameraSubText(cls)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Session Date Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Session Date</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, showDateDropdown && styles.dropdownBtnOpen]}
                  activeOpacity={0.7}
                  onPress={() => closeAllDropdownsExcept('date')}
                >
                  <CalendarIcon size={18} color="#64748b" style={styles.inputIcon} />
                  <Text style={styles.dropdownText}>
                    {formData.selectedDate ? formData.selectedDate.label : 'Select Date'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="#64748b"
                    style={{ transform: [{ rotate: showDateDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {showDateDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 240 }}
                    >
                      {dateList.map((day) => (
                        <TouchableOpacity
                          key={day.iso}
                          style={styles.dropdownItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setFormData((p) => ({ ...p, selectedDate: day }));
                            setShowDateDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { width: '100%', textAlign: 'left' }]}>
                            {day.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Time Slot Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Time Slot</Text>
                <TouchableOpacity
                  style={[styles.dropdownBtn, showSlotDropdown && styles.dropdownBtnOpen]}
                  activeOpacity={0.7}
                  onPress={() => closeAllDropdownsExcept('slot')}
                >
                  <Clock size={18} color="#64748b" style={styles.inputIcon} />
                  <Text style={styles.dropdownText}>
                    {formData.selectedSlot
                      ? `${formData.selectedSlot.start_time} - ${formData.selectedSlot.end_time}`
                      : 'Select Slot'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="#64748b"
                    style={{ transform: [{ rotate: showSlotDropdown ? '180deg' : '0deg' }] }}
                  />
                </TouchableOpacity>

                {showSlotDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 240 }}
                    >
                      {timeSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot.id}
                          style={styles.dropdownItem}
                          activeOpacity={0.7}
                          onPress={() => {
                            setFormData((p) => ({ ...p, selectedSlot: slot }));
                            setShowSlotDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, { width: '100%', textAlign: 'center' }]}>
                            {slot.start_time} - {slot.end_time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Target Year */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Target Year</Text>
                <View style={styles.pillsContainer}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.pillBtn, formData.year === y && styles.pillBtnActive]}
                      onPress={() => setFormData((p) => ({ ...p, year: y }))}
                    >
                      <Text style={[styles.pillText, formData.year === y && styles.pillTextActive]}>
                        Yr {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Department */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Department</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainerScroll}>
                  {STREAMS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.pillBtn, formData.stream === s && styles.pillBtnActive]}
                      onPress={() => setFormData((p) => ({ ...p, stream: s }))}
                    >
                      <Text style={[styles.pillText, formData.stream === s && styles.pillTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleStartCustom}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Launch Custom Session</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 60 }} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.9,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  centerBox: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  form: {
    paddingBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  dropdownBtnOpen: {
    borderColor: '#105934',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#105934',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 240,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  dropdownSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 160,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillsContainerScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnActive: {
    backgroundColor: '#105934',
    borderColor: '#105934',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#105934',
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#105934',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
