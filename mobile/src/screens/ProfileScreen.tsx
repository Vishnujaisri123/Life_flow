import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>

      <View style={s.statsGrid}>
        {[
          { label: 'Level', value: user?.level },
          { label: 'XP', value: user?.xp },
          { label: 'Streak', value: `🔥 ${user?.streak}` },
        ].map((item) => (
          <View key={item.label} style={s.stat}>
            <Text style={s.statVal}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13', alignItems: 'center', paddingTop: 80, padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: '600' },
  email: { color: '#888', fontSize: 14, marginTop: 4, marginBottom: 32 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  stat: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, alignItems: 'center' },
  statVal: { color: '#a78bfa', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 4 },
  logoutBtn: { width: '100%', borderWidth: 1, borderColor: '#2a2a3e', borderRadius: 10, padding: 14, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontSize: 15 },
});
