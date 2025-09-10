import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCliente, useUpdateCliente } from '../../../hooks/useClientes';
import { digitsOnly, maskCpfCnpj, maskPhone } from '../../../utils/mask';

export default function EditarClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: cliente, isFetching } = useCliente(Number(id));
  const updateMut = useUpdateCliente({
    onSuccess: () => {
      Alert.alert('Sucesso', 'Cliente atualizado!');
      router.back();
    },
    onError: (msg) => setErrors((e) => ({ ...e, api: msg })),
  });

  const [nome, setNome] = useState('');
  const [doc, setDoc] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome ?? '');
      setDoc(maskCpfCnpj(cliente.cpf_cnpj ?? ''));
      setTel(maskPhone(cliente.telefone ?? ''));
      setEmail(cliente.email ?? '');
    }
  }, [cliente]);

  function validate() {
    const errs: any = {};
    const docDigits = digitsOnly(doc);
    if (!nome.trim()) errs.nome = 'Informe o nome';
    if (docDigits.length !== 11 && docDigits.length !== 14) errs.cpf_cnpj = 'CPF (11) ou CNPJ (14)';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'E-mail inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function onSubmit() {
    if (!validate() || !id) return;
    updateMut.mutate({
      id: Number(id),
      payload: {
        nome: nome.trim(),
        cpf_cnpj: digitsOnly(doc),
        telefone: digitsOnly(tel),
        email: email.trim() || undefined,
      },
    });
  }

  const loading = isFetching || updateMut.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#09090b' }}>
      <Stack.Screen
        options={{
          title: 'Editar Cliente',
          headerShown: true,
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#fff',
        }}
      />

      <View style={{ padding: 16, gap: 12 }}>
        {loading && !cliente ? (
          <ActivityIndicator />
        ) : (
          <>
            {!!errors.api && <Text style={{ color: '#ef4444' }}>{errors.api}</Text>}

            <Text style={{ color: '#fafafa', fontWeight: '700' }}>Nome *</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: João da Silva"
              placeholderTextColor="#71717a"
              autoCapitalize="words"
              style={{
                backgroundColor: '#18181b',
                color: '#fafafa',
                borderColor: '#27272a',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />
            {!!errors.nome && <Text style={{ color: '#ef4444' }}>{errors.nome}</Text>}

            <Text style={{ color: '#fafafa', fontWeight: '700' }}>CPF/CNPJ *</Text>
            <TextInput
              value={doc}
              onChangeText={(t) => setDoc(maskCpfCnpj(t))}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              placeholderTextColor="#71717a"
              keyboardType="number-pad"
              style={{
                backgroundColor: '#18181b',
                color: '#fafafa',
                borderColor: '#27272a',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />
            {!!errors.cpf_cnpj && <Text style={{ color: '#ef4444' }}>{errors.cpf_cnpj}</Text>}

            <Text style={{ color: '#fafafa', fontWeight: '700' }}>Telefone</Text>
            <TextInput
              value={tel}
              onChangeText={(t) => setTel(maskPhone(t))}
              placeholder="(21) 98888-7777"
              placeholderTextColor="#71717a"
              keyboardType="number-pad"
              style={{
                backgroundColor: '#18181b',
                color: '#fafafa',
                borderColor: '#27272a',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />

            <Text style={{ color: '#fafafa', fontWeight: '700' }}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="email@exemplo.com"
              placeholderTextColor="#71717a"
              style={{
                backgroundColor: '#18181b',
                color: '#fafafa',
                borderColor: '#27272a',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            />
            {!!errors.email && <Text style={{ color: '#ef4444' }}>{errors.email}</Text>}

            <Pressable
              onPress={onSubmit}
              disabled={loading}
              style={{
                marginTop: 8,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: loading ? '#3f3f46' : '#6366f1',
              }}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '800' }}>Salvar</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
