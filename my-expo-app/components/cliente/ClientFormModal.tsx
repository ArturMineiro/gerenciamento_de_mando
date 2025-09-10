import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCreateCliente, useUpdateCliente } from '../../hooks/useClientes';
import { digitsOnly, maskCpfCnpj, maskPhone } from '../../utils/mask';
import type { Cliente } from '../../services/clientes';

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ color: '#e4e4e7', marginBottom: 6, fontWeight: '600' }}>{children}</Text>
);

const Field = {
  Root: ({ children }: { children: React.ReactNode }) => (
    <View style={{ marginBottom: 14 }}>{children}</View>
  ),
  Input: (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput
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
      {...props}
    />
  ),
};

export type ClienteFormModalProps = {
  visible: boolean;
  onClose: () => void;
  editing?: Cliente | null;
  onSaved?: (c: Cliente) => void;
};

export default function ClienteFormModal({
  visible,
  onClose,
  editing,
  onSaved,
}: ClienteFormModalProps) {
  const isEditing = !!editing;

  const [nome, setNome] = useState('');
  const [doc, setDoc] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  const createMut = useCreateCliente({
    onSuccess: (c) => {
      onSaved?.(c);
      onClose();
    },
    onError: (msg) => setErrors((e) => ({ ...e, api: msg })),
  });
  const updateMut = useUpdateCliente({
    onSuccess: (c) => {
      onSaved?.(c);
      onClose();
    },
    onError: (msg) => setErrors((e) => ({ ...e, api: msg })),
  });

  useEffect(() => {
    if (visible) {
      setErrors({});
      setNome(editing?.nome ?? '');
      setDoc(maskCpfCnpj(editing?.cpf_cnpj ?? ''));
      setTel(maskPhone(editing?.telefone ?? ''));
      setEmail(editing?.email ?? '');
    }
  }, [visible, editing]);

  const submitting = createMut.isPending || updateMut.isPending;

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
    if (!validate()) return;
    const payload = {
      nome: nome.trim(),
      cpf_cnpj: digitsOnly(doc),
      telefone: digitsOnly(tel),
      email: email.trim() || undefined,
    };
    if (isEditing && editing) {
      updateMut.mutate({ id: editing.id, payload });
    } else {
      createMut.mutate(payload);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: '#0b0b0f',
              padding: 16,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            }}>
            <Text
              style={{
                color: '#fafafa',
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 12,
              }}>
              {isEditing ? 'Editar cliente' : 'Novo cliente'}
            </Text>

            {!!errors.api && (
              <Text style={{ color: '#ef4444', marginBottom: 10 }}>{errors.api}</Text>
            )}

            {/* Nome */}
            <Field.Root>
              <Label>Nome *</Label>
              <Field.Input
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: João da Silva"
                autoCapitalize="words"
              />
              {!!errors.nome && (
                <Text style={{ color: '#ef4444', marginTop: 6 }}>{errors.nome}</Text>
              )}
            </Field.Root>

            {/* CPF/CNPJ */}
            <Field.Root>
              <Label>CPF/CNPJ *</Label>
              <Field.Input
                keyboardType="number-pad"
                value={doc}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                onChangeText={(t) => setDoc(maskCpfCnpj(t))}
              />
              {!!errors.cpf_cnpj && (
                <Text style={{ color: '#ef4444', marginTop: 6 }}>{errors.cpf_cnpj}</Text>
              )}
            </Field.Root>

            {/* Telefone */}
            <Field.Root>
              <Label>Telefone</Label>
              <Field.Input
                keyboardType="number-pad"
                value={tel}
                placeholder="(21) 98888-7777"
                onChangeText={(t) => setTel(maskPhone(t))}
              />
            </Field.Root>

            {/* Email */}
            <Field.Root>
              <Label>E-mail</Label>
              <Field.Input
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                placeholder="email@exemplo.com"
                onChangeText={setEmail}
              />
              {!!errors.email && (
                <Text style={{ color: '#ef4444', marginTop: 6 }}>{errors.email}</Text>
              )}
            </Field.Root>

            {/* Botões */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={onClose}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#27272a',
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#e4e4e7', fontWeight: '600' }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={onSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: submitting ? '#3f3f46' : '#6366f1',
                  alignItems: 'center',
                }}>
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    {isEditing ? 'Salvar' : 'Cadastrar'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
