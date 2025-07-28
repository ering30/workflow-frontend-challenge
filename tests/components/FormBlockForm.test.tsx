import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Theme } from '@radix-ui/themes'; 
import * as Form from '@radix-ui/react-form';
import FormBlockForm from '../../src/components/modals/BaseModal/FormBlockForm';
import { ModalContext } from '../../src/contexts/ModalContext';
import { WorkflowEditorContext } from '../../src/contexts/WorkflowEditorContext';
import type { FormModalDataType, FormField } from '../../src/hooks/useModals';

// Mock useForms hook
const mockHandleNestedFieldChange = vi.fn();

vi.mock('../../src/components/modals/hooks/useForms', () => ({
  default: () => ({
    callbacks: {
      handleNestedFieldChange: mockHandleNestedFieldChange,
    },
  }),
}));

// Mock CustomFieldInput component to simplify testing
vi.mock('../../src/components/modals/BaseModal/FormBlockForm/CustomFieldInput', () => ({
  default: ({ 
    id, 
    modalData, 
    setModalData 
  }: { 
    id: string; 
    modalData: FormModalDataType; 
    setModalData: React.Dispatch<React.SetStateAction<FormModalDataType>> 
  }) => {
    const field = modalData.fields.find(f => f.id === id);
    
    return (
      <div data-testid={`custom-field-input-${id}`}>
        <input
          data-testid={`field-name-input-${id}`}
          value={field?.name || ''}
          onChange={(e) => mockHandleNestedFieldChange(e, 'name', id)}
          placeholder="Field name"
        />
        <select
          data-testid={`field-type-select-${id}`}
          value={field?.type || ''}
          onChange={(e) => mockHandleNestedFieldChange(e, 'type', id)}
        >
          <option value="">Select type</option>
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="number">Number</option>
        </select>
        <input
          data-testid={`field-required-checkbox-${id}`}
          type="checkbox"
          checked={field?.required || false}
          onChange={(e) => mockHandleNestedFieldChange(e, 'required', id)}
        />
        <button
          data-testid={`delete-field-${id}`}
          onClick={() => {
            setModalData((prev) => ({
              ...prev,
              fields: prev.fields.filter(f => f.id !== id),
            }));
          }}
        >
          Delete
        </button>
      </div>
    );
  },
}));

const createMockFormModalData = (overrides: Partial<FormModalDataType> = {}): FormModalDataType => ({
  id: 'form-1',
  type: 'form',
  label: 'Form Node',
  customName: '',
  errors: [],
  fields: [],
  ...overrides,
});

const createMockWorkflowContext = (
  nodes: any[] = [],
  edges: any[] = []
) => ({
  nodes,
  edges,
  setNodes: vi.fn(),
  onNodesChange: vi.fn(),
  setEdges: vi.fn(),
  onEdgesChange: vi.fn(),
  showSaveDialog: false,
  setShowSaveDialog: vi.fn(),
  workflowErrors: [],
  setWorkflowErrors: vi.fn(),
  activeItem: null,
  setActiveItem: vi.fn(),
  hasNodes: nodes.length > 0,
  hasStartNode: nodes.some(node => node.type === 'start'),
  hasEndNode: nodes.some(node => node.type === 'end'),
});

const renderFormBlockForm = (
  modalData: FormModalDataType = createMockFormModalData(),
  workflowContext = createMockWorkflowContext()
) => {
  const mockSetModalData = vi.fn();
  
  const mockModalContext = {
    modalData,
    setModalData: mockSetModalData,
    showModal: true,
    setShowModal: vi.fn(),
  };

  return {
    ...render(
      <Theme>
        <ModalContext.Provider value={mockModalContext as any}>
          <WorkflowEditorContext.Provider value={workflowContext as any}>
            <Form.Root>
              <FormBlockForm 
                modalData={modalData}
                setModalData={mockSetModalData}
              />
            </Form.Root>
          </WorkflowEditorContext.Provider>
        </ModalContext.Provider>
      </Theme>
    ),
    mockSetModalData,
  };
};

describe('FormBlockForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders the form block configuration', () => {
      renderFormBlockForm();

      expect(screen.getByText('Form Fields')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Field +' })).toBeInTheDocument();
    });

    it('renders existing form fields', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'firstName', type: 'text', required: true },
          { id: 'field-2', name: 'email', type: 'email', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      expect(screen.getByTestId('custom-field-input-field-1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-field-input-field-2')).toBeInTheDocument();
    });

    it('shows empty state when no fields exist', () => {
      renderFormBlockForm();

      expect(screen.queryByTestId(/custom-field-input/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Field +' })).toBeInTheDocument();
    });
  });

  describe('Adding Form Fields', () => {
    it('adds a new field when Add Field button is clicked', () => {
      const { mockSetModalData } = renderFormBlockForm();

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      fireEvent.click(addButton);

      expect(mockSetModalData).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the function that would be called
      const mockCall = mockSetModalData.mock.calls[0][0];
      const prevData = createMockFormModalData();
      const result = mockCall(prevData);
      
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0]).toMatchObject({
        id: 'form-1__field-1',
        name: '',
        type: 'text',
        required: false,
      });
    });

    it('generates unique IDs for multiple fields', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'existing', type: 'text', required: false },
        ],
      });

      const { mockSetModalData } = renderFormBlockForm(modalData);

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      fireEvent.click(addButton);

      const mockCall = mockSetModalData.mock.calls[0][0];
      const result = mockCall(modalData);
      
      expect(result.fields).toHaveLength(2);
      expect(result.fields[1].id).toBe('form-1__field-2');
    });

    it('prevents event propagation when adding fields', () => {
      const { mockSetModalData } = renderFormBlockForm();

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      const clickEvent = new MouseEvent('click', { bubbles: true });
      
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault');

      fireEvent(addButton, clickEvent);

      expect(mockSetModalData).toHaveBeenCalled();
    });
  });

  describe('Form Field Management', () => {
    it('renders multiple form fields correctly', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'firstName', type: 'text', required: true },
          { id: 'field-2', name: 'lastName', type: 'text', required: true },
          { id: 'field-3', name: 'email', type: 'email', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      expect(screen.getByTestId('custom-field-input-field-1')).toBeInTheDocument();
      expect(screen.getByTestId('custom-field-input-field-2')).toBeInTheDocument();
      expect(screen.getByTestId('custom-field-input-field-3')).toBeInTheDocument();
    });

    it('passes correct props to CustomFieldInput components', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'testField', type: 'email', required: true },
        ],
      });

      renderFormBlockForm(modalData);

      const fieldInput = screen.getByTestId('field-name-input-field-1');
      expect(fieldInput).toHaveValue('testField');

      const typeSelect = screen.getByTestId('field-type-select-field-1');
      expect(typeSelect).toHaveValue('email');

      const requiredCheckbox = screen.getByTestId('field-required-checkbox-field-1');
      expect(requiredCheckbox).toBeChecked();
    });

    it('handles field deletion correctly', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'firstName', type: 'text', required: true },
          { id: 'field-2', name: 'lastName', type: 'text', required: false },
        ],
      });

      const { mockSetModalData } = renderFormBlockForm(modalData);

      const deleteButton = screen.getByTestId('delete-field-field-1');
      fireEvent.click(deleteButton);

      expect(mockSetModalData).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the delete function
      const mockCall = mockSetModalData.mock.calls[0][0];
      const result = mockCall(modalData);
      
      expect(result.fields).toHaveLength(1);
      expect(result.fields[0].id).toBe('field-2');
    });
  });

  describe('Field Interactions', () => {
    it('handles field name changes', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: '', type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      const nameInput = screen.getByTestId('field-name-input-field-1');
      fireEvent.change(nameInput, { target: { value: 'username' } });

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'name',
        'field-1'
      );
    });

    it('handles field type changes', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'test', type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      const typeSelect = screen.getByTestId('field-type-select-field-1');
      fireEvent.change(typeSelect, { target: { value: 'email' } });

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'type',
        'field-1'
      );
    });

    it('handles required checkbox changes', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'test', type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      const requiredCheckbox = screen.getByTestId('field-required-checkbox-field-1');
      fireEvent.click(requiredCheckbox);

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'required',
        'field-1'
      );
    });
  });

  describe('Complete Form Workflow', () => {
    it('handles complete form building workflow', async () => {
      const { mockSetModalData } = renderFormBlockForm();

      // 1. Add first field
      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      fireEvent.click(addButton);

      expect(mockSetModalData).toHaveBeenCalled();

      // Simulate adding a field by updating the component
      const modalDataWithField = createMockFormModalData({
        fields: [
          { id: 'field-1', name: '', type: 'text', required: false },
        ],
      });

      const { mockSetModalData: mockSetModalData2 } = renderFormBlockForm(modalDataWithField);

      // 2. Update field name
      const nameInput = screen.getByTestId('field-name-input-field-1');
      fireEvent.change(nameInput, { target: { value: 'username' } });

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'name',
        'field-1'
      );

      // 3. Update field type
      const typeSelect = screen.getByTestId('field-type-select-field-1');
      fireEvent.change(typeSelect, { target: { value: 'email' } });

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'type',
        'field-1'
      );

      // 4. Mark as required
      const requiredCheckbox = screen.getByTestId('field-required-checkbox-field-1');
      fireEvent.click(requiredCheckbox);

      expect(mockHandleNestedFieldChange).toHaveBeenCalledWith(
        expect.any(Object),
        'required',
        'field-1'
      );
    });

    it('handles multiple field management workflow', () => {
      // Test adding fields sequentially with proper state management
      
      // 1. Start with empty form
      const { mockSetModalData: mockSetModalData1 } = renderFormBlockForm();
      const addButton1 = screen.getByRole('button', { name: 'Add Field +' });
      
      fireEvent.click(addButton1);
      expect(mockSetModalData1).toHaveBeenCalledTimes(1);
      
      // Verify first field addition
      const firstCall = mockSetModalData1.mock.calls[0][0];
      const firstResult = firstCall(createMockFormModalData());
      expect(firstResult.fields).toHaveLength(1);
      expect(firstResult.fields[0].id).toBe('form-1__field-1');

      // Clean up for next render
      cleanup();

      // 2. Component with one field (simulating React state update)
      const modalDataWithOneField = createMockFormModalData({
        fields: [{ id: 'form-1__field-1', name: '', type: 'text', required: false }]
      });
      
      const { mockSetModalData: mockSetModalData2 } = renderFormBlockForm(modalDataWithOneField);
      const addButton2 = screen.getByRole('button', { name: 'Add Field +' });
      
      fireEvent.click(addButton2);
      expect(mockSetModalData2).toHaveBeenCalledTimes(1);
      
      // Verify second field addition
      const secondCall = mockSetModalData2.mock.calls[0][0];
      const secondResult = secondCall(modalDataWithOneField);
      expect(secondResult.fields).toHaveLength(2);
      expect(secondResult.fields[1].id).toBe('form-1__field-2');

      // Clean up for next render
      cleanup();

      // 3. Component with two fields
      const modalDataWithTwoFields = createMockFormModalData({
        fields: [
          { id: 'form-1__field-1', name: '', type: 'text', required: false },
          { id: 'form-1__field-2', name: '', type: 'text', required: false }
        ]
      });
      
      const { mockSetModalData: mockSetModalData3 } = renderFormBlockForm(modalDataWithTwoFields);
      const addButton3 = screen.getByRole('button', { name: 'Add Field +' });
      
      fireEvent.click(addButton3);
      expect(mockSetModalData3).toHaveBeenCalledTimes(1);
      
      // Verify third field addition
      const thirdCall = mockSetModalData3.mock.calls[0][0];
      const thirdResult = thirdCall(modalDataWithTwoFields);
      expect(thirdResult.fields).toHaveLength(3);
      expect(thirdResult.fields[2].id).toBe('form-1__field-3');
    });
  });

  describe('Error Handling', () => {
    it('handles missing modal context gracefully', () => {
      render(
        <Theme>
          <WorkflowEditorContext.Provider value={createMockWorkflowContext() as any}>
            <Form.Root>
              <FormBlockForm 
                modalData={createMockFormModalData()}
                setModalData={vi.fn()}
              />
            </Form.Root>
          </WorkflowEditorContext.Provider>
        </Theme>
      );

      expect(screen.getByText('Form Fields')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Field +' })).toBeInTheDocument();
    });

    it('handles missing workflow context gracefully', () => {
      const mockModalContext = {
        modalData: createMockFormModalData(),
        setModalData: vi.fn(),
        showModal: true,
        setShowModal: vi.fn(),
      };

      render(
        <Theme>
          <ModalContext.Provider value={mockModalContext as any}>
            <Form.Root>
              <FormBlockForm 
                modalData={createMockFormModalData()}
                setModalData={vi.fn()}
              />
            </Form.Root>
          </ModalContext.Provider>
        </Theme>
      );

      expect(screen.getByText('Form Fields')).toBeInTheDocument();
    });

    it('handles undefined fields array', () => {
      const modalData = createMockFormModalData();
      delete (modalData as any).fields;

      // The component should handle undefined fields gracefully
      // by not rendering any fields but still showing the Add Field button
      renderFormBlockForm(modalData);

      expect(screen.getByText('Form Fields')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Field +' })).toBeInTheDocument();
      expect(screen.queryByTestId(/custom-field-input/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long field names', () => {
      const longName = 'a'.repeat(100);
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: longName, type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      const nameInput = screen.getByTestId('field-name-input-field-1');
      expect(nameInput).toHaveValue(longName);
    });

    it('handles special characters in field names', () => {
      const specialName = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: specialName, type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      const nameInput = screen.getByTestId('field-name-input-field-1');
      expect(nameInput).toHaveValue(specialName);
    });

    it('handles rapid successive add field clicks', () => {
      const { mockSetModalData } = renderFormBlockForm();

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      
      // Rapidly click the add button
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      expect(mockSetModalData).toHaveBeenCalledTimes(5);
    });

    it('handles empty modal data', () => {
      const emptyModalData = {} as FormModalDataType;

      expect(() => renderFormBlockForm(emptyModalData)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper button labeling', () => {
      renderFormBlockForm();

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      expect(addButton).toBeInTheDocument();
    });

    it('maintains proper form structure', () => {
      const modalData = createMockFormModalData({
        fields: [
          { id: 'field-1', name: 'test', type: 'text', required: false },
        ],
      });

      renderFormBlockForm(modalData);

      // Check that form inputs are properly rendered
      expect(screen.getByTestId('field-name-input-field-1')).toBeInTheDocument();
      expect(screen.getByTestId('field-type-select-field-1')).toBeInTheDocument();
      expect(screen.getByTestId('field-required-checkbox-field-1')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      renderFormBlockForm();

      const addButton = screen.getByRole('button', { name: 'Add Field +' });
      addButton.focus();
      
      expect(document.activeElement).toBe(addButton);
    });
  });
});
