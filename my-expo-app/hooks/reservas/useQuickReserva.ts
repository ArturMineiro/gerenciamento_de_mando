// hooks/reservas/useQuickReserva.ts
import { useState, useCallback } from 'react';
import { useCreateCliente } from '../useClientes';
import { useCreateReserva } from '../useReservas';
import { Slot } from '../../utils/datetime';
import { onlyDigits } from '../../utils/cpfCnpj';
import { clienteSchema } from 'schemas/clienteSchema';

type Params = {
  campoId?: number;
  selectedDate: Date;
  dateStr: string;
  isPastSlot: (s: Slot) => boolean;
  domingo: boolean;
};

const SEND_MASKED_TO_BACKEND = false; // mude para true se quiser ENVIAR com máscara

export function useQuickReserva({ campoId, dateStr, isPastSlot, domingo }: Params) {
  const [showModal, setShowModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState('');
  const createCliente = useCreateCliente({ onError: (m) => alert(m) });
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

  const confirmReserva = useCallback(() => {
    if (!campoId) return alert('Selecione um campo.');
    if (domingo) return alert('Domingo indisponível.');
    if (!pendingSlot?.horario_id) return alert('Não há horário cadastrado para esse intervalo.');
    if (isPastSlot(pendingSlot)) return alert('Horário já passou.');

    const parsed = clienteSchema.safeParse({
      nome: clienteNome.trim(),
      telefone: clienteTelefone.trim(),
      cpf_cnpj: clienteCpfCnpj.trim(), // pode vir mascarado; schema aceita
    });

    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Dados inválidos.';
      alert(msg);
      return;
    }

    const { nome, telefone, cpf_cnpj } = parsed.data;

    // Escolha de envio: mascarado ou apenas dígitos
    const cpfCnpjToSend = SEND_MASKED_TO_BACKEND ? cpf_cnpj : onlyDigits(cpf_cnpj);

    const telefoneToSend = telefone
      ? SEND_MASKED_TO_BACKEND
        ? telefone
        : onlyDigits(telefone)
      : null;

    createCliente.mutate(
      {
        cpf_cnpj: cpfCnpjToSend,
        nome,
        telefone: telefoneToSend,
        email: null,
      },
      {
        onSuccess: (res: any) => {
          const cliente = res?.cliente ?? res;
          createReserva.mutate(
            {
              campo_id: campoId,
              cliente_id: cliente.id,
              horario_id: pendingSlot.horario_id!,
              data: dateStr,
              status: 'reservado',
            },
            { onSuccess: closeModal }
          );
        },
      }
    );
  }, [
    campoId,
    domingo,
    pendingSlot,
    clienteNome,
    clienteTelefone,
    clienteCpfCnpj,
    dateStr,
    isPastSlot,
    createCliente,
    createReserva,
    closeModal,
  ]);

  const saving = createCliente.isPending || createReserva.isPending;

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
