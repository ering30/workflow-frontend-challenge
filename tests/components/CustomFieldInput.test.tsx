import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Theme } from '@radix-ui/themes';
import * as Form from '@radix-ui/react-form';
import CustomFieldInput from '../../src/components/modals/BaseModal/FormBlockForm/CustomFieldInput';
import type { FormField } from '../../src/hooks/useModals';

// Create mock functions
const mockHandleNestedFieldChange = vi.fn();
const mockSetModalData = vi.fn();

// Mock the useForms hook
vi.mock('../../src/components/modals/hooks/useForms', () => ({
  default: () => ({
    callbacks: {
      handleNestedFieldChange: mockHandleNestedFieldChange,
    },
  }),
}));

const mockFormField: FormField = {
  id: 'field-1',
  name: 'Test Field',
  type: 'text',
  required: false,
};

const mockModalData = {
  fields: [mockFormField],
  errors: [] as Array<{ field: string; message: string }>,
  customName: 'Test Block',
  label: 'Test Label',
};

const renderCustomFieldInput = (
  id: string = 'field-1',
  modalData: any = mockModalData,
  setModalData: any = mockSetModalData
) => {
  return render(
    <Theme>
      <Form.Root>
        <CustomFieldInput
          id={id}
          modalData={modalData}
          setModalData={setModalData}
        />
      </Form.Root>
    </Theme>
  );
};

describe('CustomFieldInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders field name input with current value', () => {
    renderCustomFieldInput();
    
    const nameInput = screen.getByDisplayValue('Test Field');
    expect(nameInput).toBeInTheDocument();
    expect(screen.getByTestId('field-name-input')).toBeInTheDocument();
  });

  it('renders field type select with options', () => {
    renderCustomFieldInput();
    
    const typeSelect = screen.getByTestId('field-type-select');
    expect(typeSelect).toBeInTheDocument();
    
    // Check that select options are present
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
  });

  it('renders required checkbox with correct state', () => {
    renderCustomFieldInput();
    
    const requiredCheckbox = screen.getByRole('checkbox');
    expect(requiredCheckbox).toBeInTheDocument();
    expect(requiredCheckbox).not.toBeChecked();
  });

  it('renders required checkbox as checked when field is required', () => {
    const requiredField = { ...mockFormField, required: true };
    const modalDataWithRequiredField = {
      ...mockModalData,
      fields: [requiredField],
    };
    
    renderCustomFieldInput('field-1', modalDataWithRequiredField);
    
    const requiredCheckbox = screen.getByRole('checkbox');
    expect(requiredCheckbox).toBeChecked();
  });

  it('renders delete button', () => {
    renderCustomFieldInput();
    
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls handleNestedFieldChange when field name input changes', () => {
    renderCustomFieldInput();
    
    const nameInput = screen.getByTestId('field-name-input');
    fireEvent.change(nameInput, { target: { value: 'Updated Field Name' } });

    expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'name',
          type: 'text'
        })
      }),
      'name',
      'field-1'
    );
  });

  it('calls handleNestedFieldChange when field type select changes', () => {
    renderCustomFieldInput();
    
    const typeSelect = screen.getByTestId('field-type-select');
    fireEvent.change(typeSelect, { target: { value: 'email' } });
    
    expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'type',
          id: 'type'
        })
      }),
      'type',
      'field-1'
    );
  });

  it('calls handleNestedFieldChange when required checkbox changes', () => {
    renderCustomFieldInput();
    
    const requiredCheckbox = screen.getByRole('checkbox');
    fireEvent.click(requiredCheckbox);
    
    expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          type: 'checkbox',
          name: 'fieldRequired'
        })
      }),
      'required',
      'field-1'
    );
  });

  it('calls setModalData to remove field when delete button is clicked', () => {
    renderCustomFieldInput();
    
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);
    
    expect(mockSetModalData).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the updater function
    const updaterFunction = mockSetModalData.mock.calls[0][0];
    const prevData = {
      fields: [mockFormField, { id: 'field-2', name: 'Other Field' }],
    };
    const result = updaterFunction(prevData);
    
    expect(result.fields).toEqual([{ id: 'field-2', name: 'Other Field' }]);
  });

  it('displays field name error when present', () => {
    const modalDataWithError = {
      ...mockModalData,
      errors: [{ field: 'field-1_name', message: 'Field name is required' }],
    };
    
    renderCustomFieldInput('field-1', modalDataWithError);
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('Field name is required');
  });

  it('displays field type error when present', () => {
    const modalDataWithError = {
      ...mockModalData,
      errors: [{ field: 'field-1_type', message: 'Field type is required' }],
    };
    
    renderCustomFieldInput('field-1', modalDataWithError);
    
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('Field type is required');
  });

  it('does not display errors for different field IDs', () => {
    const modalDataWithError = {
      ...mockModalData,
      errors: [{ field: 'field-2_name', message: 'Other field error' }],
    };
    
    renderCustomFieldInput('field-1', modalDataWithError);
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('');
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('');
  });

  it('handles missing field gracefully', () => {
    const modalDataWithoutField = {
      ...mockModalData,
      fields: [],
    };
    
    renderCustomFieldInput('nonexistent-field', modalDataWithoutField);
    
    // Should render with empty values
    const nameInput = screen.getByTestId('field-name-input');
    expect(nameInput).toHaveValue('');
    
    const requiredCheckbox = screen.getByRole('checkbox');
    expect(requiredCheckbox).not.toBeChecked();
  });

  it('displays multiple errors correctly', () => {
    const modalDataWithMultipleErrors = {
      ...mockModalData,
      errors: [
        { field: 'field-1_name', message: 'Name error' },
        { field: 'field-1_type', message: 'Type error' },
        { field: 'field-2_name', message: 'Other field error' },
      ],
    };
    
    renderCustomFieldInput('field-1', modalDataWithMultipleErrors);
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('Name error');
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('Type error');
  });

  it('displays error when field name is empty', () => {
    const modalDataWithEmptyNameError = {
      ...mockModalData,
      errors: [{ field: 'field-1_name', message: 'This field is required' }],
    };
    
    renderCustomFieldInput('field-1', modalDataWithEmptyNameError);
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('This field is required');
  });

  it('displays error when field type is not selected', () => {
    const modalDataWithTypeError = {
      ...mockModalData,
      errors: [{ field: 'field-1_type', message: 'Please select a field type' }],
    };
    
    renderCustomFieldInput('field-1', modalDataWithTypeError);
    
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('Please select a field type');
  });

  it('clears errors when no errors are present', () => {
    // First render with errors
    const modalDataWithError = {
      ...mockModalData,
      errors: [{ field: 'field-1_name', message: 'Some error' }],
    };
    
    const { rerender } = render(
      <Theme>
        <Form.Root>
          <CustomFieldInput
            id="field-1"
            modalData={modalDataWithError}
            setModalData={mockSetModalData}
          />
        </Form.Root>
      </Theme>
    );
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('Some error');
    
    // Then rerender without errors
    rerender(
      <Theme>
        <Form.Root>
          <CustomFieldInput
            id="field-1"
            modalData={mockModalData}
            setModalData={mockSetModalData}
          />
        </Form.Root>
      </Theme>
    );
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('');
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('');
  });

  it('displays errors for specific field ID only', () => {
    const modalDataWithMixedErrors = {
      ...mockModalData,
      fields: [
        mockFormField,
        { id: 'field-2', name: 'Other Field', type: 'email', required: true }
      ],
      errors: [
        { field: 'field-1_name', message: 'Error for field 1' },
        { field: 'field-2_name', message: 'Error for field 2' },
        { field: 'field-3_name', message: 'Error for field 3' },
      ],
    };
    
    renderCustomFieldInput('field-1', modalDataWithMixedErrors);
    
    expect(screen.getByTestId('field-name-error')).toHaveTextContent('Error for field 1');
    expect(screen.getByTestId('field-type-error')).toHaveTextContent('');
  });

  it('renders field labels correctly', () => {
    renderCustomFieldInput();
    
    expect(screen.getByText('Field Name')).toBeInTheDocument();
    expect(screen.getByText('Field Type')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
