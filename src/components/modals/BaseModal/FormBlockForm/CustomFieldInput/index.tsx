import { Button, Flex, Text } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import { Trash2 } from 'lucide-react';

import type { FormField, ModalDataType } from '@/hooks/useModals';
import useForms from '@/components/modals/hooks/useForms';

interface CustomFieldInputProps {
  id: string;
  modalData: {
    fields: FormField[];
    errors: { field: string; message: string }[];
    customName: string;
    label: string;
  };
  setModalData: React.Dispatch<React.SetStateAction<ModalDataType>>;
}

const CustomFieldInput = (props: CustomFieldInputProps) => {
  const { modalData, setModalData } = props;
  const currentField = modalData.fields.find((field) => field.id === props.id);
  const { id, name, required } = currentField || {};
  const errors = modalData.errors || [];

  const {
    callbacks: { handleChange },
  } = useForms();

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
      <Form.Field name="name" className="flex flex-col gap-2">
        <Form.Label htmlFor="name" className="text-sm text-gray-400">
          Field Name
        </Form.Label>
        <Form.Message>
          <Text className="text-red-500 text-sm" data-testid="field-name-error">
            {
              errors?.find((error) => {
                const fieldArray = error.field.split('_');
                return fieldArray[1] === 'name' && fieldArray[0] === props.id;
              })?.message
            }
          </Text>
        </Form.Message>
        <Form.Control asChild>
          <input
            className="border border-gray-300 p-2 rounded-xl text-sm"
            data-testid="field-name-input"
            name="name"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, 'name', props.id)}
            required
            type="text"
            value={name || ''}
          />
        </Form.Control>
      </Form.Field>

      <Flex justify="between" align="center" className="gap-2">
        <Form.Field name="fieldType" className="flex flex-1 flex-col gap-2 max-w-[50%]">
          <Form.Label htmlFor="fieldType" className="text-sm text-gray-400">
            Field Type
          </Form.Label>
          <Text className="text-red-500 text-sm" data-testid="field-type-error">
            {
              errors?.find((error) => {
                const fieldArray = error.field.split('_');
                return fieldArray[1] === 'type' && fieldArray[0] === props.id;
              })?.message
            }
          </Text>
          <Form.Control asChild>
            <select
              className="border border-gray-300 p-2 rounded-xl text-sm"
              data-testid="field-type-select"
              id="type"
              name="type"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange(e, 'type', props.id)
              }
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
        </Form.Field>

        <Form.Field name="fieldRequired" className="flex flex-1 gap-2 justify-center max-w-[50%]">
          <Form.Label htmlFor="fieldRequired" className="text-sm text-gray-400">
            Required
          </Form.Label>
          <Form.Control asChild>
            <input
              checked={required || false}
              name="fieldRequired"
              onChange={(e) => handleChange(e, 'required', props.id)}
              type="checkbox"
            />
          </Form.Control>
        </Form.Field>
      </Flex>
    </Flex>
  );
};

export default CustomFieldInput;
