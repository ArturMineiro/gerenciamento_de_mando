import { View, Text, Pressable } from 'react-native';
import dayjs from 'dayjs';

type Props = { date: Date; onPrev(): void; onNext(): void };

export default function DateNav({ date, onPrev, onNext }: Props) {
  return (
    <View className="mb-3 mt-3 flex-row items-center justify-between">
      <Pressable onPress={onPrev} className="rounded-lg bg-zinc-800 px-3 py-2">
        <Text className="text-white">{'←'}</Text>
      </Pressable>
      <Text className="text-lg font-semibold text-white">
        {dayjs(date).format('dddd, DD [de] MMMM')}
      </Text>
      <Pressable onPress={onNext} className="rounded-lg bg-zinc-800 px-3 py-2">
        <Text className="text-white">{' →'}</Text>
      </Pressable>
    </View>
  );
}
