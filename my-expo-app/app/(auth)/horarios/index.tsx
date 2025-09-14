// app/(auth)/horarios/index.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { Stack, Link } from 'expo-router';
import type { Horario } from 'services/horarios';
import { useHorarios, useDeleteHorario } from '.../../hooks/useHorarios';
import HorarioItem from '.../../components/horarios/HorarioItem';
import HorarioFormModal from '.../../components/horarios/HorarioFormModal';
import ConfirmModal from '.../../components/horarios/ConfirmModal';
import FAB from 'components/horarios/FAB'; // ⬅️ novo FAB (abaixo)

const PER_PAGE = 10;

export default function HorariosManagerScreen() {
  const header = (
    <Stack.Screen
      options={{
        title: 'Gerenciar Horários',
        headerShown: true,
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#fff',
      }}
    />
  );

  const [q] = useState<string>(''); // (se quiser busca depois, adiciono SearchBar)
  const [page] = useState<number>(1);

  const params = useMemo(() => ({ q: q.trim() || undefined, page, per_page: PER_PAGE }), [q, page]);
  const { data, isLoading, isFetching, refetch } = useHorarios(params);

  // Form (criar/editar)
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Horario | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((h: Horario) => {
    setEditing(h);
    setFormOpen(true);
  }, []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Horario | null>(null);

  const { mutate: doDelete, isPending: deleting } = useDeleteHorario({
    onSuccess: () => setConfirmOpen(false),
    onError: (msg) => console.warn('Erro ao excluir:', msg),
  });

  const askDelete = useCallback((h: Horario) => {
    setToDelete(h);
    setConfirmOpen(true);
  }, []);
  const confirmDelete = useCallback(() => {
    if (toDelete?.id) doDelete(toDelete.id);
  }, [doDelete, toDelete]);
  const cancelDelete = useCallback(() => setConfirmOpen(false), []);

  const items = data?.data ?? [];

  return (
    <View className="flex-1 bg-zinc-950">
      {header}

      {/* Lista */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-zinc-300">Carregando...</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-zinc-300">Nenhum horário encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <HorarioItem item={item} onEdit={openEdit} onDelete={askDelete} />
            )}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
            contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
          />
        )}
      </View>

      {/* FAB para criar */}
      <FAB label="+" onPress={openCreate} />

      {/* Form (rolável) */}
      <HorarioFormModal open={formOpen} onClose={closeForm} editing={editing} />

      {/* Confirmação */}
      <ConfirmModal
        open={confirmOpen}
        title="Excluir horário"
        message={
          toDelete
            ? `Tem certeza que deseja excluir ${toDelete.hora_inicio} - ${toDelete.hora_fim}?`
            : 'Tem certeza que deseja excluir este horário?'
        }
        confirmText={deleting ? 'Excluindo...' : 'Excluir'}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        danger
      />
      <Link
        href="/(auth)/home"
        className="w-50 rounded-2xl bg-white/95 py-3 text-center active:opacity-90">
        <Text className="w-50 font-bold text-emerald-700">voltar</Text>
      </Link>
    </View>
  );
}
