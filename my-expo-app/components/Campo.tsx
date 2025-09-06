import { View, Text } from 'react-native';

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

export default FootballPitchBackground;
