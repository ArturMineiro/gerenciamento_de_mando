import { useState, useCallback } from 'react';
import { useCreateCliente } from './useClientes';
import { useCreateReserva } from './useReservas';
import { Slot } from '../utils/datetime';

type Params = {
  campoId?: number;
  selectedDate: Date;
  dateStr: string;
  isPastSlot: (s: Slot) => boolean;
  domingo: boolean;
};

export function useQuickReserva({ campoId, dateStr, isPastSlot, domingo }: Params) {
  const [showModal, setShowModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  const createCliente = useCreateCliente({ onError: (m) => alert(m) });
  const createReserva = useCreateReserva({ onError: (m) => alert(m) });

  const openReserveModal = useCallback((slot: Slot) => {
    setPendingSlot(slot);
    setClienteNome('');
    setClienteTelefone('');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPendingSlot(null);
    setClienteNome('');
    setClienteTelefone('');
  }, []);

  const confirmReserva = useCallback(() => {
    if (!campoId) return alert('Selecione um campo.');
    if (domingo) return alert('Domingo indisponível.');
    if (!pendingSlot?.horario_id) return alert('Não há horário cadastrado para esse intervalo.');
    if (isPastSlot(pendingSlot)) return alert('Horário já passou.');
    if (!clienteNome.trim()) return alert('Informe o nome do cliente.');

    createCliente.mutate(
      {
        cpf_cnpj: `TEMP-${Date.now()}`,
        nome: clienteNome.trim(),
        telefone: clienteTelefone.trim() || null,
        email: null,
      },
      {
        onSuccess: (cliente: any) => {
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
  }, [campoId, domingo, pendingSlot, clienteNome, clienteTelefone, dateStr, isPastSlot, createCliente, createReserva, closeModal]);

  const saving = createCliente.isPending || createReserva.isPending;

  return {
    showModal, pendingSlot,
    clienteNome, setClienteNome,
    clienteTelefone, setClienteTelefone,
    openReserveModal, closeModal, confirmReserva, saving,
  };
}
