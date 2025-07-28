import { Flex, Button, Text } from '@radix-ui/themes';

import { FormField, FormModalDataType } from '@/lib/types';

import CustomFieldInput from './CustomFieldInput';

interface FormBlockFormProps {
  modalData: FormModalDataType;
  setModalData: React.Dispatch<React.SetStateAction<FormModalDataType>>;
}

const FormBlockForm = (props: FormBlockFormProps) => {
  const { modalData, setModalData } = props;

  return (
    <>
      <Flex justify="between" align="center" className="mt-4">
        <Text size="1" className="text-black ">
          Form Fields
        </Text>
        <Button
          color="gray"
          variant="ghost"
          className="!p-2 !rounded !text-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newField = {
              id: `${modalData.id}__field-${(modalData.fields || []).length + 1}`,
              name: '',
              type: 'text' as FormField['type'],
              required: false,
            };

            setModalData((prevData) => ({
              ...prevData,
              fields: [...(prevData.fields || []), newField],
            }));
          }}
        >
          Add Field +
        </Button>
      </Flex>

      <Flex direction="column" className="mb-4 flex-col gap-4">
        {(modalData.fields || []).map((field, index) => (
          <CustomFieldInput
            id={field.id}
            key={`field-${index + 1}`}
            modalData={modalData}
            setModalData={setModalData}
          />
        ))}
      </Flex>
    </>
  );
};

export default FormBlockForm;
