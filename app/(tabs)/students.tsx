import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, FlatList, TextInput, ActivityIndicator, RefreshControl, Image, Modal } from 'react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { Users, Search, Filter, User, MoreVertical, Mail, ChevronRight } from 'lucide-react-native';
import api from '../../src/api/client';

const YEARS = ['All Years', '1', '2', '3', '4'];
const STREAMS = ['All Streams', 'CSE', 'CSBS', 'ECE', 'ME', 'IT'];

export default function StudentsScreen() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState('All Years');
  const [selectedStreamFilter, setSelectedStreamFilter] = useState('All Streams');

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data || []);
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const filteredStudents = students.filter(s => {
    const term = search.toLowerCase();
    const matchesSearch = (s.name && s.name.toLowerCase().includes(term)) ||
           (s.roll_number && String(s.roll_number).toLowerCase().includes(term)) ||
           (s.email && s.email.toLowerCase().includes(term)) ||
           (s.year && String(s.year).toLowerCase().includes(term)) ||
           (s.stream && s.stream.toLowerCase().includes(term));
           
    const matchesYear = selectedYearFilter === 'All Years' || String(s.year) === selectedYearFilter;
    const matchesStream = selectedStreamFilter === 'All Streams' || String(s.stream).toLowerCase() === selectedStreamFilter.toLowerCase();
    
    return matchesSearch && matchesYear && matchesStream;
  });

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        {/* Header (Matching Desktop Table Header) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Students</Text>
            <Text style={styles.subtitle}>Institutional Student Database</Text>
          </View>
        </View>

        {/* Search & Filter (Matching Desktop Controls) */}
        <View style={styles.controls}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <TextInput 
              placeholder="Search students..." 
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
            <Filter size={18} color="#105934" />
          </TouchableOpacity>
        </View>

        {/* List Content */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#105934" />
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item, index) => String(item.id || index)}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#105934" />
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.studentCard}>
                <View style={styles.avatar}>
                  <Image 
                    source={{ uri: item.image_url || `https://i.pravatar.cc/150?u=${item.id || item.roll_number || item.name}` }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email || 'No email'}</Text>
                  <View style={styles.idsRow}>
                    <Text style={styles.idLabel}>Roll: {item.roll_number || 'N/A'}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.idLabel}>Year {item.year || 'N/A'}</Text>
                    {item.stream && (
                      <>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.idLabel}>{item.stream}</Text>
                      </>
                    )}
                  </View>
                </View>
                <ChevronRight size={18} color="#cbd5e1" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#94a3b8', fontSize: 16 }}>No students found.</Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 120 }} />}
          />
        )}

        {/* Filter Modal */}
        <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Students</Text>
              
              <Text style={styles.filterSectionTitle}>Academic Year</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                {YEARS.map(y => (
                  <TouchableOpacity 
                    key={y} 
                    style={[styles.filterPill, selectedYearFilter === y && styles.filterPillActive]}
                    onPress={() => setSelectedYearFilter(y)}
                  >
                    <Text style={[styles.filterPillText, selectedYearFilter === y && styles.filterPillTextActive]}>
                      {y === 'All Years' ? y : `Year ${y}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterSectionTitle}>Stream / Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
                {STREAMS.map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.filterPill, selectedStreamFilter === s && styles.filterPillActive]}
                    onPress={() => setSelectedStreamFilter(s)}
                  >
                    <Text style={[styles.filterPillText, selectedStreamFilter === s && styles.filterPillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyBtnText}>Show Results</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#105934',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  email: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  idsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  idLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
  dot: {
    color: '#cbd5e1',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 12,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  filterPillActive: {
    backgroundColor: '#105934',
    borderColor: '#105934',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  applyBtn: {
    backgroundColor: '#105934',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
