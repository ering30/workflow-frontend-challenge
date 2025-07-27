import { useContext } from 'react';
import { Button, Flex, Text } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';

import { ModalContext } from '@/contexts/ModalContext';
import useModals from '@/hooks/useModals';
import { toTitleCase } from '@/lib/utilityFunctions';

import useForms from '../hooks/useForms';
import ApiBlockForm from './ApiBlockForm';
import FormBlockForm from './FormBlockForm';

const BaseModal = () => {
  const modalContext = useContext(ModalContext);
  const { modalData, setModalData } = modalContext || {};
  const { errors, type, customName } = modalData || {};
  const {
    showModal,
    callbacks: { closeModal },
  } = useModals();

  const {
    callbacks: { handleSaveChanges },
  } = useForms();

  const handleBlockNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setModalData((prevData) => ({
      ...prevData,
      customName: newName,
    }));
  };

  return (
    <Dialog.Root
      open={showModal}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-0 right-0 bg-white p-6 rounded-lg w-[400px] min-h-[100vh] max-h-[100vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-1000">
          <Dialog.Close
            className="absolute top-4 right-4 hover:opacity-70 cursor-pointer"
            onClick={closeModal}
          >
            ✕
          </Dialog.Close>
          <Dialog.Title>Configure {toTitleCase(type)} Block</Dialog.Title>
          <Dialog.Description className="mt-2 mb-4 text-sm text-gray-400">
            Modify the details of the selected block.
          </Dialog.Description>

          <hr className="mb-4" />

          <Form.Root className="flex flex-col gap-4">
            <Form.Field name="blockName" className="flex flex-col gap-2">
              <Form.Label
                data-testid="blockName-input"
                htmlFor="blockName"
                className="text-sm text-gray-400"
              >
                Block Name
              </Form.Label>
              <Form.Control asChild>
                <input
                  className="border border-gray-300 p-2 rounded-xl text-sm"
                  name="blockName"
                  required
                  type="text"
                  value={customName}
                  onChange={(e) => handleBlockNameChange(e)}
                />
              </Form.Control>
            </Form.Field>

            {errors?.length > 0 && errors.find((error) => error.field === 'none') && (
              <Text className="text-red-500 text-sm">
                {errors.find((error) => error.field === 'none').message}
              </Text>
            )}
            {/* form modal content */}
            {type === 'form' && <FormBlockForm modalData={modalData} setModalData={setModalData} />}

            {/* API modal content */}
            {type === 'api' && <ApiBlockForm />}
          </Form.Root>

          <Flex justify="end" className="bg-white py-4 border-t gap-4">
            <Button
              variant="ghost"
              size="1"
              radius="large"
              className="!p-2 !rounded !text-sm"
              onClick={() => closeModal()}
            >
              Cancel
            </Button>

            <Button
              color="indigo"
              variant="solid"
              size="1"
              radius="large"
              className="!p-2 !rounded !text-sm"
              onClick={() => {
                handleSaveChanges(modalData, closeModal);
              }}
            >
              Save Changes
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default BaseModal;
