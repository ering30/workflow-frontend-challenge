import { DataList, Flex } from '@radix-ui/themes';
import type { ApiModalDataType, FormField } from '@/hooks/useModals';
import * as Form from '@radix-ui/react-form';
import useForms from '@/components/modals/hooks/useForms';

interface RequestBodyItemProps {
  formField: FormField;
  modalData: ApiModalDataType;
}

const RequestBodyItem = (props: RequestBodyItemProps) => {
  const {
    formField: { id, name, type, required },
    modalData,
  } = props;

  const {
    callbacks: { handleSelectRequestBodyField },
  } = useForms();

  return (
    <Flex className="border border-gray-300 p-2 rounded-xl mt-2">
      <DataList.Root className="p-2 min-w-[50%] max-w-[80%]">
        <DataList.Item>
          <DataList.Label minWidth="88px" className="text-sm">
            Field Name
          </DataList.Label>
          <DataList.Value className="text-sm text-wrap">{name}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="88px" className="text-sm ">
            Type
          </DataList.Label>
          <DataList.Value className="text-sm text-wrap">{type}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label minWidth="88px" className="text-sm">
            Required
          </DataList.Label>
          <DataList.Value className="text-sm">{required ? 'Yes' : 'No'}</DataList.Value>
        </DataList.Item>
      </DataList.Root>

      <Form.Field
        name="fieldRequired"
        className="flex flex-col flex-1 gap-2 justify-center align-center max-w-[50%]"
      >
        <Form.Label htmlFor="selected" className="text-sm self-center text-gray-400">
          Selected
        </Form.Label>
        <Form.Control asChild>
          <input
            className="h-4 w-4 self-center"
            checked={Object.keys(modalData.requestBody).includes(name)}
            name="selected"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSelectRequestBodyField(e, name)
            }
            type="checkbox"
          />
        </Form.Control>
      </Form.Field>
    </Flex>
  );
};

export default RequestBodyItem;
