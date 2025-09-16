// components/common/FAB.tsx
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function FAB({ label = '+', onPress }: { label?: string; onPress: () => void }) {
  return (
    <View className="pointer-events-none absolute bottom-6 right-6">
      <Pressable
        className="pointer-events-auto h-14 w-14 items-center justify-center rounded-full bg-emerald-600 shadow-lg active:opacity-90"
        onPress={onPress}>
        <Text className="text-2xl font-extrabold text-white">{label}</Text>
      </Pressable>
    </View>
  );
}
