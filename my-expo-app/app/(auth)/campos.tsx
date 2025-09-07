// app/(auth)/campos/index.tsx
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import type { Campo } from 'services/campos-service';

import { useCampoList } from '../../hooks/campos/useCampoList';
import { useCampoForm } from '../../hooks/campos/useCampoForm';
import { useCampoDelete } from '../../hooks/campos/useCampoDelete';

import SearchBar from '../../components/campos/SearchBar';
import CampoItem from '../../components/campos/CampoItem';
import PaginationBar from '../../components/campos/PaginationBar';
import CampoFormModal from '../../components/campos/CampoFormModal';
import ConfirmModal from '../../components/campos/ConfirmModal';

export default function CamposManagerScreen() {
  // Header desta rota (Expo Router)
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

  // Lista + paginação + busca
  const { q, setQ, page, setPage, lastPage, data, isLoading, isFetching, refetch } =
    useCampoList(10);

  // Form (criar/editar)
  const { modalOpen, editing, openCreate, openEdit, close, handleSubmit, saving } = useCampoForm();

  // Delete
  const {
    confirmOpen,
    targetDelete,
    deletingId,
    deleting,
    askDelete,
    cancelDelete,
    confirmDeleteNow,
  } = useCampoDelete();

  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      {header}

      <SearchBar
        value={q}
        onChangeText={(t) => {
          setQ(t);
          setPage(1);
        }}
        onCreate={openCreate}
      />

      {/* Lista */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text className="mt-2 text-zinc-400">Carregando...</Text>
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item: Campo) => String(item.id)}
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

      <PaginationBar
        page={page}
        lastPage={lastPage}
        disabled={isFetching}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
      />

      {/* Modal de criação/edição */}
      <CampoFormModal
        visible={modalOpen}
        initial={editing}
        onClose={close}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {/* Modal de confirmação de delete */}
      <ConfirmModal
        visible={confirmOpen}
        title="Excluir campo"
        message={`Tem certeza que deseja excluir "${targetDelete?.nome ?? ''}"?`}
        onCancel={cancelDelete}
        onConfirm={confirmDeleteNow}
        loading={deleting}
      />
    </View>
  );
}
