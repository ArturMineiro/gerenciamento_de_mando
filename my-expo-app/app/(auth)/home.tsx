import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import FootballPitchBackground from '../../components/Campo';
// Um “campo de futebol” feito só com Views e Tailwind classes.
// Sem imagens externas — leve e funciona em web/mobile.

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-emerald-700">
      {/* chamando campinho de components abaixo */}
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
