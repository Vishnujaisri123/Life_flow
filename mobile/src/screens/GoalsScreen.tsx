import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { apiGet, apiPost, apiDelete } from '../services/apiClient';

type Goal = { _id: string; title: string; description?: string; status: string; progress: number };

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      const d = await apiGet<{ goals: Goal[] }>('/goals');
      setGoals(d.goals ?? []);
    } catch { setGoals([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  async function createGoal() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiPost('/goals', { title: title.trim(), description: description.trim() });
      setTitle(''); setDescription(''); setModalOpen(false);
      fetchGoals();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setSaving(false); }
  }

  async function deleteGoal(id: string) {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiDelete(`/goals/${id}`);
        setGoals((prev) => prev.filter((g) => g._id !== id));
      }},
    ]);
  }

  if (loading) return <View style={s.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={goals}
        keyExtractor={(g) => g._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoals(); }} tintColor="#7c3aed" />}
        ListEmptyComponent={<Text style={s.empty}>No goals yet. Tap + to set one.</Text>}
        renderItem={({ item: g }) => (
          <View style={s.card}>
            <View style={s.info}>
              <Text style={s.goalTitle}>{g.title}</Text>
              {g.description ? <Text style={s.desc}>{g.description}</Text> : null}
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${g.progress ?? 0}%` }]} />
              </View>
              <Text style={s.progressText}>{g.progress ?? 0}% complete</Text>
            </View>
            <TouchableOpacity onPress={() => deleteGoal(g._id)} style={s.del}>
              <Text style={s.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={s.fab} onPress={() => setModalOpen(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>New Goal</Text>
            <TextInput style={s.input} placeholder="Goal title" placeholderTextColor="#888" value={title} onChangeText={setTitle} />
            <TextInput style={[s.input, { height: 80 }]} placeholder="Description (optional)" placeholderTextColor="#888" value={description} onChangeText={setDescription} multiline />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={createGoal} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  center: { flex: 1, backgroundColor: '#0f0f13', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingTop: 60, paddingBottom: 90 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 10 },
  info: { flex: 1 },
  goalTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  desc: { color: '#888', fontSize: 13, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#2a2a3e', borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: '#7c3aed', borderRadius: 3 },
  progressText: { color: '#888', fontSize: 11 },
  del: { padding: 4, marginLeft: 8 },
  delText: { color: '#555', fontSize: 14 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { backgroundColor: '#0f0f13', color: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e', alignItems: 'center' },
  cancelText: { color: '#888' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7c3aed', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
