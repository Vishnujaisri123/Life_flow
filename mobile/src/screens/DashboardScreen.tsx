import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/apiClient';

type Task = { _id: string; title: string; status: string; priority: string };

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ tasks: Task[] }>('/tasks?limit=5')
      .then((d) => setTasks(d.tasks ?? []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = tasks.filter((t) => t.status !== 'completed').length;
  const done = tasks.filter((t) => t.status === 'completed').length;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
      <Text style={s.sub}>Level {user?.level} · {user?.xp} XP · 🔥 {user?.streak} day streak</Text>

      <View style={s.statsRow}>
        <View style={s.stat}><Text style={s.statNum}>{pending}</Text><Text style={s.statLabel}>Pending</Text></View>
        <View style={s.stat}><Text style={s.statNum}>{done}</Text><Text style={s.statLabel}>Done Today</Text></View>
        <View style={s.stat}><Text style={s.statNum}>{user?.streak ?? 0}</Text><Text style={s.statLabel}>Streak</Text></View>
      </View>

      <Text style={s.sectionTitle}>Recent Tasks</Text>
      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 20 }} />
      ) : tasks.length === 0 ? (
        <Text style={s.empty}>No tasks yet. Create one in the Tasks tab!</Text>
      ) : (
        tasks.map((t) => (
          <View key={t._id} style={s.taskRow}>
            <View style={[s.dot, { backgroundColor: t.status === 'completed' ? '#22c55e' : '#7c3aed' }]} />
            <Text style={[s.taskTitle, t.status === 'completed' && s.done]}>{t.title}</Text>
            <Text style={s.priority}>{t.priority}</Text>
          </View>
        ))
      )}

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  content: { padding: 20, paddingTop: 60 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  sub: { color: '#888', fontSize: 13, marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  stat: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#a78bfa' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  empty: { color: '#555', textAlign: 'center', marginTop: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  taskTitle: { flex: 1, color: '#fff', fontSize: 14 },
  done: { textDecorationLine: 'line-through', color: '#555' },
  priority: { color: '#888', fontSize: 11, textTransform: 'capitalize' },
  logoutBtn: { marginTop: 32, borderWidth: 1, borderColor: '#2a2a3e', borderRadius: 10, padding: 14, alignItems: 'center' },
  logoutText: { color: '#888', fontSize: 14 },
});
