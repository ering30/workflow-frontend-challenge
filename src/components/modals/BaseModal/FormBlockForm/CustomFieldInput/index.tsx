import { ChangeEvent } from 'react';
import { Button, Flex } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import { Trash2 } from 'lucide-react';

import { ModalDataType } from '@/hooks/useModals';

interface CustomFieldInputProps {
  id: string;
  modalData: {
    fields: {
      id: string;
      name: string;
      type: 'text' | 'email' | 'number' | '';
      required: boolean;
    }[];
  };
  setModalData: React.Dispatch<React.SetStateAction<ModalDataType>>;
}

const CustomFieldInput = (props: CustomFieldInputProps) => {
  const { modalData, setModalData } = props;
  const currentField = modalData.fields.find((field) => field.id === props.id);
  const { id, name, type, required } = currentField || {};

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    fieldType: string
  ) => {
    if (fieldType === 'required') {
      const checked = (e.target as HTMLInputElement).checked;
      setModalData((prevData) => ({
        ...prevData,
        fields:
          prevData.fields?.map((fieldItem) =>
            fieldItem.id === props.id ? { ...fieldItem, required: checked } : fieldItem
          ) || [],
      }));
    } else {
      const value = (e.target as HTMLInputElement | HTMLSelectElement).value;
      setModalData((prevData) => ({
        ...prevData,
        fields:
          prevData.fields?.map((fieldItem) =>
            fieldItem.id === props.id ? { ...fieldItem, [fieldType]: value } : fieldItem
          ) || [],
      }));
    }
  };

  return (
    <Flex className="flex-col bg-gray-100 border-gray-500 rounded-md p-4 gap-2 relative">
      <Flex justify="end">
        <Button
          className="absolute top-4 right-4 hover:opacity-70 cursor-pointer"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setModalData((prevData) => ({
              ...prevData,
              fields: prevData.fields?.filter((fieldItem) => fieldItem.id !== props.id) || [],
            }));
          }}
        >
          <Trash2 size={16} />
        </Button>
      </Flex>
      <Form.Field name="fieldName" className="flex flex-col gap-2">
        <Form.Label htmlFor="fieldName" className="text-sm text-gray-400">
          Field Name
        </Form.Label>
        <Form.Control asChild>
          <input
            className="border border-gray-300 p-2 rounded-xl text-sm"
            name="fieldName"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, 'name')}
            required
            type="text"
            value={name || ''}
          />
        </Form.Control>
        {/* <Form.Message /> */}
        {/* <Form.ValidityState /> */}
      </Form.Field>

      <Flex justify="between" align="center" className="gap-2">
        <Form.Field name="fieldType" className="flex flex-1 flex-col gap-2 max-w-[50%]">
          <Form.Label htmlFor="fieldType" className="text-sm text-gray-400">
            Field Type
          </Form.Label>
          <Form.Control asChild>
            <select
              name="type"
              id="fieldType"
              onChange={(e) => handleChange(e, 'type')}
              className="border border-gray-300 p-2 rounded-xl text-sm"
              required
            >
              <option value="" disabled hidden>
                Select an Option
              </option>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
            </select>
          </Form.Control>
          {/* <Form.Message /> */}
          {/* <Form.ValidityState /> */}
        </Form.Field>

        <Form.Field name="fieldRequired" className="flex flex-1 gap-2 justify-center max-w-[50%]">
          <Form.Label htmlFor="fieldRequired" className="text-sm text-gray-400">
            Required
          </Form.Label>
          <Form.Control asChild>
            <input
              type="checkbox"
              name="fieldRequired"
              checked={required || false}
              onChange={(e) => handleChange(e, 'required')}
            />
          </Form.Control>
          {/* <Form.Message /> */}
          {/* <Form.ValidityState /> */}
        </Form.Field>
      </Flex>
    </Flex>
  );
};

export default CustomFieldInput;
