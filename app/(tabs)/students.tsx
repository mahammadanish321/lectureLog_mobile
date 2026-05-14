import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, FlatList, TextInput } from 'react-native';
import { SwipeWrapper } from '../../src/components/SwipeWrapper';
import { Users, Search, Filter, User, UserPlus, MoreVertical, Mail, ChevronRight } from 'lucide-react-native';

export default function StudentsScreen() {
  const [search, setSearch] = useState('');

  const students = [
    { id: '1', name: 'Mahammad Anish', roll: '30', id_num: 'gmit-30', year: '3', stream: 'CSE', email: 'anish@college.edu' },
    { id: '2', name: 'Rahul Sharma', roll: '31', id_num: 'gmit-31', year: '3', stream: 'CSE', email: 'rahul@college.edu' },
    { id: '3', name: 'Priya Singh', roll: '32', id_num: 'gmit-32', year: '2', stream: 'ECE', email: 'priya@college.edu' },
    { id: '4', name: 'Vikram AD', roll: '33', id_num: 'gmit-33', year: '3', stream: 'CSE', email: 'vikram@college.edu' },
  ];

  return (
    <SwipeWrapper>
      <View style={styles.mainContainer}>
        {/* Header (Matching Desktop Table Header) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Students</Text>
            <Text style={styles.subtitle}>Institutional Student Database</Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <UserPlus size={18} color="#fff" />
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={18} color="#105934" />
          </TouchableOpacity>
        </View>

        {/* List Content */}
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.studentCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <View style={styles.idsRow}>
                  <Text style={styles.idLabel}>Roll: {item.roll}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.idLabel}>Year {item.year}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
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
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#105934',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
});
