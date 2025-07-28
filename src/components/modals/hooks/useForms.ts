import { ChangeEvent, useContext, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { isURL } from 'validator';

import { sanitisedStringInput, sanitisedUrl } from '@/lib/validation';
import { WorkflowEditorContext } from '@/contexts/WorkflowEditorContext';
import { ModalContext } from '@/contexts/ModalContext';

import type { FormModalDataType, ApiModalDataType } from '@/lib/types';

const formIsValid = (modalData: FormModalDataType | ApiModalDataType) => {
  const { errors, type } = modalData;
  if (type === 'form') {
    const data = modalData as FormModalDataType;

    const hasNames = data?.fields?.findIndex((field) => field.name.trim() === '') === -1;
    const hasFields = type === 'form' ? data?.fields?.length > 0 : true;
    const noErrors = errors?.length === 0 || errors === undefined;
    return hasNames && noErrors && hasFields;
  } else if (type === 'api') {
    const data = modalData as ApiModalDataType;

    const hasUrl = data?.url?.trim() !== '';
    const noErrors = errors?.length === 0 || errors === undefined;
    const hasRequestBody = Object.keys(data?.requestBody || {}).length > 0;
    return hasUrl && noErrors && hasRequestBody;
  }
  return false;
};

const handleNestedFieldChange = (
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

const handleUrlInputChange = (
  e: ChangeEvent<HTMLInputElement>,
  fieldType: string,
  modalData: ApiModalDataType,
  setModalData: React.Dispatch<React.SetStateAction<any>>
) => {
  const { value } = e.target;
  setModalData((prevData) => ({
    ...prevData,
    [fieldType]: value,
  }));

  if (fieldType === 'url' && !isURL(value)) {
    const errorMessage = 'Please enter a valid URL.';
    if (
      !modalData?.errors?.find((error) => error.field === `url` && error.message === errorMessage)
    ) {
      setModalData((prevData) => ({
        ...prevData,
        errors: [...(prevData?.errors || []), { field: `url`, message: errorMessage }],
      }));
    }
  }
};

const handleSelectRequestBodyField = (
  fieldName: string,
  modalData: ApiModalDataType,
  setModalData: React.Dispatch<React.SetStateAction<any>>
) => {
  const paramName = fieldName.replace(/\s+/g, '_').toLowerCase();
  const containsField = Object.keys(modalData?.requestBody || {}).includes(paramName);
  if (containsField) {
    setModalData((prevState) => ({
      ...prevState,
      requestBody: Object.fromEntries(
        Object.entries(prevState?.requestBody || {}).filter(([key]) => key !== paramName)
      ),
    }));
  }
  if (!containsField) {
    setModalData((prevState) => ({
      ...prevState,
      requestBody: {
        ...(prevState?.requestBody || {}),
        // leave the value empty so that the eventual form value can be added
        [paramName]: '',
      },
    }));
  }
};

interface HandleSaveChangesParams {
  modalData: FormModalDataType | ApiModalDataType;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<any>>;
  setModalData: React.Dispatch<React.SetStateAction<any>>;
  closeModal: () => void;
}

const handleSaveChanges = (params: HandleSaveChangesParams) => {
  const { modalData, nodes, setNodes, setModalData, closeModal } = params;

  if (formIsValid(modalData)) {
    if (modalData.type === 'form') {
      const data = modalData as FormModalDataType;

      const updatedNodes = nodes.map((node) => {
        if (node.id === data.id) {
          return {
            ...node,
            data: {
              ...node.data,
              customName: sanitisedStringInput(data.customName),
              label: data.label,
              fields: data.fields,
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      closeModal();
    } else if (modalData.type === 'api') {
      const data = modalData as ApiModalDataType;

      const updatedNodes = nodes.map((node) => {
        if (node.id === data.id) {
          return {
            ...node,
            data: {
              ...node.data,
              customName: sanitisedStringInput(data.customName),
              label: data.label,
              httpMethod: data.httpMethod,
              url: sanitisedUrl(data.url),
              requestBody: data.requestBody,
            },
          };
        }
        return node;
      });

      setNodes(updatedNodes);
      closeModal();
    }
  } else if (!formIsValid(modalData)) {
    if (modalData.type === 'form') {
      const data = modalData as FormModalDataType;

      // set errors
      const newErrors = [];
      if (data.fields.length === 0) {
        newErrors.push({ field: 'none', message: 'At least one field is required.' });
      }
      data.fields.forEach((field) => {
        if (!field.name || field.name.trim() === '') {
          newErrors.push({ field: `${field.id}_name`, message: 'This field is required.' });
        }
        if (field.type === '') {
          newErrors.push({ field: `${field.id}_type`, message: 'Field type is required.' });
        }
      });
      setModalData((prevState) => ({ ...prevState, errors: newErrors }));
    } else if (modalData.type === 'api') {
      const data = modalData as ApiModalDataType;

      // set errors
      const newErrors = [];
      if (!data.url || data.url.trim() === '') {
        newErrors.push({ field: 'url', message: 'Request URL is required.' });
      }
      if (Object.keys(data.requestBody).length === 0) {
        newErrors.push({
          field: 'requestBody',
          message: 'At least one request body field is required.',
        });
      }
      setModalData((prevState) => ({ ...prevState, errors: newErrors }));
    }
  }
};

export default function useForms() {
  const { modalData, setModalData } = useContext(ModalContext) || {};

  const workflowContext = useContext(WorkflowEditorContext);
  const { nodes, setNodes } = workflowContext || {};

  useEffect(() => {
    if (!modalData) return; // Guard clause for missing modalData

    if (modalData.type === 'form') {
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

        // Only update if errors actually changed
        if (filteredErrors.length !== (modalData?.errors?.length || 0)) {
          setModalData?.((prevState) => ({
            ...prevState,
            errors: filteredErrors,
          }));
        }
      }
    } else if (modalData.type === 'api') {
      if (modalData.errors?.length > 0) {
        // check if the fields are now valid after changes
        const newErrors = modalData.errors.filter((error) => {
          if (error.field === 'url' && modalData.url?.trim() !== '') {
            return false;
          }
          if (
            error.field === 'requestBody' &&
            Object.keys(modalData.requestBody || {}).length > 0
          ) {
            return false;
          }
          return true;
        });

        const filteredErrors = newErrors.filter((error) => {
          if (error.field === 'none' && modalData?.fields?.length > 0) {
            return false;
          }
          return true;
        });

        // Only update if errors actually changed
        if (filteredErrors.length !== (modalData?.errors?.length || 0)) {
          setModalData?.((prevState) => ({
            ...prevState,
            errors: filteredErrors,
          }));
        }
      }
    }
  }, [JSON.stringify(modalData?.fields), JSON.stringify(modalData?.requestBody)]);

  return {
    callbacks: {
      handleNestedFieldChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        fieldType: string,
        fieldId: string
      ) => {
        if (setModalData) {
          handleNestedFieldChange(e, fieldType, fieldId, setModalData);
        }
      },
      handleSaveChanges: (modalData: any, closeModal: () => void) => {
        if (modalData && nodes && setNodes && setModalData) {
          handleSaveChanges({ modalData, nodes, setNodes, setModalData, closeModal });
        }
      },
      handleUrlInputChange: (e: ChangeEvent<HTMLInputElement>, fieldType: string) => {
        if (modalData && setModalData) {
          handleUrlInputChange(e, fieldType, modalData, setModalData);
        }
      },
      handleSelectRequestBodyField: (fieldName: string) => {
        if (modalData && setModalData) {
          handleSelectRequestBodyField(fieldName, modalData, setModalData);
        }
      },
    },
  };
}
