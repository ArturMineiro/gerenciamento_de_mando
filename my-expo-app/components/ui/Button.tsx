import { Pressable, Text, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export default function Button({ title, onPress, disabled, loading, className }: Props) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={`rounded-2xl bg-emerald-500 px-5 py-3 active:opacity-80 ${
        disabled ? 'opacity-60' : ''
      } ${className || ''}`}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-center font-bold text-zinc-900">{title}</Text>
      )}
    </Pressable>
  );
}
