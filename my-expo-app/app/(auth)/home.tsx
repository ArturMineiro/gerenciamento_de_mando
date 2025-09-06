import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

// Um “campo de futebol” feito só com Views e Tailwind classes.
// Sem imagens externas — leve e funciona em web/mobile.
function FootballPitchBackground() {
  return (
    <View className="absolute inset-0 bg-emerald-700">
      {/* textura/variação do gramado com faixas */}
      <View className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            className={`absolute left-0 right-0 h-14 ${i % 2 ? 'bg-emerald-800' : 'bg-emerald-700'}`}
            style={{ top: i * 56 }}
          />
        ))}
      </View>

      {/* linhas do campo */}
      <View className="absolute inset-4 rounded-md border-2 border-white/80" />

      {/* círculo central */}
      <View className="absolute left-1/2 top-1/2 -ml-16 -mt-16 h-32 w-32 rounded-full border-2 border-white/80" />
      <View className="absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full bg-white/90" />

      {/* meia-lua das áreas */}
      <View className="absolute left-1/2 top-6 -ml-16 h-10 w-32 rounded-b-full border-b-2 border-white/80" />
      <View className="absolute bottom-6 left-1/2 -ml-16 h-10 w-32 rounded-t-full border-t-2 border-white/80" />

      {/* grandes áreas */}
      <View className="absolute left-1/2 top-4 -ml-28 h-20 w-56 rounded-sm border-2 border-white/80" />
      <View className="absolute bottom-4 left-1/2 -ml-28 h-20 w-56 rounded-sm border-2 border-white/80" />

      {/* pequenas áreas */}
      <View className="absolute left-1/2 top-4 -ml-16 h-12 w-32 rounded-sm border-2 border-white/80" />
      <View className="absolute bottom-4 left-1/2 -ml-16 h-12 w-32 rounded-sm border-2 border-white/80" />
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-emerald-700">
      <FootballPitchBackground />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-2xl text-white opacity-90">🎉 Bem-vindo</Text>
        <Text className="text-center text-4xl font-extrabold leading-tight text-white">
          ao seu Gerenciador{'\n'}de Mandos de Campo
        </Text>

        <Text className="mt-4 text-center text-white/80">
          Organize reservas, horários e campos num só lugar.
        </Text>

        <View className="mt-8 w-full max-w-sm gap-3">
          <Link
            href="/reservas"
            className="rounded-2xl bg-white/95 py-3 text-center active:opacity-90">
            <Text className="font-bold text-emerald-700">Ir para Reservas</Text>
          </Link>

          <Link
            href="/campos"
            className="rounded-2xl bg-white/90 py-3 text-center active:opacity-90">
            <Text className="font-bold text-emerald-700">Gerenciar Campos</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
