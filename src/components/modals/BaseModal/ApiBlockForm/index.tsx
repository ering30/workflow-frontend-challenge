import { Flex, Text } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';

import useApiForm from './hooks/useApiForm';
import RequestBodyItem from './components/RequestBodyItem';

const ApiBlockForm = () => {
  const ApiFormPayload = useApiForm();
  const {
    availableFormFields,
    hasAvailableFormFields,
  } = ApiFormPayload;

  return (
    <Flex data-testid="api-block-content" direction="column" gap="4" className="mb-4">
      <Text className="text-black text-md mb-2">API Configuration</Text>

      <Flex direction="column" className="mb-4">
        <Text className="text-gray-400 text-sm mb-2">HTTP Request Method</Text>
        <Flex align="start" direction="column" gap="2">
          <Flex align="start" direction="row" gap="2" className="flex justify-start">
            <input
              className="self-center mr-2 my-2"
              id="put"
              name="request-method"
              type="radio"
              value="PUT"
            />
            <label htmlFor="put" className="text-sm self-center">
              PUT
            </label>
          </Flex>
          <Flex align="start" direction="row" gap="2">
            <input
              className="self-center mr-2 my-2"
              id="post"
              name="request-method"
              type="radio"
              value="POST"
            />
            <label htmlFor="post" className="text-sm self-center">
              POST
            </label>
          </Flex>
        </Flex>
      </Flex>

      <Form.Field name="url" className="flex flex-col gap-2 mb-4">
        <Form.Label htmlFor="url" className="text-sm text-gray-400">
          Request URL
        </Form.Label>
        {/* <Form.Message> */}
        {/* <Text className="text-red-500 text-sm" data-testid="field-url-error">
            {
              errors?.find((error) => {
                const fieldArray = error.field.split('_');
                return fieldArray[1] === 'url' && fieldArray[0] === props.id;
              })?.message
            }
          </Text> */}
        {/* </Form.Message> */}
        <Form.Control asChild>
          <input
            className="border border-gray-300 p-2 rounded-xl text-sm"
            data-testid="field-url-input"
            name="url"
            // onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNestedFieldChange(e, 'url', props.id)}
            required
            type="text"
            // value={}
          />
        </Form.Control>
      </Form.Field>

      <Flex direction="column" className="mb-4">
        <Text className="text-gray-400 text-sm mb-2">Request Body</Text>
        {!hasAvailableFormFields && (
          <Text className="text-gray-500 text-sm">
            No available form fields to include in the request body. Please set up form fields in
            the Form Block.
          </Text>
        )}

        {hasAvailableFormFields && (
          <>
            <Text className="text-gray-500 text-sm mb-2">
              Please select from available fields to add to request body:
            </Text>
            <Flex direction="column" gap="2">
              {availableFormFields.map((field, index) => (
                <RequestBodyItem key={`request-body-item-${index}`} formField={field} />
              ))}
            </Flex>
          </>
        )}
      </Flex>

      {/* <Flex direction="column" className="mb-4 bg-gray-100">
        <Text className="text-gray-400 text-sm mb-2">Request body:</Text>
        
      </Flex> */}
    </Flex>
  );
};

export default ApiBlockForm;
