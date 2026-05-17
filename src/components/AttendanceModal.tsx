import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, Image, Dimensions, Platform } from 'react-native';
import { X, CheckCircle2, XCircle, Clock, User, ShieldAlert } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface StudentRecord {
  student_id?: string | number;
  student_name?: string;
  email?: string;
  roll_number?: string;
  image_url?: string;
  status?: string;
  marked_at?: string;
}

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  session: any;
  loading: boolean;
  records: StudentRecord[];
  title?: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  onClose,
  session,
  loading,
  records,
  title,
}) => {
  const [filter, setFilter] = useState<'present' | 'absent'>('present');

  const presentRecords = records.filter(
    (r) => r.status && ['present', 'detected', 'processing'].includes(r.status.toLowerCase())
  );
  const absentRecords = records.filter(
    (r) => !r.status || r.status.toLowerCase() === 'absent'
  );

  const displayedRecords = filter === 'present' ? presentRecords : absentRecords;

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title || session?.subject_name || 'Class Attendance'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {session?.year ? `Year ${session.year} • ` : ''}
              {session?.stream || ''}
              {session?.classroom_name ? ` • ${session.classroom_name}` : ''}
            </Text>
          </View>

          {/* Tabbed Filters */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, filter === 'present' && styles.tabBtnPresentActive]}
              onPress={() => setFilter('present')}
            >
              <CheckCircle2
                size={16}
                color={filter === 'present' ? '#fff' : '#105934'}
              />
              <Text
                style={[
                  styles.tabText,
                  filter === 'present' && styles.tabTextActive,
                  { color: filter === 'present' ? '#fff' : '#105934' },
                ]}
              >
                Present ({presentRecords.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, filter === 'absent' && styles.tabBtnAbsentActive]}
              onPress={() => setFilter('absent')}
            >
              <XCircle
                size={16}
                color={filter === 'absent' ? '#fff' : '#ef4444'}
              />
              <Text
                style={[
                  styles.tabText,
                  filter === 'absent' && styles.tabTextActive,
                  { color: filter === 'absent' ? '#fff' : '#ef4444' },
                ]}
              >
                Absent ({absentRecords.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content / Roster List */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#105934" />
                <Text style={styles.loadingText}>Fetching attendance records...</Text>
              </View>
            ) : displayedRecords.length === 0 ? (
              <View style={styles.centerBox}>
                <ShieldAlert size={40} color="#cbd5e1" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyText}>
                  No {filter} students recorded for this class.
                </Text>
              </View>
            ) : (
              <FlatList
                data={displayedRecords}
                keyExtractor={(item, index) => String(item.student_id || index)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const avatarUri = item.image_url || `https://i.pravatar.cc/150?u=${item.student_id || item.roll_number || item.student_name}`;
                  const isPres = filter === 'present';

                  return (
                    <View style={styles.rosterCard}>
                      <Image source={{ uri: avatarUri }} style={styles.avatar} />
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {item.student_name || 'Student Name'}
                        </Text>
                        <Text style={styles.studentRoll}>
                          Roll: {item.roll_number || 'N/A'} • {item.email || ''}
                        </Text>
                      </View>
                      <View style={styles.statusCol}>
                        {isPres ? (
                          <>
                            <View style={[styles.statusBadge, styles.badgePresent]}>
                              <Text style={[styles.statusText, styles.textPresent]}>Present</Text>
                            </View>
                            <Text style={styles.markedTime}>
                              {formatTime(item.marked_at)}
                            </Text>
                          </>
                        ) : (
                          <View style={[styles.statusBadge, styles.badgeAbsent]}>
                            <Text style={[styles.statusText, styles.textAbsent]}>Absent</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </View>
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
    height: height * 0.82,
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
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
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
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  tabBtnPresentActive: {
    backgroundColor: '#105934',
    shadowColor: '#105934',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBtnAbsentActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '700',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 40,
  },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    marginRight: 14,
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  studentRoll: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  badgePresent: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: 'rgba(16, 89, 52, 0.15)',
  },
  badgeAbsent: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textPresent: {
    color: '#105934',
  },
  textAbsent: {
    color: '#ef4444',
  },
  markedTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
});
