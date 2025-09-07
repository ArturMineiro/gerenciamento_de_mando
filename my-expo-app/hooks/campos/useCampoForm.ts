// hooks/useCampoForm.ts
import { useState } from 'react';
import type { Campo } from 'services/campos-service';
import { useCreateCampo, useUpdateCampo } from '../useCampos';

export function useCampoForm() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campo | null>(null);

  function close() {
    setModalOpen(false);
    setEditing(null);
  }

  const { mutate: createCampo, isPending: creating } = useCreateCampo({
    onSuccess: close,
  });
  const { mutate: updateCampo, isPending: updating } = useUpdateCampo({
    onSuccess: close,
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(c: Campo) {
    setEditing(c);
    setModalOpen(true);
  }

  function handleSubmit(payload: { nome: string }) {
    if (editing?.id) updateCampo({ id: editing.id, payload });
    else createCampo(payload);
  }

  return {
    modalOpen, editing,
    openCreate, openEdit, close,
    handleSubmit,
    saving: creating || updating,
  };
}
