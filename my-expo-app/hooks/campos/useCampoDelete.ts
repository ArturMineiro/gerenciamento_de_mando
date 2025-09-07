import { useState } from 'react';
import type { Campo } from 'services/campos-service';
import { useDeleteCampo } from '../useCampos';

export function useCampoDelete() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Campo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { mutate: mutateDeleteCampo, isPending: deleting } = useDeleteCampo({
    onSuccess: () => {
      setDeletingId(null);
      setTargetDelete(null);
      setConfirmOpen(false);
    },
    onError: () => {
      setDeletingId(null);
      setConfirmOpen(false);
    },
  });

  const askDelete = (c: Campo) => {
    setTargetDelete(c);
    setConfirmOpen(true);
  };
  const cancelDelete = () => setConfirmOpen(false);
  const confirmDeleteNow = () => {
    if (!targetDelete) return;
    setDeletingId(targetDelete.id);
    mutateDeleteCampo(targetDelete.id);
  };

  return {
    confirmOpen,
    targetDelete,
    deletingId,
    deleting,
    askDelete,
    cancelDelete,
    confirmDeleteNow,
  };
}
