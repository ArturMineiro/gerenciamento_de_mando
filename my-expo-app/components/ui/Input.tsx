import { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
};

const Input = forwardRef<TextInput, Props>(
  ({ label, error, containerClassName, inputClassName, ...rest }, ref) => {
    return (
      <View className={`w-full ${containerClassName || ''}`}>
        {label ? <Text className="mb-2 text-zinc-300">{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#a1a1aa"
          className={`w-full rounded-2xl bg-zinc-800 px-4 py-3 text-white ${inputClassName || ''}`}
          {...rest}
        />
        {error ? <Text className="mt-1 text-red-400">{error}</Text> : null}
      </View>
    );
  }
);

export default Input;
