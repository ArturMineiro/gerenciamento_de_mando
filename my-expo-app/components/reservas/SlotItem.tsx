import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  status: 'available' | 'busy' | 'disabled';
  onPress(): void;
};

export default function SlotItem({ label, status, onPress }: Props) {
  const containerCls =
    status === 'busy'
      ? 'border border-red-500 bg-red-500/20'
      : status === 'disabled'
      ? 'border border-zinc-700 bg-zinc-800/50'
      : 'border border-emerald-500 bg-emerald-500/20';

  const statusText =
    status === 'busy' ? 'Indisponível' : status === 'disabled' ? 'Indisponível' : 'Disponível';

  const statusCls =
    status === 'busy' ? 'text-red-300' : status === 'disabled' ? 'text-zinc-400' : 'text-emerald-300';

  return (
    <Pressable
      disabled={status !== 'available'}
      onPress={onPress}
      className={['mb-2 flex-row items-center justify-between rounded-xl px-4 py-4', containerCls].join(' ')}
    >
      <Text className="text-base text-white">{label}</Text>
      <Text className={['text-sm font-semibold', statusCls].join(' ')}>{statusText}</Text>
    </Pressable>
  );
}
