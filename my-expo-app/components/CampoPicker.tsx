import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { useCampos } from 'hooks/useCampos';

type Props = {
  value?: number; // campoId atual
  onSelect: (id: number) => void; // dispara ao escolher campo
  perPage?: number;
};

export default function CampoPicker({ value, onSelect, perPage = 30 }: Props) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { data, isLoading, isFetching } = useCampos({ page, per_page: perPage, q });

  // concatena as páginas (paginador simples em memória)
  const items = useMemo(() => data?.data ?? [], [data]);

  // quando mudar a busca, volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [q]);

  const loadMore = useCallback(() => {
    // se tiver mais páginas, incremente
    if (data && data.current_page < data.last_page && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [data, isFetching]);

  return (
    <View className="rounded-xl bg-zinc-800 p-3">
      <Text className="mb-2 text-zinc-400">Campo</Text>

      {/* Busca opcional */}
      <TextInput
        placeholder="Buscar campo..."
        placeholderTextColor="#9ca3af"
        value={q}
        onChangeText={setQ}
        className="mb-3 rounded-lg bg-zinc-700 px-3 py-2 text-white"
      />

      {isLoading && !items.length ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={isFetching ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
          renderItem={({ item }) => {
            const active = value === item.id;
            return (
              <Pressable
                onPress={() => onSelect(item.id)}
                className={`mr-2 rounded-lg px-3 py-2 ${
                  active ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}>
                <Text className={`text-white ${active ? 'font-bold' : ''}`}>{item.nome}</Text>
              </Pressable>
            );
          }}
        />
      )}

      {!isLoading && !items.length && (
        <Text className="mt-2 text-zinc-400">Nenhum campo encontrado.</Text>
      )}
    </View>
  );
}
