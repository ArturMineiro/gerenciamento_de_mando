// hooks/reservas/useQuickReserva.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useCreateReserva } from '../useReservas';
import { Slot } from '../../utils/datetime';
import { onlyDigits } from '../../utils/cpfCnpj';
import { clienteSchema } from 'schemas/clienteSchema';
import { findClienteByDoc } from '../../services/clientes';

type Params = {
  campoId?: number;
  selectedDate: Date;
  dateStr: string;
  isPastSlot: (s: Slot) => boolean;
  domingo: boolean;
};

export function useQuickReserva({ campoId, dateStr, isPastSlot, domingo }: Params) {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState('');

  const createReserva = useCreateReserva({ onError: (m) => alert(m) });

  const openReserveModal = useCallback((slot: Slot) => {
    setPendingSlot(slot);
    setClienteNome('');
    setClienteCpfCnpj('');
    setClienteTelefone('');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPendingSlot(null);
    setClienteNome('');
    setClienteTelefone('');
    setClienteCpfCnpj('');
  }, []);

  const confirmReserva = useCallback(async () => {
    if (!campoId) return alert('Selecione um campo.');
    if (domingo) return alert('Domingo indisponível.');
    if (!pendingSlot?.horario_id) return alert('Não há horário cadastrado para esse intervalo.');
    if (isPastSlot(pendingSlot)) return alert('Horário já passou.');

    // Aqui validamos só o que a reserva precisa: CPF/CNPJ (obrigatório), nome/telefone podem ser ignorados
    const parsed = clienteSchema.pick({ cpf_cnpj: true }).safeParse({
      cpf_cnpj: clienteCpfCnpj.trim(),
    });
    if (!parsed.success) {
      alert(parsed.error.issues?.[0]?.message || 'CPF/CNPJ inválido.');
      return;
    }

    const cpfDigits = onlyDigits(parsed.data.cpf_cnpj);

    // 1) Busca cliente existente
    let clienteId: number | null = null;
    try {
      const found = await findClienteByDoc(cpfDigits);
      if (found?.id) clienteId = found.id;
    } catch {
      // deixe passar; trataremos como "não encontrado"
    }

    // 2) Se não existir, redireciona para cadastro de cliente (fluxo separado)
    if (!clienteId) {
      alert('Cliente não encontrado. Você será levado ao cadastro para criar o cliente primeiro.');
      // navegue para sua tela de cadastro; passe o CPF pré-preenchido
      router.push({
        pathname: '/cadastro-cliente',
      });

      {
        closeModal();
      }
      return;
    }

    // 3) Cria a reserva com o cliente encontrado
    createReserva.mutate(
      {
        campo_id: campoId,
        cliente_id: clienteId,
        horario_id: pendingSlot.horario_id!,
        data: dateStr,
        status: 'reservado',
      },
      { onSuccess: closeModal }
    );
  }, [
    campoId,
    domingo,
    pendingSlot,
    clienteCpfCnpj,
    dateStr,
    isPastSlot,
    createReserva,
    closeModal,
    router,
  ]);

  const saving = createReserva.isPending;

  return {
    showModal,
    pendingSlot,
    clienteNome,
    setClienteNome,
    clienteTelefone,
    setClienteTelefone,
    clienteCpfCnpj,
    setClienteCpfCnpj,
    openReserveModal,
    closeModal,
    confirmReserva,
    saving,
  };
}
