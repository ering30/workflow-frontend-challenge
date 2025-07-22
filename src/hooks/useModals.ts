import { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import { toTitleCase } from '@/lib/utilityFunctions';

export type ModalDataType = {
  id: string | null;
  type: string | null;
  label: string;
  customName: string;
  errors: { field: string; message: string }[];
  fields: FormField[];
};

const launchFormModal = (
  data: any,
  setShowModal: (state: boolean) => void,
  setModalData: (data: ModalDataType) => void
) => {
  setModalData({
    id: data?.id || null,
    type: data?.type || null,
    label: data?.data.label || `${toTitleCase(data?.type)} Node`,
    customName: data?.data.customName || '',
    errors: [],
    fields: data?.data.fields || [],
  });

  setShowModal(true);
};

export type FormField = {
  id: string;
  name: string;
  type: 'text' | 'email' | 'number' | '';
  required: boolean;
};

export default function useModals() {
  const { setModalData, showModal, setShowModal } = useContext(ModalContext) || {};

  return {
    callbacks: {
      closeModal: () => setShowModal(false),
      launchFormModal: ({ data }: { data: Record<string, any> }) => {
        launchFormModal(data, setShowModal, setModalData);
      },
    },
    showModal,
    setShowModal,
  };
}
