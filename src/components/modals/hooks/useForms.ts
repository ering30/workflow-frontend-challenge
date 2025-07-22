import { ChangeEvent, useContext, useEffect } from 'react';
import { Node } from '@xyflow/react';

import { sanitisedStringInput } from '@/lib/validation';
import { WorkflowEditorContext } from '@/contexts/WorkflowEditorContext';
import { ModalContext } from '@/contexts/ModalContext';

import type { ModalDataType } from '@/hooks/useModals';

const formIsValid = (modalData: ModalDataType) => {
  const { fields, errors } = modalData;
  const hasNames = fields?.findIndex((field) => field.name.trim() === '') === -1;
  const hasFields = fields?.length > 0;
  const noErrors = errors?.length === 0 || errors === undefined;
  return hasNames && noErrors && hasFields;
};

interface HandleInputChangeParams {
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  fieldId: string;
  setModalData: React.Dispatch<React.SetStateAction<any>>;
}

const handleInputChange = ({ e, fieldId, setModalData }: HandleInputChangeParams) => {
  const { value, name } = e.target;
  setModalData((prevState) => ({
    ...prevState,
    fields: prevState.fields.map((f: any) => (f.id === fieldId ? { ...f, [name]: value } : f)),
  }));
};

const handleChange = (
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  fieldType: string,
  fieldId: string,
  setModalData: React.Dispatch<React.SetStateAction<any>>
) => {
  if (fieldType === 'required') {
    const checked = (e.target as HTMLInputElement).checked;
    setModalData((prevData) => ({
      ...prevData,
      fields:
        prevData?.fields?.map((fieldItem) =>
          fieldItem.id === fieldId ? { ...fieldItem, required: checked } : fieldItem
        ) || [],
    }));
  } else if (fieldType) {
    const { value } = e.target;
    setModalData((prevData) => ({
      ...prevData,
      fields:
        prevData?.fields?.map((fieldItem) =>
          fieldItem.id === fieldId ? { ...fieldItem, [fieldType]: value } : fieldItem
        ) || [],
    }));
  }
};

interface HandleSaveChangesParams {
  modalData: any;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<any>>;
  setModalData: React.Dispatch<React.SetStateAction<any>>;
  closeModal: () => void;
}

const handleSaveChanges = (params: HandleSaveChangesParams) => {
  const { modalData, nodes, setNodes, setModalData, closeModal } = params;
  const { fields } = modalData;

  if (formIsValid(modalData)) {
    const updatedNodes = nodes.map((node) => {
      if (node.id === modalData.id) {
        return {
          ...node,
          data: {
            ...node.data,
            customName: sanitisedStringInput(modalData.customName),
            label: modalData.label,
            fields: fields,
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
    closeModal();
  } else if (!formIsValid(modalData)) {
    // set errors
    const newErrors = [];
    if (fields.length === 0) {
      newErrors.push({ field: 'none', message: 'At least one field is required.' });
    }
    fields.forEach((field) => {
      if (!field.name || field.name.trim() === '') {
        newErrors.push({ field: `${field.id}_name`, message: 'This field is required.' });
      }
      if (field.type === '') {
        newErrors.push({ field: `${field.id}_type`, message: 'Field type is required.' });
      }
    });
    setModalData((prevState) => ({ ...prevState, errors: newErrors }));
  }
};

export default function useForms() {
  const { modalData, setModalData } = useContext(ModalContext) || {};

  const workflowContext = useContext(WorkflowEditorContext);
  const { nodes, setNodes } = workflowContext;

  useEffect(() => {
    if (modalData.errors?.length > 0) {
      // check if the fields are now valid after changes
      const newErrors = modalData.errors.filter((error) => {
        const fieldArray = error.field.split('_');
        const fieldId = fieldArray[0];
        const fieldType = fieldArray[1];
        const currentField = modalData?.fields?.find((field) => field.id === fieldId);

        if (currentField) {
          if (fieldType === 'name' && currentField.name?.trim() !== '') {
            return false;
          }
          if (fieldType === 'type' && currentField.type !== '') {
            return false;
          }
        }
        return true;
      });

      const filteredErrors = newErrors.filter((error) => {
        if (error.field === 'none' && modalData?.fields?.length > 0) {
          return false;
        }
        return true;
      });

      setModalData?.((prevState) => ({
        ...prevState,
        errors: filteredErrors,
      }));
    }
  }, [JSON.stringify(modalData?.fields), modalData?.errors?.length]);

  return {
    callbacks: {
      handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        fieldType: string,
        fieldId: string
      ) => handleChange(e, fieldType, fieldId, setModalData),
      handleSaveChanges: (modalData: any, closeModal: () => void) =>
        handleSaveChanges({ modalData, nodes, setNodes, setModalData, closeModal }),
    },
  };
}
