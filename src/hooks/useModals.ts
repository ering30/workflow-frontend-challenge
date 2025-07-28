import { useContext } from 'react';
import { ModalContext } from '@/contexts/ModalContext';
import { toTitleCase } from '@/lib/utilityFunctions';
import type { ApiModalDataType, FormModalDataType } from '../lib/types';

const launchFormModal = (
  data: any,
  setShowModal: (state: boolean) => void,
  setModalData: (data: FormModalDataType) => void
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

const launchApiModal = (
  data: any,
  setShowModal: (state: boolean) => void,
  setModalData: (data: ApiModalDataType) => void
) => {
  setModalData({
    id: data?.id || null,
    type: data?.type || null,
    label: data?.data.label || `${toTitleCase(data?.type)} Node`,
    customName: data?.data.customName || '',
    errors: [],
    httpMethod: data?.data.httpMethod || 'PUT',
    url: data?.data.url || '',
    requestBody: data?.data.requestBody || {},
  });

  setShowModal(true);
};

export default function useModals() {
  const { setModalData, showModal, setShowModal } = useContext(ModalContext) || {};

  return {
    callbacks: {
      closeModal: () => setShowModal(false),
      launchFormModal: ({ data }: { data: Record<string, any> }) => {
        launchFormModal(data, setShowModal, setModalData);
      },
      launchApiModal: ({ data }: { data: Record<string, any> }) => {
        launchApiModal(data, setShowModal, setModalData);
      },
    },
    showModal,
    setShowModal,
  };
}
