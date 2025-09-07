// app/(auth)/campos/index.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useCampos, useCreateCampo, useUpdateCampo, useDeleteCampo } from '../../hooks/useCampos'; // ajuste o path
import type { Campo } from 'services/campos-service';

/* ========= Modal de Confirmação (cross-platform) ========= */
function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm(): void;
  onCancel(): void;
  loading?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 max-w-xl rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-2 text-lg font-bold text-white">{title}</Text>
          <Text className="mb-4 text-zinc-300">{message}</Text>

          <View className="flex-row justify-end gap-2">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="rounded-xl bg-rose-600 px-4 py-3 disabled:opacity-50">
              <Text className="font-semibold text-white">
                {loading ? 'Excluindo...' : confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ========= Modal de Formulário (criar/editar) ========= */
function CampoFormModal({
  visible,
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  visible: boolean;
  initial?: Partial<Campo> | null;
  onClose: () => void;
  onSubmit: (payload: { nome: string }) => void;
  saving?: boolean;
}) {
  const [nome, setNome] = useState(initial?.nome ?? '');

  useEffect(() => {
    setNome(initial?.nome ?? '');
  }, [initial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 max-w-xl rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-3 text-xl font-bold text-white">
            {initial?.id ? 'Editar campo' : 'Novo campo'}
          </Text>

          <Text className="mb-1 text-zinc-400">Nome</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Campo 1"
            placeholderTextColor="#a1a1aa"
            className="mb-4 rounded-xl bg-zinc-800 px-3 py-3 text-white"
          />

          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onClose} className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit({ nome })}
              disabled={saving || !nome.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-3 disabled:opacity-50">
              <Text className="font-semibold text-white">{saving ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ========= Item da lista ========= */
function CampoItem({
  item,
  onEdit,
  onAskDelete,
  deletingId,
}: {
  item: Campo;
  onEdit: (c: Campo) => void;
  onAskDelete: (c: Campo) => void;
  deletingId?: number | null;
}) {
  const isDeleting = deletingId === item.id;

  return (
    <View className="mb-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-white">{item.nome}</Text>
          {!!item.id && <Text className="text-xs text-zinc-400">ID: {item.id}</Text>}
        </View>

        <View className="flex-row gap-2">
          <Pressable onPress={() => onEdit(item)} className="rounded-lg bg-violet-600 px-3 py-2">
            <Text className="text-sm font-semibold text-white">Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => onAskDelete(item)}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-3 py-2 disabled:opacity-50">
            <Text className="text-sm font-semibold text-white">
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ========= Tela principal ========= */
export default function CamposManagerScreen() {
  // Header desta rota
  const header = (
    <Stack.Screen
      options={{
        title: 'Gerenciar Campos',
        headerShown: true,
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#fff',
      }}
    />
  );

  // Filtros e paginação
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const per_page = 10;

  const { data, isLoading, isFetching, refetch } = useCampos({ q, page, per_page });

  const total = data?.total ?? 0;
  const lastPage = useMemo(() => (total ? Math.max(1, Math.ceil(total / per_page)) : 1), [total]);

  // Estados de CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campo | null>(null);

  const { mutate: createCampo, isPending: creating } = useCreateCampo({
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
    },
  });

  const { mutate: updateCampo, isPending: updating } = useUpdateCampo({
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
    },
  });

  // Delete: estados e hook
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Campo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: mutateDeleteCampo, isPending: deleting } = useDeleteCampo({
    onSuccess: () => {
      setDeletingId(null);
      setTargetDelete(null);
      setConfirmOpen(false);
    },
    onError: () => {
      setDeletingId(null);
      setConfirmOpen(false);
    },
  });

  // Ações
  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(c: Campo) {
    setEditing(c);
    setModalOpen(true);
  }

  function askDelete(c: Campo) {
    setTargetDelete(c);
    setConfirmOpen(true);
  }
  function confirmDeleteNow() {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    mutateDeleteCampo(targetDelete.id);
  }

  function handleSubmit(payload: { nome: string }) {
    if (editing?.id) {
      updateCampo({ id: editing.id, payload });
    } else {
      createCampo(payload);
    }
  }

  // UI
  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      {header}

      {/* Filtro + ações */}
      <View className="mb-3 flex-row flex-wrap items-center justify-between gap-2">
        <View className="min-w-[200px] flex-1">
          <TextInput
            value={q}
            onChangeText={(t) => {
              setQ(t);
              setPage(1);
            }}
            placeholder="Buscar por nome..."
            placeholderTextColor="#a1a1aa"
            className="rounded-xl bg-zinc-800 px-3 py-3 text-white"
          />
        </View>

        <Pressable onPress={openCreate} className="rounded-xl bg-emerald-600 px-4 py-3">
          <Text className="font-semibold text-white">Novo campo</Text>
        </Pressable>
      </View>

      {/* Lista */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-zinc-400">Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#fff" />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="mt-10 items-center">
              <Text className="text-zinc-400">Nenhum campo encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CampoItem
              item={item}
              onEdit={openEdit}
              onAskDelete={askDelete}
              deletingId={deletingId}
            />
          )}
        />
      )}

      {/* Paginação */}
      <View className="mt-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isFetching}
          className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-50">
          <Text className="text-white">‹ Anterior</Text>
        </Pressable>

        <Text className="text-zinc-300">
          Página {page} de {lastPage}
        </Text>

        <Pressable
          onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
          disabled={page >= lastPage || isFetching}
          className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-50">
          <Text className="text-white">Próxima ›</Text>
        </Pressable>
      </View>

      {/* Modal de criação/edição */}
      <CampoFormModal
        visible={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        saving={creating || updating}
      />

      {/* Modal de confirmação de delete */}
      <ConfirmModal
        visible={confirmOpen}
        title="Excluir campo"
        message={`Tem certeza que deseja excluir "${targetDelete?.nome ?? ''}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeleteNow}
        loading={deleting}
      />
    </View>
  );
}
