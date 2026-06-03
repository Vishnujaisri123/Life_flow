import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiClient';

type Task = { _id: string; title: string; status: string; priority: string; dueDate?: string };

const PRIORITIES = ['low', 'medium', 'high'];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const d = await apiGet<{ tasks: Task[] }>('/tasks');
      setTasks(d.tasks ?? []);
    } catch {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  async function createTask() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiPost('/tasks', { title: title.trim(), priority });
      setTitle('');
      setPriority('medium');
      setModalOpen(false);
      fetchTasks();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleComplete(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await apiPut(`/tasks/${task._id}`, { status: newStatus });
    setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, status: newStatus } : t));
  }

  async function deleteTask(id: string) {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await apiDelete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }},
    ]);
  }

  if (loading) return <View style={s.center}><ActivityIndicator color="#7c3aed" size="large" /></View>;

  return (
    <View style={s.container}>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor="#7c3aed" />}
        ListEmptyComponent={<Text style={s.empty}>No tasks yet. Tap + to add one.</Text>}
        renderItem={({ item: t }) => (
          <View style={s.card}>
            <TouchableOpacity onPress={() => toggleComplete(t)} style={s.check}>
              <View style={[s.checkbox, t.status === 'completed' && s.checked]}>
                {t.status === 'completed' && <Text style={s.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <View style={s.info}>
              <Text style={[s.taskTitle, t.status === 'completed' && s.strikethrough]}>{t.title}</Text>
              <Text style={[s.badge, s[t.priority as keyof typeof s] || s.low]}>{t.priority}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteTask(t._id)} style={s.del}>
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
            <Text style={s.modalTitle}>New Task</Text>
            <TextInput
              style={s.input}
              placeholder="Task title"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />
            <Text style={s.label}>Priority</Text>
            <View style={s.priorities}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity key={p} style={[s.priBtn, priority === p && s.priActive]} onPress={() => setPriority(p)}>
                  <Text style={[s.priBtnText, priority === p && s.priActiveText]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={createTask} disabled={saving}>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, marginBottom: 10 },
  check: { marginRight: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#7c3aed', justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#7c3aed' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  info: { flex: 1 },
  taskTitle: { color: '#fff', fontSize: 15 },
  strikethrough: { textDecorationLine: 'line-through', color: '#555' },
  badge: { fontSize: 11, marginTop: 4, textTransform: 'capitalize' },
  low: { color: '#22c55e' },
  medium: { color: '#f59e0b' },
  high: { color: '#ef4444' },
  del: { padding: 6 },
  delText: { color: '#555', fontSize: 14 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#7c3aed', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { backgroundColor: '#0f0f13', color: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#2a2a3e', marginBottom: 16 },
  label: { color: '#888', fontSize: 13, marginBottom: 8 },
  priorities: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2a2a3e', alignItems: 'center' },
  priActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  priBtnText: { color: '#888', textTransform: 'capitalize', fontSize: 13 },
  priActiveText: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a3e', alignItems: 'center' },
  cancelText: { color: '#888' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7c3aed', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
